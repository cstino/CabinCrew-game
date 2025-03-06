// authManager.js con Firebase
import { auth } from './firebaseConfig.js';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut
} from 'firebase/auth';

export function initAuth() {
  const loginTab = document.getElementById('login-tab');
  const registerTab = document.getElementById('register-tab');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const switchToRegister = document.getElementById('switch-to-register');
  const switchToLogin = document.getElementById('switch-to-login');
  const loginButton = document.getElementById('login-button');
  const registerButton = document.getElementById('register-button');

  if (!loginTab || !registerTab || !loginForm || !registerForm) {
    console.error('Elementi DOM per autenticazione non trovati');
    return;
  }

  // Event listener per le tabs
  loginTab.addEventListener('click', showLoginForm);
  registerTab.addEventListener('click', showRegisterForm);

  // Event listener per i link
  if (switchToRegister) switchToRegister.addEventListener('click', e => {
    e.preventDefault();
    showRegisterForm();
  });

  if (switchToLogin) switchToLogin.addEventListener('click', e => {
    e.preventDefault();
    showLoginForm();
  });

  // Event listener per i form
  if (loginButton) loginButton.addEventListener('click', handleLogin);
  if (registerButton) registerButton.addEventListener('click', handleRegister);

  // Mostra il form di login
  function showLoginForm() {
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
  }

  // Mostra il form di registrazione
  function showRegisterForm() {
    registerTab.classList.add('active');
    loginTab.classList.remove('active');
    registerForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
  }

  // Gestisce il login con Firebase
  async function handleLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
      alert('Compila tutti i campi richiesti');
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      if (!user.emailVerified) {
        alert('Per favore verifica la tua email prima di accedere.');
        return;
      }
      
      // Salva i dati utente nella sessione
      sessionStorage.setItem('user', JSON.stringify({
        id: user.uid,
        username: user.displayName || email.split('@')[0],
        email: user.email
      }));
      
      // Reindirizza alla lobby
      showLobbyScreen();
    } catch (error) {
      console.error(error);
      alert('Errore di login: ' + error.message);
    }
  }

  // Gestisce la registrazione con Firebase
  async function handleRegister() {
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;

    // Validazione
    if (!username || !email || !password || !confirmPassword) {
      alert('Compila tutti i campi richiesti');
      return;
    }

    if (password !== confirmPassword) {
      alert('Le password non corrispondono');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Invia email di verifica
      await sendEmailVerification(user);
      
      alert('Registrazione completata! Ti abbiamo inviato un\'email di conferma.');
      showLoginForm();
    } catch (error) {
      console.error(error);
      alert('Errore di registrazione: ' + error.message);
    }
  }
}

// Funzione per mostrare la lobby
function showLobbyScreen() {
  document.getElementById('auth-screen').classList.add('hidden');
  document.getElementById('lobby-screen').classList.remove('hidden');
}

// Verifica autenticazione
export function checkAuth() {
  auth.onAuthStateChanged(user => {
    if (user && user.emailVerified) {
      sessionStorage.setItem('user', JSON.stringify({
        id: user.uid,
        username: user.displayName || user.email.split('@')[0],
        email: user.email
      }));
      showLobbyScreen();
      return true;
    }
    return false;
  });
}

// Logout
export function logout() {
  signOut(auth).then(() => {
    sessionStorage.removeItem('user');
    document.getElementById('lobby-screen').classList.add('hidden');
    document.getElementById('auth-screen').classList.remove('hidden');
    
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    if (loginTab && registerTab && loginForm && registerForm) {
      loginTab.classList.add('active');
      registerTab.classList.remove('active');
      loginForm.classList.remove('hidden');
      registerForm.classList.add('hidden');
    }
  }).catch(error => {
    console.error('Errore durante il logout:', error);
  });
}