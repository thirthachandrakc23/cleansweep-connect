import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDgLS1eazXdFhB4AVOTqxKCdHg1tqtZxHk",
  authDomain: "cleansweep-connect-637c7.firebaseapp.com",
  projectId: "cleansweep-connect-637c7",
  storageBucket: "cleansweep-connect-637c7.firebasestorage.app",
  messagingSenderId: "547354875333",
  appId: "1:547354875333:web:6ce5a73d5c17bab2bea7ac"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);