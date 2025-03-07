// badgeManager.js - Sistema di badge per CabinCrew
import { db } from './firebaseConfig.js';
import { doc, getDoc, updateDoc, arrayUnion, setDoc } from 'firebase/firestore';

class BadgeManager {
  constructor() {
    this.badges = {
      "season1-badge": {
        id: "season1-badge",
        name: "Season 1",
        image: "asset/images/badges/season1-badge.png",
        description: "Badge della Season 1 (07 Marzo - 15 Aprile 2025)",
        requirement: "Registrazione durante la Season 1",
        isDefault: true
      },
      "ryanair-badge": {
        id: "ryanair-badge",
        name: "Ryanair",
        image: "asset/images/badges/ryanair-badge.png",
        description: "Badge Ryanair",
        requirement: "Ottieni la prima vittoria"
      },
      "easyjet-badge": {
        id: "easyjet-badge",
        name: "EasyJet",
        image: "asset/images/badges/easyjet-badge.png",
        description: "Badge EasyJet",
        requirement: "Ottieni 3 vittorie"
      },
      "alitalia-badge": {
        id: "alitalia-badge",
        name: "Alitalia",
        image: "asset/images/badges/alitalia-badge.png",
        description: "Badge Alitalia",
        requirement: "Ottieni un moltiplicatore uguale a x1,00"
      },
      "vueling-badge": {
        id: "vueling-badge",
        name: "Vueling",
        image: "asset/images/badges/vueling-badge.png",
        description: "Badge Vueling",
        requirement: "Ottieni 5 vittorie"
      },
      "wizz-badge": {
        id: "wizz-badge",
        name: "WizzAir",
        image: "asset/images/badges/wizz-badge.png",
        description: "Badge WizzAir",
        requirement: "Ottieni un moltiplicatore maggiore di x4,99"
      },
      "lufthansa-badge": {
        id: "lufthansa-badge",
        name: "Lufthansa",
        image: "asset/images/badges/lufthansa-badge.png",
        description: "Badge Lufthansa",
        requirement: "Ottieni 10 vittorie"
      },
      "klm-badge": {
        id: "klm-badge",
        name: "KLM",
        image: "asset/images/badges/klm-badge.png",
        description: "Badge KLM",
        requirement: "Ottieni un moltiplicatore maggiore di x9,99"
      },
      "airfrance-badge": {
        id: "airfrance-badge",
        name: "AirFrance",
        image: "asset/images/badges/airfrance-badge.png",
        description: "Badge AirFrance",
        requirement: "Ottieni 20 vittorie"
      },
      "british-badge": {
        id: "british-badge",
        name: "British Airways",
        image: "asset/images/badges/british-badge.png",
        description: "Badge British Airways",
        requirement: "Ottieni 30 vittorie"
      },
      "finnair-badge": {
        id: "finnair-badge",
        name: "FinnAir",
        image: "asset/images/badges/finnair-badge.png",
        description: "Badge FinnAir",
        requirement: "Partecipa ad almeno 50 partite"
      }
    };
  }

  // Inizializza i badge per un nuovo utente
  async initializeUserBadges(userId) {
    try {
      console.log('Inizializzazione badge per utente:', userId);
      // Verifica se l'utente ha già dati sui badge
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists() && userDoc.data().badges && userDoc.data().badges.length > 0) {
        console.log('I badge utente esistono già:', userDoc.data().badges);
        return userDoc.data().badges;
      }
      
      // Per ora, inizializziamo sempre con il badge Season 1 come default
      // In un'applicazione reale, verificheremmo effettivamente la data
      const defaultBadges = ["season1-badge"];
      
      /*
      // Questa è la versione che utilizza la data reale
      const currentDate = new Date();
      const season1StartDate = new Date('2025-03-07');
      const season1EndDate = new Date('2025-04-15');
      
      // Verifica se la data di registrazione rientra nella season 1
      const defaultBadges = [];
      if (currentDate >= season1StartDate && currentDate <= season1EndDate) {
        defaultBadges.push("season1-badge");
      }
      */
      
      // Verifica se il documento utente esiste
      if (!userDoc.exists()) {
        // Crea il documento utente per la prima volta
        await setDoc(userDocRef, {
          badges: defaultBadges,
          selectedBadge: defaultBadges[0],
          stats: {
            totalGames: 0,
            highestMultiplier: 0,
            wins: 0
          },
          createdAt: new Date()
        });
      } else {
        // Aggiorna il documento esistente dell'utente con i badge di default
        await updateDoc(userDocRef, {
          badges: defaultBadges,
          selectedBadge: defaultBadges[0],
          stats: {
            totalGames: 0,
            highestMultiplier: 0,
            wins: 0
          }
        }, { merge: true });
      }
      
      console.log('Badge utente inizializzati:', defaultBadges);
      return defaultBadges;
    } catch (error) {
      console.error('Errore nell\'inizializzazione dei badge:', error);
      return ["season1-badge"]; // Fallback a default in caso di errore
    }
  }

  // Ottieni i badge dell'utente
  async getUserBadges(userId) {
    try {
      console.log('Recupero badge per utente:', userId);
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        console.log('Utente non trovato, inizializzazione nuovo profilo');
        try {
          // Inizializza i badge per un nuovo utente
          const badges = await this.initializeUserBadges(userId);
          return { 
            badges: badges || ["season1-badge"], 
            selectedBadge: badges && badges.length > 0 ? badges[0] : "season1-badge" 
          };
        } catch (initError) {
          console.error('Errore nell\'inizializzazione dei badge:', initError);
          // Fallback: usa il badge predefinito
          return { badges: ["season1-badge"], selectedBadge: "season1-badge" };
        }
      }
      
      const userData = userDoc.data();
      console.log('Dati utente recuperati:', userData);
      
      if (!userData.badges || userData.badges.length === 0) {
        // Inizializza i badge se non esistono
        console.log('Badge non trovati, inizializzazione...');
        try {
          const badges = await this.initializeUserBadges(userId);
          return { 
            badges: badges || ["season1-badge"], 
            selectedBadge: badges && badges.length > 0 ? badges[0] : "season1-badge" 
          };
        } catch (initError) {
          console.error('Errore nell\'inizializzazione dei badge:', initError);
          // Fallback: usa il badge predefinito
          return { badges: ["season1-badge"], selectedBadge: "season1-badge" };
        }
      }
      
      return { 
        badges: userData.badges || ["season1-badge"], 
        selectedBadge: userData.selectedBadge || userData.badges[0] || "season1-badge" 
      };
    } catch (error) {
      console.error('Errore nel recupero dei badge:', error);
      // Fallback: usa il badge predefinito
      return { badges: ["season1-badge"], selectedBadge: "season1-badge" };
    }
  }

  // Cambia il badge selezionato dall'utente
  async selectBadge(userId, badgeId) {
    try {
      // Verifica che l'utente abbia effettivamente quel badge
      const { badges } = await this.getUserBadges(userId);
      if (!badges.includes(badgeId)) {
        console.error('Badge non disponibile per questo utente');
        return false;
      }
      
      // Aggiorna il badge selezionato
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        selectedBadge: badgeId
      });
      
      console.log('Badge selezionato aggiornato:', badgeId);
      return true;
    } catch (error) {
      console.error('Errore nella selezione del badge:', error);
      return false;
    }
  }

  // Sblocca un nuovo badge per l'utente
  async unlockBadge(userId, badgeId) {
    try {
      // Verifica che l'utente non abbia già il badge
      const { badges } = await this.getUserBadges(userId);
      if (badges.includes(badgeId)) {
        console.log('Badge già sbloccato');
        return true;
      }
      
      // Aggiungi il badge all'array
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        badges: arrayUnion(badgeId)
      });
      
      console.log('Badge sbloccato:', badgeId);
      return true;
    } catch (error) {
      console.error('Errore nello sblocco del badge:', error);
      return false;
    }
  }

  // Verifica e sblocca eventuali badge in base ai progressi
  async checkBadgeAchievements(userId, stats) {
    try {
      const { wins, highestMultiplier, totalGames } = stats;
      const { badges } = await this.getUserBadges(userId);
      
      // Controllo per i badge basati sulle vittorie
      if (wins >= 1 && !badges.includes('ryanair-badge')) {
        await this.unlockBadge(userId, 'ryanair-badge');
      }
      
      if (wins >= 3 && !badges.includes('easyjet-badge')) {
        await this.unlockBadge(userId, 'easyjet-badge');
      }
      
      if (wins >= 5 && !badges.includes('vueling-badge')) {
        await this.unlockBadge(userId, 'vueling-badge');
      }
      
      if (wins >= 10 && !badges.includes('lufthansa-badge')) {
        await this.unlockBadge(userId, 'lufthansa-badge');
      }
      
      if (wins >= 20 && !badges.includes('airfrance-badge')) {
        await this.unlockBadge(userId, 'airfrance-badge');
      }
      
      if (wins >= 30 && !badges.includes('british-badge')) {
        await this.unlockBadge(userId, 'british-badge');
      }
      
      // Controllo per i badge basati sul moltiplicatore
      if (highestMultiplier === 1.00 && !badges.includes('alitalia-badge')) {
        await this.unlockBadge(userId, 'alitalia-badge');
      }
      
      if (highestMultiplier > 4.99 && !badges.includes('wizz-badge')) {
        await this.unlockBadge(userId, 'wizz-badge');
      }
      
      if (highestMultiplier > 9.99 && !badges.includes('klm-badge')) {
        await this.unlockBadge(userId, 'klm-badge');
      }
      
      // Controllo per il badge basato sul numero totale di partite
      if (totalGames >= 50 && !badges.includes('finnair-badge')) {
        await this.unlockBadge(userId, 'finnair-badge');
      }
      
      return true;
    } catch (error) {
      console.error('Errore nel controllo dei badge:', error);
      return false;
    }
  }
  
  // Aggiorna le statistiche dell'utente
  async updateUserStats(userId, stats) {
    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, { stats }, { merge: true });
      
      // Controlla se sono stati sbloccati nuovi badge
      await this.checkBadgeAchievements(userId, stats);
      
      return true;
    } catch (error) {
      console.error('Errore nell\'aggiornamento delle statistiche:', error);
      return false;
    }
  }
  
  // Ottieni le informazioni di un badge specifico
  getBadgeInfo(badgeId) {
    return this.badges[badgeId] || null;
  }
  
  // Ottieni tutte le informazioni dei badge
  getAllBadges() {
    return this.badges;
  }
}

// Crea un'istanza del badge manager
const badgeManager = new BadgeManager();

export default badgeManager;