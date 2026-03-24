from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from typing import Optional, List
import secrets

from app.core.database import get_db
from app.core.deps import require_roles
from app.models.user import User
from app.models.models import (
    TrainingProviderProfile, ApprenticeshipType, Cohort, CohortMember,
    ApprenticeProfile, Assessment, AssessmentQuestion, AssessmentAttempt,
    Collaboration, CompanyProfile
)
from app.schemas.schemas import (
    ProviderProfileRead, ProviderProfileUpdate,
    ApprenticeshipTypeCreate, ApprenticeshipTypeRead,
    CohortCreate, CohortRead, CohortUpdate,
    CohortMemberCreate, CohortMemberRead,
    AssessmentCreate, AssessmentRead, AssessmentAttemptRead,
    ApprenticeProfileRead, DashboardStats, MessageResponse
)

router = APIRouter(prefix="/provider", tags=["Training Provider"])


@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(["training_provider"]))
):
    profile_result = await db.execute(
        select(TrainingProviderProfile).where(TrainingProviderProfile.user_id == current_user.id)
    )
    profile = profile_result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    # Cohort stats
    cohort_count = await db.execute(
        select(func.count(Cohort.id)).where(Cohort.provider_id == profile.id)
    )
    total_cohorts = cohort_count.scalar() or 0

    active_cohorts = await db.execute(
        select(func.count(Cohort.id)).where(
            Cohort.provider_id == profile.id,
            Cohort.status == "active"
        )
    )
    active = active_cohorts.scalar() or 0

    # Total apprentices across cohorts
    apprentice_count = await db.execute(
        select(func.count(CohortMember.id))
        .join(Cohort)
        .where(Cohort.provider_id == profile.id)
    )
    total_apprentices = apprentice_count.scalar() or 0

    # Completion rate
    completed_count = await db.execute(
        select(func.count(CohortMember.id))
        .join(Cohort)
        .where(
            Cohort.provider_id == profile.id,
            CohortMember.status == "completed"
        )
    )
    completed = completed_count.scalar() or 0
    completion_rate = (completed / total_apprentices * 100) if total_apprentices > 0 else 0

    # Collaborations
    collab_count = await db.execute(
        select(func.count(Collaboration.id)).where(Collaboration.provider_id == profile.id)
    )
    collaborations = collab_count.scalar() or 0

    return DashboardStats(
        stats={
            "total_cohorts": total_cohorts,
            "active_cohorts": active,
            "total_apprentices": total_apprentices,
            "completion_rate": round(completion_rate, 1),
            "collaborating_employers": collaborations,
        },
        recent_activity=[],
        charts_data={}
    )


@router.get("/profile", response_model=ProviderProfileRead)
async def get_profile(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(["training_provider"]))
):
    result = await db.execute(
        select(TrainingProviderProfile)
        .options(selectinload(TrainingProviderProfile.user))
        .where(TrainingProviderProfile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


@router.put("/profile", response_model=ProviderProfileRead)
async def update_profile(
    data: ProviderProfileUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(["training_provider"]))
):
    result = await db.execute(
        select(TrainingProviderProfile).where(TrainingProviderProfile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(profile, key, value)
    await db.flush()
    return profile


# --- Apprenticeship Types ---

@router.post("/apprenticeship-types", response_model=ApprenticeshipTypeRead, status_code=201)
async def create_apprenticeship_type(
    data: ApprenticeshipTypeCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(["training_provider"]))
):
    profile_result = await db.execute(
        select(TrainingProviderProfile).where(TrainingProviderProfile.user_id == current_user.id)
    )
    profile = profile_result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    at = ApprenticeshipType(provider_id=profile.id, **data.model_dump())
    db.add(at)
    await db.flush()
    return at


@router.get("/apprenticeship-types", response_model=List[ApprenticeshipTypeRead])
async def get_apprenticeship_types(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(["training_provider"]))
):
    profile_result = await db.execute(
        select(TrainingProviderProfile).where(TrainingProviderProfile.user_id == current_user.id)
    )
    profile = profile_result.scalar_one_or_none()
    if not profile:
        return []

    result = await db.execute(
        select(ApprenticeshipType).where(ApprenticeshipType.provider_id == profile.id)
    )
    return result.scalars().all()


# --- Cohorts ---

@router.post("/cohorts", response_model=CohortRead, status_code=201)
async def create_cohort(
    data: CohortCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(["training_provider"]))
):
    profile_result = await db.execute(
        select(TrainingProviderProfile).where(TrainingProviderProfile.user_id == current_user.id)
    )
    profile = profile_result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    cohort = Cohort(provider_id=profile.id, **data.model_dump())
    db.add(cohort)
    await db.flush()
    return cohort


@router.get("/cohorts", response_model=List[CohortRead])
async def get_cohorts(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(["training_provider"]))
):
    profile_result = await db.execute(
        select(TrainingProviderProfile).where(TrainingProviderProfile.user_id == current_user.id)
    )
    profile = profile_result.scalar_one_or_none()
    if not profile:
        return []

    result = await db.execute(
        select(Cohort)
        .where(Cohort.provider_id == profile.id)
        .order_by(Cohort.created_at.desc())
    )
    return result.scalars().all()


@router.get("/cohorts/{cohort_id}", response_model=CohortRead)
async def get_cohort(
    cohort_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(["training_provider"]))
):
    profile_result = await db.execute(
        select(TrainingProviderProfile).where(TrainingProviderProfile.user_id == current_user.id)
    )
    profile = profile_result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    result = await db.execute(
        select(Cohort).where(Cohort.id == cohort_id, Cohort.provider_id == profile.id)
    )
    cohort = result.scalar_one_or_none()
    if not cohort:
        raise HTTPException(status_code=404, detail="Cohort not found")
    return cohort


@router.put("/cohorts/{cohort_id}", response_model=CohortRead)
async def update_cohort(
    cohort_id: int,
    data: CohortUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(["training_provider"]))
):
    profile_result = await db.execute(
        select(TrainingProviderProfile).where(TrainingProviderProfile.user_id == current_user.id)
    )
    profile = profile_result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    result = await db.execute(
        select(Cohort).where(Cohort.id == cohort_id, Cohort.provider_id == profile.id)
    )
    cohort = result.scalar_one_or_none()
    if not cohort:
        raise HTTPException(status_code=404, detail="Cohort not found")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(cohort, key, value)
    await db.flush()
    return cohort


@router.post("/cohorts/{cohort_id}/members", response_model=CohortMemberRead, status_code=201)
async def add_cohort_member(
    cohort_id: int,
    data: CohortMemberCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(["training_provider"]))
):
    profile_result = await db.execute(
        select(TrainingProviderProfile).where(TrainingProviderProfile.user_id == current_user.id)
    )
    profile = profile_result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    # Verify cohort belongs to provider
    cohort_result = await db.execute(
        select(Cohort).where(Cohort.id == cohort_id, Cohort.provider_id == profile.id)
    )
    if not cohort_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Cohort not found")

    member = CohortMember(cohort_id=cohort_id, apprentice_id=data.apprentice_id)
    db.add(member)
    await db.flush()
    return member


@router.get("/cohorts/{cohort_id}/members", response_model=List[CohortMemberRead])
async def get_cohort_members(
    cohort_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(["training_provider"]))
):
    result = await db.execute(
        select(CohortMember)
        .options(selectinload(CohortMember.apprentice).selectinload(ApprenticeProfile.user))
        .where(CohortMember.cohort_id == cohort_id)
    )
    return result.scalars().all()


# --- Assessments ---

@router.post("/assessments", response_model=AssessmentRead, status_code=201)
async def create_assessment(
    data: AssessmentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(["training_provider", "admin"]))
):
    assessment = Assessment(
        title=data.title,
        reference_code=data.reference_code,
        description=data.description,
        apprenticeship_type_id=data.apprenticeship_type_id,
        time_limit_minutes=data.time_limit_minutes,
        pass_score=data.pass_score,
    )
    db.add(assessment)
    await db.flush()

    for i, q in enumerate(data.questions):
        question = AssessmentQuestion(
            assessment_id=assessment.id,
            question_text=q.question_text,
            question_type=q.question_type,
            options=q.options,
            correct_answer=q.correct_answer,
            explanation=q.explanation,
            points=q.points,
            order=i,
        )
        db.add(question)

    await db.flush()
    return assessment


@router.get("/assessments", response_model=List[AssessmentRead])
async def get_assessments(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(["training_provider", "admin"]))
):
    result = await db.execute(
        select(Assessment).order_by(Assessment.created_at.desc())
    )
    return result.scalars().all()


@router.post("/assessments/{assessment_id}/send-link", response_model=dict)
async def send_assessment_link(
    assessment_id: int,
    apprentice_id: int,
    cohort_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(["training_provider", "admin"]))
):
    # Generate secure token
    token = secrets.token_urlsafe(32)

    attempt = AssessmentAttempt(
        assessment_id=assessment_id,
        apprentice_id=apprentice_id,
        cohort_id=cohort_id,
        token=token,
        status="pending",
    )
    db.add(attempt)
    await db.flush()

    link = f"/assessment/take/{token}"
    return {"link": link, "token": token}


@router.get("/assessments/{assessment_id}/results", response_model=List[AssessmentAttemptRead])
async def get_assessment_results(
    assessment_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(["training_provider", "admin"]))
):
    result = await db.execute(
        select(AssessmentAttempt).where(AssessmentAttempt.assessment_id == assessment_id)
    )
    return result.scalars().all()


# --- Collaborations ---

@router.get("/collaborations")
async def get_collaborations(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(["training_provider"]))
):
    profile_result = await db.execute(
        select(TrainingProviderProfile).where(TrainingProviderProfile.user_id == current_user.id)
    )
    profile = profile_result.scalar_one_or_none()
    if not profile:
        return []

    result = await db.execute(
        select(Collaboration)
        .options(selectinload(Collaboration.company).selectinload(CompanyProfile.user))
        .where(Collaboration.provider_id == profile.id)
    )
    return result.scalars().all()
