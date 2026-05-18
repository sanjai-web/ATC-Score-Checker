import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDW-C_VQpl70k0s5znhaaTmneEimpe06_0",
  authDomain: "ats-checker-b089d.firebaseapp.com",
  projectId: "ats-checker-b089d",
  storageBucket: "ats-checker-b089d.firebasestorage.app",
  messagingSenderId: "780333332461",
  appId: "1:780333332461:web:606f665c4251c5840d59e4",
  measurementId: "G-7P2BFBH6Y2"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
