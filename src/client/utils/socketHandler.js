// src/client/utils/socketHandler.js
import { showScreen } from '../main.js';
import { getCurrentUser } from '../components/Auth.js';
import {
  updateRoomInfo,
  updatePlayersList,
  showResults,
  hideResults,
} from '../components/GameRoom.js';
import {
  startRound,
  endRound,
  updateMultiplier,
  showCountdown,
  updatePlayerCredits,
  updateStatusMessage,
  updateBonusStatus,
} from '../components/Gameplay.js';
import { animateCrash } from './animations.js';
import { startCountdown } from './timer.js';

// Funzione per gestire l'overlay ready
function setupReadyOverlay(socket) {
  const readyButton = document.getElementById('ready-start-button');
  
  if (readyButton) {
    readyButton.addEventListener('click', () => {
      // Segnala al server che questo giocatore è pronto
      socket.emit('playerReady', { isInitialReady: true });
      
      // Cambia il testo e disabilita il bottone
      readyButton.textContent = 'PRONTO!';
      readyButton.disabled = true;
      readyButton.style.background = 'linear-gradient(135deg,#36e2ec,#1a9ca3)';
      
      // Aggiorna la lista dei giocatori pronti
      updateReadyPlayers(socket);
    });
  }
  
  // Gestisci l'update dello stato dei giocatori
  socket.on('readyPlayersUpdate', (players) => {
    updateReadyPlayersList(players);
    
    // Se tutti sono pronti, nascondi l'overlay dopo un breve ritardo
    const allReady = players.every(player => player.ready);
    if (allReady) {
      setTimeout(() => {
        const readyOverlay = document.getElementById('ready-overlay');
        if (readyOverlay) {
          readyOverlay.classList.add('hidden');
          
          // Mostra il messaggio di buon viaggio
          const bonVoyageMessage = document.getElementById('bon-voyage-message');
          if (bonVoyageMessage) {
            bonVoyageMessage.classList.remove('hidden');
            
            // Nascondi dopo 1 secondo
            setTimeout(() => {
              bonVoyageMessage.classList.add('hidden');
            }, 1000);
          }
        }
      }, 500);
    }
  });
}

// Funzione per aggiornare la lista dei giocatori pronti
function updateReadyPlayersList(players) {
  const playersList = document.getElementById('ready-players-list');
  if (!playersList) return;
  
  playersList.innerHTML = '';
  
  players.forEach(player => {
    const playerItem = document.createElement('div');
    playerItem.style.display = 'flex';
    playerItem.style.justifyContent = 'space-between';
    playerItem.style.alignItems = 'center';
    playerItem.style.padding = '10px';
    playerItem.style.marginBottom = '10px';
    playerItem.style.background = 'rgba(255,255,255,0.1)';
    playerItem.style.borderRadius = '8px';
    
    const playerName = document.createElement('span');
    playerName.textContent = player.username;
    playerName.style.color = 'white';
    playerName.style.fontSize = '18px';
    
    const readyStatus = document.createElement('span');
    if (player.ready) {
      readyStatus.textContent = '✓ Pronto';
      readyStatus.style.color = '#36e2ec';
    } else {
      readyStatus.textContent = '○ In attesa';
      readyStatus.style.color = '#ff9e00';
    }
    readyStatus.style.fontWeight = 'bold';
    
    playerItem.appendChild(playerName);
    playerItem.appendChild(readyStatus);
    
    playersList.appendChild(playerItem);
  });
}

// Funzione per richiedere un aggiornamento della lista giocatori
function updateReadyPlayers(socket) {
  socket.emit('requestReadyUpdate');
}

// Funzione per aggiungere un moltiplicatore alla lista dei precedenti
function addPreviousMultiplier(value) {
  const multipliersList = document.getElementById('previous-multipliers');
  if (!multipliersList) return;
  
  // Crea l'elemento per il nuovo moltiplicatore
  const multiplierElement = document.createElement('div');
  multiplierElement.className = 'prev-mult';
  
  // Stile in base al valore
  let colorClass = '';
  if (value >= 10) {
    colorClass = 'high';
    multiplierElement.style.background = 'rgba(232,42,160,0.2)';
    multiplierElement.style.color = '#e82aa0';
  } else if (value >= 5) {
    colorClass = 'medium';
    multiplierElement.style.background = 'rgba(137,59,230,0.2)';
    multiplierElement.style.color = '#893be6';
  } else {
    multiplierElement.style.background = 'rgba(67,97,238,0.2)';
    multiplierElement.style.color = '#4361ee';
  }
  
  multiplierElement.style.borderRadius = '6px';
  multiplierElement.style.padding = '8px 12px';
  multiplierElement.style.fontWeight = 'bold';
  multiplierElement.textContent = `${value.toFixed(2)}x`;
  
  // Inserisci all'inizio della lista
  if (multipliersList.firstChild) {
    multipliersList.insertBefore(multiplierElement, multipliersList.firstChild);
  } else {
    multipliersList.appendChild(multiplierElement);
  }
  
  // Limita il numero di moltiplicatori mostrati (opzionale)
  const maxToShow = 10;
  const allMultipliers = multipliersList.querySelectorAll('.prev-mult');
  if (allMultipliers.length > maxToShow) {
    for (let i = maxToShow; i < allMultipliers.length; i++) {
      multipliersList.removeChild(allMultipliers[i]);
    }
  }
}

// Funzioni per aggiornare le scommesse e la classifica
function updateBetsList(players) {
  const betsList = document.getElementById('current-bets');
  if (!betsList) return;
  
  betsList.innerHTML = '';
  
  players.forEach(player => {
    // Crea elemento per ogni scommessa
    const betItem = document.createElement('div');
    betItem.style.padding = '10px';
    betItem.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
    
    const betContent = document.createElement('div');
    betContent.style.display = 'flex';
    betContent.style.justifyContent = 'space-between';
    
    const playerName = document.createElement('span');
    playerName.textContent = player.username;
    
    const betAmount = document.createElement('span');
    betAmount.textContent = `${player.betAmount ? player.betAmount.toFixed(2) : '0.00'} credits`;
    
    betContent.appendChild(playerName);
    betContent.appendChild(betAmount);
    betItem.appendChild(betContent);
    
    betsList.appendChild(betItem);
  });
}

function updatePlayerRankings(players) {
  const rankingsList = document.getElementById('player-rankings');
  if (!rankingsList) return;
  
  rankingsList.innerHTML = '';
  
  // Ordina i giocatori per crediti (decrescente)
  const sortedPlayers = [...players].sort((a, b) => b.credits - a.credits);
  
  sortedPlayers.forEach(player => {
    // Crea elemento per ogni giocatore nella classifica
    const rankItem = document.createElement('div');
    rankItem.style.padding = '10px';
    rankItem.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
    
    const rankContent = document.createElement('div');
    rankContent.style.display = 'flex';
    rankContent.style.justifyContent = 'space-between';
    
    const playerName = document.createElement('span');
    playerName.textContent = player.username;
    
    const playerCredits = document.createElement('span');
    playerCredits.textContent = `${player.credits.toFixed(2)} credits`;
    
    rankContent.appendChild(playerName);
    rankContent.appendChild(playerCredits);
    rankItem.appendChild(rankContent);
    
    rankingsList.appendChild(rankItem);
  });
}

function initializeSocketHandlers(socket) {
  // Socket event handlers
  
  // Inizializza la schermata ready all'avvio
  setupReadyOverlay(socket);

  // Registration response
  socket.on('registered', (data) => {
    console.log('Registered with server:', data);
  });

  // Room creation response
  socket.on('roomCreated', (room) => {
    console.log('Room created:', room);
    updateRoomInfo(room);
    showScreen('game-room-screen');
  });

  // Room joined response
  socket.on('roomJoined', (room) => {
    console.log('Room joined:', room);
    updateRoomInfo(room);
    showScreen('game-room-screen');
  });

  // Player joined/left updates
  socket.on('playerJoined', (players) => {
    updatePlayersList(players);

    // Get current player data
    const currentPlayer = players.find((p) => p.id === socket.id);

    if (currentPlayer) {
      updatePlayerCredits(currentPlayer.credits);
      updateBonusStatus(currentPlayer.bonuses);
    }

    // Aggiorna anche la lista delle scommesse e la classifica
    updateBetsList(players);
    updatePlayerRankings(players);

    updateStatusMessage(
      `${players.length} player(s) in room. Waiting for game to start...`
    );
  });

  socket.on('playerLeft', (data) => {
    updatePlayersList(data.players);
    // Aggiorna anche la lista delle scommesse e la classifica
    updateBetsList(data.players);
    updatePlayerRankings(data.players);
  });

  // Ready state updates
  socket.on('playerReadyUpdate', (players) => {
    updatePlayersList(players);
    // Aggiorna anche la lista delle scommesse e la classifica
    updateBetsList(players);
    updatePlayerRankings(players);
  });

  // Round starting countdown
  socket.on('roundStarting', (data) => {
    console.log(`Round ${data.roundNumber}/${data.totalRounds} starting...`);
    updateRoomInfo({
      roomName: document.getElementById('room-title').textContent,
      currentRound: data.roundNumber,
      roundCount: data.totalRounds,
      roomCode: document
        .getElementById('room-code-display')
        .textContent.replace('Code: ', ''),
    });
    hideResults();
    
    // Nascondi l'overlay di ready se è visibile
    const readyOverlay = document.getElementById('ready-overlay');
    if (readyOverlay && !readyOverlay.classList.contains('hidden')) {
      readyOverlay.classList.add('hidden');
    }
    
    // Mostra il messaggio di "Buon viaggio, piloti!"
    const bonVoyageMessage = document.getElementById('bon-voyage-message');
    if (bonVoyageMessage) {
      bonVoyageMessage.classList.remove('hidden');
      
      // Nascondi dopo 1 secondo
      setTimeout(() => {
        bonVoyageMessage.classList.add('hidden');
      }, 1000);
    }
    
    updateStatusMessage(`Round ${data.roundNumber} starting...`);
  });

  // Countdown timer
  socket.on('countdown', (count) => {
    console.log('Countdown:', count);
    showCountdown(count);
  });

  // Round started
  socket.on('roundStarted', () => {
    console.log('Round started!');
    startRound();
  });

  // Multiplier updates
  socket.on('multiplierUpdate', (multiplier) => {
    updateMultiplier(multiplier);
  });

  // Player ejection
  socket.on('playerEjected', (data) => {
    console.log(`Player ${data.playerId} ejected at ${data.multiplier}x`);

    // Check if it's the current player
    if (data.playerId === socket.id) {
      updateStatusMessage(`You ejected at ${data.multiplier.toFixed(2)}x!`);

      // Update credits if provided
      if (data.credits !== undefined) {
        updatePlayerCredits(data.credits);
      }
    }
  });

  // Game crashed
  socket.on('gameCrashed', (data) => {
    console.log(`Game crashed at ${data.crashPoint}x`);
    animateCrash();
    showResults(data.results, data.crashPoint);

    // Find current player in results
    const currentPlayer = data.results.find((r) => r.id === socket.id);

    if (currentPlayer) {
      updatePlayerCredits(currentPlayer.credits);

      // Check if resurrection was used
      if (currentPlayer.resurrectionUsed) {
        updateStatusMessage('You crashed but Resurrection saved you!');

        // Update bonus status
        const bonuses = {
          resurrection: false, // Used up
        };
        updateBonusStatus(bonuses);
      } else if (currentPlayer.multiplier === 0) {
        updateStatusMessage('You crashed!');
      } else {
        updateStatusMessage(
          `You ejected at ${currentPlayer.multiplier.toFixed(2)}x!`
        );
      }
    }
    
    // Aggiungi il moltiplicatore alla lista dei precedenti
    addPreviousMultiplier(data.crashPoint);
  });

  // Waiting for players to ready up
  socket.on('waitingForReady', () => {
    console.log('Waiting for players to ready up');
    endRound();
    updateStatusMessage('Get ready for the next round!');

    // Start a 10-second countdown for next round
    startCountdown(10, null, () => {
      updateStatusMessage(
        'Please click Ready when you are prepared for the next round.'
      );
    });
  });

  // Game ended
  socket.on('gameEnded', (data) => {
    console.log('Game ended, winner:', data.winner);
    alert(
      `Game over! Winner: ${
        data.winner.username
      } with ${data.winner.credits.toFixed(2)} credits!`
    );
    showScreen('lobby-screen');
  });

  // Chat message
  socket.on('chatMessage', (data) => {
    addMessageToChat(data.username, data.message);
  });

  // Error handling
  socket.on('error', (error) => {
    console.error('Socket error:', error);
    alert(error.message);
  });
}

// Helper per aggiungere messaggi in chat (da spostare nel componente Chat)
function addMessageToChat(username, message) {
  const chatMessages = document.getElementById('chat-messages');
  const messageElement = document.createElement('div');
  messageElement.className = 'chat-message';

  const userElement = document.createElement('span');
  userElement.className = 'chat-username';
  userElement.textContent = username + ': ';

  const textElement = document.createElement('span');
  textElement.className = 'chat-text';
  textElement.textContent = message;

  messageElement.appendChild(userElement);
  messageElement.appendChild(textElement);

  chatMessages.appendChild(messageElement);

  // Scroll to bottom
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

export { initializeSocketHandlers };
