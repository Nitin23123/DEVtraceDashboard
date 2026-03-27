# Roadmap: DevTrackr

## Overview

DevTrackr is built in 5 phases that go from zero to a deployable, interview-ready full-stack app. The sequence is: foundation first (Docker + database + auth), then core CRUD features, then advanced features (API Tester + Dashboard), then UI polish, then DevOps hardening. Each phase leaves the app in a runnable, demonstrable state.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation** - Docker environment, database schema, and JWT authentication (backend + frontend)
- [ ] **Phase 2: Core CRUD** - Tasks, Notes, and Goals — backend APIs and connected frontend pages
- [ ] **Phase 3: Advanced Features** - API Tester tool and Dashboard with streak counter
- [ ] **Phase 4: UI Polish** - Tailwind styling refinement and Framer Motion animations
- [ ] **Phase 5: DevOps** - GitHub Actions CI pipeline and production Docker configuration

## Phase Details

### Phase 1: Foundation
**Goal**: The app runs locally with Docker, the database is initialized, and users can register, log in, and access protected routes
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, DEVOPS-01, DEVOPS-03
**Success Criteria** (what must be TRUE):
  1. `docker compose up` starts frontend, backend, and PostgreSQL containers with no manual steps
  2. User can register a new account with email and password
  3. User can log in and the JWT token persists across browser refresh
  4. User can log out and is redirected to the login page
  5. Visiting a protected route while logged out redirects to login
**Plans**: TBD

Plans:
- [ ] 01-01: Docker Compose setup (3 containers, .env wiring, health checks)
- [ ] 01-02: Database schema and migrations (users, tasks, notes, goals, api_logs tables)
- [ ] 01-03: Auth backend (register/login endpoints, JWT issuance, protected middleware)
- [ ] 01-04: Auth frontend (register/login pages, token storage, protected route guard)

### Phase 2: Core CRUD
**Goal**: Users can create, view, update, and delete their tasks, notes, and goals through a working UI
**Depends on**: Phase 1
**Requirements**: TASK-01, TASK-02, TASK-03, TASK-04, TASK-05, NOTE-01, NOTE-02, NOTE-03, NOTE-04, GOAL-01, GOAL-02, GOAL-03, GOAL-04
**Success Criteria** (what must be TRUE):
  1. User can create a task with title, description, priority, and due date — it appears in their task list
  2. User can toggle a task status between todo, in_progress, and done
  3. User can create, edit, and delete a note
  4. User can create a goal, mark it complete, and delete it
  5. All data is user-scoped — one user cannot see another user's records
**Plans**: TBD

Plans:
- [ ] 02-01: Tasks backend (CRUD endpoints, user scoping, status enum)
- [ ] 02-02: Tasks frontend (task list page, create/edit/delete UI, status toggle)
- [ ] 02-03: Notes backend (CRUD endpoints)
- [ ] 02-04: Notes frontend (notes list page, create/edit/delete UI)
- [ ] 02-05: Goals backend (CRUD endpoints, complete flag)
- [ ] 02-06: Goals frontend (goals list page, create/complete/delete UI)

### Phase 3: Advanced Features
**Goal**: Users can send HTTP requests through the built-in API Tester and see their productivity summary on a Dashboard
**Depends on**: Phase 2
**Requirements**: APIT-01, APIT-02, APIT-03, APIT-04, DASH-01, DASH-02, DASH-03, DASH-04
**Success Criteria** (what must be TRUE):
  1. User can send an HTTP request (any method, custom headers, body) and see the response status and body
  2. Each request is saved to the database and appears in request history
  3. Dashboard shows task counts broken down by status (todo / in_progress / done)
  4. Dashboard shows total notes count and total goals count
  5. Daily streak counter increments and is visible on the dashboard
**Plans**: TBD

Plans:
- [ ] 03-01: API Tester backend (proxy endpoint, request logging to DB)
- [ ] 03-02: API Tester frontend (request builder UI, response viewer, history list)
- [ ] 03-03: Dashboard backend (aggregate stats endpoint, streak logic)
- [ ] 03-04: Dashboard frontend (stats cards, streak display, Framer Motion modal animations)

### Phase 4: UI Polish
**Goal**: The app looks polished enough to screen-share in an interview — consistent Tailwind styling and smooth animations throughout
**Depends on**: Phase 3
**Requirements**: (No new requirements — this phase refines DASH-04 delivery and overall UX coherence)
**Success Criteria** (what must be TRUE):
  1. All pages use a consistent color scheme, spacing, and typography via Tailwind
  2. Modals and key UI transitions animate smoothly with Framer Motion
  3. The layout is usable on both desktop and tablet viewports
  4. Loading and empty states are handled gracefully (no blank pages or raw JSON errors)
**Plans**: TBD

Plans:
- [ ] 04-01: Global layout, navigation, and Tailwind design system
- [ ] 04-02: Framer Motion animations (modals, page transitions, card entrances)
- [ ] 04-03: Responsive layout pass and empty/loading state handling

### Phase 5: DevOps
**Goal**: The repo has a passing CI pipeline on GitHub and a README that lets anyone clone and run the project in one command
**Depends on**: Phase 4
**Requirements**: DEVOPS-02
**Success Criteria** (what must be TRUE):
  1. Pushing to the main branch triggers a GitHub Actions workflow that builds and checks the project
  2. The README has a one-command quickstart (`docker compose up`) with prerequisites listed
  3. No secrets or credentials are hardcoded — all config comes from .env files
**Plans**: TBD

Plans:
- [ ] 05-01: GitHub Actions CI workflow (build check on push)
- [ ] 05-02: README with quickstart, architecture diagram, and feature list

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 0/4 | Not started | - |
| 2. Core CRUD | 0/6 | Not started | - |
| 3. Advanced Features | 0/4 | Not started | - |
| 4. UI Polish | 0/3 | Not started | - |
| 5. DevOps | 0/2 | Not started | - |
