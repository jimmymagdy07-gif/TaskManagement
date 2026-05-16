# TaskFlow

A full-stack task management app built with **React**, **Tailwind CSS**, **Node.js**, **Express**, and **PostgreSQL**.

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [PostgreSQL](https://www.postgresql.org/) 14+ (local or [Supabase](https://supabase.com/))
- npm

## Setup (in order)

### 1. Clone and install

```bash
cd taskflow

# Server dependencies
cd server
npm install

# Client dependencies
cd ../client
npm install
```

### 2. Environment variables

From the project root:

```bash
cp .env.example .env
cd client
cp .env.example .env
cd ..
```

Edit **root `.env`** (server) — set real values for `DATABASE_URL` and `JWT_SECRET` (never commit this file).

Edit **`client/.env`** — set `VITE_GUEST_EMAIL` / `VITE_GUEST_PASSWORD` to match your seeded demo user (see `server/db/schema.sql` after `db:init`).

| Variable | Where | Description |
|----------|-------|-------------|
| `DATABASE_URL` | root `.env` | PostgreSQL connection string |
| `JWT_SECRET` | root `.env` | Long random secret (32+ chars) |
| `PORT` | root `.env` | API port (default `5000`) |
| `CLIENT_URL` | root `.env` | Frontend origin for CORS (`http://localhost:3000`) |
| `VITE_GUEST_EMAIL` | `client/.env` | Guest login email (public demo only) |
| `VITE_GUEST_PASSWORD` | `client/.env` | Guest login password (public demo only) |

If you skip creating `.env`, the server falls back to `.env.example` in development (with a warning) — **not safe for production**.

### 3. Create the database

```bash
createdb taskflow
```

Or in `psql`:

```sql
CREATE DATABASE taskflow;
```

### 4. Initialize schema and seed data

From `server/`:

```bash
npm run db:init
```

This runs `db/schema.sql`, which creates all tables and inserts sample users, projects, and tasks.

**Demo logins** (password for all: `password123`):

| Email | Name |
|-------|------|
| `alex@taskflow.dev` | Alex Morgan |
| `jordan@taskflow.dev` | Jordan Lee |

### 5. Run the app

**Terminal 1 — API** (from `server/`):

```bash
npm run dev
```

API: `http://localhost:5000`

**Terminal 2 — Client** (from `client/`):

```bash
npm run dev
```

App: `http://localhost:3000` (Vite proxies `/api` to the backend)

## Security (before pushing to GitHub)

- **Never commit** `.env`, `client/.env`, or real credentials.
- `.gitignore` excludes `.env`, `node_modules/`, and `dist/` at the root and in `client/` / `server/`.
- Secrets are read via `process.env` on the server (`DATABASE_URL`, `JWT_SECRET`, etc.).
- Guest login uses `VITE_GUEST_*` in `client/.env` (safe to document in `.env.example` with dummy values).
- `server/db/schema.sql` contains **hashed demo passwords** for local seeding only — rotate or remove for production databases.
- Generate a production `JWT_SECRET` with: `openssl rand -base64 48`

## Project structure

```
taskflow/
├── client/          # React + Vite frontend
├── server/          # Express API
├── .env.example
└── README.md
```

## Production build (local)

```bash
cd client && npm run build
cd ../server && NODE_ENV=production npm start
```

Serve `client/dist` as static files or via your host’s static asset settings.

---

## Deploy

### Database — Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Open **Project Settings → Database** and copy the **Connection string** (URI mode).
3. Set `DATABASE_URL` on Render (and locally) to that value. Enable SSL if required (`?sslmode=require`).
4. Run the schema once from your machine:

   ```bash
   cd server
   DATABASE_URL="your-supabase-url" npm run db:init
   ```

### API — Render

1. Create a **Web Service** connected to your repo; set **Root Directory** to `server`.
2. **Build command:** `npm install`
3. **Start command:** `npm start`
4. Environment variables:

   | Key | Value |
   |-----|--------|
   | `DATABASE_URL` | Supabase connection string |
   | `JWT_SECRET` | Strong random secret |
   | `PORT` | `5000` (or Render’s assigned port) |
   | `CLIENT_URL` | Your Vercel URL (e.g. `https://taskflow.vercel.app`) |
   | `NODE_ENV` | `production` |

5. Note the Render URL (e.g. `https://taskflow-api.onrender.com`).

### Client — Vercel

1. Import the repo; set **Root Directory** to `client`.
2. **Framework preset:** Vite
3. **Build command:** `npm run build`
4. **Output directory:** `dist`
5. Environment variable:

   | Key | Value |
   |-----|--------|
   | `VITE_API_URL` | Your Render API URL (if you add proxy/env support) |

6. Update `client/vite.config.js` proxy or API base URL for production so requests hit Render instead of `localhost`.

7. Redeploy after setting `CLIENT_URL` on Render to match your Vercel domain.

### Post-deploy checklist

- [ ] `CLIENT_URL` on the server matches the Vercel URL exactly (no trailing slash)
- [ ] Cookies/CORS work between Vercel and Render (same-site or configured credentials)
- [ ] Database seeded or at least schema applied on Supabase
- [ ] `JWT_SECRET` is unique in production

## License

MIT
