import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase, } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD_S0BqbTwy1KJ9293SWLo7aN-xZn_eNfc",
    authDomain: "rapidcrashdetection.firebaseapp.com",
    projectId: "rapidcrashdetection",
    storageBucket: "rapidcrashdetection.appspot.com",
    messagingSenderId: "573557243737",
    appId: "1:573557243737:web:476c2fe7f3882008f15648"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export const storage = getStorage(app);
export const db = getFirestore(app)