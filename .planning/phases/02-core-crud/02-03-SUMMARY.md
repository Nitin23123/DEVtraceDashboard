---
phase: 02-core-crud
plan: 03
subsystem: api
tags: [express, postgres, notes, crud, jwt, middleware]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: verifyToken middleware (req.user = {id, email}), pg Pool query() helper, notes table schema
provides:
  - Notes CRUD REST API: 5 endpoints at /api/notes all gated by verifyToken
  - All queries scoped to authenticated user via WHERE user_id = req.user.id
affects: [02-04-notes-frontend, phase-03-streaks]

# Tech tracking
tech-stack:
  added: []
  patterns: [controller/router separation, user-scoped SQL queries with req.user.id, COALESCE for partial updates]

key-files:
  created:
    - backend/src/controllers/notesController.js
    - backend/src/routes/notes.js
  modified:
    - backend/src/app.js

key-decisions:
  - "COALESCE($1, title) in updateNote allows partial updates without requiring all fields"
  - "WHERE id = $N AND user_id = $M on all single-note queries enforces ownership at DB level"

patterns-established:
  - "Pattern: User-scoped queries always include AND user_id = req.user.id — never trust client-provided userId"
  - "Pattern: COALESCE for partial update allows frontend to send only changed fields"

requirements-completed: [NOTE-01, NOTE-02, NOTE-03, NOTE-04]

# Metrics
duration: 2min
completed: 2026-03-27
---

# Phase 2 Plan 03: Notes CRUD Backend Summary

**5 user-scoped REST endpoints at /api/notes protected by verifyToken, with COALESCE partial updates and ownership enforcement at the SQL level**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-03-27T12:30:19Z
- **Completed:** 2026-03-27T12:32:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Notes controller with 5 handlers: getNotes, createNote, getNote, updateNote, deleteNote
- All queries scope results to req.user.id — a user cannot read or modify another user's notes
- Notes router with 5 routes, all protected by verifyToken middleware
- Notes router mounted at /api/notes in app.js without disturbing existing routes

## Task Commits

Each task was committed atomically:

1. **Task 1: Create notes controller** - `0d3323d` (feat)
2. **Task 2: Create notes router and mount in app.js** - `df367de` (feat)

## Files Created/Modified
- `backend/src/controllers/notesController.js` - 5 async CRUD handlers with try/catch and user-scoped SQL queries
- `backend/src/routes/notes.js` - Express router mapping 5 routes to controller handlers via verifyToken
- `backend/src/app.js` - Added notesRouter mount at /api/notes

## Decisions Made
- COALESCE in updateNote enables partial updates — frontend can send only changed fields without overwriting others with null
- Ownership enforced at SQL level (WHERE id = $N AND user_id = $M) rather than fetch-then-check — atomic and correct

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Installed missing npm dependencies**
- **Found during:** Task 1 verification (notesController require check)
- **Issue:** backend/node_modules was empty — `npm install` had not been run, `pg` not available
- **Fix:** Ran `npm install` in backend/ directory — 127 packages installed
- **Files modified:** backend/node_modules/ (not tracked in git)
- **Verification:** node require of notesController resolved successfully after install
- **Committed in:** Not committed (node_modules is gitignored)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Required fix to verify the code; no scope creep.

## Issues Encountered
- backend/node_modules was empty on this machine — dependencies installed as part of plan execution before verification could run

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Notes CRUD API complete and ready for plan 02-04 (Notes frontend)
- All 5 endpoints gated by verifyToken — unauthenticated requests get 401
- No blockers

---
*Phase: 02-core-crud*
*Completed: 2026-03-27*
