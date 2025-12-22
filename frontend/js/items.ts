const API = window.API;

async function showCollectionDetail(collectionId: number | string, collectionName: string): Promise<void> {
  window.currentCollection = { id: collectionId, name: collectionName };

  document.getElementById('collectionsView')?.classList.add('hidden');
  document.getElementById('collectionDetailView')?.classList.remove('hidden');
  const title = document.getElementById('collectionDetailTitle');
  if (title) title.textContent = collectionName;

  await loadAttributesForItemInputs();
  await loadItems();
}

function backToCollections(): void {
  window.currentCollection = null;
  document.getElementById('collectionDetailView')?.classList.add('hidden');
  document.getElementById('collectionsView')?.classList.remove('hidden');
}

async function addAttributeToCollection(): Promise<void> {
  if (!window.currentCollection) return;

  const attribute = (document.getElementById('newAttributeName') as HTMLInputElement | null)?.value.trim() || '';
  if (!attribute) return;

  try {
    const result = await API.addAttribute({ collectionId: window.currentCollection.id, attribute });
    if (!result.ok) return;

    const input = document.getElementById('newAttributeName') as HTMLInputElement | null;
    if (input) input.value = '';
    location.reload();
  } catch {
    location.reload();
  }
}

async function loadAttributesForItemInputs(): Promise<void> {
  if (!window.currentCollection) return;

  const container = document.getElementById('itemAttributeInputs');
  const btn = document.getElementById('addItemBtn');
  if (!container || !btn) return;

  try {
    const result = await API.getAttributes(window.currentCollection.id);
    if (!result.ok) throw new Error((result.data as any)?.error || 'Errore caricamento attributi');

    let attributes: Array<string | { name?: string }> = (result.data as any).attributes || [];
    if (attributes.length > 0 && typeof attributes[0] === 'object') {
      attributes = attributes.map((attr) => (typeof attr === 'object' ? attr.name || '' : String(attr)));
    }

    if (attributes.length === 0) {
      container.innerHTML = '<p style="color: #999;">Nessun attributo. Aggiungine uno prima di creare item.</p>';
      btn.classList.add('hidden');
    } else {
      container.innerHTML = attributes
        .map(
          (attr, idx) => `
                <div>
                    <label class="attr-label">${attr}</label>
                    <input type="text" class="item-attr-input" data-index="${idx}" placeholder="Valore per ${attr}">
                </div>
            `
        )
        .join('');
      btn.classList.remove('hidden');
    }
  } catch (error: any) {
    container.innerHTML = `<p style=\"color: red;\">Errore: ${error.message}</p>`;
    btn.classList.add('hidden');
  }
}

async function addItemToCollection(): Promise<void> {
  if (!window.currentCollection) return;

  const attrInputs = document.querySelectorAll<HTMLInputElement>('.item-attr-input');
  const attribute = Array.from(attrInputs).map((input) => (input.value ?? '').toString().trim());

  if (attribute.some((v) => !v)) return;

  try {
    const payload = { collectionId: String(window.currentCollection.id), attribute };
    console.log('[UI] addItem payload', payload);
    const result = await API.addItem(payload);

    if (!result.ok) return;

    attrInputs.forEach((input) => (input.value = ''));
    await loadItems();
  } catch (error) {
    console.error('Errore aggiunta item:', error);
  }
}

async function loadItems(): Promise<void> {
  if (!window.currentCollection) return;

  const list = document.getElementById('itemsList');
  if (!list) return;
  list.innerHTML = '<div class=\"loading\">Caricamento items...</div>';

  try {
    const attrResult = await API.getAttributes(window.currentCollection.id);
    if (!attrResult.ok) throw new Error((attrResult.data as any)?.error || 'Errore caricamento attributi');

    let attributeNames: Array<string | { name?: string }> = (attrResult.data as any).attributes || [];
    if (attributeNames.length > 0 && typeof attributeNames[0] === 'object') {
      attributeNames = attributeNames.map((attr) => (typeof attr === 'object' ? attr.name || '' : String(attr)));
    }

    console.log('Attributi caricati:', attributeNames);

    const itemsResult = await API.getItems(window.currentCollection.id);
    if (!itemsResult.ok) throw new Error((itemsResult.data as any)?.error || 'Errore caricamento items');

    const items: any[] = (itemsResult.data as any).items || [];

    if (items.length === 0) {
      list.innerHTML = '<div class=\"no-items\">Nessun item in questa collezione. Aggiungine uno!</div>';
    } else {
      list.innerHTML = items
        .map((item) => {
          const displayAttrs = item.slice(0, 3);
          const hasMore = item.length > 3;
          const attrNames = attributeNames as string[];
          return `
                    <div class=\"item-card\" onclick='showItemModal(${JSON.stringify(item)}, ${JSON.stringify(attrNames)})'>
                        <div class=\"item-image-placeholder\">🖼️</div>
                        <div class=\"item-content\">
                            ${displayAttrs
                              .map(
                                (value: string, i: number) => `
                                <div class=\"item-attribute\">
                                    <strong>${attrNames[i] || `Attributo ${i + 1}`}:</strong> ${value}
                                </div>
                            `
                              )
                              .join('')}
                            ${hasMore ? '<p style=\"color: #667eea; margin-top: 10px; font-size: 12px;\">Click per vedere tutti gli attributi...</p>' : ''}
                        </div>
                    </div>
                `;
        })
        .join('');
    }
  } catch (error: any) {
    list.innerHTML = `<div class=\"no-items\">Errore: ${error.message}</div>`;
  }
}

function showItemModal(itemValues: string[], attributeNames: string[]): void {
  const modal = document.getElementById('itemModal');
  const content = document.getElementById('itemModalContent');
  if (!modal || !content) return;

  content.innerHTML = itemValues
    .map(
      (value, idx) => `
        <div class=\"item-attribute\" style=\"margin-bottom: 15px; padding: 10px; background: #f9f9f9; border-radius: 4px;\">
            <strong>${attributeNames[idx] || 'Attributo ' + (idx + 1)}:</strong> ${value}
        </div>
    `
    )
    .join('');

  modal.classList.add('show');
}

function closeItemModal(): void {
  document.getElementById('itemModal')?.classList.remove('show');
}

// Expose globally for HTML inline handlers
window.showCollectionDetail = showCollectionDetail;
window.backToCollections = backToCollections;
window.addAttributeToCollection = addAttributeToCollection;
window.addItemToCollection = addItemToCollection;
window.showItemModal = showItemModal as any; // used with JSON.stringify payloads
window.closeItemModal = closeItemModal;

export {};
