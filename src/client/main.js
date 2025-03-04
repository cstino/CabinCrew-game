// src/client/main.js
import { initializeSocketHandlers } from './utils/socketHandler.js';
import { setupAuthListeners } from './components/Auth.js';
import { setupLobbyListeners } from './components/GameRoom.js';
import { setupGameplayListeners } from './components/Gameplay.js';
import { setupProfileListeners } from './components/Profile.js';
import { setupChatListeners } from './components/Chat.js';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyA8TdGdbX6HDAyRSid7MMrDf0kzNqtUe3U',
  authDomain: 'cabincrew-aa740.firebaseapp.com',
  projectId: 'cabincrew-aa740',
  storageBucket: 'cabincrew-aa740.firebasestorage.app',
  messagingSenderId: '835219215914',
  appId: '1:835219215914:web:c2b5f16472053b67725553',
  measurementId: 'G-9XPK3JMETS',
};

// Initialize Firebase
console.log('Inizializzazione Firebase');
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Initialize Socket.IO
const socket = io();

// Initialize all components
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM caricato, inizializzazione componenti');

  // Initialize socket handlers
  initializeSocketHandlers(socket);

  // Setup UI components
  setupAuthListeners(socket, auth);
  setupLobbyListeners(socket);
  setupGameplayListeners(socket);
  setupProfileListeners();
  setupChatListeners(socket);

  // Show auth screen by default
  showScreen('auth-screen');

  console.log('Inizializzazione completata');
});

// Helper function to show a specific screen
function showScreen(screenId) {
  console.log('Cambio schermata a:', screenId);

  // Hide all screens
  document.querySelectorAll('.screen').forEach((screen) => {
    screen.classList.add('hidden');
  });

  // Show requested screen
  document.getElementById(screenId).classList.remove('hidden');
}

// Export helper functions for use in other modules
export { showScreen };
