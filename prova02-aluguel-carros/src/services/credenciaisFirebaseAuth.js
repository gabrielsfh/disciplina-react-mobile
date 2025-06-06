// src/services/credenciaisFirebaseAuth.js
import appFirebase from './credenciaisFirebase';
import { getAuth } from 'firebase/auth';

// Aqui usamos o entry-point “web” do Auth, totalmente compatível com Expo Go
const auth = getAuth(appFirebase);
export default auth;
