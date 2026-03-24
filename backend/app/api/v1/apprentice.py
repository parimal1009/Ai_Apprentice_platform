from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from typing import Optional, List

from app.core.database import get_db
from app.core.deps import get_current_user, require_roles
from app.models.user import User
from app.models.models import (
    ApprenticeProfile, Application, ApprenticeshipListing,
    PsychometricResult, AnalysisJob, AnalysisResult, CohortMember, AssessmentAttempt
)
from app.schemas.schemas import (
    ApprenticeProfileRead, ApprenticeProfileUpdate,
    ApplicationCreate, ApplicationRead,
    PsychometricResultRead, PsychometricSubmission,
    AnalysisJobRead, AnalysisResultRead,
    DashboardStats, MessageResponse, PaginatedResponse
)
from app.services.psychometric import calculate_ocean_scores

router = APIRouter(prefix="/apprentice", tags=["Apprentice"])


def compute_profile_completeness(profile: ApprenticeProfile) -> int:
    fields = [
        profile.phone, profile.city, profile.headline, profile.bio,
        profile.skills, profile.education, profile.work_experience,
        profile.languages, profile.availability, profile.career_interests,
        profile.cv_url
    ]
    filled = sum(1 for f in fields if f and (not isinstance(f, list) or len(f) > 0))
    return int((filled / len(fields)) * 100)


@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(["apprentice"]))
):
    profile_result = await db.execute(
        select(ApprenticeProfile).where(ApprenticeProfile.user_id == current_user.id)
    )
    profile = profile_result.scalar_one_or_none()

    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    # Application stats
    app_count = await db.execute(
        select(func.count(Application.id)).where(Application.apprentice_id == profile.id)
    )
    total_applications = app_count.scalar() or 0

    pending_count = await db.execute(
        select(func.count(Application.id)).where(
            Application.apprentice_id == profile.id,
            Application.status == "pending"
        )
    )
    pending = pending_count.scalar() or 0

    # Psychometric
    psych = await db.execute(
        select(PsychometricResult).where(
            PsychometricResult.apprentice_id == profile.id
        ).order_by(PsychometricResult.completed_at.desc()).limit(1)
    )
    latest_psych = psych.scalar_one_or_none()

    # Analysis count
    analysis_count = await db.execute(
        select(func.count(AnalysisJob.id)).where(AnalysisJob.apprentice_id == profile.id)
    )
    analyses = analysis_count.scalar() or 0

    # Assessment attempts
    attempt_count = await db.execute(
        select(func.count(AssessmentAttempt.id)).where(
            AssessmentAttempt.apprentice_id == profile.id,
            AssessmentAttempt.status == "completed"
        )
    )
    completed_assessments = attempt_count.scalar() or 0

    completeness = compute_profile_completeness(profile)

    return DashboardStats(
        stats={
            "profile_completeness": completeness,
            "total_applications": total_applications,
            "pending_applications": pending,
            "total_analyses": analyses,
            "completed_assessments": completed_assessments,
            "personality_completed": latest_psych is not None,
        },
        recent_activity=[],
        charts_data={
            "personality_scores": latest_psych.scores if latest_psych else None,
            "skills": profile.skills or [],
        }
    )


@router.get("/profile", response_model=ApprenticeProfileRead)
async def get_profile(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(["apprentice"]))
):
    result = await db.execute(
        select(ApprenticeProfile)
        .options(selectinload(ApprenticeProfile.user))
        .where(ApprenticeProfile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    profile.profile_completeness = compute_profile_completeness(profile)
    return profile


@router.put("/profile", response_model=ApprenticeProfileRead)
async def update_profile(
    data: ApprenticeProfileUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(["apprentice"]))
):
    result = await db.execute(
        select(ApprenticeProfile).where(ApprenticeProfile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(profile, key, value)

    profile.profile_completeness = compute_profile_completeness(profile)
    await db.flush()
    return profile


@router.post("/applications", response_model=ApplicationRead, status_code=201)
async def create_application(
    data: ApplicationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(["apprentice"]))
):
    profile_result = await db.execute(
        select(ApprenticeProfile).where(ApprenticeProfile.user_id == current_user.id)
    )
    profile = profile_result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    # Check listing exists
    listing_result = await db.execute(
        select(ApprenticeshipListing).where(
            ApprenticeshipListing.id == data.listing_id,
            ApprenticeshipListing.is_active == True
        )
    )
    listing = listing_result.scalar_one_or_none()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found or inactive")

    # Check for duplicate application
    existing = await db.execute(
        select(Application).where(
            Application.apprentice_id == profile.id,
            Application.listing_id == data.listing_id
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Already applied to this listing")

    application = Application(
        apprentice_id=profile.id,
        listing_id=data.listing_id,
        cover_letter=data.cover_letter,
    )
    db.add(application)
    await db.flush()

    return application


@router.get("/applications", response_model=List[ApplicationRead])
async def get_applications(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(["apprentice"]))
):
    profile_result = await db.execute(
        select(ApprenticeProfile).where(ApprenticeProfile.user_id == current_user.id)
    )
    profile = profile_result.scalar_one_or_none()
    if not profile:
        return []

    result = await db.execute(
        select(Application)
        .options(selectinload(Application.listing))
        .where(Application.apprentice_id == profile.id)
        .order_by(Application.applied_at.desc())
    )
    return result.scalars().all()


@router.post("/psychometric", response_model=PsychometricResultRead)
async def submit_psychometric(
    data: PsychometricSubmission,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(["apprentice"]))
):
    profile_result = await db.execute(
        select(ApprenticeProfile).where(ApprenticeProfile.user_id == current_user.id)
    )
    profile = profile_result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    scores, normalized, strengths, growth_areas, explanations = calculate_ocean_scores(data.answers)

    result = PsychometricResult(
        apprentice_id=profile.id,
        test_type="ocean",
        answers=data.answers,
        scores=scores,
        normalized_scores=normalized,
        strengths=strengths,
        growth_areas=growth_areas,
        trait_explanations=explanations,
    )
    db.add(result)
    await db.flush()

    return result


@router.get("/psychometric", response_model=Optional[PsychometricResultRead])
async def get_psychometric(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(["apprentice"]))
):
    profile_result = await db.execute(
        select(ApprenticeProfile).where(ApprenticeProfile.user_id == current_user.id)
    )
    profile = profile_result.scalar_one_or_none()
    if not profile:
        return None

    result = await db.execute(
        select(PsychometricResult)
        .where(PsychometricResult.apprentice_id == profile.id)
        .order_by(PsychometricResult.completed_at.desc())
        .limit(1)
    )
    return result.scalar_one_or_none()


@router.get("/analyses", response_model=List[AnalysisJobRead])
async def get_analyses(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(["apprentice"]))
):
    profile_result = await db.execute(
        select(ApprenticeProfile).where(ApprenticeProfile.user_id == current_user.id)
    )
    profile = profile_result.scalar_one_or_none()
    if not profile:
        return []

    result = await db.execute(
        select(AnalysisJob)
        .where(AnalysisJob.apprentice_id == profile.id)
        .order_by(AnalysisJob.created_at.desc())
    )
    return result.scalars().all()


@router.get("/analyses/{job_id}/result", response_model=Optional[AnalysisResultRead])
async def get_analysis_result(
    job_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(["apprentice"]))
):
    profile_result = await db.execute(
        select(ApprenticeProfile).where(ApprenticeProfile.user_id == current_user.id)
    )
    profile = profile_result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    job_result = await db.execute(
        select(AnalysisJob).where(
            AnalysisJob.id == job_id,
            AnalysisJob.apprentice_id == profile.id,
        )
    )
    job = job_result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Analysis job not found")

    result = await db.execute(
        select(AnalysisResult).where(AnalysisResult.job_id == job.id)
    )
    return result.scalar_one_or_none()
