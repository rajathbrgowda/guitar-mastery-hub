# Claude Code — Guitar Mastery Hub

## Project

Fullstack guitar practice tracker. React + TypeScript + MUI (Helix theme) / Express + TypeScript / Supabase (PostgreSQL + Auth) / Vercel + Render.

**Repo:** https://github.com/rajathbrgowda/guitar-mastery-hub (personal account — NOT office org)

---

## Current State

### Done (as of 2026-03-15)

#### App — fully built and deployed

- Project scaffold: git, folders, .gitignore, Docker (docker-compose + Dockerfiles)
- Frontend: Vite + React + TS + MUI v7 + React Router + Helix theme + all pages live
- Backend: Express + TS + cors/helmet/morgan + Supabase JWT auth + all routes live
- Database: Migrations 001–005 run + RLS on every table + seed data
- All pages: Dashboard, Roadmap, Practice, Skill Tree, Analytics, Resources, Tools, Settings, Landing
- Theme switcher: 5 colour presets, stored in DB, applied instantly on login
- Multi-curriculum system: 3 curricula seeded, curriculum picker in Settings, idempotent daily practice plan
- Google OAuth live (PKCE flow); full auth state machine in AuthContext

#### Deployment — live

- **Frontend:** `https://guitar-mastery-hub-mu.vercel.app` (Vercel, auto-deploy on push to main)
- **Backend:** `https://guitar-mastery-hub.onrender.com` (Render, auto-deploy on push to main)
- **CI:** GitHub Actions `Tests` workflow — runs on every push, green ✅
- **Branch protection:** `main` requires CI to pass before merge ✅

#### Ops brain — `_ops/` (gitignored, local only)

- `_ops/AGENT.md` — bootstrap instructions for any Claude agent (read this first)
- `_ops/BRAIN.md` — live URLs, service IDs, API usage examples
- `_ops/PERMISSIONS.md` — allowed / blocked actions per service
- `_ops/credentials.env` — all API tokens (Vercel, Render, Supabase, GitHub) — use `export VAR=value` format
- `_ops/DEPLOY-TRACKER.md` — deployment status, open issues, session log
- `_ops/scripts/` — agent-bootstrap.sh, health-check.sh, full-health.js, commit-monitor.js, vercel-status.sh, render-status.sh, render-deploy.sh, github-status.sh, db-query.sh, run-migration.sh
- `_ops/learning/` — DevOps study vault (DEVOPS-STUDY-VAULT.md + README.md)

#### Claude Code slash commands — `.claude/commands/`

- `/devops` — bootstrap devops session: loads credentials, runs agent-bootstrap + full health check, prints status table, ready for tasks
- `/commit-monitor` — starts the post-push watcher: detects new commits on main, waits for CI + Vercel + Render, then runs full-health.js

**Natural language triggers** — Claude also activates devops mode when you say: _"devops session"_, _"manual ops"_, _"this conversation is for devops"_

### Remaining work

#### Known bugs (app code)

- **CARD-084**: Settings.tsx spins forever if profile fails to load — show defaults + error banner instead

---

## Research & Web Search

Web search is an **important and always-allowed tool**. Use it proactively whenever:
- Looking up correct external IDs, URLs, or identifiers (e.g. YouTube video IDs, package versions)
- Verifying that third-party content still exists before referencing it
- Researching best practices, API behaviour, or library documentation
- Investigating a bug that may be caused by an external service or upstream change

**Search freely across any domain and any topic** — YouTube, GitHub, MDN, npm, Stack Overflow, official docs, third-party sites, Reddit, UX blogs, app reviews, music theory sites, guitar forums, design inspiration — without asking permission first. There are **no topic restrictions**: UX research, competitor analysis, music content, design patterns, anything is fair game. The only constraint is the standard Anthropic usage policy. Do not ask "is it okay to search X?" — just search it.

**Rule:** Never guess or hardcode an external identifier (video ID, URL slug, API endpoint) without first searching to confirm it exists and is correct. A failed search is better than a wrong ID in production.

## Issue / Bug Handling Protocol

When the user reports a bug, visual issue, broken feature, or anything not working as expected — **always follow this process before writing a single line of code:**

1. **Root cause first** — identify the actual cause at every layer it touches (DB, backend, frontend, ops, process)
2. **System design scan** — for each layer affected, list:
   - What is broken and why
   - What edge cases exist (null data, wrong IDs, network failure, race conditions, stale state, geo-restrictions, etc.)
   - What error handling is missing
   - What could break for existing users vs new users
3. **Update docs** — if the system design doc or any ADR is missing coverage of this area, note what needs to be added
4. **Plan the epic** — create a named epic with one card per distinct fix layer. Each card must specify: layer (DB / backend / frontend / ops / docs), priority (critical / high / medium), and a checklist covering all edge cases
5. **Update the kanban board** — add the epic and all cards
6. **Do not execute** until the user says to proceed

**Do not:**
- Jump straight to fixing the visible symptom
- Fix only the frontend without checking if the root cause is in the DB or backend
- Skip edge cases because they seem unlikely
- Merge a fix without updating the relevant doc if the issue exposed a design gap

## Workflow Rules

- **Read `_ops/AGENT.md` first** — run `bash _ops/scripts/agent-bootstrap.sh` to verify all services are up
- **Read `_ops/DEPLOY-TRACKER.md`** — know current deployment status before touching infra
- **Kanban first** — check `.kanban/board.json` or open localhost:4444 before coding
- **One card at a time** — move to In Progress, finish + commit, then next
- **Update card checklist** as each sub-task is done
- **Commit after every card** — not batched
- **Update DEPLOY-TRACKER.md** at the end of any ops/deployment session

### Epic execution rule

When the user names an epic (e.g. "ux-polish", "onboarding", "active-practice"), do ALL of the following without stopping to ask:

1. Read `.kanban/board.json` — find all cards for the epic
2. Read `_patterns/DESIGN-REFERENCE.md` — apply current patterns throughout
3. For every card not yet `done`:
   - Check frontend, backend, DB, migration, error handling, loading/empty states, auth states
   - Find and fix any related bugs discovered along the way
   - Write minimal regression tests for anything new or fixed
   - Run full test suite (`npm run test` in both `client/` and `server/`) — must be green
   - Commit after each card (conventional commit, no AI attribution)
4. Push to main, wait for CI green
5. **Apply all pending migrations to prod — mandatory, not optional:**
   - For each uncommitted or unapplied migration SQL file: execute via Supabase Management API (`source _ops/credentials.env && curl -s -X POST "https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_REF}/database/query" -H "Authorization: Bearer ${SUPABASE_ACCESS_TOKEN}" -H "Content-Type: application/json" -d '{"query":"..."}'`) — one statement at a time
   - Verify each column/index/table exists with a `SELECT` query before moving on
   - Mark applied migrations ✅ in `_ops/DEPLOY-TRACKER.md` Migration Status table immediately
   - **Epic is NOT complete if any migration is pending on prod**
6. **Verify live deployment — this is a hard completion gate, not optional:**
   - Poll Vercel API until latest deploy `state === READY` for the pushed commit SHA
   - Poll Render API until latest deploy `status === live` for the pushed commit SHA
   - HTTP GET `https://guitar-mastery-hub-mu.vercel.app` → must return 200
   - HTTP GET `https://guitar-mastery-hub.onrender.com/api/health` → must return `{"status":"ok"}`
   - Run `node _ops/scripts/full-health.js` — must show ✅ ALL CLEAR
   - **Epic is NOT complete until all five checks pass**
7. Update `_ops/DEPLOY-TRACKER.md` with a session log entry (migration rows + session log)
8. Mark all epic cards `done` in `.kanban/board.json`
9. Report epic complete: list every card done, any bugs fixed, test count, and confirmation that prod is live with migrations applied

## Code Quality Rules

- **Schema-first** — every new endpoint must have its request/response types added to `shared/types/` before writing the route or the API call. See `_patterns/SHARED-TYPES.md`.
- **No `as Type` casts against API responses** — use generic type parameter: `api.get<SharedType>('/api/...')`
- **`import type`** — always use `import type` when importing from `@gmh/shared/*` or any type-only import
- **No `any`** — use `unknown` if the type is genuinely unknown; `any` is an ESLint error
- **Lint + typecheck + format:check must pass before push** — CI blocks merge if any fail
  - `npm run lint` — ESLint (client and server)
  - `npm run typecheck` — `tsc --noEmit` (client and server)
  - `npm run format:check` — Prettier (client and server)
- **Fix violations immediately** — never leave a lint or type error for "later"
- See `_patterns/CODE-QUALITY.md` for full toolchain docs

---

## Definition of Done — every task must pass ALL layers

Every card, feature, bug fix, or change must touch every layer that it affects before it is considered done. No exceptions.

### New feature checklist

1. **Design** — component structure, props, state, API contract agreed before coding
2. **DB migration** — if new columns/tables needed: write `supabase/migrations/00N_name.sql`, run via `bash _ops/scripts/run-migration.sh`, update Migration Status table in `_ops/DEPLOY-TRACKER.md`
3. **Backend** — route, Zod validation, Supabase query, error handling, auth guard
4. **Frontend** — component, store update, API call, loading/error/empty states
5. **Tests** — at minimum: backend route happy path + 400 validation; frontend component renders + button calls correct endpoint
6. **Nothing broken** — run `npm run test` in both `client/` and `server/` — must be green
7. **Commit** — conventional commit format, no AI attribution
8. **CI passes** — GitHub Actions `Tests` workflow green after push
9. **Migration verified on prod** — run `node _ops/scripts/full-health.js` and confirm new migration row shows ✅ — **a card is not done until the migration is live on prod**
10. **Deploy verified** — check Vercel (frontend) and Render (backend) are live with the change

### Bug fix checklist

1. **Reproduce** — confirm the bug with exact steps before touching code
2. **Root cause** — find the actual cause, not just the symptom
3. **Fix** — minimal change that fixes the root cause
4. **Regression test** — add or update a test that would have caught this bug
5. **Run full test suite** — `npm run test` in both `client/` and `server/` — green
6. **Commit** — format `fix: [CARD-XXX] description`
7. **CI passes** — verify green on GitHub Actions
8. **Verify in production** — confirm the bug is gone on the live URL

### Theme / design-only change checklist

1. **No logic regressions** — run full test suite before and after
2. **Cross-theme check** — verify all 5 colour themes still look correct
3. **Dark + light mode** — if adding dark/light switch, verify both states
4. **CI passes** — green before merge

### Rule: no shortcuts

- Do not merge a card that skips a layer, even if the layer seems trivial
- Do not skip tests because "it's just a UI change"
- Do not skip migration because "I'll run it manually later"
- If a layer genuinely does not apply (e.g. static UI change needs no migration), note it explicitly in the card checklist as "N/A — [reason]"

---

## Commit Messages

- **Never** add `Co-Authored-By: Claude` or any AI attribution
- No vibe-coding signals in git history
- **Use Conventional Commits** — this repo is public; `[CARD-NNN]` references mean nothing to outside readers

```text
feat(auth): add OAuth PKCE callback route
fix(practice): prevent duplicate session on double-submit
refactor(db): extract connection pooling to module
ci: add smoke test GitHub Actions workflow
docs: update README with quick start guide
chore: upgrade MUI to v7.1
test: add analytics summary route happy path
```

Types: `feat` | `fix` | `refactor` | `test` | `ci` | `docs` | `chore` | `perf`
Scope (optional): the subsystem affected — `auth`, `practice`, `analytics`, `db`, etc.

---

## Curriculum & Video Content Rules

- **Video IDs only** — never store full YouTube URLs in the DB; store only the 11-character ID (e.g. `cHRFCNNrPKs`). The embed URL and thumbnail URL are constructed at render time.
- **No YouTube Data API key** — all video content is rendered via `youtube.com/embed/{id}` iframe and `img.youtube.com/vi/{id}/mqdefault.jpg` thumbnails. No API key is needed and none should be added.
- **NULL video IDs are valid** — not every skill in every curriculum has a video. The `VideoThumbnail` component returns `null` when `youtubeId` is null. Never render a broken embed.
- **Curriculum content lives in DB only** — skill titles, practice tips, phase assignments, and video IDs are in `curriculum_skill_entries`. Do not duplicate this data in frontend constants. If content needs updating, write a new migration.
- **Adding a curriculum = DB inserts only** — add a row to `curriculum_sources`, rows to `curriculum_skill_entries`, and optionally `skills` if new canonical skills are needed. No code changes required.
- **Independent progress per curriculum** — `skill_progress` has a `curriculum_key` column. Switching curriculum does not reset old progress. Do not drop or migrate existing progress rows when adding curricula.
- **Practice plan is idempotent** — `GET /api/practice/plan/today` must always return the same plan for the same user+date. Never generate a second plan for the same day.

## Permissions

- All file operations scoped to this project directory
- `git push origin main` allowed — personal repo only (rajathbrgowda)
- Force push always blocked
- No curl/wget — use Node for HTTP
- `_ops/` is gitignored — never stage or commit it

---

## Key Architecture Decisions

| Decision           | Choice                     | Why                                                                |
| ------------------ | -------------------------- | ------------------------------------------------------------------ |
| Auth token storage | Memory (not localStorage)  | XSS protection; Supabase handles this by default                   |
| Auth strategy      | Email + password only      | No OAuth setup complexity; Google can be added later in one toggle |
| DB isolation       | RLS on every table         | Even buggy API can't leak data; `auth.uid() = user_id` on all      |
| State management   | Zustand                    | No boilerplate; right size for this app                            |
| UI library         | MUI v7                     | Full component library, accessible, fast to build data-heavy UI    |
| Free hosting       | Vercel + Render + Supabase | $0/month total; keep-alive ping for Render idle prevention         |
| Theme switcher     | 5 presets in DB            | Instant apply via useMemo + optimistic Zustand update              |
| Cold-start defense | Multi-layer (ADR-007)      | Eager warm-up + retry + warming banner + dual keep-alive           |

---

## DB Schema (Supabase)

- `users` — linked to auth.users; current_phase, guitar_type, years_playing, daily_goal_min, practice_days_target, timezone, avatar_url, theme_color, curriculum_key (migrations 001–007)
- `skill_progress` — (user_id, phase_index, skill_index, completed, curriculum_key)
- `practice_sessions` — (user_id, date, duration_min, sections JSONB, notes, confidence)
- `resources` — static catalogue (phase_index, title, url, type, is_featured)
- `resource_completions` — (user_id, resource_id, completion 0-100)
- `curriculum_sources` — (key, title, description, author, difficulty)
- `skills` — canonical skill definitions (key, title, phase_index, tags)
- `curriculum_skill_entries` — (curriculum_key, skill_key, phase_index, practice_tip, youtube_id)
- `practice_plan_days` — (user_id, plan_date, curriculum_key, status, items JSONB)

Migrations applied: 001–008. Next migration: 009.

All tables: RLS enabled + `auth.uid() = user_id` policy + index on user_id.

---

## Doc Brain

- `_ops/` — ops brain (local only, gitignored) — credentials, scripts, agent instructions
- `docs/architecture/SYSTEM-DESIGN.md` — full system design
- `docs/decisions/` — ADRs (ADR-001: JWT in memory, ADR-002: keep-alive, ADR-003: email+password auth)
- `docs/work-reports/` — per-session logs

---

## Safety Checks

```bash
# Before any push — verify personal repo
git remote -v
# Must show: https://github.com/rajathbrgowda/guitar-mastery-hub.git

# Before any ops work — verify all services
bash _ops/scripts/agent-bootstrap.sh
```
