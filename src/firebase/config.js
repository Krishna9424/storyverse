import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAOaeuYCwj-Qh1ZZkYttpnWvT21nPT5NxM",
  authDomain: "storyverse-6a54d.firebaseapp.com",
  projectId: "storyverse-6a54d",
  storageBucket: "storyverse-6a54d.firebasestorage.app",
  messagingSenderId: "405764371054",
  appId: "1:405764371054:web:58a4a6f9c876c36f3aac7f",
};

const app = initializeApp(firebaseConfig);

// Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
