# Studia — Gestion des étudiants

Application web de gestion scolaire : étudiants, cours, inscriptions, notes et absences.

**Stack :** Next.js 16 · Supabase (Auth + Postgres + RLS) · Vercel  
**Live :** https://challenge-cac.vercel.app

## Fonctionnalités

- Authentification admin (email / mot de passe)
- Inscription protégée par **code d’invitation**
- CRUD : étudiants, cours, inscriptions, notes, absences
- Dashboard avec compteurs
- Sécurité : RLS Supabase, validation Zod, headers HTTP, sessions via `getUser()`

## Démarrage local

```bash
npm install
cp .env.example .env.local
# renseigner SUPABASE + SIGNUP_INVITE_CODE
npm run dev
```

Ouvre http://localhost:3000

### Variables d’environnement

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Clé publishable (anon) |
| `SIGNUP_INVITE_CODE` | Secret requis pour `/signup` |

### Base de données

Exécuter une fois [`supabase/schema.sql`](supabase/schema.sql) dans le SQL Editor Supabase.

Dans **Authentication → Providers → Email** : désactiver *Confirm email* pour les tests.

## Scripts

```bash
npm run dev      # développement
npm run build    # build production
npm run test     # tests unitaires (Vitest)
npm run lint     # ESLint
```

## Sécurité & pentest

Voir **[SECURITY.md](SECURITY.md)** : périmètre, accès autorisé, modèle de menaces, surface d’attaque, format de rapport.

Fichiers publics : [`/.well-known/security.txt`](public/.well-known/security.txt)

## Architecture

```
src/
  app/actions/     # Server Actions (auth + CRUD)
  app/dashboard/   # UI admin
  lib/validation.ts
  utils/supabase/  # clients SSR / browser / middleware
supabase/schema.sql
```

## Déploiement

Déployé sur Vercel. Les variables `NEXT_PUBLIC_SUPABASE_*` et `SIGNUP_INVITE_CODE` doivent être définies dans le projet Vercel.

```bash
vercel --prod
```

## Licence

Projet challenge / démonstration — usage éducatif.
