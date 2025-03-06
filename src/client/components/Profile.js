// src/client/components/Profile.js
import { getCurrentUser } from './Auth.js';

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

function loadProfileData() {
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

  // For demo purposes, we'll use mock data
  // In a real app, this would be fetched from Firebase
  const profileData = {
    totalGames: 27,
    highestMultiplier: 8.54,
    gamesWon: 12,
    badges: [
      { id: 'first_win', name: 'First Win', icon: '🏆' },
      { id: 'high_flyer', name: 'High Flyer', icon: '✈️' },
      { id: 'survivor', name: 'Survivor', icon: '🛡️' },
      { id: 'risk_taker', name: 'Risk Taker', icon: '🎯' },
    ],
    selectedBadge: 'high_flyer',
  };

  // Update stats
  document.getElementById('total-games').textContent = profileData.totalGames;
  document.getElementById(
    'highest-multiplier'
  ).textContent = `${profileData.highestMultiplier.toFixed(2)}x`;
  document.getElementById('games-won').textContent = profileData.gamesWon;

  // Update badges
  const badgesList = document.getElementById('badges-list');
  badgesList.innerHTML = '';

  profileData.badges.forEach((badge) => {
    const badgeItem = document.createElement('div');
    badgeItem.className = `badge-item ${
      badge.id === profileData.selectedBadge ? 'badge-selected' : ''
    }`;
    badgeItem.dataset.badgeId = badge.id;

    const badgeIcon = document.createElement('div');
    badgeIcon.className = 'badge-icon';
    badgeIcon.textContent = badge.icon;

    const badgeName = document.createElement('div');
    badgeName.className = 'badge-name';
    badgeName.textContent = badge.name;

    badgeItem.appendChild(badgeIcon);
    badgeItem.appendChild(badgeName);

    // Add click handler to select badge
    badgeItem.addEventListener('click', () => selectBadge(badge.id));

    badgesList.appendChild(badgeItem);
  });

  // Set selected badge in header
  const selectedBadge = profileData.badges.find(
    (b) => b.id === profileData.selectedBadge
  );
  if (selectedBadge) {
    document.getElementById(
      'selected-badge'
    ).textContent = `${selectedBadge.icon} ${selectedBadge.name}`;
  }
}

function selectBadge(badgeId) {
  // Update UI
  document.querySelectorAll('.badge-item').forEach((item) => {
    item.classList.remove('badge-selected');
    if (item.dataset.badgeId === badgeId) {
      item.classList.add('badge-selected');
    }
  });

  // Get badge info
  const badgeIcon = document.querySelector(
    `.badge-item[data-badge-id="${badgeId}"] .badge-icon`
  ).textContent;
  const badgeName = document.querySelector(
    `.badge-item[data-badge-id="${badgeId}"] .badge-name`
  ).textContent;

  // Update selected badge display
  document.getElementById(
    'selected-badge'
  ).textContent = `${badgeIcon} ${badgeName}`;
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
function saveUsername() {
  const newUsernameInput = document.getElementById('new-username');
  const newUsername = newUsernameInput.value.trim();
  
  if (!newUsername) {
    alert('Inserisci un username valido');
    return;
  }
  
  // Ottieni l'utente corrente
  const user = getCurrentUser();
  if (!user) return;
  
  // Aggiorna lo username nell'utente corrente (questa è una simulazione)
  // In una vera app, qui si aggiornerebbero i dati su Firebase
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
  
  // Chiudi il modal
  closeEditUsernameModal();
}

export { setupProfileListeners };
