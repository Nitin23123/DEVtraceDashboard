---
phase: 02-core-crud
plan: 01
subsystem: api
tags: [express, postgres, rest-api, crud, jwt, middleware]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: verifyToken middleware (req.user.id), query() db helper, tasks table schema
provides:
  - tasks CRUD REST API (5 endpoints) protected by verifyToken
  - User-scoped SQL queries (WHERE user_id = $N) on all task operations
  - Partial update support via COALESCE pattern in updateTask
affects:
  - 02-02 (tasks frontend consumes these endpoints)
  - 02-03, 02-04, 02-05 (same controller/router pattern for notes, streaks, goals)

# Tech tracking
tech-stack:
  added: []
  patterns: [COALESCE partial update, verifyToken on every route, next(err) error propagation]

key-files:
  created:
    - backend/src/controllers/tasksController.js
    - backend/src/routes/tasks.js
  modified:
    - backend/src/app.js

key-decisions:
  - "COALESCE($N, column) for partial updates — avoids overwriting fields not sent in request body"
  - "null default for optional fields (description, due_date) in createTask — DB defaults handle status/priority"
  - "next(err) for error propagation to global error handler — consistent with Phase 1 auth controller pattern"

patterns-established:
  - "Controller pattern: all handlers async with try/catch and next(err)"
  - "User scoping: every SQL query includes AND user_id = req.user.id"
  - "404 on empty result: check result.rows.length === 0 before responding"

requirements-completed: [TASK-01, TASK-02, TASK-03, TASK-04, TASK-05]

# Metrics
duration: 5min
completed: 2026-03-27
---

# Phase 2 Plan 01: Tasks CRUD Backend Summary

**5-endpoint tasks REST API with user-scoped SQL queries, verifyToken on all routes, and COALESCE partial updates via Express + pg**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-27T12:50:00Z
- **Completed:** 2026-03-27T12:55:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Created `tasksController.js` with all 5 handler functions (getTasks, createTask, getTask, updateTask, deleteTask)
- All SQL queries scoped to `req.user.id` — no user can read or modify another user's tasks
- Created `routes/tasks.js` with verifyToken on every route, mounted at `/api/tasks` in app.js

## Task Commits

Each task was committed atomically:

1. **Task 1: Create tasks controller** - `1dda57e` (feat)
2. **Task 2: Create tasks router and mount in app.js** - `f37839e` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `backend/src/controllers/tasksController.js` - 5 async CRUD handlers with user-scoped queries
- `backend/src/routes/tasks.js` - Express router with verifyToken on all 5 routes
- `backend/src/app.js` - Added tasks router mount at /api/tasks before 404 handler

## Decisions Made
- COALESCE pattern for `updateTask` — allows partial updates without overwriting unset fields, no need to build dynamic SET clause
- Optional fields (description, due_date) default to `null` in `createTask` — DB CHECK constraints handle status/priority defaults
- Used `next(err)` for catch blocks — delegates to global error handler established in Phase 1

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Plan's verify command (`node -e "const c = require('./backend/src/controllers/tasksController.js')..."`) fails locally because `pg` is not installed in the host environment (only available inside Docker containers). Verification performed using a mock approach to confirm all 5 exports resolve correctly. Functional verification requires a running Docker stack.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Tasks backend API complete and ready for consumption by plan 02-02 (tasks frontend)
- All 5 endpoints protected by verifyToken — unauthenticated requests will receive 401
- Pattern established (controller + router + app.js mount) is reusable for notes/streaks/goals in subsequent plans

---
*Phase: 02-core-crud*
*Completed: 2026-03-27*
