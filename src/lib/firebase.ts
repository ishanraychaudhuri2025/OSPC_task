import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import {
  getAuth,
  browserLocalPersistence,
  setPersistence,
  GoogleAuthProvider,
} from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

type PlatformFirebaseConfig = FirebaseOptions & { firestoreDatabaseId?: string };

// Google AI Studio may inject this file locally. It is intentionally ignored by Git,
// so a clean GitHub/Vercel clone must use VITE_FIREBASE_* environment variables.
// import.meta.glob is optional: it returns an empty object when the file is absent.
const platformConfigModules = import.meta.glob('../../firebase-applet-config.json', {
  eager: true,
  import: 'default',
}) as Record<string, PlatformFirebaseConfig>;

const platformConfig = Object.values(platformConfigModules)[0];
const env = import.meta.env;

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || platformConfig?.apiKey,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || platformConfig?.authDomain,
  projectId: env.VITE_FIREBASE_PROJECT_ID || platformConfig?.projectId,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || platformConfig?.storageBucket,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || platformConfig?.messagingSenderId,
  appId: env.VITE_FIREBASE_APP_ID || platformConfig?.appId,
};

const firestoreDatabaseId =
  env.VITE_FIREBASE_DATABASE_ID || platformConfig?.firestoreDatabaseId;

const requiredConfig: Record<string, string | undefined> = {
  VITE_FIREBASE_API_KEY: firebaseConfig.apiKey,
  VITE_FIREBASE_AUTH_DOMAIN: firebaseConfig.authDomain,
  VITE_FIREBASE_PROJECT_ID: firebaseConfig.projectId,
  VITE_FIREBASE_STORAGE_BUCKET: firebaseConfig.storageBucket,
  VITE_FIREBASE_MESSAGING_SENDER_ID: firebaseConfig.messagingSenderId,
  VITE_FIREBASE_APP_ID: firebaseConfig.appId,
  VITE_FIREBASE_DATABASE_ID: firestoreDatabaseId,
};

const missingConfig = Object.entries(requiredConfig)
  .filter(([, value]) => !value)
  .map(([name]) => name);

if (missingConfig.length > 0) {
  throw new Error(
    `Firebase configuration is missing: ${missingConfig.join(', ')}. Configure these variables in the hosting environment.`
  );
}

const app = !getApps().length
  ? initializeApp(firebaseConfig as FirebaseOptions)
  : getApp();

export const auth = getAuth(app);

// Restore local browser session across reloads. Firebase Auth state is still
// observed by AuthContext; this persistence setting is not an authorization check.
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).catch(() => {
    console.warn('[Firebase Auth] Could not set local persistence.');
  });
}

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Connect to the configured named Firestore database.
export const db: Firestore = getFirestore(app, firestoreDatabaseId);

export default app;
