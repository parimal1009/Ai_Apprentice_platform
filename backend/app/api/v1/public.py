from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import Optional, List
from datetime import datetime, timezone

from app.core.database import get_db
from app.models.models import (
    ApprenticeshipListing, Assessment, AssessmentQuestion, AssessmentAttempt, CompanyProfile
)
from app.schemas.schemas import (
    ListingRead, AssessmentRead, AssessmentQuestionRead, AssessmentSubmission
)

router = APIRouter(tags=["Public"])


# --- Public Listings ---

@router.get("/listings", response_model=List[ListingRead])
async def browse_listings(
    db: AsyncSession = Depends(get_db),
    sector: Optional[str] = None,
    location: Optional[str] = None,
    work_type: Optional[str] = None,
    level: Optional[str] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    query = (
        select(ApprenticeshipListing)
        .options(selectinload(ApprenticeshipListing.company).selectinload(CompanyProfile.user))
        .where(ApprenticeshipListing.is_active == True)
    )

    if sector:
        query = query.where(ApprenticeshipListing.sector.ilike(f"%{sector}%"))
    if location:
        query = query.where(ApprenticeshipListing.location.ilike(f"%{location}%"))
    if work_type:
        query = query.where(ApprenticeshipListing.work_type == work_type)
    if level:
        query = query.where(ApprenticeshipListing.level == level)
    if search:
        query = query.where(
            ApprenticeshipListing.title.ilike(f"%{search}%") |
            ApprenticeshipListing.description.ilike(f"%{search}%")
        )

    offset = (page - 1) * page_size
    query = query.order_by(ApprenticeshipListing.created_at.desc()).offset(offset).limit(page_size)

    result = await db.execute(query)
    return result.scalars().all()


@router.get("/listings/{listing_id}", response_model=ListingRead)
async def get_listing(
    listing_id: int,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(ApprenticeshipListing)
        .options(selectinload(ApprenticeshipListing.company).selectinload(CompanyProfile.user))
        .where(ApprenticeshipListing.id == listing_id)
    )
    listing = result.scalar_one_or_none()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    return listing


# --- Assessment Taking Flow ---

@router.get("/assessment/take/{token}")
async def get_assessment_by_token(
    token: str,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(AssessmentAttempt).where(AssessmentAttempt.token == token)
    )
    attempt = result.scalar_one_or_none()
    if not attempt:
        raise HTTPException(status_code=404, detail="Invalid assessment link")

    if attempt.status == "completed":
        raise HTTPException(status_code=400, detail="Assessment already completed")

    if attempt.status == "expired":
        raise HTTPException(status_code=400, detail="Assessment link has expired")

    # Get assessment with questions
    assessment_result = await db.execute(
        select(Assessment)
        .options(selectinload(Assessment.questions))
        .where(Assessment.id == attempt.assessment_id)
    )
    assessment = assessment_result.scalar_one_or_none()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    # Mark as in progress
    if attempt.status == "pending":
        attempt.status = "in_progress"
        attempt.started_at = datetime.now(timezone.utc)
        await db.flush()

    # Return questions without correct answers
    questions = []
    for q in assessment.questions:
        questions.append({
            "id": q.id,
            "question_text": q.question_text,
            "question_type": q.question_type,
            "options": q.options,
            "points": q.points,
            "order": q.order,
        })

    return {
        "attempt_id": attempt.id,
        "assessment": {
            "id": assessment.id,
            "title": assessment.title,
            "reference_code": assessment.reference_code,
            "description": assessment.description,
            "time_limit_minutes": assessment.time_limit_minutes,
            "pass_score": assessment.pass_score,
        },
        "questions": sorted(questions, key=lambda x: x["order"]),
        "status": attempt.status,
        "started_at": attempt.started_at,
    }


@router.post("/assessment/take/{token}/submit")
async def submit_assessment(
    token: str,
    data: AssessmentSubmission,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(AssessmentAttempt).where(AssessmentAttempt.token == token)
    )
    attempt = result.scalar_one_or_none()
    if not attempt:
        raise HTTPException(status_code=404, detail="Invalid assessment link")

    if attempt.status == "completed":
        raise HTTPException(status_code=400, detail="Assessment already submitted")

    # Get questions
    questions_result = await db.execute(
        select(AssessmentQuestion).where(AssessmentQuestion.assessment_id == attempt.assessment_id)
    )
    questions = questions_result.scalars().all()

    # Calculate score
    total_points = 0
    earned_points = 0
    for q in questions:
        total_points += q.points
        answer = data.answers.get(str(q.id))
        if answer is not None and int(answer) == q.correct_answer:
            earned_points += q.points

    score = (earned_points / total_points * 100) if total_points > 0 else 0

    # Get assessment pass score
    assessment_result = await db.execute(
        select(Assessment).where(Assessment.id == attempt.assessment_id)
    )
    assessment = assessment_result.scalar_one_or_none()
    pass_score = assessment.pass_score if assessment else 70

    attempt.answers = data.answers
    attempt.score = round(score, 1)
    attempt.total_points = total_points
    attempt.passed = score >= pass_score
    attempt.completed_at = datetime.now(timezone.utc)
    attempt.status = "completed"
    await db.flush()

    return {
        "score": round(score, 1),
        "total_points": total_points,
        "earned_points": earned_points,
        "passed": attempt.passed,
        "pass_score": pass_score,
    }
