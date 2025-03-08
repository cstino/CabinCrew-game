document.addEventListener('DOMContentLoaded', function() {
    // Create diagnostic button
    const diagButton = document.createElement('button');
    diagButton.textContent = 'Diagnose Game Room';
    diagButton.style.position = 'fixed';
    diagButton.style.bottom = '10px';
    diagButton.style.left = '150px';
    diagButton.style.zIndex = '9999';
    diagButton.style.backgroundColor = 'green';
    diagButton.style.color = 'white';
    diagButton.style.padding = '10px';
    
    diagButton.addEventListener('click', function() {
      // Create a diagnostic overlay
      const diagDiv = document.createElement('div');
      diagDiv.style.position = 'fixed';
      diagDiv.style.top = '0';
      diagDiv.style.left = '0';
      diagDiv.style.width = '100%';
      diagDiv.style.height = '100%';
      diagDiv.style.backgroundColor = 'rgba(0,0,0,0.9)';
      diagDiv.style.color = 'white';
      diagDiv.style.padding = '20px';
      diagDiv.style.zIndex = '10000';
      diagDiv.style.overflow = 'auto';
      
      // Check if game room exists
      const gameRoom = document.getElementById('game-room-screen');
      let html = '<h2>Game Room Diagnostic</h2>';
      
      if (gameRoom) {
        html += '<p>✅ Game room element exists</p>';
        html += '<p>Classes: ' + gameRoom.className + '</p>';
        html += '<p>Display: ' + window.getComputedStyle(gameRoom).display + '</p>';
        html += '<p>Visibility: ' + window.getComputedStyle(gameRoom).visibility + '</p>';
        html += '<p>Z-index: ' + window.getComputedStyle(gameRoom).zIndex + '</p>';
        html += '<p>HTML structure:<br><pre>' + gameRoom.outerHTML.substring(0, 500) + '...</pre></p>';
      } else {
        html += '<p>❌ Game room element not found!</p>';
      }
      
      // Add close button
      html += '<button id="close-diag" style="padding:10px; background:red; color:white; margin-top:20px;">Close</button>';
      
      diagDiv.innerHTML = html;
      document.body.appendChild(diagDiv);
      
      // Add close handler
      document.getElementById('close-diag').addEventListener('click', function() {
        document.body.removeChild(diagDiv);
      });
    });
    
    document.body.appendChild(diagButton);
  });