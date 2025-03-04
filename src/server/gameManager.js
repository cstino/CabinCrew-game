// gameManager.js
class GameManager {
  constructor(io, roomManager) {
    this.io = io;
    this.roomManager = roomManager;
    this.gameIntervals = {};
    this.gameData = {};
  }
  
  startRound(roomCode) {
    const room = this.roomManager.getRoom(roomCode);
    if (!room) return;
    
    // Update game state
    room.gameState = 'playing';
    room.currentRound++;
    
    // Initialize game data for this round
    this.gameData[roomCode] = {
      multiplier: 1.0,
      crashed: false,
      ejectedPlayers: {}
    };
    
    // Notify players that the round is starting
    this.io.to(roomCode).emit('roundStarting', {
      roundNumber: room.currentRound,
      totalRounds: room.roundCount
    });
    
    // Start a 3-second countdown
    let countdown = 3;
    const countdownInterval = setInterval(() => {
      this.io.to(roomCode).emit('countdown', countdown);
      countdown--;
      
      if (countdown < 0) {
        clearInterval(countdownInterval);
        this.startMultiplierGrowth(roomCode);
      }
    }, 1000);
  }
  
  startMultiplierGrowth(roomCode) {
    const gameData = this.gameData[roomCode];
    if (!gameData) return;
    
    // Notify clients that the multiplier is now growing
    this.io.to(roomCode).emit('roundStarted');
    
    // Track time for acceleration
    let timeElapsed = 0;
    
    // Start the multiplier growth interval
    this.gameIntervals[roomCode] = setInterval(() => {
      if (gameData.crashed) {
        clearInterval(this.gameIntervals[roomCode]);
        return;
      }
      
      timeElapsed += 0.1; // 100ms in seconds
      
      // Calculate growth rate based on current multiplier
      // Higher values grow faster
      let growthRate;
      if (gameData.multiplier < 2) {
        growthRate = 0.01; // Slow at start
      } else if (gameData.multiplier < 10) {
        growthRate = 0.05; // Medium speed
      } else if (gameData.multiplier < 100) {
        growthRate = 0.5; // Fast
      } else if (gameData.multiplier < 1000) {
        growthRate = 5; // Very fast
      } else {
        growthRate = 50; // Extremely fast
      }
      
      // Apply growth
      gameData.multiplier = parseFloat((gameData.multiplier + growthRate).toFixed(2));
      
      // Send updated multiplier to all clients
      this.io.to(roomCode).emit('multiplierUpdate', gameData.multiplier);
      
      // Check if we've reached the crash point
      if (Math.random() < this.getCrashProbability(gameData.multiplier)) {
        this.crashGame(roomCode);
      }
    }, 100); // Update every 100ms for smooth animation
  }
  
  getCrashProbability(multiplier) {
    // The Aviator usa un algoritmo basato su una distribuzione esponenziale
    // La probabilità di crash aumenta con il moltiplicatore
    
    // Molto bassa probabilità sotto 1.1x
    if (multiplier < 1.1) return 0.001;
    
    // Bassa probabilità tra 1.1x e 2x
    if (multiplier < 1.5) return 0.005;
    if (multiplier < 2.0) return 0.01;
    
    // Media probabilità tra 2x e 5x
    if (multiplier < 3.0) return 0.015;
    if (multiplier < 5.0) return 0.02;
    
    // Alta probabilità oltre 5x
    if (multiplier < 10.0) return 0.04;
    if (multiplier < 20.0) return 0.07;
    
    // Molto alta oltre 20x
    return 0.1;
  }
  
  crashGame(roomCode) {
    const gameData = this.gameData[roomCode];
    const room = this.roomManager.getRoom(roomCode);
    if (!gameData || !room) return;
    
    // Mark the game as crashed
    gameData.crashed = true;
    clearInterval(this.gameIntervals[roomCode]);
    
    // Update game state
    room.gameState = 'results';
    
    // Calculate results for players who didn't eject
    const players = this.roomManager.getRoomPlayers(roomCode);
    const results = [];
    
    players.forEach(player => {
      // Get player's bet amount (default to 0.10 if not set)
      const betAmount = player.betAmount || 0.10;
      
      if (!gameData.ejectedPlayers[player.id]) {
        // Player didn't eject, they crashed
        player.ejected = false;
        player.multiplier = 0;
        
        // Use correct bet amount
        if (betAmount > 0) {
          player.credits -= betAmount;
        }
        
        // Check for resurrection bonus
        if (player.credits < 0.10 && player.bonuses.resurrection) {
          player.credits += 0.10;
          player.bonuses.resurrection = false;
          results.push({
            id: player.id,
            username: player.username,
            multiplier: 0,
            betAmount: betAmount,
            credits: player.credits,
            resurrectionUsed: true
          });
        } else {
          results.push({
            id: player.id,
            username: player.username,
            multiplier: 0,
            betAmount: betAmount,
            credits: player.credits,
            resurrectionUsed: false
          });
        }
      } else {
        // Player successfully ejected before crash
        const playerData = gameData.ejectedPlayers[player.id];
        results.push({
          id: player.id,
          username: player.username,
          multiplier: playerData.multiplier,
          betAmount: playerData.betAmount,
          credits: player.credits,
          resurrectionUsed: false
        });
      }
    });
    
    // Sort results by multiplier (highest first)
    results.sort((a, b) => b.multiplier - a.multiplier);
    
    // Notify players of the crash and results
    this.io.to(roomCode).emit('gameCrashed', {
      crashPoint: gameData.multiplier,
      results
    });
    
    // Reset player ready state for next round
    this.roomManager.resetPlayersReadyState(roomCode);
    
    // Schedule next round or end game
    if (room.currentRound >= room.roundCount) {
      // Game over
      setTimeout(() => {
        this.endGame(roomCode);
      }, 10000); // Show results for 10 seconds
    } else {
      // Wait 10 seconds before allowing next round
      setTimeout(() => {
        room.gameState = 'waiting';
        this.io.to(roomCode).emit('waitingForReady');
      }, 10000);
    }
  }
  
// Modifichiamo questa funzione in gameManager.js
playerEject(roomCode, playerId, multiplier, betAmount) {
  const gameData = this.gameData[roomCode];
  if (!gameData || gameData.crashed) return false;
  
  // Verifica che betAmount sia un numero valido
  betAmount = parseFloat(betAmount) || 0.10;
  
  // Ottieni il giocatore dal roomManager
  const player = this.roomManager.getRoom(roomCode).players[playerId];
  
  // Salva la puntata effettiva nel giocatore
  if (player) {
    player.betAmount = betAmount;
  }
  
  // Record player's ejection with actual bet amount
  gameData.ejectedPlayers[playerId] = {
    multiplier,
    betAmount
  };
  
  // Calcola vincite direttamente qui
  if (player) {
    const winnings = betAmount * multiplier;
    // Rimuovi puntata e aggiungi vincite
    player.credits = player.credits - betAmount + winnings;
    
    console.log(`Player ${playerId} ejected: bet=${betAmount}, multiplier=${multiplier}, winnings=${winnings}, new credits=${player.credits}`);
  }
  
  return { success: true, betAmount, multiplier };
}
  
  endGame(roomCode) {
    const room = this.roomManager.getRoom(roomCode);
    if (!room) return;
    
    // Get final player standings
    const players = this.roomManager.getRoomPlayers(roomCode);
    
    // Sort by credits (highest first)
    players.sort((a, b) => b.credits - a.credits);
    
    // Notify players of game end
    this.io.to(roomCode).emit('gameEnded', {
      players,
      winner: players[0] // Player with most credits
    });
  }
}

module.exports = GameManager;