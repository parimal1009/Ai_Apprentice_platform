from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
import os
import uuid
from datetime import datetime, timezone

from app.core.database import get_db
from app.core.deps import require_roles
from app.core.config import settings
from app.models.user import User
from app.models.models import (
    ApprenticeProfile, AnalysisJob, AnalysisResult, UploadedFile
)
from app.schemas.schemas import AnalysisJobCreate, AnalysisJobRead, AnalysisResultRead, MessageResponse

router = APIRouter(prefix="/analysis", tags=["Analysis"])

ALLOWED_MIME_TYPES = {
    "pdf": ["application/pdf"],
    "audio": ["audio/mpeg", "audio/wav", "audio/ogg", "audio/webm", "audio/mp4"],
    "video": ["video/mp4", "video/webm", "video/ogg", "video/quicktime"],
    "image": ["image/jpeg", "image/png", "image/webp"],
}


async def run_analysis_pipeline(job_id: int, input_type: str, input_text: Optional[str], file_path: Optional[str]):
    """Background task to run the analysis pipeline."""
    from app.core.database import async_session_factory
    from app.ai.pipeline import run_analysis

    async with async_session_factory() as db:
        try:
            job_result = await db.execute(select(AnalysisJob).where(AnalysisJob.id == job_id))
            job = job_result.scalar_one_or_none()
            if not job:
                return

            job.status = "processing"
            await db.commit()

            # Run the AI analysis pipeline
            result_data = await run_analysis(input_type, input_text, file_path)

            analysis_result = AnalysisResult(
                job_id=job.id,
                extracted_text=result_data.get("extracted_text"),
                candidate_summary=result_data.get("candidate_summary"),
                skills_detected=result_data.get("skills_detected", []),
                education_detected=result_data.get("education_detected", []),
                experience_detected=result_data.get("experience_detected", []),
                personality_scores=result_data.get("personality_scores"),
                ai_insights=result_data.get("ai_insights"),
                report_data=result_data.get("report_data"),
                confidence_score=result_data.get("confidence_score"),
            )
            db.add(analysis_result)

            job.status = "completed"
            job.completed_at = datetime.now(timezone.utc)
            await db.commit()

        except Exception as e:
            job.status = "failed"
            job.error_message = str(e)
            await db.commit()


@router.post("/analyze/text", response_model=AnalysisJobRead, status_code=201)
async def analyze_text(
    data: AnalysisJobCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(["apprentice", "company", "admin"]))
):
    if data.input_type != "text" or not data.input_text:
        raise HTTPException(status_code=400, detail="Text input required")

    # Get apprentice profile
    profile_result = await db.execute(
        select(ApprenticeProfile).where(ApprenticeProfile.user_id == current_user.id)
    )
    profile = profile_result.scalar_one_or_none()

    # For non-apprentice users, create a temporary reference
    apprentice_id = profile.id if profile else 1

    job = AnalysisJob(
        apprentice_id=apprentice_id,
        input_type="text",
        input_text=data.input_text,
        status="pending",
    )
    db.add(job)
    await db.commit()
    await db.refresh(job)

    job_id = job.id
    background_tasks.add_task(run_analysis_pipeline, job_id, "text", data.input_text, None)

    return job


@router.post("/analyze/file", response_model=AnalysisJobRead, status_code=201)
async def analyze_file(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    input_type: str = Form(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(["apprentice", "company", "admin"]))
):
    if input_type not in ["pdf", "audio", "video"]:
        raise HTTPException(status_code=400, detail="Invalid input type")

    # Validate MIME type
    allowed = ALLOWED_MIME_TYPES.get(input_type, [])
    if file.content_type not in allowed:
        raise HTTPException(status_code=400, detail=f"Invalid file type: {file.content_type}")

    # Check file size
    max_size = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    content = await file.read()
    if len(content) > max_size:
        raise HTTPException(status_code=400, detail=f"File too large. Max: {settings.MAX_UPLOAD_SIZE_MB}MB")

    # Save file
    ext = os.path.splitext(file.filename)[1] if file.filename else ".bin"
    filename = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, filename)
    os.makedirs(os.path.dirname(file_path), exist_ok=True)

    with open(file_path, "wb") as f:
        f.write(content)

    # Save file record
    uploaded = UploadedFile(
        user_id=current_user.id,
        filename=filename,
        original_filename=file.filename or "upload",
        file_type=input_type,
        mime_type=file.content_type or "application/octet-stream",
        file_size=len(content),
        file_url=f"/uploads/{filename}",
    )
    db.add(uploaded)

    # Get apprentice profile
    profile_result = await db.execute(
        select(ApprenticeProfile).where(ApprenticeProfile.user_id == current_user.id)
    )
    profile = profile_result.scalar_one_or_none()
    apprentice_id = profile.id if profile else 1

    job = AnalysisJob(
        apprentice_id=apprentice_id,
        input_type=input_type,
        input_file_url=f"/uploads/{filename}",
        status="pending",
    )
    db.add(job)
    await db.commit()
    await db.refresh(job)

    job_id = job.id
    background_tasks.add_task(run_analysis_pipeline, job_id, input_type, None, file_path)

    return job


@router.get("/jobs/{job_id}", response_model=AnalysisJobRead)
async def get_job_status(
    job_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(["apprentice", "company", "admin"]))
):
    result = await db.execute(select(AnalysisJob).where(AnalysisJob.id == job_id))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.get("/jobs/{job_id}/result", response_model=AnalysisResultRead)
async def get_job_result(
    job_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(["apprentice", "company", "admin"]))
):
    result = await db.execute(
        select(AnalysisResult).where(AnalysisResult.job_id == job_id)
    )
    analysis = result.scalar_one_or_none()
    if not analysis:
        raise HTTPException(status_code=404, detail="Result not found")
    return analysis
