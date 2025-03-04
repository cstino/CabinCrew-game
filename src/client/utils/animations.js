// src/client/utils/animations.js

function updateMultiplierAnimation(multiplier) {
  const maxMultiplier = 10; // Per l'animazione visuale
  const animationElement = document.getElementById('multiplier-animation');

  // Calcola percentuale del massimo (limitata al 100%)
  const percentage = Math.min((multiplier / maxMultiplier) * 100, 100);

  // Aggiorna l'altezza in base alla percentuale
  animationElement.style.height = `${percentage}%`;

  // Cambia colore in base al valore (verde->giallo->rosso)
  let color;
  if (multiplier < 2) {
    // Verde-giallo (1.0 a 2.0)
    const green = 255;
    const red = Math.floor(255 * ((multiplier - 1) / 1));
    color = `rgba(${red}, ${green}, 0, 0.2)`;
  } else if (multiplier < 5) {
    // Giallo-rosso (2.0 a 5.0)
    const green = Math.floor(255 * (1 - (multiplier - 2) / 3));
    color = `rgba(255, ${green}, 0, 0.3)`;
  } else {
    // Rosso intenso per valori alti (5.0+)
    color = 'rgba(255, 0, 0, 0.4)';
  }

  animationElement.style.backgroundColor = color;
}

function animateCrash() {
  const multiplierContainer = document.querySelector('.multiplier-container');
  const animationElement = document.getElementById('multiplier-animation');

  // Aggiungi animazione shake
  multiplierContainer.classList.add('shake');

  // Cambia sfondo in rosso
  animationElement.style.backgroundColor = 'rgba(255, 0, 0, 0.6)';
  animationElement.style.height = '100%';

  // Cambia testo in "CRASHED!"
  const multiplierDisplay = document.getElementById('multiplier-display');
  multiplierDisplay.textContent = 'CRASHED!';
  multiplierDisplay.style.color = '#ea4335';

  // Rimuovi shake dopo l'animazione
  setTimeout(() => {
    multiplierContainer.classList.remove('shake');
  }, 1000);
}

// Aggiungi CSS per animazione shake
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes shake {
    0% { transform: translate(0, 0); }
    10% { transform: translate(-10px, 0); }
    20% { transform: translate(10px, 0); }
    30% { transform: translate(-10px, 0); }
    40% { transform: translate(10px, 0); }
    50% { transform: translate(-10px, 0); }
    60% { transform: translate(10px, 0); }
    70% { transform: translate(-10px, 0); }
    80% { transform: translate(10px, 0); }
    90% { transform: translate(-10px, 0); }
    100% { transform: translate(0, 0); }
  }
  
  .shake {
    animation: shake 0.5s;
  }
`;
document.head.appendChild(styleSheet);

export { updateMultiplierAnimation, animateCrash };
