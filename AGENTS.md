# AGENTS.md

## Cursor Cloud specific instructions

Gambit is a chess app: **Next.js frontend** (`frontend/`) + **FastAPI backend** (`backend/`). Production routes `/api/*` to the backend via `vercel.json`; locally you must wire that yourself.

### Services (local dev)

| Service | Port | tmux session | Command |
|---------|------|--------------|---------|
| FastAPI backend | 8000 | `chess-backend` | `cd backend && export PATH="$HOME/.local/bin:$PATH" && fastapi dev main.py --host 127.0.0.1 --port 8000` |
| Next.js frontend | 3000 | `chess-frontend` | `cd frontend && pnpm dev --hostname 127.0.0.1` |

Open the app at **http://127.0.0.1:3000**. `next.config.mjs` rewrites `/api/*` → `http://127.0.0.1:8000/*` when `VERCEL` is unset (production uses `vercel.json` instead).

`vercel dev` from the repo root also works (`vercel.json` `experimentalServices`), but the Vercel CLI requires interactive login in this environment.

Direct backend health check: `curl http://127.0.0.1:8000/health`

### PATH

`pip install -e backend` installs `fastapi`/`uvicorn` under `~/.local/bin`. Ensure `export PATH="$HOME/.local/bin:$PATH"` in backend shells.

### Lint / test / build

| Check | Command | Notes |
|-------|---------|-------|
| Frontend build | `cd frontend && pnpm build` | Succeeds; types skipped via `ignoreBuildErrors` |
| Frontend lint | `cd frontend && pnpm lint` | **Fails today**: `eslint` is not in `devDependencies` |
| Backend tests | — | No test suite in the repo |

### Secrets

None required. Settings persist in browser `localStorage` (`gambit:settings:v1`).
