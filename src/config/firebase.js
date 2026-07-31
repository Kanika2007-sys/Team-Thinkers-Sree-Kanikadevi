import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC_lKtLl9acrO8yUToQ-wgi6ZPw2p1TWTU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "civic-one-25608.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "civic-one-25608",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "civic-one-25608.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "112726892056",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:112726892056:web:e1bb5495925f801c656d6d"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
