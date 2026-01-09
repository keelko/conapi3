import { 
  getAuth, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup 
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import * as firebaseApp from "firebase/app";

/**
 * Configurazione ufficiale Co.N.A.P.I - Progetto: gen-lang-client-0996873855
 */
const firebaseConfig = {
  apiKey: "AIzaSyASQBMcg-4UHArzp8wFMDskg28YKADEDnc",
  authDomain: "gen-lang-client-0996873855.firebaseapp.com",
  projectId: "gen-lang-client-0996873855",
  storageBucket: "gen-lang-client-0996873855.firebasestorage.app",
  messagingSenderId: "691755222591",
  appId: "1:691755222591:web:c2bdc6af3059efde1c1a8a",
  measurementId: "G-7YS8KXP372"
};

// Inizializzazione sicura: controlla se l'app esiste già per evitare doppi avvii.
// Utilizziamo un cast a any per bypassare eventuali errori di definizione dei tipi di TypeScript
const { initializeApp, getApps, getApp } = firebaseApp as any;

const apps = getApps ? getApps() : [];
const app = apps.length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export {
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup
};