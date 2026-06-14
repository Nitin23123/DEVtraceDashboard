# DevTrace Dashboard

A full-stack developer productivity dashboard built with React, Node.js, and PostgreSQL. Track tasks, notes, goals, code snippets, DSA progress, run a Pomodoro timer, test APIs, connect your GitHub profile, and browse real GGSIPU placement interview experiences — all in one place.

The UI is a dark "Neon Grid" theme (cyan/violet, glassy panels) with a collapsible icon sidebar, split-pane browsing, and a fully mobile-responsive layout.

**Live Demo → [devtracedash.netlify.app](https://devtracedash.netlify.app)**

---

## Features

| Feature | Description |
|---|---|
| **Authentication** | JWT-based register/login with bcrypt password hashing |
| **Dashboard** | Stats overview — tasks, notes, goals, daily streak counter |
| **Workspace** | Unified Tasks, Notes & Goals — status cycling, priorities, due dates, pinning, completion |
| **Pomodoro Timer** | 25/5 min work-break cycles with browser notifications |
| **Code Snippets** | Save and organize code snippets by language with copy to clipboard |
| **API Tester** | HTTP client — send GET/POST/PUT/PATCH/DELETE requests, view responses, request history |
| **DSA Tracker** | 79-problem DSA curriculum across 23 days with per-user progress tracking |
| **GitHub Profile** | OAuth integration — contribution heatmap, streak, repos, languages, open PRs |
| **Placements** | GGSIPU interview-prep hub — company directory (split-pane browse), interview experiences, question bank, company-wise topics, prep roadmaps, HR prep, placement calendar & insights |

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 18.2 | UI framework |
| React Router | v6 | Client-side routing |
| Tailwind CSS | 3.4 | Utility-first styling |
| Framer Motion | 12 | Page transitions & animations |
| Lenis | 1.3 | Smooth scrolling |
| Sora + JetBrains Mono | — | Typefaces (via Google Fonts) |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | 20 | Runtime |
| Express | 4.18 | HTTP framework |
| PostgreSQL | 15 | Database |
| node-postgres (pg) | 8.11 | PostgreSQL client |
| bcryptjs | 2.4 | Password hashing |
| jsonwebtoken | 9.0 | JWT auth |
| node-fetch | 2.7 | HTTP requests (GitHub API) |
| dotenv | 16 | Environment variable management |
| nodemon | 3.0 | Dev auto-restart |

### Infrastructure
| Service | Purpose |
|---|---|
| Neon | Serverless PostgreSQL (free tier) |
| Render | Backend hosting (free tier) |
| Netlify | Frontend hosting (free tier) |
| GitHub OAuth | Third-party authentication |

---

## Project Structure

```
devtrace/
├── frontend/                    # React app
│   ├── public/
│   │   └── _redirects           # Netlify SPA routing
│   └── src/
│       ├── api/                 # API call modules
│       │   ├── auth.jsx
│       │   ├── dashboard.jsx
│       │   ├── tasks.jsx
│       │   ├── notes.jsx
│       │   ├── goals.jsx
│       │   ├── apiTester.jsx
│       │   └── placements.jsx
│       ├── components/
│       │   ├── Layout.jsx       # Collapsible sidebar shell (responsive: drawer on mobile)
│       │   ├── Logo.jsx         # Neon "signal-trace" logo mark
│       │   ├── Card.jsx         # Reusable card primitive
│       │   ├── Spinner.jsx      # Loading spinner
│       │   ├── ProtectedRoute.jsx
│       │   └── placements/      # Placements feature components
│       │       ├── CompaniesSplit.jsx   # Split-pane company browser
│       │       ├── ExperiencesTab.jsx
│       │       ├── QuestionsTab.jsx
│       │       ├── PrepTab.jsx
│       │       ├── CalendarTab.jsx
│       │       ├── InsightsTab.jsx
│       │       └── shared.jsx
│       ├── context/
│       │   ├── AuthContext.jsx  # Auth state (+ dev-only bypass, env-gated)
│       │   └── ThemeContext.jsx # Dark/light theme with CSS variables
│       ├── hooks/
│       │   └── useAuth.jsx
│       └── pages/
│           ├── LoginPage.jsx
│           ├── RegisterPage.jsx
│           ├── DashboardPage.jsx
│           ├── WorkspacePage.jsx    # Unified tasks + notes + goals
│           ├── PomodoroPage.jsx
│           ├── SnippetsPage.jsx
│           ├── ApiTesterPage.jsx
│           ├── ProfilePage.jsx
│           ├── DsaPage.jsx
│           └── PlacementsPage.jsx   # GGSIPU interview-prep hub
│
├── backend/                     # Express API
│   └── src/
│       ├── server.js            # Entry point
│       ├── app.js               # Express app, CORS, middleware, routes
│       ├── data/
│       │   └── placements.js    # Static placement seed data (companies, experiences, questions)
│       ├── db/
│       │   ├── index.js         # pg Pool connection
│       │   └── migrations/
│       │       ├── 001_initial_schema.sql
│       │       ├── 002_add_github_oauth.sql
│       │       └── 003_developer_tools.sql
│       ├── middleware/
│       │   └── auth.js          # JWT verifyToken middleware (+ dev-only bypass, env-gated)
│       ├── routes/
│       │   ├── auth.js
│       │   ├── tasks.js
│       │   ├── notes.js
│       │   ├── goals.js
│       │   ├── dashboard.js
│       │   ├── snippets.js
│       │   ├── apiTester.js
│       │   ├── dsa.js
│       │   ├── github.js
│       │   └── placements.js
│       └── controllers/
│           ├── authController.js
│           ├── tasksController.js
│           ├── notesController.js
│           ├── goalsController.js
│           ├── dashboardController.js
│           └── apiTesterController.js
│
└── docker-compose.yml           # Local development (postgres + backend + frontend)
```

---

## Database Schema

### `users`
| Column | Type | Description |
|---|---|---|
| id | SERIAL PK | Auto-increment ID |
| email | VARCHAR(255) UNIQUE | User email |
| password_hash | VARCHAR(255) | bcrypt hashed password |
| github_access_token | TEXT | GitHub OAuth token |
| github_username | VARCHAR(255) | GitHub login handle |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

### `tasks`
| Column | Type | Description |
|---|---|---|
| id | SERIAL PK | |
| user_id | INTEGER FK | References users |
| title | VARCHAR(255) | Task title |
| description | TEXT | Optional description |
| status | VARCHAR(20) | `todo` / `in_progress` / `done` |
| priority | VARCHAR(10) | `low` / `medium` / `high` |
| due_date | DATE | Optional due date |
| pinned | BOOLEAN | Pinned to top |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### `notes`
| Column | Type | Description |
|---|---|---|
| id | SERIAL PK | |
| user_id | INTEGER FK | References users |
| title | VARCHAR(255) | Note title |
| content | TEXT | Note body |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### `goals`
| Column | Type | Description |
|---|---|---|
| id | SERIAL PK | |
| user_id | INTEGER FK | References users |
| title | VARCHAR(255) | Goal title |
| description | TEXT | Optional description |
| target_date | DATE | Optional target date |
| is_completed | BOOLEAN | Completion status |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### `api_logs`
| Column | Type | Description |
|---|---|---|
| id | SERIAL PK | |
| user_id | INTEGER FK | References users |
| method | VARCHAR(10) | HTTP method |
| url | TEXT | Request URL |
| request_body | JSONB | Request body |
| response_status | INTEGER | HTTP status code |
| response_body | JSONB | Response body |
| created_at | TIMESTAMPTZ | |

### `streaks`
| Column | Type | Description |
|---|---|---|
| id | SERIAL PK | |
| user_id | INTEGER UNIQUE FK | References users |
| current_streak | INTEGER | Current active streak (days) |
| longest_streak | INTEGER | All-time longest streak |
| last_active_date | DATE | Last visit date |
| updated_at | TIMESTAMPTZ | |

### `snippets`
| Column | Type | Description |
|---|---|---|
| id | SERIAL PK | |
| user_id | INTEGER FK | References users |
| title | VARCHAR(255) | Snippet title |
| language | VARCHAR(50) | Programming language |
| content | TEXT | Code content |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### `dsa_problems`
| Column | Type | Description |
|---|---|---|
| id | SERIAL PK | |
| day_number | INTEGER | Curriculum day (1–23) |
| topic | VARCHAR(100) | Topic name |
| title | VARCHAR(255) | Problem title |
| difficulty | VARCHAR(10) | `Easy` / `Medium` / `Hard` |

### `user_dsa_progress`
| Column | Type | Description |
|---|---|---|
| id | SERIAL PK | |
| user_id | INTEGER FK | References users |
| problem_id | INTEGER FK | References dsa_problems |
| completed | BOOLEAN | Completion status |
| completed_at | TIMESTAMPTZ | When completed |

> **Placements** currently runs on static seed data ([`backend/src/data/placements.js`](backend/src/data/placements.js)) and has no database table yet. Community-submitted experiences are held in memory and reset on server restart — persisting them is a planned migration.

---

## API Reference

All protected routes require:
```
Authorization: Bearer <jwt_token>
```

---

### Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login, returns JWT |
| GET | `/api/auth/me` | Yes | Get current user |
| GET | `/api/auth/github` | Yes (query param) | Initiate GitHub OAuth |
| GET | `/api/auth/github/callback` | No | GitHub OAuth callback |

**POST /api/auth/register**
```json
// Request
{ "email": "user@example.com", "password": "mypassword" }

// Response 201
{ "token": "eyJ...", "user": { "id": 1, "email": "user@example.com" } }
```

**POST /api/auth/login**
```json
// Request
{ "email": "user@example.com", "password": "mypassword" }

// Response 200
{ "token": "eyJ...", "user": { "id": 1, "email": "user@example.com" } }
```

---

### Tasks — `/api/tasks`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/tasks` | Get all tasks |
| POST | `/api/tasks` | Create task |
| GET | `/api/tasks/:id` | Get single task |
| PUT | `/api/tasks/:id` | Update task |
| PUT | `/api/tasks/:id/pin` | Toggle pin |
| DELETE | `/api/tasks/:id` | Delete task |

**POST /api/tasks**
```json
// Request
{
  "title": "Build login page",
  "description": "Optional",
  "priority": "high",
  "due_date": "2025-12-31"
}

// Response 201
{
  "id": 1, "title": "Build login page", "status": "todo",
  "priority": "high", "pinned": false, "due_date": "2025-12-31"
}
```

**PUT /api/tasks/:id**
```json
// Request — any subset of fields
{ "status": "in_progress", "priority": "low" }
```

---

### Notes — `/api/notes`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/notes` | Get all notes |
| POST | `/api/notes` | Create note |
| GET | `/api/notes/:id` | Get single note |
| PUT | `/api/notes/:id` | Update note |
| DELETE | `/api/notes/:id` | Delete note |

**POST /api/notes**
```json
// Request
{ "title": "Meeting notes", "content": "Discussed roadmap..." }

// Response 201
{ "id": 1, "title": "Meeting notes", "content": "...", "created_at": "..." }
```

---

### Goals — `/api/goals`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/goals` | Get all goals |
| POST | `/api/goals` | Create goal |
| PUT | `/api/goals/:id` | Update goal |
| PUT | `/api/goals/:id/complete` | Mark as complete |
| DELETE | `/api/goals/:id` | Delete goal |

**POST /api/goals**
```json
// Request
{ "title": "Learn Rust", "description": "Optional", "target_date": "2025-06-01" }
```

---

### Dashboard — `/api/dashboard`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard/stats` | Get task/note/goal counts + streak |

**Response**
```json
{
  "tasks": { "todo": 3, "in_progress": 1, "done": 5, "total": 9 },
  "notes": { "total": 12 },
  "goals": { "total": 4, "completed": 2 },
  "streak": { "current": 7, "longest": 14 }
}
```

---

### Code Snippets — `/api/snippets`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/snippets` | Get all snippets |
| POST | `/api/snippets` | Create snippet |
| PUT | `/api/snippets/:id` | Update snippet |
| DELETE | `/api/snippets/:id` | Delete snippet |

**POST /api/snippets**
```json
// Request
{ "title": "Debounce", "language": "JavaScript", "content": "function debounce(fn, ms) {...}" }

// Response 201
{ "id": 1, "title": "Debounce", "language": "JavaScript", "content": "..." }
```

---

### API Tester — `/api/tester`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/tester/proxy` | Proxy an HTTP request |
| GET | `/api/tester/history` | Get request history |

**POST /api/tester/proxy**
```json
// Request
{
  "method": "GET",
  "url": "https://api.github.com/users/octocat",
  "headers": { "Accept": "application/json" },
  "body": null
}

// Response
{ "status": 200, "body": { ... } }
```

---

### DSA Tracker — `/api/dsa`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dsa/problems` | Get all 79 problems grouped by day with user progress |
| POST | `/api/dsa/progress/:problem_id` | Toggle problem completion |

**GET /api/dsa/problems — Response**
```json
[
  {
    "day_number": 1,
    "topic": "Arrays",
    "problems": [
      { "id": 1, "title": "Two Sum", "difficulty": "Easy", "completed": false },
      { "id": 2, "title": "Best Time to Buy and Sell Stock", "difficulty": "Easy", "completed": true }
    ]
  }
]
```

---

### GitHub Profile — `/api/profile`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/profile/github` | Full GitHub profile + contributions + repos + activity |
| GET | `/api/profile/github/prs` | Open pull requests |

**GET /api/profile/github — Response (abbreviated)**
```json
{
  "login": "username",
  "name": "Full Name",
  "avatar_url": "https://...",
  "bio": "...",
  "public_repos": 42,
  "total_stars": 123,
  "followers": 50,
  "top_repos": [...],
  "languages": [{ "lang": "JavaScript", "count": 15 }],
  "recent_activity": [...],
  "contributions": {
    "total_this_year": 847,
    "total_commits": 612,
    "current_streak": 5,
    "longest_streak": 21,
    "this_week": 12,
    "calendar_weeks": [...]
  },
  "prs_merged": 34,
  "prs_open": 3
}
```

---

### Placements — `/api/placements`

GGSIPU interview-prep data. Served from static seed data (no DB table yet). All routes require auth. Community-submitted experiences are stored **in memory** and reset on server restart.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/placements/companies` | Company directory with aggregated stats (experience count, avg rounds, avg selection rate, top topics) |
| GET | `/api/placements/companies/:slug` | Full company profile + experiences + question bank + topic focus |
| GET | `/api/placements/experiences` | Experience feed. Filters: `?company=`, `?status=`, `?q=` |
| POST | `/api/placements/experiences` | Submit an experience (in-memory) |
| GET | `/api/placements/questions` | Question bank + facets. Filters: `?company=`, `?topic=`, `?round=`, `?difficulty=`, `?q=` |
| GET | `/api/placements/topics` | Company-wise topic frequency + global topic leaderboard |
| GET | `/api/placements/prep/:slug` | Auto-generated prep roadmap (round structure, weighted topic checklist, tips) |
| GET | `/api/placements/hr-questions` | Common HR / behavioral questions |
| GET | `/api/placements/calendar` | Companies grouped by the months they visit campus |
| GET | `/api/placements/insights` | Aggregate analytics (top topics, selection-rate leaderboard, bonds, type breakdown) |

**POST /api/placements/experiences**
```json
// Request
{
  "companySlug": "indus-valley-partners",
  "role": "Associate Software Engineer",
  "status": "selected",
  "eligibility": "6.5 CGPA, no backlogs",
  "bond": "None",
  "rounds": [
    { "title": "Round 1 — OA", "detail": "OOPs, SQL, C#, JS", "topics": ["OOPs", "DBMS/SQL"] }
  ],
  "tips": ["Practice SQL joins", "Know your project deeply"]
}

// Response 201
{ "id": 1000, "company": "Indus Valley Partners", "source": "community", ... }
```

---

## Environment Variables

### Backend (Render)
| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host/db?sslmode=require` |
| `NODE_ENV` | Environment | `production` |
| `JWT_SECRET` | Secret for signing JWTs | `any-long-random-string` |
| `JWT_EXPIRES_IN` | JWT expiry | `24h` |
| `GITHUB_TOKEN` | Personal access token for GitHub API | `ghp_...` |
| `GITHUB_CLIENT_ID` | GitHub OAuth app client ID | `Ov23li...` |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth app secret | `abc123...` |
| `FRONTEND_URL` | Deployed frontend URL (CORS + redirects) | `https://devtracedash.netlify.app` |
| `PORT` | Server port | `5000` |

> **Local-only (never set in production):** `DEV_AUTH_BYPASS=true` (backend) and `REACT_APP_AUTH_BYPASS=true` (frontend) skip authentication for local development. Both are double-gated on `NODE_ENV !== 'production'`, so they cannot activate on Render/Netlify.

### Frontend (Netlify)
| Variable | Description | Example |
|---|---|---|
| `REACT_APP_API_URL` | Backend API base URL (no trailing slash) | `https://devtracedashboard.onrender.com` |
| `REACT_APP_GA_MEASUREMENT_ID` | Google Analytics 4 measurement ID (optional) | `G-XXXXXXXXXX` |

---

## Local Development

### Prerequisites
- Node.js 20+
- Docker Desktop (optional — only for the full DB-backed stack)

### Setup

```bash
# Clone the repo
git clone https://github.com/Nitin23123/DEVtraceDashboard.git
cd DEVtraceDashboard

# Start all services (postgres + backend + frontend)
docker-compose up -d
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:5000 |
| Health check | http://localhost:5000/health |

### Without Docker

```bash
# Terminal 1 — Backend
cd backend && npm install && npm run dev

# Terminal 2 — Frontend
cd frontend && npm install && npm start
```

To skip login locally (no DB required for the Placements feature), add `DEV_AUTH_BYPASS=true` to `backend/.env` and `REACT_APP_AUTH_BYPASS=true` to `frontend/.env`.

---

## Deployment

| Service | Platform |
|---|---|
| Database | [Neon](https://neon.tech) — run the 3 migration files in SQL Editor |
| Backend | [Render](https://render.com) — root dir `backend`, build `npm install`, start `npm start` |
| Frontend | [Netlify](https://netlify.com) — root dir `frontend`, build `npm run build`, publish `frontend/build` |

**Required after deploy:**
- Set `FRONTEND_URL` on Render to your Netlify URL
- Update GitHub OAuth app callback to `https://<render-url>/api/auth/github/callback`

---

## GitHub OAuth Setup

1. Go to GitHub → Settings → Developer Settings → OAuth Apps → New OAuth App
2. **Homepage URL**: `https://devtracedash.netlify.app`
3. **Authorization callback URL**: `https://devtracedashboard.onrender.com/api/auth/github/callback`
4. Copy Client ID and Secret into Render environment variables

---

## License

MIT
