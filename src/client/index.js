// src/client/index.js - Punto di ingresso principale
import { initAudioAndBonus } from './js/audioBonus-integration.js';
import './main.js';

// Inizializza l'audio e il sistema bonus
document.addEventListener('DOMContentLoaded', () => {
  initAudioAndBonus();
});