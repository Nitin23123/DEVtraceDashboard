# DevTrace — 100 Interview Questions & Answers

Beginner → Mid → Hard. Every answer is grounded in the **actual DevTrace codebase** so you never get caught claiming something the code doesn't do.

**Your verified one-liner:** Full-stack developer productivity dashboard (React, Node.js, Express, PostgreSQL) — 35+ REST APIs across 8 modules, JWT auth + bcrypt + GitHub OAuth 2.0, 50+ weekly active users, load-tested with autocannon (500 concurrent connections, zero failed requests, ~280 req/s on /health). Live at devtracedash.netlify.app.

---

## Section A — Project Walkthrough & Design (Q1–Q15)

### Q1. Walk me through your project. (5-line elevator version)
1. DevTrace is a full-stack developer productivity dashboard — one place to track tasks, notes, goals, code snippets, DSA progress, and GGSIPU placement prep.
2. Frontend is React 18 + Tailwind hosted on Netlify; backend is Node/Express with 35+ REST APIs across 8 modules, hosted on Render.
3. Data lives in PostgreSQL (Neon serverless), with per-user data isolation enforced by foreign keys and JWT-scoped queries.
4. Auth is JWT + bcrypt for email/password, plus GitHub OAuth 2.0 that powers a contribution heatmap, streaks, and repo stats.
5. It has 50+ weekly active users and I load-tested it with autocannon — 500 concurrent connections with zero failed requests.

### Q2. Now go deep — what happens end to end when a user logs in and creates a task?
1. **Login:** React sends `POST /api/auth/login` with email/password. Express looks up the user by email, runs `bcrypt.compare(password, password_hash)`. On match it signs a JWT (`jwt.sign({id, email}, JWT_SECRET, {expiresIn: '24h'})`) and returns it. The frontend stores it and attaches it to every request as `Authorization: Bearer <token>`.
2. **Create task:** `POST /api/tasks` hits Express → `verifyToken` middleware verifies the JWT and attaches `req.user = {id, email}` → controller validates the body (title required, status/priority against allowed values) → parameterized `INSERT INTO tasks (user_id, title, ...) VALUES ($1, $2, ...)` via the `pg` connection pool → Postgres also enforces `CHECK` constraints on status/priority → the inserted row is returned as JSON → React updates state and re-renders the list.
3. Every read is scoped `WHERE user_id = $1` using the id from the token, so users can never see each other's data even if they guess IDs.

### Q3. What are the 8 modules?
Auth, Dashboard (stats + streaks), Workspace (Tasks/Notes/Goals), Pomodoro, Code Snippets, API Tester (with request history), DSA Tracker (79-problem curriculum), GitHub Profile (OAuth), and Placements (interview experiences, question bank, roadmaps). (Pomodoro is client-side only — no API.)

### Q4. Why this tech stack? Why React, Express, PostgreSQL?
- **React:** component model fits a dashboard (each widget = a component with its own state), huge ecosystem (React Router, Framer Motion), virtual-DOM re-rendering makes frequent small updates (task toggles, timer ticks) cheap, and it's the most common stack in industry so skills transfer.
- **Express:** minimal and unopinionated — I wanted to learn HTTP, middleware, and REST hands-on rather than have a framework hide it. Middleware chain (CORS → JSON parsing → auth → route) maps exactly to how I think about a request pipeline.
- **PostgreSQL:** my data is **relational** — users own tasks/notes/goals/snippets, DSA progress is a many-to-many between users and problems. I need foreign keys, `CHECK` constraints, unique constraints, and joins. A document DB (MongoDB) would force me to enforce all that in application code. Postgres gives me ACID guarantees, and `JSONB` columns where I *do* want flexibility (API tester logs).

### Q5. Why not Next.js / NestJS / MongoDB?
- **Next.js** shines for SEO/server rendering; DevTrace is a logged-in dashboard behind auth, so SSR adds complexity for no benefit. A CRA/SPA + separate API is simpler and the API is reusable.
- **NestJS** adds decorators/DI/modules — great at large team scale, overkill for a solo 8-module project; Express kept me close to the metal.
- **MongoDB:** see Q4 — relational data, and I wanted DB-level integrity (FKs, CHECKs, UNIQUE) instead of app-level checks.

### Q6. What are you most proud of in this project?
Two honest answers:
1. **It's real and verified** — 50+ weekly active users, and instead of guessing performance I load-tested it: autocannon at 500 concurrent connections on `/health` with zero failed requests (~280 req/s), and measured the DB-backed `/api/tasks` at ~1.09s median under 50 connections. I know my numbers because I measured them.
2. **DB-level correctness** — data rules live in the schema (`CHECK` constraints on status/priority, `UNIQUE(user_id, problem_id)` on DSA progress, `ON DELETE CASCADE`), so bad data can't exist even if a controller has a bug.

### Q7. What would you improve? (2 honest answers — memorize these)
1. **Refresh tokens + httpOnly cookies.** Right now the JWT lives 24h in browser storage. Better: short-lived access token (15 min) + refresh token in an httpOnly, Secure, SameSite cookie — reduces XSS token-theft risk and lets me revoke sessions.
2. **The DB-backed endpoints are slow under load** (~1.09s median on /api/tasks at 50 connections). Fixes: add response caching for read-heavy endpoints, move off free-tier Neon/Render (cold starts ~23s), add pagination instead of fetching all rows, and tune pool size.
Bonus improvements if asked for more: automated tests (Jest + supertest), rate limiting on auth endpoints, input validation library (zod/joi) instead of hand-rolled checks.

### Q8. What was the hardest bug you fixed?
Pick the one that's true for you, but a strong, defensible story from this codebase: **GitHub OAuth + CORS across three domains.** Frontend on Netlify, backend on Render, GitHub as the OAuth provider — the redirect flow kept failing because (a) CORS only allows the configured frontend origin, (b) the OAuth callback URL had to exactly match what's registered in the GitHub app, and (c) after the callback the backend has the token but the *frontend* needs to know auth succeeded. Debugging required reading network tabs carefully, understanding that CORS is a browser-enforced policy (the OAuth redirect itself isn't a CORS request — it's a top-level navigation), and structuring the flow as: frontend → GitHub authorize URL → GitHub redirects to backend callback → backend exchanges code for access token, stores it on the user row → redirects back to the Netlify frontend. Lesson: draw the full request diagram before touching code.

### Q9. How do you handle errors in the app?
- **Backend:** controllers use try/catch; validation failures return 400 with an `{error}` message, missing/invalid JWT returns 401, missing resources 404, unexpected errors 500 (logged server-side, generic message to client — never leak stack traces).
- **Frontend:** API modules check `res.ok`, surface error messages in the UI, and a 401 response logs the user out (token expired).

### Q10. How is the project deployed? Walk through the pipeline.
Git push to GitHub → Netlify auto-builds the React app (`npm run build`) and serves static files from its CDN (with a `_redirects` file so client-side routes don't 404) → Render auto-deploys the Express server from the same repo → the backend connects to Neon (serverless Postgres) over SSL. CI builds Docker images for verification; actual deploys are Netlify/Render git integrations. Trade-off I can speak to: free tiers mean Render sleeps — first request after idle takes ~23s (cold start).

### Q11. Why separate frontend and backend deployments?
Independent scaling and deploys (a UI tweak doesn't redeploy the API), the static frontend gets CDN speed for free, and the API is client-agnostic — a mobile app could hit the same endpoints tomorrow. Cost: CORS configuration and two deploy targets.

### Q12. What is the API Tester module and what's interesting about building it?
It's a mini-Postman inside the app: pick a method (GET/POST/PUT/PATCH/DELETE), URL, body → the **backend** makes the request (using node-fetch) and returns status + body, and logs each request to the `api_logs` table (`request_body`/`response_body` as JSONB). Doing it server-side avoids browser CORS restrictions on arbitrary URLs. Interesting bits: storing semi-structured request/response payloads is exactly where JSONB beats rigid columns, and it's an SSRF surface I'd harden in production (block internal IPs/metadata endpoints).

### Q13. How does the streak feature work?
One row per user in `streaks` (`UNIQUE(user_id)`) with `current_streak`, `longest_streak`, `last_active_date`. On activity, compare today with `last_active_date`: same day → no change; yesterday → increment; older → reset to 1; update `longest_streak = GREATEST(longest, current)`.

### Q14. How does the DSA tracker model progress?
`dsa_problems` is shared seed data (79 problems, day_number, topic, difficulty with a CHECK constraint). `user_dsa_progress` is a join table: `(user_id, problem_id, completed, completed_at)` with `UNIQUE(user_id, problem_id)` — a classic many-to-many resolved by a junction table. Toggling a problem is an UPSERT (`INSERT ... ON CONFLICT (user_id, problem_id) DO UPDATE`), so double-clicks can't create duplicates.

### Q15. Explain your internship/experience work in the same structured way.
Use this template for each experience: (1) one-line context — team, product, users; (2) your specific responsibility; (3) one concrete technical contribution with the stack named; (4) one measurable or verifiable outcome; (5) one thing you learned. Never claim metrics you can't defend — the interviewer will drill into any number you say.

---

## Section B — Database & SQL (Q16–Q40)

### Q16. 🔥 Draw/explain your DB schema.
Practice drawing this in 60 seconds:

```
users (id PK, email UNIQUE, password_hash,
       github_access_token, github_username, timestamps)
  │ 1
  ├──< tasks    (id PK, user_id FK→users CASCADE, title, description,
  │              status CHECK(todo|in_progress|done),
  │              priority CHECK(low|medium|high), due_date, pinned, timestamps)
  ├──< notes    (id PK, user_id FK, title, content, timestamps)
  ├──< goals    (id PK, user_id FK, title, description, target_date,
  │              is_completed, timestamps)
  ├──< snippets (id PK, user_id FK, title, language, content, timestamps)
  ├──< api_logs (id PK, user_id FK, method, url,
  │              request_body JSONB, response_body JSONB, response_status)
  ├──1 streaks  (id PK, user_id FK UNIQUE, current_streak, longest_streak,
  │              last_active_date)          ← one-to-ONE
  └──< user_dsa_progress (user_id FK, problem_id FK→dsa_problems,
                completed, completed_at, UNIQUE(user_id, problem_id))
dsa_problems (id PK, day_number, topic, title, difficulty CHECK,
              UNIQUE(day_number, title))    ← shared seed data, no user_id
```

Key talking points: every user-owned table has `user_id FK ... ON DELETE CASCADE`; `streaks` is 1:1 (UNIQUE user_id); `user_dsa_progress` resolves a many-to-many; indexes on every `user_id` column plus `tasks(status)` and `api_logs(created_at)`.

### Q17. What is a primary key vs a foreign key?
A **primary key** uniquely identifies a row (here: `id SERIAL` — an auto-incrementing integer). A **foreign key** is a column that references another table's PK and the DB enforces the reference exists — `tasks.user_id REFERENCES users(id)` means you cannot insert a task for a user that doesn't exist, and `ON DELETE CASCADE` means deleting a user auto-deletes their tasks.

### Q18. What does ON DELETE CASCADE do, and what are the alternatives?
When the parent row (user) is deleted, all child rows (their tasks/notes/etc.) are deleted automatically. Alternatives: `RESTRICT`/`NO ACTION` (block the delete while children exist), `SET NULL` (orphan the child but keep it). I chose CASCADE because a user's data is meaningless without the user — account deletion should wipe everything (also good for privacy).

### Q19. What is a CHECK constraint and where do you use it?
A DB-level rule on column values: `status CHECK (status IN ('todo','in_progress','done'))` and `priority CHECK (priority IN ('low','medium','high'))`. Even if a buggy controller or a manual SQL insert tries `status='banana'`, Postgres rejects it. Defense in depth: I validate in the controller for good error messages, but the schema is the last line of defense.

### Q20. What is an index and why did you add them?
An index is a sorted lookup structure (B-tree by default in Postgres) that turns a full-table scan O(n) into a tree lookup O(log n). Since almost every query is `WHERE user_id = $1`, I indexed `user_id` on every user-owned table, plus `tasks(status)` for filtering and `api_logs(created_at)` for time-ordered history. Trade-off: indexes slow down writes slightly (each INSERT must update the index) and take space — you index the columns you actually filter/join on, not everything.

### Q21. What's a composite/unique constraint — where in your schema?
`UNIQUE(user_id, problem_id)` on `user_dsa_progress` — one progress row per user per problem. And `UNIQUE(day_number, title)` on `dsa_problems` so the seed script is idempotent (re-running migrations can't duplicate problems). `users.email` is UNIQUE so two accounts can't share an email.

### Q22. Explain normalization (1NF, 2NF, 3NF) using your schema.
- **1NF** — atomic values, no repeating groups: I don't store a comma-separated list of tasks inside `users`; tasks are their own rows.
- **2NF** — no partial dependency on part of a composite key: in `user_dsa_progress`, `completed` depends on the whole (user, problem) pair, not just one of them.
- **3NF** — no transitive dependencies: problem details (topic, difficulty) live once in `dsa_problems`, not copied into every user's progress row. If a title changes, one update fixes it everywhere — that's the point: eliminate update anomalies.

### Q23. When would you denormalize?
When read performance matters more than write simplicity. Example from my schema: `streaks.longest_streak` is technically derivable from history, but I store it precomputed because recomputing on every dashboard load is wasteful. Analytics systems denormalize heavily for the same reason.

### Q24. Write the SQL to get a user's incomplete high-priority tasks, newest first.
```sql
SELECT id, title, due_date
FROM tasks
WHERE user_id = $1 AND status <> 'done' AND priority = 'high'
ORDER BY created_at DESC;
```
Point out: parameterized `$1` (never string concatenation), and the `idx_tasks_user_id` index makes the WHERE cheap.

### Q25. Write the SQL for the dashboard stats (task counts by status).
```sql
SELECT status, COUNT(*) AS count
FROM tasks
WHERE user_id = $1
GROUP BY status;
```
`GROUP BY` buckets rows; aggregates (COUNT/SUM/AVG/MAX/MIN) collapse each bucket to one row. To filter on the aggregate you'd use `HAVING COUNT(*) > 5` — WHERE filters rows *before* grouping, HAVING filters groups *after*.

### Q26. Write a JOIN: each user's DSA completion count.
```sql
SELECT u.email, COUNT(p.id) AS solved
FROM users u
LEFT JOIN user_dsa_progress p
  ON p.user_id = u.id AND p.completed = true
GROUP BY u.id, u.email;
```
`LEFT JOIN` keeps users with zero progress (INNER JOIN would drop them). Note the filter on `p.completed` is in the ON clause — putting it in WHERE would turn the LEFT JOIN back into an INNER JOIN for users with no completed rows.

### Q27. Explain INNER vs LEFT vs RIGHT vs FULL joins.
- **INNER:** only rows that match on both sides.
- **LEFT:** all left rows; NULLs where right side has no match (my go-to: "all users, with progress if any").
- **RIGHT:** mirror of LEFT (rarely used — just swap table order).
- **FULL OUTER:** all rows from both sides, matched where possible.

### Q28. What is an UPSERT and where do you use one?
Insert-or-update in one atomic statement. Toggling DSA progress:
```sql
INSERT INTO user_dsa_progress (user_id, problem_id, completed, completed_at)
VALUES ($1, $2, true, NOW())
ON CONFLICT (user_id, problem_id)
DO UPDATE SET completed = EXCLUDED.completed, completed_at = EXCLUDED.completed_at;
```
It relies on the unique constraint and is race-safe — two simultaneous toggles can't create two rows.

### Q29. What is SQL injection and how do you prevent it?
Attacker input that becomes SQL: if I built `"SELECT * FROM users WHERE email = '" + email + "'"`, then input `' OR '1'='1` dumps every user. Prevention: **parameterized queries** — `pool.query('SELECT * FROM users WHERE email = $1', [email])` — the driver sends SQL and data separately, so input is always data, never code. Every query in DevTrace is parameterized.

### Q30. What are ACID properties?
- **Atomicity:** a transaction fully happens or fully doesn't (no half-written state).
- **Consistency:** transactions move the DB between valid states — constraints (FK, CHECK, UNIQUE) always hold.
- **Isolation:** concurrent transactions don't see each other's intermediate state.
- **Durability:** once committed, data survives a crash (write-ahead log).
Example: registration inserts a user; if signing the JWT then failed mid-way there's no half-created corrupt row — the insert either committed or didn't.

### Q31. What is a transaction? Write one for "complete a goal and bump the streak."
```sql
BEGIN;
UPDATE goals SET is_completed = true, updated_at = NOW()
  WHERE id = $1 AND user_id = $2;
UPDATE streaks SET current_streak = current_streak + 1,
  longest_streak = GREATEST(longest_streak, current_streak + 1),
  last_active_date = CURRENT_DATE
  WHERE user_id = $2;
COMMIT;  -- or ROLLBACK on any error
```
Both updates succeed together or neither does.

### Q32. What are isolation levels?
From weakest to strongest: **Read Uncommitted** (dirty reads — Postgres doesn't actually allow this), **Read Committed** (Postgres default — you only see committed data, but two reads in one transaction can differ), **Repeatable Read** (snapshot for the whole transaction), **Serializable** (as if transactions ran one at a time; may abort with serialization errors you must retry). DevTrace runs on Read Committed, which is fine because operations are single-statement and per-user.

### Q33. What is a connection pool and why does your backend use one?
Opening a Postgres connection involves TCP + TLS + auth — expensive (tens of ms). `pg.Pool` keeps a set of connections open and lends them out per query. Without pooling, 100 concurrent requests = 100 fresh connections, which would exhaust Neon's connection limit and crash. With a pool, requests queue briefly for a free connection. This is also my honest explanation for `/api/tasks` latency under load: 50 concurrent requests contend for a small pool against a free-tier serverless DB.

### Q34. Why JSONB for api_logs but proper columns everywhere else?
Request/response bodies are arbitrary user-generated JSON — no fixed schema to model. JSONB stores parsed binary JSON, is queryable (`response_body->>'status'`) and indexable (GIN). But for tasks/goals I want typed columns with constraints — JSONB everywhere would mean no CHECKs, no FKs into the payload, weaker integrity. Rule: rigid columns for data you own, JSONB for data you don't control.

### Q35. SERIAL vs UUID for primary keys?
`SERIAL` (auto-increment int): compact, fast, index-friendly — but guessable (IDs leak row counts, and sequential IDs invite enumeration attacks — mitigated here because every query is scoped by `user_id` from the JWT). `UUID`: globally unique, unguessable, safe to generate client-side or across shards — but 16 bytes and random inserts fragment the index. For a single-DB app SERIAL is fine; I'd pick UUIDs for public-facing IDs or distributed systems.

### Q36. How would you paginate the tasks list?
Offset: `... ORDER BY created_at DESC LIMIT 20 OFFSET 40` — simple but slow for deep pages (Postgres still scans the skipped rows) and unstable when rows are inserted between pages. Keyset (cursor): `WHERE (created_at, id) < ($lastSeenCreatedAt, $lastSeenId) ORDER BY created_at DESC, id DESC LIMIT 20` — O(log n) per page and stable. I'd use keyset; it's also one of my stated improvements since DevTrace currently returns all rows.

### Q37. What is EXPLAIN / how do you debug a slow query?
`EXPLAIN ANALYZE <query>` shows the actual plan: Seq Scan vs Index Scan, row estimates, timing. Debug loop: run it → if you see a Seq Scan on a big table with a selective WHERE, add an index on that column → re-check. Also check for missing `LIMIT`, N+1 query patterns from the app, and stale statistics (`ANALYZE`).

### Q38. What is the N+1 query problem?
Fetching a list (1 query) then looping to fetch a related row per item (N queries). E.g., fetching 79 DSA problems then querying progress per problem = 80 round trips. Fix: one JOIN or one `WHERE problem_id = ANY($1)` query. Each round trip costs network latency, so N+1 destroys performance even when each query is fast.

### Q39. How do migrations work in your project?
Numbered SQL files (`001_initial_schema.sql`, `002_add_github_oauth.sql`, `003_developer_tools.sql`) applied in order. They're written to be idempotent — `CREATE TABLE IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`, and a `DO $$` block for constraints (PG15 has no `ADD CONSTRAINT IF NOT EXISTS`) — so re-running is safe. Migrations = version control for the schema: every environment can be rebuilt to the same state, and schema changes are reviewed like code.

### Q40. DELETE vs TRUNCATE vs DROP?
`DELETE` removes rows (can have WHERE, fires triggers, logged per row, rollback-able). `TRUNCATE` empties the whole table fast (deallocates pages, resets SERIAL). `DROP` removes the table itself, schema and all.

---

## Section C — Backend, Node, Express & Auth (Q41–Q65)

### Q41. How does Node.js handle many concurrent requests with one thread?
The **event loop**. All I/O (DB queries, HTTP calls, file reads) is non-blocking: Node fires the operation, registers a callback/promise, and moves on. When the OS signals completion, the callback runs. So one thread can juggle hundreds of in-flight requests because it never sits waiting on I/O. This is why my single free-tier dyno survived 500 concurrent connections on /health — each request does almost no CPU work. The catch: CPU-heavy work (like bcrypt, if it weren't offloaded) blocks *everyone* — hence "don't block the event loop."

### Q42. Explain the middleware chain in your Express app.
A request flows through functions in registration order, each calling `next()`: **CORS** (sets Access-Control-Allow-Origin for the Netlify domain, answers preflights) → **express.json()** (parses the body into `req.body`) → **route matching** → **verifyToken** on protected routes (validates JWT, attaches `req.user`) → **controller** (validation + DB + response). Errors skip to error-handling middleware. Middleware is just the chain-of-responsibility pattern for HTTP.

### Q43. Explain your JWT auth in full detail.
A JWT is three base64url parts: `header.payload.signature`. Header says the algorithm (HS256), payload carries my claims (`{id, email, iat, exp}`), and the signature is `HMAC-SHA256(header + "." + payload, JWT_SECRET)`. On login I sign a token with a 24h expiry. On each request, `verifyToken` middleware recomputes the signature with the server's secret — if the token was tampered with (say someone edits `id` to another user), the signature won't match and I return 401. Key insight interviewers probe: **JWTs are signed, not encrypted** — anyone can *read* the payload (base64-decode it), they just can't *forge* it. So never put secrets in the payload.

### Q44. Sessions vs JWTs — trade-offs?
**Server sessions:** server stores session data, browser holds an opaque cookie ID. Pros: instant revocation, small cookie. Cons: server-side storage, sticky sessions or shared store (Redis) when scaling.
**JWT (my choice):** stateless — the server verifies the signature, no session store needed; works cleanly across my split Netlify/Render deployment and scales horizontally for free. Cons: can't revoke before expiry (my mitigation: 24h expiry; proper fix: short-lived access + refresh tokens — my stated improvement), and token size on every request.

### Q45. How does bcrypt work and why not SHA-256 for passwords?
bcrypt = salted, adaptive, deliberately-slow hashing. I use cost factor 12, meaning 2^12 internal iterations — ~100–300ms per hash. SHA-256 is designed to be *fast*, so an attacker with a leaked DB can try billions of guesses/second; bcrypt reduces that to maybe a few thousand. The salt (random, stored inside the hash string) means two users with the same password get different hashes, killing rainbow tables. Login does `bcrypt.compare(plain, storedHash)` — it extracts the salt from the stored hash, re-hashes, and constant-time-compares.

### Q46. Walk through your GitHub OAuth 2.0 flow.
Authorization-code flow: (1) user clicks "Connect GitHub" → redirected to `github.com/login/oauth/authorize?client_id=...&redirect_uri=...&scope=...`; (2) user approves; GitHub redirects to my backend callback with a one-time `code`; (3) my **backend** exchanges `code + client_secret` for an access token (server-to-server, so the secret never touches the browser); (4) I store the token and username on the user row (`002` migration added those columns); (5) subsequent requests to `/api/github/*` use the stored token to call the GitHub API for the heatmap, streaks, repos, and open PRs. Why the code-exchange dance? So the access token is never exposed in a URL/browser history, and so GitHub knows the request really came from my registered app (client_secret).

### Q47. What is CORS, actually?
A **browser** security policy (Same-Origin Policy) relaxation mechanism. My frontend origin (`devtracedash.netlify.app`) differs from my API origin (`devtracedashboard.onrender.com`), so the browser blocks responses unless the server opts in with `Access-Control-Allow-Origin`. For "non-simple" requests (JSON POST with Authorization header), the browser first sends an `OPTIONS` **preflight** asking "may I?", and the cors middleware answers with allowed origins/methods/headers. Critical nuance: CORS protects users in browsers — it does nothing against curl/Postman; that's what auth is for.

### Q48. What do the main HTTP status codes mean, and which do you use?
200 OK (successful GET/PUT), 201 Created (register, create task), 400 Bad Request (validation failure), 401 Unauthorized (missing/invalid/expired JWT), 403 Forbidden (authenticated but not allowed), 404 Not Found (task ID not found *for this user*), 409 Conflict (duplicate email on register), 500 Internal Server Error (unexpected — logged, generic message returned). Know the 401 vs 403 distinction: 401 = "who are you?", 403 = "I know who you are; no."

### Q49. What makes an API RESTful? Show your route design.
Resources as nouns, HTTP verbs as actions, statelessness (every request self-contained — my JWT enables this):
```
POST   /api/auth/register      create account
POST   /api/auth/login         issue token
GET    /api/tasks              list my tasks
POST   /api/tasks              create
PUT    /api/tasks/:id          update
DELETE /api/tasks/:id          delete
GET    /api/dashboard/stats    aggregated counts
POST   /api/dsa/:id/toggle     toggle progress (pragmatic RPC-ish exception)
```
Same pattern across notes, goals, snippets — that consistency is how one person maintains 35+ endpoints.

### Q50. PUT vs PATCH vs POST?
POST creates (not idempotent — two POSTs = two tasks). PUT replaces the whole resource (idempotent — same call twice = same result). PATCH partially updates (send only changed fields). **Idempotency** matters for retries: a client can safely retry a PUT after a timeout, but retrying a POST may duplicate.

### Q51. How is data validated in your project? (layered answer — they love this)
Three layers:
1. **Frontend:** required fields, HTML input types, instant feedback — UX only, trivially bypassed.
2. **Controller (the real gate):** presence checks (title, email, password), allowed-value checks for status/priority, email shape — returns 400 with a clear message. Never trust the client: anyone can curl my API directly.
3. **Database:** `NOT NULL`, `UNIQUE(email)`, `CHECK(status IN ...)`, FKs — the last line of defense that makes invalid data *impossible*, not just rejected.
Plus parameterized queries everywhere so validation bugs can't become injection.

### Q52. Where do secrets live and why?
Environment variables via dotenv locally, Render's env config in production: `DATABASE_URL`, `JWT_SECRET`, GitHub client id/secret. Never in git — a leaked JWT_SECRET lets anyone forge tokens for any user; a leaked DB URL is game over. Config-via-env also means the same code runs in dev and prod (12-factor principle).

### Q53. What does your auth middleware's dev-bypass do, and why is it safe?
For local development, if `NODE_ENV !== 'production'` **and** an explicit `DEV_AUTH_BYPASS=true` flag is set, it injects a fake user so I can test endpoints without logging in. It's double-gated: Render sets `NODE_ENV=production`, so the bypass can never activate in the deployed backend even if the flag leaked. Good talking point: convenience features must fail closed.

### Q54. Explain the event loop phases / microtasks vs macrotasks.
Order: synchronous code → all microtasks (Promise callbacks, `queueMicrotask`) → one macrotask (timers via `setTimeout`, I/O callbacks) → microtasks again → repeat. So `Promise.resolve().then(f)` runs before `setTimeout(g, 0)`. Classic quiz:
```js
console.log(1);
setTimeout(() => console.log(2), 0);
Promise.resolve().then(() => console.log(3));
console.log(4);        // prints 1, 4, 3, 2
```

### Q55. Callback → Promise → async/await: explain the progression.
Callbacks nest ("callback hell") and split error handling. Promises flatten chains and unify errors into `.catch`. `async/await` is syntax over promises — asynchronous code that reads synchronously, with try/catch. My controllers are `async (req, res)` and `await pool.query(...)`; the event loop keeps serving other requests while the DB works.

### Q56. What happens if you forget `await` on a DB call?
You get a pending Promise, not data — `res.json(rows)` sends nothing useful, and worse, errors from that query become unhandled rejections instead of hitting your try/catch. A real class of bug I check for in review.

### Q57. How did you load-test, and what exactly do your numbers mean?
Tool: **autocannon**. Results I can defend:
- `/health` (no DB): 500 concurrent connections, **zero failed requests**, ~**280 req/s** — proves the Node/Express layer and event loop hold up.
- `/api/tasks` (JWT + Postgres): median **~1.09s at 50 connections** — the bottleneck is the free-tier DB + connection pool contention, not Express.
- Single request baselines: ~250ms health, ~480ms tasks. Render cold start after sleep: ~23s.
The honest analysis: throughput ≠ latency; my app is I/O-bound, and I know *which* layer is slow because I tested endpoints with and without the DB.

### Q58. How would you scale DevTrace to 10,000 users?
In order of bang-for-buck: (1) paid DB tier + right-sized connection pool (or PgBouncer); (2) pagination + only fetching needed columns; (3) caching — Redis or even in-process for read-heavy, rarely-changing data (dsa_problems is identical for everyone — cache it forever); (4) horizontal scaling of the stateless Express app behind a load balancer — JWTs make this trivial since any instance can verify any token; (5) CDN already handles frontend. Measure again after each step — no blind optimization.

### Q59. What is rate limiting and where would you add it?
Capping requests per client per window (e.g., token bucket). Highest priority: `/api/auth/login` (brute-force protection) and `/api/auth/register` (spam), then the API Tester (it makes outbound requests on behalf of users — abuse vector). Implementation: `express-rate-limit` keyed by IP (+ email for login), returning 429.

### Q60. What security issues do you know exist / have handled? (be honest, it impresses)
Handled: SQL injection (parameterized queries), password storage (bcrypt cost 12), token forgery (HMAC-signed JWT), cross-user data access (every query scoped by `req.user.id`), CORS locked to my frontend origin, secrets in env vars, OAuth client_secret kept server-side.
Known gaps I'd fix: no rate limiting yet, JWT in browser storage (XSS exposure — move to httpOnly cookie + refresh tokens), API Tester is an SSRF vector (should block private IP ranges), no helmet security headers, no automated dependency audits.

### Q61. What is XSS and how does React help?
Cross-site scripting: attacker-controlled content executes as script in another user's browser (e.g., a note titled `<script>steal(localStorage.token)</script>`). React escapes all interpolated values by default — `{note.title}` renders as text, not HTML — so you're safe unless you use `dangerouslySetInnerHTML` (I don't). Remaining risk is why storing JWTs in localStorage is criticized: *any* successful XSS can read it. Defense in depth: escape output (React), sanitize input, CSP headers, httpOnly cookies for tokens.

### Q62. What is CSRF and does it affect you?
Cross-site request forgery: an evil site makes the victim's browser send a request to your API, riding on cookies the browser auto-attaches. DevTrace is largely immune **because** the JWT lives in a header the attacker's page can't set cross-origin (browsers only auto-attach cookies, not Authorization headers). If I move to cookie-based auth (my improvement plan), I'd need SameSite cookies + CSRF tokens. Knowing this trade-off (XSS-vs-CSRF surface of localStorage vs cookies) is a strong senior-signal answer.

### Q63. What is the request lifecycle from browser to DB and back — every layer?
DNS resolves the API domain → TCP handshake → TLS handshake (HTTPS) → browser sends HTTP request with headers + JWT → Render's proxy forwards to my Node process → Express middleware chain → controller → `pg` pool lends a connection → Postgres parses/plans/executes → rows return → Node serializes JSON → response travels back → React updates state → virtual DOM diff → real DOM patch → repaint. Being able to narrate this smoothly covers half of "explain the internet" questions.

### Q64. Monolith vs microservices — what's DevTrace and why is that right?
A **modular monolith**: one deployable Express app with 8 route modules and clean internal separation (routes/controllers/middleware/db). Right choice because: one developer, one deploy, no network hops between modules, transactions across modules are trivial. Microservices buy independent scaling/deploys per team at the cost of network failure modes, distributed transactions, and ops burden — costs with no payoff at my scale. Strong answer: "I'd split only when a specific module has divergent scaling needs — e.g., the API Tester making outbound calls could become its own worker."

### Q65. What is Docker and how do you use it?
A container packages the app + runtime + deps into an image that runs identically anywhere (isolation via kernel namespaces/cgroups — lighter than a VM, which packages a whole OS). I have a backend Dockerfile and docker-compose that spins up the API + Postgres locally (migrations auto-run on first init via `/docker-entrypoint-initdb.d`), and CI builds the image to prove the build is reproducible. Deploys themselves go through Render/Netlify git integration.

---

## Section D — Frontend & React (Q66–Q82)

### Q66. Explain the front-end functionality — what happens on each user action?
Take "toggle a task's status": click → onClick handler fires → API module sends `PUT /api/tasks/:id` with the JWT header → on success, `setTasks(...)` updates state → React re-renders the component tree with the new state → virtual DOM diff finds the one changed node → real DOM patched → user sees the status pill change. Same pattern everywhere: **event → API call → setState → re-render**. Route changes (React Router v6) swap page components client-side with no full page load; Framer Motion animates the transitions; the Pomodoro timer is pure client state with `setInterval` + browser Notifications API.

### Q67. What is the virtual DOM and why does it exist?
Real DOM operations are expensive (layout/paint). React keeps a lightweight JS tree of what the UI *should* be; on each state change it builds a new tree, **diffs** it against the previous one (reconciliation), and applies only the minimal set of real DOM mutations. You write "declare the UI for this state," React figures out the mutations — that's the actual win: declarative code, not raw speed.

### Q68. State vs props?
**Props** flow parent → child, read-only for the child (like function arguments). **State** is owned and mutated by the component via `useState`. Changing either re-renders. Pattern I use constantly: a page owns the list state, passes items + callbacks down to item components ("lifting state up" so siblings share data through the common parent).

### Q69. Explain useState and useEffect deeply.
`const [tasks, setTasks] = useState([])` — returns current value + setter; calling the setter schedules a re-render; updates may batch, so use the functional form `setCount(c => c + 1)` when depending on the previous value.
`useEffect(fn, deps)` runs *after* render for side effects (data fetching, subscriptions, timers). Deps control when: `[]` = once on mount (where I fetch tasks), `[filter]` = when filter changes, none = every render (usually a bug). The return value is a cleanup function — my Pomodoro clears its interval there to prevent leaks. Classic pitfalls to name: infinite loop from setting state of an object dep every render; stale closures capturing old state.

### Q70. Why do list items need a key prop?
Keys let the diffing algorithm match old and new list items by identity instead of position. Without stable keys (or with index-as-key), inserting at the top makes React think every row changed — wrong state carryover in inputs, wasted re-renders. I use the DB `id`.

### Q71. Controlled vs uncontrolled components?
Controlled: input value lives in React state (`value={title} onChange={e => setTitle(e.target.value)}`) — single source of truth, enables instant validation; all DevTrace forms are controlled. Uncontrolled: DOM holds the value, read via ref when needed — fine for simple/file inputs.

### Q72. How does client-side routing work, and why did you need a _redirects file?
React Router v6 intercepts navigation, updates the URL via the History API, and renders the matching component — no server round trip. But if a user refreshes at `/dashboard`, Netlify's server gets asked for a file called `/dashboard` that doesn't exist → 404. The `_redirects` rule (`/* /index.html 200`) serves index.html for every path so the SPA boots and the router takes over. Every SPA-on-static-hosting needs this; knowing *why* is the interview point.

### Q73. How does the frontend talk to the backend — structure-wise?
An `api/` layer (auth.jsx, tasks.jsx, notes.jsx, …) wraps fetch: base URL from env, attaches `Authorization: Bearer <token>`, parses JSON, throws on `!res.ok`. Components never touch fetch directly — one place to change auth handling, error shaping, or the base URL. On 401, log out (expired token).

### Q74. Where do you store the JWT and what are the trade-offs?
localStorage (persists across tabs/restarts). Trade-off I say out loud before they ask: localStorage is readable by any JS on the page → XSS can steal it; httpOnly cookies are XSS-proof but reintroduce CSRF and need SameSite + CSRF tokens. My roadmap: short-lived access token in memory + refresh token in an httpOnly Secure cookie — best of both.

### Q75. How is the app responsive?
Tailwind's mobile-first breakpoints (`md:`, `lg:`): the sidebar is a collapsible icon rail on desktop and a drawer on mobile; split-pane views stack on small screens; grid layouts collapse to single column. Tailwind = utility classes composed in JSX — no separate CSS files to drift out of sync, design tokens (spacing/color scale) keep it consistent.

### Q76. What is re-rendering and how do you avoid unnecessary ones?
A component re-renders when its state or props change — and by default all its children re-render too. Tools: `React.memo` (skip child if props are shallow-equal), `useMemo` (cache expensive computed values), `useCallback` (stable function identity so memoized children don't see "new" props). Honest senior answer: measure first with React DevTools Profiler; at DevTrace's scale premature memoization adds complexity for no visible gain.

### Q77. Explain the component hierarchy of DevTrace.
`App` (router + auth context) → `Layout` (sidebar shell, theme) → page components (Dashboard, Workspace, Snippets, DSA, GitHub, Placements) → feature components (TaskCard, NoteEditor, HeatmapGrid) → shared primitives (buttons, modals). Data flows down as props; events flow up as callbacks; cross-cutting state (auth, theme) sits in context so it doesn't thread through every level ("prop drilling").

### Q78. What is the Context API and when would you use Redux instead?
Context passes a value to any depth without prop drilling — right for low-frequency global state like auth user and theme (DevTrace's usage). Redux (or Zustand) earns its keep when state is large, updated often from many places, and needs devtools/middleware/time-travel. Caveat to mention: every context consumer re-renders when the value changes, so don't put rapidly-changing data in context.

### Q79. localStorage vs sessionStorage vs cookies?
localStorage: ~5–10MB, persists until cleared, JS-readable, never auto-sent. sessionStorage: same but per-tab, dies with the tab. Cookies: ~4KB, auto-attached to every request to their domain (hence CSRF), can be httpOnly (invisible to JS — the security win). DevTrace: JWT + theme + display name in localStorage.

### Q80. How do browser notifications work in the Pomodoro?
`Notification.requestPermission()` (must be triggered by a user gesture) → if granted, `new Notification('Break time!')` when the interval hits zero. Timer state is a countdown in state driven by `setInterval`, cleaned up in useEffect's cleanup to avoid orphan timers. Gotcha worth naming: `setInterval` drifts and throttles in background tabs — for accuracy, compute remaining time from a stored end-timestamp instead of decrementing.

### Q81. What happens when you type a URL and hit enter? (the classic — 30-second version)
DNS lookup (browser cache → OS → resolver) resolves the domain to an IP → TCP three-way handshake → TLS handshake (server certificate, key exchange) → HTTP GET → server (Netlify CDN) responds with index.html → browser parses HTML, fetches CSS/JS → builds DOM + CSSOM → renders → React hydrates the app → JS fetches API data → UI fills in.

### Q82. How would you improve frontend performance?
Code-splitting with `React.lazy` per route (don't ship the Placements bundle to someone opening the Dashboard), image/asset optimization, memoizing hot lists, debouncing search inputs, and caching GET responses (even a simple in-memory map keyed by URL). Measure first with Lighthouse/DevTools Performance tab.

---

## Section E — JavaScript & CS Fundamentals (Q83–Q90)

### Q83. var vs let vs const?
`var`: function-scoped, hoisted-and-initialized to undefined, re-declarable — legacy, avoid. `let`: block-scoped, hoisted but in the "temporal dead zone" until the declaration line. `const`: block-scoped, no reassignment — but the object it points to is still mutable (`const arr = []; arr.push(1)` is legal). Default to const, use let when reassigning.

### Q84. == vs ===?
`==` coerces types (`'5' == 5` → true, `null == undefined` → true, plus a table of surprises); `===` compares type and value. Always `===` — coercion bugs are silent.

### Q85. What is a closure? Give a real example from your code.
A function that captures variables from its defining scope, which stay alive after the outer function returns. Every React handler is one: `onClick={() => deleteTask(task.id)}` closes over `task.id`. Also the classic module pattern and the stale-closure bug in useEffect (the effect captured an old state value — fixed with the functional setState form or correct deps).

### Q86. Explain `this` in JavaScript (briefly, with the arrow-function rule).
`this` depends on the *call site*: method call → the object; plain call → undefined (strict mode); `new` → the new instance. **Arrow functions don't have their own `this`** — they inherit it lexically, which is why callbacks in classes/handlers use arrows. In my functional-React codebase `this` barely appears — worth saying, it shows you know the ecosystem moved on.

### Q87. Explain array methods you actually use: map, filter, reduce, find, some.
```js
tasks.filter(t => t.status !== 'done')        // keep matching
     .map(t => t.title)                        // transform
tasks.find(t => t.id === id)                   // first match or undefined
tasks.some(t => t.pinned)                      // boolean: any match?
problems.reduce((n, p) => n + (p.completed ? 1 : 0), 0)  // fold to one value
```
All non-mutating (return new arrays) — which matters in React because state updates must be immutable: `setTasks(tasks.map(t => t.id === id ? {...t, status} : t))`, never `tasks[i].status = x`.

### Q88. Shallow vs deep copy?
`{...obj}` / `[...arr]` copy one level — nested objects are still shared references. Deep copy: `structuredClone(obj)` (modern) or rebuild nested levels with spreads. React bugs from this are common: mutating a nested object in state means the top-level reference didn't change → React may not re-render.

### Q89. Which data structures did you actually use, and where?
Arrays (every list), objects/hash maps (O(1) lookup — e.g., grouping DSA problems by day: `problems.reduce(...)` into `{1: [...], 2: [...]}`), Sets (fast membership — completed problem IDs for O(1) "is solved?" checks instead of O(n) `.includes` per render), and the DB's B-tree indexes (Q20). Being able to point at hash-map-for-grouping and Set-for-membership *in your own code* beats reciting definitions.

### Q90. Time complexity of common operations you rely on?
Array push O(1), search/includes O(n), sort O(n log n). Hash map/Set get/has O(1) average. B-tree index lookup O(log n). Practical example: checking 79 problems against a completed-Set is 79 × O(1) instead of 79 × O(n) with an array — small here, but it's the habit that matters.

---

## Section F — Scenario Design: Movie-Ticket System & Concurrency (Q91–Q96)

### Q91. Design an online movie-ticket booking system — what features and what schema?
Features: browse movies/theatres/showtimes, interactive seat map, seat locking during checkout, payment, e-ticket with QR, cancellations/refunds, notifications.
Schema (draw it like your DevTrace one):
```
movies (id, title, duration, rating)
theatres (id, name, city) ──< screens (id, theatre_id, name)
screens ──< shows (id, screen_id, movie_id, starts_at, base_price)
screens ──< seats (id, screen_id, row, number, type)
shows ──< show_seats (id, show_id, seat_id, status CHECK(available|locked|booked),
                      locked_by, locked_until, UNIQUE(show_id, seat_id))
users ──< bookings (id, user_id, show_id, amount, status) ──< booking_seats
```
The `UNIQUE(show_id, seat_id)` + status CHECK is the same pattern as my `user_dsa_progress` table — one authoritative row per bookable unit.

### Q92. 🔥 Two users click the same seat at the same moment — what happens and how do you prevent double booking?
This is a **race condition**: both read "seat available," both write "booked" — check-then-act is not atomic. Solutions, in the order I'd present them:
1. **Atomic conditional update (my primary answer):**
```sql
UPDATE show_seats
SET status = 'locked', locked_by = $user, locked_until = NOW() + INTERVAL '5 minutes'
WHERE show_id = $1 AND seat_id = $2
  AND (status = 'available' OR (status = 'locked' AND locked_until < NOW()))
RETURNING id;
```
The row lock inside a single UPDATE means exactly one of the two concurrent requests matches the WHERE and gets a row back; the other gets zero rows → "seat just taken." No explicit locking code needed — the database serializes writes to a row.
2. **Pessimistic locking:** `SELECT ... FOR UPDATE` inside a transaction — lock the row, check, update, commit. Second transaction blocks until the first commits. Simple and correct; holds locks longer.
3. **Optimistic locking:** version column; `UPDATE ... WHERE version = $expected` — retry on 0 rows. Best when conflicts are rare.
Plus a **lock TTL** (`locked_until`): if the user abandons checkout, the seat auto-frees — expired locks are treated as available by the same WHERE clause, so no cron job is strictly required.

### Q93. Where else must a booking system be careful about correctness?
Payment + booking must be transactional but payment is an *external* call — so: create booking `pending` → charge → on webhook success mark `confirmed` in a transaction; on failure release seats. Make the payment webhook **idempotent** (unique payment reference; processing the same webhook twice must not double-confirm). Never hold a DB transaction open across the external payment call.

### Q94. What's the difference between a race condition, a deadlock, and starvation?
Race: outcome depends on unlucky timing of concurrent operations (double-booked seat). Deadlock: two transactions each hold a lock the other needs — forever stuck; Postgres detects and kills one; prevention: acquire locks in a consistent order (e.g., always lock seats by ascending seat_id). Starvation: a task perpetually loses the scheduling/lock race and never proceeds.

### Q95. Does DevTrace itself have any race conditions?
Honest answer: low risk because data is per-user and operations are single-statement (atomic by default), but yes in principle — e.g., two tabs toggling the same DSA problem simultaneously. It's safe because the toggle is an UPSERT against `UNIQUE(user_id, problem_id)` — the constraint + single statement make it atomic. The streak update (read-modify-write) *could* double-increment across two simultaneous requests; fix is a single atomic UPDATE (`SET current_streak = current_streak + 1`) instead of read-then-write. Showing you can find the race in your *own* project is a standout answer.

### Q96. How would you add "movie ticket"-style features to DevTrace? (transfer question)
Example they might ask: shared/collaborative task boards. That introduces the same problems: two users editing one task → optimistic locking with a version column; real-time sync → WebSockets or polling; permissions → a `board_members` join table with roles. The point of these questions is mapping a new domain onto patterns you already know — say that explicitly.

---

## Section G — Behavioral & Project-Story Questions (Q97–Q100)

### Q97. "Explain all your projects one by one" — how should you structure it?
For each: **Context** (what/for whom) → **Stack** (and *why* that stack) → **Your role** (all of it, if solo — say so proudly) → **One hard technical thing** (OAuth flow, race-safe UPSERT, load-testing) → **Outcome** (users, measured numbers) → **What you'd improve**. Two minutes each, then let them drill. Never open with tech; open with what it does.

### Q98. "Tell me about a time you were stuck" / debugging story.
Use STAR with the OAuth/CORS story (Q8): Situation — GitHub connect failing only in production; Task — three domains, redirect flow broken; Action — drew the full request diagram, read the network tab hop by hop, learned CORS applies to fetch but not top-level redirects, restructured the callback flow; Result — working OAuth, and a habit of diagramming distributed flows before coding. End every debugging story with the *transferable lesson*.

### Q99. "Why should we hire you?" — tied to this project.
"I ship complete things: DevTrace is designed, built, deployed, and used — frontend, API, database, auth, OAuth, deployment. I verify instead of assume: I load-tested my claims and I can tell you exactly where the app is slow and why. And I know what I don't know — I can name my project's security gaps and the fixes. That combination — ownership, measurement, honesty — is what I'd bring to your team."

### Q100. Questions YOU should ask the interviewer.
- "What does the first 90 days look like for someone in this role?"
- "How does the team handle code review and testing?"
- "What's the current biggest technical challenge on the team?"
- "How do juniors typically grow here — mentorship, pairing, ownership?"
Asking about code review + growth signals you care about craft, not just an offer.

---

## Rapid-Fire Cheat Sheet (last 10 minutes before the interview)

| Claim | Number |
|---|---|
| REST APIs / modules | 35+ / 8 |
| Weekly active users | 50+ |
| Load test | autocannon, 500 conns, 0 failed, ~280 req/s on /health |
| /api/tasks under load | ~1.09s median @ 50 conns |
| Single request | ~250ms health, ~480ms tasks |
| Render cold start | ~23s |
| JWT expiry / bcrypt cost | 24h / 12 |
| DB tables | users, tasks, notes, goals, snippets, api_logs, streaks, dsa_problems, user_dsa_progress |
| DSA seed | 79 problems, 23 days |
| Hosting | Netlify (FE) + Render (BE) + Neon (PG 15) |

**Never claim:** RBAC, sub-100ms latency, "25%/40% improvement" metrics, real-time tracking, Lighthouse scores — these were removed from the resume because they aren't verifiable.
