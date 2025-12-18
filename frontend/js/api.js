const API_URL = 'http://localhost:3000/api';

async function apiCall(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' }
    };

    if (body !== null && body !== undefined) {
        try {
            options.body = JSON.stringify(body);
        } catch (e) {
            console.error('API body stringify failed:', e, body);
        }
    }

    console.log('[API] request', { url: `${API_URL}${endpoint}`, method, body });

    try {
        const response = await fetch(`${API_URL}${endpoint}`, options);
        let data;
        try {
            data = await response.json();
        } catch (e) {
            console.warn('[API] non-JSON response', e);
            data = null;
        }

        console.log('[API] response', { url: `${API_URL}${endpoint}`, status: response.status, data });
        return { ok: response.ok, data, status: response.status };
    } catch (networkError) {
        console.error('[API] network error', networkError);
        return { ok: false, data: { error: 'Network error' }, status: 0 };
    }
}

const API = {
    register: (user) => apiCall('/register', 'POST', user),
    login: (user) => apiCall('/login', 'POST', user),
    getCollections: (userId) => apiCall(`/getCollection?userId=${userId}`),
    addCollection: (collection) => apiCall('/addCollection', 'POST', collection),
    addAttribute: (attribute) => apiCall('/addAttribute', 'POST', attribute),
    getAttributes: (collectionId) => apiCall(`/getAttribute?collectionId=${collectionId}`),
    addItem: (item) => apiCall('/addItem', 'POST', item),
    getItems: (collectionId) => apiCall(`/getItem?collectionId=${collectionId}`)
};
