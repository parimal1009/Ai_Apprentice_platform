from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text
from sqlalchemy.orm import selectinload
from typing import Optional, List

from app.core.database import get_db
from app.core.deps import require_roles
from app.models.user import User, UserRole
from app.models.models import (
    ApprenticeProfile, CompanyProfile, TrainingProviderProfile,
    Application, ApprenticeshipListing, Cohort, CohortMember,
    AssessmentAttempt, AdminSettings, Report, AnalysisJob
)
from app.schemas.schemas import (
    UserRead, UserAdminUpdate, DashboardStats, MessageResponse, PaginatedResponse
)

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(["admin"]))
):
    # User counts by role
    user_counts = {}
    for role in UserRole:
        count = await db.execute(
            select(func.count(User.id)).where(User.role == role)
        )
        user_counts[role.value] = count.scalar() or 0

    total_users = sum(user_counts.values())

    # Active users (logged in last 30 days)
    active_result = await db.execute(
        select(func.count(User.id)).where(
            User.last_login.isnot(None),
            User.is_active == True
        )
    )
    active_users = active_result.scalar() or 0

    # Applications
    app_count = await db.execute(select(func.count(Application.id)))
    total_applications = app_count.scalar() or 0

    # Listings
    listing_count = await db.execute(
        select(func.count(ApprenticeshipListing.id)).where(ApprenticeshipListing.is_active == True)
    )
    active_listings = listing_count.scalar() or 0

    # Analyses
    analysis_count = await db.execute(select(func.count(AnalysisJob.id)))
    total_analyses = analysis_count.scalar() or 0

    # Assessment attempts
    attempt_count = await db.execute(
        select(func.count(AssessmentAttempt.id)).where(AssessmentAttempt.status == "completed")
    )
    completed_assessments = attempt_count.scalar() or 0

    return DashboardStats(
        stats={
            "total_users": total_users,
            "active_users": active_users,
            "users_by_role": user_counts,
            "total_applications": total_applications,
            "active_listings": active_listings,
            "total_analyses": total_analyses,
            "completed_assessments": completed_assessments,
        },
        recent_activity=[],
        charts_data={
            "user_growth": [],
            "application_trends": [],
        }
    )


@router.get("/users", response_model=List[UserRead])
async def get_users(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(["admin"])),
    role: Optional[str] = None,
    is_active: Optional[bool] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    query = select(User)

    if role:
        query = query.where(User.role == role)
    if is_active is not None:
        query = query.where(User.is_active == is_active)
    if search:
        query = query.where(
            User.email.ilike(f"%{search}%") |
            User.first_name.ilike(f"%{search}%") |
            User.last_name.ilike(f"%{search}%")
        )

    query = query.order_by(User.created_at.desc())
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)

    result = await db.execute(query)
    return result.scalars().all()


@router.put("/users/{user_id}", response_model=UserRead)
async def update_user(
    user_id: int,
    data: UserAdminUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(["admin"]))
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    for key, value in data.model_dump(exclude_unset=True).items():
        if key == "role" and value:
            setattr(user, key, UserRole(value))
        else:
            setattr(user, key, value)

    await db.flush()
    return user


@router.post("/users/{user_id}/suspend", response_model=MessageResponse)
async def suspend_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(["admin"]))
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = False
    await db.flush()
    return MessageResponse(message="User suspended")


@router.post("/users/{user_id}/activate", response_model=MessageResponse)
async def activate_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(["admin"]))
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = True
    await db.flush()
    return MessageResponse(message="User activated")


@router.get("/settings")
async def get_settings(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(["admin"]))
):
    result = await db.execute(select(AdminSettings))
    settings = result.scalars().all()
    return {s.key: {"value": s.value, "description": s.description} for s in settings}


@router.put("/settings/{key}")
async def update_setting(
    key: str,
    value: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(["admin"]))
):
    result = await db.execute(select(AdminSettings).where(AdminSettings.key == key))
    setting = result.scalar_one_or_none()
    if setting:
        setting.value = value.get("value")
    else:
        setting = AdminSettings(key=key, value=value.get("value"), description=value.get("description"))
        db.add(setting)
    await db.flush()
    return {"key": key, "value": setting.value}


@router.get("/analytics")
async def get_analytics(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(["admin"]))
):
    # User registration over time
    users_by_month = []
    user_result = await db.execute(
        select(User).order_by(User.created_at)
    )
    users = user_result.scalars().all()

    # Application status distribution
    status_dist = {}
    for s in ["pending", "reviewed", "shortlisted", "interview", "offered", "accepted", "rejected"]:
        cnt = await db.execute(
            select(func.count(Application.id)).where(Application.status == s)
        )
        status_dist[s] = cnt.scalar() or 0

    return {
        "users_by_role": {
            role.value: sum(1 for u in users if u.role == role)
            for role in UserRole
        },
        "application_status_distribution": status_dist,
        "total_users": len(users),
        "total_applications": sum(status_dist.values()),
    }
