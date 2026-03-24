from datetime import datetime, date
from typing import Optional, List, Any
from pydantic import BaseModel, EmailStr, Field, field_validator
import re


# ============================================================
# Auth Schemas
# ============================================================

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    role: str = Field(..., pattern=r"^(apprentice|company|training_provider)$")

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one digit")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: "UserRead"


class RefreshRequest(BaseModel):
    refresh_token: str


# ============================================================
# User Schemas
# ============================================================

class UserRead(BaseModel):
    id: int
    email: str
    role: str
    first_name: str
    last_name: str
    is_active: bool
    is_verified: bool
    avatar_url: Optional[str] = None
    created_at: Optional[datetime] = None
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    avatar_url: Optional[str] = None


class UserAdminUpdate(BaseModel):
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None
    role: Optional[str] = None


# ============================================================
# Apprentice Profile Schemas
# ============================================================

class ApprenticeProfileRead(BaseModel):
    id: int
    user_id: int
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    postcode: Optional[str] = None
    country: Optional[str] = None
    headline: Optional[str] = None
    bio: Optional[str] = None
    skills: List[str] = []
    education: List[Any] = []
    work_experience: List[Any] = []
    languages: List[str] = []
    certifications: List[Any] = []
    availability: Optional[str] = None
    career_interests: List[str] = []
    preferred_location: Optional[str] = None
    work_preference: Optional[str] = None
    apprenticeship_level: Optional[str] = None
    cv_url: Optional[str] = None
    profile_photo_url: Optional[str] = None
    video_intro_url: Optional[str] = None
    profile_completeness: int = 0
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    # Joined data
    user: Optional[UserRead] = None

    class Config:
        from_attributes = True


class ApprenticeProfileUpdate(BaseModel):
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    postcode: Optional[str] = None
    country: Optional[str] = None
    headline: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[List[str]] = None
    education: Optional[List[Any]] = None
    work_experience: Optional[List[Any]] = None
    languages: Optional[List[str]] = None
    certifications: Optional[List[Any]] = None
    availability: Optional[str] = None
    career_interests: Optional[List[str]] = None
    preferred_location: Optional[str] = None
    work_preference: Optional[str] = None
    apprenticeship_level: Optional[str] = None


# ============================================================
# Company Profile Schemas
# ============================================================

class CompanyProfileRead(BaseModel):
    id: int
    user_id: int
    company_name: str
    industry: Optional[str] = None
    company_size: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    postcode: Optional[str] = None
    country: Optional[str] = None
    logo_url: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    required_skills: List[str] = []
    apprenticeship_interests: List[str] = []
    created_at: Optional[datetime] = None

    user: Optional[UserRead] = None

    class Config:
        from_attributes = True


class CompanyProfileUpdate(BaseModel):
    company_name: Optional[str] = None
    industry: Optional[str] = None
    company_size: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    postcode: Optional[str] = None
    country: Optional[str] = None
    logo_url: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    required_skills: Optional[List[str]] = None
    apprenticeship_interests: Optional[List[str]] = None


# ============================================================
# Training Provider Profile Schemas
# ============================================================

class ProviderProfileRead(BaseModel):
    id: int
    user_id: int
    provider_name: str
    specialisation: Optional[str] = None
    ofsted_rating: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    postcode: Optional[str] = None
    country: Optional[str] = None
    website: Optional[str] = None
    logo_url: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    courses: List[Any] = []
    accreditation_images: List[str] = []
    created_at: Optional[datetime] = None

    user: Optional[UserRead] = None

    class Config:
        from_attributes = True


class ProviderProfileUpdate(BaseModel):
    provider_name: Optional[str] = None
    specialisation: Optional[str] = None
    ofsted_rating: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    postcode: Optional[str] = None
    country: Optional[str] = None
    website: Optional[str] = None
    logo_url: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    courses: Optional[List[Any]] = None
    accreditation_images: Optional[List[str]] = None


# ============================================================
# Apprenticeship Listing Schemas
# ============================================================

class ListingCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    description: str = Field(..., min_length=10)
    requirements: Optional[str] = None
    level: Optional[str] = None
    sector: Optional[str] = None
    location: Optional[str] = None
    work_type: Optional[str] = None
    salary_range: Optional[str] = None
    duration: Optional[str] = None
    positions_available: int = 1
    skills_required: List[str] = []
    benefits: List[str] = []
    deadline: Optional[date] = None


class ListingRead(BaseModel):
    id: int
    company_id: int
    title: str
    description: str
    requirements: Optional[str] = None
    level: Optional[str] = None
    sector: Optional[str] = None
    location: Optional[str] = None
    work_type: Optional[str] = None
    salary_range: Optional[str] = None
    duration: Optional[str] = None
    positions_available: int
    skills_required: List[str] = []
    benefits: List[str] = []
    is_active: bool
    deadline: Optional[date] = None
    created_at: Optional[datetime] = None

    company: Optional[CompanyProfileRead] = None

    class Config:
        from_attributes = True


class ListingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[str] = None
    level: Optional[str] = None
    sector: Optional[str] = None
    location: Optional[str] = None
    work_type: Optional[str] = None
    salary_range: Optional[str] = None
    duration: Optional[str] = None
    positions_available: Optional[int] = None
    skills_required: Optional[List[str]] = None
    benefits: Optional[List[str]] = None
    is_active: Optional[bool] = None
    deadline: Optional[date] = None


# ============================================================
# Application Schemas
# ============================================================

class ApplicationCreate(BaseModel):
    listing_id: int
    cover_letter: Optional[str] = None


class ApplicationRead(BaseModel):
    id: int
    apprentice_id: int
    listing_id: int
    status: str
    cover_letter: Optional[str] = None
    applied_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    notes: Optional[str] = None

    listing: Optional[ListingRead] = None
    apprentice: Optional[ApprenticeProfileRead] = None

    class Config:
        from_attributes = True


class ApplicationStatusUpdate(BaseModel):
    status: str = Field(..., pattern=r"^(pending|reviewed|shortlisted|interview|offered|accepted|rejected|withdrawn)$")
    notes: Optional[str] = None


# ============================================================
# Cohort Schemas
# ============================================================

class CohortCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    apprenticeship_type_id: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    capacity: int = 30
    notes: Optional[str] = None


class CohortRead(BaseModel):
    id: int
    provider_id: int
    apprenticeship_type_id: Optional[int] = None
    name: str
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    capacity: int
    status: str
    notes: Optional[str] = None
    created_at: Optional[datetime] = None
    member_count: Optional[int] = None

    class Config:
        from_attributes = True


class CohortUpdate(BaseModel):
    name: Optional[str] = None
    apprenticeship_type_id: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    capacity: Optional[int] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class CohortMemberCreate(BaseModel):
    apprentice_id: int


class CohortMemberRead(BaseModel):
    id: int
    cohort_id: int
    apprentice_id: int
    status: str
    progress: int
    enrolled_at: Optional[datetime] = None
    notes: Optional[str] = None

    apprentice: Optional[ApprenticeProfileRead] = None

    class Config:
        from_attributes = True


# ============================================================
# Assessment Schemas
# ============================================================

class AssessmentQuestionCreate(BaseModel):
    question_text: str
    question_type: str = "multiple_choice"
    options: List[str]
    correct_answer: int
    explanation: Optional[str] = None
    points: int = 1


class AssessmentCreate(BaseModel):
    title: str
    reference_code: str
    description: Optional[str] = None
    apprenticeship_type_id: Optional[int] = None
    time_limit_minutes: Optional[int] = None
    pass_score: int = 70
    questions: List[AssessmentQuestionCreate] = []


class AssessmentQuestionRead(BaseModel):
    id: int
    question_text: str
    question_type: str
    options: List[str]
    explanation: Optional[str] = None
    points: int
    order: int

    class Config:
        from_attributes = True


class AssessmentRead(BaseModel):
    id: int
    apprenticeship_type_id: Optional[int] = None
    title: str
    reference_code: str
    description: Optional[str] = None
    time_limit_minutes: Optional[int] = None
    pass_score: int
    is_active: bool
    created_at: Optional[datetime] = None
    question_count: Optional[int] = None

    class Config:
        from_attributes = True


class AssessmentAttemptRead(BaseModel):
    id: int
    assessment_id: int
    apprentice_id: int
    cohort_id: Optional[int] = None
    token: str
    answers: Optional[Any] = None
    score: Optional[float] = None
    total_points: Optional[int] = None
    passed: Optional[bool] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    status: str

    class Config:
        from_attributes = True


class AssessmentSubmission(BaseModel):
    answers: dict  # {question_id: selected_option_index}


# ============================================================
# Apprenticeship Type Schemas
# ============================================================

class ApprenticeshipTypeCreate(BaseModel):
    name: str
    reference_code: str
    level: str
    description: Optional[str] = None
    duration_months: Optional[int] = None
    sector: Optional[str] = None


class ApprenticeshipTypeRead(BaseModel):
    id: int
    provider_id: int
    name: str
    reference_code: str
    level: str
    description: Optional[str] = None
    duration_months: Optional[int] = None
    sector: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True


# ============================================================
# Analysis Schemas
# ============================================================

class AnalysisJobCreate(BaseModel):
    input_type: str = Field(..., pattern=r"^(text|pdf|audio|video)$")
    input_text: Optional[str] = None


class AnalysisJobRead(BaseModel):
    id: int
    apprentice_id: int
    input_type: str
    status: str
    error_message: Optional[str] = None
    created_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AnalysisResultRead(BaseModel):
    id: int
    job_id: int
    extracted_text: Optional[str] = None
    candidate_summary: Optional[str] = None
    skills_detected: List[str] = []
    education_detected: List[Any] = []
    experience_detected: List[Any] = []
    personality_scores: Optional[Any] = None
    ai_insights: Optional[Any] = None
    report_data: Optional[Any] = None
    confidence_score: Optional[float] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============================================================
# Psychometric Schemas
# ============================================================

class PsychometricSubmission(BaseModel):
    answers: dict  # {question_id: answer_value}


class PsychometricResultRead(BaseModel):
    id: int
    apprentice_id: int
    test_type: str
    scores: Optional[Any] = None
    normalized_scores: Optional[Any] = None
    strengths: List[str] = []
    growth_areas: List[str] = []
    trait_explanations: Optional[Any] = None
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============================================================
# Notification Schemas
# ============================================================

class NotificationRead(BaseModel):
    id: int
    title: str
    message: str
    type: str
    is_read: bool
    link: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============================================================
# Utility Schemas
# ============================================================

class PaginatedResponse(BaseModel):
    items: List[Any]
    total: int
    page: int
    page_size: int
    total_pages: int


class MessageResponse(BaseModel):
    message: str
    detail: Optional[Any] = None


class DashboardStats(BaseModel):
    stats: dict
    recent_activity: List[Any] = []
    charts_data: Optional[Any] = None
