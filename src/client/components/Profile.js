// src/client/components/Profile.js
import { getCurrentUser } from './Auth.js';
import badgeManager from '../js/badgeManager.js';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../js/firebaseConfig.js';

// HTML for the edit username modal
const editUsernameModalHTML = `
<div id="edit-username-modal" class="modal hidden">
  <div class="modal-content">
    <div class="modal-header">
      <h3>Modifica Username</h3>
      <button class="close-modal">×</button>
    </div>
    <div class="modal-body">
      <input type="text" id="new-username" placeholder="Nuovo username">
      <button id="save-username-button" class="primary-button">Salva</button>
    </div>
  </div>
</div>
`;

function setupProfileListeners() {
  // Carica i dati del profilo quando si apre il profilo
  // Troviamo il pulsante che apre la tab del profilo
  const profileTabButton = document.querySelector('.tab-button[data-tab="profile-tab"]');
  if (profileTabButton) {
    profileTabButton.addEventListener('click', function() {
      // Carichiamo i dati del profilo quando si clicca sul tab
      setTimeout(loadProfileData, 50);
    });
  }
  
  // Non intercettiamo più il click sull'userProfileCard per evitare conflitti
  // con l'event handler già definito in index.html
  
  // Carichiamo i dati all'inizializzazione
  loadProfileData();
  
  // E li ricarichiamo anche dopo un piccolo ritardo
  // per assicurarci che l'UI sia completamente caricata
  setTimeout(loadProfileData, 500);
}

async function loadProfileData() {
  const user = getCurrentUser();
  if (!user) return;

  // Update username with edit button
  const usernameElements = document.querySelectorAll('.profile-username');
  
  // Aggiorniamo tutti gli elementi con classe profile-username
  usernameElements.forEach(element => {
    // Salviamo il testo dell'username
    const username = user.username;
    
    // Clear the element
    element.innerHTML = '';
    
    // Create username text
    const usernameText = document.createElement('span');
    usernameText.textContent = username;
    element.appendChild(usernameText);
    
    // Create edit button
    const editButton = document.createElement('button');
    editButton.className = 'edit-button';
    editButton.innerHTML = '<span>✏️</span>';
    editButton.addEventListener('click', openEditUsernameModal);
    element.appendChild(editButton);
  });
  
  // Aggiorniamo anche tutti gli elementi non ancora con la classe ma con ID profile-username
  const profileUsernameElement = document.getElementById('profile-username');
  if (profileUsernameElement && !profileUsernameElement.querySelector('.edit-button')) {
    // Salva il testo corrente se non è vuoto, altrimenti usa user.username
    const usernameText = profileUsernameElement.textContent.trim() || user.username;
    
    // Aggiungi la classe per futuri aggiornamenti
    profileUsernameElement.classList.add('profile-username');
    
    // Clear the element
    profileUsernameElement.innerHTML = '';
    
    // Create username text
    const usernameSpan = document.createElement('span');
    usernameSpan.textContent = usernameText;
    profileUsernameElement.appendChild(usernameSpan);
    
    // Create edit button
    const editButton = document.createElement('button');
    editButton.className = 'edit-button';
    editButton.innerHTML = '<span>✏️</span>';
    editButton.addEventListener('click', openEditUsernameModal);
    profileUsernameElement.appendChild(editButton);
  }

  try {
    const userId = user.uid || user.id;
    console.log('Caricamento profilo per utente:', userId);
    
    // Ottieni i badge e le statistiche dell'utente da Firebase
    let { badges, selectedBadge } = await badgeManager.getUserBadges(userId);
    
    // Inizializzazione badge se necessario
    if (!badges || badges.length === 0) {
      console.log('Inizializzazione badge utente...');
      badges = await badgeManager.initializeUserBadges(userId);
      selectedBadge = badges && badges.length > 0 ? badges[0] : null;
    }
    
    console.log('Badge utente:', badges, 'Badge selezionato:', selectedBadge);
    
    // Ottieni anche le statistiche dell'utente
    let userStats = {
      totalGames: 0,
      highestMultiplier: 0,
      wins: 0
    };
    
    // Controllo se ci sono statistiche locali da sincronizzare
    const localStats = getLocalStats();
    if (localStats) {
      // Aggiorna le statistiche su Firebase
      await badgeManager.updateUserStats(userId, localStats);
      userStats = localStats;
    }
    
    // Update stats nella UI
    updateStatsDisplay(userStats);
    
    // Carica i badge nella UI
    await loadBadgesUI(badges, selectedBadge, userId);
    
  } catch (error) {
    console.error('Errore nel caricamento del profilo:', error);
    // In caso di errore, mostriamo dati locali
    const localStats = getLocalStats();
    if (localStats) {
      updateStatsDisplay(localStats);
    }
    
    // In caso di errore, carica almeno il badge predefinito
    try {
      await loadBadgesUI(["season1-badge"], "season1-badge", user.uid || user.id);
    } catch (badgeError) {
      console.error('Errore nel caricamento fallback dei badge:', badgeError);
    }
  }
}

// Funzione per ottenere statistiche locali (da SessionStorage)
function getLocalStats() {
  try {
    const userData = JSON.parse(sessionStorage.getItem('user'));
    if (userData && userData.stats) {
      return userData.stats;
    }
    
    // Se non ci sono statistiche, crea una struttura di base
    return {
      totalGames: 0,
      highestMultiplier: 0,
      wins: 0
    };
  } catch (error) {
    console.error('Errore nel recupero delle statistiche locali:', error);
    return null;
  }
}

// Funzione per aggiornare la visualizzazione delle statistiche
function updateStatsDisplay(stats) {
  document.getElementById('total-games').textContent = stats.totalGames || 0;
  document.getElementById(
    'highest-multiplier'
  ).textContent = `${(stats.highestMultiplier || 0).toFixed(2)}x`;
  document.getElementById('games-won').textContent = stats.wins || 0;
}

// Funzione per caricare i badge nella UI
async function loadBadgesUI(userBadges = [], selectedBadgeId, userId) {
  const badgesList = document.getElementById('badges-list');
  if (!badgesList) return;
  
  badgesList.innerHTML = '';
  
  console.log("Caricamento badge:", userBadges, "Badge selezionato:", selectedBadgeId);
  
  // Se userBadges è undefined, inizializziamo con il badge di default
  if (!userBadges || userBadges.length === 0) {
    try {
      const initializedBadges = await badgeManager.initializeUserBadges(userId);
      userBadges = initializedBadges || ["season1-badge"];
      selectedBadgeId = selectedBadgeId || "season1-badge";
      console.log("Badge inizializzati:", userBadges);
    } catch (error) {
      console.error("Errore nell'inizializzazione dei badge:", error);
      userBadges = ["season1-badge"];
    }
  }
  
  // Ottieni tutte le informazioni dei badge disponibili
  const allBadges = badgeManager.getAllBadges();
  
  // Crea il layout con tre righe di badge
  const badgeRows = document.createElement('div');
  badgeRows.className = 'badge-rows';
  
  // Prima riga: Season Badge
  const seasonRow = document.createElement('div');
  seasonRow.className = 'badge-row season-row';
  
  // Seconda riga: Prima serie di 5 badge
  const firstRow = document.createElement('div');
  firstRow.className = 'badge-row';
  
  // Terza riga: Seconda serie di 5 badge
  const secondRow = document.createElement('div');
  secondRow.className = 'badge-row';
  
  // Categorizza i badge per righe
  Object.values(allBadges).forEach(badge => {
    const isUnlocked = userBadges.includes(badge.id);
    const isSelected = selectedBadgeId === badge.id;
    
    const badgeItem = document.createElement('div');
    badgeItem.className = `badge-item ${isUnlocked ? '' : 'badge-locked'} ${isSelected ? 'selected badge-selected' : ''}`;
    badgeItem.dataset.badgeId = badge.id;
    
    // Crea l'icona del badge
    const badgeIcon = document.createElement('div');
    badgeIcon.className = 'badge-icon';
    
    // Aggiungi l'immagine del badge
    const badgeImage = document.createElement('img');
    badgeImage.src = badge.image;
    badgeImage.alt = badge.name;
    badgeImage.onerror = () => {
      console.warn("Errore nel caricamento dell'immagine badge:", badge.image);
      // Fallback a un'immagine predefinita o a un placeholder
      badgeImage.src = 'asset/images/badges/default-badge.png';
    };
    badgeIcon.appendChild(badgeImage);
    
    // Crea il nome del badge
    const badgeName = document.createElement('div');
    badgeName.className = 'badge-name';
    badgeName.textContent = badge.name;
    
    // Crea tooltip per mostrare i requisiti del badge
    const badgeTooltip = document.createElement('div');
    badgeTooltip.className = 'badge-tooltip';
    badgeTooltip.textContent = isUnlocked ? 
      `Badge sbloccato: ${badge.description}` : 
      `Requisito: ${badge.requirement}`;
      
    // Aggiungi freccia al tooltip
    const tooltipArrow = document.createElement('div');
    tooltipArrow.className = 'tooltip-arrow';
    badgeTooltip.appendChild(tooltipArrow);
    
    badgeItem.appendChild(badgeIcon);
    badgeItem.appendChild(badgeName);
    badgeItem.appendChild(badgeTooltip);
    
    // Gestisci il tooltip al passaggio del mouse
    badgeItem.addEventListener('mouseenter', () => {
      badgeTooltip.style.display = 'block';
      // Verifica se il tooltip si trova fuori dalla schermata ed eventualmente riposizionalo
      const rect = badgeTooltip.getBoundingClientRect();
      if (rect.top < 0) {
        badgeTooltip.style.top = '80px';
        badgeTooltip.style.bottom = 'auto';
        
        // Modifica anche la freccia per puntare verso l'alto
        const arrow = badgeTooltip.querySelector('.tooltip-arrow');
        if (arrow) {
          arrow.style.top = '-8px';
          arrow.style.bottom = 'auto';
          arrow.style.borderBottom = '8px solid rgba(24, 25, 37, 0.9)';
          arrow.style.borderTop = 'none';
        }
      }
    });
    
    badgeItem.addEventListener('mouseleave', () => {
      badgeTooltip.style.display = 'none';
    });
    
    // Aggiungi event listener per selezionare il badge solo se è sbloccato
    if (isUnlocked) {
      badgeItem.addEventListener('click', () => selectBadge(badge.id, userId));
    }
    
    // Aggiungi il badge alla riga corrispondente
    if (badge.id === "season1-badge") {
      seasonRow.appendChild(badgeItem);
    } else if (["ryanair-badge", "easyjet-badge", "alitalia-badge", "vueling-badge", "wizz-badge"].includes(badge.id)) {
      firstRow.appendChild(badgeItem);
    } else {
      secondRow.appendChild(badgeItem);
    }
  });
  
  // Aggiungi le righe al contenitore principale
  badgeRows.appendChild(seasonRow);
  badgeRows.appendChild(firstRow);
  badgeRows.appendChild(secondRow);
  badgesList.appendChild(badgeRows);
  
  // Aggiorna anche il badge selezionato nel display
  updateSelectedBadgeDisplay(selectedBadgeId);
}

// Aggiorna il badge mostrato nell'intestazione del profilo
function updateSelectedBadgeDisplay(badgeId) {
  const badgeInfo = badgeManager.getBadgeInfo(badgeId);
  if (!badgeInfo) {
    console.warn("Badge info non trovate per:", badgeId);
    return;
  }
  
  console.log("Aggiornamento badge selezionato:", badgeId, badgeInfo);
  
  // Aggiorna il testo del badge nell'intestazione
  const selectedBadgeElement = document.getElementById('selected-badge');
  if (selectedBadgeElement) {
    selectedBadgeElement.innerHTML = '';
    
    // Crea l'immagine del badge
    const badgeImage = document.createElement('img');
    badgeImage.src = badgeInfo.image;
    badgeImage.alt = badgeInfo.name;
    badgeImage.className = 'selected-badge-img';
    badgeImage.style.width = '24px';
    badgeImage.style.height = '24px';
    badgeImage.style.marginRight = '8px';
    badgeImage.style.borderRadius = '50%';
    badgeImage.onerror = () => {
      console.warn("Errore nel caricamento dell'immagine badge:", badgeInfo.image);
      badgeImage.src = 'asset/images/badges/default-badge.png';
    };
    
    selectedBadgeElement.appendChild(badgeImage);
    selectedBadgeElement.appendChild(document.createTextNode(badgeInfo.name));
  } else {
    console.warn("Elemento selected-badge non trovato");
  }
  
  // Aggiorna anche il badge nella lobby e nell'UI
  const selectedBadgeIcon = document.getElementById('selected-badge-icon');
  if (selectedBadgeIcon) {
    selectedBadgeIcon.src = badgeInfo.image;
    selectedBadgeIcon.onerror = () => {
      console.warn("Errore nel caricamento dell'immagine badge:", badgeInfo.image);
      selectedBadgeIcon.src = 'asset/images/badges/default-badge.png';
    };
  } else {
    console.warn("Elemento selected-badge-icon non trovato");
  }
}

// Funzione per selezionare un badge
async function selectBadge(badgeId, userId) {
  try {
    // Aggiorna il badge selezionato in Firebase
    await badgeManager.selectBadge(userId, badgeId);
    
    // Aggiorna l'UI
    document.querySelectorAll('.badge-item').forEach((item) => {
      item.classList.remove('selected', 'badge-selected');
      if (item.dataset.badgeId === badgeId) {
        item.classList.add('selected', 'badge-selected');
      }
    });
    
    // Aggiorna il badge mostrato nell'intestazione
    updateSelectedBadgeDisplay(badgeId);
    
    // Aggiorna anche i dati dell'utente nella sessione
    const userData = JSON.parse(sessionStorage.getItem('user'));
    if (userData) {
      userData.selectedBadge = badgeId;
      sessionStorage.setItem('user', JSON.stringify(userData));
    }
    
    console.log('Badge selezionato aggiornato:', badgeId);
  } catch (error) {
    console.error('Errore nella selezione del badge:', error);
  }
}

// Funzione per aprire il modal di modifica username
function openEditUsernameModal() {
  // Assicuriamoci che il modal esista
  let modal = document.getElementById('edit-username-modal');
  
  // Se non esiste, lo creiamo
  if (!modal) {
    // Aggiungi il modal al DOM
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = editUsernameModalHTML;
    document.body.appendChild(modalContainer.firstElementChild);
    
    modal = document.getElementById('edit-username-modal');
    
    // Aggiungi event listener per chiudere il modal
    const closeButton = modal.querySelector('.close-modal');
    closeButton.addEventListener('click', closeEditUsernameModal);
    
    // Aggiungi event listener per salvare l'username
    const saveButton = modal.querySelector('#save-username-button');
    saveButton.addEventListener('click', saveUsername);
    
    // Chiudi il modal quando si clicca fuori dal contenuto
    modal.addEventListener('click', function(event) {
      if (event.target === modal) {
        closeEditUsernameModal();
      }
    });
    
    // Chiudi il modal con il tasto ESC
    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape' && !modal.classList.contains('hidden')) {
        closeEditUsernameModal();
      }
    });
  }
  
  // Prendiamo l'username corrente
  const user = getCurrentUser();
  if (user) {
    const newUsernameInput = modal.querySelector('#new-username');
    newUsernameInput.value = user.username;
  }
  
  // Mostriamo il modal
  modal.classList.remove('hidden');
}

// Funzione per chiudere il modal
function closeEditUsernameModal() {
  const modal = document.getElementById('edit-username-modal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

// Funzione per salvare il nuovo username
async function saveUsername() {
  const newUsernameInput = document.getElementById('new-username');
  const newUsername = newUsernameInput.value.trim();
  
  if (!newUsername) {
    alert('Inserisci un username valido');
    return;
  }
  
  // Ottieni l'utente corrente
  const user = getCurrentUser();
  if (!user) return;
  
  // Prima prova a verificare la disponibilità dell'username
  try {
    // Importa la funzione isUsernameAvailable e updateUsername
    const { isUsernameAvailable, updateUsername } = await import('../js/firebaseConfig.js');
    
    // Verifica se l'username è già in uso (controlla solo se è diverso da quello attuale)
    if (user.username !== newUsername) {
      const isAvailable = await isUsernameAvailable(newUsername);
      if (!isAvailable) {
        alert('Username già in uso. Scegline un altro.');
        return;
      }
      
      // Aggiorna l'username in Firebase
      const result = await updateUsername(user.uid || user.id, user.username, newUsername);
      if (!result.success) {
        alert(result.error || 'Errore nell\'aggiornamento dell\'username');
        return;
      }
    }
    
    // Aggiorna lo username nell'utente corrente
    const userData = JSON.parse(sessionStorage.getItem('user'));
    if (userData) {
      userData.username = newUsername;
      sessionStorage.setItem('user', JSON.stringify(userData));
      
      // Aggiorna anche nel localStorage se necessario
      if (userData.id) {
        localStorage.setItem('username_' + userData.id, newUsername);
      }
    }
    
    // Aggiorna tutti gli elementi UI che mostrano l'username
    document.querySelectorAll('.profile-username span').forEach(element => {
      element.textContent = newUsername;
    });
    
    // Aggiorna anche l'username nella lobby se visibile
    const lobbyUsernameDisplay = document.getElementById('username-display');
    if (lobbyUsernameDisplay) {
      lobbyUsernameDisplay.textContent = newUsername;
    }
    
    // Aggiorna qualsiasi elemento con ID profile-username
    const profileUsernameElement = document.getElementById('profile-username');
    if (profileUsernameElement && profileUsernameElement.querySelector('span')) {
      profileUsernameElement.querySelector('span').textContent = newUsername;
    }
    
    const profileTabUsername = document.getElementById('profile-tab-username');
    if (profileTabUsername) {
      profileTabUsername.textContent = newUsername;
    }
    
    // Chiudi il modal
    closeEditUsernameModal();
  } catch (error) {
    console.error('Errore nell\'aggiornamento dell\'username:', error);
    alert('Si è verificato un errore. Riprova più tardi.');
  }
}

export { setupProfileListeners };
