# Fretwork

A practice tracker for self-taught guitarists. Log sessions, follow structured curricula, and see real progress over time.

**Live app** &rarr; [guitar-mastery-hub-mu.vercel.app](https://guitar-mastery-hub-mu.vercel.app)

---

## Why Fretwork?

Most guitar apps give you lessons or a metronome. Neither one remembers what you have been working on. Fretwork fills the gap between the lesson and the next time you pick up the guitar &mdash; tracking the slow, real progress that happens in between.

---

## Features

- **Practice log** &mdash; record sessions with duration, sections worked, notes, and confidence ratings
- **Curriculum paths** &mdash; follow JustinGuitar, Marty Music, Andy Guitar, or a general path
- **Skill tree** &mdash; phase-based mastery map with per-skill progress tracking
- **Daily practice plan** &mdash; auto-generated plan based on your curriculum and progress
- **Analytics** &mdash; streak tracker, daily/weekly totals, session history, confidence trends
- **Roadmap** &mdash; phase-by-phase learning path with progress indicators
- **Resources** &mdash; curated resource library with completion tracking
- **5 colour themes** &mdash; stored per user, applied instantly on login

---

## Tech Stack

| Layer               | Tech                                                        |
| ------------------- | ----------------------------------------------------------- |
| Frontend            | React 19, TypeScript, MUI v7, Vite, Zustand                 |
| Backend             | Node.js, Express, TypeScript                                |
| Database &amp; Auth | Supabase (PostgreSQL + Row-Level Security)                  |
| Hosting             | Vercel (frontend), Render (backend)                         |
| CI                  | GitHub Actions &mdash; lint, typecheck, tests on every push |

---

## Getting Started

### Prerequisites

- Node.js 20+
- A free [Supabase](https://supabase.com) project

### Setup

```bash
git clone https://github.com/rajathbrgowda/guitar-mastery-hub.git
cd guitar-mastery-hub

# Install dependencies
cd client && npm install && cd ..
cd server && npm install && cd ..

# Configure environment variables
cp client/.env.example client/.env
cp server/.env.example server/.env
# Fill in your Supabase credentials (see .env.example files for details)

# Run database migrations
# Execute supabase/migrations/001 through 024 in order via the Supabase SQL Editor

# Start development servers (two terminals)
cd server && npm run dev   # http://localhost:4000
cd client && npm run dev   # http://localhost:5173
```

### Docker

```bash
# Copy and fill in environment variables first
cp client/.env.example client/.env
cp server/.env.example server/.env

docker compose up
```

The client runs on `localhost:5173` and the server on `localhost:4000`.

---

## Project Structure

```text
client/          React frontend (Vite + MUI)
server/          Express API server
shared/types/    Shared TypeScript types (consumed by both client and server)
supabase/        Database migrations and seed data
scripts/         Utility scripts (smoke tests)
```

---

## Environment Variables

### Client (`client/.env`)

| Variable                 | Description                                             |
| ------------------------ | ------------------------------------------------------- |
| `VITE_SUPABASE_URL`      | Your Supabase project URL                               |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous (public) key                         |
| `VITE_API_URL`           | Backend API URL (`http://localhost:4000` for local dev) |

### Server (`server/.env`)

| Variable                    | Description                                                            |
| --------------------------- | ---------------------------------------------------------------------- |
| `SUPABASE_URL`              | Your Supabase project URL                                              |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only, never expose to frontend) |
| `PORT`                      | Server port (default: `4000`)                                          |
| `NODE_ENV`                  | `development` or `production`                                          |
| `CLIENT_URL`                | Frontend URL for CORS (default: `http://localhost:5173`)               |

See `.env.example` files in each directory for full details.

---

## API

All authenticated endpoints require a valid Supabase JWT in the `Authorization: Bearer <token>` header.

| Method | Endpoint                        | Auth | Description                        |
| ------ | ------------------------------- | ---- | ---------------------------------- |
| GET    | `/api/health`                   | No   | Health check                       |
| GET    | `/api/health/db`                | No   | Database connectivity check        |
| GET    | `/api/public/stats`             | No   | Aggregate public stats             |
| GET    | `/api/users/me`                 | Yes  | Current user profile               |
| PUT    | `/api/users/me`                 | Yes  | Update user profile                |
| GET    | `/api/practice`                 | Yes  | Practice session history           |
| POST   | `/api/practice`                 | Yes  | Log a practice session             |
| GET    | `/api/practice/plan/today`      | Yes  | Today's practice plan              |
| GET    | `/api/progress`                 | Yes  | Skill progress                     |
| PUT    | `/api/progress`                 | Yes  | Update skill progress              |
| GET    | `/api/analytics/summary`        | Yes  | Analytics summary                  |
| GET    | `/api/analytics/streak`         | Yes  | Streak data                        |
| GET    | `/api/analytics/history`        | Yes  | Session history (query: `?days=N`) |
| GET    | `/api/resources`                | Yes  | Resource catalogue                 |
| PUT    | `/api/resources/:id/completion` | Yes  | Update resource completion         |
| GET    | `/api/roadmap`                  | Yes  | Roadmap phases and progress        |
| GET    | `/api/mastery`                  | Yes  | Mastery map data                   |
| GET    | `/api/tools`                    | Yes  | Guitar tools catalogue             |

---

## Database

Supabase (PostgreSQL) with Row-Level Security on every table. All user data is isolated by `auth.uid() = user_id` policies. Migrations are in `supabase/migrations/` and should be run in order (001&ndash;024).

Key tables: `users`, `practice_sessions`, `skill_progress`, `practice_plan_days`, `resources`, `resource_completions`, `curriculum_sources`, `skills`, `curriculum_skill_entries`.

---

## Deployment

- **Frontend** deploys to Vercel automatically on push to `main`
- **Backend** deploys to Render automatically on push to `main`
- **CI** runs lint + typecheck + tests before any deploy

Set your environment variables in the Vercel and Render dashboards. See `vercel.json` and `render.yaml` for configuration.

---

## Testing

```bash
# Client tests
cd client && npm test

# Server tests
cd server && npm test

# Smoke test (API health check)
./scripts/smoke-test.sh
# Or against production:
BASE_URL=https://your-app.onrender.com ./scripts/smoke-test.sh
```

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute.

---

## Security

Found a vulnerability? See [SECURITY.md](SECURITY.md) for responsible disclosure instructions.

---

## License

MIT &mdash; see [LICENSE](LICENSE)
