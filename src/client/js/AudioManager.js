// AudioManager.js - Sistema audio semplificato per CabinCrew

class AudioManager {
    constructor() {
      this.musicVolume = 0.3;
      this.isMuted = false;
      
      // Musica di sottofondo per il menu
      this.menuMusic = new Audio('/assets/audio/menu-music.mp3');
      this.menuMusic.loop = true;
      this.menuMusic.volume = this.musicVolume;
      
      // Playlist di brani per i round di gioco
      this.gamePlaylist = [
        '/assets/audio/game-track-1.mp3',
        '/assets/audio/game-track-2.mp3',
        '/assets/audio/game-track-3.mp3'
      ];
      
      this.currentGameTrack = null;
    }
    
    // Avvia la musica del menu
    playMenuMusic() {
      if (this.isMuted) return;
      
      this.stopGameMusic();
      this.menuMusic.play().catch(error => {
        console.warn('Errore riproduzione musica menu:', error);
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
      
      this.stopMenuMusic();
      this.stopGameMusic();
      
      // Seleziona una traccia casuale
      const randomIndex = Math.floor(Math.random() * this.gamePlaylist.length);
      const trackPath = this.gamePlaylist[randomIndex];
      
      this.currentGameTrack = new Audio(trackPath);
      this.currentGameTrack.volume = this.musicVolume;
      this.currentGameTrack.play().catch(error => {
        console.warn('Errore riproduzione musica gioco:', error);
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
      }
      
      return this.isMuted;
    }
    
    // Imposta il volume della musica
    setMusicVolume(volume) {
      this.musicVolume = volume;
      this.menuMusic.volume = volume;
      if (this.currentGameTrack) {
        this.currentGameTrack.volume = volume;
      }
    }
  }
  
  // Crea un'istanza globale del gestore audio
  const audioManager = new AudioManager();
  
  // Esporta l'istanza
  export default audioManager;