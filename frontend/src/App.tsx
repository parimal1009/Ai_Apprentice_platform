import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import type { ReactNode } from 'react';

// Layouts
import AppLayout from '@/components/layout/AppLayout';

// Public pages
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';

// Apprentice pages
import ApprenticeDashboard from '@/pages/apprentice/Dashboard';
import ApprenticeProfile from '@/pages/apprentice/Profile';
import Opportunities from '@/pages/apprentice/Opportunities';
import Applications from '@/pages/apprentice/Applications';
import PsychometricPage from '@/pages/apprentice/Psychometric';
import AnalyzerPage from '@/pages/apprentice/Analyzer';
import VideoInterviewPage from '@/pages/apprentice/VideoInterview';

// Company pages
import CompanyDashboard from '@/pages/company/Dashboard';
import Listings from '@/pages/company/Listings';
import Candidates from '@/pages/company/Candidates';

// Provider pages
import ProviderDashboard from '@/pages/provider/Dashboard';
import Programs from '@/pages/provider/Programs';
import Cohorts from '@/pages/provider/Cohorts';
import Assessments from '@/pages/provider/Assessments';
import Employers from '@/pages/provider/Employers';

// Admin pages
import AdminDashboard from '@/pages/admin/Dashboard';
import Users from '@/pages/admin/Users';
import Settings from '@/pages/admin/Settings';
import Reports from '@/pages/admin/Reports';

// Shared
import Analytics from '@/pages/shared/Analytics';
import Profile from '@/pages/shared/Profile';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30000 },
  },
});

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="spinner" />
      </div>
    );
  }
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function PublicRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="spinner" />
      </div>
    );
  }
  return isAuthenticated ? <Navigate to="/app/dashboard" replace /> : <>{children}</>;
}

function DashboardRouter() {
  const { user } = useAuth();
  switch (user?.role) {
    case 'apprentice': return <ApprenticeDashboard />;
    case 'company': return <CompanyDashboard />;
    case 'training_provider': return <ProviderDashboard />;
    case 'admin': return <AdminDashboard />;
    default: return <ApprenticeDashboard />;
  }
}

function ProfileRouter() {
  const { user } = useAuth();
  switch (user?.role) {
    case 'apprentice': return <ApprenticeProfile />;
    default: return <Profile />;
  }
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

            {/* Protected App Routes */}
            <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<DashboardRouter />} />
              <Route path="profile" element={<ProfileRouter />} />

              {/* Apprentice Routes */}
              <Route path="opportunities" element={<Opportunities />} />
              <Route path="applications" element={<Applications />} />
              <Route path="psychometric" element={<PsychometricPage />} />
              <Route path="analyzer" element={<AnalyzerPage />} />
              <Route path="video-interview" element={<VideoInterviewPage />} />

              {/* Company Routes */}
              <Route path="listings" element={<Listings />} />
              <Route path="candidates" element={<Candidates />} />

              {/* Provider Routes */}
              <Route path="programs" element={<Programs />} />
              <Route path="cohorts" element={<Cohorts />} />
              <Route path="assessments" element={<Assessments />} />
              <Route path="employers" element={<Employers />} />

              {/* Admin Routes */}
              <Route path="users" element={<Users />} />
              <Route path="settings" element={<Settings />} />
              <Route path="reports" element={<Reports />} />

              {/* Shared */}
              <Route path="analytics" element={<Analytics />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
