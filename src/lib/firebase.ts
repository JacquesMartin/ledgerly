
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Only initialize Firebase in the browser to avoid server-side errors during prerender/build
const isBrowser = typeof window !== 'undefined';

const app = isBrowser ? (!getApps().length ? initializeApp(firebaseConfig) : getApp()) : (undefined as unknown as ReturnType<typeof initializeApp>);
const auth = isBrowser ? getAuth(app) : (undefined as unknown);
const db = isBrowser ? getFirestore(app) : (undefined as unknown);

export { app, auth, db };
