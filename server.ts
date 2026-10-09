import express, { Request, Response } from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, runTransaction, Firestore } from 'firebase/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Security and request parsing
app.use(express.json({ limit: '16kb' }));

// Initialize Firestore using the platform configuration
let db: Firestore | null = null;
try {
  const configPath = path.resolve(__dirname, 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    const rawConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const firebaseApp = initializeApp(rawConfig);
    db = getFirestore(firebaseApp, rawConfig.firestoreDatabaseId);
    console.log('[Server] Firestore initialized successfully with database:', rawConfig.firestoreDatabaseId);
  } else {
    console.warn('[Server] firebase-applet-config.json not found.');
  }
} catch (err) {
  console.error('[Server] Failed to initialize Firestore SDK:', (err as Error).message);
}

// Allowed topic interests
const ALLOWED_INTERESTS = ['Purpose', 'Leadership', 'Trust & Teams', 'Infinite Mindset'] as const;
type AllowedInterest = typeof ALLOWED_INTERESTS[number];

interface NewsletterRequestBody {
  email?: unknown;
  firstName?: unknown;
  interest?: unknown;
  consent?: unknown;
  website?: unknown;
}

// API Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ ok: true, firestoreReady: !!db });
});

// Newsletter Opt-in Endpoint
app.post('/api/newsletter', async (req: Request, res: Response): Promise<void> => {
  const body = req.body as NewsletterRequestBody;

  // 1. Honeypot check (hidden "website" field)
  if (body.website && typeof body.website === 'string' && body.website.trim().length > 0) {
    // Silently accept without saving to deter automated bot scrapers
    res.status(201).json({
      ok: true,
      status: 'subscribed',
      message: 'Your signup has been recorded.'
    });
    return;
  }

  // 2. Email validation
  if (!body.email || typeof body.email !== 'string') {
    res.status(400).json({
      ok: false,
      status: 'invalid_input',
      message: 'Please provide a valid email address.'
    });
    return;
  }

  const normalizedEmail = body.email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (normalizedEmail.length < 5 || normalizedEmail.length > 255 || !emailRegex.test(normalizedEmail)) {
    res.status(400).json({
      ok: false,
      status: 'invalid_input',
      message: 'The email address format is invalid.'
    });
    return;
  }

  // 3. Explicit consent validation
  if (body.consent !== true) {
    res.status(400).json({
      ok: false,
      status: 'invalid_input',
      message: 'Explicit consent is required to receive independent study notes.'
    });
    return;
  }

  // 4. Optional First Name validation
  let cleanFirstName: string | null = null;
  if (body.firstName !== undefined && body.firstName !== null) {
    if (typeof body.firstName !== 'string') {
      res.status(400).json({
        ok: false,
        status: 'invalid_input',
        message: 'First name must be text.'
      });
      return;
    }
    const trimmedFirst = body.firstName.trim();
    if (trimmedFirst.length > 80) {
      res.status(400).json({
        ok: false,
        status: 'invalid_input',
        message: 'First name must be 80 characters or fewer.'
      });
      return;
    }
    cleanFirstName = trimmedFirst.length > 0 ? trimmedFirst : null;
  }

  // 5. Optional Interest validation
  let cleanInterest: AllowedInterest | null = null;
  if (body.interest !== undefined && body.interest !== null && body.interest !== '') {
    if (typeof body.interest !== 'string' || !ALLOWED_INTERESTS.includes(body.interest as AllowedInterest)) {
      res.status(400).json({
        ok: false,
        status: 'invalid_input',
        message: 'Selected topic interest is not recognized.'
      });
      return;
    }
    cleanInterest = body.interest as AllowedInterest;
  }

  // 6. Persistence check
  if (!db) {
    console.error('[Newsletter] Database instance is unavailable.');
    res.status(500).json({
      ok: false,
      status: 'server_error',
      message: 'Subscription service is temporarily unavailable. Please try again soon.'
    });
    return;
  }

  // 7. Deterministic document ID via SHA-256 of normalized email
  const docId = crypto.createHash('sha256').update(normalizedEmail).digest('hex');
  const subscriberRef = doc(db, 'newsletterSubscribers', docId);

  try {
    const outcome = await runTransaction(db, async (transaction) => {
      const existingDoc = await transaction.get(subscriberRef);
      if (existingDoc.exists()) {
        return 'already_subscribed';
      }

      const now = new Date().toISOString();
      const payload: Record<string, unknown> = {
        email: normalizedEmail,
        consent: true,
        consentTextVersion: 'v1',
        source: 'why-practiced-community-page',
        createdAt: now,
        updatedAt: now
      };

      if (cleanFirstName) {
        payload.firstName = cleanFirstName;
      }
      if (cleanInterest) {
        payload.interest = cleanInterest;
      }

      transaction.set(subscriberRef, payload);
      return 'subscribed';
    });

    if (outcome === 'already_subscribed') {
      res.status(200).json({
        ok: true,
        status: 'already_subscribed',
        message: 'This email is already registered on our independent study list.'
      });
      return;
    }

    res.status(201).json({
      ok: true,
      status: 'subscribed',
      message: 'Your interest has been recorded. Thank you for joining the practice.'
    });
  } catch (error) {
    // Never leak raw database error messages or PII
    console.error('[Newsletter] Transaction failure occurred.');
    res.status(500).json({
      ok: false,
      status: 'server_error',
      message: 'Unable to record your signup right now. Please try again in a few moments.'
    });
  }
});

// Configure Vite middleware in development vs Static serving in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
    console.log('[Server] Running with Vite middleware mode in development');
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
    console.log('[Server] Serving compiled static assets from dist/ in production');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] WHY, PRACTICED server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Server] Fatal startup error:', err);
  process.exit(1);
});
