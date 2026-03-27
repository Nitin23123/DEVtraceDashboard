---
phase: 01-foundation
plan: 03
subsystem: auth
tags: [jwt, bcryptjs, express, postgres, middleware]

# Dependency graph
requires:
  - phase: 01-02
    provides: pg Pool query function and users table schema (id, email, password_hash)

provides:
  - POST /api/auth/register endpoint (201 + JWT on success, 409 on duplicate, 400 on missing fields)
  - POST /api/auth/login endpoint (200 + JWT on success, 401 on wrong credentials)
  - GET /api/auth/me endpoint (200 + user on valid token, 401 on missing/invalid token)
  - verifyToken middleware that reads Bearer token and attaches req.user = { id, email }
  - Auth router mounted at /api/auth in app.js

affects:
  - 01-04 (frontend auth consuming these endpoints)
  - All Phase 2+ plans that use verifyToken for protected routes

# Tech tracking
tech-stack:
  added: [bcryptjs, jsonwebtoken]
  patterns:
    - JWT stateless auth — sign on register/login, verify on protected routes
    - bcrypt with 12 salt rounds for password hashing
    - Email normalized to lowercase before storage and lookup

key-files:
  created:
    - backend/src/middleware/auth.js
    - backend/src/controllers/authController.js
    - backend/src/routes/auth.js
  modified:
    - backend/src/app.js

key-decisions:
  - "verifyToken attaches req.user = { id, email } — minimal payload for downstream route use"
  - "Email normalized toLower at write and read — prevents case-sensitive duplicate accounts"
  - "bcrypt salt rounds = 12 — balance of security and performance for dev environment"
  - "JWT payload contains only { id, email } — sufficient for Phase 2+ route authorization without DB lookup"

patterns-established:
  - "Protected route pattern: router.get('/path', verifyToken, handler)"
  - "Auth error response shape: { error: 'message string' } with appropriate HTTP status"
  - "Controller imports: const { query } = require('../db') — consistent with 01-02 pool singleton"

requirements-completed: [AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05]

# Metrics
duration: 5min
completed: 2026-03-27
---

# Phase 1 Plan 3: Auth Backend Summary

**Express JWT auth backend — register/login/getMe endpoints with bcrypt password hashing and verifyToken middleware ready for all Phase 2+ protected routes**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-27T12:44:31Z
- **Completed:** 2026-03-27T12:49:00Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Created `verifyToken` middleware reading `Authorization: Bearer` header, attaching `req.user = { id, email }`, returning 401 on missing/invalid token
- Implemented `register` (bcrypt hash + 409 duplicate check), `login` (bcrypt compare + 401 on mismatch), and `getMe` (DB lookup by token's user id)
- Wired auth router at `/api/auth` in `app.js` with 404 fallthrough and global error handler

## Endpoint Contracts

### POST /api/auth/register
- **Body:** `{ "email": "user@example.com", "password": "password123" }`
- **Success:** `201 { token: "<jwt>", user: { id, email } }`
- **Duplicate email:** `409 { error: "Email already registered" }`
- **Missing fields:** `400 { error: "Email and password are required" }`
- **Short password:** `400 { error: "Password must be at least 6 characters" }`

### POST /api/auth/login
- **Body:** `{ "email": "user@example.com", "password": "password123" }`
- **Success:** `200 { token: "<jwt>", user: { id, email } }`
- **Wrong credentials:** `401 { error: "Invalid email or password" }`

### GET /api/auth/me
- **Header:** `Authorization: Bearer <token>`
- **Success:** `200 { user: { id, email, created_at } }`
- **No/invalid token:** `401 { error: "Access token required" | "Invalid or expired token" }`

## verifyToken Usage Pattern (for Phase 2+ routes)

```javascript
const { verifyToken } = require('../middleware/auth');

// Protect any route:
router.get('/protected', verifyToken, (req, res) => {
  // req.user = { id, email } from verified JWT
  res.json({ userId: req.user.id });
});
```

## JWT Payload Structure

```javascript
{ id: <number>, email: <string> }
// Signed with process.env.JWT_SECRET
// Expires per process.env.JWT_EXPIRES_IN (default: '24h')
```

## Task Commits

Each task was committed atomically:

1. **Task 1: Create JWT middleware and auth controller** - `4e47dbb` (feat)
2. **Task 2: Create auth router and mount in app.js** - `db0c906` (feat)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified
- `backend/src/middleware/auth.js` - verifyToken middleware extracting and verifying Bearer JWT
- `backend/src/controllers/authController.js` - register, login, getMe handlers with bcrypt + JWT
- `backend/src/routes/auth.js` - Express router wiring /register, /login, /me to controllers
- `backend/src/app.js` - Auth router mounted at /api/auth; 404 and error handler middleware added

## Decisions Made
- verifyToken attaches minimal `{ id, email }` to req.user — enough for all downstream authorization without extra DB roundtrips
- Email normalized to lowercase at every write and read — prevents case-sensitive duplicate accounts at the application layer (DB UNIQUE constraint is the safety net)
- bcrypt salt rounds = 12 — slightly above default 10, balances security vs. startup time in Docker

## Deviations from Plan

None - plan executed exactly as written. Both files (routes/auth.js and app.js update) were already in the expected state when Task 2 began, indicating a prior partial run. Verified all content matched the plan spec before proceeding.

## Issues Encountered

None - all required npm dependencies (bcryptjs, jsonwebtoken, express) were already in backend/package.json from plan 01-02 scaffolding.

## User Setup Required

None - no external service configuration required. JWT_SECRET and JWT_EXPIRES_IN are already set in .env from plan 01-01.

## Next Phase Readiness
- Auth backend fully operational — ready for plan 01-04 frontend integration
- `verifyToken` middleware exported and documented — Phase 2+ routes can use immediately
- All AUTH-01 through AUTH-05 requirements satisfied

---
*Phase: 01-foundation*
*Completed: 2026-03-27*
