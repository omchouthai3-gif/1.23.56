import type { LanguageCode, VerdictReason } from '../types.ts';

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
  speechLang: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeLabel: 'English', speechLang: 'en-IN' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी', speechLang: 'hi-IN' },
  { code: 'mr', label: 'Marathi', nativeLabel: 'मराठी', speechLang: 'mr-IN' },
  { code: 'kn', label: 'Kannada', nativeLabel: 'ಕನ್ನಡ', speechLang: 'kn-IN' },
];

export const UI_COPY: Record<
  LanguageCode,
  {
    tagline: string;
    navVerify: string;
    navRegistry: string;
    navAlerts: string;
    navGuide: string;
    offlineBadge: string;
    onlineBadge: string;
    simulateOffline: string;
    scanHeroTitle: string;
    scanHeroSub: string;
    startCamera: string;
    stopCamera: string;
    captureInspect: string;
    uploadPhoto: string;
    manualPlaceholder: string;
    verifyButton: string;
    sampleBenchTitle: string;
    sampleBenchSub: string;
    verdictSafeTitle: string;
    verdictSafeSub: string;
    verdictFakeTitle: string;
    verdictFakeSub: string;
    verdictUnverifiedTitle: string;
    verdictUnverifiedSub: string;
    listenVoice: string;
    stopVoice: string;
    reportDealer: string;
    scanAnother: string;
    gpsLocking: string;
    submitAlert: string;
    alertSavedOffline: string;
    alertSynced: string;
  }
> = {
  en: {
    tagline: 'Instant offline seed & fertilizer verification before you pay',
    navVerify: 'Verify Packet',
    navRegistry: 'Offline Registry',
    navAlerts: 'Inspector Desk',
    navGuide: 'Field Guide',
    offlineBadge: 'Offline Mode · Local Registry Active',
    onlineBadge: 'Internet connected · Cloud service depends on backend setup',
    simulateOffline: 'Zero-Signal Shop Mode',
    scanHeroTitle: 'Verify before you sow',
    scanHeroSub:
      'Scan the packet QR code or snap the front label. Works inside zero-signal village shops using your downloaded batch registry.',
    startCamera: 'Open Camera Scanner',
    stopCamera: 'Close Camera',
    captureInspect: 'Capture & Inspect Label',
    uploadPhoto: 'Upload Packet Photo',
    manualPlaceholder: 'Enter QR serial or batch number (e.g. SH1124C21)',
    verifyButton: 'Verify Now',
    sampleBenchTitle: 'How verification works',
    sampleBenchSub: 'Scan a packet QR or upload a photo. Online mode uses Gemini Vision; offline mode uses the local registry.',
    verdictSafeTitle: 'MATCHED IN LOCAL REGISTRY',
    verdictSafeSub: 'Matched in this app’s local registry. Not an official authenticity certificate.',
    verdictFakeTitle: 'DO NOT BUY — RISK DETECTED',
    verdictFakeSub: 'Packet failed authenticity, expiry, or label integrity checks',
    verdictUnverifiedTitle: 'NOT VERIFIED',
    verdictUnverifiedSub: 'This batch was not found in the local registry. That alone does not prove it is counterfeit.',
    listenVoice: 'Hear Voice Verdict',
    stopVoice: 'Stop Audio',
    reportDealer: 'Report Dealer (Lock GPS)',
    scanAnother: 'Scan Next Packet',
    gpsLocking: 'Locking shop GPS coordinates…',
    submitAlert: 'Queue Inspector Alert',
    alertSavedOffline: 'Saved in the local offline queue — will sync when connectivity returns.',
    alertSynced: 'Report sent to the configured BeejRakshak server.',
  },
  hi: {
    tagline: 'खरीदने से पहले बीज और खाद की तुरंत ऑफ़लाइन जाँच',
    navVerify: 'पैकेट जाँचें',
    navRegistry: 'ऑफ़लाइन रजिस्ट्री',
    navAlerts: 'इंस्पेक्टर डेस्क',
    navGuide: 'गाइड',
    offlineBadge: 'ऑफ़लाइन मोड · लोकल डेटा सक्रिय',
    onlineBadge: 'इंटरनेट जुड़ा है · क्लाउड सेवा के लिए बैकएंड आवश्यक है',
    simulateOffline: 'बिना नेटवर्क (गाँव) मोड',
    scanHeroTitle: 'बोने से पहले असली बीज की पहचान करें',
    scanHeroSub:
      'पैकेट का QR कोड स्कैन करें या सामने के लेबल की फ़ोटो लें। बिना इंटरनेट वाले गाँव की दुकान में भी काम करता है।',
    startCamera: 'कैमरा स्कैनर खोलें',
    stopCamera: 'कैमरा बंद करें',
    captureInspect: 'फ़ोटो लें और लेबल जाँचें',
    uploadPhoto: 'पैकेट की फ़ोटो चुनें',
    manualPlaceholder: 'QR या बैच नंबर लिखें (जैसे SH1124C21)',
    verifyButton: 'अभी जाँचें',
    sampleBenchTitle: 'सत्यापन कैसे काम करता है',
    sampleBenchSub: 'पैकेट का QR स्कैन करें या फोटो अपलोड करें। ऑनलाइन मोड में Gemini Vision, ऑफलाइन में स्थानीय रजिस्ट्री।',
    verdictSafeTitle: 'स्थानीय सूची में मिला',
    verdictSafeSub: 'यह बैच ऐप की स्थानीय सूची में मिला। यह सरकारी प्रमाणपत्र नहीं है।',
    verdictFakeTitle: 'सावधान! नकली या खराब माल',
    verdictFakeSub: 'यह पैकेट सुरक्षा, एक्सपायरी या लेबल जाँच में फेल हो गया है',
    verdictUnverifiedTitle: 'अभी सत्यापित नहीं',
    verdictUnverifiedSub: 'यह बैच स्थानीय रजिस्ट्री में नहीं मिला। केवल इससे नकली होना साबित नहीं होता।',
    listenVoice: 'आवाज़ में सुनें',
    stopVoice: 'आवाज़ रोकें',
    reportDealer: 'दुकानदार की शिकायत करें (GPS)',
    scanAnother: 'अगला पैकेट जाँचें',
    gpsLocking: 'दुकान की GPS लोकेशन लॉक हो रही है…',
    submitAlert: 'कृषि अधिकारी को शिकायत भेजें',
    alertSavedOffline: 'शिकायत स्थानीय ऑफ़लाइन सूची में सहेजी गई — नेटवर्क आने पर सिंक होगी।',
    alertSynced: 'रिपोर्ट कॉन्फ़िगर किए गए BeejRakshak सर्वर को भेजी गई।',
  },
  mr: {
    tagline: 'खरेदीपूर्वी बियाणे आणि खतांची तात्काळ ऑफलाइन तपासणी',
    navVerify: 'पॅकेट तपासा',
    navRegistry: 'ऑफलाइन नोंदणी',
    navAlerts: 'तपासणी कक्ष',
    navGuide: 'मार्गदर्शक',
    offlineBadge: 'ऑफलाइन मोड · स्थानिक डेटा सक्रिय',
    onlineBadge: 'इंटरनेट जोडले आहे · क्लाउड सेवेसाठी बॅकएंड आवश्यक आहे',
    simulateOffline: 'नेटवर्कशिवाय (गाव) मोड',
    scanHeroTitle: 'पेरणीपूर्वी बियाण्यांची खात्री करा',
    scanHeroSub:
      'पॅकेटचा QR कोड स्कॅन करा किंवा पुढील लेबलचा फोटो काढा. नेटवर्क नसलेल्या गावातील दुकानातही पूर्णपणे काम करते.',
    startCamera: 'कॅमेरा स्कॅनर उघडा',
    stopCamera: 'कॅमेरा बंद करा',
    captureInspect: 'फोटो काढा आणि तपासा',
    uploadPhoto: 'पॅकेटचा फोटो निवडा',
    manualPlaceholder: 'QR किंवा बॅच क्रमांक टाका (उदा. SH1124C21)',
    verifyButton: 'आत्ता तपासा',
    sampleBenchTitle: 'पडताळणी कशी होते',
    sampleBenchSub: 'पॅकेटचा QR स्कॅन करा किंवा फोटो अपलोड करा. ऑनलाइन Gemini Vision; ऑफलाइन स्थानिक नोंदणी.',
    verdictSafeTitle: 'स्थानिक नोंदणीत आढळला',
    verdictSafeSub: 'हा बॅच अॅपच्या स्थानिक नोंदणीत आढळला. हे सरकारी प्रमाणपत्र नाही.',
    verdictFakeTitle: 'सावधान! बनावट किंवा मुदतबाह्य माल',
    verdictFakeSub: 'हे पॅकेट अस्सलपणा, मुदत किंवा सील तपासणीत नापास झाले आहे',
    verdictUnverifiedTitle: 'पडताळणी झालेली नाही',
    verdictUnverifiedSub: 'हा बॅच स्थानिक नोंदणीत आढळला नाही. एवढ्याने तो बनावट ठरत नाही.',
    listenVoice: 'आवाजात ऐका',
    stopVoice: 'आवाज थांबवा',
    reportDealer: 'विक्रेत्याची तक्रार करा (GPS)',
    scanAnother: 'पुढील पॅकेट तपासा',
    gpsLocking: 'दुकानाचे GPS स्थान नोंदवत आहे…',
    submitAlert: 'कृषी अधिकाऱ्यांकडे तक्रार पाठवा',
    alertSavedOffline: 'तक्रार स्थानिक ऑफलाइन यादीत जतन केली — नेटवर्क आल्यावर सिंक होईल.',
    alertSynced: 'अहवाल कॉन्फिगर केलेल्या BeejRakshak सर्व्हरवर पाठवला आहे.',
  },
  kn: {
    tagline: 'ಖರೀದಿಸುವ ಮೊದಲು ಬೀಜ ಮತ್ತು ರಸಗೊಬ್ಬರದ ತಕ್ಷಣದ ಆಫ್‌ಲೈನ್ ಪರಿಶೀಲನೆ',
    navVerify: 'ಪ್ಯಾಕೆಟ್ ಪರಿಶೀಲಿಸಿ',
    navRegistry: 'ಆಫ್‌ಲೈನ್ ನೋಂದಣಿ',
    navAlerts: 'ಇನ್‌ಸ್ಪೆಕ್ಟರ್ ಡೆಸ್ಕ್',
    navGuide: 'ಮಾರ್ಗದರ್ಶಿ',
    offlineBadge: 'ಆಫ್‌ಲೈನ್ ಮೋಡ್ · ಸ್ಥಳೀಯ ಡೇಟಾ ಸಕ್ರಿಯ',
    onlineBadge: 'ಇಂಟರ್ನೆಟ್ ಸಂಪರ್ಕವಿದೆ · ಕ್ಲೌಡ್ ಸೇವೆಗೆ ಬ್ಯಾಕೆಂಡ್ ಅಗತ್ಯವಿದೆ',
    simulateOffline: 'ಸಿಗ್ನಲ್ ಇಲ್ಲದ ಅಂಗಡಿ ಮೋಡ್',
    scanHeroTitle: 'ಬಿತ್ತನೆ ಮಾಡುವ ಮೊದಲು ಪರಿಶೀಲಿಸಿ',
    scanHeroSub:
      'ಪ್ಯಾಕೆಟ್ QR ಕೋಡ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ ಅಥವಾ ಮುಂಭಾಗದ ಲೇಬಲ್ ಫೋಟೋ ತೆಗೆಯಿರಿ. ಸಿಗ್ನಲ್ ಇಲ್ಲದ ಹಳ್ಳಿ ಅಂಗಡಿಗಳಲ್ಲೂ ಕೆಲಸ ಮಾಡುತ್ತದೆ.',
    startCamera: 'ಕ್ಯಾಮೆರಾ ಸ್ಕ್ಯಾನರ್ ತೆರೆಯಿರಿ',
    stopCamera: 'ಕ್ಯಾಮೆರಾ ಮುಚ್ಚಿ',
    captureInspect: 'ಫೋಟೋ ತೆಗೆದು ಪರಿಶೀಲಿಸಿ',
    uploadPhoto: 'ಪ್ಯಾಕೆಟ್ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
    manualPlaceholder: 'QR ಅಥವಾ ಬ್ಯಾಚ್ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ (ಉದಾ. SH1124C21)',
    verifyButton: 'ಈಗ ಪರಿಶೀಲಿಸಿ',
    sampleBenchTitle: 'ಪರಿಶೀಲನೆ ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ',
    sampleBenchSub: 'ಪ್ಯಾಕೆಟ್ QR ಸ್ಕ್ಯಾನ್ ಮಾಡಿ ಅಥವಾ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ. ಆನ್‌ಲೈನ್ Gemini Vision; ಆಫ್‌ಲೈನ್ ಸ್ಥಳೀಯ ನೋಂದಣಿ.',
    verdictSafeTitle: 'ಸ್ಥಳೀಯ ನೋಂದಣಿಯಲ್ಲಿ ಕಂಡುಬಂದಿದೆ',
    verdictSafeSub: 'ಈ ಬ್ಯಾಚ್ ಆ್ಯಪ್‌ನ ಸ್ಥಳೀಯ ನೋಂದಣಿಯಲ್ಲಿ ಕಂಡುಬಂದಿದೆ. ಇದು ಸರ್ಕಾರಿ ಪ್ರಮಾಣಪತ್ರವಲ್ಲ.',
    verdictFakeTitle: 'ಖರೀದಿಸಬೇಡಿ — ಅಪಾಯ ಪತ್ತೆಯಾಗಿದೆ',
    verdictFakeSub: 'ಈ ಪ್ಯಾಕೆಟ್ ಅಸಲಿತನ, ಅವಧಿ ಅಥವಾ ಲೇಬಲ್ ಪರೀಕ್ಷೆಯಲ್ಲಿ ವಿಫಲವಾಗಿದೆ',
    verdictUnverifiedTitle: 'ಪರಿಶೀಲಿಸಲಾಗಿಲ್ಲ',
    verdictUnverifiedSub: 'ಈ ಬ್ಯಾಚ್ ಸ್ಥಳೀಯ ನೋಂದಣಿಯಲ್ಲಿ ಕಂಡುಬಂದಿಲ್ಲ. ಇದರಿಂದ ಮಾತ್ರ ಅದು ನಕಲಿ ಎಂದು ಸಾಬೀತಾಗುವುದಿಲ್ಲ.',
    listenVoice: 'ಧ್ವನಿಯಲ್ಲಿ ಕೇಳಿ',
    stopVoice: 'ಧ್ವನಿ ನಿಲ್ಲಿಸಿ',
    reportDealer: 'ಅಂಗಡಿ ವರದಿ ಮಾಡಿ (GPS)',
    scanAnother: 'ಮುಂದಿನ ಪ್ಯಾಕೆಟ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ',
    gpsLocking: 'ಅಂಗಡಿಯ GPS ಸ್ಥಳವನ್ನು ಲಾಕ್ ಮಾಡಲಾಗುತ್ತಿದೆ…',
    submitAlert: 'ಕೃಷಿ ಅಧಿಕಾರಿಗೆ ದೂರು ಕಳುಹಿಸಿ',
    alertSavedOffline: 'ದೂರು ಸ್ಥಳೀಯ ಆಫ್‌ಲೈನ್ ಪಟ್ಟಿಯಲ್ಲಿ ಉಳಿಸಲಾಗಿದೆ — ಸಂಪರ್ಕ ಮರಳಿದಾಗ ಸಿಂಕ್ ಆಗುತ್ತದೆ.',
    alertSynced: 'ವರದಿಯನ್ನು ಕಾನ್ಫಿಗರ್ ಮಾಡಿದ BeejRakshak ಸರ್ವರ್‌ಗೆ ಕಳುಹಿಸಲಾಗಿದೆ.',
  },
};

export const REASON_LABELS: Record<VerdictReason, Record<LanguageCode, string>> = {
  VERIFIED_AUTHENTIC: {
    en: 'Matched in local registry; no risk flags found in the checks performed.',
    hi: 'स्थानीय सूची में मिला; की गई जाँच में कोई जोखिम संकेत नहीं मिला।',
    mr: 'स्थानिक नोंदणीत आढळला; केलेल्या तपासणीत धोका आढळला नाही.',
    kn: 'ಸ್ಥಳೀಯ ನೋಂದಣಿಯಲ್ಲಿ ಕಂಡುಬಂದಿದೆ; ಮಾಡಿದ ಪರಿಶೀಲನೆಯಲ್ಲಿ ಅಪಾಯದ ಸೂಚನೆ ಕಂಡುಬಂದಿಲ್ಲ.',
  },
  CLONED_QR: {
    en: 'Local registry marks this QR serial as cloned; confirm with the supplier.',
    hi: 'स्थानीय सूची में इस QR नंबर को क्लोन चिह्नित किया गया है; स्रोत से पुष्टि करें।',
    mr: 'स्थानिक नोंदीत हा QR क्रमांक क्लोन म्हणून चिन्हांकित आहे; मूळ स्रोताकडून खात्री करा.',
    kn: 'ಸ್ಥಳೀಯ ನೋಂದಣಿಯಲ್ಲಿ ಈ QR ಸಂಖ್ಯೆಯನ್ನು ಕ್ಲೋನ್ ಎಂದು ಗುರುತಿಸಲಾಗಿದೆ; ಮೂಲದಿಂದ ದೃಢಪಡಿಸಿ.',
  },
  EXPIRED_STOCK: {
    en: 'Expired stock past statutory germination/use date',
    hi: 'एक्सपायरी तारीख निकल चुकी है — पुराना स्टॉक',
    mr: 'वापराची मुदत संपलेली आहे — जुना साठा',
    kn: 'ಬಳಕೆಯ ಅವಧಿ ಮುಗಿದಿದೆ — ಹಳೆಯ ದಾಸ್ತಾನು',
  },
  TAMPERED_LABEL: {
    en: 'Tampered packaging, smudged batch, or fake seal',
    hi: 'पैकेट के लेबल, प्रिंट या सील में छेड़छाड़ मिली',
    mr: 'पॅकेटचे सील फाटलेले किंवा लेबलमध्ये छेडछाड',
    kn: 'ಪ್ಯಾಕೆಟ್ ಸೀಲ್ ಹರಿದಿದೆ ಅಥವಾ ಲೇಬಲ್‌ನಲ್ಲಿ ತಿದ್ದುಪಡಿ ಇದೆ',
  },
  BLACKLISTED_BATCH: {
    en: 'Batch marked as blacklisted in this app’s local registry; verify the source.',
    hi: 'ऐप की स्थानीय सूची में ब्लैकलिस्ट चिह्नित बैच; स्रोत से पुष्टि करें।',
    mr: 'अॅपच्या स्थानिक नोंदणीत ब्लॅकलिस्ट केलेला बॅच; स्रोताकडून खात्री करा.',
    kn: 'ಆ್ಯಪ್‌ನ ಸ್ಥಳೀಯ ನೋಂದಣಿಯಲ್ಲಿ ಕಪ್ಪುಪಟ್ಟಿ ಎಂದು ಗುರುತಿಸಿದ ಬ್ಯಾಚ್; ಮೂಲದಿಂದ ದೃಢಪಡಿಸಿ.',
  },
  UNREGISTERED_BATCH: {
    en: 'Batch not found in this app’s local registry; this alone does not prove counterfeiting.',
    hi: 'यह बैच ऐप की स्थानीय सूची में नहीं मिला; इससे नकली होना साबित नहीं होता।',
    mr: 'हा बॅच अॅपच्या स्थानिक नोंदणीत आढळला नाही; एवढ्याने तो बनावट ठरत नाही.',
    kn: 'ಈ ಬ್ಯಾಚ್ ಆ್ಯಪ್‌ನ ಸ್ಥಳೀಯ ನೋಂದಣಿಯಲ್ಲಿ ಕಂಡುಬಂದಿಲ್ಲ; ಇದರಿಂದ ಮಾತ್ರ ನಕಲಿ ಎಂದು ಸಾಬೀತಾಗುವುದಿಲ್ಲ.',
  },
  PACKAGING_NOT_INSPECTED: {
    en: 'Photo was not visually analysed; seal and print remain unchecked.',
    hi: 'फ़ोटो की दृश्य जाँच नहीं हुई; सील और प्रिंट की पुष्टि नहीं हुई।',
    mr: 'फोटोची दृश्य तपासणी झाली नाही; सील आणि छपाईची खात्री झालेली नाही.',
    kn: 'ಫೋಟೋವನ್ನು ದೃಷ್ಟಿಗೋಚರವಾಗಿ ಪರಿಶೀಲಿಸಲಾಗಿಲ್ಲ; ಸೀಲ್ ಮತ್ತು ಮುದ್ರಣ ಪರಿಶೀಲಿಸಿಲ್ಲ.',
  },
};
