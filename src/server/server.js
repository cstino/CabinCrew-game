// server.js - aggiorna/sostituisci questo file
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Servi i file statici dalla cartella 'public'
app.use(express.static(path.join(__dirname, '../../public')));

// Memorizza le stanze di gioco
const rooms = {};

// Socket.IO per la gestione del gioco in tempo reale
io.on('connection', (socket) => {
  console.log('Nuovo utente connesso:', socket.id);
  
  // Crea stanza
  socket.on('createRoom', (data) => {
    const roomCode = data.code;
    
    // Verifica se la stanza esiste già
    if (rooms[roomCode]) {
      socket.emit('roomError', { message: 'Codice stanza già in uso' });
      return;
    }
    
    // Crea la stanza
    rooms[roomCode] = {
      name: data.name,
      code: roomCode,
      initialCredits: data.initialCredits,
      roundCount: data.roundCount,
      enableBonuses: false, // Bonus disabilitati
      players: [{ id: socket.id }],
      leader: socket.id
    };
    
    // Unisci il socket alla stanza
    socket.join(roomCode);
    
    // Notifica il client
    socket.emit('roomCreated', rooms[roomCode]);
    console.log('Stanza creata:', roomCode);
  });
  
  // Unisciti a stanza
  socket.on('joinRoom', (data) => {
    const roomCode = data.code;
    
    // Verifica se la stanza esiste
    if (!rooms[roomCode]) {
      socket.emit('roomError', { message: 'Stanza non trovata' });
      return;
    }
    
    // Unisci il socket alla stanza
    socket.join(roomCode);
    
    // Aggiungi il giocatore alla stanza
    rooms[roomCode].players.push({ id: socket.id });
    
    // Notifica il client
    socket.emit('roomJoined', rooms[roomCode]);
    
    // Notifica gli altri giocatori
    socket.to(roomCode).emit('playerJoined', { id: socket.id });
    console.log('Giocatore unito alla stanza:', roomCode);
  });
  
  // Disconnessione
  socket.on('disconnect', () => {
    console.log('Utente disconnesso:', socket.id);
    
    // Rimuovi giocatore dalle stanze
    for (const roomCode in rooms) {
      const room = rooms[roomCode];
      
      // Cerca il giocatore nella stanza
      const playerIndex = room.players.findIndex(player => player.id === socket.id);
      
      if (playerIndex !== -1) {
        // Rimuovi il giocatore
        room.players.splice(playerIndex, 1);
        
        // Notifica gli altri giocatori
        socket.to(roomCode).emit('playerLeft', { id: socket.id });
        
        // Se non ci sono più giocatori, rimuovi la stanza
        if (room.players.length === 0) {
          delete rooms[roomCode];
          console.log('Stanza rimossa:', roomCode);
        }
        // Se il leader è uscito, assegna un nuovo leader
        else if (room.leader === socket.id && room.players.length > 0) {
          room.leader = room.players[0].id;
          socket.to(roomCode).emit('newLeader', { id: room.leader });
        }
      }
    }
  });
});

// Avvia il server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server attivo su http://localhost:${PORT}`);
});

module.exports = server;