# DevTrackr

## What This Is

DevTrackr is a full-stack Developer Productivity Dashboard built as a resume project. It gives developers a single place to manage tasks, notes, goals, and test APIs — all behind JWT authentication. Built with React, Node.js/Express, PostgreSQL, Docker, and GitHub Actions CI/CD to demonstrate production-level full-stack skills.

## Core Value

A polished, working full-stack app that demonstrates end-to-end engineering capability — from auth to database to DevOps — that a developer can confidently explain in any interview.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] JWT Authentication (register + login)
- [ ] Task management (create, read, update, delete)
- [ ] Notes (create, read, update, delete)
- [ ] Goals tracking (create, read, update, delete, mark complete)
- [ ] API Tester — send HTTP requests and log them to DB
- [ ] Dashboard overview (stats, streak counter)
- [ ] Docker Compose (frontend + backend + postgres containers)
- [ ] GitHub Actions CI/CD (build check on push)
- [ ] Polished UI with Tailwind CSS + basic Framer Motion animations

### Out of Scope

- GitHub OAuth integration — complexity not justified for 24hr timeline
- Real-time features (WebSockets) — deferred to v2
- Email verification — JWT auth sufficient for v1
- Mobile app — web-first
- Redis caching — overkill for this scale
- Full test suite — basic structure only, time constrained

## Context

- **Timeline**: 24 hours to complete
- **Purpose**: Resume project — must be explainable in technical interviews
- **Audience**: Hiring managers and technical interviewers
- **Build order**: Backend first → Frontend second → Connect last
- **Key insight**: A polished smaller app beats a buggy full-featured one

## Constraints

- **Tech Stack**: React.js, Tailwind CSS, Framer Motion (frontend) — Node.js, Express.js, PostgreSQL (backend) — Docker, GitHub Actions (DevOps)
- **Timeline**: 24 hours — ruthless prioritization required
- **Auth**: JWT only — no OAuth, no sessions
- **Database**: PostgreSQL only — no MongoDB, no Redis

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| PostgreSQL over MongoDB | Relational data (user owns tasks/notes/goals) — good interview answer | — Pending |
| JWT over sessions | Stateless, scalable, standard for REST APIs | — Pending |
| Docker Compose | Single command to run full stack — shows DevOps awareness | — Pending |
| Cut API Tester logs if time runs short | Core CRUD is more important than bonus features | — Pending |
| Tailwind over custom CSS | Faster development, consistent design system | — Pending |

---
*Last updated: 2026-03-27 after initialization*
