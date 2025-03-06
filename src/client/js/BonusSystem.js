// BonusSystem.js - Sistema di bonus per CabinCrew

class BonusSystem {
    constructor() {
      // Definizione dei tipi di bonus disponibili
      this.bonusTypes = {
        resurrection: {
          name: "Resurrection",
          description: "Salva automaticamente il giocatore aggiungendo 0.10 crediti quando il saldo scende sotto 0.10",
          icon: "🔄"
        },
        doubleMultiplier: {
          name: "x2 Boost",
          description: "Raddoppia il moltiplicatore ottenuto in un round",
          icon: "✖️2"
        },
        shield: {
          name: "Scudo",
          description: "Protegge dalla perdita dei crediti in caso di crash per un round",
          icon: "🛡️"
        }
      };
      
      // Probabilità che appaia un bonus alla fine di un round (%)
      this.bonusChance = 30;
    }
  
    // Determina se assegnare un bonus alla fine del round
    shouldAwardBonus() {
      return Math.random() * 100 <= this.bonusChance;
    }
  
    // Seleziona un bonus casuale da assegnare
    getRandomBonus() {
      const bonusKeys = Object.keys(this.bonusTypes);
      const randomIndex = Math.floor(Math.random() * bonusKeys.length);
      const bonusKey = bonusKeys[randomIndex];
      
      return {
        type: bonusKey,
        ...this.bonusTypes[bonusKey]
      };
    }
    
    // Applica l'effetto del bonus per un giocatore
    applyBonus(player, bonusType) {
      if (!player.bonuses) player.bonuses = [];
      
      switch (bonusType) {
        case 'resurrection':
          player.hasResurrection = true;
          break;
          
        case 'doubleMultiplier':
          player.hasDoubleMultiplier = true;
          break;
          
        case 'shield':
          player.hasShield = true;
          break;
      }
      
      return true;
    }
    
    // Controlla e applica il bonus resurrection
    checkResurrection(player) {
      if (player.hasResurrection && player.credits < 0.10 && player.credits > 0) {
        player.credits += 0.10;
        player.hasResurrection = false;
        return true;
      }
      return false;
    }
    
    // Calcola la vincita con bonus
    calculateWinWithBonus(player, bet, multiplier) {
      let finalMultiplier = multiplier;
      
      if (player.hasDoubleMultiplier) {
        finalMultiplier *= 2;
        player.hasDoubleMultiplier = false;
      }
      
      return bet * finalMultiplier;
    }
    
    // Gestisce il caso di crash
    handleCrash(player, bet) {
      if (player.hasShield) {
        player.hasShield = false;
        return 0; // Non perde crediti
      }
      return -bet; // Perde la scommessa
    }
  }
  
  // Crea un'istanza globale
  const bonusSystem = new BonusSystem();
  
  // Esporta l'istanza
  export default bonusSystem;