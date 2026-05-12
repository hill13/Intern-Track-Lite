import asyncio
from collections import defaultdict
from datetime import date

import resend
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.models.application import Application
from app.models.user import User

# Set Resend's API key once at module import — used by every resend.Emails.send() call below
resend.api_key = settings.RESEND_API_KEY

# Subject is content (not a secret, not deployment-specific) so it lives here, not in config
EMAIL_SUBJECT = "Your InternTrack reminders for today"


async def send_reminders(db: AsyncSession):
    # One query: join applications + users where reminder_date = today
    query = (
        select(Application, User)
        .join(User, User.id == Application.user_id)
        .where(Application.reminder_date == date.today())
    )
    result = await db.execute(query)
    rows = result.all()

    # Group applications by user so each user gets one digest email (not one per app)
    user_apps = defaultdict(lambda: {"user": None, "apps": []})
    for app, user in rows:
        user_apps[user.id]["user"] = user
        user_apps[user.id]["apps"].append(app)

    # One email per user listing all their due applications
    for data in user_apps.values():
        user = data["user"]
        apps = data["apps"]

        # Build the body — one line per application. `app.notes or "none"` handles NULL notes.
        body_lines = [
            f"- {app.company_name} | {app.role_title} | Notes: {app.notes or 'none'}"
            for app in apps
        ]
        body = "Reminders for today:\n\n" + "\n".join(body_lines)

        # Single send call per user — the digest pattern.
        # try/except isolates failures: one user's send error won't kill the whole batch.
        try:
            resend.Emails.send({
                "from": settings.RESEND_FROM_EMAIL,
                "to": user.email,
                "subject": EMAIL_SUBJECT,
                "text": body,
            })
            print(f"Sent reminder digest to {user.email} ({len(apps)} apps)")
        except Exception as e:
            # Catch broadly so the loop continues; LOG so failures aren't silent.
            print(f"FAILED to send reminder to {user.email}: {type(e).__name__}: {e}")


def run_reminder_job():
    # Bridge: APScheduler is sync, send_reminders is async — asyncio.run() connects them
    async def _run():
        async with AsyncSessionLocal() as db:
            await send_reminders(db)
    asyncio.run(_run())


# Single scheduler instance shared across the app
scheduler = BackgroundScheduler()


def start_scheduler():
    scheduler.add_job(
        run_reminder_job,
        CronTrigger(hour=8, minute=0),  # fires daily at 8:00am
    )
    scheduler.start()


def stop_scheduler():
    scheduler.shutdown()
