import { useEffect, useState } from 'react';
import { providerApi } from '@/api/client';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';
import { Users, GraduationCap, BookOpen, TrendingUp, Handshake, ClipboardCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { DashboardStats } from '@/types';

export default function ProviderDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    providerApi.dashboard().then(res => { setStats(res.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner" /></div>;

  const s = stats?.stats || {};
  const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
  const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

  // Mock growth data for area chart
  const growthData = [
    { month: 'Jan', apprentices: 12 }, { month: 'Feb', apprentices: 18 },
    { month: 'Mar', apprentices: 25 }, { month: 'Apr', apprentices: 30 },
    { month: 'May', apprentices: 35 }, { month: 'Jun', apprentices: 42 },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <div className="page-header">
        <h1 className="page-title">Provider Dashboard</h1>
        <p className="page-subtitle">Manage your apprenticeship programs, cohorts, and assessments.</p>
      </div>

      <motion.div variants={item} className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgb(99 102 241 / 0.12)' }}>
            <BookOpen size={20} style={{ color: 'var(--color-primary-light)' }} />
          </div>
          <div><div className="stat-value">{s.active_cohorts || 0}</div><div className="stat-label">Active Cohorts</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgb(59 130 246 / 0.12)' }}>
            <GraduationCap size={20} style={{ color: '#60a5fa' }} />
          </div>
          <div><div className="stat-value">{s.total_apprentices || 0}</div><div className="stat-label">Total Apprentices</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgb(34 197 94 / 0.12)' }}>
            <TrendingUp size={20} style={{ color: '#4ade80' }} />
          </div>
          <div><div className="stat-value">{s.completion_rate || 0}%</div><div className="stat-label">Completion Rate</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgb(245 158 11 / 0.12)' }}>
            <Handshake size={20} style={{ color: '#fbbf24' }} />
          </div>
          <div><div className="stat-value">{s.collaborating_employers || 0}</div><div className="stat-label">Employer Partners</div></div>
        </div>
      </motion.div>

      <div className="charts-grid">
        <motion.div variants={item} className="chart-card">
          <div className="chart-title">Apprentice Growth</div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={growthData}>
              <defs>
                <linearGradient id="colorApprentices" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }} />
              <Area type="monotone" dataKey="apprentices" stroke="var(--color-primary)" fill="url(#colorApprentices)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div variants={item} className="chart-card">
          <div className="chart-title">Cohort Overview</div>
          <div style={{ padding: '1rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Total Cohorts</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>{s.total_cohorts || 0}</span>
            </div>
            <div className="progress-bar" style={{ height: '0.75rem', marginBottom: '0.5rem' }}>
              <div className="progress-bar-fill" style={{ width: `${s.completion_rate || 0}%` }} />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.completion_rate || 0}% completion rate across all cohorts</div>
          </div>
          <div style={{ marginTop: '1.5rem' }}>
            <Link to="/app/cohorts" className="btn btn-primary btn-sm" style={{ width: '100%' }}>
              Manage Cohorts
            </Link>
          </div>
        </motion.div>
      </div>

      <motion.div variants={item}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Quick Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
          {[
            { label: 'Manage Programs', icon: BookOpen, path: '/app/programs', color: '#6366f1' },
            { label: 'View Cohorts', icon: Users, path: '/app/cohorts', color: '#14b8a6' },
            { label: 'Assessments', icon: ClipboardCheck, path: '/app/assessments', color: '#f59e0b' },
            { label: 'Employers', icon: Handshake, path: '/app/employers', color: '#3b82f6' },
          ].map((action) => (
            <Link key={action.label} to={action.path} className="card card-hover" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-lg)', background: `${action.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <action.icon size={20} style={{ color: action.color }} />
              </div>
              <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{action.label}</span>
            </Link>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
