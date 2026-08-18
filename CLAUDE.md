# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Fines-management SPA ("multas"). Admins register people, define fine reasons, issue fines, and mark them paid; the public sees an anonymized dashboard of pending fines and can file anonymous complaints. React 19 + Vite + TypeScript frontend backed entirely by Firebase (Auth + Firestore) — there is no custom backend server. UI copy and error messages are in Spanish.

## Commands

- `pnpm dev` — Vite dev server (requires `VITE_FIREBASE_*` env vars; app throws on startup if `apiKey`/`authDomain`/`projectId`/`appId` are missing — see [src/service/firebase/config.ts](src/service/firebase/config.ts)).
- `pnpm build` — type-check (`tsc -b`) then Vite production build to `dist/`.
- `pnpm lint` — ESLint (flat config).
- `pnpm preview` — serve the built `dist/`.

Package manager is **pnpm** (`pnpm-lock.yaml`, corepack `pnpm@10`). This is a single-package repo despite having a `pnpm-workspace.yaml`.

> Note: `package.json` defines `seed`/`seed:reset` scripts pointing at `scripts/seedFirestore.ts`, but that file/directory does not currently exist in the repo.

## Architecture

### Feature-slice layout
Code under [src/features/](src/features/) is organized by domain (`auth`, `fines`, `fined` [= people], `reasons`, `complaints`, `public`). Each slice follows the same shape:
- `api/` — Firestore reads/writes and TypeScript types for that domain.
- `hooks/` — TanStack Query wrappers (`useQuery`/`useMutation`) that call the `api/` functions.
- `components/` — domain-specific UI.

Pages ([src/pages/](src/pages/)) and layouts ([src/components/](src/components/)) compose these hooks. Routing is centralized in [src/app/router.tsx](src/app/router.tsx) (`createBrowserRouter`); `/admin/*` routes are wrapped in `ProtectedAdminRoute`.

### Firestore data model & the public/private split
This is the central design decision. Two parallel sets of collections keep admin data private while exposing a safe read-only public view:

- **Private (admin-only):** `fines`, `finedPeople`, `users` (admin profiles). Guarded by `isAdmin()` in [firestore.rules](firestore.rules).
- **Public (world-readable):** `publicFines`, `publicSummaries`, `reasons`. Only admins can write them.

When an admin issues or pays a fine, the `api/fines.ts` functions (`createFine`, `payFine`) use a **Firestore `runTransaction`** to atomically update the private `fines` doc *and* mirror it into `publicFines` + recompute the per-person `publicSummaries` aggregate (`pendingTotal`, `pendingFineCount`, `visible`). When editing these functions, keep all three collections in sync or the public dashboard will drift from reality.

The public dashboard subscribes to `publicFines` in real time via `onSnapshot` (`subscribePublicDashboardFines` → `usePublicDashboardFines`), pushing updates into the query cache with `queryClient.setQueryData`.

### Auth
Firebase Auth email/password. Being signed in is not enough — `getAdminProfile` ([src/features/auth/api/auth.ts](src/features/auth/api/auth.ts)) additionally requires a `users/{uid}` doc with `role === "admin"` and `active === true`, mirrored by the `isAdmin()` Firestore rule. `loginAdmin` signs the user back out if the profile check fails. Auth state is provided app-wide by `AuthProvider` / `useAuth`.

### TanStack Query & persistence
- Query client config and keys live in [src/app/](src/app/). **Always reference query keys via `queryKeys`** ([src/app/queryKeys.ts](src/app/queryKeys.ts)) rather than inline arrays, so cache invalidation stays consistent.
- The app wraps everything in `PersistQueryClientProvider` ([src/main.tsx](src/main.tsx)) persisting to `localStorage`. **Only `reasons` and `publicSummaries` queries are persisted** (see `persistedQueryKeys` + `shouldDehydrateQuery`) — private admin data is intentionally never written to localStorage. `clearPrivateQueries()` in [src/app/queryClient.ts](src/app/queryClient.ts) drops private caches (e.g. on logout).
- Bump the `buster` string in `main.tsx` (and the persister `key`) when the persisted cache shape changes.

## Styling
Tailwind CSS v4 via the `@tailwindcss/vite` plugin (no `tailwind.config.js`; configured in [vite.config.ts](vite.config.ts)). Icons come from `@hugeicons/react`.

## Deployment
Push to `main` triggers [.github/workflows/cd.yml](.github/workflows/cd.yml): builds the [Dockerfile](Dockerfile) (multi-stage → static build served by nginx, SPA fallback in [nginx.conf](nginx.conf)), pushes to GHCR, then a self-hosted runner pulls via `docker compose` on the target NAS. `VITE_FIREBASE_*` values are injected as build args from GitHub Actions **variables** (not secrets). The `firebase-hosting-*.yml.disabled` workflows are retired — deployment is Docker/nginx, not Firebase Hosting.
