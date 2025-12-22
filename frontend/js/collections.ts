const API = window.API;

function showCollectionsView(): void {
  document.getElementById('loginSection')?.classList.add('hidden');
  document.getElementById('collectionsView')?.classList.remove('hidden');
  document.getElementById('collectionDetailView')?.classList.add('hidden');

  if (window.currentUser) {
    const userName = document.getElementById('userName');
    const userEmail = document.getElementById('userEmail');
    if (userName) userName.textContent = `${window.currentUser.name} ${window.currentUser.surname}`;
    if (userEmail) userEmail.textContent = window.currentUser.email;
  }

  void loadCollections();
}

async function loadCollections(): Promise<void> {
  if (!window.currentUser) return;
  try {
    const result = await API.getCollections(window.currentUser.id);

    if (!result.ok) {
      throw new Error((result.data as any)?.error || 'Errore caricamento collezioni');
    }

    window.collectionsData = [];
    // Expect server response to contain arrays: collectionId[], name[]
    const data = (result.data as any).collections;
    if (data && Array.isArray(data.collectionId) && Array.isArray(data.name)) {
      for (let i = 0; i < data.collectionId.length; i++) {
        window.collectionsData.push({ id: data.collectionId[i], name: data.name[i] });
      }
    }

    const list = document.getElementById('collectionsList');
    if (!list) return;

    if (window.collectionsData.length === 0) {
      list.innerHTML = '<div class="no-items">Nessuna collezione ancora. Creane una!</div>';
    } else {
      list.innerHTML = window.collectionsData
        .map(
          (col) => `
                <div class="collection-card" onclick="showCollectionDetail(${col.id}, '${String(col.name).replace(/'/g, "\\'")}')">
                    <h4>${col.name}</h4>
                    <p>Click per aprire</p>
                </div>
            `
        )
        .join('');
    }
  } catch (error: any) {
    const list = document.getElementById('collectionsList');
    if (list) list.innerHTML = `<div class="no-items">Errore: ${error.message}</div>`;
  }
}

async function createCollection(): Promise<void> {
  const name = (document.getElementById('collectionName') as HTMLInputElement | null)?.value.trim() || '';
  const container = document.getElementById('attributeInputs');
  const attrInputs = container ? (container.querySelectorAll('.attr-input') as NodeListOf<HTMLInputElement>) : ([] as any);

  const attribute = Array.from(attrInputs)
    .map((input) => input.value.trim())
    .filter((v) => v && /[a-zA-Z0-9]/.test(v));

  if (!name || !window.currentUser) {
    return;
  }

  try {
    const result = await API.addCollection({ userId: window.currentUser.id, name, attribute });
    if (!result.ok) {
      return;
    }
    location.reload();
  } catch {
    location.reload();
  }
}

function updateRemoveButtons(): void {
  const container = document.getElementById('attributeInputs');
  if (!container) return;
  const removeButtons = container.querySelectorAll<HTMLButtonElement>('.remove-attr-btn');

  if (container.children.length === 1) {
    removeButtons.forEach((btn) => {
      btn.disabled = true;
      btn.style.opacity = '0.5';
      btn.style.cursor = 'not-allowed';
    });
  } else {
    removeButtons.forEach((btn) => {
      btn.disabled = false;
      btn.style.opacity = '1';
      btn.style.cursor = 'pointer';
    });
  }
}

function addAttributeInput(): void {
  const container = document.getElementById('attributeInputs');
  if (!container) return;
  const count = container.children.length + 1;

  const wrapper = document.createElement('div');
  wrapper.className = 'attr-wrapper';
  wrapper.style.display = 'flex';
  wrapper.style.gap = '8px';
  wrapper.style.marginBottom = '8px';

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'attr-input';
  input.placeholder = `Attributo ${count}`;
  input.dataset.index = String(count - 1);
  input.style.flex = '1';

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'remove-attr-btn';
  removeBtn.textContent = '✕';
  removeBtn.style.width = '40px';
  removeBtn.style.padding = '12px 8px';
  removeBtn.style.backgroundColor = '#ff6b6b';
  removeBtn.style.minWidth = '40px';

  if (count === 1) {
    removeBtn.disabled = true;
    removeBtn.style.opacity = '0.5';
    removeBtn.style.cursor = 'not-allowed';
  }

  wrapper.appendChild(input);
  wrapper.appendChild(removeBtn);
  container.appendChild(wrapper);

  updateRemoveButtons();
}

// Setup dynamic attribute inputs on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('attributeInputs');
  if (!container) return;

  addAttributeInput();

  container.addEventListener('input', (e) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('attr-input')) {
      const lastInput = container.lastElementChild?.querySelector('input') as HTMLInputElement | null;
      if (lastInput && lastInput.value.trim() !== '') {
        addAttributeInput();
      }
    }
  });

  container.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('remove-attr-btn')) {
      const wrapper = target.closest('.attr-wrapper');
      if (wrapper && container.children.length > 1) {
        wrapper.remove();
        updateRemoveButtons();
      }
    }
  });
});

// Expose handlers
window.showCollectionsView = showCollectionsView;
window.createCollection = createCollection;

export {};
