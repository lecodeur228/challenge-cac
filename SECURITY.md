# Security & authorized testing

## Contact

Signaler une vulnérabilité en ouvrant une **GitHub Security Advisory** privée sur ce dépôt (ou une issue privée si indisponible). Ne pas publier d’exploit avant correction.

## Production

- **App :** https://challenge-cac.vercel.app  
- **Auth / DB :** Supabase project `mfnvfqkmnqduxjbdomgy`

## Accès pentester (autorisé)

1. Code d’invitation challenge : `studia-pentest-2026`
2. Aller sur `/signup`, créer un compte admin (mot de passe ≥ 8 caractères).
3. Se connecter sur `/login`.
4. Dans Supabase Auth, **Confirm email** doit être désactivé pour les comptes de test (sinon pas de session immédiate).

> Sans ce code, `/signup` est refusé (anti-prise de contrôle admin). Changez `SIGNUP_INVITE_CODE` après le challenge.

## Périmètre (in scope)

| Zone | Détail |
|------|--------|
| Web app | `challenge-cac.vercel.app` (routes `/`, `/login`, `/signup`, `/dashboard/*`) |
| Auth | Supabase Auth email/password (cookies session) |
| API data | Tables via PostgREST Supabase (RLS) : `students`, `courses`, `enrollments`, `grades`, `absences` |
| Server Actions | Mutations Next.js (CRUD + auth) |

## Hors périmètre (out of scope)

- Attaques DoS / flood volumétrique
- Phishing / social engineering hors scope technique
- Compromission du compte Vercel / GitHub / Supabase org
- Attaques sur l’infra cloud tierce hors de l’app
- Service role / clés serveur (non exposées volontairement)

## Modèle de sécurité attendu

- **Anon** : aucun accès CRUD aux tables (RLS + grants).
- **Authenticated** : accès admin CRUD (app mono-tenant).
- Middleware : `getUser()` (JWT validé) pour protéger `/dashboard/*`.
- Validation Zod côté serveur (longueurs, UUID, plages notes 0–20).
- Headers : HSTS, `X-Frame-Options: DENY`, CSP, `nosniff`, `Referrer-Policy`.
- Messages d’auth génériques (pas d’énumération email/mot de passe détaillée).
- Pas de clé `service_role` dans le frontend.

## Surface d’attaque utile pour les tests

```
GET  /login /signup /dashboard/*
POST server actions (login, signup, CRUD)
Supabase REST: https://mfnvfqkmnqduxjbdomgy.supabase.co/rest/v1/*
Supabase Auth: https://mfnvfqkmnqduxjbdomgy.supabase.co/auth/v1/*
```

Fichiers utiles : `supabase/schema.sql`, `src/app/actions/*`, `src/middleware.ts`, `src/lib/validation.ts`.

## Checklist anti-régression (déjà couverte)

- [x] Pas d’inscription ouverte sans invite
- [x] Dashboard inaccessible sans session
- [x] Validation stricte des entrées
- [x] RLS activée, `anon` sans droits table
- [x] Headers de sécurité HTTP
- [x] `.env*` gitignoré (pas de secrets commités)

## Report format suggéré

Titre, sévérité (CVSS si possible), steps to reproduce, impact, preuve (requête/réponse), remediation proposée.
