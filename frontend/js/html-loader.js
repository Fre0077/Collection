// Funzione per caricare file HTML
async function loadHTML(filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error(`Errore caricamento ${filePath}: ${response.status}`);
        const html = await response.text();
        return html;
    } catch (error) {
        console.error('Errore caricando HTML:', error);
        return '';
    }
}

// Carica tutti gli HTML al caricamento
async function loadAllHTML() {
    try {
        console.log('Inizio caricamento HTML files...');
        
        // Carica tutti i file HTML
        const authHTML = await loadHTML('html/auth.html');
        const collectionsHTML = await loadHTML('html/collections.html');
        const collectionDetailHTML = await loadHTML('html/collection-detail.html');
        const itemModalHTML = await loadHTML('html/item-modal.html');
        
        // Inserisci tutti gli HTML nel body
        document.body.insertAdjacentHTML('beforeend', authHTML);
        document.body.insertAdjacentHTML('beforeend', collectionsHTML);
        document.body.insertAdjacentHTML('beforeend', collectionDetailHTML);
        document.body.insertAdjacentHTML('beforeend', itemModalHTML);
        
        console.log('HTML files caricati con successo');
    } catch (error) {
        console.error('Errore nel caricamento degli HTML:', error);
    }
}

// Aspetta che il DOM sia pronto, poi carica gli HTML
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAllHTML);
} else {
    // Se il DOM è già caricato
    loadAllHTML();
}

