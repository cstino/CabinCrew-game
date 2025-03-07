// src/client/components/Gameplay.js
import { updateMultiplierAnimation } from '../utils/animations.js';
import { getCurrentUser } from './Auth.js';
import badgeManager from '../js/badgeManager.js';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../js/firebaseConfig.js';

// Track game stats for the current session
let currentGameStats = {
  multiplier: 0,
  isWinner: false
};

function setupGameplayListeners(socket) {
  const readyButton = document.getElementById('ready-button');
  const ejectButton = document.getElementById('eject-button');
  const betAmountInput = document.getElementById('bet-amount');
  const sitOutButton = document.getElementById('sit-out-button');
  
  // Initially disable the eject button until game starts
  ejectButton.disabled = true;
  
  readyButton.addEventListener('click', () => {
    const betAmount = parseFloat(betAmountInput.value);
    
    // Validate bet amount
    if (isNaN(betAmount) || (betAmount > 0 && betAmount < 0.10) || betAmount > 100) {
      alert('La puntata deve essere 0 per saltare o tra 0.10 e 100');
      return;
    }
    
    socket.emit('playerReady', { betAmount });
    readyButton.disabled = true;
    readyButton.textContent = 'Waiting for others...';
  });
  
  sitOutButton.addEventListener('click', () => {
    betAmountInput.value = '0';
    socket.emit('playerReady', { betAmount: 0 });
    readyButton.disabled = true;
    readyButton.textContent = 'Sitting out...';
  });
  
  ejectButton.addEventListener('click', () => {
    const betAmount = parseFloat(betAmountInput.value);
    socket.emit('eject', { betAmount });
    ejectButton.disabled = true;
    ejectButton.textContent = 'Ejected!';
  });

  // Validazione dell'input della puntata
  betAmountInput.addEventListener('change', () => {
    const value = parseFloat(betAmountInput.value);
    if (value > 0 && value < 0.10) {
      betAmountInput.value = '0.10';
    } else if (value > 100) {
      betAmountInput.value = '100';
    }
  });
  
  // Socket event listeners for game updates
  socket.on('roundResults', (results) => {
    if (results && results.players) {
      const user = getCurrentUser();
      if (user) {
        // Find player results
        const playerResult = results.players.find(p => p.id === user.uid || p.id === user.id);
        if (playerResult) {
          // Store results for badge processing
          currentGameStats.multiplier = playerResult.multiplier || 0;
          currentGameStats.isWinner = playerResult.isWinner || false;
          
          // Process game results and update badges
          processGameResults();
        }
      }
    }
  });
}

function startRound() {
  // Reset UI elements for a new round
  const readyButton = document.getElementById('ready-button');
  const ejectButton = document.getElementById('eject-button');
  const betAmountInput = document.getElementById('bet-amount');
  
  readyButton.disabled = true;
  readyButton.textContent = 'Round in progress';
  
  ejectButton.disabled = false;
  ejectButton.textContent = 'EJECT';
  
  betAmountInput.disabled = true;
  
  // Reset multiplier display
  updateMultiplier(1.0);
  
  // Reset current game stats
  currentGameStats = {
    multiplier: 0,
    isWinner: false
  };
}

function endRound() {
  // Update UI elements for end of round
  const readyButton = document.getElementById('ready-button');
  const ejectButton = document.getElementById('eject-button');
  const betAmountInput = document.getElementById('bet-amount');
  
  readyButton.disabled = false;
  readyButton.textContent = 'Ready';
  
  ejectButton.disabled = true;
  ejectButton.textContent = 'EJECT';
  
  betAmountInput.disabled = false;
}

function updateMultiplier(value) {
  const multiplierDisplay = document.getElementById('multiplier-display');
  multiplierDisplay.textContent = `${value.toFixed(2)}x`;
  
  // Update animation
  updateMultiplierAnimation(value);
  
  // Track the current multiplier for badge processing
  currentGameStats.multiplier = value;
}

function showCountdown(count) {
  const multiplierDisplay = document.getElementById('multiplier-display');
  multiplierDisplay.textContent = count.toString();
  
  // Make it bigger and centered
  multiplierDisplay.style.fontSize = '6rem';
  
  // Reset after countdown
  if (count === 0) {
    setTimeout(() => {
      multiplierDisplay.style.fontSize = '4rem';
      multiplierDisplay.textContent = '1.00x';
    }, 1000);
  }
}

function updatePlayerCredits(credits) {
  const creditAmount = document.getElementById('credit-amount');
  creditAmount.textContent = credits.toFixed(2);
}

function updateStatusMessage(message) {
  const statusMessage = document.getElementById('status-message');
  statusMessage.textContent = message;
}

function updateBonusStatus(bonuses) {
  // Update resurrection bonus status
  const resurrectionBonus = document.getElementById('resurrection-bonus');
  if (bonuses.resurrection) {
    resurrectionBonus.classList.add('active');
  } else {
    resurrectionBonus.classList.remove('active');
  }
}

// Funzione per processare i risultati della partita e aggiornare badge
async function processGameResults() {
  const user = getCurrentUser();
  if (!user) return;
  
  try {
    const userId = user.uid || user.id;
    
    // Ottieni le statistiche utente
    let userStats = await getUserStats(userId);
    if (!userStats) {
      userStats = {
        totalGames: 0,
        highestMultiplier: 0,
        wins: 0
      };
    }
    
    // Aggiorna le statistiche in base ai risultati della partita
    userStats.totalGames = (userStats.totalGames || 0) + 1;
    
    // Aggiorna il moltiplicatore più alto
    if (currentGameStats.multiplier > (userStats.highestMultiplier || 0)) {
      userStats.highestMultiplier = currentGameStats.multiplier;
    }
    
    // Aggiorna il conteggio delle vittorie
    if (currentGameStats.isWinner) {
      userStats.wins = (userStats.wins || 0) + 1;
    }
    
    // Salva le statistiche aggiornate
    await updateUserStats(userId, userStats);
    
    // Aggiorna le badge in base ai nuovi progressi
    await badgeManager.checkBadgeAchievements(userId, userStats);
    
    console.log('Statistiche aggiornate:', userStats);
  } catch (error) {
    console.error('Errore nell\'elaborazione dei risultati del gioco:', error);
  }
}

// Funzione per ottenere le statistiche utente
async function getUserStats(userId) {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists() && userDoc.data().stats) {
      return userDoc.data().stats;
    }
    
    return null;
  } catch (error) {
    console.error('Errore nel recupero delle statistiche utente:', error);
    return null;
  }
}

// Funzione per aggiornare le statistiche utente
async function updateUserStats(userId, stats) {
  try {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, { stats }, { merge: true });
    
    // Aggiorna anche le statistiche nella sessione per la persistenza locale
    const userData = JSON.parse(sessionStorage.getItem('user')) || {};
    userData.stats = stats;
    sessionStorage.setItem('user', JSON.stringify(userData));
    
    return true;
  } catch (error) {
    console.error('Errore nell\'aggiornamento delle statistiche:', error);
    return false;
  }
}

export { 
  setupGameplayListeners, 
  startRound, 
  endRound, 
  updateMultiplier, 
  showCountdown,
  updatePlayerCredits,
  updateStatusMessage,
  updateBonusStatus,
  processGameResults
};