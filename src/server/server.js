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

// Serve static files
app.use(express.static(path.join(__dirname, '../../public')));

// Initialize managers
const roomManager = new RoomManager();
const gameManager = new GameManager(io, roomManager);

// Socket connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // User registration and authentication
  socket.on('register', (userData) => {
    // Firebase auth would be implemented here
    // For prototype, just acknowledge
    socket.emit('registered', {
      success: true,
      userId: socket.id,
      username: userData.username,
    });
  });

  // Room creation
  socket.on('createRoom', (roomData) => {
    const { roomName, roomCode, initialCredits, roundCount, enableBonuses } =
      roomData;
    const room = roomManager.createRoom(
      roomName,
      roomCode,
      initialCredits,
      roundCount,
      enableBonuses
    );

    if (room) {
      socket.join(roomCode);
      socket.roomCode = roomCode;
      socket.isLeader = true;

      roomManager.addPlayerToRoom(
        roomCode,
        socket.id,
        roomData.userData.username,
        initialCredits
      );
      socket.emit('roomCreated', room);
      io.to(roomCode).emit(
        'playerJoined',
        roomManager.getRoomPlayers(roomCode)
      );
    } else {
      socket.emit('error', {
        message: 'Failed to create room. Room code might be in use.',
      });
    }
  });

  // Joining a room
  socket.on('joinRoom', (data) => {
    const { roomCode, username } = data;
    const room = roomManager.getRoom(roomCode);

    if (room) {
      socket.join(roomCode);
      socket.roomCode = roomCode;
      socket.isLeader = false;

      roomManager.addPlayerToRoom(
        roomCode,
        socket.id,
        username,
        room.initialCredits
      );
      socket.emit('roomJoined', room);
      io.to(roomCode).emit(
        'playerJoined',
        roomManager.getRoomPlayers(roomCode)
      );
    } else {
      socket.emit('error', { message: 'Room not found.' });
    }
  });

  // Player ready for next round
  socket.on('playerReady', () => {
    if (socket.roomCode) {
      roomManager.setPlayerReady(socket.roomCode, socket.id);
      io.to(socket.roomCode).emit(
        'playerReadyUpdate',
        roomManager.getRoomPlayers(socket.roomCode)
      );

      // Check if all players are ready to start the round
      if (roomManager.areAllPlayersReady(socket.roomCode)) {
        gameManager.startRound(socket.roomCode);
      }
    }
  });

  // Player eject action
  socket.on('eject', () => {
    if (socket.roomCode) {
      const currentMultiplier = gameManager.getCurrentMultiplier(
        socket.roomCode
      );
      gameManager.playerEject(socket.roomCode, socket.id, currentMultiplier);

      // Notify the room about player ejection
      io.to(socket.roomCode).emit('playerEjected', {
        playerId: socket.id,
        multiplier: currentMultiplier,
      });
    }
  });

  // Chat functionality
  socket.on('sendChatMessage', (data) => {
    if (socket.roomCode) {
      // Broadcast message to all users in the room
      io.to(socket.roomCode).emit('chatMessage', {
        username: data.username,
        message: data.message,
      });
    }
  });

  // Disconnect handling
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);

    if (socket.roomCode) {
      roomManager.removePlayerFromRoom(socket.roomCode, socket.id);
      io.to(socket.roomCode).emit('playerLeft', {
        playerId: socket.id,
        players: roomManager.getRoomPlayers(socket.roomCode),
      });

      // If room is empty, remove it
      if (roomManager.isRoomEmpty(socket.roomCode)) {
        roomManager.removeRoom(socket.roomCode);
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
