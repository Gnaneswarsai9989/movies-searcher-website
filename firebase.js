// Import Firebase core
import { initializeApp } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

// Import Auth
import { getAuth, GoogleAuthProvider } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// 🔥 Import Firestore (THIS WAS MISSING)
import { getFirestore } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBZpulyfMz8n7W_X5P_rzrghGVTGMfvLbM",
  authDomain: "cinefy-3b9a6.firebaseapp.com",
  projectId: "cinefy-3b9a6",
  storageBucket: "cinefy-3b9a6.firebasestorage.app",
  messagingSenderId: "870365897728",
  appId: "1:870365897728:web:e6030c6e17f43bbe13a4e5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Export Auth
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

// ✅ Export Firestore (THIS FIXES EVERYTHING)
export const db = getFirestore(app);