// src/client/components/Gameplay.js
import { updateMultiplierAnimation } from '../utils/animations.js';

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

export { 
  setupGameplayListeners, 
  startRound, 
  endRound, 
  updateMultiplier, 
  showCountdown,
  updatePlayerCredits,
  updateStatusMessage,
  updateBonusStatus
};