// src/services/credenciaisFirebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAS3LThTLlho1Y36f3FaXrU7vYMzfbaeiM",
  authDomain: "trabalhounipam.firebaseapp.com",
  projectId: "trabalhounipam",
  storageBucket: "trabalhounipam.firebasestorage.app",
  messagingSenderId: "307082883690",
  appId: "1:307082883690:web:2fe035d2e69d7bb0a81013",
  measurementId: "G-0V8VJPKMK7"
};


// Inicializa o App
const appFirebase = initializeApp(firebaseConfig);

// **NOVO**: inicializa e exporta o Firestore
export const db = getFirestore(appFirebase);

// Mantém export default do App (útil caso queira)
export default appFirebase;
