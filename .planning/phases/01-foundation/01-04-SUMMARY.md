---
phase: 01-foundation
plan: 04
subsystem: auth
tags: [react, jwt, localstorage, react-router-dom, authcontext, protected-routes]

# Dependency graph
requires:
  - phase: 01-03
    provides: backend auth API endpoints (register, login, me) that the frontend calls

provides:
  - React auth UI with login and register forms at /login and /register
  - AuthContext with { user, token, login(token, user), logout, isLoading } shared app-wide
  - useAuth() hook for consuming AuthContext in any component
  - ProtectedRoute HOC redirecting unauthenticated users to /login
  - JWT token persisted in localStorage, validated on mount via GET /api/auth/me
  - App.js with full React Router v6 route structure

affects:
  - 02-activity-tracking
  - 03-api-tester
  - All future phases using useAuth() and ProtectedRoute patterns

# Tech tracking
tech-stack:
  added:
    - react 18.2.0
    - react-dom 18.2.0
    - react-router-dom 6.22.1
    - react-scripts 5.0.1
  patterns:
    - AuthContext/AuthProvider wraps BrowserRouter children for app-wide auth state
    - useAuth() hook with guard error if used outside AuthProvider
    - ProtectedRoute shows loading spinner during token validation, then redirects or renders

key-files:
  created:
    - frontend/package.json
    - frontend/src/api/auth.js
    - frontend/src/context/AuthContext.js
    - frontend/src/hooks/useAuth.js
    - frontend/src/components/ProtectedRoute.js
    - frontend/src/pages/LoginPage.js
    - frontend/src/pages/RegisterPage.js
    - frontend/src/App.js
    - frontend/src/index.js
    - frontend/public/index.html
  modified:
    - backend/src/app.js (mounted /api/auth routes, added 404/error handlers)
    - backend/src/routes/auth.js (created — was missing from prior plan execution)

key-decisions:
  - "AuthProvider placed inside BrowserRouter so useNavigate works in auth-triggered redirects"
  - "localStorage for token persistence — simple and sufficient for a portfolio app"
  - "Token validated on mount via GET /api/auth/me — expired tokens cleared immediately"
  - "ProtectedRoute uses isLoading guard to prevent flash-of-redirect on page refresh"
  - "DashboardPlaceholder in App.js so /dashboard is functional before Phase 3"

patterns-established:
  - "useAuth() usage: const { user, token, login, logout, isLoading } = useAuth() — call in any component inside AuthProvider"
  - "ProtectedRoute usage: <ProtectedRoute><ComponentRequiringAuth /></ProtectedRoute>"
  - "Auth API calls: import { register, loginRequest, getMe } from '../api/auth' — all calls centralized"

requirements-completed: [AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05]

# Metrics
duration: 3min
completed: 2026-03-27
---

# Phase 1 Plan 4: React Auth UI Summary

**React auth UI with JWT localStorage persistence, AuthContext, ProtectedRoute HOC, and login/register forms calling the Express auth API**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-27T00:03:43Z
- **Completed:** 2026-03-27T00:05:55Z
- **Tasks:** 2
- **Files modified:** 12

## Accomplishments
- Auth API module (register, loginRequest, getMe) centralizes all backend auth calls
- AuthContext validates stored JWT on app mount, preventing stale session bugs
- ProtectedRoute prevents /dashboard flash-of-redirect during async token validation
- Full React Router v6 route structure: /login, /register, /dashboard, catch-all redirects

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold frontend package.json and auth API + context** - `1804afe` (feat)
2. **Task 2: Create ProtectedRoute, Login/Register pages, wire App.js** - `fe214fd` (feat)

**Plan metadata:** (to be added in final commit)

## Route Structure

| Path | Component | Auth Required |
|------|-----------|---------------|
| /login | LoginPage | No (redirects to /dashboard if logged in) |
| /register | RegisterPage | No (redirects to /dashboard if logged in) |
| /dashboard | DashboardPlaceholder (via ProtectedRoute) | Yes |
| / | Navigate to /dashboard | - |
| * | Navigate to /login | - |

## AuthContext API

```javascript
// Available via useAuth() in any component inside AuthProvider:
const { user, token, login, logout, isLoading } = useAuth();

// user: { id, email, created_at } | null
// token: string | null (from localStorage)
// login(token, user): sets token in localStorage + state
// logout(): removes token from localStorage + clears state
// isLoading: boolean — true while validating stored token on mount
```

## useAuth() Pattern

```javascript
import { useAuth } from '../hooks/useAuth';

const MyComponent = () => {
  const { user, token, logout } = useAuth();
  // component code
};
```

## ProtectedRoute Pattern

```javascript
import { ProtectedRoute } from '../components/ProtectedRoute';

// In App.js routes:
<Route
  path="/some-protected-page"
  element={
    <ProtectedRoute>
      <SomePage />
    </ProtectedRoute>
  }
/>
```

## Files Created/Modified

- `frontend/package.json` - React 18 + react-router-dom 6 + react-scripts dependencies
- `frontend/src/api/auth.js` - register, loginRequest, getMe functions calling localhost:5000
- `frontend/src/context/AuthContext.js` - AuthProvider with token/user state, localStorage sync
- `frontend/src/hooks/useAuth.js` - useAuth() hook wrapping AuthContext with guard error
- `frontend/src/components/ProtectedRoute.js` - Redirects to /login if !token, loading spinner while validating
- `frontend/src/pages/LoginPage.js` - Login form with error display, redirects to /dashboard
- `frontend/src/pages/RegisterPage.js` - Register form with minLength=6 validation, redirects to /dashboard
- `frontend/src/App.js` - BrowserRouter + AuthProvider + Routes with ProtectedRoute on /dashboard
- `frontend/src/index.js` - ReactDOM.createRoot entry point
- `frontend/public/index.html` - HTML shell with #root div
- `backend/src/app.js` - Mounted /api/auth router, added 404/error handlers
- `backend/src/routes/auth.js` - Created auth router (was missing from prior execution)

## Decisions Made

- AuthProvider placed inside BrowserRouter so navigate() works when logout triggers redirect
- localStorage chosen for token persistence (simple, sufficient for portfolio project)
- Token validated via GET /api/auth/me on mount so expired tokens are caught immediately
- isLoading guard in ProtectedRoute prevents flash-of-redirect on browser refresh
- DashboardPlaceholder renders in App.js so /dashboard route is functional before Phase 3

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Created missing backend/src/routes/auth.js and updated app.js**
- **Found during:** Pre-execution check
- **Issue:** Plan 01-03 left routes/auth.js uncreated and app.js had auth route commented out. Without this, the entire frontend auth flow would fail with 404 on all /api/auth/* calls.
- **Fix:** Created backend/src/routes/auth.js with /register, /login, /me endpoints. Updated app.js to mount router and added 404/error handlers.
- **Files modified:** backend/src/routes/auth.js (new), backend/src/app.js
- **Verification:** Files exist, auth middleware and controller already present from prior partial execution
- **Committed in:** db0c906 (pre-task fix)

---

**Total deviations:** 1 auto-fixed (Rule 3 - blocking)
**Impact on plan:** Required fix — frontend would have been non-functional without backend routes mounted. No scope creep.

## Issues Encountered

None beyond the auto-fixed blocking issue above.

## User Setup Required

None - no external service configuration required. Run `docker compose up --build` to start all services.

## Next Phase Readiness

- Auth foundation is complete end-to-end: Docker Compose, PostgreSQL, backend API, React UI
- useAuth() hook and ProtectedRoute available for all Phase 2+ protected pages
- verifyToken middleware in backend/src/middleware/auth.js ready for all Phase 2 API routes
- Phase 2 (Activity Tracking) can start immediately

---
*Phase: 01-foundation*
*Completed: 2026-03-27*
