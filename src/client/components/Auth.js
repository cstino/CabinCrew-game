// src/client/components/Auth.js
import { showScreen } from '../main.js';
import { signInAnonymously } from 'firebase/auth';

let currentUser = null;

function setupAuthListeners(socket, auth) {
  const authButton = document.getElementById('auth-button');
  const usernameInput = document.getElementById('username');

  // Aggiungi listener per il pulsante di login
  authButton.addEventListener('click', () => {
    const username = usernameInput.value.trim() || 'Guest';

    console.log('Tentativo di login anonimo con username:', username);

    // Usa login anonimo di Firebase, che non richiede email/password
    signInAnonymously(auth)
      .then((userCredential) => {
        console.log('Login anonimo riuscito:', userCredential.user.uid);
        handleSuccessfulAuth(userCredential.user, username, socket);
      })
      .catch((error) => {
        console.error('Errore login anonimo:', error);

        // Se anche l'accesso anonimo fallisce, usa un mock user
        console.log('Fallback su mock user');
        const mockUser = {
          uid: 'guest-' + Date.now(),
          email: 'guest@example.com',
          isAnonymous: true,
        };
        handleSuccessfulAuth(mockUser, username, socket);
      });
  });
}

function handleSuccessfulAuth(user, username, socket) {
  console.log('handleSuccessfulAuth chiamato con:', user.uid, username);

  currentUser = {
    uid: user.uid,
    email: user.email || 'anonymous',
    isAnonymous: user.isAnonymous || true,
    username: username,
  };

  // Store username in local storage for persistence
  localStorage.setItem('username', username);

  // Register with the socket server
  socket.emit('register', {
    uid: user.uid,
    username: username,
  });

  // Show the lobby
  showScreen('lobby-screen');

  console.log('Lobby mostrata');
}

function getCurrentUser() {
  return currentUser;
}

export { setupAuthListeners, getCurrentUser };
