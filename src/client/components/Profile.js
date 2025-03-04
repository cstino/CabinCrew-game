// src/client/components/Profile.js
import { getCurrentUser } from './Auth.js';

function setupProfileListeners() {
  // Load profile data when profile screen is shown
  document
    .getElementById('profile-button')
    .addEventListener('click', loadProfileData);
}

function loadProfileData() {
  const user = getCurrentUser();
  if (!user) return;

  // Update username
  document.getElementById('profile-username').textContent = user.username;

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

export { setupProfileListeners };
