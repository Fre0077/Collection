# Collection Manager - Frontend

Frontend per il testing degli endpoint del backend.

## Setup

```bash
cd frontend
npm install
```

## Development

```bash
npm run dev
```

Visita `http://localhost:5173` nel browser.

## Build per Production

```bash
npm run build
```

Output sarà in `frontend/dist/`.

## Features

- **Login/Registrazione** con validazione
- **Account Page** con dati utente e collezioni
- **LocalStorage** per mantenere la sessione
- **CORS-ready** per comunicare con backend su `http://localhost:3000`

## TODO Backend Endpoints

Per completare il frontend, il backend deve implementare:

1. `GET /api/user/:userId` - Ritorna dati utente (id, name, surname, email)
2. `GET /api/collections/:userId` - Ritorna lista collezioni dell'utente
3. `GET /api/collection/:collectionId` - Ritorna dettagli collezione con attributi
