import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App singleton safely
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Firebase Auth Service
export const auth = getAuth(app);

// Google Auth Provider configured for modern web/mobile
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Firestore Database Service with custom databaseId support
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);

export default app;
