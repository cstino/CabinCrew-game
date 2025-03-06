// src/client/index.js - Punto di ingresso principale
import { initAudioAndBonus } from './js/audioBonus-integration.js';
import { initAuth, checkAuth } from './js/authManager.js';
import './main.js';

// Assicurati che il DOM sia completamente caricato
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM caricato, inizializzazione componenti...');
  
  // Inizializza il gestore dell'autenticazione
  setTimeout(() => {
    initAuth();
    
    // Verifica se l'utente è già autenticato
    checkAuth();
    
    // Inizializza l'audio e i bonus
    initAudioAndBonus();
    
    console.log('Inizializzazione completata');
  }, 100); // Piccolo ritardo per assicurarsi che tutti gli elementi siano disponibili
});