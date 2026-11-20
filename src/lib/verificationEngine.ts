import jsQR from 'jsqr';
import type {
  LanguageCode,
  PackagingInspectionResult,
  SeedBatchRecord,
  VerdictReason,
  VerdictType,
  VerificationVerdict,
} from '../types.ts';
import { apiUrl, hasRemoteApi } from './api.ts';
import { getAllBatches, incrementLocalScanCount } from './indexedDb.ts';

export async function decodeQrFromImageSource(src: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxDim = 1024;
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(null);
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const result = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'attemptBoth',
      });
      resolve(result?.data ?? null);
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export async function imageUrlToDataUrl(url: string, maxDim = 960): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context unavailable'));
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.86));
    };
    img.onerror = () => reject(new Error('Unable to load image'));
    img.src = url;
  });
}

function normalizeToken(val: string): string {
  return val.trim().toUpperCase().replace(/\s+/g, '');
}

export function findBatchMatch(
  batches: SeedBatchRecord[],
  queryTokens: string[]
): SeedBatchRecord | null {
  const cleaned = queryTokens.map(normalizeToken).filter(Boolean);
  if (cleaned.length === 0) return null;

  for (const token of cleaned) {
    const exact = batches.find(
      (b) =>
        normalizeToken(b.qrSerial) === token ||
        normalizeToken(b.batchNumber) === token ||
        normalizeToken(b.id) === token
    );
    if (exact) return exact;
  }

  for (const token of cleaned) {
    if (token.length < 4) continue;
    const partial = batches.find(
      (b) =>
        normalizeToken(b.qrSerial).includes(token) ||
        token.includes(normalizeToken(b.qrSerial)) ||
        normalizeToken(b.batchNumber).includes(token) ||
        token.includes(normalizeToken(b.batchNumber))
    );
    if (partial) return partial;
  }

  return null;
}

export function isDateExpired(expiryStr: string | null | undefined): boolean {
  if (!expiryStr) return false;
  const trimmed = expiryStr.trim();
  const now = new Date();

  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const d = new Date(`${trimmed}T23:59:59`);
    return !Number.isNaN(d.getTime()) && d.getTime() < now.getTime();
  }

  // MM/YYYY or MM-YYYY
  const mmYyyy = trimmed.match(/^(\d{1,2})[/-](\d{4})$/);
  if (mmYyyy) {
    const month = Number(mmYyyy[1]);
    const year = Number(mmYyyy[2]);
    if (month >= 1 && month <= 12) {
      const endOfMonth = new Date(year, month, 0, 23, 59, 59);
      return endOfMonth.getTime() < now.getTime();
    }
  }

  // DD MON YYYY (e.g. 13 NOV 2025)
  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.getTime() < now.getTime();
  }

  return false;
}

function buildOfflineHeuristicInspection(
  batch: SeedBatchRecord | null,
  imageDataUrl?: string,
  sampleHint?: {
    tampered?: boolean;
    sealStatus?: PackagingInspectionResult['sealStatus'];
    summary?: string;
  }
): PackagingInspectionResult | null {
  if (!imageDataUrl && !sampleHint) return null;

  if (sampleHint) {
    return {
      source: 'offline-heuristic',
      labelTampered: Boolean(sampleHint.tampered),
      spellingErrorsFound: sampleHint.tampered
        ? ['Smudged batch box ink', 'Peeling generic "GENUINE SEEDS" over-sticker']
        : [],
      sealStatus: sampleHint.sealStatus ?? (sampleHint.tampered ? 'PEELING_OR_FAKE' : 'INTACT'),
      printAlterationDetected: Boolean(sampleHint.tampered),
      extractedBatchNo: batch?.batchNumber ?? null,
      extractedExpiry: batch?.expiryDate ?? null,
      extractedBrand: batch?.productName ?? null,
      confidencePct: 84,
      summary:
        sampleHint.summary ??
        (sampleHint.tampered
          ? 'Offline visual check flagged seal peeling and altered batch print.'
          : 'Offline visual check matched authentic packaging profile.'),
    };
  }

  return {
    source: 'offline-heuristic',
    labelTampered: false,
    spellingErrorsFound: [],
    sealStatus: 'UNCHECKED',
    printAlterationDetected: false,
    extractedBatchNo: batch?.batchNumber ?? null,
    extractedExpiry: batch?.expiryDate ?? null,
    extractedBrand: batch?.productName ?? null,
    confidencePct: 0,
    summary:
      'The packet photo was not analysed visually because the AI inspection service is unavailable. Only the local batch registry was checked; seal, print and spelling are unverified.',
  };
}

function buildVoiceSummaries(
  verdict: VerdictType,
  primaryReason: VerdictReason,
  batch: SeedBatchRecord | null,
  inspection: PackagingInspectionResult | null
): Record<LanguageCode, string> {
  const product = batch?.productName ?? inspection?.extractedBrand ?? 'This agricultural packet';

  if (verdict === 'UNVERIFIED') {
    return {
      en: `Unverified. ${product} was not found in the local registry. This does not prove it is counterfeit. Check with the manufacturer or agriculture department before buying.`,
      hi: `अभी सत्यापित नहीं। ${product} स्थानीय रजिस्ट्री में नहीं मिला। इसका अर्थ यह नहीं कि यह नकली है। खरीदने से पहले निर्माता या कृषि विभाग से जाँच करें।`,
      mr: `अद्याप पडताळणी झालेली नाही. ${product} स्थानिक नोंदणीत आढळले नाही. याचा अर्थ ते बनावट आहे असे नाही. खरेदीपूर्वी उत्पादक किंवा कृषी विभागाकडून तपासा.`,
      kn: `ಪರಿಶೀಲಿಸಲಾಗಿಲ್ಲ. ${product} ಸ್ಥಳೀಯ ನೋಂದಣಿಯಲ್ಲಿ ಕಂಡುಬಂದಿಲ್ಲ. ಇದರಿಂದ ಅದು ನಕಲಿ ಎಂದು ಸಾಬೀತಾಗುವುದಿಲ್ಲ. ಖರೀದಿಸುವ ಮೊದಲು ತಯಾರಕರು ಅಥವಾ ಕೃಷಿ ಇಲಾಖೆಯನ್ನು ಸಂಪರ್ಕಿಸಿ.`,
    };
  }

  if (verdict === 'SAFE') {
    const germ = batch?.germinationPct ? `${batch.germinationPct} percent germination.` : '';
    return {
      en: `Matched in this app's local batch registry. Available checks found no flags for ${product}. This is not an official authenticity certificate; check the package and supplier before purchase. ${germ}`,
      hi: `यह बैच ऐप की स्थानीय सूची में मिला। उपलब्ध जाँच में कोई चेतावनी नहीं मिली। यह सरकारी प्रामाणिकता प्रमाणपत्र नहीं है; खरीदने से पहले पैकेट और विक्रेता की जाँच करें।`,
      mr: `हा बॅच अॅपच्या स्थानिक नोंदणीत आढळला. उपलब्ध तपासणीत इशारा आढळला नाही. हे सरकारी अस्सलतेचे प्रमाणपत्र नाही; खरेदीपूर्वी पॅकेट आणि विक्रेत्याची खात्री करा.`,
      kn: `ಈ ಬ್ಯಾಚ್ ಆ್ಯಪ್‌ನ ಸ್ಥಳೀಯ ನೋಂದಣಿಯಲ್ಲಿ ಕಂಡುಬಂದಿದೆ. ಲಭ್ಯವಿರುವ ಪರಿಶೀಲನೆಯಲ್ಲಿ ಎಚ್ಚರಿಕೆ ಕಂಡುಬಂದಿಲ್ಲ. ಇದು ಸರ್ಕಾರಿ ದೃಢೀಕರಣ ಪ್ರಮಾಣಪತ್ರವಲ್ಲ; ಖರೀದಿಸುವ ಮೊದಲು ಪ್ಯಾಕೆಟ್ ಮತ್ತು ಮಾರಾಟಗಾರರನ್ನು ಪರಿಶೀಲಿಸಿ.`,
    };
  }

  if (primaryReason === 'CLONED_QR') {
    return {
      en: `Warning. The local registry marks this QR serial as cloned. Do not rely on this sample registry alone; confirm the batch with the manufacturer or agriculture department before purchase.`,
      hi: `सावधान! ${product} न खरीदें। यह QR कोड कई अलग-अलग जिलों में बार-बार स्कैन हुआ है। यह नकली पैकेट है। कृपया दुकानदार की शिकायत करें।`,
      mr: `सावधान! ${product} खरेदी करू नका. हा QR कोड अनेक जिल्ह्यांमध्ये पुन्हा पुन्हा स्कॅन झाला आहे. हे बनावट बियाणे आहे. कृपया विक्रेत्याची तक्रार करा.`,
      kn: `ಎಚ್ಚರಿಕೆ! ${product} ಖರೀದಿಸಬೇಡಿ. ಈ QR ಕೋಡ್ ಹಲವು ಜಿಲ್ಲೆಗಳಲ್ಲಿ ಹಲವು ಬಾರಿ ಸ್ಕ್ಯಾನ್ ಆಗಿದೆ. ಇದು ನಕಲಿ ಪ್ಯಾಕೆಟ್ ಆಗಿದೆ. ದಯವಿಟ್ಟು ವರದಿ ಮಾಡಿ.`,
    };
  }

  if (primaryReason === 'EXPIRED_STOCK') {
    return {
      en: `Warning! Do not buy ${product}. This stock is expired and has lost germination or nutrient potency. Ask the dealer for fresh 2026 batch stock or report the shop.`,
      hi: `सावधान! ${product} न खरीदें। इसकी एक्सपायरी तारीख निकल चुकी है। पुराना और खराब माल बोने से फसल को नुकसान हो सकता है।`,
      mr: `सावधान! ${product} खरेदी करू नका. या पॅकेटची मुदत संपलेली आहे. जुना माल वापरल्यास पिकाचे नुकसान होऊ शकते.`,
      kn: `ಎಚ್ಚರಿಕೆ! ${product} ಖರೀದಿಸಬೇಡಿ. ಈ ಪ್ಯಾಕೆಟ್‌ನ ಬಳಕೆಯ ಅವಧಿ ಮುಗಿದಿದೆ. ಹಳೆಯ ದಾಸ್ತಾನು ಬಳಸಬೇಡಿ.`,
    };
  }

  if (primaryReason === 'TAMPERED_LABEL') {
    return {
      en: `Warning! Do not buy ${product}. Visual packaging inspection detected a tampered seal, smudged batch print, or spelling errors. Report this dealer immediately.`,
      hi: `सावधान! ${product} न खरीदें। पैकेट के सील और प्रिंट में छेड़छाड़ पाई गई है। यह नकली पैकेट हो सकता है।`,
      mr: `सावधान! ${product} खरेदी करू नका. पॅकेटचे सील आणि छपाईमध्ये छेडछाड आढळली आहे. हे बनावट असू शकते.`,
      kn: `ಎಚ್ಚರಿಕೆ! ${product} ಖರೀದಿಸಬೇಡಿ. ಪ್ಯಾಕೆಟ್ ಸೀಲ್ ಮತ್ತು ಮುದ್ರಣದಲ್ಲಿ ತಿದ್ದುಪಡಿ ಪತ್ತೆಯಾಗಿದೆ. ಇದು ನಕಲಿಯಾಗಿರಬಹುದು.`,
    };
  }

  return {
    en: `Warning. ${product} has a risk flag in this app's local registry or packaging checks. Confirm the result with the manufacturer or agriculture department before taking action.`,
    hi: `सावधान। ${product} के स्थानीय रिकॉर्ड या पैकेट जाँच में जोखिम का संकेत मिला है। कार्रवाई से पहले निर्माता या कृषि विभाग से पुष्टि करें।`,
    mr: `सावधान. ${product} च्या स्थानिक नोंदीत किंवा पॅकेट तपासणीत धोका आढळला. कारवाईपूर्वी उत्पादक किंवा कृषी विभागाकडून खात्री करा.`,
    kn: `ಎಚ್ಚರಿಕೆ. ${product} ಸ್ಥಳೀಯ ದಾಖಲೆ ಅಥವಾ ಪ್ಯಾಕೆಟ್ ಪರಿಶೀಲನೆಯಲ್ಲಿ ಅಪಾಯದ ಸೂಚನೆ ತೋರಿಸಿದೆ. ಕ್ರಮ ಕೈಗೊಳ್ಳುವ ಮೊದಲು ತಯಾರಕರು ಅಥವಾ ಕೃಷಿ ಇಲಾಖೆಯಿಂದ ದೃಢಪಡಿಸಿ.`,
  };
}

export async function verifyPacket(params: {
  scannedCode?: string;
  imageDataUrl?: string;
  inputMethod: VerificationVerdict['inputMethod'];
  isOnline: boolean;
  sampleOverride?: {
    batchId?: string;
    tampered?: boolean;
    sealStatus?: PackagingInspectionResult['sealStatus'];
    summary?: string;
  };
}): Promise<VerificationVerdict> {
  const batches = await getAllBatches();

  let decodedQr = params.scannedCode?.trim() || '';
  if (!decodedQr && params.imageDataUrl) {
    const qrText = await decodeQrFromImageSource(params.imageDataUrl);
    if (qrText) decodedQr = qrText;
  }

  let packagingInspection: PackagingInspectionResult | null = null;

  if (params.imageDataUrl && params.isOnline && hasRemoteApi()) {
    try {
      const resp = await fetch(apiUrl('/api/inspect-package'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: params.imageDataUrl,
          mimeType: 'image/jpeg',
          todayIso: new Date().toISOString().slice(0, 10),
        }),
      });
      if (resp.ok) {
        const data = (await resp.json()) as { inspection?: PackagingInspectionResult };
        if (data.inspection) {
          packagingInspection = data.inspection;
        }
      }
    } catch {
      // Fall back smoothly to offline heuristic if network request drops mid-shop
    }
  }

  const candidateTokens = [
    decodedQr,
    params.sampleOverride?.batchId ?? '',
    packagingInspection?.extractedBatchNo ?? '',
  ].filter(Boolean);

  const batchRecord = findBatchMatch(batches, candidateTokens);

  if (!packagingInspection && (params.imageDataUrl || params.sampleOverride)) {
    packagingInspection = buildOfflineHeuristicInspection(
      batchRecord,
      params.imageDataUrl,
      params.sampleOverride
    );
  }

  const scanKey = batchRecord?.qrSerial || decodedQr || packagingInspection?.extractedBatchNo || 'UNKNOWN';
  const localScanCount = scanKey !== 'UNKNOWN' ? await incrementLocalScanCount(scanKey) : 1;
  const totalScanCount = (batchRecord?.knownScanCount ?? 0) + localScanCount;

  const reasons: VerdictReason[] = [];

  if (!batchRecord) {
    reasons.push('UNREGISTERED_BATCH');
  } else {
    if (batchRecord.registryStatus === 'BLACKLISTED') {
      reasons.push('BLACKLISTED_BATCH');
    }
    if (batchRecord.registryStatus === 'CLONED') {
      reasons.push('CLONED_QR');
    }
    if (batchRecord.registryStatus === 'EXPIRED' || isDateExpired(batchRecord.expiryDate)) {
      reasons.push('EXPIRED_STOCK');
    }
  }

  if (packagingInspection?.extractedExpiry && isDateExpired(packagingInspection.extractedExpiry)) {
    if (!reasons.includes('EXPIRED_STOCK')) {
      reasons.push('EXPIRED_STOCK');
    }
  }

  if (params.imageDataUrl && packagingInspection?.source === 'offline-heuristic' && packagingInspection.confidencePct === 0 && !params.sampleOverride) {
    reasons.push('PACKAGING_NOT_INSPECTED');
  }

  if (
    packagingInspection &&
    (packagingInspection.labelTampered ||
      packagingInspection.printAlterationDetected ||
      packagingInspection.sealStatus === 'PEELING_OR_FAKE' ||
      packagingInspection.spellingErrorsFound.length > 0)
  ) {
    reasons.push('TAMPERED_LABEL');
  }

  const onlyUnverifiedReasons = reasons.length > 0 && reasons.every((reason) =>
    reason === 'UNREGISTERED_BATCH' || reason === 'PACKAGING_NOT_INSPECTED'
  );
  const verdict: VerdictType = reasons.length === 0 ? 'SAFE' : onlyUnverifiedReasons ? 'UNVERIFIED' : 'FAKE';
  if (verdict === 'SAFE') {
    reasons.push('VERIFIED_AUTHENTIC');
  }

  const primaryReason = reasons[0];
  const mode = params.isOnline && packagingInspection?.source === 'gemini-vision' ? 'online-dual' : 'offline-dual';

  return {
    id: `VRD-${Date.now().toString(36).toUpperCase()}`,
    timestamp: new Date().toISOString(),
    verdict,
    reasons,
    primaryReason,
    mode,
    inputMethod: params.inputMethod,
    scannedCode: decodedQr || batchRecord?.qrSerial || packagingInspection?.extractedBatchNo || 'IMAGE-ONLY-SCAN',
    batchRecord,
    packagingInspection,
    localScanCount,
    totalScanCount,
    imageDataUrl: params.imageDataUrl,
    voiceSummary: buildVoiceSummaries(verdict, primaryReason, batchRecord, packagingInspection),
  };
}

export async function computeSha256Hex(payload: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoded = new TextEncoder().encode(payload);
    const digest = await crypto.subtle.digest('SHA-256', encoded);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  throw new Error('Secure SHA-256 is unavailable in this device context.');
}
