# Taskboard frontend

React app for the group task manager. This folder is the Level 3 frontend only.

## Run locally

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

Copy `.env.example` to `.env`. Start the backend from `server` first (`npm start`, port 4004). `VITE_API_BASE_URL` is that address. `VITE_USE_MOCK=false` uses the API. Set it to `true` only when you want the in-memory screens without the server.

The frontend container builds the same app:

```bash
docker build -t taskboard-frontend --build-arg VITE_API_BASE_URL=http://localhost:4004 frontend
docker run --rm -p 8080:80 taskboard-frontend
```

Open http://localhost:8080 while the API is running on port 4004. The browser calls the API, so that address must be reachable from your machine. There is no backend image in the repository yet.

Development sign-in:

- `alex@example.com` / `password` — Standard User
- `jordan@example.com` / `password` — Admin

## Checks

```bash
npm run lint
npm run build
```
