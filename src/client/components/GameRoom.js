// src/client/components/GameRoom.js
import { showScreen } from '../main.js';
import { getCurrentUser } from './Auth.js';

function setupLobbyListeners(socket) {
  const createRoomButton = document.getElementById('create-room-button');
  const joinRoomButton = document.getElementById('join-room-button');
  const leaveRoomButton = document.getElementById('leave-room-button');
  const profileButton = document.getElementById('profile-button');
  const backFromProfileButton = document.getElementById('back-from-profile');
  
  createRoomButton.addEventListener('click', () => {
    const roomName = document.getElementById('room-name').value.trim();
    const roomCode = document.getElementById('room-code').value.trim();
    const initialCredits = parseFloat(document.getElementById('initial-credits').value);
    const roundCount = parseInt(document.getElementById('round-count').value);
    const enableBonuses = document.getElementById('enable-bonuses').checked;
    
    if (!roomName || !roomCode) {
      alert('Please fill in room name and code');
      return;
    }
    
    if (isNaN(initialCredits) || initialCredits <= 0) {
      alert('Initial credits must be a positive number');
      return;
    }
    
    if (isNaN(roundCount) || roundCount <= 0 || roundCount > 20) {
      alert('Round count must be between 1 and 20');
      return;
    }
    
    // Create the room
    socket.emit('createRoom', {
      roomName,
      roomCode,
      initialCredits,
      roundCount,
      enableBonuses,
      userData: getCurrentUser()
    });
  });
  
  joinRoomButton.addEventListener('click', () => {
    const roomCode = document.getElementById('join-room-code').value.trim();
    
    if (!roomCode) {
      alert('Please enter a room code');
      return;
    }
    
    // Join the room
    socket.emit('joinRoom', {
      roomCode,
      username: getCurrentUser().username
    });
  });
  
  leaveRoomButton.addEventListener('click', () => {
    socket.emit('leaveRoom');
    showScreen('lobby-screen');
  });
  
  profileButton.addEventListener('click', () => {
    showScreen('profile-screen');
  });
  
  backFromProfileButton.addEventListener('click', () => {
    showScreen('lobby-screen');
  });
}

function updateRoomInfo(room) {
  document.getElementById('room-title').textContent = room.roomName;
  document.getElementById('round-info').textContent = `Round ${room.currentRound}/${room.roundCount}`;
  document.getElementById('room-code-display').textContent = `Code: ${room.roomCode}`;
}

function updatePlayersList(players) {
  const playersContainer = document.getElementById('players-container');
  playersContainer.innerHTML = '';
  
  players.forEach(player => {
    const playerItem = document.createElement('div');
    playerItem.className = 'player-item';
    
    const playerName = document.createElement('div');
    playerName.className = 'player-name';
    
    const playerBadge = document.createElement('div');
    playerBadge.className = 'player-badge';
    // Badge content would go here
    
    const playerUsername = document.createElement('span');
    playerUsername.textContent = player.username;
    
    playerName.appendChild(playerBadge);
    playerName.appendChild(playerUsername);
    
    const playerStatus = document.createElement('div');
    playerStatus.className = 'player-status';
    
    const statusIndicator = document.createElement('div');
    statusIndicator.className = `status-indicator ${player.ready ? 'ready' : 'not-ready'}`;
    
    const statusText = document.createElement('span');
    statusText.textContent = player.ready ? 'Ready' : 'Not Ready';
    
    const playerCredits = document.createElement('div');
    playerCredits.className = 'player-credits';
    playerCredits.textContent = `${player.credits.toFixed(2)} credits`;
    
    playerStatus.appendChild(statusIndicator);
    playerStatus.appendChild(statusText);
    
    playerItem.appendChild(playerName);
    playerItem.appendChild(playerCredits);
    playerItem.appendChild(playerStatus);
    
    playersContainer.appendChild(playerItem);
  });
}

function showResults(results, crashPoint) {
  const resultsScreen = document.getElementById('results-screen');
  resultsScreen.classList.remove('hidden');
  
  const crashPointElement = document.getElementById('crash-point');
  crashPointElement.textContent = `Crashed at ${crashPoint.toFixed(2)}x`;
  
  const resultsList = document.getElementById('results-list');
  resultsList.innerHTML = '';
  
  results.forEach(result => {
    const resultItem = document.createElement('div');
    resultItem.className = 'result-item';
    
    const playerInfo = document.createElement('div');
    playerInfo.className = 'player-info';
    playerInfo.textContent = result.username;
    
    const resultInfo = document.createElement('div');
    resultInfo.className = 'result-info';
    
    const multiplier = document.createElement('span');
    multiplier.className = 'result-multiplier';
    multiplier.textContent = `${result.multiplier.toFixed(2)}x`;
    
    const betAmount = document.createElement('span');
    betAmount.className = 'bet-amount';
    betAmount.textContent = ` (${result.betAmount.toFixed(2)})`;
    
    const credits = document.createElement('span');
    credits.className = 'result-credits';
    credits.textContent = ` - ${result.credits.toFixed(2)} credits`;
    
    resultInfo.appendChild(multiplier);
    resultInfo.appendChild(betAmount);
    resultInfo.appendChild(credits);
    
    if (result.resurrectionUsed) {
      const resurrection = document.createElement('span');
      resurrection.className = 'resurrection-used';
      resurrection.textContent = ' (Resurrection Used)';
      resultInfo.appendChild(resurrection);
    }
    
    resultItem.appendChild(playerInfo);
    resultItem.appendChild(resultInfo);
    
    resultsList.appendChild(resultItem);
  });
}

function hideResults() {
  document.getElementById('results-screen').classList.add('hidden');
}

export { setupLobbyListeners, updateRoomInfo, updatePlayersList, showResults, hideResults };