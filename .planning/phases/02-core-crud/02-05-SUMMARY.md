---
phase: 02-core-crud
plan: 05
subsystem: api
tags: [express, postgres, rest, goals, crud]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: verifyToken middleware attaching req.user = { id, email }; pg query() helper; goals table schema
provides:
  - Goals CRUD REST API (GET, POST, PUT /:id, PUT /:id/complete, DELETE /:id) at /api/goals
  - goalsController with getGoals, createGoal, updateGoal, deleteGoal, completeGoal handlers
  - goals router with correct route ordering (complete before generic PUT /:id)
affects:
  - 02-06 (Goals frontend will consume these endpoints)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - COALESCE for partial updates in SQL (only provided fields overwrite existing)
    - Dedicated complete action endpoint (PUT /:id/complete) separate from general update
    - Route ordering: specific paths before parameterized paths in Express routers

key-files:
  created:
    - backend/src/controllers/goalsController.js
    - backend/src/routes/goals.js
  modified:
    - backend/src/app.js

key-decisions:
  - "PUT /:id/complete declared before PUT /:id in router to ensure Express matches the specific path first"
  - "completeGoal as dedicated handler rather than reusing updateGoal — single responsibility, only flips is_completed"
  - "COALESCE in updateGoal allows partial updates without overwriting fields not provided in request body"

patterns-established:
  - "Ownership scoping: all queries include WHERE user_id = req.user.id for authorization"
  - "404 on empty result: check result.rows.length === 0 and return 404 before accessing rows[0]"
  - "Specific routes before parameterized routes: /:id/complete before /:id"

requirements-completed: [GOAL-01, GOAL-02, GOAL-03, GOAL-04]

# Metrics
duration: 2min
completed: 2026-03-27
---

# Phase 02 Plan 05: Goals CRUD Backend Summary

**Express goals API with five endpoints (including dedicated PUT /:id/complete), all ownership-scoped to req.user.id via verifyToken, mounted at /api/goals in app.js**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-27T14:10:25Z
- **Completed:** 2026-03-27T14:12:32Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Goals controller with five handler functions: getGoals, createGoal, updateGoal, completeGoal, deleteGoal
- Goals router with correct route ordering — PUT /:id/complete before PUT /:id for correct Express matching
- Goals router mounted at /api/goals in app.js alongside existing auth, tasks, and notes routers

## Task Commits

Each task was committed atomically:

1. **Task 1: Create goals controller** - `11a7dd5` (feat)
2. **Task 2: Create goals router and mount in app.js** - `3cf3f8c` (feat)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified

- `backend/src/controllers/goalsController.js` - Five async CRUD handlers, all queries scoped to req.user.id via WHERE user_id = $N
- `backend/src/routes/goals.js` - Express router with 5 routes, verifyToken on all, complete endpoint before generic /:id
- `backend/src/app.js` - Added goalsRouter mount at /api/goals before 404 fallthrough

## Decisions Made

- PUT /:id/complete declared before PUT /:id to prevent Express from capturing the literal "complete" segment as a dynamic :id parameter
- Separate completeGoal handler (not reusing updateGoal) so the complete action only flips is_completed and cannot be misused to change other fields
- COALESCE pattern in updateGoal allows partial updates (only send fields you want to change)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Installed backend npm dependencies**
- **Found during:** Task 1 verification
- **Issue:** backend/node_modules was empty; `node require()` failed with "Cannot find module 'pg'"
- **Fix:** Ran `npm install` in backend/ directory
- **Files modified:** backend/node_modules/ (not committed), backend/package-lock.json
- **Verification:** node -e "require('./src/controllers/goalsController.js')" succeeded
- **Committed in:** Not committed (node_modules excluded by .gitignore)

---

**Total deviations:** 1 auto-fixed (1 blocking — missing npm install)
**Impact on plan:** Auto-fix necessary for verification to run. No scope changes.

## Issues Encountered

- app.js had already been updated by prior plan agents (tasks and notes routers present) — goals mount was added cleanly without conflict

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Goals API fully functional, ready for plan 02-06 (Goals frontend)
- All five endpoints respond: GET, POST, PUT /:id, PUT /:id/complete, DELETE /:id
- Every endpoint returns 401 without a valid Bearer token (verified by verifyToken middleware)
- No blockers for next phase

---
*Phase: 02-core-crud*
*Completed: 2026-03-27*
