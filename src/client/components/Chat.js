// src/client/components/Chat.js
import { getCurrentUser } from './Auth.js';

function setupChatListeners(socket) {
  const chatButton = document.getElementById('chat-button');
  const chatContainer = document.getElementById('chat-container');
  const chatInput = document.getElementById('chat-input');
  const sendMessageButton = document.getElementById('send-message-button');

  // Toggle chat visibility
  chatButton.addEventListener('click', () => {
    chatContainer.classList.toggle('hidden');
    if (!chatContainer.classList.contains('hidden')) {
      chatInput.focus();
    }
  });

  // Send message on button click
  sendMessageButton.addEventListener('click', () => {
    sendChatMessage(socket);
  });

  // Send message on Enter key
  chatInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      sendChatMessage(socket);
    }
  });
}

function sendChatMessage(socket) {
  const chatInput = document.getElementById('chat-input');
  const message = chatInput.value.trim();

  if (message) {
    const user = getCurrentUser();
    if (user) {
      socket.emit('sendChatMessage', {
        username: user.username,
        message: message,
      });

      // Clear input after sending
      chatInput.value = '';
    }
  }
}

export { setupChatListeners };
