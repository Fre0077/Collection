let currentUser = null;
let collectionsData = [];
let currentCollection = null;

function clearErrors() {
    document.querySelectorAll('.error').forEach(el => el.classList.add('hidden'));
}

function showError(elementId, message) {
    const el = document.getElementById(elementId);
    if (el) {
        el.textContent = message;
        el.classList.remove('hidden');
    }
}

async function handleRegister() {
    clearErrors();
    const name = document.getElementById('regName').value.trim();
    const surname = document.getElementById('regSurname').value.trim();
    const username = document.getElementById('regUsername').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value.trim();

    if (!name) {
        showError('regNameError', 'Nome richiesto');
        return;
    }
    if (!surname) {
        showError('regSurnameError', 'Cognome richiesto');
        return;
    }
    if (!username) {
        showError('regUsernameError', 'Username richiesto');
        return;
    }
    if (!email) {
        showError('regEmailError', 'Email richiesta');
        return;
    }
    if (!password || password.length < 6) {
        showError('regPasswordError', 'Password minimo 6 caratteri');
        return;
    }

    try {
        const result = await API.register({ name, surname, username, email, password });
        if (!result.ok) {
            showError('registerError', result.data.error || 'Errore registrazione');
            return;
        }
        handleLogin(email, password);
    } catch (error) {
        showError('registerError', 'Errore di connessione');
    }
}

async function handleLogin(emailArg, passwordArg) {
    clearErrors();
    const email = emailArg || document.getElementById('loginEmail').value.trim();
    const password = passwordArg || document.getElementById('loginPassword').value.trim();

    if (!email) {
        showError('loginEmailError', 'Email richiesta');
        return;
    }
    if (!password) {
        showError('loginPasswordError', 'Password richiesta');
        return;
    }

    try {
        const result = await API.login({ email, password });
        if (!result.ok) {
            showError('loginError', result.data.error || 'Credenziali non valide');
            return;
        }

        currentUser = result.data.user;
        localStorage.setItem('user', JSON.stringify(currentUser));
        showCollectionsView();
    } catch (error) {
        showError('loginError', 'Errore di connessione');
    }
}

function toggleAuthForm() {
    document.getElementById('loginForm').classList.toggle('hidden');
    document.getElementById('registerForm').classList.toggle('hidden');
    clearErrors();
}

function handleLogout() {
    localStorage.removeItem('user');
    currentUser = null;
    collectionsData = [];
    currentCollection = null;
    
    document.getElementById('collectionsView').classList.add('hidden');
    document.getElementById('collectionDetailView').classList.add('hidden');
    document.getElementById('loginSection').classList.remove('hidden');
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('registerForm').classList.add('hidden');
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
    clearErrors();
}
