import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCA_DItxKAHtqUPmbPZ9HBv6tCMXPC-7vs",
  authDomain: "money-tracker-app-292e6.firebaseapp.com",
  databaseURL: "https://money-tracker-app-292e6-default-rtdb.firebaseio.com",
  projectId: "money-tracker-app-292e6",
  storageBucket: "money-tracker-app-292e6.firebasestorage.app",
  messagingSenderId: "587436978359",
  appId: "1:587436978359:web:ec416966d20f246b301d32"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);