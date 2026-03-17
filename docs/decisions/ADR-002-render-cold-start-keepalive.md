# ADR-002: Keep-Alive Ping for Render + Supabase Free Tier

**Date:** 2026-03-15
**Status:** Superseded by ADR-007

## Context

Both Render (backend) and Supabase (database) on free tiers go idle after inactivity:
- Render: sleeps after 15min, ~30s cold start
- Supabase: pauses DB after 1 week of no queries

## Decision

Use [cron-job.org](https://cron-job.org) (free external cron service) to ping both services on a schedule.

## Implementation

**Render keep-alive** — ping every 10 minutes:
```
GET https://<app>.onrender.com/health
```

**Supabase keep-alive** — ping every 4 days:
```
GET https://<project>.supabase.co/rest/v1/users?limit=1
apikey: <anon-key>
```

Express health endpoint (add to `app.ts`):
```ts
app.get('/health', (_, res) => res.json({ ok: true, ts: Date.now() }));
```

## Why cron-job.org over alternatives

- Free, no account credit card required
- Simple HTTP ping UI
- Reliable enough for keep-alive use (not mission-critical)

## Trade-offs

- Adds external dependency for uptime
- Not a fix — Render will still cold-start if cron misses a window
- Real solution: paid tier ($7/mo Render) for persistent uptime
