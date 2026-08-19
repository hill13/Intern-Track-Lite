# InternTrack Lite

🔗 **Live demo:** [intern-track-lite.vercel.app](https://intern-track-lite.vercel.app) — register with any email to try it (Render free tier: ~30 s cold start on first request after idle).

A full-stack job-application tracker built as a portfolio project — async FastAPI backend, React + TanStack Query frontend, PostgreSQL with composite-indexed aggregation queries, optimistic-update Kanban board, scheduled reminder digests via Resend, and a recharts-based stats dashboard.

> Built to practice production-grade patterns end-to-end, not to be a tutorial app. The [Key Decisions](#key-decisions) section below writes up the architectural choices worth defending — each with the rejected alternatives and the tradeoff accepted.

---

## Features

- **Kanban board** — drag applications across seven stages (Wishlist → Applied → Screening → Interview → Offer → Rejected → Withdrawn) with optimistic UI updates and rollback on API failure
- **Add / edit / delete application modals** — labeled form fields, inline tag create + delete, notes, source dropdown, reminder date
- **Inline Tag Manager** — create and delete tags directly inside the application modals from a curated 8-color palette; case-insensitive duplicate guard; delete cascades server-side and drops ghost pills from every Board card via cross-entity cache invalidation. Filter the Kanban board by tag chip.
- **Reminder digests** — set a reminder date on any application; APScheduler fires daily at 8am and sends one email per user via Resend listing every application whose reminder is due today
- **Stats dashboard** — per-user aggregation:
  - KPI row (Total / Applied / Interviews / Offers) derived client-side from the by-stage response
  - Bar chart: applications per stage
  - Line chart: applications per week (rolling 12-week window, `DATE_TRUNC('week')` bucketing)
- **Auth** — register / login via JWT (access token stored in localStorage; `<ProtectedRoute>` gates client-side; every API endpoint validates the JWT server-side via a `get_current_user` FastAPI dependency)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS |
| State (client) | React state + Zustand (auth) |
| State (server) | TanStack Query (React Query) |
| Charts | recharts |
| Drag & drop | @dnd-kit/core |
| Routing | React Router v6 |
| Backend | FastAPI (async), Python 3.12 |
| ORM / DB driver | SQLAlchemy async + asyncpg |
| Database | PostgreSQL 16 |
| Migrations | Alembic |
| Auth | JWT via python-jose + bcrypt 4.0.1 |
| Background jobs | APScheduler (in-process, `BackgroundScheduler` + `CronTrigger`) |
| Transactional email | Resend |
| Containerization | Docker Compose |
| CI/CD | GitHub Actions |

---

## Deployment

Live at [intern-track-lite.vercel.app](https://intern-track-lite.vercel.app). Free-tier stack chosen for zero cost, one-click GitHub integration, and portability across providers.

- **Frontend — Vercel.** Static Vite bundle served from Vercel's edge CDN. Auto-deploys on every push to `main`. `VITE_API_URL` is baked into the bundle at build time (Vite's design — the shipped JS has no runtime server, so env vars must be substituted before the browser downloads it).
- **Backend — Render.** FastAPI + uvicorn inside a Docker container, auto-deploys on every push to `main`. Free tier spins down after ~15 min idle; first request after inactivity has a ~30 s cold start, then stays warm.
- **Database — Neon.** Managed serverless Postgres. Compute auto-suspends after ~5 min idle but resumes automatically on the next connection — no data loss and no manual wake-up. Picked over Supabase because Supabase's free tier deletes projects after ~7 days of inactivity (learned the hard way — the original DB got deleted mid-project).
- **Migrations — Alembic inside the container start command.** `alembic upgrade head` runs before uvicorn in the backend's `CMD`, so the API is never allowed to serve traffic against an outdated schema. See Key Decision #7 for the tradeoff.
- **Config — env vars per service.** Each PaaS holds its own env vars in its own dashboard (Vercel for `VITE_API_URL`; Render for `DATABASE_URL`, `SECRET_KEY`, `CORS_ORIGINS`, `RESEND_API_KEY`; Neon holds the connection string). No secrets in git; `.env.example` documents the shape.

---

## Key Decisions

Six architectural choices worth defending. Each entry names what was chosen, what was rejected, the tradeoff accepted, and what would change the answer.

### 1. In-process APScheduler over Celery + Redis (Phase 7)

Chose in-process scheduling because this is a one-server portfolio project. Adding a Redis broker and a Celery worker container would be cargo-culting an enterprise pattern for a workload of "one email batch, once a day." **Tradeoff:** doesn't scale past one API replica — two replicas would double-send. Documented for later; would switch to Celery when horizontal scale becomes real.

### 2. One JOIN + `defaultdict` grouping to avoid N+1 in the reminder loop (Phase 7)

Naive per-user version = 1 query for users + N for their applications. Instead, one JOIN returns `(Application, User)` tuples, `defaultdict` groups by `user.id`, one Resend call per user (the **digest pattern** — one email per user, not per application). **Tradeoff:** the result set sits in Python memory. Would batch in chunks with `LIMIT`/`OFFSET` at extreme scale.

### 3. Two per-chart endpoints instead of one `/stats` blob (Phase 8)

`/stats/by-stage` and `/stats/velocity` are separate endpoints so each chart gets its own React Query cache with its own invalidation lifecycle (by-stage invalidates on card drag; velocity only on application create). Progressive rendering — one chart paints without waiting on the other. **Tradeoff:** two round-trips and more frontend wiring. Would merge them if charts ever need to reflect the same atomic snapshot.

### 4. Composite index `(user_id, applied_date)` with equality-before-range column order (Phase 8)

Velocity query filters `WHERE user_id = :uid AND applied_date >= :cutoff`. Composite index instead of two single-column indexes; equality column (`user_id`) first so Postgres seeks to the user's slice, then walks the date range inside it. Reversed order can't do the user seek efficiently — that's the **leftmost-prefix rule**. **Tradeoff:** a third index on `applications` — every insert now writes one more index page.

### 5. Client-side zero-fill for sparse aggregation responses (Phase 8)

Backend `/stats/*` endpoints return only stages/weeks that have applications. The client owns the canonical `STAGES` list and generates the 12-Monday range, then zero-fills missing buckets. **Tradeoff:** every client re-implements zero-fill (a mobile client wouldn't want to). Would push to server if a non-React client shipped. Zero-fill uses **O(n+m) Map lookup**, not `.find()` inside `.map()` (which is O(n×m) — same shape as an N+1 problem on the client).

### 6. Inline Tag Manager over a dedicated `/tags` page (polish phase)

The tag CRUD API shipped in Phase 5 but had no user path — the endpoint was reachable via curl and invisible in the app (a **dead feature**). Chose to put create/delete inline inside both application modals rather than build a dedicated `/tags` route, because the audience is one user managing ~5-15 tags — a whole page is over-scope. Colors come from a curated 8-value `TAG_COLORS` palette, enforced at the type level via `as const` + a derived union (`type TagColor = (typeof TAG_COLORS)[number]`) — palette membership is a compile-time constraint, not a convention. **Rejected:** dedicated `/tags` route (over-scope), freeform color picker (visual chaos, no accessibility contract). **Tradeoff:** no rename affordance — users delete + recreate today. Duplicate check is frontend-only (no `UniqueConstraint(user_id, name)` on the backend yet), so a two-tab race could still create dupes. **Would revisit if:** tag count regularly exceeds ~15 (inline strip breaks visually) or two-tab races start showing up.

### 7. Alembic-on-startup instead of a separate migration job (deployment)

The backend container's `CMD` runs `alembic upgrade head && uvicorn ...`, so every deploy migrates the DB before the API comes up. Chosen because this is a **one-replica** Render service with no CI/CD pipeline to hang a pre-deploy step off — keeping migrations in the container's start command means the API is never allowed to serve traffic against an outdated schema. **Rejected:** Render's Pre-Deploy Command hook (extra orchestration surface for zero benefit at this scale), running `alembic upgrade head` manually before each deploy (relies on me not forgetting). **Tradeoff accepted:** migrations block startup — a slow migration would blow Render's health-check window and mark the deploy failed. Also **not safe with multiple replicas** — two containers starting simultaneously would race on the same migration since Alembic has no distributed locking, and would collide with `duplicate object` errors on the second one. **Would revisit if:** scaling past one replica, migrations start regularly exceeding a few seconds, or a CI pipeline lands with a natural place to run `alembic upgrade head` once against the target DB before rolling out replicas.

---

## Architecture Highlights

- **Optimistic UI on drag** — Kanban cards move immediately on drag using TanStack Query's cache snapshot; if the backend PATCH fails, the cache rolls back and the card snaps to its original column.
- **Cross-entity cache invalidation on tag delete** — `DELETE /tags/:id` cascade-drops rows from `application_tags` server-side, but the client's TanStack Query cache for `['applications']` has no way to know about that FK cascade. `deleteTagMutation.onSuccess` invalidates BOTH `['tags']` AND `['applications']` so every Board card holding the deleted tag refetches and drops the ghost pill. Missing the second invalidation is the class of bug where the DB is correct but the UI lies.
- **Sync → async bridge in the scheduler** — APScheduler jobs are sync, but the DB session is async. `run_reminder_job` is a sync wrapper that spins up an event loop with `asyncio.run(_run())`, runs the coroutine against `AsyncSessionLocal()`, and tears down.
- **Graceful degradation on scheduler failure** — `start_scheduler()` is wrapped in try/except inside FastAPI's lifespan. Reminders are non-critical; if the scheduler fails to start, the API still serves the Kanban board.
- **Fault isolation in the send loop** — each `resend.Emails.send(...)` call is wrapped in try/except so one bad recipient (rate-limit, invalid address, network blip) doesn't kill the rest of the batch.
- **Composite indexes matched to real query shapes** — `(user_id, stage)`, `(user_id, source)`, `(user_id, applied_date)` on `applications`; single-column `reminder_date` on `applications` for the scheduler's cross-user daily scan (composite would be dead weight because the scheduler query has no `user_id` predicate — leftmost-prefix rule).
- **Silent-bug avoidance in date handling** — the velocity zero-fill and `formatWeek` display helper both avoid `new Date("YYYY-MM-DD")` and `toISOString().slice(0,10)` because both silently shift the date across UTC. Local components (`getFullYear`, `getMonth`, `getDate`) or manual split-and-construct are used instead.
- **Per-chart four-state state machine** — every async-data UI is loading / error / empty / success. Each chart on the Stats page renders its own branch independently, so a slow or failed velocity fetch never hides the by-stage chart.

---

## Local Development

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Git

### Setup

```bash
git clone https://github.com/hill13/Intern-Track-Lite.git
cd Intern-Track-Lite
cp backend/.env.example backend/.env    # then fill in RESEND_API_KEY + generate SECRET_KEY
docker compose up
```

- Frontend: http://localhost:5173 · Backend: http://localhost:8000 · Swagger: http://localhost:8000/docs

Register a user in the browser, then log in — no seeded users. See [`backend/.env.example`](./backend/.env.example) for required env vars and how to generate `SECRET_KEY`.

If you install a new npm dep on the host, either run `docker compose exec frontend npm install <package>` inside the container or rebuild with `docker compose up --build` (the container uses an anonymous volume for `node_modules` so host and container don't share OS-specific binaries).

---

## How I Built This With AI

Used Claude Code heavily throughout, with explicit mentor-mode guardrails:
- No full implementations without me attempting first
- Every non-obvious line explained so I can defend it in an interview
- AI pushed back when I took the easy path (e.g. "you should extract this to a shared component" or "would you write this without AI?")
- Wrong AI output flagged and reviewed rather than pasted — the "mistakes I caught" bullets below are three of them

Three representative moments I caught the model being wrong:
- **Nested-ternary recommendation on `Stats.tsx`** — Claude first suggested matching Board's inline-early-return pattern; I pushed back because Stats has two independent queries with per-chart state, not one page-level state. Right consistency is matching the *pattern to the shape of the problem*, not the JSX form.
- **UTC direction on the velocity zero-fill bug** — Claude initially said `toISOString().slice(0,10)` shifts dates *backward*; actually it shifts *forward* in US timezones after ~5pm local. Caught by asking for a concrete worked example.
- **`stopPropagation` on the tag-pill × handler** — Claude insisted it was strictly required to prevent the pill's toggle from firing on delete clicks. I asked to trace the DOM tree and the claim broke: × and the pill are siblings inside the wrapping `<span>`, and click events bubble up, not sideways — the toggle handler is never in the propagation path. Kept the call defensively for future nesting refactors, but the "required" framing was wrong.

---

## What I'd Build Next

Ordered by realistic priority, not aspiration:

1. **Cross-site bookmarklet + install page** — drag-to-bookmark-bar JavaScript that scrapes the current LinkedIn / Indeed / Handshake / Glassdoor job page and opens InternTrack with the Add modal pre-filled (company, role, URL, source). Site-specific selectors with `document.title` fallback, plain `URLSearchParams` handoff into the existing Add modal. One-click job capture instead of alt-tab-and-retype.
2. **Generate frontend TS types from `/openapi.json`** — would prevent the class of drift bug where a backend field rename compiles cleanly on the frontend but silently breaks a `dataKey` string.
3. **Retry + DLQ for Resend send failures** — current fault isolation logs and continues; real recovery needs retry-with-exponential-backoff and a dead-letter queue for persistent failures.
4. **Extract shared page chrome + chart chrome** — both protected pages already render a shared `<Nav />` at the top of their JSX, but wrapping page chrome is still duplicated. Same story for the two charts' loading/error/empty/success JSX. Upgrade to `<Layout>` + `<Outlet />` and a `<ChartCard>` component once a third page or chart lands.
5. **Response-rate metric on the stats dashboard** — requires an outcome-per-source aggregation the backend doesn't compute yet.
6. **Horizontal scaling story** — swap in-process APScheduler for Celery + Redis if I ever needed more than one API replica, and move Alembic migrations out of the container start command (see Key Decision #7).

---

## CI/CD

GitHub Actions runs on every push:
- Backend build check
- Frontend production build

---

## License

MIT
