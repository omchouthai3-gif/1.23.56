import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '15mb' }));
app.use('/api', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});

const DATA_DIR = path.resolve(process.cwd(), 'data');
const ALERTS_FILE = path.join(DATA_DIR, 'inspector-alerts.json');

interface ServerAlertRecord {
  id: string;
  createdAt: string;
  verdictId: string;
  productName: string;
  batchNumber: string;
  qrSerial: string;
  manufacturer: string;
  reasons: string[];
  shopName: string;
  villageOrTaluka: string;
  district: string;
  notes: string;
  location: {
    lat: number | null;
    lng: number | null;
    accuracyMeters: number | null;
    source: 'gps' | 'unavailable';
    label: string;
  };
  integrityHash: string;
  syncStatus: 'SYNCED';
  resolutionStatus: 'OPEN' | 'INVESTIGATING' | 'ACTION_TAKEN';
  evidenceImage?: string;
}

const INITIAL_ALERTS: ServerAlertRecord[] = [];

function ensureAlertsFile(): ServerAlertRecord[] {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(ALERTS_FILE)) {
    fs.writeFileSync(ALERTS_FILE, JSON.stringify(INITIAL_ALERTS, null, 2), 'utf-8');
    return INITIAL_ALERTS;
  }
  try {
    const raw = fs.readFileSync(ALERTS_FILE, 'utf-8');
    return JSON.parse(raw) as ServerAlertRecord[];
  } catch {
    return INITIAL_ALERTS;
  }
}

function saveAlertsFile(records: ServerAlertRecord[]): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(ALERTS_FILE, JSON.stringify(records, null, 2), 'utf-8');
}

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'BeejRakshak/1.0',
      },
    },
  });
}

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'BeejRakshak API',
    timestamp: new Date().toISOString(),
    aiConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
  });
});

app.get('/api/alerts', (_req, res) => {
  const alerts = ensureAlertsFile();
  res.json({ alerts });
});

app.post('/api/alerts', (req, res) => {
  const incoming = req.body as Partial<ServerAlertRecord>;
  if (!incoming || !incoming.id || !incoming.batchNumber || !incoming.shopName) {
    res.status(400).json({ error: 'Missing required alert fields (id, batchNumber, shopName).' });
    return;
  }
  const existing = ensureAlertsFile();
  const idx = existing.findIndex((a) => a.id === incoming.id);
  const record: ServerAlertRecord = {
    id: incoming.id,
    createdAt: incoming.createdAt ?? new Date().toISOString(),
    verdictId: incoming.verdictId ?? 'VRD-UNKNOWN',
    productName: incoming.productName ?? 'Unregistered Agricultural Input',
    batchNumber: incoming.batchNumber,
    qrSerial: incoming.qrSerial ?? 'UNKNOWN',
    manufacturer: incoming.manufacturer ?? 'Unknown Manufacturer',
    reasons: Array.isArray(incoming.reasons) ? incoming.reasons : ['UNREGISTERED_BATCH'],
    shopName: incoming.shopName,
    villageOrTaluka: incoming.villageOrTaluka ?? '',
    district: incoming.district ?? 'Unknown District',
    notes: incoming.notes ?? '',
    location: incoming.location ?? {
      lat: null,
      lng: null,
      accuracyMeters: null,
      source: 'unavailable',
      label: 'GPS unavailable — no coordinates attached',
    },
    integrityHash: incoming.integrityHash ?? '',
    syncStatus: 'SYNCED',
    resolutionStatus: incoming.resolutionStatus ?? 'OPEN',
    evidenceImage: incoming.evidenceImage,
  };
  if (idx >= 0) {
    existing[idx] = record;
  } else {
    existing.unshift(record);
  }
  saveAlertsFile(existing);
  res.status(201).json({ alert: record });
});

app.patch('/api/alerts/:id', (req, res) => {
  const { id } = req.params;
  const { resolutionStatus } = req.body as { resolutionStatus?: ServerAlertRecord['resolutionStatus'] };
  if (!resolutionStatus || !['OPEN', 'INVESTIGATING', 'ACTION_TAKEN'].includes(resolutionStatus)) {
    res.status(400).json({ error: 'Invalid resolutionStatus.' });
    return;
  }
  const alerts = ensureAlertsFile();
  const target = alerts.find((a) => a.id === id);
  if (!target) {
    res.status(404).json({ error: 'Alert not found.' });
    return;
  }
  target.resolutionStatus = resolutionStatus;
  saveAlertsFile(alerts);
  res.json({ alert: target });
});

app.post('/api/inspect-package', async (req, res) => {
  const { imageBase64, mimeType, todayIso } = req.body as {
    imageBase64?: string;
    mimeType?: string;
    todayIso?: string;
  };

  if (!imageBase64) {
    res.status(400).json({ error: 'imageBase64 is required.' });
    return;
  }

  const ai = getAiClient();
  if (!ai) {
    res.status(503).json({
      error: 'GEMINI_API_KEY is not configured on the server. Offline heuristic verification remains active.',
    });
    return;
  }

  try {
    const cleanBase64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_VISION_MODEL || 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType || 'image/jpeg',
              data: cleanBase64,
            },
          },
          {
            text: `You are an agricultural seed & fertilizer packaging forensics inspector in India. Today's date is ${todayIso || new Date().toISOString().slice(0, 10)}.
Inspect only what is visibly supported by this packet photo:
1. Read the visible batch/lot number, expiry date, and brand/manufacturer name; use empty strings when unreadable.
2. List only clearly visible spelling errors or garbled text; do not guess.
3. Note visible evidence of peeling/missing seals, overwritten or smudged batch stamps, or visibly altered printing.
4. Compare a clearly readable expiry date with today's date (${todayIso || new Date().toISOString().slice(0, 10)}).
5. If the image is blurry, incomplete, or inconclusive, use sealStatus UNCHECKED, low confidence, and explain what could not be checked.
Never claim that a product is genuine or counterfeit from the photograph alone. A photo can identify warning signs, not authenticate the supply chain. Return precise structured JSON.`,
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            labelTampered: {
              type: Type.BOOLEAN,
              description: 'True if seal is peeling/fake, ink is smudged/overwritten, or print looks counterfeit.',
            },
            spellingErrorsFound: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'List of suspicious spelling mistakes or garbled text found on packaging.',
            },
            sealStatus: {
              type: Type.STRING,
              description: 'One of INTACT, PEELING_OR_FAKE, MISSING, UNCHECKED',
            },
            printAlterationDetected: {
              type: Type.BOOLEAN,
              description: 'True if batch/expiry stamp appears smudged, scratched, or altered.',
            },
            extractedBatchNo: {
              type: Type.STRING,
              description: 'Batch or lot number visible on the packet, or empty string if unreadable.',
            },
            extractedExpiry: {
              type: Type.STRING,
              description: 'Expiry date printed on the packet (e.g. 11/2025 or 13 NOV 2025), or empty string.',
            },
            extractedBrand: {
              type: Type.STRING,
              description: 'Brand or product name printed on the packet.',
            },
            confidencePct: {
              type: Type.INTEGER,
              description: 'Inspection confidence percentage 0-100.',
            },
            summary: {
              type: Type.STRING,
              description: 'Concise 1-2 sentence forensic summary in plain English.',
            },
          },
          required: [
            'labelTampered',
            'spellingErrorsFound',
            'sealStatus',
            'printAlterationDetected',
            'extractedBatchNo',
            'extractedExpiry',
            'extractedBrand',
            'confidencePct',
            'summary',
          ],
        },
      },
    });

    const parsed = JSON.parse((response.text ?? '{}').trim()) as {
      labelTampered?: boolean;
      spellingErrorsFound?: string[];
      sealStatus?: string;
      printAlterationDetected?: boolean;
      extractedBatchNo?: string;
      extractedExpiry?: string;
      extractedBrand?: string;
      confidencePct?: number;
      summary?: string;
    };

    const validSeals = ['INTACT', 'PEELING_OR_FAKE', 'MISSING', 'UNCHECKED'] as const;
    const sealStatus = validSeals.includes(parsed.sealStatus as (typeof validSeals)[number])
      ? (parsed.sealStatus as (typeof validSeals)[number])
      : 'UNCHECKED';

    res.json({
      inspection: {
        source: 'gemini-vision',
        labelTampered: Boolean(parsed.labelTampered),
        spellingErrorsFound: Array.isArray(parsed.spellingErrorsFound) ? parsed.spellingErrorsFound : [],
        sealStatus,
        printAlterationDetected: Boolean(parsed.printAlterationDetected),
        extractedBatchNo: parsed.extractedBatchNo?.trim() || null,
        extractedExpiry: parsed.extractedExpiry?.trim() || null,
        extractedBrand: parsed.extractedBrand?.trim() || null,
        confidencePct: typeof parsed.confidencePct === 'number' ? parsed.confidencePct : 85,
        summary: parsed.summary || 'Visual packaging inspection completed.',
      },
    });
  } catch (err) {
    console.error('Gemini Vision inspection error:', err);
    res.status(502).json({
      error: err instanceof Error ? err.message : 'Gemini Vision request failed.',
    });
  }
});

app.post('/api/tts', async (req, res) => {
  const { text, language } = req.body as { text?: string; language?: string };
  if (!text) {
    res.status(400).json({ error: 'text is required.' });
    return;
  }

  const ai = getAiClient();
  if (!ai) {
    res.status(503).json({ error: 'GEMINI_API_KEY not configured for TTS.' });
    return;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text,
              speechMetadata: {
                style: `Clear, warm, reassuring Indian agricultural advisor speaking ${language || 'English'} slowly and clearly for rural farmers`,
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const audioPart = response.candidates?.[0]?.content?.parts?.find((part) => part.inlineData?.data)?.inlineData;
    if (!audioPart?.data) {
      res.status(502).json({ error: 'No audio payload returned from TTS model.' });
      return;
    }

    let audioBuffer = Buffer.from(audioPart.data, 'base64');
    let mimeType = audioPart.mimeType || 'audio/L16;rate=24000';

    // Gemini TTS commonly returns raw 24 kHz, 16-bit, mono PCM. Browsers
    // need a WAV container to play that byte stream consistently.
    if (/audio\/(L16|pcm)/i.test(mimeType)) {
      const wavHeader = Buffer.alloc(44);
      const sampleRate = 24000;
      const channels = 1;
      const bitsPerSample = 16;
      const byteRate = sampleRate * channels * bitsPerSample / 8;
      wavHeader.write('RIFF', 0);
      wavHeader.writeUInt32LE(36 + audioBuffer.length, 4);
      wavHeader.write('WAVE', 8);
      wavHeader.write('fmt ', 12);
      wavHeader.writeUInt32LE(16, 16);
      wavHeader.writeUInt16LE(1, 20);
      wavHeader.writeUInt16LE(channels, 22);
      wavHeader.writeUInt32LE(sampleRate, 24);
      wavHeader.writeUInt32LE(byteRate, 28);
      wavHeader.writeUInt16LE(channels * bitsPerSample / 8, 32);
      wavHeader.writeUInt16LE(bitsPerSample, 34);
      wavHeader.write('data', 36);
      wavHeader.writeUInt32LE(audioBuffer.length, 40);
      audioBuffer = Buffer.concat([wavHeader, audioBuffer]);
      mimeType = 'audio/wav';
    }

    res.json({ mimeType, base64Audio: audioBuffer.toString('base64') });
  } catch (err) {
    console.error('Gemini TTS error:', err);
    res.status(502).json({
      error: err instanceof Error ? err.message : 'TTS generation failed.',
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BeejRakshak server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
