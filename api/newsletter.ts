import type { Request, Response } from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const ALLOWED_INTERESTS = ['Purpose', 'Leadership', 'Trust & Teams', 'Infinite Mindset'] as const;

interface DatabaseAdapter {
  checkAndSaveSubscriber: (
    docId: string,
    payload: Record<string, unknown>
  ) => Promise<'subscribed' | 'already_subscribed'>;
}

let dbAdapter: DatabaseAdapter | null = null;

async function getDatabaseAdapter(): Promise<DatabaseAdapter | null> {
  if (dbAdapter) return dbAdapter;

  const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
  const isPreview = fs.existsSync(configPath);

  // 1. PREVIEW RUNTIME (Google AI Studio / Local)
  // Uses platform-provided firebase-applet-config.json natively.
  // Does NOT require any Admin SDK service-account credentials or environment variables.
  if (isPreview) {
    try {
      const rawConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      const { initializeApp, getApps, getApp } = await import('firebase/app');
      const { getFirestore, doc, runTransaction } = await import('firebase/firestore');

      const app = !getApps().length ? initializeApp(rawConfig) : getApp();
      const clientDb = getFirestore(app, rawConfig.firestoreDatabaseId);

      dbAdapter = {
        async checkAndSaveSubscriber(docId, payload) {
          const docRef = doc(clientDb, 'newsletterSubscribers', docId);
          return await runTransaction(clientDb, async (transaction) => {
            const snap = await transaction.get(docRef);
            if (snap.exists()) {
              return 'already_subscribed';
            }
            transaction.set(docRef, payload);
            return 'subscribed';
          });
        },
      };

      console.log('[Newsletter API] Initialized via native preview configuration.');
      return dbAdapter;
    } catch (err: any) {
      console.error('[Newsletter API] Preview configuration initialization error:', err.message);
      return null;
    }
  }

  // 2. PRODUCTION RUNTIME (Vercel / External Serverless)
  // Requires secure server-side Firebase Admin SDK credentials.
  // Never falls back to client Web SDK if Admin configuration is absent or fails.
  const hasServiceAccount =
    Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_KEY) ||
    Boolean(process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY);

  const targetProjectId = process.env.FIREBASE_PROJECT_ID;
  const targetDatabaseId = process.env.FIREBASE_DATABASE_ID;

  if (!hasServiceAccount || !targetProjectId || !targetDatabaseId) {
    console.error(
      '[Newsletter API] Production configuration error: Missing required Firebase Admin credentials. Required in production: FIREBASE_SERVICE_ACCOUNT_KEY (or FIREBASE_CLIENT_EMAIL & FIREBASE_PRIVATE_KEY), FIREBASE_PROJECT_ID, and FIREBASE_DATABASE_ID.'
    );
    return null;
  }

  try {
    const { initializeApp: initAdminApp, getApps: getAdminApps, getApp: getAdminApp, cert } = await import(
      'firebase-admin/app'
    );
    const { getFirestore: getAdminFirestore } = await import('firebase-admin/firestore');

    let certConfig: any;
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      try {
        certConfig = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      } catch {
        certConfig = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
      }
    } else {
      certConfig = {
        projectId: targetProjectId,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
      };
    }

    const adminApp = !getAdminApps().length
      ? initAdminApp({
          credential: cert(certConfig),
          projectId: targetProjectId,
        })
      : getAdminApp();

    const adminDb = getAdminFirestore(adminApp, targetDatabaseId);

    dbAdapter = {
      async checkAndSaveSubscriber(docId, payload) {
        const docRef = adminDb.collection('newsletterSubscribers').doc(docId);
        return await adminDb.runTransaction(async (transaction: any) => {
          const snap = await transaction.get(docRef);
          if (snap.exists) {
            return 'already_subscribed';
          }
          transaction.set(docRef, payload);
          return 'subscribed';
        });
      },
    };

    console.log('[Newsletter API] Initialized via Firebase Admin SDK in production.');
    return dbAdapter;
  } catch (adminErr: any) {
    console.error('[Newsletter API] Production Firebase Admin SDK failed:', adminErr.message);
    // Strict requirement: Do not fall back to client Web SDK in production.
    return null;
  }
}

export default async function handler(req: Request, res: Response): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ ok: false, message: 'Method Not Allowed' });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }
  body = body || {};

  // 1. Honeypot check
  if (body.website && typeof body.website === 'string' && body.website.trim().length > 0) {
    res.status(201).json({
      ok: true,
      status: 'subscribed',
      message: 'Your signup has been recorded.',
    });
    return;
  }

  // 2. Email validation
  if (!body.email || typeof body.email !== 'string') {
    res.status(400).json({
      ok: false,
      status: 'invalid_input',
      message: 'Please provide a valid email address.',
    });
    return;
  }

  const normalizedEmail = body.email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (normalizedEmail.length < 5 || normalizedEmail.length > 255 || !emailRegex.test(normalizedEmail)) {
    res.status(400).json({
      ok: false,
      status: 'invalid_input',
      message: 'The email address format is invalid.',
    });
    return;
  }

  // 3. Explicit consent
  if (body.consent !== true) {
    res.status(400).json({
      ok: false,
      status: 'invalid_input',
      message: 'Explicit consent is required to receive independent study notes.',
    });
    return;
  }

  // 4. Optional First Name
  let cleanFirstName: string | null = null;
  if (body.firstName !== undefined && body.firstName !== null) {
    if (typeof body.firstName !== 'string' || body.firstName.trim().length > 80) {
      res.status(400).json({
        ok: false,
        status: 'invalid_input',
        message: 'First name must be 80 characters or fewer.',
      });
      return;
    }
    cleanFirstName = body.firstName.trim() || null;
  }

  // 5. Optional Interest
  let cleanInterest: string | null = null;
  if (body.interest !== undefined && body.interest !== null && body.interest !== '') {
    if (typeof body.interest !== 'string' || !ALLOWED_INTERESTS.includes(body.interest as any)) {
      res.status(400).json({
        ok: false,
        status: 'invalid_input',
        message: 'Selected topic interest is not recognized.',
      });
      return;
    }
    cleanInterest = body.interest;
  }

  // 6. Connect to database adapter
  const adapter = await getDatabaseAdapter();
  if (!adapter) {
    res.status(500).json({
      ok: false,
      status: 'server_error',
      message: 'Database service is currently unavailable.',
    });
    return;
  }

  // 7. Deterministic SHA-256 document ID & Transaction
  const docId = crypto.createHash('sha256').update(normalizedEmail).digest('hex');
  const now = new Date().toISOString();

  const payload: Record<string, unknown> = {
    email: normalizedEmail,
    consent: true,
    consentTextVersion: 'v1',
    source: 'why-practiced-community-page',
    createdAt: now,
    updatedAt: now,
  };

  if (cleanFirstName) payload.firstName = cleanFirstName;
  if (cleanInterest) payload.interest = cleanInterest;

  try {
    const outcome = await adapter.checkAndSaveSubscriber(docId, payload);

    if (outcome === 'already_subscribed') {
      res.status(200).json({
        ok: true,
        status: 'already_subscribed',
        message: 'This email is already registered on our independent study list.',
      });
      return;
    }

    res.status(201).json({
      ok: true,
      status: 'subscribed',
      message: 'Your interest has been recorded. Thank you for joining the practice.',
    });
  } catch (error: any) {
    console.error('[Newsletter API] Transaction failure occurred.');
    res.status(500).json({
      ok: false,
      status: 'server_error',
      message: 'Unable to record your signup right now. Please try again in a few moments.',
    });
  }
}
