---
plan: 02-07
phase: 02-core-crud
status: complete
completed_at: "2026-03-27"
duration_min: 8
files_changed: 8
---

# 02-07 Summary: App Wiring — Layout + Routes

## What was built

- `frontend/src/components/Layout.js`: Top nav bar with NavLink active highlighting, user email display, logout button, and `<Outlet />` for child page rendering
- `frontend/src/App.js`: Updated route structure using nested routing — single `ProtectedRoute > Layout` wrapper covering `/dashboard`, `/tasks`, `/notes`, `/goals`

## Key decisions

- Nested route pattern (`<Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>`) used instead of per-route wrapping — single auth check, DRY
- NavLink `style` prop (function form) used for active styling — no CSS classes needed, works with inline styles
- DashboardPlaceholder kept inline in App.js — will be replaced in Phase 3 with real Dashboard component

## Artifacts

| File | Role |
|------|------|
| frontend/src/components/Layout.js | Nav bar + Outlet wrapper for all authenticated pages |
| frontend/src/App.js | Route config: /tasks, /notes, /goals all behind ProtectedRoute+Layout |

## Phase 2 completion

All 7 plans complete. Phase 2 delivers full CRUD for Tasks, Notes, Goals — backend APIs + frontend pages + app wiring.
