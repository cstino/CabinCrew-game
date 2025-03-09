/**
 * Fix radicale per i problemi della game room
 */
document.addEventListener('DOMContentLoaded', function() {
  console.log('Fix radicale game room attivato');
  
  // Pulsante fix radicale
  const radicalFixButton = document.createElement('button');
  radicalFixButton.textContent = 'FIX RADICALE';
  radicalFixButton.style.position = 'fixed';
  radicalFixButton.style.bottom = '60px';
  radicalFixButton.style.left = '50%';
  radicalFixButton.style.transform = 'translateX(-50%)';
  radicalFixButton.style.zIndex = '9999';
  radicalFixButton.style.backgroundColor = '#ff0000';
  radicalFixButton.style.color = 'white';
  radicalFixButton.style.padding = '15px 30px';
  radicalFixButton.style.fontSize = '16px';
  radicalFixButton.style.fontWeight = 'bold';
  radicalFixButton.style.borderRadius = '5px';
  radicalFixButton.style.border = 'none';
  radicalFixButton.style.cursor = 'pointer';
  radicalFixButton.style.boxShadow = '0 0 20px rgba(255, 0, 0, 0.7)';
  
  radicalFixButton.addEventListener('click', function() {
    console.log('Applicazione fix radicale');
    
    // Sostituisci l'intero markup della game room
    const gameRoomHTML = `
    <div id="game-room-screen" class="screen" style="display:block; position:relative; z-index:999; background-color:#1a1b26; min-height:100vh; width:100%; padding:20px;">
      <div class="aviator-container" style="width:100%; height:100%;">
        <!-- Header con info stanza e moltiplicatori precedenti -->
        <div class="room-header" style="background-color:rgba(36,40,59,0.8); border-radius:12px; padding:20px; margin-bottom:20px;">
          <div class="room-info" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
            <h2 id="room-title" style="font-size:24px; margin:0; color:white;">Test Room</h2>
            <div class="room-details" style="display:flex; gap:20px; color:white;">
              <span id="round-info">Round 0/5</span>
              <span id="room-code-display">Code: 1234</span>
            </div>
          </div>
          <div class="previous-multipliers" style="display:flex; gap:15px; overflow-x:auto; padding:10px 0;">
            <div class="prev-mult" style="background:rgba(67,97,238,0.2); border-radius:6px; padding:8px 12px; font-weight:bold; color:#4361ee;">1.52x</div>
            <div class="prev-mult" style="background:rgba(67,97,238,0.2); border-radius:6px; padding:8px 12px; font-weight:bold; color:#4361ee;">2.72x</div>
            <div class="prev-mult" style="background:rgba(232,42,160,0.2); border-radius:6px; padding:8px 12px; font-weight:bold; color:#e82aa0;">10.35x</div>
            <div class="prev-mult" style="background:rgba(67,97,238,0.2); border-radius:6px; padding:8px 12px; font-weight:bold; color:#4361ee;">1.12x</div>
            <div class="prev-mult" style="background:rgba(67,97,238,0.2); border-radius:6px; padding:8px 12px; font-weight:bold; color:#4361ee;">4.23x</div>
          </div>
        </div>

        <!-- Layout principale a due colonne -->
        <div class="game-layout" style="display:grid; grid-template-columns:300px 1fr; gap:20px; flex-grow:1;">
          <!-- Colonna sinistra -->
          <div class="left-column" style="display:flex; flex-direction:column; gap:20px; height:100%;">
            <!-- Sezione scommesse attuali -->
            <div class="bets-section" style="background:rgba(36,40,59,0.7); border-radius:12px; overflow:hidden; flex:1; display:flex; flex-direction:column;">
              <div class="section-header" style="background:rgba(67,97,238,0.2); padding:15px; border-bottom:1px solid rgba(255,255,255,0.1);">
                <h3 style="margin:0; font-size:18px; color:white;">Scommesse Round</h3>
              </div>
              <div class="bets-list" id="current-bets" style="overflow-y:auto; flex-grow:1; color:white; padding:10px;">
                <!-- Scommesse di esempio -->
                <div style="padding:10px; border-bottom:1px solid rgba(255,255,255,0.1);">
                  <div style="display:flex; justify-content:space-between;">
                    <span>Giocatore 1</span>
                    <span>0.5 credits</span>
                  </div>
                </div>
                <div style="padding:10px; border-bottom:1px solid rgba(255,255,255,0.1);">
                  <div style="display:flex; justify-content:space-between;">
                    <span>Giocatore 2</span>
                    <span>1.0 credits</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Classifica generale -->
            <div class="rankings-section" style="background:rgba(36,40,59,0.7); border-radius:12px; overflow:hidden; flex:1; display:flex; flex-direction:column;">
              <div class="section-header" style="background:rgba(67,97,238,0.2); padding:15px; border-bottom:1px solid rgba(255,255,255,0.1);">
                <h3 style="margin:0; font-size:18px; color:white;">Classifica</h3>
              </div>
              <div class="rankings-list" id="player-rankings" style="overflow-y:auto; flex-grow:1; color:white; padding:10px;">
                <!-- Classifica di esempio -->
                <div style="padding:10px; border-bottom:1px solid rgba(255,255,255,0.1);">
                  <div style="display:flex; justify-content:space-between;">
                    <span>Giocatore 1</span>
                    <span>10.0 credits</span>
                  </div>
                </div>
                <div style="padding:10px; border-bottom:1px solid rgba(255,255,255,0.1);">
                  <div style="display:flex; justify-content:space-between;">
                    <span>Giocatore 2</span>
                    <span>8.5 credits</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Area centrale del gioco -->
          <div class="game-area" style="display:flex; flex-direction:column; gap:20px;">
            <!-- Visualizzazione del moltiplicatore -->
            <div class="multiplier-display" style="background:#111218; border-radius:12px; height:350px; position:relative; overflow:hidden; display:flex; justify-content:center; align-items:center; box-shadow:0 10px 30px rgba(0,0,0,0.2);">
              <div class="multiplier-value" id="multiplier-display" style="font-size:5rem; font-weight:bold; color:#36e2ec; text-shadow:0 0 20px rgba(54,226,236,0.4); z-index:2;">1.00x</div>
              <div class="airplane-animation" style="position:relative; width:100%; height:100%;">
                <div class="airplane-container" style="position:absolute; bottom:0; left:0; width:100%; height:100%; pointer-events:none;">
                  <div class="airplane" style="position:absolute; bottom:10%; left:10%; font-size:30px; transform:rotate(45deg); transition:all 0.1s linear;">✈️</div>
                </div>
              </div>
            </div>
            
            <!-- Controlli scommessa -->
            <div class="bet-controls" style="background:rgba(36,40,59,0.7); border-radius:12px; padding:20px; display:flex; flex-direction:column; gap:20px;">
              <div class="bet-amount-controls" style="display:flex; align-items:center; gap:15px;">
                <label for="bet-amount" style="color:white;">Puntata:</label>
                <div class="bet-input-group" style="display:flex; align-items:center;">
                  <button class="bet-btn decrease" style="width:36px; height:36px; display:flex; align-items:center; justify-content:center; background:rgba(67,97,238,0.2); border:none; color:white; cursor:pointer; font-size:18px; border-radius:6px 0 0 6px;">-</button>
                  <input type="number" id="bet-amount" min="0" max="100" step="0.10" value="0.10" style="width:100px; text-align:center; margin:0; border-radius:0; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:white; padding:8px;">
                  <button class="bet-btn increase" style="width:36px; height:36px; display:flex; align-items:center; justify-content:center; background:rgba(67,97,238,0.2); border:none; color:white; cursor:pointer; font-size:18px; border-radius:0 6px 6px 0;">+</button>
                </div>
              </div>
              
              <div class="bet-actions" style="display:flex; gap:15px; justify-content:center;">
                <button id="sit-out-button" class="secondary-button" style="background:rgba(255,255,255,0.1); border:none; color:white; padding:12px 24px; border-radius:12px; cursor:pointer;">Salta round</button>
                <button id="ready-button" class="action-button" style="background:linear-gradient(135deg,#4361ee,#3a56d4); border:none; color:white; padding:12px 24px; border-radius:12px; cursor:pointer; font-weight:bold;">Ready</button>
                <button id="eject-button" class="action-button primary" style="background:linear-gradient(135deg,#ff9e00,#ff6d00); border:none; color:white; padding:12px 24px; border-radius:12px; cursor:pointer; font-weight:bold;">EJECT</button>
              </div>
              
              <!-- Status del gioco -->
              <div class="game-status" style="text-align:center;">
                <div id="status-message" style="color:#36e2ec; font-weight:bold;">Waiting for players to join...</div>
                <div id="countdown-timer" style="margin-top:10px; font-weight:bold; color:#ff9e00;">Next round in <span id="timer-value">10</span>s</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Footer con credits e pulsante uscita -->
        <div class="room-footer" style="display:flex; justify-content:space-between; align-items:center; margin-top:20px; background:rgba(36,40,59,0.7); border-radius:12px; padding:15px 20px;">
          <div id="player-credits" class="player-credits" style="font-size:1.2rem; font-weight:bold; color:white;">
            Your Credits: <span id="credit-amount" style="color:#ff9e00;">10.00</span>
          </div>
          <div class="footer-actions" style="display:flex; gap:15px;">
            <button id="chat-button" class="secondary-button" style="background:rgba(255,255,255,0.1); border:none; color:white; padding:12px 24px; border-radius:12px; cursor:pointer;">Chat</button>
            <button id="leave-room-button" style="background:linear-gradient(135deg,#4361ee,#3a56d4); border:none; color:white; padding:12px 24px; border-radius:12px; cursor:pointer;">Leave Room</button>
          </div>
        </div>
      </div>
    </div>
    `;
    
    // Trova e rimuovi la game room esistente
    const existingGameRoom = document.getElementById('game-room-screen');
    if (existingGameRoom) {
      existingGameRoom.remove();
    }
    
    // Nascondi il video di sfondo
    const videoBackground = document.querySelector('.background-video-container');
    if (videoBackground) {
      videoBackground.style.display = 'none';
    }
    
    // Nascondi tutte le altre schermate
    document.querySelectorAll('.screen').forEach(screen => {
      screen.classList.add('hidden');
    });
    
    // Aggiungi la nuova game room all'app
    const app = document.getElementById('app');
    if (app) {
      app.insertAdjacentHTML('beforeend', gameRoomHTML);
    } else {
      document.body.insertAdjacentHTML('beforeend', gameRoomHTML);
    }
    
    // Inizializza i pulsanti
    const leaveButton = document.getElementById('leave-room-button');
    if (leaveButton) {
      leaveButton.addEventListener('click', function() {
        // Torna alla lobby
        document.getElementById('game-room-screen').classList.add('hidden');
        document.getElementById('lobby-screen').classList.remove('hidden');
        
        // Mostra nuovamente il video
        if (videoBackground) {
          videoBackground.style.display = 'block';
        }
      });
    }
    
    // Pulsante animazione
    const ejectButton = document.getElementById('eject-button');
    if (ejectButton) {
      ejectButton.addEventListener('click', function() {
        // Simuliamo una crescita del moltiplicatore per testare l'animazione
        let value = 1.00;
        const multiplierDisplay = document.getElementById('multiplier-display');
        const airplane = document.querySelector('.airplane');
        
        const interval = setInterval(() => {
          value += 0.05;
          multiplierDisplay.textContent = value.toFixed(2) + 'x';
          
          // Colore in base al valore
          if (value >= 10) {
            multiplierDisplay.style.color = '#e82aa0';
          } else if (value >= 2) {
            multiplierDisplay.style.color = '#893be6';
          }
          
          // Posizione aereo
          const progress = Math.min((value - 1) / 9, 1);
          const left = 10 + (progress * 70);
          const bottom = 10 + (progress * 70);
          
          if (airplane) {
            airplane.style.left = left + '%';
            airplane.style.bottom = bottom + '%';
          }
          
          if (value > 15) clearInterval(interval);
        }, 100);
      });
    }
    
    console.log('Game room radicalmente sostituita con successo');
  });
  
  document.body.appendChild(radicalFixButton);
});