# AI Chatbot Frontend (Demo Console)

Professional-looking demo UI to showcase your FastAPI + MongoDB + Redis chatbot project.

## Features

- **Right-side Chat Dock**: calls `POST /chat` and `POST /chat-smart` (API key is provided as `?api=...`)
- **Auth page**: logs in via `POST /login`, stores the token, and calls protected routes with `Authorization: Bearer <token>`
- **Chat Configs UI**: list/create/update configs using:
  - `GET /get-chat-config`
  - `POST /chat-config`
  - `PUT /update-chat-config/{config_id}`

## Local dev

1) Start the backend (FastAPI) on `http://127.0.0.1:8000`

2) Start the frontend:

```bash
cd frontend
npm install
npm run dev
```

This frontend uses a Vite dev proxy:
- Calls to `/api/*` are proxied to `http://127.0.0.1:8000/*`

## Environment

Copy and edit:

```bash
cd frontend
cp .env.example .env
```

- `VITE_API_BASE_URL`: defaults to `/api`. Set it to `http://127.0.0.1:8000` if you don’t want to use the proxy.

## CORS note (only if needed)

If you run frontend and backend on different origins in production, enable CORS on FastAPI.
