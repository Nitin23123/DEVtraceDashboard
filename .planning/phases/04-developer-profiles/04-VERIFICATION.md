---
phase: 04-developer-profiles
verified: 2026-03-27T22:55:00Z
status: gaps_found
score: 9/10 must-haves verified
re_verification: false
gaps:
  - truth: "PROF-01 through PROF-04 requirement IDs are defined and traceable"
    status: failed
    reason: "REQUIREMENTS.md does not contain PROF-01, PROF-02, PROF-03, or PROF-04. The traceability table ends at Phase 3 and notes that Phase 4 (labeled 'UI Polish' in REQUIREMENTS.md) carries no new requirements. ROADMAP.md declares PROF-01 to PROF-04 as Phase 4 requirements but these IDs were never added to REQUIREMENTS.md."
    artifacts:
      - path: ".planning/REQUIREMENTS.md"
        issue: "PROF-01, PROF-02, PROF-03, PROF-04 not present — IDs are orphaned in ROADMAP.md only"
    missing:
      - "Add PROF-01 through PROF-04 to REQUIREMENTS.md under a new 'Developer Profiles' section"
      - "Add PROF-01 through PROF-04 to the traceability table mapping them to Phase 4"
  - truth: "GitHub OAuth credentials are documented for new contributors"
    status: partial
    reason: ".env.example does not include GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET. The actual .env has them set, but anyone cloning the repo has no indication these vars are required for the OAuth flow to work."
    artifacts:
      - path: ".env.example"
        issue: "GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET are absent — only DATABASE_URL, JWT_SECRET, and REACT_APP_API_URL are documented"
    missing:
      - "Add GITHUB_CLIENT_ID=your-github-client-id and GITHUB_CLIENT_SECRET=your-github-client-secret to .env.example"
human_verification:
  - test: "Complete GitHub OAuth flow end-to-end"
    expected: "User clicks 'Connect GitHub', is redirected to GitHub authorization page, approves, lands at /profile?github=connected, and sees live avatar, name, bio, stats, and recent activity"
    why_human: "Requires a live GitHub OAuth app registration and real GitHub account — cannot verify redirect chain or token exchange programmatically"
  - test: "Profile page nav link and route protection"
    expected: "Logged-in user sees 'Profile' in nav bar; clicking navigates to /profile. Logged-out user visiting /profile is redirected to /login"
    why_human: "Requires browser rendering with React Router context"
  - test: "Reconnect GitHub button reinitiates OAuth"
    expected: "After connecting, 'Reconnect GitHub' link is visible and navigates to the OAuth initiation URL"
    why_human: "Requires a connected GitHub state in the running app"
---

# Phase 4: Developer Profiles Verification Report

**Phase Goal:** Users can connect their GitHub account via OAuth and view their GitHub profile stats on a dedicated Profile page
**Verified:** 2026-03-27T22:55:00Z
**Status:** gaps_found (documentation gaps only — all code is substantive and wired)
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| #  | Truth                                                                                               | Status      | Evidence                                                                                   |
|----|-----------------------------------------------------------------------------------------------------|-------------|--------------------------------------------------------------------------------------------|
| 1  | GET /api/auth/github redirects to GitHub OAuth authorization URL with client_id, scope, state       | VERIFIED    | github.js line 26: `res.redirect('https://github.com/login/oauth/authorize?...')`         |
| 2  | GET /api/auth/github/callback exchanges code, stores github_access_token + github_username, redirects | VERIFIED  | github.js lines 51-105: full token exchange, DB UPDATE, redirect to /profile?github=connected |
| 3  | GET /api/profile/github returns full GitHub profile JSON using stored access token                   | VERIFIED    | github.js lines 116-179: parallel fetch of profile/repos/events, structured response      |
| 4  | users table has github_access_token (TEXT) and github_username (VARCHAR(255)) columns               | VERIFIED    | 002_add_github_oauth.sql: `ALTER TABLE users ADD COLUMN IF NOT EXISTS github_access_token TEXT, github_username VARCHAR(255)` |
| 5  | JWT carried through OAuth flow as base64-encoded state param — no cookies                           | VERIFIED    | github.js line 20: `Buffer.from(token).toString('base64')` / line 41: decode on callback  |
| 6  | Profile page reachable at /profile and appears as 'Profile' in the nav bar                         | VERIFIED    | App.js line 31: `<Route path="/profile" element={<ProfilePage />} />` / Layout.js line 41: `<NavLink to="/profile" style={linkStyle}>Profile</NavLink>` |
| 7  | Not-connected state shows centered 'Connect GitHub' button linking to OAuth initiation URL          | VERIFIED    | ProfilePage.js lines 63-76: anchor href=`http://localhost:5000/api/auth/github?token=${token}` |
| 8  | Connected state shows avatar, name, bio, repos, stars, followers, following, link, reconnect button | VERIFIED    | ProfilePage.js lines 87-131: all seven data fields + View on GitHub + Reconnect GitHub    |
| 9  | Recent activity list renders type + repo + date for up to 5 events                                  | VERIFIED    | ProfilePage.js lines 134-153: `githubData.recent_activity.map(...)` renders type, repo, date |
| 10 | PROF-01 through PROF-04 are traceable in REQUIREMENTS.md                                            | FAILED      | REQUIREMENTS.md has no PROF-* IDs; traceability table ends at DASH-04 mapping to Phase 3  |

**Score:** 9/10 truths verified (1 documentation gap; all code truths pass)

---

## Required Artifacts

### Plan 04-01 Artifacts

| Artifact                                              | Expected                                               | Status     | Details                                                     |
|-------------------------------------------------------|--------------------------------------------------------|------------|-------------------------------------------------------------|
| `backend/src/db/migrations/002_add_github_oauth.sql`  | ALTER TABLE adding github_access_token + github_username | VERIFIED  | 7 lines, contains both ADD COLUMN IF NOT EXISTS statements  |
| `backend/src/routes/github.js`                        | Exports authRouter and profileRouter as Express routers  | VERIFIED  | 181 lines, `module.exports = { authRouter, profileRouter }` |
| `backend/src/app.js`                                  | Mounts authRouter at /api/auth, profileRouter at /api/profile | VERIFIED | Lines 37-39: destructure + two app.use() mounts before 404 handler |

### Plan 04-02 Artifacts

| Artifact                                    | Expected                                           | Status     | Details                                                              |
|---------------------------------------------|----------------------------------------------------|------------|----------------------------------------------------------------------|
| `frontend/src/pages/ProfilePage.js`         | ProfilePage with connected/disconnected states (min 80 lines) | VERIFIED | 159 lines, all three render states (loading, not-connected, connected) |
| `frontend/src/components/Layout.js`         | Nav bar with Profile NavLink                       | VERIFIED   | Line 41: `<NavLink to="/profile" style={linkStyle}>Profile</NavLink>` |
| `frontend/src/App.js`                       | Route /profile pointing to ProfilePage             | VERIFIED   | Line 13: `import ProfilePage` / Line 31: `<Route path="/profile" element={<ProfilePage />} />` |

---

## Key Link Verification

### Plan 04-01 Key Links

| From                                      | To                                            | Via                                       | Status      | Details                                                               |
|-------------------------------------------|-----------------------------------------------|-------------------------------------------|-------------|-----------------------------------------------------------------------|
| github.js authRouter GET /github          | https://github.com/login/oauth/authorize      | res.redirect with client_id, scope, state | VERIFIED    | Line 26: redirect URL with URLSearchParams                            |
| github.js authRouter GET /github/callback | https://github.com/login/oauth/access_token   | node-fetch POST with URLSearchParams body  | VERIFIED    | Lines 51-63: POST to access_token URL with Accept: application/json   |
| github.js authRouter GET /github/callback | users table                                   | pool.query UPDATE users SET github_access_token | VERIFIED | Lines 96-99: `UPDATE users SET github_access_token = $1, github_username = $2` |
| github.js profileRouter GET /github       | https://api.github.com/user                   | fetch with Authorization: token header     | VERIFIED    | Line 138: fetch api.github.com/user + lines 139-140 repos/events      |

### Plan 04-02 Key Links

| From                                         | To                               | Via                                                | Status   | Details                                                              |
|----------------------------------------------|----------------------------------|----------------------------------------------------|----------|----------------------------------------------------------------------|
| ProfilePage.js                               | GET /api/profile/github          | fetch with Authorization Bearer token on mount     | VERIFIED | Lines 16-17: `fetch(\`${API_URL}/api/profile/github\`, { headers: { 'Authorization': \`Bearer ${token}\` } })` |
| ProfilePage.js Connect GitHub button         | http://localhost:5000/api/auth/github?token={jwt} | anchor href with token from useAuth()  | VERIFIED | Line 64: `href={\`http://localhost:5000/api/auth/github?token=${token}\`}` |
| App.js                                       | frontend/src/pages/ProfilePage.js | Route path=/profile element=ProfilePage           | VERIFIED | Line 31: `<Route path="/profile" element={<ProfilePage />} />`       |
| Layout.js                                    | /profile route                   | NavLink to=/profile                                | VERIFIED | Line 41: `<NavLink to="/profile" style={linkStyle}>Profile</NavLink>` |

---

## Requirements Coverage

| Requirement | Source Plan | Description                                                   | Status         | Evidence / Notes                                                                                       |
|-------------|-------------|---------------------------------------------------------------|----------------|--------------------------------------------------------------------------------------------------------|
| PROF-01     | 04-01, 04-02 | (not defined in REQUIREMENTS.md)                             | ORPHANED       | ID declared in ROADMAP.md and both PLANs but absent from REQUIREMENTS.md                               |
| PROF-02     | 04-01        | (not defined in REQUIREMENTS.md)                             | ORPHANED       | Same — ROADMAP.md only                                                                                  |
| PROF-03     | 04-01        | (not defined in REQUIREMENTS.md)                             | ORPHANED       | Same — ROADMAP.md only                                                                                  |
| PROF-04     | 04-01, 04-02 | (not defined in REQUIREMENTS.md)                             | ORPHANED       | Same — ROADMAP.md only                                                                                  |

**Root cause:** REQUIREMENTS.md was last updated before the ROADMAP was revised to make Phase 4 a "Developer Profiles" phase. The traceability note at the bottom of REQUIREMENTS.md still describes Phase 4 as "UI Polish (carries no new requirements)." The ROADMAP was subsequently revised to insert a genuine Developer Profiles phase, but REQUIREMENTS.md was not updated to match.

**Functional impact:** None — the code fully implements what ROADMAP.md describes as PROF-01 through PROF-04. This is a documentation-only gap.

---

## Anti-Patterns Found

| File                                          | Pattern                    | Severity | Impact                                    |
|-----------------------------------------------|----------------------------|----------|-------------------------------------------|
| `frontend/src/pages/ProfilePage.js` line 64   | Hardcoded `localhost:5000`  | Warning  | Connect GitHub URL ignores `REACT_APP_API_URL` env var; `API_URL` constant is defined at module level but the OAuth href uses a hardcoded literal instead. This will break in any non-localhost deployment. |
| `frontend/src/pages/ProfilePage.js` line 127  | Same hardcoded `localhost:5000` | Warning | Reconnect GitHub link has the same issue  |
| `.env.example`                                | Missing GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET | Warning | New developers cloning the repo will not know these env vars are required for OAuth |

No blocker anti-patterns found (no empty returns, no TODO-only stubs, no static mock data returned instead of real data).

---

## Human Verification Required

### 1. GitHub OAuth Redirect

**Test:** Log in to the app, navigate to /profile, click "Connect GitHub"
**Expected:** Browser redirects to `https://github.com/login/oauth/authorize` with the app's client_id and a base64-encoded state parameter
**Why human:** Requires a registered GitHub OAuth app and live redirect chain — not testable via static analysis

### 2. OAuth Callback and Profile Display

**Test:** Complete the GitHub OAuth authorization; observe the page after redirect
**Expected:** Page lands at `/profile` (query param stripped), shows GitHub avatar, name, bio, public repos, total stars, followers, following, View on GitHub link, and last 5 recent activity events
**Why human:** Requires live GitHub API responses with a real access token

### 3. Protected Route Behavior

**Test:** Visit `http://localhost:3000/profile` while logged out
**Expected:** Redirected to `/login`
**Why human:** Requires React Router + ProtectedRoute rendering in browser context

### 4. Reconnect GitHub Link (Connected State)

**Test:** After connecting GitHub, verify the "Reconnect GitHub" link is visible and navigates to the OAuth initiation URL
**Expected:** Link is visible alongside "View on GitHub"; clicking initiates the OAuth flow again
**Why human:** Requires a connected GitHub state in running app

---

## Gaps Summary

Two gaps found, both documentation-only — all implementation code is substantive and correctly wired:

1. **Orphaned requirement IDs (PROF-01 through PROF-04):** These IDs appear in ROADMAP.md and both PLAN frontmatters but are completely absent from REQUIREMENTS.md. The requirements document still describes Phase 4 as "UI Polish (no new requirements)" — a stale description from before the phase was redesigned. The fix is additive: define the four PROF-* requirements in REQUIREMENTS.md and add them to the traceability table.

2. **Missing env var documentation:** `.env.example` does not list `GITHUB_CLIENT_ID` or `GITHUB_CLIENT_SECRET`. A developer cloning the repo would set up the backend, find OAuth returning 500/redirect errors, and have no documented indication that GitHub OAuth app credentials must be configured. Two lines in `.env.example` fix this.

**Code quality note (warning-level only):** The "Connect GitHub" and "Reconnect GitHub" hrefs in ProfilePage.js hardcode `http://localhost:5000` instead of using the `API_URL` module constant. This is a latent deployment bug — the module-level `API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000'` is correctly used for the profile data fetch but not for the OAuth initiation anchor href.

---

_Verified: 2026-03-27T22:55:00Z_
_Verifier: Claude (gsd-verifier)_
