// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import { initializeFirestore } from 'firebase/firestore';
import { getFirestore } from "firebase/firestore";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAS3LThTLlho1Y36f3FaXrU7vYMzfbaeiM",
  authDomain: "trabalhounipam.firebaseapp.com",
  projectId: "trabalhounipam",
  storageBucket: "trabalhounipam.firebasestorage.app",
  messagingSenderId: "307082883690",
  appId: "1:307082883690:web:2fe035d2e69d7bb0a81013",
  measurementId: "G-0V8VJPKMK7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase
const db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
    useFetchStreams: false,
});

export { db };