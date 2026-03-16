# Guitar Mastery Hub — Design Reference

> Read this before designing or building any feature.
> It covers UI patterns, data flow, auth states, error handling, and every established convention.
> When in doubt: check this file first, then the code, then SYSTEM-DESIGN.md.

---

## 1. Visual Design System

### Theme

The app uses MUI v7 with a dynamic theme built from `buildTheme(primaryColor, mode)` in `client/src/theme/helixTheme.ts`.

**5 color themes stored per user in `users.theme_color`:**

| Key      | Name            | Primary `#hex` |
| -------- | --------------- | -------------- |
| `helix`  | Helix (default) | `#ea580c`      |
| `ocean`  | Ocean           | `#2563eb`      |
| `forest` | Forest          | `#16a34a`      |
| `violet` | Violet          | `#7c3aed`      |
| `rose`   | Rose            | `#e11d48`      |

**Rule: Never hardcode orange.** Use `theme.palette.primary.main` or `alpha(theme.palette.primary.main, n)`. All primary-tinted backgrounds, borders, and accents must reference the theme so they react to theme switching.

### Dark / Light Mode

`buildTheme` accepts a second `mode: ThemeMode` param (`'light' | 'dark'`). The dark palette uses near-black surfaces (`#0d1117`, `#161b22`) and muted text (`#8b949e`). All component overrides (Card, AppBar, Drawer, Divider, OutlinedInput) are conditioned on `isDark`.

**Persistence:**

- Authenticated users: `users.theme_mode` column (DB, updated via `PATCH /api/users/me`)
- Anonymous visitors: `localStorage` key `gmh_theme_mode` via `useLocalThemeMode()`
- `App.tsx` reads `profile.theme_mode ?? localMode` and passes it into `buildTheme` via `useMemo`

**Toggle:** `<DarkModeToggle />` — place in AppLayout sidebar footer, mobile AppBar, and Landing nav. It reads from the correct source (DB vs local) and writes back on click.

### RoomScene

`<RoomScene lampOn={boolean} />` — an animated chair + floor-lamp SVG extracted from room_v8.html. Uses rAF to smoothly animate `t` (0 = day, 1 = night) when `lampOn` changes.

**Placement rules:**

- Landing hero: right column (46% width, hidden on mobile `xs/sm`), inside the dark `#1c1917` hero box
- Dashboard greeting panel: right column (240px wide, hidden on mobile `xs`), inside ZONE 1

**lampOn logic:** `theme.palette.mode === 'dark' || hour < 7 || hour >= 20` — lamp on at night or when dark mode is active.

### Typography

| Use                  | Variant                             | Font                                       |
| -------------------- | ----------------------------------- | ------------------------------------------ |
| Page title           | `h4`, `fontWeight: 700`             | Inter                                      |
| Section header       | `overline`, `color: text.secondary` | Inter                                      |
| Large numbers / data | IBM Plex Mono                       | `fontFamily: '"IBM Plex Mono", monospace'` |
| Body text            | `body1` / `body2`                   | Inter                                      |
| Small labels         | `caption`                           | Inter                                      |

### Spacing & Layout

- Page max width: 800px (`maxWidth: 800, mx: 'auto'`) for content pages, 600px for settings/forms
- Section spacing: `mb: 3` or `mb: 4` between major sections
- Card internal padding: MUI `CardContent` default (16px)
- Grid: MUI Grid v2 with `size={{ xs: 12, sm: N, md: N }}` — always mobile-first

### Card Pattern

```tsx
<Card sx={{ mb: 3, borderLeft: '3px solid', borderLeftColor: 'primary.main' }}>
  <CardContent>
    <Typography variant="overline" color="text.secondary">
      Section Label
    </Typography>
    {/* content */}
  </CardContent>
</Card>
```

**When to use borderLeft accent:** Data cards (stat tiles, summary cards). Not on form cards.

### Background Treatment

Every page with a theme-tinted background:

```tsx
sx={{ background: `radial-gradient(ellipse at top left, ${alpha(theme.palette.primary.main, 0.04)}, transparent 60%)` }}
```

Subtle — 4% opacity max on backgrounds, 6% on card highlights, 8% on hover states, 15% on active/selected.

### Stat Tile Pattern (Dashboard / Analytics)

```tsx
<Card sx={{ height: '100%', borderLeft: '3px solid', borderLeftColor: 'primary.main' }}>
  <CardContent>
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
    >
      {label}
    </Typography>
    {loading ? (
      <Skeleton width={60} height={36} />
    ) : (
      <Typography
        sx={{
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: '1.5rem',
          fontWeight: 700,
          mt: 0.5,
        }}
      >
        {value}
      </Typography>
    )}
  </CardContent>
</Card>
```

---

## 2. Auth State Machine

Every component and page must handle all three auth states correctly.

### States

| State        | session   | loading | What it means                                        |
| ------------ | --------- | ------- | ---------------------------------------------------- |
| `LOADING`    | any       | `true`  | AuthContext is resolving from storage. Show spinner. |
| `LOGGED_OUT` | `null`    | `false` | Not authenticated.                                   |
| `LOGGED_IN`  | `Session` | `false` | Authenticated.                                       |

### Sub-states of LOGGED_IN

| Sub-state               | Condition                                   | Route behavior                           |
| ----------------------- | ------------------------------------------- | ---------------------------------------- |
| New user                | `onboarding_completed === false`            | ProtectedRoute redirects → `/onboarding` |
| Existing user (no data) | `onboarding_completed === true`, 0 sessions | `/app` — show empty states               |
| Active user             | `onboarding_completed === true`, has data   | `/app` — normal                          |

### Route Protection Rules

```text
/                  LOADING → spinner | LOGGED_OUT → Landing | LOGGED_IN → /app
/login             LOADING → spinner | LOGGED_OUT → Login   | LOGGED_IN → /app
/onboarding        LOADING → spinner | LOGGED_OUT → /login  | LOGGED_IN + onboarding_completed=true → /app | LOGGED_IN + false → Wizard
/app/*             LOADING → spinner | LOGGED_OUT → /login  | LOGGED_IN + not_onboarded → /onboarding | else → page
/demo              always render (public, no auth required)
/auth/callback     LOADING → spinner | LOGGED_OUT → code exchange | LOGGED_IN → /app
```

### ProtectedRoute Implementation

```tsx
function ProtectedRoute({ children }) {
  const { session, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useUserStore();

  if (authLoading || (session && profileLoading)) return <Spinner />;
  if (!session) return <Navigate to="/login" replace />;
  if (profile && !profile.onboarding_completed && window.location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }
  return children;
}
```

**Critical:** Wait for both auth AND profile before deciding onboarding redirect. A spinner while profile loads prevents a false redirect.

### Session Expiry (401 Handling)

The Axios interceptor in `api.ts` catches 401 and redirects:

```ts
if (error.response?.status === 401) {
  await supabase.auth.signOut();
  window.location.href = '/login?error=session_expired';
}
```

**ActivePracticeMode exception:** If a user is mid-session, the 401 redirect would lose their progress. Before any redirect during an active practice session, `practiceModeStore` must flush completed items and ratings to Supabase, then allow the redirect.

---

## 3. Error Handling Patterns

### API Error — Store Level

Every store action that calls an API must follow this pattern:

```ts
fetchSomething: async () => {
  set({ isLoading: true, error: null });
  try {
    const { data } = await api.get<SomeType>('/api/something');
    set({ data, isLoading: false });
  } catch {
    set({ isLoading: false, error: 'Could not load data. Please try again.' });
  }
},
```

**Rules:**

- Always reset `error: null` at start of new request
- Always set `isLoading: false` in both success and catch (use `finally` or explicit in both)
- Error message: human-readable, non-technical
- Never rethrow unless the caller needs to handle it (e.g., form saves that show field-level errors)

### API Error — UI Level

```tsx
{
  store.error && (
    <Alert severity="error" sx={{ mb: 3 }}>
      {store.error}
    </Alert>
  );
}
```

**Placement:** Top of page/section, below the page title, above content. Never inline in the middle of content.

**Severity guide:**

- `error`: Something failed, user action may be needed
- `warning`: Loaded with partial data, degraded experience
- `info`: Neutral message (e.g. "showing last known data")
- `success`: Action completed (auto-dismiss after 3s or user dismisses)

### Graceful Degradation

Features that are non-critical (insights, milestones) must **degrade silently**:

- If `GET /api/analytics/insights` fails → hide SkillFocusRow and WeeklyDigestCard, do not show error
- If `GET /api/milestones` fails → hide Milestones section, do not show error
- If `GET /api/analytics/skills` fails → show empty chart with "Could not load skill data" caption, not a page-level error

Critical features (plan, profile, progress) should show explicit errors.

### Optimistic Updates

Profile updates and plan item completions use optimistic updates:

```ts
// Pattern from userStore.updateProfile:
const prev = get().profile;
set({ profile: { ...prev, ...patch } }); // apply immediately
try {
  const { data } = await api.patch('/api/users/me', patch);
  set({ profile: data }); // confirm with server
} catch {
  set({ profile: prev }); // roll back
  throw err; // surface to UI for user feedback
}
```

**When to use optimistic updates:** Toggle actions (checkbox, theme switch), plan item completion. NOT for destructive actions (delete, reset).

---

## 4. Loading State Patterns

### Rule: Skeleton over Spinner for content

| Use                                     | Component                                    |
| --------------------------------------- | -------------------------------------------- |
| Full-page initial load (auth resolving) | `CircularProgress` centered in `100vh`       |
| Content sections loading                | `Skeleton` matching the shape of the content |
| Button submitting                       | `CircularProgress size={16}` as `startIcon`  |
| Inline small wait                       | `CircularProgress size={24}`                 |

### Skeleton Shapes

```tsx
// Stat tile
<Skeleton width={60} height={36} />

// Chart area
<Skeleton variant="rectangular" height={200} sx={{ borderRadius: 1 }} />

// Card body
<Skeleton variant="rounded" height={100} />

// Text line
<Skeleton width="60%" height={20} />
```

**Never** show a blank empty state while loading. Always show a skeleton that matches the loaded content's approximate shape. This prevents layout shift.

---

## 5. Empty State Patterns

Every async section must handle zero-data gracefully.

### Standard Empty State Component Pattern

```tsx
{
  !isLoading && data.length === 0 && (
    <Box sx={{ textAlign: 'center', py: 6 }}>
      <Typography variant="body2" color="text.secondary">
        {emptyMessage}
      </Typography>
    </Box>
  );
}
```

### Required Empty States per Section

| Section                        | Empty condition           | Message                                                      |
| ------------------------------ | ------------------------- | ------------------------------------------------------------ |
| Today's Practice (noplan=true) | No plan generated         | "No plan for today — tap to generate one." + generate button |
| Analytics chart                | All history durations = 0 | "No sessions in this period yet."                            |
| Analytics stats                | totalSessions = 0         | Stats show "—", no separate message needed                   |
| Milestones                     | 0 earned                  | "Complete your first session to earn your first badge."      |
| SkillFocusRow                  | No insights data          | Hidden (render nothing — don't show an empty row)            |
| WeeklyDigestCard               | No digest data            | Hidden (render nothing)                                      |
| ConfidenceTrendList            | No ratings                | "Practice sessions will show your skill trends here."        |

---

## 6. Zustand Store Pattern

All stores follow this interface pattern:

```ts
interface SomeStore {
  // Data
  data: SomeType | null;
  items: SomeItem[];

  // Status
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchData: () => Promise<void>;
  updateItem: (id: string, patch: Partial<SomeItem>) => Promise<void>;
  reset: () => void; // called on logout
}

export const useSomeStore = create<SomeStore>((set, get) => ({
  data: null,
  items: [],
  isLoading: false,
  error: null,

  fetchData: async () => {
    if (get().data) return; // skip if already loaded
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get<SomeType>('/api/something');
      set({ data, isLoading: false });
    } catch {
      set({ isLoading: false, error: 'Could not load data.' });
    }
  },

  reset: () => set({ data: null, items: [], isLoading: false, error: null }),
}));
```

**Rules:**

- Store names: `useXxxStore` (camelCase, `use` prefix, `Store` suffix)
- File names: `client/src/store/xxxStore.ts`
- `reset()` must be called from `AuthContext` on `SIGNED_OUT` for all stores that hold user data
- Use `get()` to read current state inside actions — never capture state in closures
- Skip fetch if data already loaded (idempotency)

### Store Reset on Logout

`AuthContext.tsx` handles `SIGNED_OUT` and resets all user stores:

```ts
case 'SIGNED_OUT':
  useUserStore.getState().reset();
  useProgressStore.getState().reset();
  usePracticeStore.getState().reset();
  usePracticePlanStore.getState().reset();
  useCurriculumStore.getState().reset();
  // ... add new stores here when created
  setSession(null);
```

**When you create a new store that holds user data, add its reset() call to AuthContext.**

---

## 7. Shared Types Pattern

**Rule: schema-first.** Define the type in `shared/types/` before writing the route or API call.

### File locations

```text
shared/types/
├── practice.ts         — PracticeSession, NewSession, PracticeSection
├── analytics.ts        — AnalyticsSummary, AnalyticsDay, WeakSpot, InsightsSummary, SkillAnalytics
├── practice-plan.ts    — PracticePlanItem, DailyPracticePlan, CompletePlanItemBody, ConfidenceRating
├── curriculum.ts       — CurriculumSource, Skill, CurriculumSkillEntry
├── progress.ts         — SkillProgress, ProgressResponse (LegacySkill conflict — see note)
├── resources.ts        — Resource, ResourceWithCompletion
├── user.ts             — UserProfile, UpdateProfileBody, OnboardingBody, ThemeKey
├── milestones.ts       — Milestone, MilestonesResponse
└── index.ts            — barrel re-export (use `as` aliases for name conflicts)
```

**Known conflict:** `Skill` exists in both `curriculum.ts` and `progress.ts`. In `index.ts`, the progress one is re-exported as `LegacySkill`:

```ts
export type { Skill as LegacySkill, Phase, ... } from './progress';
```

### Import rules

```ts
// Always import type (erased at compile time, zero runtime cost)
import type { AnalyticsSummary } from '@gmh/shared/types';

// Never cast API responses:
// ❌ const data = response.data as AnalyticsSummary
// ✅ const { data } = await api.get<AnalyticsSummary>('/api/analytics/summary')
```

### Server Zod schema pattern

```ts
// server/src/schemas/something.ts
import { z } from 'zod';
import type { SomeBodyType } from '@gmh/shared/types';

export const somethingSchema = z.object({
  field: z.string().min(1),
  count: z.number().int().min(0),
});

// Type assertion — ensures schema satisfies shared type
type _Assert = z.infer<typeof somethingSchema> extends SomeBodyType ? true : never;
const _check: _Assert = true;
void _check;
```

---

## 8. API Service Pattern

All API calls go through `api.ts` (Axios instance with auth interceptor):

```ts
import api from '../services/api';
import type { SomeType } from '../types/something'; // or from '@gmh/shared/types'

// GET
const { data } = await api.get<SomeType>('/api/something');

// POST
const { data } = await api.post<ResponseType>('/api/something', body);

// PATCH
const { data } = await api.patch<ResponseType>('/api/something', patch);
```

**Never use `axios` directly.** Always use the `api` instance which:

1. Attaches the Supabase JWT Bearer token to every request
2. Intercepts 401 → signs out and redirects to `/login?error=session_expired`

---

## 9. Backend Route Pattern

Every new route file follows this pattern:

```ts
// server/src/routes/something.ts
import { Router } from 'express';
import type { Response } from 'express';
import { supabase } from '../lib/supabase';
import { requireAuth } from '../middleware/auth';
import type { AuthRequest } from '../middleware/auth';
import { somethingSchema } from '../schemas/something';

const router = Router();
router.use(requireAuth); // all routes in this file require auth

router.get('/', async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  // ... query supabase ...
  res.json(result);
});

router.post('/', async (req: AuthRequest, res: Response) => {
  const parsed = somethingSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues });
    return;
  }
  // ... use parsed.data ...
});

export default router;
```

**Mount in `server/src/app.ts`:**

```ts
import somethingRouter from './routes/something';
app.use('/api/something', somethingRouter);
```

### Supabase Error Codes

| Code                     | Meaning                                        | HTTP response                                       |
| ------------------------ | ---------------------------------------------- | --------------------------------------------------- |
| `PGRST116`               | No rows returned (`.single()` on empty result) | Not an error — means "not found", handle gracefully |
| Any other Postgres error | Query failed                                   | 500 with `{ error: 'message' }`                     |

---

## 10. Database Migration Pattern

Every DB change follows this workflow:

1. Write SQL in `supabase/migrations/00N_description.sql`
2. Use `IF NOT EXISTS` / `IF EXISTS` guards — migrations must be idempotent
3. Run via: `source _ops/credentials.env && bash _ops/scripts/run-migration.sh supabase/migrations/00N_name.sql`
4. Update `_ops/DEPLOY-TRACKER.md` migration table
5. Verify: query the column/table exists from prod DB

**Migration naming:** `001_`, `002_`, ... sequential. Never skip numbers. Never reuse a number.

**RLS:** Every new table requires:

- `ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;`
- Policy for owner access: `USING (auth.uid() = user_id)` or public read if no PII

---

## 11. Test Patterns

### Frontend (Vitest + React Testing Library)

```tsx
// Every test file top: mock external dependencies before imports
vi.mock('../lib/supabase', () => ({ supabase: { auth: { ... } } }));
vi.mock('../store/userStore', () => ({ useUserStore: () => ({ profile: mockProfile, ... }) }));
vi.mock('../services/api', () => ({ default: { get: mockGet }, api: { get: mockGet } }));
// Note: mock BOTH default and named exports of api.ts

// Render wrapper
function renderComponent() {
  return render(
    <MemoryRouter>
      <ThemeProvider theme={createTheme()}>
        <ComponentUnderTest />
      </ThemeProvider>
    </MemoryRouter>
  );
}
```

**What to test per component:**

- Renders without crashing
- Loading state shows skeleton/spinner
- Data-loaded state shows correct text
- User actions call the correct API endpoint / store action
- Error state shows error message

### Backend (Vitest + supertest)

```ts
vi.mock('../lib/supabase', () => ({
  supabase: { auth: { getUser: vi.fn() }, from: vi.fn() },
}));

// Build supabase chain mocks for .select().eq().single()
function mockChain(resolved: { data: unknown; error: null | { message: string } }) {
  const eq: ReturnType<typeof vi.fn> = vi.fn();
  eq.mockReturnValue({ order, gte, lte, single, eq }); // self-referential for chaining
  const select = vi.fn().mockReturnValue({ eq, single });
  return { select };
}
```

**What to test per route:**

- Happy path: valid request → correct status + response shape
- Validation: missing required field → 400
- Auth: no token → 401
- Not found: resource doesn't exist → 404

---

## 12. New User vs Existing User Flows

### New User (just signed up)

**Via email:**

1. Signs up at `/login?mode=signup`
2. Confirms email (Supabase sends link)
3. First visit to `/app` → ProtectedRoute checks `onboarding_completed`
4. `onboarding_completed = false` → redirect to `/onboarding`
5. Completes 3-step wizard → POST `/api/users/me/onboard` → `onboarding_completed = true`
6. Navigate to `/app` — first plan generated on Dashboard mount

**Via Google OAuth:**

1. Clicks "Sign in with Google" at `/login`
2. Completes OAuth → redirects to `/auth/callback`
3. Supabase trigger auto-creates `users` row with `onboarding_completed = FALSE`
4. `onAuthStateChange` fires `SIGNED_IN` → navigate to `/app`
5. ProtectedRoute detects `onboarding_completed = false` → `/onboarding`
6. Same wizard flow

### Existing User

1. Opens app → `getSession()` restores JWT from Supabase storage
2. ProtectedRoute: session ✓, `onboarding_completed = true` → `/app`
3. `fetchProfile()` already called (ThemedApp handles this)
4. Dashboard mounts → fetches analytics summary + today's plan

### Empty User (onboarded, zero sessions)

- Dashboard: Today's plan section shows "No plan yet — tap to generate"
- Analytics: Chart shows empty state "No sessions in this period yet"
- Milestones: All locked, shows "Complete your first session..."
- Skill focus row: Hidden
- This is normal — onboarding set phase + curriculum, first plan generates on demand

---

## 13. Component File Conventions

```text
client/src/
├── components/      # Reusable UI — no direct API calls, reads from props or stores
│   └── XxxComponent.tsx
├── pages/           # Route-level pages — orchestrate data fetch + layout
│   └── XxxPage.tsx  (but named without "Page" — just Dashboard.tsx, Analytics.tsx)
├── store/           # Zustand stores — use[Name]Store naming
│   └── xxxStore.ts
├── services/        # api.ts (Axios) — no other services needed
├── context/         # React context — AuthContext only
├── hooks/           # Custom hooks if reused logic
├── theme/           # helixTheme.ts, themeColors.ts
├── types/           # Local TypeScript types (prefer shared/types/ for API shapes)
└── __tests__/       # Test files mirror the structure they test
```

**Component rules:**

- No direct API calls in components — go through stores
- Components read from stores or props only
- Pages may call store actions on mount (useEffect)
- Keep components under 250 lines — extract sub-components if larger

---

## 14. Commit Message Convention

```
feat(scope): add something new
fix(scope): correct a specific bug
refactor(scope): restructure without behavior change
test(scope): add or update tests
chore: maintenance, dependency updates
ci: CI/CD changes
docs: documentation only
```

**Scope examples:** `auth`, `practice`, `analytics`, `dashboard`, `db`, `plan`, `insights`

**Never:** `Co-Authored-By: Claude` or any AI attribution. No `[CARD-NNN]` format (use Conventional Commits — this is a public repo).

---

## 15. Active Practice Mode — Design Contract

The most complex new feature. Full specification:

### States

```text
idle     → user hasn't started yet
running  → timer counting down, current item active
paused   → timer stopped, user tapped pause
rating   → item marked done, confidence rating overlay visible
done     → all items completed, SessionComplete screen showing
```

### Timer

- Circular SVG ring: `strokeDashoffset` decreases from full circle → 0 as time passes
- Ring color: `theme.palette.primary.main`
- Ring background: `alpha(primary.main, 0.15)`
- On complete: auto-advance to `rating` state (don't wait for user tap)
- Skip: jumps to `rating` state without completing timer

### Confidence Rating

- 3 buttons only: Hard / Okay / Easy
- Colors: Hard = `error.main` tint | Okay = `warning.main` tint | Easy = `success.main` tint
- Slides up from bottom (MUI `Slide` transition)
- Auto-advances to next item after tap — no confirm step
- Stored as `confidence_rating: 1|2|3` (1=hard, 2=okay, 3=easy)

### Session Complete

Shows when `currentItemIndex >= plan.items.length` AND last item is rated:

- Total time (sum of `actual_duration_min` for completed items)
- Items completed count
- Streak chip (current streak from analytics summary)
- "Back to Dashboard" button → navigate('/app')
- Also triggers milestone check (milestoneStore.fetchMilestones())

---

## 16. Quick Reference: Which File to Edit

| Task                    | File                                                              |
| ----------------------- | ----------------------------------------------------------------- |
| Add a new API endpoint  | `server/src/routes/[feature].ts` + mount in `server/src/app.ts`   |
| Add request validation  | `server/src/schemas/[feature].ts`                                 |
| Add a shared type       | `shared/types/[domain].ts` + re-export in `shared/types/index.ts` |
| Add a DB column         | New `supabase/migrations/00N_description.sql`                     |
| Add a frontend store    | `client/src/store/[feature]Store.ts` + add reset() to AuthContext |
| Add a new page route    | `client/src/router.tsx` + create `client/src/pages/[Page].tsx`    |
| Update theme tokens     | `client/src/theme/helixTheme.ts`                                  |
| Change auth behavior    | `client/src/context/AuthContext.tsx`                              |
| Update route protection | `client/src/router.tsx` (ProtectedRoute function)                 |
| Add a test              | `client/src/__tests__/` or `server/src/__tests__/`                |
