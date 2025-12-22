# Collection Frontend (TypeScript)

Frontend TypeScript isolato dal progetto originale. Include Vite, config TS e asset necessari.

## Requisiti
- Node.js 18+

## Sviluppo
```bash
npm install
npm run dev
```
Apri http://localhost:5173

## Build
```bash
npm run build
npm run preview
```

## Struttura
- `index.html`: pagina principale (usa funzioni globali via `window.*`)
- `js/*.ts`: moduli TypeScript (API, auth, collections, items, app)
- `css/*`: stili
- `types/global.d.ts`: definizioni globali (`window.API`, handler `onclick`, stato)
- `vite.config.ts`, `tsconfig.json`: configurazioni
