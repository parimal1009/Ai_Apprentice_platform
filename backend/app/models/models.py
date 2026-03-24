import enum
from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, Text, Enum, Float,
    ForeignKey, JSON, Index, Date
)
from sqlalchemy.orm import relationship
from app.core.database import Base


class ApprenticeProfile(Base):
    __tablename__ = "apprentice_profiles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)

    # Personal
    phone = Column(String(20), nullable=True)
    date_of_birth = Column(Date, nullable=True)
    address_line1 = Column(String(255), nullable=True)
    address_line2 = Column(String(255), nullable=True)
    city = Column(String(100), nullable=True)
    postcode = Column(String(20), nullable=True)
    country = Column(String(100), default="United Kingdom")

    # Professional
    headline = Column(String(255), nullable=True)
    bio = Column(Text, nullable=True)
    skills = Column(JSON, default=list)  # ["Python", "JavaScript"]
    education = Column(JSON, default=list)  # [{institution, qualification, year}]
    work_experience = Column(JSON, default=list)  # [{company, role, duration, description}]
    languages = Column(JSON, default=list)  # ["English", "Spanish"]
    certifications = Column(JSON, default=list)

    # Preferences
    availability = Column(String(50), nullable=True)  # immediate, 1_month, 3_months
    career_interests = Column(JSON, default=list)
    preferred_location = Column(String(100), nullable=True)
    work_preference = Column(String(50), nullable=True)  # remote, hybrid, onsite
    apprenticeship_level = Column(String(50), nullable=True)  # level_2, level_3, etc.

    # Files
    cv_url = Column(String(500), nullable=True)
    profile_photo_url = Column(String(500), nullable=True)
    video_intro_url = Column(String(500), nullable=True)

    # Computed
    profile_completeness = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="apprentice_profile")
    applications = relationship("Application", back_populates="apprentice", cascade="all, delete-orphan")
    psychometric_results = relationship("PsychometricResult", back_populates="apprentice", cascade="all, delete-orphan")
    analysis_jobs = relationship("AnalysisJob", back_populates="apprentice", cascade="all, delete-orphan")
    cohort_memberships = relationship("CohortMember", back_populates="apprentice", cascade="all, delete-orphan")
    assessment_attempts = relationship("AssessmentAttempt", back_populates="apprentice", cascade="all, delete-orphan")


class CompanyProfile(Base):
    __tablename__ = "company_profiles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)

    company_name = Column(String(255), nullable=False, default="")
    industry = Column(String(100), nullable=True)
    company_size = Column(String(50), nullable=True)  # 1-10, 11-50, 51-200, 201-500, 500+
    website = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)
    address = Column(String(255), nullable=True)
    city = Column(String(100), nullable=True)
    postcode = Column(String(20), nullable=True)
    country = Column(String(100), default="United Kingdom")
    logo_url = Column(String(500), nullable=True)
    contact_email = Column(String(255), nullable=True)
    contact_phone = Column(String(20), nullable=True)
    required_skills = Column(JSON, default=list)
    apprenticeship_interests = Column(JSON, default=list)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="company_profile")
    listings = relationship("ApprenticeshipListing", back_populates="company", cascade="all, delete-orphan")
    shortlists = relationship("Shortlist", back_populates="company", cascade="all, delete-orphan")
    collaborations = relationship("Collaboration", back_populates="company", cascade="all, delete-orphan")


class TrainingProviderProfile(Base):
    __tablename__ = "training_provider_profiles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)

    provider_name = Column(String(255), nullable=False, default="")
    specialisation = Column(String(255), nullable=True)
    ofsted_rating = Column(String(50), nullable=True)
    description = Column(Text, nullable=True)
    address = Column(String(255), nullable=True)
    city = Column(String(100), nullable=True)
    postcode = Column(String(20), nullable=True)
    country = Column(String(100), default="United Kingdom")
    website = Column(String(500), nullable=True)
    logo_url = Column(String(500), nullable=True)
    contact_email = Column(String(255), nullable=True)
    contact_phone = Column(String(20), nullable=True)
    courses = Column(JSON, default=list)
    accreditation_images = Column(JSON, default=list)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="provider_profile")
    cohorts = relationship("Cohort", back_populates="provider", cascade="all, delete-orphan")
    apprenticeship_types = relationship("ApprenticeshipType", back_populates="provider", cascade="all, delete-orphan")
    collaborations = relationship("Collaboration", back_populates="provider", cascade="all, delete-orphan")


class ApprenticeshipType(Base):
    __tablename__ = "apprenticeship_types"

    id = Column(Integer, primary_key=True, autoincrement=True)
    provider_id = Column(Integer, ForeignKey("training_provider_profiles.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    reference_code = Column(String(50), nullable=False, unique=True)
    level = Column(String(50), nullable=False)  # Level 2, Level 3, etc.
    description = Column(Text, nullable=True)
    duration_months = Column(Integer, nullable=True)
    sector = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    provider = relationship("TrainingProviderProfile", back_populates="apprenticeship_types")
    cohorts = relationship("Cohort", back_populates="apprenticeship_type")
    assessments = relationship("Assessment", back_populates="apprenticeship_type", cascade="all, delete-orphan")


class ApprenticeshipListing(Base):
    __tablename__ = "apprenticeship_listings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    company_id = Column(Integer, ForeignKey("company_profiles.id", ondelete="CASCADE"), nullable=False)

    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    requirements = Column(Text, nullable=True)
    level = Column(String(50), nullable=True)
    sector = Column(String(100), nullable=True)
    location = Column(String(255), nullable=True)
    work_type = Column(String(50), nullable=True)  # remote, hybrid, onsite
    salary_range = Column(String(100), nullable=True)
    duration = Column(String(100), nullable=True)
    positions_available = Column(Integer, default=1)
    skills_required = Column(JSON, default=list)
    benefits = Column(JSON, default=list)
    is_active = Column(Boolean, default=True)
    deadline = Column(Date, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    company = relationship("CompanyProfile", back_populates="listings")
    applications = relationship("Application", back_populates="listing", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_listings_active_sector", "is_active", "sector"),
    )


class ApplicationStatus(str, enum.Enum):
    PENDING = "pending"
    REVIEWED = "reviewed"
    SHORTLISTED = "shortlisted"
    INTERVIEW = "interview"
    OFFERED = "offered"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, autoincrement=True)
    apprentice_id = Column(Integer, ForeignKey("apprentice_profiles.id", ondelete="CASCADE"), nullable=False)
    listing_id = Column(Integer, ForeignKey("apprenticeship_listings.id", ondelete="CASCADE"), nullable=False)

    status = Column(Enum(ApplicationStatus), default=ApplicationStatus.PENDING, nullable=False)
    cover_letter = Column(Text, nullable=True)
    applied_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    notes = Column(Text, nullable=True)

    apprentice = relationship("ApprenticeProfile", back_populates="applications")
    listing = relationship("ApprenticeshipListing", back_populates="applications")

    __table_args__ = (
        Index("ix_applications_status", "status"),
    )


class Shortlist(Base):
    __tablename__ = "shortlists"

    id = Column(Integer, primary_key=True, autoincrement=True)
    company_id = Column(Integer, ForeignKey("company_profiles.id", ondelete="CASCADE"), nullable=False)
    apprentice_id = Column(Integer, ForeignKey("apprentice_profiles.id", ondelete="CASCADE"), nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    company = relationship("CompanyProfile", back_populates="shortlists")
    apprentice = relationship("ApprenticeProfile")


class Cohort(Base):
    __tablename__ = "cohorts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    provider_id = Column(Integer, ForeignKey("training_provider_profiles.id", ondelete="CASCADE"), nullable=False)
    apprenticeship_type_id = Column(Integer, ForeignKey("apprenticeship_types.id"), nullable=True)

    name = Column(String(255), nullable=False)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    capacity = Column(Integer, default=30)
    status = Column(String(50), default="active")  # active, completed, planned
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    provider = relationship("TrainingProviderProfile", back_populates="cohorts")
    apprenticeship_type = relationship("ApprenticeshipType", back_populates="cohorts")
    members = relationship("CohortMember", back_populates="cohort", cascade="all, delete-orphan")


class CohortMember(Base):
    __tablename__ = "cohort_members"

    id = Column(Integer, primary_key=True, autoincrement=True)
    cohort_id = Column(Integer, ForeignKey("cohorts.id", ondelete="CASCADE"), nullable=False)
    apprentice_id = Column(Integer, ForeignKey("apprentice_profiles.id", ondelete="CASCADE"), nullable=False)

    status = Column(String(50), default="enrolled")  # enrolled, in_progress, completed, withdrawn
    progress = Column(Integer, default=0)  # 0-100
    enrolled_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    notes = Column(Text, nullable=True)

    cohort = relationship("Cohort", back_populates="members")
    apprentice = relationship("ApprenticeProfile", back_populates="cohort_memberships")


class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    apprenticeship_type_id = Column(Integer, ForeignKey("apprenticeship_types.id", ondelete="CASCADE"), nullable=True)

    title = Column(String(255), nullable=False)
    reference_code = Column(String(50), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    time_limit_minutes = Column(Integer, nullable=True)
    pass_score = Column(Integer, default=70)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    apprenticeship_type = relationship("ApprenticeshipType", back_populates="assessments")
    questions = relationship("AssessmentQuestion", back_populates="assessment", cascade="all, delete-orphan", order_by="AssessmentQuestion.order")
    attempts = relationship("AssessmentAttempt", back_populates="assessment", cascade="all, delete-orphan")


class AssessmentQuestion(Base):
    __tablename__ = "assessment_questions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False)

    question_text = Column(Text, nullable=False)
    question_type = Column(String(50), default="multiple_choice")  # multiple_choice, true_false
    options = Column(JSON, nullable=False)  # ["option A", "option B", ...]
    correct_answer = Column(Integer, nullable=False)  # index of correct option
    explanation = Column(Text, nullable=True)
    points = Column(Integer, default=1)
    order = Column(Integer, default=0)

    assessment = relationship("Assessment", back_populates="questions")


class AssessmentAttempt(Base):
    __tablename__ = "assessment_attempts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False)
    apprentice_id = Column(Integer, ForeignKey("apprentice_profiles.id", ondelete="CASCADE"), nullable=False)
    cohort_id = Column(Integer, ForeignKey("cohorts.id"), nullable=True)

    token = Column(String(255), unique=True, nullable=False, index=True)
    answers = Column(JSON, nullable=True)  # {question_id: selected_option_index}
    score = Column(Float, nullable=True)
    total_points = Column(Integer, nullable=True)
    passed = Column(Boolean, nullable=True)
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    status = Column(String(50), default="pending")  # pending, in_progress, completed, expired

    assessment = relationship("Assessment", back_populates="attempts")
    apprentice = relationship("ApprenticeProfile", back_populates="assessment_attempts")
    cohort = relationship("Cohort")


class AnalysisJob(Base):
    __tablename__ = "analysis_jobs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    apprentice_id = Column(Integer, ForeignKey("apprentice_profiles.id", ondelete="CASCADE"), nullable=False)

    input_type = Column(String(50), nullable=False)  # text, pdf, audio, video
    input_file_url = Column(String(500), nullable=True)
    input_text = Column(Text, nullable=True)
    status = Column(String(50), default="pending")  # pending, processing, completed, failed
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime(timezone=True), nullable=True)

    apprentice = relationship("ApprenticeProfile", back_populates="analysis_jobs")
    result = relationship("AnalysisResult", back_populates="job", uselist=False, cascade="all, delete-orphan")


class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id = Column(Integer, primary_key=True, autoincrement=True)
    job_id = Column(Integer, ForeignKey("analysis_jobs.id", ondelete="CASCADE"), unique=True, nullable=False)

    extracted_text = Column(Text, nullable=True)
    candidate_summary = Column(Text, nullable=True)
    skills_detected = Column(JSON, default=list)
    education_detected = Column(JSON, default=list)
    experience_detected = Column(JSON, default=list)
    personality_scores = Column(JSON, nullable=True)  # {openness: 0.8, ...}
    ai_insights = Column(JSON, nullable=True)  # {strengths: [], gaps: [], summary: ""}
    report_data = Column(JSON, nullable=True)  # full report payload
    confidence_score = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    job = relationship("AnalysisJob", back_populates="result")


class PsychometricResult(Base):
    __tablename__ = "psychometric_results"

    id = Column(Integer, primary_key=True, autoincrement=True)
    apprentice_id = Column(Integer, ForeignKey("apprentice_profiles.id", ondelete="CASCADE"), nullable=False)

    test_type = Column(String(50), default="ocean")  # ocean (Big Five)
    answers = Column(JSON, nullable=True)
    scores = Column(JSON, nullable=True)  # {openness: 72, conscientiousness: 85, ...}
    normalized_scores = Column(JSON, nullable=True)
    strengths = Column(JSON, default=list)
    growth_areas = Column(JSON, default=list)
    trait_explanations = Column(JSON, nullable=True)
    completed_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    apprentice = relationship("ApprenticeProfile", back_populates="psychometric_results")


class Collaboration(Base):
    __tablename__ = "collaborations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    provider_id = Column(Integer, ForeignKey("training_provider_profiles.id", ondelete="CASCADE"), nullable=False)
    company_id = Column(Integer, ForeignKey("company_profiles.id", ondelete="CASCADE"), nullable=False)

    status = Column(String(50), default="active")  # active, paused, ended
    apprenticeship_types = Column(JSON, default=list)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    provider = relationship("TrainingProviderProfile", back_populates="collaborations")
    company = relationship("CompanyProfile", back_populates="collaborations")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), default="info")  # info, success, warning, action
    is_read = Column(Boolean, default=False)
    link = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="notifications")


class UploadedFile(Base):
    __tablename__ = "uploaded_files"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)  # pdf, audio, video, image
    mime_type = Column(String(100), nullable=False)
    file_size = Column(Integer, nullable=False)  # bytes
    file_url = Column(String(500), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="uploaded_files")


class AdminSettings(Base):
    __tablename__ = "admin_settings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    key = Column(String(100), unique=True, nullable=False, index=True)
    value = Column(JSON, nullable=True)
    description = Column(Text, nullable=True)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    report_type = Column(String(100), nullable=False)
    title = Column(String(255), nullable=False)
    data = Column(JSON, nullable=True)
    file_url = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
