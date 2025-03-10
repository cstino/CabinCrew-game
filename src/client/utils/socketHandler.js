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
      readyButton.classList.add('ready-confirmed');
      
      // Effetto visivo al click
      readyButton.style.backgroundColor = '#34d399';
      setTimeout(() => {
        readyButton.style.backgroundColor = '';
      }, 300);
      
      // Aggiorna la lista dei giocatori pronti
      updateReadyPlayers(socket);
    });
  }
  
  // Gestisci la visualizzazione dell'overlay ready
  socket.on('showInitialReadyScreen', () => {
    console.log('Evento showInitialReadyScreen ricevuto');
    
    // Assicurati che ci troviamo nella game room
    const gameRoomScreen = document.getElementById('game-room-screen');
    if (gameRoomScreen && gameRoomScreen.classList.contains('hidden')) {
      console.log('Game room non visibile, mostrando prima la game room');
      // Mostra la game room rimuovendo la classe hidden direttamente
      document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden');
      });
      gameRoomScreen.classList.remove('hidden');
    }
    
    // Piccolo ritardo per garantire che il DOM sia stato renderizzato
    setTimeout(() => {
      const readyOverlay = document.getElementById('ready-overlay');
      if (readyOverlay) {
        console.log('Mostrando l\'overlay ready');
        
        // Reset dello stato del pulsante Ready
        const readyButton = document.getElementById('ready-start-button');
        if (readyButton) {
          readyButton.textContent = 'READY';
          readyButton.disabled = false;
          readyButton.classList.remove('ready-confirmed');
        }
        
        // Nascondi il messaggio "tutti pronti"
        const allReadyMessage = document.getElementById('all-ready-message');
        if (allReadyMessage) {
          allReadyMessage.classList.add('hidden');
        }
        
        // Mostra l'overlay
        readyOverlay.classList.remove('hidden');
      } else {
        console.error('Elemento ready-overlay non trovato nel DOM');
      }
    }, 200);
  });
  
  // Handler per la visualizzazione diretta dell'overlay ready (backup)
  socket.on('showInitialReadyScreenDirect', () => {
    console.log('Evento showInitialReadyScreenDirect ricevuto (invio diretto)');
    
    // Mostra direttamente l'overlay ready senza verifiche aggiuntive
    const readyOverlay = document.getElementById('ready-overlay');
    if (readyOverlay) {
      console.log('Mostrando l\'overlay ready (via evento diretto)');
      readyOverlay.classList.remove('hidden');
      
      // Reset dello stato del pulsante Ready
      const readyButton = document.getElementById('ready-start-button');
      if (readyButton) {
        readyButton.textContent = 'READY';
        readyButton.disabled = false;
        readyButton.classList.remove('ready-confirmed');
      }
      
      // Nascondi il messaggio "tutti pronti"
      const allReadyMessage = document.getElementById('all-ready-message');
      if (allReadyMessage) {
        allReadyMessage.classList.add('hidden');
      }
    } else {
      console.error('Elemento ready-overlay non trovato (evento diretto)');
    }
  });
  
  // Gestisci l'update dello stato dei giocatori
  socket.on('readyPlayersUpdate', (players) => {
    updateReadyPlayersList(players);
    
    // Controlla se tutti i giocatori sono pronti
    const allReady = players.every(player => player.initialReady);
    const allReadyMessage = document.getElementById('all-ready-message');
    
    if (allReady && allReadyMessage) {
      allReadyMessage.classList.remove('hidden');
      
      // Aggiungi un effetto sonoro (se disponibile)
      try {
        const audio = new Audio('/asset/audio/ready-sound.mp3');
        audio.volume = 0.5;
        audio.play().catch(err => console.log('Audio play failed', err));
      } catch (err) {
        console.log('Audio not supported', err);
      }
    } else if (allReadyMessage) {
      allReadyMessage.classList.add('hidden');
    }
  });
  
  // Gestisci quando tutti i giocatori sono pronti
  socket.on('allPlayersReady', () => {
    // Mostra il messaggio "tutti pronti" nell'overlay
    const allReadyMessage = document.getElementById('all-ready-message');
    if (allReadyMessage) {
      allReadyMessage.classList.remove('hidden');
    }
    
    // Nascondi l'overlay di ready dopo un breve ritardo
    setTimeout(() => {
      const readyOverlay = document.getElementById('ready-overlay');
      if (readyOverlay) {
        readyOverlay.classList.add('hidden');
      }
      
      // Mostra il messaggio di buon viaggio
      const bonVoyageMessage = document.getElementById('bon-voyage-message');
      if (bonVoyageMessage) {
        bonVoyageMessage.classList.remove('hidden');
        
        // Nascondi dopo 2 secondi
        setTimeout(() => {
          bonVoyageMessage.classList.add('hidden');
        }, 2000);
      }
    }, 2000); // Attendi 2 secondi prima di nascondere l'overlay
  });
}

// Funzione per aggiornare la lista dei giocatori pronti
function updateReadyPlayersList(players) {
  const playersList = document.getElementById('ready-players-list');
  if (!playersList) return;
  
  playersList.innerHTML = '';
  
  players.forEach(player => {
    const playerItem = document.createElement('div');
    playerItem.className = 'ready-player-item';
    
    // Aggiungi classe speciale se il giocatore è pronto
    if (player.initialReady) {
      playerItem.classList.add('player-ready');
    }
    
    const playerInfo = document.createElement('div');
    playerInfo.className = 'ready-player-info';
    
    const playerBadge = document.createElement('div');
    playerBadge.className = 'ready-player-badge';
    
    // Se il giocatore ha un badge, mostralo
    if (player.selectedBadge) {
      const badgeImg = document.createElement('img');
      
      // Verifica se il path del badge include già '/asset/images/badges/'
      if (player.selectedBadge.includes('/')) {
        badgeImg.src = player.selectedBadge;
      } else {
        badgeImg.src = `/asset/images/badges/${player.selectedBadge}.png`;
      }
      
      badgeImg.alt = player.selectedBadge;
      badgeImg.onerror = function() {
        // Fallback se l'immagine non si carica
        this.onerror = null;
        this.src = '/asset/images/badges/default-badge.png';
      };
      playerBadge.appendChild(badgeImg);
    } else {
      // Default icon se non ha badge
      const defaultImg = document.createElement('img');
      defaultImg.src = '/asset/images/badges/default-badge.png';
      defaultImg.alt = 'Default badge';
      playerBadge.appendChild(defaultImg);
    }
    
    const playerName = document.createElement('span');
    playerName.className = 'ready-player-name';
    playerName.textContent = player.username;
    
    // Evidenzia il giocatore corrente
    const currentUser = getCurrentUser();
    if (currentUser && (player.id === currentUser.uid || player.id === currentUser.id)) {
      playerName.classList.add('current-player');
      playerName.textContent += ' (tu)';
    }
    
    playerInfo.appendChild(playerBadge);
    playerInfo.appendChild(playerName);
    
    const playerStatus = document.createElement('div');
    playerStatus.className = 'ready-player-status';
    
    const statusIndicator = document.createElement('div');
    statusIndicator.className = `ready-status-indicator ${player.initialReady ? 'ready' : 'not-ready'}`;
    
    const statusText = document.createElement('span');
    statusText.className = `ready-status-text ${player.initialReady ? 'ready' : 'not-ready'}`;
    statusText.textContent = player.initialReady ? 'Pronto' : 'In attesa';
    
    playerStatus.appendChild(statusIndicator);
    playerStatus.appendChild(statusText);
    
    playerItem.appendChild(playerInfo);
    playerItem.appendChild(playerStatus);
    
    // Animazione di entrata
    playerItem.style.animation = 'fadeIn 0.3s ease-in-out forwards';
    playerItem.style.animationDelay = (players.indexOf(player) * 0.1) + 's';
    
    playersList.appendChild(playerItem);
  });
  
  // Aggiungiamo un contatore per mostrare quanti giocatori sono pronti
  const readyCount = players.filter(player => player.initialReady).length;
  const totalPlayers = players.length;
  
  const readyCounter = document.createElement('div');
  readyCounter.className = 'ready-counter';
  readyCounter.style.textAlign = 'center';
  readyCounter.style.margin = '15px 0';
  readyCounter.style.fontSize = '1.1rem';
  readyCounter.textContent = `${readyCount}/${totalPlayers} giocatori pronti`;
  
  playersList.appendChild(readyCounter);
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
    
    // Mostra la schermata di game room
    document.querySelectorAll('.screen').forEach(screen => {
      screen.classList.add('hidden');
    });
    const gameRoomScreen = document.getElementById('game-room-screen');
    if (gameRoomScreen) {
      gameRoomScreen.classList.remove('hidden');
      console.log('Game room mostrata, in attesa dell\'overlay ready');
    }
    
    // L'overlay ready verrà mostrato quando arriverà l'evento 'showInitialReadyScreen'
  });

  // Room joined response
  socket.on('roomJoined', (room) => {
    console.log('Room joined:', room);
    updateRoomInfo(room);
    
    // Mostra la schermata di game room
    document.querySelectorAll('.screen').forEach(screen => {
      screen.classList.add('hidden');
    });
    const gameRoomScreen = document.getElementById('game-room-screen');
    if (gameRoomScreen) {
      gameRoomScreen.classList.remove('hidden');
      console.log('Game room mostrata (join), in attesa dell\'overlay ready');
    }
    
    // L'overlay ready verrà mostrato quando arriverà l'evento 'showInitialReadyScreen'
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
    
    // Nascondi anche eventuali messaggi "all ready"
    const allReadyMessage = document.getElementById('all-ready-message');
    if (allReadyMessage) {
      allReadyMessage.classList.add('hidden');
    }
    
    // Mostra il messaggio di "Buon viaggio, piloti!"
    const bonVoyageMessage = document.getElementById('bon-voyage-message');
    if (bonVoyageMessage) {
      bonVoyageMessage.classList.remove('hidden');
      
      // Nascondi dopo 1.5 secondi
      setTimeout(() => {
        bonVoyageMessage.classList.add('hidden');
      }, 1500);
    }
    
    updateStatusMessage(`Round ${data.roundNumber} starting...`);
    
    // Attiva il timer di countdown per la puntata
    const countdownTimer = document.getElementById('countdown-timer');
    const timerValue = document.getElementById('timer-value');
    
    if (countdownTimer && timerValue) {
      countdownTimer.classList.remove('hidden');
      
      // Inizia il countdown da 10 secondi
      let timeLeft = 10;
      timerValue.textContent = timeLeft;
      
      const countdownInterval = setInterval(() => {
        timeLeft--;
        timerValue.textContent = timeLeft;
        
        if (timeLeft <= 3) {
          // Aggiunge una classe per l'effetto di urgenza
          countdownTimer.classList.add('urgent');
        }
        
        if (timeLeft <= 0) {
          clearInterval(countdownInterval);
          countdownTimer.classList.remove('urgent');
          countdownTimer.classList.add('hidden');
        }
      }, 1000);
    }
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
