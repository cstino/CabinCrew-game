// audioBonus-integration.js
// File per integrare audio e bonus nel gioco esistente

import audioManager from './AudioManager.js';
import bonusSystem from './BonusSystem.js';

// Funzione per inizializzare l'audio e i bonus
export function initAudioAndBonus() {
  // Avvia la musica del menu all'inizio
  audioManager.playMenuMusic();
  
  // Aggiungi listener per gli eventi del gioco
  document.addEventListener('DOMContentLoaded', setupListeners);
}

function setupListeners() {
  // Elementi UI per i bonus
  const resurrectionBonus = document.getElementById('resurrection-bonus');
  const doubleMultiplierBonus = document.getElementById('double-multiplier-bonus');
  const shieldBonus = document.getElementById('shield-bonus');
  
  // Nascondi tutti i bonus all'inizio
  if (resurrectionBonus) resurrectionBonus.classList.add('hidden');
  if (doubleMultiplierBonus) doubleMultiplierBonus.classList.add('hidden');
  if (shieldBonus) shieldBonus.classList.add('hidden');
  
  // Listener per i cambi di schermata
  const screens = document.querySelectorAll('.screen');
  screens.forEach(screen => {
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.attributeName === 'class') {
          const isHidden = screen.classList.contains('hidden');
          handleScreenChange(screen.id, isHidden);
        }
      });
    });
    observer.observe(screen, { attributes: true });
  });
  
  // Evento countdown
  const countdownTimer = document.getElementById('countdown-timer');
  if (countdownTimer) {
    const observer = new MutationObserver(() => {
      if (!countdownTimer.classList.contains('hidden')) {
        // Se il countdown è visibile, controlla se è necessario riprodurre la musica del gioco
        const gameScreen = document.getElementById('game-room-screen');
        if (gameScreen && !gameScreen.classList.contains('hidden')) {
          // Riproduci musica casuale del gioco quando inizia un nuovo round
          audioManager.playRandomGameMusic();
        }
      }
    });
    observer.observe(countdownTimer, { attributes: true });
  }
}

// Gestione del cambio di schermata
function handleScreenChange(screenId, isHidden) {
  if (isHidden) return;
  
  switch(screenId) {
    case 'auth-screen':
    case 'lobby-screen':
    case 'profile-screen':
      // Riproduci musica del menu quando si torna alle schermate di menu
      audioManager.playMenuMusic();
      break;
    
    case 'game-room-screen':
      // La musica del gioco verrà avviata all'inizio del round
      // tramite l'evento del countdown
      break;
  }
}

// Funzioni per gestire i bonus in-game
export function updateBonusDisplay(player) {
  const resurrectionBonus = document.getElementById('resurrection-bonus');
  const doubleMultiplierBonus = document.getElementById('double-multiplier-bonus');
  const shieldBonus = document.getElementById('shield-bonus');
  
  // Nascondi tutti i bonus
  if (resurrectionBonus) resurrectionBonus.classList.add('hidden');
  if (doubleMultiplierBonus) doubleMultiplierBonus.classList.add('hidden');
  if (shieldBonus) shieldBonus.classList.add('hidden');
  
  // Mostra solo i bonus disponibili
  if (player && player.bonuses) {
    player.bonuses.forEach(bonus => {
      if (bonus.type === 'resurrection' && resurrectionBonus) {
        resurrectionBonus.classList.remove('hidden');
      } else if (bonus.type === 'doubleMultiplier' && doubleMultiplierBonus) {
        doubleMultiplierBonus.classList.remove('hidden');
      } else if (bonus.type === 'shield' && shieldBonus) {
        shieldBonus.classList.remove('hidden');
      }
    });
  }
}

// Funzione per mostrare il bonus assegnato dopo un round
export function displayBonusAward(bonusAwarded) {
  if (!bonusAwarded) return;
  
  const bonusAwardElement = document.getElementById('bonus-award');
  const bonusIconElement = document.getElementById('bonus-icon');
  const bonusNameElement = document.getElementById('bonus-name');
  
  if (bonusAwardElement && bonusIconElement && bonusNameElement) {
    bonusIconElement.textContent = bonusAwarded.icon;
    bonusNameElement.textContent = bonusAwarded.name;
    bonusAwardElement.classList.remove('hidden');
  }
}

// Funzione per applicare un bonus al giocatore
export function applyBonusToPlayer(player, bonusType) {
  return bonusSystem.applyBonus(player, bonusType);
}

// Funzione per calcolare vincite con bonus
export function calculateWinWithBonus(player, bet, multiplier) {
  return bonusSystem.calculateWinWithBonus(player, bet, multiplier);
}

// Oggetti e funzioni per l'esportazione
export { audioManager, bonusSystem };