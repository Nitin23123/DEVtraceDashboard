# DevTrackr

A full-stack developer productivity app — track tasks, notes, goals, and API requests while showing off your GitHub activity.

---

## Features

- Task management with status (todo / in_progress / done), priority, and due dates
- Task pinning — pin important tasks to the top of your list
- Notes with create, edit, and delete
- Goals with completion tracking
- Built-in API Tester — send HTTP requests, view the response, and browse request history
- Dashboard with task stats, streak counter, and GitHub contribution heatmap
- GitHub OAuth integration — connect your account to show profile stats and open PR queue
- Pomodoro timer with work / break modes
- Dark mode — CSS variable-based theming, persisted in localStorage
- Code snippets manager
- DSA problem sheet tracker (79 curated problems)
- Smooth Framer Motion page transitions and modal animations

---

## Tech Stack

| Layer    | Technology           | Notes                                              |
|----------|----------------------|----------------------------------------------------|
| Frontend | React 18 (CRA)       | Tailwind v3, Framer Motion, Lenis smooth scroll    |
| Backend  | Node.js / Express    | JWT auth, node-fetch@2 for proxy                   |
| Database | PostgreSQL 15        | pg library, raw SQL migrations                     |
| Auth     | JWT (httpOnly-style) | Tokens in localStorage, bcrypt salt=12             |
| GitHub   | OAuth 2.0            | State param carries JWT as base64                  |
| DevOps   | Docker Compose       | 3 containers: frontend, backend, postgres          |
| CI       | GitHub Actions       | Build check on push to main                        |

---

## Prerequisites

1. [Docker Desktop](https://docs.docker.com/get-docker/) installed and running
2. Git

**Optional — only needed for the GitHub OAuth feature:**

- A GitHub OAuth App (create at https://github.com/settings/developers → OAuth Apps)
  - Homepage URL: `http://localhost:3000`
  - Callback URL: `http://localhost:5000/api/profile/github/callback`

---

## Quickstart

```bash
# 1. Clone the repo
git clone https://github.com/your-username/devtrace.git
cd devtrace

# 2. Copy environment variables
cp .env.example .env
# Edit .env if you want GitHub OAuth — otherwise leave as-is

# 3. Start all services
docker compose up
```

Open **http://localhost:3000** in your browser.

> The first run downloads base images and installs dependencies — allow 2–3 minutes. Subsequent starts are fast.

---

## Environment Variables

All configuration lives in `.env` (gitignored). Copy `.env.example` to get started — it contains safe placeholder values for local development.

| Variable               | Required | Description                                                        |
|------------------------|----------|--------------------------------------------------------------------|
| POSTGRES_DB            | Yes      | Database name                                                      |
| POSTGRES_USER          | Yes      | Database user                                                      |
| POSTGRES_PASSWORD      | Yes      | Database password                                                  |
| JWT_SECRET             | Yes      | Secret for signing JWT tokens — use a long random string in production |
| JWT_EXPIRES_IN         | Yes      | Token lifetime (e.g. `24h`)                                        |
| DATABASE_URL           | Yes      | Full PostgreSQL connection string                                  |
| GITHUB_CLIENT_ID       | Optional | GitHub OAuth App client ID                                         |
| GITHUB_CLIENT_SECRET   | Optional | GitHub OAuth App client secret                                     |
| REACT_APP_API_URL      | Yes      | Backend URL visible from the browser                               |

Never commit `.env` — it is gitignored. `.env.example` contains safe placeholder values.

---

## Architecture

```
Browser
   |
   v
frontend (React, :3000)
   |
   v  (HTTP API calls)
backend (Express, :5000)
   |
   v
postgres (PostgreSQL, :5432)
```

The frontend is a React CRA app served by react-scripts. The backend is an Express API that handles all business logic, authentication, and database access. PostgreSQL stores all user data. All three run as Docker containers orchestrated by Docker Compose.

---

## CI

A GitHub Actions workflow runs on every push to `main`. It builds both Docker images to verify the project compiles without errors. See `.github/workflows/ci.yml`.

---

## License

MIT
