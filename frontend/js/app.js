// Controlla se l'utente è già loggato al caricamento della pagina
window.addEventListener('load', () => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            showCollectionsView();
        } catch (e) {
            localStorage.removeItem('user');
        }
    }
});

// Chiudi modal cliccando fuori
document.addEventListener('click', (e) => {
    const modal = document.getElementById('itemModal');
    if (e.target === modal) {
        closeItemModal();
    }
});
