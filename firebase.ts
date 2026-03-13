
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDCAsix4f2qWmdzgZZ8FrW8xQUAxgyShIQ",
  authDomain: "complexe-connect.firebaseapp.com",
  projectId: "complexe-connect",
  storageBucket: "complexe-connect.firebasestorage.app",
  messagingSenderId: "99823311011",
  appId: "1:99823311011:web:37281b37f10a13b43a8716",
  measurementId: "G-R6K7TGLNRB"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
// Analytics only works in browser and might fail in some environments, so we wrap it
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
