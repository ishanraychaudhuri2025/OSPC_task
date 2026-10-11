import type { Request, Response } from 'express';
import crypto from 'crypto';

const ALLOWED_INTERESTS = ['Purpose', 'Leadership', 'Trust & Teams', 'Infinite Mindset'] as const;

type ActivityRecord = {
  id: string;
  title: string;
  status: string;
  createdAt: string | null;
  updatedAt: string | null;
  detail: string | null;
};

type UserActivityDocument = { id: string; data: Record<string, unknown> };

interface DatabaseAdapter {
  checkAndSaveSubscriber: (
    docId: string,
    payload: Record<string, unknown>
  ) => Promise<'subscribed' | 'already_subscribed'>;
  verifyIdToken: (token: string) => Promise<{ uid: string; email?: string }>;
  getSubscriberByDocId: (docId: string) => Promise<Record<string, unknown> | null>;
  getUserActivity: (uid: string, collectionName: 'subscriptions' | 'applications' | 'waitlist') => Promise<UserActivityDocument[]>;
}

function activityDateToIso(value: any): string | null {
  if (!value) return null;
  try {
    if (typeof value === 'string' || value instanceof Date) {
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? null : date.toISOString();
    }
    if (typeof value.toDate === 'function') {
      const date = value.toDate();
      return date instanceof Date && !Number.isNaN(date.getTime()) ? date.toISOString() : null;
    }
    if (typeof value.seconds === 'number') {
      return new Date(value.seconds * 1000).toISOString();
    }
  } catch {
    return null;
  }
  return null;
}

function activityText(data: Record<string, any>, keys: string[]): string | null {
  for (const key of keys) {
    const value = data[key];
    if (typeof value === 'string' && value.trim()) return value.trim().slice(0, 240);
  }
  return null;
}

function mapActivityRecord(id: string, data: Record<string, any>, kind: 'subscription' | 'application' | 'waitlist'): ActivityRecord {
  const defaultTitle = kind === 'application' ? 'Application record'
    : kind === 'waitlist' ? 'Waitlist record' : 'Subscription';
  return {
    id,
    title: activityText(data, ['title', 'name', 'program', 'listName', 'role', 'organization']) || defaultTitle,
    status: activityText(data, ['status', 'state', 'stage']) || 'Recorded',
    createdAt: activityDateToIso(data.createdAt ?? data.submittedAt ?? data.appliedAt ?? data.joinedAt ?? data.requestedAt),
    updatedAt: activityDateToIso(data.updatedAt ?? data.lastUpdatedAt),
    detail: activityText(data, ['description', 'details', 'interest', 'programName', 'organization', 'notes']),
  };
}

let dbAdapter: DatabaseAdapter | null = null;
let dbAdapterFailureDiagnostic: string | null = null;

function safeDiagnosticCode(error: any): string {
  const candidate = typeof error?.code === 'string'
    ? error.code
    : typeof error?.name === 'string'
      ? error.name
      : 'UNKNOWN';
  return candidate.toUpperCase().replace(/[^A-Z0-9_-]/g, '_').slice(0, 48) || 'UNKNOWN';
}

function parseServiceAccount(rawValue: string): Record<string, unknown> {
  const raw = rawValue.trim();
  const candidates = [raw];

  // Some environment managers store the JSON as a quoted string. If so,
  // try its contents as well as the raw representation.
  try {
    const topLevel: unknown = JSON.parse(raw);
    if (typeof topLevel === 'string') {
      candidates.push(topLevel);
    } else if (topLevel && typeof topLevel === 'object') {
      const config = topLevel as Record<string, unknown>;
      if (typeof config.client_email === 'string' && typeof config.private_key === 'string') {
        config.private_key = config.private_key.replace(/\\n/g, '\n');
        return config;
      }
    }
  } catch {
    // Continue with plain/base64 candidates.
  }

  // Also accept base64-encoded JSON if the user stored that representation.
  try {
    const decoded = Buffer.from(raw, 'base64').toString('utf8').trim();
    if (decoded && decoded !== raw) candidates.push(decoded);
  } catch {
    // Try other candidates.
  }

  for (const candidate of candidates) {
    try {
      let parsed: unknown = JSON.parse(candidate);
      if (typeof parsed === 'string') parsed = JSON.parse(parsed);
      if (!parsed || typeof parsed !== 'object') continue;

      const config = parsed as Record<string, unknown>;
      if (typeof config.client_email !== 'string' || typeof config.private_key !== 'string') continue;

      config.private_key = config.private_key.replace(/\\n/g, '\n');
      return config;
    } catch {
      // Try next representation.
    }
  }

  const error = new Error('Firebase service-account JSON is invalid.') as Error & { code?: string };
  error.code = 'SERVICE_ACCOUNT_JSON_INVALID';
  throw error;
}

async function getDatabaseAdapter(): Promise<DatabaseAdapter | null> {
  if (dbAdapter) return dbAdapter;

  dbAdapterFailureDiagnostic = null;
  const rawServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.trim();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.trim();
  const hasServiceAccountKey = Boolean(rawServiceAccount);
  const hasSplitServiceAccount = Boolean(clientEmail && privateKey);

  const targetProjectId =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.VITE_FIREBASE_PROJECT_ID ||
    'gen-lang-client-0825093002';
  const targetDatabaseId =
    process.env.FIREBASE_DATABASE_ID ||
    process.env.VITE_FIREBASE_DATABASE_ID ||
    'ai-studio-9a10e882-4e4e-4882-bc66-23bde83789c9';

  if (!hasServiceAccountKey && !hasSplitServiceAccount) {
    dbAdapterFailureDiagnostic = 'FIREBASE_ADMIN_CREDENTIALS_MISSING';
    console.error('[Newsletter API] Firebase Admin credentials are missing.', {
      hasFirebaseServiceAccountKey: hasServiceAccountKey,
      hasFirebaseClientEmail: Boolean(clientEmail),
      hasFirebasePrivateKey: Boolean(privateKey),
      hasProjectId: Boolean(targetProjectId),
      hasDatabaseId: Boolean(targetDatabaseId),
    });
    return null;
  }

  try {
    const [
      { initializeApp: initAdminApp, getApps: getAdminApps, cert },
      { getFirestore: getAdminFirestore },
      { getAuth: getAdminAuth },
    ] = await Promise.all([
      import('firebase-admin/app'),
      import('firebase-admin/firestore'),
      import('firebase-admin/auth'),
    ]);

    let certConfig: Record<string, unknown>;
    if (rawServiceAccount) {
      certConfig = parseServiceAccount(rawServiceAccount);
    } else {
      certConfig = {
        projectId: targetProjectId,
        clientEmail,
        privateKey: privateKey!.replace(/\\n/g, '\n'),
      };
    }

    const defaultApp = getAdminApps().find((app: any) => app.name === '[DEFAULT]');
    const adminApp = defaultApp || initAdminApp({
      credential: cert(certConfig),
      projectId: targetProjectId,
    });

    const adminDb = getAdminFirestore(adminApp, targetDatabaseId);
    const adminAuth = getAdminAuth(adminApp);

    dbAdapter = {
      async checkAndSaveSubscriber(docId, payload) {
        const docRef = adminDb.collection('newsletterSubscribers').doc(docId);
        return await adminDb.runTransaction(async (transaction: any) => {
          const snap = await transaction.get(docRef);
          if (snap.exists) return 'already_subscribed';
          transaction.set(docRef, payload);
          return 'subscribed';
        });
      },
      async verifyIdToken(token) {
        const decoded = await adminAuth.verifyIdToken(token);
        return { uid: decoded.uid, email: decoded.email };
      },
      async getSubscriberByDocId(docId) {
        const snap = await adminDb.collection('newsletterSubscribers').doc(docId).get();
        return snap.exists ? (snap.data() as Record<string, unknown>) : null;
      },
      async getUserActivity(uid, collectionName) {
        const snap = await adminDb.collection('users').doc(uid).collection(collectionName).limit(30).get();
        return snap.docs.map((item: any) => ({
          id: item.id,
          data: (item.data() || {}) as Record<string, unknown>,
        }));
      },
    };

    dbAdapterFailureDiagnostic = null;
    console.log('[Newsletter API] Firebase Admin adapter initialized.', {
      projectIdConfigured: Boolean(targetProjectId),
      databaseIdConfigured: Boolean(targetDatabaseId),
      serviceAccountSource: hasServiceAccountKey ? 'FIREBASE_SERVICE_ACCOUNT_KEY' : 'split_environment_variables',
    });
    return dbAdapter;
  } catch (adminErr: any) {
    const diagnostic = safeDiagnosticCode(adminErr);
    dbAdapterFailureDiagnostic = diagnostic === 'SERVICE_ACCOUNT_JSON_INVALID'
      ? 'FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON_INVALID'
      : `FIREBASE_ADMIN_INITIALIZATION_FAILED_${diagnostic}`;
    console.error('[Newsletter API] Firebase Admin initialization failed.', {
      diagnostic: dbAdapterFailureDiagnostic,
      serviceAccountKeyPresent: hasServiceAccountKey,
      splitServiceAccountPresent: hasSplitServiceAccount,
      projectIdConfigured: Boolean(targetProjectId),
      databaseIdConfigured: Boolean(targetDatabaseId),
    });
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
  // Private activity reads share the same Admin SDK/database adapter as newsletter writes.
  // This keeps credential initialization identical to the already-working signup route.
  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 'private, no-store, max-age=0');
    const authorization = req.headers.authorization;
    const match = typeof authorization === 'string' ? authorization.match(/^Bearer\s+(.+)$/i) : null;
    if (!match?.[1]) {
      res.status(401).json({ ok: false, message: 'Sign in to view your activity.' });
      return;
    }

    const adapter = await getDatabaseAdapter();
    if (!adapter) {
      res.status(503).json({
        ok: false,
        diagnostic: dbAdapterFailureDiagnostic || 'FIREBASE_ADMIN_ADAPTER_UNAVAILABLE',
        message: 'Your activity service is temporarily unavailable. Please try again shortly.',
      });
      return;
    }

    let identity: { uid: string; email?: string };
    try {
      identity = await adapter.verifyIdToken(match[1]);
    } catch {
      res.status(401).json({
        ok: false,
        diagnostic: 'SESSION_VERIFICATION_FAILED',
        message: 'Your session could not be verified. Please sign in again.',
      });
      return;
    }

    const uid = identity.uid;
    const accountEmail = typeof identity.email === 'string' ? identity.email.trim().toLowerCase() : '';
    if (!uid || !accountEmail) {
      res.status(403).json({
        ok: false,
        diagnostic: 'ACCOUNT_EMAIL_MISSING',
        message: 'Your account needs an email address to match study-list records.',
      });
      return;
    }

    try {
      const subscriberId = crypto.createHash('sha256').update(accountEmail).digest('hex');
      // The Notes on WHY record is the primary status. Optional user activity collections
      // are read independently so one missing/unavailable collection cannot hide it.
      const subscriber = await adapter.getSubscriberByDocId(subscriberId);
      const readOptional = async (collectionName: 'subscriptions' | 'applications' | 'waitlist') => {
        try {
          return await adapter!.getUserActivity(uid, collectionName);
        } catch (optionalError: any) {
          console.warn('[Newsletter API] Optional activity list unavailable.', {
            collection: collectionName,
            code: typeof optionalError?.code === 'string' ? optionalError.code : 'unknown',
          });
          return [];
        }
      };
      const [subscriptionDocs, applicationDocs, waitlistDocs] = await Promise.all([
        readOptional('subscriptions'),
        readOptional('applications'),
        readOptional('waitlist'),
      ]);

      const subscriptions: ActivityRecord[] = [];
      if (subscriber) {
        subscriptions.push({
          id: 'notes-on-why',
          title: 'Notes on WHY',
          status: 'On the study list',
          createdAt: activityDateToIso((subscriber as any).createdAt),
          updatedAt: activityDateToIso((subscriber as any).updatedAt),
          detail: typeof (subscriber as any).interest === 'string' && (subscriber as any).interest.trim()
            ? 'Primary focus: ' + (subscriber as any).interest.trim().slice(0, 120)
            : 'Independent study notes opt-in recorded.',
        });
      }
      subscriptions.push(...subscriptionDocs.map((record) => mapActivityRecord(record.id, record.data as any, 'subscription')));
      const applications = applicationDocs.map((record) => mapActivityRecord(record.id, record.data as any, 'application'));
      const waitlist = waitlistDocs.map((record) => mapActivityRecord(record.id, record.data as any, 'waitlist'));

      res.status(200).json({
        ok: true,
        accountEmail,
        subscriptions,
        applications,
        waitlist,
        emailDeliveryEnabled: false,
        activityUpdatedAt: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error('[Newsletter API] Authenticated activity lookup failed.', {
        code: typeof error?.code === 'string' ? error.code : 'unknown',
      });
      res.status(503).json({
        ok: false,
        diagnostic: 'ACTIVITY_RECORD_LOOKUP_FAILED',
        message: 'Your subscription status could not be retrieved right now. Please refresh and try again.',
      });
    }
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
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
