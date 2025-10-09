// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA2LJhtnqhlUsY0RsF-se23kmufOf8tFF4",
  authDomain: "cortex-dc-portal.firebaseapp.com",
  projectId: "cortex-dc-portal",
  storageBucket: "cortex-dc-portal.firebasestorage.app",
  messagingSenderId: "317661350023",
  appId: "1:317661350023:web:7c60a66c0adc40e1b2d022",
  measurementId: "G-76E2Q8HY0P"
};

// Initialize Firebase (only if it hasn't been initialized already)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics (only in browser environment)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;