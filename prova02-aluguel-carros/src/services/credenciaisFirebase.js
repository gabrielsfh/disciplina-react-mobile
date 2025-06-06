// src/services/credenciaisFirebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD0NRuc4nRAvigeFbmGg8s0UrUsIkLJBTI",
  authDomain: "prova01-aluguel-carros-bfa1c.firebaseapp.com",
  projectId: "prova01-aluguel-carros-bfa1c",
  storageBucket: "prova01-aluguel-carros-bfa1c.firebasestorage.app",
  messagingSenderId: "907277531060",
  appId: "1:907277531060:web:795759e556c0d302b264e1"
};

// Inicializa o App
const appFirebase = initializeApp(firebaseConfig);

// **NOVO**: inicializa e exporta o Firestore
export const db = getFirestore(appFirebase);

// Mantém export default do App (útil caso queira)
export default appFirebase;
