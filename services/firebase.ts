
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace with your actual Firebase Configuration
// You can get this from the Firebase Console -> Project Settings -> General -> Your Apps
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "REPLACE_WITH_YOUR_API_KEY",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "your-app.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "your-app-id",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "your-app.appspot.com",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.FIREBASE_APP_ID || "1:123456789:web:abcdef"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
