# Pattern: Adding a New API Type

Every new endpoint or changed response shape must follow this pattern.
This is enforced by the schema-first rule in CLAUDE.md.

---

## Step-by-step

### 1. Add the type to `shared/types/`

Pick the right file (or create a new one if it's a genuinely new domain):

```
shared/types/
├── practice.ts     ← practice sessions
├── analytics.ts    ← analytics/stats
├── progress.ts     ← skill progress
├── resources.ts    ← resource catalogue
└── user.ts         ← user profile
```

Write a plain TypeScript interface. No Zod, no imports, no runtime code:

```ts
// shared/types/practice.ts
export interface NewSession {
  date: string; // YYYY-MM-DD
  duration_min: number;
  sections?: PracticeSection[];
  notes?: string;
}
```

Re-export it from `shared/types/index.ts`.

### 2. Add a Zod schema to `server/src/schemas/`

```ts
// server/src/schemas/practice.ts
import { z } from 'zod';
import type { NewSession } from '@gmh/shared/types/practice';

export const logSessionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  duration_min: z.number().int().positive(),
  sections: z.array(sectionSchema).optional(),
  notes: z.string().max(1000).optional(),
});

// Contract assertion — TypeScript error here means schema drifted from shared type
type _Assert =
  z.infer<typeof logSessionSchema> extends Omit<NewSession, 'sections'> & {
    sections?: NewSession['sections'];
  }
    ? true
    : never;
declare const _check: _Assert;
```

### 3. Use the schema in the route

```ts
// server/src/routes/practice.ts
import { logSessionSchema } from '../schemas/practice';
import type { NewSession } from '@gmh/shared/types/practice';

router.post('/', async (req: AuthRequest, res) => {
  const parsed = logSessionSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  // parsed.data is fully typed
});
```

### 4. Use the type in the frontend

```ts
// client/src/store/practiceStore.ts
import type { PracticeSession, NewSession } from '@gmh/shared/types/practice';
// or via the re-export barrel:
import type { PracticeSession } from '../types/practice';

const { data } = await api.post<PracticeSession>('/api/practice', session);
```

Never cast `as SomeType` against API responses. Use the generic type parameter.

---

## Rules

| Rule                                                | Why                                                          |
| --------------------------------------------------- | ------------------------------------------------------------ |
| Add shared type **before** writing the route        | Enforces schema-first thinking                               |
| Use `import type` from `@gmh/shared/*`              | Erased at compile time — zero bundle impact                  |
| Server schemas must have a `_Assert` type assertion | Catches schema drift at compile time                         |
| Frontend uses generic `api.get<SharedType>()`       | No `as` casts; TypeScript checks the assignment              |
| Never put Zod in `shared/types/`                    | Types are compile-time only; Zod is a server runtime concern |

---

## When a type changes

1. Update `shared/types/` first
2. TypeScript will immediately show errors in:
   - The server schema file (assertion fails)
   - Any frontend component using the old shape
3. Fix both — that's the point of the shared contract
