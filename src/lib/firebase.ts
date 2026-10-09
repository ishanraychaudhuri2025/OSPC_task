import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  browserLocalPersistence,
  setPersistence,
  GoogleAuthProvider,
} from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import appletConfig from '../../firebase-applet-config.json';

// Use environment variables if provided (e.g., on Vercel),
// otherwise use the native platform-provided configuration from firebase-applet-config.json.
// No credentials or API keys are hard-coded in source code.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || appletConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || appletConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || appletConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || appletConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || appletConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || appletConfig.appId,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || appletConfig.firestoreDatabaseId,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);

// Configure local session persistence to prevent sign-out on refresh
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).catch((err) => {
    console.warn('[Firebase Auth] Persistence warning:', err);
  });
}

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Explicitly connect to the intended Firestore database instance
export const db: Firestore = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export default app;
