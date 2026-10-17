# Taskboard frontend

React app for the group task manager. This folder is the Level 3 frontend only.

## Run locally

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

Copy `.env.example` to `.env` if you need to change configuration. `VITE_API_BASE_URL` is the backend address. Leave it blank for now.

`VITE_USE_MOCK=true` uses in-memory development data. The real API is not connected until Member A confirms the endpoints and they are mapped in `src/api/http.js`.

Development sign-in:

- `alex@example.com` / `password` — Standard User
- `jordan@example.com` / `password` — Admin

## Checks

```bash
npm run lint
npm run build
```
