
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDCAsix4f2qWmdzgZZ8FrW8xQUAxgyShIQ",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "complexe-connect.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "complexe-connect",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "complexe-connect.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "99823311011",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:99823311011:web:37281b37f10a13b43a8716",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-R6K7TGLNRB"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
// Analytics only works in browser and might fail in some environments, so we wrap it
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
