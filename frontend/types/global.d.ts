declare global {
  interface Window {
    API: {
      register: (user: { name: string; surname: string; username: string; email: string; password: string }) => Promise<{ ok: boolean; data: any; status: number }>;
      login: (user: { email: string; password: string }) => Promise<{ ok: boolean; data: any; status: number }>;
      getCollections: (userId: number | string) => Promise<{ ok: boolean; data: any; status: number }>;
      addCollection: (collection: { userId: number | string; name: string; attribute: string[] }) => Promise<{ ok: boolean; data: any; status: number }>;
      addAttribute: (attribute: { collectionId: number | string; attribute: string }) => Promise<{ ok: boolean; data: any; status: number }>;
      getAttributes: (collectionId: number | string) => Promise<{ ok: boolean; data: any; status: number }>;
      addItem: (item: { collectionId: number | string; attribute: string[] }) => Promise<{ ok: boolean; data: any; status: number }>;
      getItems: (collectionId: number | string) => Promise<{ ok: boolean; data: any; status: number }>;
    };
    currentUser: null | { id: number | string; name: string; surname: string; email: string };
    collectionsData: Array<{ id: number | string; name: string }>;
    currentCollection: null | { id: number | string; name: string };

    // Expose UI handlers for inline onclick in HTML
    handleLogin: (emailArg?: string, passwordArg?: string) => Promise<void>;
    toggleAuthForm: () => void;
    handleRegister: () => Promise<void>;
    handleLogout: () => void;

    showCollectionsView: () => void;
    createCollection: () => Promise<void>;

    backToCollections: () => void;
    addAttributeToCollection: () => Promise<void>;
    addItemToCollection: () => Promise<void>;
    showCollectionDetail: (collectionId: number | string, collectionName: string) => Promise<void>;
    closeItemModal: () => void;
  }
}

export {};
