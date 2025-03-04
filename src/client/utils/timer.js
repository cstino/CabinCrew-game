// src/client/utils/timer.js

function startCountdown(seconds, onTick, onComplete) {
  const countdownTimer = document.getElementById('countdown-timer');
  const timerValue = document.getElementById('timer-value');

  // Show the timer
  countdownTimer.classList.remove('hidden');

  // Set initial value
  timerValue.textContent = seconds;

  // Start countdown
  let remaining = seconds;
  const interval = setInterval(() => {
    remaining--;

    // Update display
    timerValue.textContent = remaining;

    // Call tick callback if provided
    if (onTick) {
      onTick(remaining);
    }

    // Check if completed
    if (remaining <= 0) {
      clearInterval(interval);
      countdownTimer.classList.add('hidden');

      // Call complete callback if provided
      if (onComplete) {
        onComplete();
      }
    }
  }, 1000);

  return {
    cancel: () => {
      clearInterval(interval);
      countdownTimer.classList.add('hidden');
    },
  };
}

export { startCountdown };
