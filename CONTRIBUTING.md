# Contributing to Fretwork

Thanks for your interest in contributing. This document covers the basics you need to get started.

---

## Getting Started

1. Fork the repository
2. Clone your fork and set up the dev environment (see [README.md](README.md))
3. Create a branch from `main` for your work
4. Make your changes
5. Run the full check suite before pushing:

```bash
# Client
cd client && npm run lint && npm run typecheck && npm test

# Server
cd server && npm run lint && npm run typecheck && npm test
```

6. Push your branch and open a pull request against `main`

---

## Code Style

- **TypeScript** throughout (client and server)
- **Prettier** for formatting, **ESLint** for linting
- Use `import type` for type-only imports
- No `any` types — use `unknown` if the type is genuinely unknown
- Shared types go in `shared/types/` and are imported by both client and server

Pre-commit hooks (Husky + lint-staged) will auto-format staged files. If the hook fails, fix the issue before committing.

---

## Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(auth): add password reset flow
fix(practice): prevent duplicate session on double-submit
refactor(db): extract connection pooling to module
test: add analytics summary route tests
docs: update README with API reference
chore: upgrade MUI to v7.1
```

Types: `feat` | `fix` | `refactor` | `test` | `ci` | `docs` | `chore` | `perf`

---

## Pull Requests

- Keep PRs focused — one feature or fix per PR
- Include a clear description of what changed and why
- Make sure CI passes (lint, typecheck, tests)
- If your change adds a new API endpoint, add the shared types in `shared/types/` first
- If your change requires a database migration, include the SQL file in `supabase/migrations/`

---

## Database Changes

- Migrations go in `supabase/migrations/` with the next sequence number (e.g., `025_your_change.sql`)
- Always include RLS policies for new tables (`auth.uid() = user_id`)
- Test your migration against a fresh Supabase project before submitting

---

## Adding a Curriculum

No code changes needed. Add rows to `curriculum_sources` and `curriculum_skill_entries` in a new migration file. See migration `008_seed_curricula.sql` for the pattern.

---

## Reporting Bugs

Open a [GitHub Issue](https://github.com/rajathbrgowda/guitar-mastery-hub/issues) with:

1. Steps to reproduce
2. Expected behaviour
3. Actual behaviour
4. Browser and OS (if frontend issue)

---

## Questions?

Open an issue or start a discussion. There are no dumb questions.
