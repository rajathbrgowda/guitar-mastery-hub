# ADR-007: Zero Perceived Cold Start

**Date:** 2026-03-15
**Status:** Accepted
**Supersedes:** ADR-002

## Context

Guitar Mastery Hub runs on free-tier hosting (Vercel + Render + Supabase). Render's free tier sleeps after 15 min of inactivity, causing ~30s cold starts. ADR-002 introduced a GitHub Actions keep-alive cron, but GitHub Actions cron is best-effort and can be delayed or skipped. When keep-alive fails, visitors hit a hanging or broken page.

## Decision

Multi-layer defense that eliminates perceived cold starts while staying on free tier ($0/month):

### Layer 1 — Backend warm-up
Eagerly `await` a Supabase query on boot. `GET /api/health` returns `503 { status: 'warming' }` until the connection is established, then `200 { status: 'ok', uptime_s, booted_at }`.

### Layer 2 — Axios retry interceptor
Frontend retries on timeout, 502, 503, 504, and network errors — 3 attempts with exponential backoff (2s, 6s, 14s ≈ 22s total). Covers the typical 20-30s Render cold start window.

### Layer 3 — Health preflight
On SPA load, immediately ping `/api/health` (native fetch, no auth). If the backend is cold, the warming UI shows immediately instead of waiting for the first authenticated call to fail.

### Layer 4 — Warming banner
A non-blocking fixed banner at the top of the page: "Waking up the server — a few seconds on free hosting..." with a LinearProgress bar. Shows a retry button if all attempts fail.

### Layer 5 — Keep-alive reliability
- GitHub Actions cron tightened to every 8 minutes (was 10) with retry logic (3 attempts, 10s apart)
- Secondary external cron via cron-job.org (every 5 min) as belt-and-suspenders redundancy

### Monitoring
- Structured `{ event: 'cold_start', warmup_ms }` JSON log on every boot (visible in Render logs)
- `uptime_s` and `booted_at` in health response for programmatic cold-start detection

## Trade-offs

- Adds frontend complexity (retry logic, status store, warming banner)
- Reliance on two external cron services instead of one
- Not a true fix — a paid Render tier ($7/mo) would eliminate cold starts entirely
- 22s retry window means users still wait during a cold start, but they see a polished loading state instead of a broken page

## Alternatives considered

- **Paid Render tier** — would solve the problem completely but adds $7/month
- **Client-side only** — retry without warming UI confuses users
- **Server-side only** — warm-up without frontend retry still leaves users hanging
