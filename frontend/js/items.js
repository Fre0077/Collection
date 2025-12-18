async function showCollectionDetail(collectionId, collectionName) {
    currentCollection = { id: collectionId, name: collectionName };
    
    document.getElementById('collectionsView').classList.add('hidden');
    document.getElementById('collectionDetailView').classList.remove('hidden');
    document.getElementById('collectionDetailTitle').textContent = collectionName;

    await loadAttributesForItemInputs();
    await loadItems();
}

function backToCollections() {
    currentCollection = null;
    document.getElementById('collectionDetailView').classList.add('hidden');
    document.getElementById('collectionsView').classList.remove('hidden');
}

async function addAttributeToCollection() {
    if (!currentCollection) {
        alert('Errore: nessuna collezione selezionata');
        return;
    }

    const attribute = document.getElementById('newAttributeName').value.trim();

    if (!attribute) {
        alert('Inserisci il nome attributo');
        return;
    }

    try {
        const result = await API.addAttribute({ collectionId: currentCollection.id, attribute });

        if (!result.ok) {
            alert('Errore: ' + (result.data.error || 'Errore aggiunta attributo'));
            return;
        }

        alert('Attributo aggiunto con successo!');
        document.getElementById('newAttributeName').value = '';
        await loadAttributesForItemInputs();
    } catch (error) {
        alert('Errore di connessione: ' + error.message);
    }
}

async function loadAttributesForItemInputs() {
    if (!currentCollection) return;

    const container = document.getElementById('itemAttributeInputs');
    const btn = document.getElementById('addItemBtn');

    try {
        const result = await API.getAttributes(currentCollection.id);

        if (!result.ok) {
            throw new Error(result.data.error || 'Errore caricamento attributi');
        }

        let attributes = result.data.attributes || [];
        
        // Se gli attributi sono oggetti, estrai la proprietà 'name'
        if (attributes.length > 0 && typeof attributes[0] === 'object') {
            attributes = attributes.map(attr => attr.name || attr);
        }
        
        if (attributes.length === 0) {
            container.innerHTML = '<p style="color: #999;">Nessun attributo. Aggiungine uno prima di creare item.</p>';
            btn.classList.add('hidden');
        } else {
            container.innerHTML = attributes.map((attr, idx) => `
                <div>
                    <label class="attr-label">${attr}</label>
                    <input type="text" class="item-attr-input" data-index="${idx}" placeholder="Valore per ${attr}">
                </div>
            `).join('');
            btn.classList.remove('hidden');
        }
    } catch (error) {
        container.innerHTML = `<p style="color: red;">Errore: ${error.message}</p>`;
        btn.classList.add('hidden');
    }
}

async function addItemToCollection() {
    if (!currentCollection) return;

    const attrInputs = document.querySelectorAll('.item-attr-input');
    const attribute = Array.from(attrInputs).map(input => (input.value ?? '').toString().trim());

    if (attribute.some(v => !v)) {
        alert('Compila tutti i campi attributo');
        return;
    }

    try {
        const payload = { collectionId: currentCollection.id.toString(), attribute };
        console.log('[UI] addItem payload', payload);
        const result = await API.addItem(payload);

        if (!result.ok) {
            alert('Errore: ' + (result.data.error || 'Errore aggiunta item'));
            return;
        }

        alert('Item aggiunto con successo!');
        attrInputs.forEach(input => input.value = '');
        await loadItems();
    } catch (error) {
        alert('Errore di connessione: ' + error.message);
    }
}

async function loadItems() {
    if (!currentCollection) return;

    const list = document.getElementById('itemsList');
    list.innerHTML = '<div class="loading">Caricamento items...</div>';

    try {
        const attrResult = await API.getAttributes(currentCollection.id);
        
        if (!attrResult.ok) {
            throw new Error(attrResult.data.error || 'Errore caricamento attributi');
        }
        
        let attributeNames = attrResult.data.attributes || [];
        
        // Se gli attributi sono oggetti, estrai la proprietà 'name'
        if (attributeNames.length > 0 && typeof attributeNames[0] === 'object') {
            attributeNames = attributeNames.map(attr => attr.name || attr);
        }
        
        console.log('Attributi caricati:', attributeNames);

        const itemsResult = await API.getItems(currentCollection.id);

        if (!itemsResult.ok) {
            throw new Error(itemsResult.data.error || 'Errore caricamento items');
        }

        const items = itemsResult.data.items || [];

        if (items.length === 0) {
            list.innerHTML = '<div class="no-items">Nessun item in questa collezione. Aggiungine uno!</div>';
        } else {
            list.innerHTML = items.map((item, idx) => {
                const displayAttrs = item.slice(0, 3);
                const hasMore = item.length > 3;

                return `
                    <div class="item-card" onclick='showItemModal(${JSON.stringify(item)}, ${JSON.stringify(attributeNames)})'>
                        <div class="item-image-placeholder">🖼️</div>
                        <div class="item-content">
                            ${displayAttrs.map((value, i) => `
                                <div class="item-attribute">
                                    <strong>${attributeNames[i] || `Attributo ${i+1}`}:</strong> ${value}
                                </div>
                            `).join('')}
                            ${hasMore ? '<p style="color: #667eea; margin-top: 10px; font-size: 12px;">Click per vedere tutti gli attributi...</p>' : ''}
                        </div>
                    </div>
                `;
            }).join('');
        }
    } catch (error) {
        list.innerHTML = `<div class="no-items">Errore: ${error.message}</div>`;
    }
}

function showItemModal(itemValues, attributeNames) {
    const modal = document.getElementById('itemModal');
    const content = document.getElementById('itemModalContent');

    content.innerHTML = itemValues.map((value, idx) => `
        <div class="item-attribute" style="margin-bottom: 15px; padding: 10px; background: #f9f9f9; border-radius: 4px;">
            <strong>${attributeNames[idx] || 'Attributo ' + (idx+1)}:</strong> ${value}
        </div>
    `).join('');

    modal.classList.add('show');
}

function closeItemModal() {
    document.getElementById('itemModal').classList.remove('show');
}
