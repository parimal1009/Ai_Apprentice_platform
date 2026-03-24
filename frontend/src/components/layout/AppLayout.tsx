import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard, User, Briefcase, GraduationCap, Settings, LogOut,
  ChevronLeft, ChevronRight, Bell, Search, Menu, Brain,
  Users, Building2, FileText, BarChart3, BookOpen, ClipboardCheck,
  Handshake, Upload, Shield, Video
} from 'lucide-react';

const roleNavItems: Record<string, { label: string; path: string; icon: any }[]> = {
  apprentice: [
    { label: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
    { label: 'Profile', path: '/app/profile', icon: User },
    { label: 'Opportunities', path: '/app/opportunities', icon: Briefcase },
    { label: 'Applications', path: '/app/applications', icon: FileText },
    { label: 'Personality Test', path: '/app/psychometric', icon: Brain },
    { label: 'AI Analyzer', path: '/app/analyzer', icon: Upload },
    { label: 'Video Interview', path: '/app/video-interview', icon: Video },
  ],
  company: [
    { label: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
    { label: 'Profile', path: '/app/profile', icon: Building2 },
    { label: 'Listings', path: '/app/listings', icon: Briefcase },
    { label: 'Applications', path: '/app/applications', icon: FileText },
    { label: 'Candidates', path: '/app/candidates', icon: Users },
    { label: 'Analytics', path: '/app/analytics', icon: BarChart3 },
  ],
  training_provider: [
    { label: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
    { label: 'Profile', path: '/app/profile', icon: GraduationCap },
    { label: 'Programs', path: '/app/programs', icon: BookOpen },
    { label: 'Cohorts', path: '/app/cohorts', icon: Users },
    { label: 'Assessments', path: '/app/assessments', icon: ClipboardCheck },
    { label: 'Employers', path: '/app/employers', icon: Handshake },
    { label: 'Analytics', path: '/app/analytics', icon: BarChart3 },
  ],
  admin: [
    { label: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
    { label: 'Users', path: '/app/users', icon: Users },
    { label: 'Analytics', path: '/app/analytics', icon: BarChart3 },
    { label: 'Settings', path: '/app/settings', icon: Settings },
    { label: 'Reports', path: '/app/reports', icon: FileText },
  ],
};

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return null;

  const navItems = roleNavItems[user.role] || [];
  const initials = `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Logo */}
        <div style={{ padding: '1.25rem 1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Shield size={20} color="white" />
          </div>
          {!collapsed && (
            <div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>Apprentice</div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Platform</div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '0.75rem 0', overflowY: 'auto' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={20} />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ borderTop: '1px solid var(--border-color)', padding: '0.75rem' }}>
          <button className="nav-item" onClick={handleLogout} style={{ width: '100%', border: 'none', background: 'none', color: 'var(--text-secondary)' }}>
            <LogOut size={20} />
            {!collapsed && <span>Logout</span>}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="nav-item"
            style={{ width: '100%', border: 'none', background: 'none', color: 'var(--text-muted)', marginTop: '0.25rem' }}
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`main-content ${collapsed ? 'main-content-collapsed' : ''}`}>
        {/* Top Bar */}
        <header className="top-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="btn-icon btn-ghost" onClick={() => setMobileOpen(!mobileOpen)} style={{ display: 'none' }}>
              <Menu size={20} />
            </button>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search..."
                className="input"
                style={{ paddingLeft: '2.25rem', width: 280, background: 'var(--bg-tertiary)', fontSize: '0.8125rem' }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button className="btn-icon btn-ghost" style={{ position: 'relative' }}>
              <Bell size={20} />
              <span style={{
                position: 'absolute', top: 4, right: 4, width: 8, height: 8,
                borderRadius: '50%', background: 'var(--color-danger)',
              }} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', paddingLeft: '0.75rem', borderLeft: '1px solid var(--border-color)' }}>
              <div className="avatar avatar-sm">{initials}</div>
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {user.first_name} {user.last_name}
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                  {user.role.replace('_', ' ')}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="page-container animate-fade-in">
          <Outlet />
        </main>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 35 }}
          onClick={() => setMobileOpen(false)}
        />
      )}
    </div>
  );
}
