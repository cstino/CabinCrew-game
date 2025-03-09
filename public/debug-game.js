document.addEventListener('DOMContentLoaded', function() {
    // Nasconde i pulsanti precedenti per evitare confusione
    setTimeout(() => {
      const allDebugButtons = document.querySelectorAll('button[style*="position: fixed"]');
      allDebugButtons.forEach(btn => {
        if (btn.textContent === 'Replace Game Room' || 
            btn.textContent === 'Diagnose Game Room' ||
            btn.textContent === 'Test Game Room' ||
            btn.textContent === 'Fix Game Room') {
          btn.style.display = 'none';
        }
      });
    }, 1000);
  });