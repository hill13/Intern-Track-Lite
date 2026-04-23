from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.dependencies import get_db, get_current_user
from app.models.application import Application
from app.models.user import User
from app.schemas.application import ApplicationCreate, ApplicationUpdate, ApplicationResponse

router = APIRouter()


# POST /applications — create a new job application for the current user
@router.post("/", response_model=ApplicationResponse)
async def create_application(
    data: ApplicationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Default applied_date to today if user didn't provide one
    applied_date = data.applied_date if data.applied_date is not None else date.today()

    new_application = Application(
        user_id=current_user.id,
        company_name=data.company_name,
        role_title=data.role_title,
        stage=data.stage,
        source=data.source,
        notes=data.notes,
        job_url=data.job_url,
        applied_date=applied_date,
    )

    db.add(new_application)
    await db.commit()
    await db.refresh(new_application)  # loads DB-generated fields: id, created_at

    return new_application


# GET /applications — list all applications for the current user, with optional stage/source filters
@router.get("/", response_model=list[ApplicationResponse])
async def list_applications(
    stage: Optional[str] = None,    # ?stage=interview
    source: Optional[str] = None,   # ?source=linkedin
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Always filter by current user — users should never see each other's data
    application_query = select(Application).where(Application.user_id == current_user.id)

    if stage is not None:
        application_query = application_query.where(Application.stage == stage)
    if source is not None:
        application_query = application_query.where(Application.source == source)

    result = await db.execute(application_query)
    applications = result.scalars().all()
    return applications


# GET /applications/{id} — fetch a single application by ID, only if it belongs to the current user
@router.get("/{id}", response_model=ApplicationResponse)
async def single_application(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Filter by both id and user_id — if app belongs to another user, we return 404 not 403
    # This hides the existence of other users' applications (security through obscurity)
    result_query = select(Application).where(
        Application.user_id == current_user.id,
        Application.id == id,
    )

    result = await db.execute(result_query)
    application = result.scalar_one_or_none()

    if application is None:
        raise HTTPException(status_code=404, detail="Application not found")

    return application


# PATCH /applications/{id} — partially update an application (only fields sent by the user)
@router.patch("/{id}", response_model=ApplicationResponse)
async def update_application(
    id: int,
    data: ApplicationUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Fetch the application, 404 if not found or belongs to another user
    result_query = select(Application).where(
        Application.user_id == current_user.id,
        Application.id == id,
    )
    result = await db.execute(result_query)
    application = result.scalar_one_or_none()

    if application is None:
        raise HTTPException(status_code=404, detail="Application not found")

    # model_dump(exclude_unset=True) gives only the fields the user actually sent
    # Example: user sends {"stage": "interview"}
    #   → updates = {"stage": "interview"}   (not {"stage": "interview", "company_name": None, ...})
    updates = data.model_dump(exclude_unset=True)

    # setattr dynamically sets each field on the ORM object
    # Example: setattr(application, "stage", "interview")
    #          is the same as: application.stage = "interview"
    for field, value in updates.items():
        setattr(application, field, value)

    # Commit once after all fields are set, then refresh to get the latest DB state
    await db.commit()
    await db.refresh(application)
    return application


# DELETE /applications/{id} — delete an application, only if it belongs to the current user
@router.delete("/{id}", status_code=204)
async def delete_application(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Fetch the application, 404 if not found or belongs to another user
    result_query = select(Application).where(
        Application.user_id == current_user.id,
        Application.id == id,
    )
    result = await db.execute(result_query)
    application = result.scalar_one_or_none()

    if application is None:
        raise HTTPException(status_code=404, detail="Application not found")

    await db.delete(application)
    await db.commit()
