// Firebase configuration
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCp5Rt67nkZ_DECiyyim3QuBC-Zgq6y1Dw",
  authDomain: "cabincrew-game.firebaseapp.com",
  projectId: "cabincrew-game",
  storageBucket: "cabincrew-game.firebasestorage.app",
  messagingSenderId: "525011831374",
  appId: "1:525011831374:web:ace85fdd1963f62485911f",
  measurementId: "G-6YSD9F2ZHQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);

export { auth, analytics };