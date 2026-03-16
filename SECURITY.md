# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in Fretwork, please report it responsibly.

**Do not open a public GitHub issue for security vulnerabilities.**

Instead, email the maintainer or open a [private security advisory](https://github.com/rajathbrgowda/guitar-mastery-hub/security/advisories/new) on GitHub.

Include:

- A description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if you have one)

You will receive a response within 72 hours acknowledging the report. Fixes for confirmed vulnerabilities will be prioritized and released as soon as possible.

---

## Scope

The following are in scope:

- Authentication and authorization bypasses
- Row-Level Security (RLS) policy violations
- Cross-site scripting (XSS)
- SQL injection
- Sensitive data exposure
- Server-side request forgery (SSRF)
- Any issue that could compromise user data

The following are out of scope:

- Denial of service (the app runs on free-tier hosting)
- Social engineering
- Issues in third-party dependencies (report these upstream)
- Issues that require physical access to a user's device

---

## Security Architecture

- All database tables enforce Row-Level Security with `auth.uid() = user_id` policies
- Authentication is handled by Supabase Auth (JWT-based)
- Auth tokens are stored in memory (not localStorage) to mitigate XSS
- The server-side service role key is never exposed to the frontend
- CORS is configured to allow only the production frontend origin
- All API inputs are validated with Zod schemas

---

## Supported Versions

Only the latest version deployed to production is supported with security updates.
