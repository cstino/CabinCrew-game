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

function initializeSocketHandlers(socket) {
  // Socket event handlers

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

    updateStatusMessage(
      `${players.length} player(s) in room. Waiting for game to start...`
    );
  });

  socket.on('playerLeft', (data) => {
    updatePlayersList(data.players);
  });

  // Ready state updates
  socket.on('playerReadyUpdate', (players) => {
    updatePlayersList(players);
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
