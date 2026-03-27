---
phase: 04-developer-profiles
plan: "01"
subsystem: backend
tags: [github-oauth, auth, profile, migration, express]
dependency_graph:
  requires: [backend/src/middleware/auth.js, backend/src/db, node-fetch@2, jsonwebtoken]
  provides: [GET /api/auth/github, GET /api/auth/github/callback, GET /api/profile/github]
  affects: [backend/src/app.js, users table]
tech_stack:
  added: []
  patterns: [stateless-oauth-via-jwt-state, dual-router-single-file, parallel-github-api-fetch]
key_files:
  created:
    - backend/src/db/migrations/002_add_github_oauth.sql
    - backend/src/routes/github.js
  modified:
    - backend/src/app.js
decisions:
  - JWT carried through OAuth flow as base64-encoded state param — no cookies or sessions
  - Two routers exported from one file to avoid path collision at different mount points
  - GitHub profile endpoint fetches profile + repos + events in parallel via Promise.all
metrics:
  duration_seconds: 99
  completed_date: "2026-03-27"
  tasks_completed: 3
  tasks_total: 3
  files_created: 2
  files_modified: 1
---

# Phase 4 Plan 1: GitHub OAuth Backend Summary

GitHub OAuth backend with stateless JWT state parameter — three routes, one migration, zero sessions.

## What Was Built

A complete GitHub OAuth integration for the backend:

1. **Database migration** (`002_add_github_oauth.sql`): Adds `github_access_token TEXT` and `github_username VARCHAR(255)` columns to the `users` table via `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`. Applied live to `devtrace-postgres-1`.

2. **GitHub routes** (`backend/src/routes/github.js`): Exports two Express routers:
   - `authRouter` (mounted at `/api/auth`):
     - `GET /api/auth/github?token=<jwt>` — Encodes JWT as base64 state, redirects to GitHub OAuth with `client_id`, `scope=read:user,public_repo`, and `state`.
     - `GET /api/auth/github/callback` — Decodes state to recover JWT and user ID, exchanges `code` for access token via POST to GitHub, fetches GitHub username, persists both to DB, redirects to `http://localhost:3000/profile?github=connected`.
   - `profileRouter` (mounted at `/api/profile`):
     - `GET /api/profile/github` — Requires `verifyToken`. Loads stored access token from DB, fetches profile, repos, and events from GitHub API in parallel, returns structured JSON with `login`, `name`, `avatar_url`, `bio`, `public_repos`, `total_stars`, `followers`, `following`, `html_url`, `recent_activity`.

3. **App wiring** (`backend/src/app.js`): Added two mount lines after the dashboard router, coexisting with the existing `/api/auth` routes (no path conflict — different sub-paths).

## Commits

| Task | Commit  | Description                                           |
| ---- | ------- | ----------------------------------------------------- |
| 1    | 5edc3bd | chore(04-01): add GitHub OAuth migration              |
| 2    | ed07e6d | feat(04-01): create github.js with authRouter and profileRouter |
| 3    | cac7156 | feat(04-01): wire GitHub OAuth routers into app.js    |

## Verification Results

All checks passed:

- `002_add_github_oauth.sql` exists and contains both `ALTER TABLE` columns
- Migration applied live — `\d users` in DB shows `github_access_token text` and `github_username character varying(255)`
- `node -e "const g = require('./backend/src/routes/github'); console.log(typeof g.authRouter, typeof g.profileRouter);"` outputs `function function`
- `node -e "require('./backend/src/app'); console.log('app.js OK');"` outputs `app.js OK`

## Decisions Made

- **JWT-as-state**: The frontend's JWT is base64-encoded and passed as the OAuth `state` parameter. The callback decodes it to identify the user without any server-side session or cookie. This is stateless and aligns with the project's JWT-first auth approach.
- **Dual-router single-file**: Two routers (`authRouter`, `profileRouter`) exported from one file. This avoids a path collision that would occur if a single router were mounted at two different prefixes (`/api/auth` and `/api/profile`).
- **Parallel GitHub API fetch**: `Promise.all` fetches profile, repos, and events concurrently in `GET /api/profile/github`, reducing latency compared to sequential calls.

## Deviations from Plan

None - plan executed exactly as written.

## Self-Check: PASSED

- `backend/src/db/migrations/002_add_github_oauth.sql` — FOUND
- `backend/src/routes/github.js` — FOUND
- `backend/src/app.js` — MODIFIED (verified)
- Commit `5edc3bd` — FOUND
- Commit `ed07e6d` — FOUND
- Commit `cac7156` — FOUND
