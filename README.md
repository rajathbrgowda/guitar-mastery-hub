# Fretwork

A practice tracker for self-taught guitarists. Track sessions, follow any curriculum, and see real progress over time.

**Live demo → [guitar-mastery-hub-mu.vercel.app](https://guitar-mastery-hub-mu.vercel.app)**

---

## Stack

| Layer           | Tech                                                    |
| --------------- | ------------------------------------------------------- |
| Frontend        | React 19 · TypeScript · MUI v7 · Vite · Zustand         |
| Backend         | Node.js · Express · TypeScript                          |
| Database + Auth | Supabase (PostgreSQL + Row-Level Security)              |
| Hosting         | Vercel (frontend) · Render (backend)                    |
| CI              | GitHub Actions — lint · typecheck · tests on every push |

---

## Features

- **Practice log** — record sessions with duration, sections, and notes
- **Skill tree** — phase-based curriculum path; choose from JustinGuitar, Marty Music, Andy Guitar or a general path
- **Analytics** — streak tracker, daily/weekly totals, session history chart
- **Roadmap** — phase-by-phase learning path with progress indicators
- **Resources** — curated resource library with completion tracking
- **5 colour themes** — stored per user, applied instantly on login

---

## Quick start

**Prerequisites:** Node.js 20+, a free [Supabase](https://supabase.com) project

```bash
git clone https://github.com/rajathbrgowda/guitar-mastery-hub.git
cd guitar-mastery-hub

# Install dependencies
cd client && npm install && cd ..
cd server && npm install && cd ..

# Configure environment variables
cp client/.env.example client/.env   # add VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_API_URL
cp server/.env.example server/.env   # add SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

# Run migrations in Supabase SQL Editor (supabase/migrations/ — run 001–006 in order)

# Start (two terminals)
cd server && npm run dev   # http://localhost:4000
cd client && npm run dev   # http://localhost:5173
```

Docker alternative: `docker compose up`

---

## Deployment

See [docs/architecture/SYSTEM-DESIGN.md](docs/architecture/SYSTEM-DESIGN.md) for the full architecture and deployment guide.

- Frontend deploys to Vercel automatically on push to `main`
- Backend deploys to Render automatically on push to `main`
- CI runs lint + typecheck + tests before any deploy

---

## License

MIT — see [LICENSE](LICENSE)
