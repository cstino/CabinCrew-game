// roomManager.js
class RoomManager {
  constructor() {
    this.rooms = {};
  }
  
  createRoom(roomName, roomCode, initialCredits, roundCount, enableBonuses) {
    if (this.rooms[roomCode]) {
      return null; // Room code already exists
    }
    
    const room = {
      roomName,
      roomCode,
      initialCredits,
      roundCount,
      enableBonuses,
      players: {},
      currentRound: 0,
      gameState: 'waiting' // waiting, playing, results
    };
    
    this.rooms[roomCode] = room;
    return room;
  }
  
  getRoom(roomCode) {
    return this.rooms[roomCode];
  }
  
  removeRoom(roomCode) {
    delete this.rooms[roomCode];
  }
  
  addPlayerToRoom(roomCode, playerId, username, credits) {
    const room = this.getRoom(roomCode);
    if (!room) return false;
    
    room.players[playerId] = {
      id: playerId,
      username,
      credits,
      ready: false,
      ejected: false,
      multiplier: 1.0,
      betAmount: 0.10,
      bonuses: {
        resurrection: room.enableBonuses
      }
    };
    
    return true;
  }
  
  removePlayerFromRoom(roomCode, playerId) {
    const room = this.getRoom(roomCode);
    if (!room) return false;
    
    delete room.players[playerId];
    return true;
  }
  
  setPlayerReady(roomCode, playerId, betAmount = 0.10) {
    const room = this.getRoom(roomCode);
    if (!room || !room.players[playerId]) return false;
    
    // Verifica che il betAmount sia valido
    if (betAmount < 0) {
      betAmount = 0; // salta il round
    } else if (betAmount < 0.10) {
      betAmount = 0.10; // minimo
    } else if (betAmount > 100) {
      betAmount = 100; // massimo
    }
    
    room.players[playerId].ready = true;
    room.players[playerId].ejected = false;
    room.players[playerId].multiplier = 1.0;
    room.players[playerId].betAmount = betAmount;
    
    // Verifica che il giocatore abbia crediti sufficienti
    if (betAmount > 0 && room.players[playerId].credits < betAmount) {
      return { error: 'Crediti insufficienti' };
    }
    
    return { success: true };
  }
  
  areAllPlayersReady(roomCode) {
    const room = this.getRoom(roomCode);
    if (!room) return false;
    
    const players = Object.values(room.players);
    if (players.length < 2) return false; // Need at least 2 players
    
    return players.every(player => player.ready);
  }
  
  resetPlayersReadyState(roomCode) {
    const room = this.getRoom(roomCode);
    if (!room) return false;
    
    Object.values(room.players).forEach(player => {
      player.ready = false;
    });
    
    return true;
  }
  
  getRoomPlayers(roomCode) {
    const room = this.getRoom(roomCode);
    if (!room) return [];
    
    return Object.values(room.players);
  }
  
  isRoomEmpty(roomCode) {
    const room = this.getRoom(roomCode);
    if (!room) return true;
    
    return Object.keys(room.players).length === 0;
  }
  
  updatePlayerCredits(roomCode, playerId, multiplier, betAmount) {
    const room = this.getRoom(roomCode);
    if (!room || !room.players[playerId]) return false;
    
    const player = room.players[playerId];
    
    // Se betAmount è 0, il giocatore sta saltando il round
    if (betAmount <= 0) {
      return { resurrectionUsed: false };
    }
    
    const winnings = betAmount * multiplier;
    
    player.credits = (player.credits - betAmount) + winnings;
    
    // Check for resurrection bonus if credits go below 0.10
    if (player.credits < 0.10 && player.bonuses.resurrection) {
      player.credits += 0.10;
      player.bonuses.resurrection = false; // Use up the resurrection bonus
      return { resurrectionUsed: true };
    }
    
    return { resurrectionUsed: false };
  }
}

module.exports = RoomManager;