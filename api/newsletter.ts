import type { Request, Response } from 'express';
import crypto from 'crypto';

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

  // All newsletter writes go through the server-side Admin SDK.
  // Never fall back to public-client Firestore writes from this API route.
  const hasServiceAccount =
    Boolean(process.env.FIREBASE_SERVICE_ACCOUNT_KEY) ||
    Boolean(process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY);

  // Project and database IDs are identifiers, not credentials. Fall back to the same
  // public Firebase configuration used by the working browser app so a missing duplicate
  // server-side variable cannot prevent newsletter writes. Admin credentials remain required.
  const targetProjectId =
    process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;
  const targetDatabaseId =
    process.env.FIREBASE_DATABASE_ID || process.env.VITE_FIREBASE_DATABASE_ID;

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


type RecaptchaCheck = { passed: boolean; skipped?: boolean; unavailable?: boolean };

const RECAPTCHA_ACTION = 'NEWSLETTER_SIGNUP';
const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 8;

/**
 * Best-effort per-instance throttling for serverless deployments.
 * Keep the bucket bounded; use a distributed limiter/Vercel Firewall for stronger guarantees.
 */
function enforceNewsletterRateLimit(req: Request, res: Response): boolean {
  const forwarded = req.headers['x-forwarded-for'];
  const forwardedIp = Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(',')[0];
  const key = (forwardedIp || req.ip || req.socket.remoteAddress || 'unknown').trim();
  const now = Date.now();
  let bucket = rateLimitBuckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS };
    rateLimitBuckets.set(key, bucket);
  } else if (bucket.count >= RATE_LIMIT_MAX_REQUESTS) {
    res.setHeader('Retry-After', String(Math.max(1, Math.ceil((bucket.resetAt - now) / 1000))));
    res.status(429).json({
      ok: false,
      status: 'rate_limited',
      message: 'Too many submissions. Please wait a few minutes and try again.',
    });
    return false;
  } else {
    bucket.count += 1;
  }

  if (rateLimitBuckets.size > 5000) {
    for (const [bucketKey, value] of rateLimitBuckets) {
      if (value.resetAt <= now) rateLimitBuckets.delete(bucketKey);
    }
  }
  return true;
}

function base64Url(value: string | Buffer): string {
  return Buffer.from(value).toString('base64url');
}

async function getGoogleCloudAccessToken(serviceAccountJson: string): Promise<string> {
  const account = JSON.parse(serviceAccountJson) as {
    client_email?: string;
    private_key?: string;
    token_uri?: string;
  };
  if (!account.client_email || !account.private_key) {
    throw new Error('Invalid service account configuration.');
  }

  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = base64Url(JSON.stringify({
    iss: account.client_email,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: account.token_uri || 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }));
  const unsignedAssertion = `${header}.${claims}`;
  const privateKey = account.private_key.replace(/\\n/g, '\n');
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(unsignedAssertion);
  signer.end();
  const signature = signer.sign(privateKey).toString('base64url');
  const assertion = `${unsignedAssertion}.${signature}`;

  const tokenResponse = await fetch(account.token_uri || 'https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });
  if (!tokenResponse.ok) throw new Error('Google Cloud authentication failed.');
  const tokenData = await tokenResponse.json() as { access_token?: string };
  if (!tokenData.access_token) throw new Error('Google Cloud returned no access token.');
  return tokenData.access_token;
}

async function verifyRecaptchaEnterprise(req: Request, token: unknown): Promise<RecaptchaCheck> {
  const projectId = process.env.RECAPTCHA_ENTERPRISE_PROJECT_ID;
  // Verify with the exact site key used by the browser to mint the token.
  // The server-only alias is a fallback for deployments that do not expose the VITE variable at runtime.
  const siteKey = process.env.VITE_RECAPTCHA_ENTERPRISE_SITE_KEY || process.env.RECAPTCHA_ENTERPRISE_SITE_KEY;
  const serviceAccountJson = process.env.RECAPTCHA_ENTERPRISE_SERVICE_ACCOUNT_KEY;
  const required = process.env.RECAPTCHA_ENTERPRISE_REQUIRED === 'true';
  const explicitlyDisabled = process.env.RECAPTCHA_ENTERPRISE_REQUIRED === 'false';
  const anyConfiguration = Boolean(projectId || siteKey || serviceAccountJson);

  if (explicitlyDisabled) return { passed: true, skipped: true };
  if (!required && !anyConfiguration) return { passed: true, skipped: true };

  // Once any Enterprise setting is present, require complete configuration and fail closed.
  if (!projectId || !siteKey || !serviceAccountJson) {
    return { passed: false, unavailable: true };
  }
  if (typeof token !== 'string' || token.length < 20 || token.length > 10_000) {
    return { passed: false };
  }

  try {
    const accessToken = await getGoogleCloudAccessToken(serviceAccountJson);
    const assessmentResponse = await fetch(
      `https://recaptchaenterprise.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/assessments`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: {
            token,
            siteKey,
            expectedAction: RECAPTCHA_ACTION,
            userAgent: typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : '',
          },
        }),
      },
    );
    if (!assessmentResponse.ok) {
      console.error(
        '[Newsletter API] reCAPTCHA Enterprise assessment returned HTTP %d.',
        assessmentResponse.status
      );
      return { passed: false, unavailable: true };
    }

    const assessment = await assessmentResponse.json() as {
      tokenProperties?: { valid?: boolean; action?: string };
      riskAnalysis?: { score?: number };
    };
    const tokenProperties = assessment.tokenProperties;
    const score = assessment.riskAnalysis?.score;
    const parsedThreshold = Number(process.env.RECAPTCHA_ENTERPRISE_MIN_SCORE ?? '0.5');
    const minimumScore = Number.isFinite(parsedThreshold)
      ? Math.max(0, Math.min(1, parsedThreshold))
      : 0.5;
    const tokenValid = tokenProperties?.valid === true;
    const actionMatches = tokenProperties?.action === RECAPTCHA_ACTION;
    const scoreAccepted = typeof score === 'number' && score >= minimumScore;

    if (!tokenValid || !actionMatches || !scoreAccepted) {
      // Safe diagnostic metadata only; never log the token, email, site key, or credentials.
      console.warn('[Newsletter API] reCAPTCHA token rejected.', {
        tokenValid,
        actionMatches,
        scorePresent: typeof score === 'number',
        scoreAccepted,
      });
    }

    return {
      passed: tokenValid && actionMatches && scoreAccepted,
    };
  } catch {
    // Never log tokens, service-account credentials, access tokens, or raw API responses.
    return { passed: false, unavailable: true };
  }
}

export default async function handler(req: Request, res: Response): Promise<void> {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ ok: false, message: 'Method Not Allowed' });
    return;
  }

  if (!enforceNewsletterRateLimit(req, res)) return;

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

  // 6. Verify reCAPTCHA Enterprise when configured. Server credentials remain in env only.
  const recaptcha = await verifyRecaptchaEnterprise(req, body.recaptchaToken);
  if (!recaptcha.passed) {
    res.status(recaptcha.unavailable ? 503 : 403).json({
      ok: false,
      status: recaptcha.unavailable ? 'verification_unavailable' : 'verification_failed',
      message: recaptcha.unavailable
        ? 'Anti-abuse verification is temporarily unavailable. Please try again shortly.'
        : 'Verification could not be completed. Please refresh the page and try again.',
    });
    return;
  }

  // 7. Connect to database adapter
  const adapter = await getDatabaseAdapter();
  if (!adapter) {
    res.status(500).json({
      ok: false,
      status: 'server_error',
      message: 'Database service is currently unavailable.',
    });
    return;
  }

  // 8. Deterministic SHA-256 document ID & Transaction
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
