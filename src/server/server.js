// server.js
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const RoomManager = require('./roomManager');
const GameManager = require('./gameManager');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Inizializza manager per stanze e gioco
const roomManager = new RoomManager();
const gameManager = new GameManager(io, roomManager);

// Servi i file statici dalla cartella 'public'
app.use(express.static(path.join(__dirname, '../../public')));

// Mappa che memorizza i roomCode per ogni socket.id
const userRooms = {};

// Funzione per ottenere la stanza di un utente
function getUserRoom(socketId) {
  return userRooms[socketId];
}

// Socket.IO per la gestione del gioco in tempo reale
io.on('connection', (socket) => {
  console.log('Nuovo utente connesso:', socket.id);

  // Crea stanza
  socket.on('createRoom', (data) => {
    const roomName = data.roomName || data.name || 'Game Room';
    const roomCode = data.roomCode || data.code || '0000';
    const initialCredits = parseFloat(data.initialCredits) || 10;
    const roundCount = parseInt(data.roundCount) || 5;
    const enableBonuses = data.enableBonuses || false;
    const userData = data.userData || { username: 'Giocatore' };
    
    // Crea la stanza tramite il room manager
    const room = roomManager.createRoom(roomName, roomCode, initialCredits, roundCount, enableBonuses);
    
    if (!room) {
      socket.emit('error', { message: 'Codice stanza già in uso' });
      return;
    }
    
    // Aggiungi utente alla stanza
    roomManager.addPlayerToRoom(roomCode, socket.id, userData.username || 'Giocatore', initialCredits);
    
    // Memorizza il roomCode per questo socket
    userRooms[socket.id] = roomCode;
    
    // Unisci il socket alla stanza
    socket.join(roomCode);
    
    // Notifica il client
    socket.emit('roomCreated', room);
    io.to(roomCode).emit('playerJoined', roomManager.getRoomPlayers(roomCode));
    
    console.log('Stanza creata:', roomCode);
  });
  
  // Unisciti a stanza
  socket.on('joinRoom', (data) => {
    const roomCode = data.roomCode || data.code;
    const userData = data.userData || { username: 'Giocatore' };
    
    // Verifica se la stanza esiste
    const room = roomManager.getRoom(roomCode);
    if (!room) {
      socket.emit('error', { message: 'Stanza non trovata' });
      return;
    }
    
    // Aggiungi utente alla stanza
    roomManager.addPlayerToRoom(roomCode, socket.id, userData.username || 'Giocatore', room.initialCredits);
    
    // Memorizza il roomCode per questo socket
    userRooms[socket.id] = roomCode;
    
    // Unisci il socket alla stanza
    socket.join(roomCode);
    
    // Notifica il client
    socket.emit('roomJoined', room);
    io.to(roomCode).emit('playerJoined', roomManager.getRoomPlayers(roomCode));
    
    console.log('Giocatore unito alla stanza:', roomCode);
  });
  
  // Lascia stanza
  socket.on('leaveRoom', () => {
    const roomCode = getUserRoom(socket.id);
    if (!roomCode) return;
    
    // Rimuovi il giocatore dalla stanza
    roomManager.removePlayerFromRoom(roomCode, socket.id);
    
    // Rimuovi l'associazione socket-stanza
    delete userRooms[socket.id];
    
    // Abbandona la stanza socket.io
    socket.leave(roomCode);
    
    // Notifica gli altri giocatori
    if (roomManager.isRoomEmpty(roomCode)) {
      roomManager.removeRoom(roomCode);
    } else {
      io.to(roomCode).emit('playerLeft', {
        playerId: socket.id,
        players: roomManager.getRoomPlayers(roomCode)
      });
    }
  });
  
  // Richiesta ready da parte di un giocatore
  socket.on('playerReady', ({ betAmount, isInitialReady }) => {
    const roomCode = getUserRoom(socket.id);
    if (!roomCode) return;
    
    // Se è la fase iniziale di ready
    if (isInitialReady) {
      // Aggiorna solo lo stato di ready del giocatore senza avviare il round
      const room = roomManager.getRoom(roomCode);
      if (room && room.players[socket.id]) {
        room.players[socket.id].ready = true;
        
        // Notifica tutti i giocatori dello stato di ready
        io.to(roomCode).emit('readyPlayersUpdate', roomManager.getRoomPlayers(roomCode));
        
        // Se tutti sono pronti, avvia il primo round dopo un breve ritardo
        if (roomManager.areAllPlayersReady(roomCode)) {
          setTimeout(() => {
            // Aggiorna il round corrente a 1 prima di avviare
            room.currentRound = 1;
            // Start the first round
            gameManager.startRound(roomCode);
          }, 2000);
        }
      }
      return;
    }
    
    // Normale gestione del ready per i round successivi
    const result = roomManager.setPlayerReady(roomCode, socket.id, betAmount);
    
    if (result.error) {
      socket.emit('error', { message: result.error });
      return;
    }
    
    // Notify all players about the ready state
    io.to(roomCode).emit('playerReadyUpdate', roomManager.getRoomPlayers(roomCode));
    
    // Check if all players are ready to start the next round
    if (roomManager.areAllPlayersReady(roomCode)) {
      const room = roomManager.getRoom(roomCode);
      
      if (room && room.gameState === 'waiting') {
        // Start the next round
        gameManager.startRound(roomCode);
      }
    }
  });
  
  // Richiesta di aggiornamento della lista giocatori pronti
  socket.on('requestReadyUpdate', () => {
    const roomCode = getUserRoom(socket.id);
    if (!roomCode) return;
    
    io.to(roomCode).emit('readyPlayersUpdate', roomManager.getRoomPlayers(roomCode));
  });
  
  // Gestisci l'eject (uscita) di un giocatore
  socket.on('eject', ({ betAmount }) => {
    const roomCode = getUserRoom(socket.id);
    if (!roomCode) return;
    
    const room = roomManager.getRoom(roomCode);
    if (!room || room.gameState !== 'playing') return;
    
    // Ottieni il moltiplicatore corrente
    const multiplier = gameManager.gameData[roomCode].multiplier;
    
    // Esegui l'eject
    const result = gameManager.playerEject(roomCode, socket.id, multiplier, betAmount);
    
    if (result.success) {
      // Notifica il giocatore che ha fatto eject
      socket.emit('playerEjected', {
        playerId: socket.id,
        multiplier,
        credits: room.players[socket.id].credits
      });
    }
  });
  
  // Disconnessione
  socket.on('disconnect', () => {
    console.log('Utente disconnesso:', socket.id);
    
    const roomCode = getUserRoom(socket.id);
    if (!roomCode) return;
    
    // Rimuovi il giocatore dalla stanza
    roomManager.removePlayerFromRoom(roomCode, socket.id);
    
    // Rimuovi l'associazione socket-stanza
    delete userRooms[socket.id];
    
    // Notifica gli altri giocatori
    if (roomManager.isRoomEmpty(roomCode)) {
      roomManager.removeRoom(roomCode);
    } else {
      io.to(roomCode).emit('playerLeft', {
        playerId: socket.id,
        players: roomManager.getRoomPlayers(roomCode)
      });
    }
  });
});

// Avvia il server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server attivo su http://localhost:${PORT}`);
});

module.exports = server;