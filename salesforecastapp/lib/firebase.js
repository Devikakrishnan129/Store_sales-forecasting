// src/lib/firebase.js

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Your web app's Firebase configuration
// These are now populated with your provided credentials.
// For production, consider using environment variables for security.
const firebaseConfig = {
  apiKey: "AIzaSyCH-xeReUMOnZnFgs1yNP7GlnkHed3_PDY",
  authDomain: "compact-pier-455918-s1.firebaseapp.com",
  projectId: "compact-pier-455918-s1",
  storageBucket: "compact-pier-455918-s1.firebasestorage.app",
  messagingSenderId: "581739237265",
  appId: "1:581739237265:web:b705195ca62de7bc635430"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize Google Auth Provider
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
