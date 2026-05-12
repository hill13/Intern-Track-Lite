from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.scheduler import start_scheduler, stop_scheduler


# Lifespan: code before `yield` runs on startup, code after runs on shutdown.
# @asynccontextmanager turns this async generator into an async context manager
# so FastAPI can do `async with lifespan(app):` under the hood.
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Graceful degradation: if the scheduler can't start, log it but keep the API alive.
    # Reminders are non-critical — the Kanban board should still work without them.
    try:
        start_scheduler()
    except Exception as e:
        print(f"WARNING: scheduler failed to start: {e}. API will run without reminders.")

    yield  # server runs and handles requests here

    try:
        stop_scheduler()
    except Exception as e:
        print(f"WARNING: scheduler failed to stop cleanly: {e}")


app = FastAPI(title="InternTrack Lite API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all v1 endpoints under /api/v1
app.include_router(api_router, prefix="/api/v1")


@app.get("/health")
async def health_check():
    return {"status": "ok"}
