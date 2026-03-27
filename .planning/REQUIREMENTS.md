# Requirements: DevTrackr

**Defined:** 2026-03-27
**Core Value:** A polished, working full-stack app that demonstrates end-to-end engineering capability explainable in any interview.

## v1 Requirements

### Authentication

- [x] **AUTH-01**: User can register with email and password
- [x] **AUTH-02**: User can log in with email and password and receive a JWT token
- [x] **AUTH-03**: User session persists across browser refresh (token stored in localStorage)
- [x] **AUTH-04**: User can log out and token is cleared
- [x] **AUTH-05**: Protected routes redirect unauthenticated users to login

### Tasks

- [x] **TASK-01**: User can create a task with title, description, priority, and due date
- [x] **TASK-02**: User can view all their tasks
- [x] **TASK-03**: User can update a task (title, description, status, priority, due date)
- [x] **TASK-04**: User can delete a task
- [x] **TASK-05**: Task status can be toggled between todo / in_progress / done

### Notes

- [x] **NOTE-01**: User can create a note with title and content
- [x] **NOTE-02**: User can view all their notes
- [x] **NOTE-03**: User can edit a note
- [x] **NOTE-04**: User can delete a note

### Goals

- [x] **GOAL-01**: User can create a goal with title, description, and target date
- [x] **GOAL-02**: User can view all their goals
- [x] **GOAL-03**: User can mark a goal as complete
- [x] **GOAL-04**: User can delete a goal

### API Tester

- [ ] **APIT-01**: User can send an HTTP request (method, URL, headers, body)
- [ ] **APIT-02**: Response is displayed (status code, body)
- [ ] **APIT-03**: Each request is logged to the database
- [ ] **APIT-04**: User can view history of past API requests

### Dashboard

- [ ] **DASH-01**: Dashboard shows task count by status
- [ ] **DASH-02**: Dashboard shows total notes and goals count
- [ ] **DASH-03**: Daily streak counter increments on login/activity
- [ ] **DASH-04**: Framer Motion animations on modal open/close

### DevOps

- [ ] **DEVOPS-01**: Docker Compose runs frontend, backend, and PostgreSQL as 3 containers
- [ ] **DEVOPS-02**: GitHub Actions CI pipeline runs on push (builds and checks)
- [ ] **DEVOPS-03**: Environment variables managed via .env files (not hardcoded)

## v2 Requirements

### Enhanced Features

- **V2-01**: GitHub activity widget (public events from GitHub API)
- **V2-02**: OAuth login (Google/GitHub)
- **V2-03**: Email verification on signup
- **V2-04**: Real-time updates with WebSockets
- **V2-05**: Export tasks/notes as CSV
- **V2-06**: Tags/labels on tasks
- **V2-07**: Search across tasks, notes, goals

## Out of Scope

| Feature | Reason |
|---------|--------|
| Mobile app | Web-first; mobile adds significant complexity |
| Redis caching | Overkill for this scale |
| Full test suite | Time-constrained; basic structure only |
| Real-time collaboration | Not a collaborative tool |
| Payment/subscription | Free personal tool |
| Admin panel | Single-user app |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Complete |
| AUTH-02 | Phase 1 | Complete |
| AUTH-03 | Phase 1 | Complete |
| AUTH-04 | Phase 1 | Complete |
| AUTH-05 | Phase 1 | Complete |
| DEVOPS-01 | Phase 1 | Pending |
| DEVOPS-03 | Phase 1 | Pending |
| TASK-01 | Phase 2 | Complete |
| TASK-02 | Phase 2 | Complete |
| TASK-03 | Phase 2 | Complete |
| TASK-04 | Phase 2 | Complete |
| TASK-05 | Phase 2 | Complete |
| NOTE-01 | Phase 2 | Complete |
| NOTE-02 | Phase 2 | Complete |
| NOTE-03 | Phase 2 | Complete |
| NOTE-04 | Phase 2 | Complete |
| GOAL-01 | Phase 2 | Complete |
| GOAL-02 | Phase 2 | Complete |
| GOAL-03 | Phase 2 | Complete |
| GOAL-04 | Phase 2 | Complete |
| APIT-01 | Phase 3 | Pending |
| APIT-02 | Phase 3 | Pending |
| APIT-03 | Phase 3 | Pending |
| APIT-04 | Phase 3 | Pending |
| DASH-01 | Phase 3 | Pending |
| DASH-02 | Phase 3 | Pending |
| DASH-03 | Phase 3 | Pending |
| DASH-04 | Phase 3 | Pending |
| DEVOPS-02 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 27 total
- Mapped to phases: 27
- Unmapped: 0 ✓

**Phase 4 note:** Phase 4 (UI Polish) refines the visual delivery of DASH-04 and overall UX coherence across all prior phases. It carries no new requirements but is essential for the resume-quality goal.

---
*Requirements defined: 2026-03-27*
*Last updated: 2026-03-27 after roadmap creation (5-phase traceability)*
