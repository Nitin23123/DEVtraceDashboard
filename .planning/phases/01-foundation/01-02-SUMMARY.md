---
phase: 01-foundation
plan: "02"
subsystem: database
tags: [postgres, pg, sql, express, node, docker]

requires:
  - phase: 01-foundation plan 01
    provides: docker-compose.yml postgres service with /docker-entrypoint-initdb.d volume mount

provides:
  - PostgreSQL schema with 6 tables (users, tasks, notes, goals, api_logs, streaks)
  - pg Pool singleton module (backend/src/db/index.js) exporting { pool, query }
  - Express app skeleton with GET /health endpoint
  - backend/package.json with all dependencies for plans 01-03 through 03-03

affects: [01-03, 01-04, 02-01, 02-02, 02-03, 03-01, 03-02, 03-03]

tech-stack:
  added: [pg@8.11.3, express@4.18.2, bcryptjs@2.4.3, jsonwebtoken@9.0.2, cors@2.8.5, dotenv@16.4.5, nodemon@3.0.3]
  patterns: [pg-pool-singleton, DATABASE_URL-env, query-helper-function, docker-entrypoint-initdb.d]

key-files:
  created:
    - backend/src/db/migrations/001_initial_schema.sql
    - backend/src/db/index.js
    - backend/package.json
    - backend/src/app.js
    - backend/src/server.js
  modified: []

key-decisions:
  - "IF NOT EXISTS guards on all CREATE TABLE/INDEX statements to allow safe docker volume recreate"
  - "ON DELETE CASCADE on all FK references ensures data integrity without orphaned records"
  - "UNIQUE constraint on streaks.user_id enforces one-streak-per-user at DB level"
  - "pg Pool singleton pattern: single pool instance shared across all route handlers via require cache"
  - "DATABASE_URL environment variable only — no hardcoded credentials anywhere"

patterns-established:
  - "Pool singleton: require('../../db') returns { pool, query } — use query() for parameterized SQL"
  - "Migration naming: NNN_description.sql — postgres auto-runs these on first container init"
  - "Express app factory in app.js, server bootstrap in server.js — separates app config from process binding"

requirements-completed: [AUTH-01, AUTH-02]

duration: 5min
completed: 2026-03-27
---

# Phase 1 Plan 02: PostgreSQL Schema and pg Pool Module Summary

**6-table PostgreSQL schema auto-loaded via docker-entrypoint-initdb.d, with pg Pool singleton exporting { pool, query } and Express skeleton with GET /health**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-27T12:39:35Z
- **Completed:** 2026-03-27T12:40:38Z
- **Tasks:** 2
- **Files created:** 5

## Accomplishments
- SQL migration with 6 tables (users, tasks, notes, goals, api_logs, streaks) including all FK, CHECK, and UNIQUE constraints
- pg Pool singleton module that all route handlers will import via `require('./db')`
- Express app skeleton with CORS middleware and GET /health healthcheck route
- backend/package.json with full dependency set for all subsequent plans (01-03 through 03-03)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create SQL migration file with all 6 tables** - `36cbb1d` (feat)
2. **Task 2: Create pg Pool module and scaffold backend package.json** - `9fee62f` (feat)

## Files Created/Modified
- `backend/src/db/migrations/001_initial_schema.sql` - Full PostgreSQL schema; auto-run by postgres container on first init via /docker-entrypoint-initdb.d volume mount
- `backend/src/db/index.js` - pg Pool singleton; exports `{ pool, query }` used by all route handlers
- `backend/package.json` - All backend dependencies (express, pg, bcryptjs, jsonwebtoken, cors, dotenv) + nodemon dev dependency
- `backend/src/app.js` - Express app factory with CORS and GET /health; route mounting stubbed for plan 01-03
- `backend/src/server.js` - Server entrypoint; listens on PORT env var (default 5000)

## Schema Details

### Tables and Key Constraints

| Table | Key Constraints |
|-------|-----------------|
| users | email UNIQUE NOT NULL, password_hash NOT NULL |
| tasks | user_id FK CASCADE, status CHECK ('todo','in_progress','done'), priority CHECK ('low','medium','high') |
| notes | user_id FK CASCADE |
| goals | user_id FK CASCADE, is_completed BOOLEAN DEFAULT false |
| api_logs | user_id FK CASCADE, request_body/response_body JSONB |
| streaks | user_id UNIQUE FK CASCADE (one row per user), current_streak/longest_streak INTEGER |

### Indexes
- idx_tasks_user_id, idx_tasks_status
- idx_notes_user_id, idx_goals_user_id
- idx_api_logs_user_id, idx_api_logs_created_at

## How to Query the DB from Within the Container

```bash
# Connect to postgres container
docker compose exec postgres psql -U devtrackr_user -d devtrackr

# List all tables
\dt

# Verify all 6 tables exist
SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name;

# Check constraints on tasks table
\d tasks
```

## Decisions Made
- Used `IF NOT EXISTS` on all CREATE TABLE and CREATE INDEX to make the migration idempotent — safe to re-run after `docker compose down -v && docker compose up`
- Used `ON DELETE CASCADE` on all FK references so deleting a user removes all their data automatically
- UNIQUE constraint on `streaks.user_id` enforces the one-streak-per-user business rule at the DB level rather than application level
- pg Pool connection string reads from `DATABASE_URL` env var only — no credentials in source files

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required. The DATABASE_URL is set via .env file (created in plan 01-01) and injected by Docker Compose.

## Next Phase Readiness
- Schema is ready; postgres container will auto-run 001_initial_schema.sql on first `docker compose up`
- `backend/src/db/index.js` is ready for import by plan 01-03 auth route handlers
- Express app skeleton awaits route mounting in plan 01-03

---
*Phase: 01-foundation*
*Completed: 2026-03-27*

## Self-Check: PASSED

- FOUND: backend/src/db/migrations/001_initial_schema.sql
- FOUND: backend/src/db/index.js
- FOUND: backend/package.json
- FOUND: backend/src/app.js
- FOUND: backend/src/server.js
- FOUND: .planning/phases/01-foundation/01-02-SUMMARY.md
- FOUND commit: 36cbb1d (Task 1)
- FOUND commit: 9fee62f (Task 2)
