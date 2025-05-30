import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAS3LThTLlho1Y36f3FaXrU7vYMzfbaeiM",
  authDomain: "trabalhounipam.firebaseapp.com",
  projectId: "trabalhounipam",
  storageBucket: "trabalhounipam.appspot.com",
  messagingSenderId: "307082883690",
  appId: "1:307082883690:web:2fe035d2e69d7bb0a81013",
  measurementId: "G-0V8VJPKMK7"
};

const appFirebase = initializeApp(firebaseConfig);
const db = getFirestore(appFirebase);
const auth = initializeAuth(appFirebase);

export { appFirebase, db, auth };
