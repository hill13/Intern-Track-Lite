# InternTrack Lite

A full-stack job application and interview tracker built for active job seekers. Track every application from wishlist to offer, get follow-up reminders before you forget, and see which job boards are actually getting you responses.

> Built as a portfolio project using production-grade patterns — not a tutorial app.

---

## Features

- **Kanban Board** — drag applications across stages: Wishlist → Applied → Screening → Interview → Offer → Rejected/Withdrawn
- **Status Timeline** — full history of every stage change, stored as an append-only event log
- **Source Tracking** — log where each application came from (LinkedIn, Handshake, Indeed, etc.) and see response rates per source on the Stats dashboard
- **Reminder Emails** — set a follow-up reminder (default: 7 days after applying) and get an email when it's time
- **Search & Filter** — full-text search across company name, role, and notes; filter by stage, source, priority, tags, and date range with pagination
- **Tags** — label applications with color-coded tags and filter the board by them
- **Stats Dashboard** — response rate, stage funnel, weekly activity, and source breakdown
- **CSV Export** — export your applications with active filters applied
- **Archived View** — soft-deleted applications stay accessible and restorable
- **Dark Mode** — persisted across sessions
- **Browser Bookmarklet** — click while on a LinkedIn/Handshake job page to open a pre-filled application form

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS |
| State | Zustand (auth/UI) + TanStack React Query (server state) |
| Forms | React Hook Form + Zod |
| Drag & Drop | @dnd-kit/core |
| Backend | FastAPI (async), Python 3.12 |
| Database | PostgreSQL 16 (async via asyncpg + SQLAlchemy) |
| Migrations | Alembic |
| Auth | JWT — access token in memory, refresh token in httpOnly cookie |
| Background Jobs | APScheduler with PostgreSQL job store |
| Email | SMTP (Gmail App Password / SendGrid) |
| Containerization | Docker + Docker Compose |
| CI/CD | GitHub Actions |

---

## Architecture Highlights

- **Append-only status event log** — stage transitions are recorded as events, not just a status column. Enables the full timeline feature and introduces event sourcing concepts at a small scale.
- **Optimistic UI on drag** — Kanban cards move instantly on drag using React Query's `onMutate` pattern, with automatic rollback if the API call fails.
- **XSS-resistant auth** — access token lives in memory (Zustand), refresh token is an httpOnly cookie so JavaScript can't steal it.
- **Persistent background jobs** — APScheduler uses PostgreSQL as its job store, so reminder jobs survive server restarts without needing Redis or Celery.
- **Soft deletes** — applications are never hard-deleted; `deleted_at` timestamp enables the archived view and full history recovery.
- **Indexed filtering** — composite indexes on `(user_id, stage)`, `(user_id, source)`, and `(user_id, applied_date)` keep filter queries fast as data grows. Pagination via `limit/offset` prevents unbounded result sets.

---

## Local Development

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Git

### Setup

```bash
git clone https://github.com/your-username/intern-track-lite.git
cd intern-track-lite
cp .env.example .env
# Edit .env with your values (see Environment Variables section)
docker compose up
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API docs: http://localhost:8000/docs

### Running Tests

```bash
# Backend
docker compose exec backend pytest --cov=app

# Frontend
docker compose exec frontend npm run test
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
# Database
POSTGRES_USER=interntrack
POSTGRES_PASSWORD=your_password
POSTGRES_DB=interntrack

# JWT
JWT_SECRET_KEY=generate-a-64-char-random-string
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# Email (for reminders)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your@gmail.com
SMTP_PASSWORD=your-gmail-app-password

# App
BACKEND_CORS_ORIGINS=["http://localhost:5173"]
```

---

## Project Status

Currently in active development. Building in phases:

- [ ] Phase 1 — Foundation (Docker, FastAPI skeleton, React skeleton)
- [ ] Phase 2 — Auth (register, login, JWT, protected routes)
- [ ] Phase 3 — Applications CRUD + Kanban board
- [ ] Phase 4 — Drag & drop + status timeline
- [ ] Phase 5 — Tags
- [ ] Phase 6 — Search & Filter (SQL WHERE clauses, composite indexes, pagination)
- [ ] Phase 7 — Reminders + email notifications
- [ ] Phase 8 — CSV export + stats dashboard
- [ ] Phase 9 — Archived view + dark mode
- [ ] Phase 10 — Browser bookmarklet
- [ ] Phase 11 — Tests, CI/CD, deployment

---

## CI/CD

GitHub Actions runs on every push:
- Backend: `pytest` with coverage check (≥75%)
- Frontend: `vitest`, ESLint, and production build

---

## License

MIT
