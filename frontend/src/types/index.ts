export type UserRole = 'apprentice' | 'company' | 'training_provider' | 'admin';

export interface User {
  id: number;
  email: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_verified: boolean;
  avatar_url?: string;
  created_at?: string;
  last_login?: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface ApprenticeProfile {
  id: number;
  user_id: number;
  phone?: string;
  date_of_birth?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  postcode?: string;
  country?: string;
  headline?: string;
  bio?: string;
  skills: string[];
  education: any[];
  work_experience: any[];
  languages: string[];
  certifications: any[];
  availability?: string;
  career_interests: string[];
  preferred_location?: string;
  work_preference?: string;
  apprenticeship_level?: string;
  cv_url?: string;
  profile_photo_url?: string;
  video_intro_url?: string;
  profile_completeness: number;
  created_at?: string;
  updated_at?: string;
  user?: User;
}

export interface CompanyProfile {
  id: number;
  user_id: number;
  company_name: string;
  industry?: string;
  company_size?: string;
  website?: string;
  description?: string;
  address?: string;
  city?: string;
  postcode?: string;
  country?: string;
  logo_url?: string;
  contact_email?: string;
  contact_phone?: string;
  required_skills: string[];
  apprenticeship_interests: string[];
  created_at?: string;
  user?: User;
}

export interface ProviderProfile {
  id: number;
  user_id: number;
  provider_name: string;
  specialisation?: string;
  ofsted_rating?: string;
  description?: string;
  address?: string;
  city?: string;
  postcode?: string;
  country?: string;
  website?: string;
  logo_url?: string;
  contact_email?: string;
  contact_phone?: string;
  courses: any[];
  accreditation_images: string[];
  created_at?: string;
  user?: User;
}

export interface Listing {
  id: number;
  company_id: number;
  title: string;
  description: string;
  requirements?: string;
  level?: string;
  sector?: string;
  location?: string;
  work_type?: string;
  salary_range?: string;
  duration?: string;
  positions_available: number;
  skills_required: string[];
  benefits: string[];
  is_active: boolean;
  deadline?: string;
  created_at?: string;
  company?: CompanyProfile;
}

export interface Application {
  id: number;
  apprentice_id: number;
  listing_id: number;
  status: string;
  cover_letter?: string;
  applied_at?: string;
  updated_at?: string;
  notes?: string;
  listing?: Listing;
  apprentice?: ApprenticeProfile;
}

export interface Cohort {
  id: number;
  provider_id: number;
  apprenticeship_type_id?: number;
  name: string;
  start_date?: string;
  end_date?: string;
  capacity: number;
  status: string;
  notes?: string;
  created_at?: string;
  member_count?: number;
}

export interface CohortMember {
  id: number;
  cohort_id: number;
  apprentice_id: number;
  status: string;
  progress: number;
  enrolled_at?: string;
  notes?: string;
  apprentice?: ApprenticeProfile;
}

export interface Assessment {
  id: number;
  apprenticeship_type_id?: number;
  title: string;
  reference_code: string;
  description?: string;
  time_limit_minutes?: number;
  pass_score: number;
  is_active: boolean;
  created_at?: string;
  question_count?: number;
}

export interface AssessmentQuestion {
  id: number;
  question_text: string;
  question_type: string;
  options: string[];
  explanation?: string;
  points: number;
  order: number;
}

export interface AssessmentAttempt {
  id: number;
  assessment_id: number;
  apprentice_id: number;
  cohort_id?: number;
  token: string;
  answers?: Record<string, number>;
  score?: number;
  total_points?: number;
  passed?: boolean;
  started_at?: string;
  completed_at?: string;
  status: string;
}

export interface AnalysisJob {
  id: number;
  apprentice_id: number;
  input_type: string;
  status: string;
  error_message?: string;
  created_at?: string;
  completed_at?: string;
}

export interface AnalysisResult {
  id: number;
  job_id: number;
  extracted_text?: string;
  candidate_summary?: string;
  skills_detected: string[];
  education_detected: any[];
  experience_detected: any[];
  personality_scores?: Record<string, number>;
  ai_insights?: {
    candidate_summary?: string;
    strengths?: string[];
    gaps?: string[];
    communication_style?: string;
    role_fit?: string;
    learning_potential?: string;
    recommended_paths?: string[];
    interview_suggestions?: string[];
    coach_notes?: string;
  };
  report_data?: any;
  confidence_score?: number;
  created_at?: string;
}

export interface PsychometricResult {
  id: number;
  apprentice_id: number;
  test_type: string;
  scores?: Record<string, number>;
  normalized_scores?: Record<string, number>;
  strengths: string[];
  growth_areas: string[];
  trait_explanations?: Record<string, {
    score: number;
    level: string;
    description: string;
  }>;
  completed_at?: string;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  link?: string;
  created_at?: string;
}

export interface DashboardStats {
  stats: Record<string, any>;
  recent_activity: any[];
  charts_data?: Record<string, any>;
}

export interface ApprenticeshipType {
  id: number;
  provider_id: number;
  name: string;
  reference_code: string;
  level: string;
  description?: string;
  duration_months?: number;
  sector?: string;
  is_active: boolean;
}
