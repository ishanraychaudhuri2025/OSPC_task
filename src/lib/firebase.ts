import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import {
  getAuth,
  browserLocalPersistence,
  setPersistence,
  GoogleAuthProvider,
} from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { initializeAppCheck, ReCaptchaEnterpriseProvider, type AppCheck } from 'firebase/app-check';

type PlatformFirebaseConfig = FirebaseOptions & { firestoreDatabaseId?: string };

// Google AI Studio may provide this file at runtime. It is intentionally not tracked
// by Git. Vercel deployments should use VITE_FIREBASE_* environment variables instead.
const platformConfigModules = import.meta.glob('../../firebase-applet-config.json', {
  eager: true,
  import: 'default',
}) as Record<string, PlatformFirebaseConfig>;

const platformConfig = Object.values(platformConfigModules)[0];
const env = import.meta.env;

const firebaseConfig: FirebaseOptions = {
  apiKey: env.VITE_FIREBASE_API_KEY || platformConfig?.apiKey,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || platformConfig?.authDomain || 'gen-lang-client-0825093002.firebaseapp.com',
  projectId: env.VITE_FIREBASE_PROJECT_ID || platformConfig?.projectId || 'gen-lang-client-0825093002',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || platformConfig?.storageBucket || 'gen-lang-client-0825093002.firebasestorage.app',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || platformConfig?.messagingSenderId || '459857114130',
  appId: env.VITE_FIREBASE_APP_ID || platformConfig?.appId || '1:459857114130:web:c5bc7d01512a85dcd014cb',
};

export const firestoreDatabaseId =
  env.VITE_FIREBASE_DATABASE_ID ||
  platformConfig?.firestoreDatabaseId ||
  'ai-studio-9a10e882-4e4e-4882-bc66-23bde83789c9';

export const firebaseConfigReady = Boolean(firebaseConfig.apiKey);

if (!firebaseConfigReady) {
  // Do not crash the whole React app when a deployment is missing configuration.
  // Auth/database operations will require a configured Firebase API key.
  console.error(
    '[Firebase Config] Missing VITE_FIREBASE_API_KEY and platform Firebase config. Configure the Firebase web app environment variables to enable auth and database operations.'
  );
}

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const appCheckSiteKey = env.VITE_FIREBASE_APP_CHECK_RECAPTCHA_ENTERPRISE_KEY?.trim();
let initializedAppCheck: AppCheck | null = null;

// App Check is optional until its score-based reCAPTCHA Enterprise key is configured.
// Register the same key in Firebase Console > Security > App Check before enforcing services.
if (typeof window !== 'undefined' && appCheckSiteKey) {
  try {
    initializedAppCheck = initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider(appCheckSiteKey),
      isTokenAutoRefreshEnabled: true,
    });
  } catch {
    // Avoid crashing the whole site if App Check is not registered/configured yet.
    console.error('[Firebase App Check] Initialization failed. Check the configured site key and Firebase App Check registration.');
  }
}

export const appCheck = initializedAppCheck;

export const auth = getAuth(app);

if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).catch(() => {
    console.warn('[Firebase Auth] Could not set local persistence. Check Firebase configuration.');
  });
}

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const db: Firestore = getFirestore(app, firestoreDatabaseId);

export default app;
