// Firebase configuration
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore, doc, getDoc, setDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';

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
let analytics = null;

// Inizializza analytics solo se in un browser che lo supporta
try {
  analytics = getAnalytics(app);
} catch (e) {
  console.warn('Analytics non supportato in questo ambiente:', e);
}

const db = getFirestore(app);

// Funzione per verificare se un username è già in uso
async function isUsernameAvailable(username) {
  try {
    // Cerca username nella collezione usernames
    const usernamesRef = collection(db, 'usernames');
    const q = query(usernamesRef, where('username', '==', username));
    const querySnapshot = await getDocs(q);
    
    // Se non ci sono documenti, l'username è disponibile
    return querySnapshot.empty;
  } catch (error) {
    console.error('Errore nel verificare l\'username:', error);
    // In caso di errore, assumiamo che l'username sia disponibile
    // (meglio permettere la modifica che bloccarla per un errore tecnico)
    return true;
  }
}

// Funzione per riservare un username
async function reserveUsername(userId, username) {
  try {
    // Salva l'username nella collezione usernames
    await setDoc(doc(db, 'usernames', username), {
      userId: userId,
      username: username,
      createdAt: new Date()
    });
    
    // Aggiorna anche il profilo utente
    await setDoc(doc(db, 'users', userId), {
      username: username,
      updatedAt: new Date()
    }, { merge: true });
    
    return true;
  } catch (error) {
    console.error('Errore nel salvare l\'username:', error);
    return false;
  }
}

// Funzione per aggiornare l'username di un utente
async function updateUsername(userId, oldUsername, newUsername) {
  try {
    // Verifica prima se il nuovo username è disponibile
    const isAvailable = await isUsernameAvailable(newUsername);
    if (!isAvailable) {
      return {
        success: false, 
        error: 'Username già in uso da un altro utente'
      };
    }
    
    // Se disponibile, elimina la vecchia prenotazione
    if (oldUsername) {
      try {
        // Proviamo a eliminare il vecchio username
        // ma procediamo anche se fallisce
        await deleteDoc(doc(db, 'usernames', oldUsername));
      } catch (e) {
        console.warn('Impossibile eliminare il vecchio username:', e);
      }
    }
    
    // Riserva il nuovo username
    const reserved = await reserveUsername(userId, newUsername);
    if (!reserved) {
      return {
        success: false,
        error: 'Errore nel salvare il nuovo username'
      };
    }
    
    return {
      success: true
    };
  } catch (error) {
    console.error('Errore nell\'aggiornare l\'username:', error);
    return {
      success: false,
      error: 'Errore di sistema: ' + error.message
    };
  }
}

export { auth, analytics, db, isUsernameAvailable, reserveUsername, updateUsername };