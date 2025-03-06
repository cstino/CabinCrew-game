// src/client/index.js - Punto di ingresso principale
import { initAudioAndBonus } from './js/audioBonus-integration.js';
import { initAuth, checkAuth } from './js/authManager.js';
import './main.js';

// Inizializza l'audio, il sistema bonus e l'autenticazione
document.addEventListener('DOMContentLoaded', () => {
  // Inizializza il gestore dell'autenticazione
  initAuth();
  
  // Verifica se l'utente è già autenticato
  checkAuth();
  
  // Inizializza l'audio e i bonus
  initAudioAndBonus();
});