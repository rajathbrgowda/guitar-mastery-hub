# Guitar Mastery Hub

A structured guitar practice tracker built around the JustinGuitar curriculum. Log sessions, follow a 5-phase roadmap, and see your progress over time.

**Stack:** React + TypeScript + MUI · Node/Express + TypeScript · Supabase (PostgreSQL + Auth) · Vercel + Render

---

## Local Development

### Prerequisites

- Node.js 20+
- Docker Desktop (optional — for containerised dev)
- A Supabase project (free tier)

### 1. Clone & install

```bash
git clone https://github.com/rajathbrgowda/guitar-mastery-hub.git
cd guitar-mastery-hub

# Install both workspaces
cd client && npm install && cd ..
cd server && npm install && cd ..
```

### 2. Configure environment variables

```bash
# Frontend
cp client/.env.example client/.env
# Edit client/.env — fill in VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_API_URL

# Backend
cp server/.env.example server/.env
# Edit server/.env — fill in SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
```

All keys are in your Supabase dashboard → Project Settings → API.

### 3. Run database migrations

In Supabase dashboard → SQL Editor, run each migration in order:

```
supabase/migrations/001_create_user_progress.sql
supabase/migrations/002_create_practice_sessions.sql
supabase/migrations/003_create_resources.sql
supabase/migrations/004_create_resource_completions.sql
supabase/migrations/005_profile_columns.sql
```

Then run the seed file to populate resources data:

```
supabase/migrations/seed.sql
```

### 4. Start the app

**With Docker (recommended):**

```bash
docker compose up
# Client:  http://localhost:5173
# Backend: http://localhost:4000
```

**Without Docker:**

```bash
# Terminal 1 — backend
cd server && npm run dev

# Terminal 2 — frontend
cd client && npm run dev
```

---

## Deployment

### Frontend → Vercel

1. Connect the GitHub repo to Vercel
2. Vercel auto-detects `vercel.json` at root — build command and output directory are pre-configured
3. Add environment variables in Vercel dashboard:

| Variable | Value |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `VITE_API_URL` | Your Render backend URL (e.g. `https://guitar-mastery-hub-api.onrender.com`) |

### Backend → Render

1. Connect the GitHub repo to Render → New Web Service
2. `render.yaml` at root pre-configures the build and start commands
3. Add environment variables in Render dashboard:

| Variable | Value |
|---|---|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key (secret) |
| `CLIENT_URL` | Your Vercel frontend URL (e.g. `https://guitar-mastery-hub.vercel.app`) |
| `NODE_ENV` | `production` |

> **Note:** Render free tier sleeps after 15 min of inactivity (~30s cold start). Set up a keep-alive ping via [cron-job.org](https://cron-job.org) to hit `GET /api/health` every 5 minutes.

### GitHub Actions CI

CI runs on every push and PR to `main`/`dev`. Before your first push, add these secrets in GitHub → repo Settings → Secrets and variables → Actions:

| Secret | Value |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key |

The server CI job needs no secrets (runs `tsc --noEmit` + `npm run build` only).

### Supabase Auth

In Supabase dashboard → Authentication → URL Configuration:

- **Site URL:** `https://your-app.vercel.app`
- **Redirect URLs:** `https://your-app.vercel.app/reset-password`

---

## Project Structure

```
guitar-mastery-hub/
├── client/          # React + Vite frontend
├── server/          # Express + TypeScript backend
├── supabase/
│   └── migrations/  # All 5 SQL migrations + seed
├── docs/
│   ├── architecture/   # System design, ADRs, feature specs
│   ├── decisions/      # Architecture Decision Records
│   └── work-reports/   # Session logs
├── .github/
│   └── workflows/ci.yml  # TypeScript + lint + build on every PR
├── vercel.json      # Vercel SPA deploy config
├── render.yaml      # Render backend deploy config
└── docker-compose.yml
```

---

## API

Full API reference: [docs/api/thunder-client-collection.json](docs/api/thunder-client-collection.json) — import into Thunder Client.

Base URL: `http://localhost:4000` (dev) · `https://your-render-app.onrender.com` (prod)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | — | Server health |
| GET | `/api/health/db` | — | DB connectivity |
| GET | `/api/analytics/summary` | JWT | Streak, total mins, sessions, phase |
| GET | `/api/analytics/streak` | JWT | Current streak |
| GET | `/api/analytics/history` | JWT | Daily totals (`?days=30`) |
| GET/POST | `/api/practice` | JWT | List / log practice sessions |
| GET | `/api/progress` | JWT | All skill completions + current phase |
| PATCH | `/api/progress/skill` | JWT | Toggle a skill |
| PATCH | `/api/progress/phase` | JWT | Set current phase |
| GET/PATCH | `/api/resources` | JWT | Resources + completion % |
| GET/PATCH | `/api/users/me` | JWT | Profile read / update |
| GET | `/api/users/me/export` | JWT | CSV export of sessions |
| DELETE | `/api/users/me/progress` | JWT | Reset all skill progress |

---

## Docs

- [System Design](docs/architecture/SYSTEM-DESIGN.md)
- [Dashboard Layout](docs/architecture/DASHBOARD-LAYOUT-REWORK.md)
- [UI Design Overhaul](docs/architecture/UI-DESIGN-OVERHAUL.md)
- [User Profile & Settings](docs/architecture/USER-PROFILE-SETTINGS.md)
- [Architecture Decisions](docs/decisions/)
