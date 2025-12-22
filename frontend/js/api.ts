const API_URL: string = 'http://localhost:3000/api';

async function apiCall<T = any>(endpoint: string, method: string = 'GET', body: unknown = null): Promise<{ ok: boolean; data: T; status: number }> {
  const options: RequestInit & { headers: Record<string, string> } = {
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
    let data: T | null;
    try {
      data = await response.json();
    } catch (e) {
      console.warn('[API] non-JSON response', e);
      data = null as unknown as T;
    }

    console.log('[API] response', { url: `${API_URL}${endpoint}`, status: response.status, data });
    return { ok: response.ok, data: data as T, status: response.status };
  } catch (networkError) {
    console.error('[API] network error', networkError);
    return { ok: false, data: { error: 'Network error' } as T, status: 0 };
  }
}

const API = {
  register: (user: { name: string; surname: string; username: string; email: string; password: string }) => apiCall('/register', 'POST', user),
  login: (user: { email: string; password: string }) => apiCall('/login', 'POST', user),
  getCollections: (userId: number | string) => apiCall(`/getCollection?userId=${userId}`),
  addCollection: (collection: { userId: number | string; name: string; attribute: string[] }) => apiCall('/addCollection', 'POST', collection),
  addAttribute: (attribute: { collectionId: number | string; attribute: string }) => apiCall('/addAttribute', 'POST', attribute),
  getAttributes: (collectionId: number | string) => apiCall(`/getAttribute?collectionId=${collectionId}`),
  addItem: (item: { collectionId: number | string; attribute: string[] }) => apiCall('/addItem', 'POST', item),
  getItems: (collectionId: number | string) => apiCall(`/getItem?collectionId=${collectionId}`)
};

// Expose globally for other modules and inline handlers
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).API = API;

export {};
