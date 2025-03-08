document.addEventListener('DOMContentLoaded', function() {
    // Create debug button
    const debugBtn = document.createElement('button');
    debugBtn.textContent = 'Replace Game Room';
    debugBtn.style.position = 'fixed';
    debugBtn.style.bottom = '10px';
    debugBtn.style.left = '10px';
    debugBtn.style.zIndex = '9999';
    debugBtn.style.padding = '10px';
    debugBtn.style.backgroundColor = '#ff0000';
    debugBtn.style.color = '#fff';
  
    debugBtn.addEventListener('click', function() {
      // Get the game room container
      const gameRoomScreen = document.getElementById('game-room-screen');
      
      // Force replace the entire game room with new HTML
      gameRoomScreen.outerHTML = `
        <div id="game-room-screen" class="screen" style="display:block !important; position:fixed !important; top:0 !important; left:0 !important; width:100% !important; height:100% !important; z-index:9999 !important; background-color:#1a1b26 !important; overflow:auto !important;">
          <div class="aviator-container" style="width:100% !important; height:100% !important; padding:20px !important;">
            <!-- Content here -->
            <h1 style="color:white; text-align:center; margin-top:20px;">Game Room</h1>
            <div class="game-layout" style="display:grid; grid-template-columns:300px 1fr; gap:20px; height:80vh; margin:20px auto; max-width:1200px;">
              <div style="background:rgba(36,40,59,0.7); border-radius:12px; padding:20px;">
                <h2>Players</h2>
                <div id="player-list" style="margin-top:20px;">
                  <div style="padding:10px; border-bottom:1px solid rgba(255,255,255,0.1);">Player 1</div>
                  <div style="padding:10px; border-bottom:1px solid rgba(255,255,255,0.1);">Player 2</div>
                </div>
              </div>
              <div style="display:flex; flex-direction:column; gap:20px;">
                <div style="background:#111218; height:350px; border-radius:12px; display:flex; justify-content:center; align-items:center;">
                  <div style="font-size:5rem; font-weight:bold; color:#36e2ec;">1.00x</div>
                </div>
                <div style="background:rgba(36,40,59,0.7); border-radius:12px; padding:20px;">
                  <div style="display:flex; justify-content:center; gap:20px; margin-bottom:20px;">
                    <input type="number" value="0.10" style="width:150px; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); color:white; padding:10px; border-radius:6px;">
                    <button style="background:linear-gradient(135deg,#4361ee,#3a56d4); color:white; border:none; border-radius:6px; padding:0 20px; cursor:pointer;">Ready</button>
                    <button style="background:linear-gradient(135deg,#ff9e00,#ff6d00); color:white; border:none; border-radius:6px; padding:0 20px; cursor:pointer;">EJECT</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
      
      // Hide video background
      const videoBackground = document.querySelector('.background-video-container');
      if (videoBackground) videoBackground.style.display = 'none';
    });
    
    document.body.appendChild(debugBtn);
  });