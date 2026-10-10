import type { Request, Response } from 'express';
import crypto from 'crypto';

type ActivityRecord = {
  id: string;
  title: string;
  status: string;
  createdAt: string | null;
  updatedAt: string | null;
  detail: string | null;
};

type AdminServices = {
  auth: any;
  db: any;
};

let cachedAdminServices: AdminServices | null = null;

function getText(data: Record<string, any>, keys: string[]): string | null {
  for (const key of keys) {
    const value = data[key];
    if (typeof value === 'string' && value.trim()) return value.trim().slice(0, 240);
  }
  return null;
}

function toIsoString(value: any): string | null {
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

function mapRecord(id: string, data: Record<string, any>, kind: 'subscription' | 'application' | 'waitlist'): ActivityRecord {
  const defaultTitle =
    kind === 'application' ? 'Application record' :
    kind === 'waitlist' ? 'Waitlist record' : 'Subscription';

  return {
    id,
    title: getText(data, ['title', 'name', 'program', 'listName', 'role', 'organization']) || defaultTitle,
    status: getText(data, ['status', 'state', 'stage']) || 'Recorded',
    createdAt: toIsoString(data.createdAt ?? data.submittedAt ?? data.appliedAt ?? data.joinedAt ?? data.requestedAt),
    updatedAt: toIsoString(data.updatedAt ?? data.lastUpdatedAt),
    detail: getText(data, ['description', 'details', 'interest', 'programName', 'organization', 'notes']),
  };
}

async function getAdminServices(): Promise<AdminServices> {
  if (cachedAdminServices) return cachedAdminServices;

  const projectId =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.VITE_FIREBASE_PROJECT_ID ||
    'gen-lang-client-0825093002';
  const databaseId =
    process.env.FIREBASE_DATABASE_ID ||
    process.env.VITE_FIREBASE_DATABASE_ID ||
    'ai-studio-9a10e882-4e4e-4882-bc66-23bde83789c9';

  const rawServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.trim();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.trim();

  if (!rawServiceAccount && !(clientEmail && privateKey)) {
    throw new Error('Firebase Admin credentials are not configured.');
  }

  const [{ initializeApp, getApps, cert }, { getAuth }, { getFirestore }] = await Promise.all([
    import('firebase-admin/app'),
    import('firebase-admin/auth'),
    import('firebase-admin/firestore'),
  ]);

  let credentialConfig: any;
  if (rawServiceAccount) {
    try {
      credentialConfig = JSON.parse(rawServiceAccount);
    } catch {
      throw new Error('Firebase service-account configuration is not valid JSON.');
    }
  } else {
    credentialConfig = {
      projectId,
      clientEmail,
      privateKey: privateKey!.replace(/\\n/g, '\n'),
    };
  }

  const existingApp = getApps().find((app: any) => app.name === '[DEFAULT]');
  const adminApp = existingApp || initializeApp({
    credential: cert(credentialConfig),
    projectId,
  });

  cachedAdminServices = {
    auth: getAuth(adminApp),
    db: getFirestore(adminApp, databaseId),
  };
  return cachedAdminServices;
}

async function readOwnRecords(db: any, uid: string, collectionName: 'subscriptions' | 'applications' | 'waitlist', kind: 'subscription' | 'application' | 'waitlist'): Promise<ActivityRecord[]> {
  // These records, if present, are stored under the authenticated owner's UID.
  // No UID or email is accepted from the browser.
  const snapshot = await db.collection('users').doc(uid).collection(collectionName).limit(30).get();
  return snapshot.docs.map((docSnap: any) => mapRecord(docSnap.id, docSnap.data() || {}, kind));
}

export default async function handler(req: Request, res: Response): Promise<void> {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ ok: false, message: 'Method Not Allowed' });
    return;
  }

  const authorization = req.headers.authorization;
  const match = typeof authorization === 'string' ? authorization.match(/^Bearer\s+(.+)$/i) : null;
  if (!match?.[1]) {
    res.status(401).json({ ok: false, message: 'Sign in to view your activity.' });
    return;
  }

  try {
    const { auth, db } = await getAdminServices();
    const decodedToken = await auth.verifyIdToken(match[1]);
    const uid = decodedToken.uid as string;
    const accountEmail = typeof decodedToken.email === 'string' ? decodedToken.email.trim().toLowerCase() : '';

    if (!uid || !accountEmail) {
      res.status(403).json({ ok: false, message: 'Your account needs an email address to match study-list records.' });
      return;
    }

    const subscriberId = crypto.createHash('sha256').update(accountEmail).digest('hex');
    const [subscriberDoc, otherSubscriptions, applications, waitlist] = await Promise.all([
      db.collection('newsletterSubscribers').doc(subscriberId).get(),
      readOwnRecords(db, uid, 'subscriptions', 'subscription'),
      readOwnRecords(db, uid, 'applications', 'application'),
      readOwnRecords(db, uid, 'waitlist', 'waitlist'),
    ]);

    const subscriptions: ActivityRecord[] = [];
    if (subscriberDoc.exists) {
      const subscriber = subscriberDoc.data() || {};
      subscriptions.push({
        id: 'notes-on-why',
        title: 'Notes on WHY',
        status: 'On the study list',
        createdAt: toIsoString(subscriber.createdAt),
        updatedAt: toIsoString(subscriber.updatedAt),
        detail: typeof subscriber.interest === 'string' && subscriber.interest.trim()
          ? 'Primary focus: ' + subscriber.interest.trim().slice(0, 120)
          : 'Independent study notes opt-in recorded.',
      });
    }
    subscriptions.push(...otherSubscriptions);

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
    // Log a generic diagnostic only; do not log the ID token, email, document content, or credentials.
    console.error('[Community Activity API] Could not load authenticated activity.', {
      code: typeof error?.code === 'string' ? error.code : 'unknown',
    });
    const authError = typeof error?.code === 'string' && error.code.startsWith('auth/');
    res.status(authError ? 401 : 503).json({
      ok: false,
      message: authError
        ? 'Your session could not be verified. Please sign in again.'
        : 'Your activity is temporarily unavailable. Please try again shortly.',
    });
  }
}
