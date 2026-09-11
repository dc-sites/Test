// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDAmDO7bqtDKaE7ALi8HwqLU-ibIkpir4A",
    authDomain: "sciencelab-9f2b7.firebaseapp.com",
    projectId: "sciencelab-9f2b7",
    storageBucket: "sciencelab-9f2b7.firebasestorage.app",
    messagingSenderId: "838123936919",
    appId: "1:838123936919:web:b32270c89a9127c4739dd2",
    measurementId: "G-PBE0VLK57X"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
