// Global state stored on window for cross-module access
window.currentUser = window.currentUser ?? null;
window.collectionsData = window.collectionsData ?? [];
window.currentCollection = window.currentCollection ?? null;

const API = window.API;

function clearErrors(): void {
  document.querySelectorAll('.error').forEach(el => el.classList.add('hidden'));
}

function showError(elementId: string, message: string): void {
  const el = document.getElementById(elementId);
  if (el) {
    el.textContent = message;
    el.classList.remove('hidden');
  }
}

async function handleRegister(): Promise<void> {
  clearErrors();
  const name = (document.getElementById('regName') as HTMLInputElement).value.trim();
  const surname = (document.getElementById('regSurname') as HTMLInputElement).value.trim();
  const username = (document.getElementById('regUsername') as HTMLInputElement).value.trim();
  const email = (document.getElementById('regEmail') as HTMLInputElement).value.trim();
  const password = (document.getElementById('regPassword') as HTMLInputElement).value.trim();

  if (!name) { showError('regNameError', 'Nome richiesto'); return; }
  if (!surname) { showError('regSurnameError', 'Cognome richiesto'); return; }
  if (!username) { showError('regUsernameError', 'Username richiesto'); return; }
  if (!email) { showError('regEmailError', 'Email richiesta'); return; }
  if (!password) { showError('regPasswordError', 'Password richiesta'); return; }

  try {
    const result = await API.register({ name, surname, username, email, password });
    if (!result.ok) {
      showError('registerError', (result.data as any)?.error || 'Errore registrazione');
      return;
    }
    await handleLogin(email, password);
  } catch (error) {
    showError('registerError', 'Errore di connessione');
  }
}

async function handleLogin(emailArg?: string, passwordArg?: string): Promise<void> {
  clearErrors();
  const email = emailArg || (document.getElementById('loginEmail') as HTMLInputElement).value.trim();
  const password = passwordArg || (document.getElementById('loginPassword') as HTMLInputElement).value.trim();

  if (!email) { showError('loginEmailError', 'Email richiesta'); return; }
  if (!password) { showError('loginPasswordError', 'Password richiesta'); return; }

  try {
    const result = await API.login({ email, password });
    if (!result.ok) {
      showError('loginError', (result.data as any)?.error || 'Credenziali non valide');
      return;
    }

    // Expect structure: { user: { id, name, surname, email } }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    window.currentUser = (result.data as any).user as typeof window.currentUser;
    localStorage.setItem('user', JSON.stringify(window.currentUser));
    window.showCollectionsView();
  } catch (error) {
    showError('loginError', 'Errore di connessione');
  }
}

function toggleAuthForm(): void {
  document.getElementById('loginForm')?.classList.toggle('hidden');
  document.getElementById('registerForm')?.classList.toggle('hidden');
  clearErrors();
}

function handleLogout(): void {
  localStorage.removeItem('user');
  window.currentUser = null;
  window.collectionsData = [];
  window.currentCollection = null;

  document.getElementById('collectionsView')?.classList.add('hidden');
  document.getElementById('collectionDetailView')?.classList.add('hidden');
  document.getElementById('loginSection')?.classList.remove('hidden');
  document.getElementById('loginForm')?.classList.remove('hidden');
  document.getElementById('registerForm')?.classList.add('hidden');
  const email = document.getElementById('loginEmail') as HTMLInputElement | null;
  const pwd = document.getElementById('loginPassword') as HTMLInputElement | null;
  if (email) email.value = '';
  if (pwd) pwd.value = '';
  clearErrors();
}

// Expose handlers globally for inline HTML usage
window.handleRegister = handleRegister;
window.handleLogin = handleLogin;
window.toggleAuthForm = toggleAuthForm;
window.handleLogout = handleLogout;

export {};
