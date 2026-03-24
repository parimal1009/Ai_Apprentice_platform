import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { TokenResponse, User, DashboardStats, ApprenticeProfile, CompanyProfile, ProviderProfile, Listing, Application, Cohort, CohortMember, Assessment, AssessmentAttempt, AnalysisJob, AnalysisResult, PsychometricResult, Notification, ApprenticeshipType } from '@/types';

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor for auth
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const { data } = await axios.post<TokenResponse>(`${API_BASE}/auth/refresh`, {
            refresh_token: refreshToken,
          });
          localStorage.setItem('access_token', data.access_token);
          localStorage.setItem('refresh_token', data.refresh_token);
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
          }
          return api(originalRequest);
        } catch {
          localStorage.clear();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// ============ Auth ============
export const authApi = {
  register: (data: { email: string; password: string; first_name: string; last_name: string; role: string }) =>
    api.post<TokenResponse>('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post<TokenResponse>('/auth/login', data),
  refresh: (refresh_token: string) =>
    api.post<TokenResponse>('/auth/refresh', { refresh_token }),
  me: () => api.get<User>('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

// ============ Apprentice ============
export const apprenticeApi = {
  dashboard: () => api.get<DashboardStats>('/apprentice/dashboard'),
  getProfile: () => api.get<ApprenticeProfile>('/apprentice/profile'),
  updateProfile: (data: Partial<ApprenticeProfile>) => api.put<ApprenticeProfile>('/apprentice/profile', data),
  getApplications: () => api.get<Application[]>('/apprentice/applications'),
  createApplication: (data: { listing_id: number; cover_letter?: string }) =>
    api.post<Application>('/apprentice/applications', data),
  getPsychometric: () => api.get<PsychometricResult | null>('/apprentice/psychometric'),
  submitPsychometric: (answers: Record<string, number>) =>
    api.post<PsychometricResult>('/apprentice/psychometric', { answers }),
  getAnalyses: () => api.get<AnalysisJob[]>('/apprentice/analyses'),
  getAnalysisResult: (jobId: number) => api.get<AnalysisResult>(`/apprentice/analyses/${jobId}/result`),
};

// ============ Company ============
export const companyApi = {
  dashboard: () => api.get<DashboardStats>('/company/dashboard'),
  getProfile: () => api.get<CompanyProfile>('/company/profile'),
  updateProfile: (data: Partial<CompanyProfile>) => api.put<CompanyProfile>('/company/profile', data),
  getListings: () => api.get<Listing[]>('/company/listings'),
  createListing: (data: any) => api.post<Listing>('/company/listings', data),
  updateListing: (id: number, data: any) => api.put<Listing>(`/company/listings/${id}`, data),
  getApplications: (params?: { listing_id?: number; status_filter?: string }) =>
    api.get<Application[]>('/company/applications', { params }),
  updateApplicationStatus: (id: number, data: { status: string; notes?: string }) =>
    api.put<Application>(`/company/applications/${id}/status`, data),
  searchCandidates: (params?: Record<string, any>) =>
    api.get<ApprenticeProfile[]>('/company/candidates/search', { params }),
  addToShortlist: (apprenticeId: number) => api.post(`/company/shortlist/${apprenticeId}`),
};

// ============ Provider ============
export const providerApi = {
  dashboard: () => api.get<DashboardStats>('/provider/dashboard'),
  getProfile: () => api.get<ProviderProfile>('/provider/profile'),
  updateProfile: (data: Partial<ProviderProfile>) => api.put<ProviderProfile>('/provider/profile', data),
  getApprenticeshipTypes: () => api.get<ApprenticeshipType[]>('/provider/apprenticeship-types'),
  createApprenticeshipType: (data: any) => api.post<ApprenticeshipType>('/provider/apprenticeship-types', data),
  getCohorts: () => api.get<Cohort[]>('/provider/cohorts'),
  getCohort: (id: number) => api.get<Cohort>(`/provider/cohorts/${id}`),
  createCohort: (data: any) => api.post<Cohort>('/provider/cohorts', data),
  updateCohort: (id: number, data: any) => api.put<Cohort>(`/provider/cohorts/${id}`, data),
  getCohortMembers: (cohortId: number) => api.get<CohortMember[]>(`/provider/cohorts/${cohortId}/members`),
  addCohortMember: (cohortId: number, apprenticeId: number) =>
    api.post<CohortMember>(`/provider/cohorts/${cohortId}/members`, { apprentice_id: apprenticeId }),
  getAssessments: () => api.get<Assessment[]>('/provider/assessments'),
  createAssessment: (data: any) => api.post<Assessment>('/provider/assessments', data),
  sendAssessmentLink: (assessmentId: number, apprenticeId: number, cohortId?: number) =>
    api.post<{ link: string; token: string }>(`/provider/assessments/${assessmentId}/send-link`, null, {
      params: { apprentice_id: apprenticeId, cohort_id: cohortId }
    }),
  getAssessmentResults: (assessmentId: number) => api.get<AssessmentAttempt[]>(`/provider/assessments/${assessmentId}/results`),
  getCollaborations: () => api.get('/provider/collaborations'),
};

// ============ Admin ============
export const adminApi = {
  dashboard: () => api.get<DashboardStats>('/admin/dashboard'),
  getUsers: (params?: Record<string, any>) => api.get<User[]>('/admin/users', { params }),
  updateUser: (id: number, data: any) => api.put<User>(`/admin/users/${id}`, data),
  suspendUser: (id: number) => api.post(`/admin/users/${id}/suspend`),
  activateUser: (id: number) => api.post(`/admin/users/${id}/activate`),
  getSettings: () => api.get('/admin/settings'),
  updateSetting: (key: string, value: any) => api.put(`/admin/settings/${key}`, value),
  getAnalytics: () => api.get('/admin/analytics'),
};

// ============ Public ============
export const publicApi = {
  getListings: (params?: Record<string, any>) => api.get<Listing[]>('/listings', { params }),
  getListing: (id: number) => api.get<Listing>(`/listings/${id}`),
  getAssessment: (token: string) => api.get(`/assessment/take/${token}`),
  submitAssessment: (token: string, answers: Record<string, number>) =>
    api.post(`/assessment/take/${token}/submit`, { answers }),
};

// ============ Analysis ============
export const analysisApi = {
  analyzeText: (data: { input_type: string; input_text: string }) =>
    api.post<AnalysisJob>('/analysis/analyze/text', data),
  analyzeFile: (file: File, inputType: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('input_type', inputType);
    return api.post<AnalysisJob>('/analysis/analyze/file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getJobStatus: (jobId: number) => api.get<AnalysisJob>(`/analysis/jobs/${jobId}`),
  getJobResult: (jobId: number) => api.get<AnalysisResult>(`/analysis/jobs/${jobId}/result`),
};

export default api;
