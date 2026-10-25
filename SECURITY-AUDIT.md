# Security audit (re-run)

Date: 2026-10-25  
Target: https://challenge-cac.vercel.app + repo `challenge-cac`

## Findings (fixed in same pass)

| Severity | Location | Finding | Status |
|----------|----------|---------|--------|
| Medium | `src/app/auth/callback/route.ts` | Open redirect via `next=` after code exchange | **Fixed** — relative path allowlist only |
| Medium | `src/app/actions/auth.ts` | Login message enumerated unconfirmed emails | **Fixed** — generic error only |

## Checks OK

| Area | Result |
|------|--------|
| Dashboard gate (`getUser`) | OK — unauth → `/login` |
| Signup without invite | OK — refused |
| Security headers (CSP, HSTS, XFO, nosniff) | OK on prod |
| Anon REST without JWT | Expected deny once tables + RLS exist |
| Seed action | Auth required; idempotent if data exists |
| Secrets in git | `.env*` ignored |

## Residual / by design (challenge)

- Invite code published in `PENTEST.md` (authorized testers)
- Authenticated users share full CRUD (mono-tenant admin app)
- CSP allows `'unsafe-inline'` / `'unsafe-eval'` (Next.js constraint)

## Prod seed

1. Run `supabase/setup-all.sql` in SQL Editor (schema + seed), **or**
2. Run schema only, login, click **Charger les données de démo** on Accueil.
