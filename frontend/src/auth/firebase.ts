import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;

export function getAuthSafe() {
  if (authInstance) return authInstance;

  const firebaseConfig = {
    apiKey: String(import.meta.env.VITE_FIREBASE_API_KEY || '').trim(),
    authDomain: String(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '').trim(),
    projectId: String(import.meta.env.VITE_FIREBASE_PROJECT_ID || '').trim(),
    storageBucket: String(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '').trim(),
    messagingSenderId: String(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '').trim(),
    appId: String(import.meta.env.VITE_FIREBASE_APP_ID || '').trim(),
  } as const;

  if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId || !firebaseConfig.appId) {
    console.warn('Firebase config missing. Set VITE_FIREBASE_* environment variables.');
    return null;
  }

  try {
    if (import.meta.env.DEV) {
      console.debug('Firebase config check', {
        apiKeyPrefix: String(firebaseConfig.apiKey).slice(0, 6),
        authDomain: firebaseConfig.authDomain,
        projectId: firebaseConfig.projectId,
        appIdPrefix: String(firebaseConfig.appId).slice(0, 6),
      });
    }
    appInstance = initializeApp(firebaseConfig);
    authInstance = getAuth(appInstance);
    setPersistence(authInstance, browserLocalPersistence);
    return authInstance;
  } catch (e) {
    console.error('Failed to initialize Firebase', e);
    return null;
  }
}

export function getDbSafe() {
  if (dbInstance) return dbInstance;
  // Ensure app is initialized
  if (!appInstance) {
    // call getAuthSafe to bootstrap config/app
    const auth = getAuthSafe();
    if (!auth) return null;
  }
  try {
    if (!appInstance) return null;
    dbInstance = getFirestore(appInstance);
    return dbInstance;
  } catch (e) {
    console.error('Failed to initialize Firestore', e);
    return null;
  }
}


