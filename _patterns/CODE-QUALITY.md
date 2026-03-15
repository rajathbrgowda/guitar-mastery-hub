# Pattern: Code Quality Toolchain

This project enforces code quality at three points: pre-commit (format), CI quality gate
(lint + typecheck + format:check), and CI test gate (tests). All three must pass before merge.

---

## Tools

| Tool           | Config                                                | Purpose                           |
| -------------- | ----------------------------------------------------- | --------------------------------- |
| ESLint         | `client/eslint.config.js`, `server/eslint.config.mjs` | Catch bugs + enforce style        |
| Prettier       | `.prettierrc` (repo root)                             | Consistent formatting             |
| TypeScript     | `client/tsconfig.app.json`, `server/tsconfig.json`    | Type safety                       |
| Husky          | `.husky/pre-commit`                                   | Run lint-staged on commit         |
| lint-staged    | `package.json` (root)                                 | Format staged files before commit |
| GitHub Actions | `.github/workflows/test.yml`                          | Full gate: quality → tests        |

---

## Scripts

Both `client/` and `server/` have the same set:

```bash
npm run lint          # ESLint
npm run typecheck     # tsc --noEmit
npm run format        # prettier --write .
npm run format:check  # prettier --check . (used in CI)
npm run test          # vitest run
```

---

## ESLint rules that matter

| Rule                                         | Level | Why                                            |
| -------------------------------------------- | ----- | ---------------------------------------------- |
| `@typescript-eslint/no-explicit-any`         | error | Forces proper typing; `any` defeats TypeScript |
| `@typescript-eslint/consistent-type-imports` | error | `import type` is erased — better tree-shaking  |
| `@typescript-eslint/no-unused-vars`          | error | Dead code is noise                             |
| `react-hooks/rules-of-hooks`                 | error | Prevents hook rule violations                  |
| `react-hooks/exhaustive-deps`                | warn  | Flags missing deps in useEffect                |

**Test file exceptions:** `no-explicit-any` is off in `src/__tests__/` — mocking Supabase
chains requires `as never` casts that would otherwise violate the rule.

---

## Adding a new ESLint rule

1. Add to `client/eslint.config.js` and/or `server/eslint.config.mjs`
2. Run `npm run lint` — fix any new violations before pushing
3. If the rule should be an exception in tests, add it to the test file override block

---

## TypeScript strictness

Both projects run with `"strict": true` plus:

- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `noFallthroughCasesInSwitch: true` (client)

Server `rootDir` is set to `..` (repo root) so `@gmh/shared` path alias resolves
correctly in the compiled output — the compiled JS `require()` paths work without any
runtime path resolver.

---

## Pre-commit hook behaviour

On every `git commit`, husky runs `npx lint-staged`.
lint-staged runs `prettier --write` on all staged `{ts,tsx,json,md}` files.
The commit proceeds only if prettier succeeds.

ESLint and typecheck are **not** in the pre-commit hook — they're slower and already
enforced in CI. The hook is intentionally fast (< 1 second on typical change sets).

---

## CI workflow

Two jobs, sequential:

```
quality (lint + typecheck + format:check) → test (vitest)
```

`test` job has `needs: quality` — tests don't run if the quality gate fails.
This prevents wasting CI minutes on test runs for code that won't pass review anyway.
