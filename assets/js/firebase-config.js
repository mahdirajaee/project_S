/**
 * Firebase Configuration
 * 
 * Initializes Firebase services for the application using Firebase SDK v9
 */

// Import the functions from Firebase SDKs
import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCQAsoHz5odF6bpDPvw2aU1RLOzH_9O5WE",
  authDomain: "signal-3da38.firebaseapp.com",
  projectId: "signal-3da38",
  storageBucket: "signal-3da38.firebasestorage.app",
  messagingSenderId: "5520556407",
  appId: "1:5520556407:web:6bb4c1c13cb5b635bb2172",
  measurementId: "G-MWPEYVYK28"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

// Set persistence to local
setPersistence(auth, browserLocalPersistence);

console.log('Firebase initialized successfully');

// Export the initialized services
export { app, auth, db, analytics };