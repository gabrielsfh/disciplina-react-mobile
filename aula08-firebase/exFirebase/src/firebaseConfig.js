// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries]

import { initializeFirestore } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB3IxILohW9m6Ht98x2sQvS6-7glYscQ8E",
  authDomain: "aula-5e1fb.firebaseapp.com",
  databaseURL: "https://aula-5e1fb-default-rtdb.firebaseio.com",
  projectId: "aula-5e1fb",
  storageBucket: "aula-5e1fb.firebasestorage.app",
  messagingSenderId: "542620278083",
  appId: "1:542620278083:web:2881f9186ca1547ba7e3f6",
  measurementId: "G-N9003M177M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


const db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
    useFetchStreams: false,

})
const analytics = getAnalytics(app);