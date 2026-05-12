import asyncio
from collections import defaultdict
from datetime import date

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal
from app.models.application import Application
from app.models.user import User


async def send_reminders(db: AsyncSession):
    # One query: join applications + users where reminder_date = today
    query = (
        select(Application, User)
        .join(User, User.id == Application.user_id)
        .where(Application.reminder_date == date.today())
    )
    result = await db.execute(query)
    rows = result.all()

    # Group applications by user so each user gets one digest email
    user_apps = defaultdict(lambda: {"user": None, "apps": []})
    for app, user in rows:
        user_apps[user.id]["user"] = user
        user_apps[user.id]["apps"].append(app)

    # One email per user listing all their due applications
    for data in user_apps.values():
        user = data["user"]
        apps = data["apps"]
        print(f"Sending reminder email to {user.email}")
        for app in apps:
            print(f"  - {app.company_name} | {app.role_title}")


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
