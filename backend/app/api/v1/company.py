from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from sqlalchemy.orm import selectinload
from typing import Optional, List

from app.core.database import get_db
from app.core.deps import require_roles
from app.models.user import User
from app.models.models import (
    CompanyProfile, ApprenticeshipListing, Application,
    ApprenticeProfile, Shortlist
)
from app.schemas.schemas import (
    CompanyProfileRead, CompanyProfileUpdate,
    ListingCreate, ListingRead, ListingUpdate,
    ApplicationRead, ApplicationStatusUpdate,
    ApprenticeProfileRead, DashboardStats, MessageResponse
)

router = APIRouter(prefix="/company", tags=["Company"])


@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(["company"]))
):
    profile_result = await db.execute(
        select(CompanyProfile).where(CompanyProfile.user_id == current_user.id)
    )
    profile = profile_result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    # Active listings
    listing_count = await db.execute(
        select(func.count(ApprenticeshipListing.id)).where(
            ApprenticeshipListing.company_id == profile.id,
            ApprenticeshipListing.is_active == True
        )
    )
    active_listings = listing_count.scalar() or 0

    # Total applications
    app_count = await db.execute(
        select(func.count(Application.id))
        .join(ApprenticeshipListing)
        .where(ApprenticeshipListing.company_id == profile.id)
    )
    total_applications = app_count.scalar() or 0

    # Shortlisted count
    shortlist_count = await db.execute(
        select(func.count(Shortlist.id)).where(Shortlist.company_id == profile.id)
    )
    shortlisted = shortlist_count.scalar() or 0

    # Application status breakdown
    status_breakdown = {}
    for s in ["pending", "reviewed", "shortlisted", "interview", "offered", "accepted", "rejected"]:
        cnt = await db.execute(
            select(func.count(Application.id))
            .join(ApprenticeshipListing)
            .where(
                ApprenticeshipListing.company_id == profile.id,
                Application.status == s
            )
        )
        status_breakdown[s] = cnt.scalar() or 0

    return DashboardStats(
        stats={
            "active_listings": active_listings,
            "total_applications": total_applications,
            "shortlisted": shortlisted,
            "application_funnel": status_breakdown,
        },
        recent_activity=[],
        charts_data={
            "monthly_applications": [],
            "skill_demand": profile.required_skills or [],
        }
    )


@router.get("/profile", response_model=CompanyProfileRead)
async def get_profile(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(["company"]))
):
    result = await db.execute(
        select(CompanyProfile)
        .options(selectinload(CompanyProfile.user))
        .where(CompanyProfile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


@router.put("/profile", response_model=CompanyProfileRead)
async def update_profile(
    data: CompanyProfileUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(["company"]))
):
    result = await db.execute(
        select(CompanyProfile).where(CompanyProfile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(profile, key, value)

    await db.flush()
    return profile


@router.post("/listings", response_model=ListingRead, status_code=201)
async def create_listing(
    data: ListingCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(["company"]))
):
    profile_result = await db.execute(
        select(CompanyProfile).where(CompanyProfile.user_id == current_user.id)
    )
    profile = profile_result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Company profile not found")

    listing = ApprenticeshipListing(
        company_id=profile.id,
        **data.model_dump()
    )
    db.add(listing)
    await db.flush()
    return listing


@router.get("/listings", response_model=List[ListingRead])
async def get_listings(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(["company"]))
):
    profile_result = await db.execute(
        select(CompanyProfile).where(CompanyProfile.user_id == current_user.id)
    )
    profile = profile_result.scalar_one_or_none()
    if not profile:
        return []

    result = await db.execute(
        select(ApprenticeshipListing)
        .where(ApprenticeshipListing.company_id == profile.id)
        .order_by(ApprenticeshipListing.created_at.desc())
    )
    return result.scalars().all()


@router.put("/listings/{listing_id}", response_model=ListingRead)
async def update_listing(
    listing_id: int,
    data: ListingUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(["company"]))
):
    profile_result = await db.execute(
        select(CompanyProfile).where(CompanyProfile.user_id == current_user.id)
    )
    profile = profile_result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    result = await db.execute(
        select(ApprenticeshipListing).where(
            ApprenticeshipListing.id == listing_id,
            ApprenticeshipListing.company_id == profile.id
        )
    )
    listing = result.scalar_one_or_none()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(listing, key, value)

    await db.flush()
    return listing


@router.get("/applications", response_model=List[ApplicationRead])
async def get_applications(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(["company"])),
    listing_id: Optional[int] = None,
    status_filter: Optional[str] = None,
):
    profile_result = await db.execute(
        select(CompanyProfile).where(CompanyProfile.user_id == current_user.id)
    )
    profile = profile_result.scalar_one_or_none()
    if not profile:
        return []

    query = (
        select(Application)
        .join(ApprenticeshipListing)
        .options(
            selectinload(Application.apprentice).selectinload(ApprenticeProfile.user),
            selectinload(Application.listing)
        )
        .where(ApprenticeshipListing.company_id == profile.id)
    )

    if listing_id:
        query = query.where(Application.listing_id == listing_id)
    if status_filter:
        query = query.where(Application.status == status_filter)

    query = query.order_by(Application.applied_at.desc())
    result = await db.execute(query)
    return result.scalars().all()


@router.put("/applications/{application_id}/status", response_model=ApplicationRead)
async def update_application_status(
    application_id: int,
    data: ApplicationStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(["company"]))
):
    profile_result = await db.execute(
        select(CompanyProfile).where(CompanyProfile.user_id == current_user.id)
    )
    profile = profile_result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    result = await db.execute(
        select(Application)
        .join(ApprenticeshipListing)
        .where(
            Application.id == application_id,
            ApprenticeshipListing.company_id == profile.id
        )
    )
    application = result.scalar_one_or_none()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    application.status = data.status
    if data.notes:
        application.notes = data.notes
    await db.flush()
    return application


@router.get("/candidates/search", response_model=List[ApprenticeProfileRead])
async def search_candidates(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(["company"])),
    skills: Optional[str] = None,
    location: Optional[str] = None,
    availability: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    query = select(ApprenticeProfile).options(selectinload(ApprenticeProfile.user))

    if location:
        query = query.where(ApprenticeProfile.city.ilike(f"%{location}%"))
    if availability:
        query = query.where(ApprenticeProfile.availability == availability)

    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)

    result = await db.execute(query)
    candidates = result.scalars().all()

    # Filter by skills in Python (JSON field)
    if skills:
        skill_list = [s.strip().lower() for s in skills.split(",")]
        candidates = [
            c for c in candidates
            if c.skills and any(s.lower() in [sk.lower() for sk in c.skills] for s in skill_list)
        ]

    return candidates


@router.post("/shortlist/{apprentice_id}", response_model=MessageResponse)
async def add_to_shortlist(
    apprentice_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(["company"]))
):
    profile_result = await db.execute(
        select(CompanyProfile).where(CompanyProfile.user_id == current_user.id)
    )
    profile = profile_result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    # Check if already shortlisted
    existing = await db.execute(
        select(Shortlist).where(
            Shortlist.company_id == profile.id,
            Shortlist.apprentice_id == apprentice_id
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Already shortlisted")

    shortlist = Shortlist(company_id=profile.id, apprentice_id=apprentice_id)
    db.add(shortlist)
    await db.flush()
    return MessageResponse(message="Added to shortlist")
