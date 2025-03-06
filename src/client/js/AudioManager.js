// AudioManager.js - Sistema di gestione audio per CabinCrew

class AudioManager {
  constructor() {
    // Configurazione audio
    this.musicVolume = 0.3;
    this.isMuted = false;
    this.autoplay = true;
    
    // Musica del menu - Scegli un file specifico
    this.menuMusic = new Audio();
    this.menuMusic.src = '/asset/audio/ripples in the sand.mp3';
    this.menuMusic.loop = true;
    this.menuMusic.volume = this.musicVolume;
    
    // Playlist di brani per i round di gioco
    this.gamePlaylist = [
      '/asset/audio/time.mp3',
      '/asset/audio/cornfield chase.mp3',
      '/asset/audio/stay.mp3',
      '/asset/audio/No Time For Caution.mp3',
      '/asset/audio/coward.mp3'
    ];
    
    // Riferimento al brano attualmente in riproduzione
    this.currentGameTrack = null;
    
    // Inizializza l'audio
    this._initAudio();
    
    // Rendi l'istanza accessibile globalmente
    window.audioManager = this;
  }
  
  // Inizializza l'audio con gestione delle interazioni utente
  _initAudio() {
    // Molti browser richiedono un'interazione utente prima di riprodurre audio
    document.addEventListener('click', () => {
      if (this.autoplay && !this.isMuted) {
        this.playMenuMusic();
        this.autoplay = false; // Riproduci solo una volta dopo il click
      }
    }, { once: true });
    
    console.log('AudioManager inizializzato');
  }
  
  // Riproduce la musica del menu
  playMenuMusic() {
    if (this.isMuted) return;
    
    console.log('Tentativo di riproduzione musica menu...');
    
    // Ferma qualsiasi musica di gioco in riproduzione
    this.stopGameMusic();
    
    // Tentativo di riproduzione con gestione degli errori
    this.menuMusic.play()
      .then(() => console.log('Musica menu avviata con successo'))
      .catch(error => {
        console.error('Errore riproduzione musica menu:', error);
        // Tentativi aggiuntivi su interazione utente
        document.addEventListener('click', () => {
          this.menuMusic.play().catch(e => console.warn('Nuovo tentativo fallito:', e));
        }, { once: true });
      });
  }
  
  // Ferma la musica del menu
  stopMenuMusic() {
    this.menuMusic.pause();
    this.menuMusic.currentTime = 0;
  }
  
  // Avvia una traccia casuale per il round di gioco
  playRandomGameMusic() {
    if (this.isMuted) return;
    
    console.log('Tentativo di riproduzione musica gioco...');
    
    // Ferma la musica del menu e qualsiasi traccia precedente
    this.stopMenuMusic();
    this.stopGameMusic();
    
    // Seleziona una traccia casuale dalla playlist
    const randomIndex = Math.floor(Math.random() * this.gamePlaylist.length);
    const randomTrack = this.gamePlaylist[randomIndex];
    
    console.log('Traccia selezionata:', randomTrack);
    
    // Crea un nuovo elemento audio per la traccia
    this.currentGameTrack = new Audio(randomTrack);
    this.currentGameTrack.volume = this.musicVolume;
    
    // Tentativo di riproduzione con gestione degli errori
    this.currentGameTrack.play()
      .then(() => console.log('Musica gioco avviata con successo'))
      .catch(error => {
        console.error('Errore riproduzione musica gioco:', error);
        // Tentativo aggiuntivo su interazione utente
        document.addEventListener('click', () => {
          if (this.currentGameTrack) {
            this.currentGameTrack.play().catch(e => console.warn('Nuovo tentativo fallito:', e));
          }
        }, { once: true });
      });
  }
  
  // Ferma la musica del round corrente
  stopGameMusic() {
    if (this.currentGameTrack) {
      this.currentGameTrack.pause();
      this.currentGameTrack.currentTime = 0;
      this.currentGameTrack = null;
    }
  }
  
  // Attiva/disattiva l'audio
  toggleMute() {
    this.isMuted = !this.isMuted;
    
    if (this.isMuted) {
      this.stopMenuMusic();
      this.stopGameMusic();
      console.log('Audio disattivato');
    } else {
      // Riattiva l'audio appropriato in base al contesto
      const isGameScreen = document.getElementById('game-room-screen') && 
                          !document.getElementById('game-room-screen').classList.contains('hidden');
      
      if (isGameScreen) {
        this.playRandomGameMusic();
      } else {
        this.playMenuMusic();
      }
      console.log('Audio riattivato');
    }
    
    return this.isMuted;
  }
  
  // Imposta il volume della musica
  setMusicVolume(volume) {
    if (volume < 0) volume = 0;
    if (volume > 1) volume = 1;
    
    this.musicVolume = volume;
    this.menuMusic.volume = volume;
    
    if (this.currentGameTrack) {
      this.currentGameTrack.volume = volume;
    }
    
    console.log('Volume impostato a:', volume);
  }
  
  // Funzione di debug per verificare l'audio
  testAudio() {
    console.log('Test audio avviato');
    
    // Crea un elemento UI temporaneo per il test
    const testDiv = document.createElement('div');
    testDiv.style.position = 'fixed';
    testDiv.style.bottom = '20px';
    testDiv.style.right = '20px';
    testDiv.style.background = 'rgba(0,0,0,0.8)';
    testDiv.style.color = 'white';
    testDiv.style.padding = '10px';
    testDiv.style.borderRadius = '5px';
    testDiv.style.zIndex = '9999';
    testDiv.innerHTML = `
      <div>Test Audio</div>
      <button id="test-menu">Play Menu Music</button>
      <button id="test-game">Play Game Music</button>
      <button id="test-stop">Stop All</button>
      <div id="test-status">Stato: in attesa</div>
    `;
    
    document.body.appendChild(testDiv);
    
    // Aggiungi event listener
    document.getElementById('test-menu').addEventListener('click', () => {
      this.playMenuMusic();
      document.getElementById('test-status').textContent = 'Stato: menu music';
    });
    
    document.getElementById('test-game').addEventListener('click', () => {
      this.playRandomGameMusic();
      document.getElementById('test-status').textContent = 'Stato: game music';
    });
    
    document.getElementById('test-stop').addEventListener('click', () => {
      this.stopMenuMusic();
      this.stopGameMusic();
      document.getElementById('test-status').textContent = 'Stato: audio fermato';
    });
    
    // Rimuovi dopo 30 secondi
    setTimeout(() => {
      document.body.removeChild(testDiv);
    }, 30000);
  }
}

// Crea l'istanza globale
const audioManager = new AudioManager();

// Abilita il test audio per debugging
// Decommentare questa riga per visualizzare un pannello di test audio
// audioManager.testAudio();

// Esporta l'istanza
export default audioManager;