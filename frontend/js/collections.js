function showCollectionsView() {
    document.getElementById('loginSection').classList.add('hidden');
    document.getElementById('collectionsView').classList.remove('hidden');
    document.getElementById('collectionDetailView').classList.add('hidden');
    
    document.getElementById('userName').textContent = `${currentUser.name} ${currentUser.surname}`;
    document.getElementById('userEmail').textContent = currentUser.email;

    loadCollections();
}

async function loadCollections() {
    try {
        const result = await API.getCollections(currentUser.id);

        if (!result.ok) {
            throw new Error(result.data.error || 'Errore caricamento collezioni');
        }

        collectionsData = [];
        if (result.data.collections && result.data.collections.collectionId && result.data.collections.name) {
            for (let i = 0; i < result.data.collections.collectionId.length; i++) {
                collectionsData.push({
                    id: result.data.collections.collectionId[i],
                    name: result.data.collections.name[i]
                });
            }
        }

        const list = document.getElementById('collectionsList');
        if (collectionsData.length === 0) {
            list.innerHTML = '<div class="no-items">Nessuna collezione ancora. Creane una!</div>';
        } else {
            list.innerHTML = collectionsData.map(col => `
                <div class="collection-card" onclick="showCollectionDetail(${col.id}, '${col.name}')">
                    <h4>${col.name}</h4>
                    <p>Click per aprire</p>
                </div>
            `).join('');
        }
    } catch (error) {
        document.getElementById('collectionsList').innerHTML = 
            `<div class="no-items">Errore: ${error.message}</div>`;
    }
}

async function createCollection() {
    const name = document.getElementById('collectionName').value.trim();
    const attrInputs = document.querySelectorAll('.attr-input');
    const attribute = Array.from(attrInputs).map(input => input.value.trim()).filter(v => v);

    if (!name) {
        alert('Inserisci il nome della collezione');
        return;
    }

    try {
        const result = await API.addCollection({ userId: currentUser.id, name, attribute });

        if (!result.ok) {
            alert('Errore: ' + (result.data.error || 'Errore creazione collezione'));
            return;
        }

        alert('Collezione creata con successo!');
        document.getElementById('collectionName').value = '';
        document.getElementById('numAttributes').value = '';
        document.getElementById('attributeInputs').innerHTML = '';
        loadCollections();
    } catch (error) {
        alert('Errore di connessione: ' + error.message);
    }
}

// Genera campi per attributi quando cambia il numero
document.addEventListener('DOMContentLoaded', () => {
    const numAttrInput = document.getElementById('numAttributes');
    if (numAttrInput) {
        numAttrInput.addEventListener('input', (e) => {
            const num = parseInt(e.target.value) || 0;
            const container = document.getElementById('attributeInputs');
            container.innerHTML = '';
            
            for (let i = 0; i < num; i++) {
                container.innerHTML += `<input type="text" class="attr-input" placeholder="Nome Attributo ${i + 1}" data-index="${i}">`;
            }
        });
    }
});
