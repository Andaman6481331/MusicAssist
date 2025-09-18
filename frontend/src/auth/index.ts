import { getAuthSafe } from './firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User
} from 'firebase/auth';

export function subscribeAuth(cb: (user: User | null) => void) {
  const auth = getAuthSafe();
  if (!auth) {
    // No Firebase config; treat as signed out
    cb(null);
    return () => {};
  }
  return onAuthStateChanged(auth, cb);
}

export async function loginWithEmail(email: string, password: string) {
  const auth = getAuthSafe();
  if (!auth) throw new Error('Auth not configured. Set VITE_FIREBASE_* env vars.');
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function signupWithEmail(email: string, password: string) {
  const auth = getAuthSafe();
  if (!auth) throw new Error('Auth not configured. Set VITE_FIREBASE_* env vars.');
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function logout() {
  const auth = getAuthSafe();
  if (!auth) return;
  await signOut(auth);
}



