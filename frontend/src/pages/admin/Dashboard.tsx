import { useEffect, useState } from 'react';
import { adminApi } from '@/api/client';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';
import { Users, Briefcase, TrendingUp, Brain, Shield, Settings, FileText, BarChart3, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { DashboardStats } from '@/types';

const COLORS = ['#6366f1', '#14b8a6', '#f59e0b', '#ef4444'];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.dashboard().then(res => { setStats(res.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner" /></div>;

  const s = stats?.stats || {};
  const roleData = s.users_by_role ? Object.entries(s.users_by_role).map(([role, count]) => ({
    name: role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: count as number,
  })) : [];

  const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
  const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">Platform-wide overview and system management.</p>
      </div>

      <motion.div variants={item} className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgb(99 102 241 / 0.12)' }}>
            <Users size={20} style={{ color: 'var(--color-primary-light)' }} />
          </div>
          <div><div className="stat-value">{s.total_users || 0}</div><div className="stat-label">Total Users</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgb(34 197 94 / 0.12)' }}>
            <Activity size={20} style={{ color: '#4ade80' }} />
          </div>
          <div><div className="stat-value">{s.active_users || 0}</div><div className="stat-label">Active Users</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgb(59 130 246 / 0.12)' }}>
            <Briefcase size={20} style={{ color: '#60a5fa' }} />
          </div>
          <div><div className="stat-value">{s.active_listings || 0}</div><div className="stat-label">Active Listings</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgb(245 158 11 / 0.12)' }}>
            <Brain size={20} style={{ color: '#fbbf24' }} />
          </div>
          <div><div className="stat-value">{s.total_analyses || 0}</div><div className="stat-label">AI Analyses</div></div>
        </div>
      </motion.div>

      <div className="charts-grid">
        <motion.div variants={item} className="chart-card">
          <div className="chart-title">Users by Role</div>
          {roleData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={roleData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={50} paddingAngle={3}>
                  {roleData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="empty-state"><p>No user data</p></div>}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem', justifyContent: 'center' }}>
            {roleData.map((d, i) => (
              <span key={d.name} className="badge" style={{ background: `${COLORS[i % COLORS.length]}20`, color: COLORS[i % COLORS.length] }}>
                {d.name}: {d.value}
              </span>
            ))}
          </div>
        </motion.div>

        <motion.div variants={item} className="chart-card">
          <div className="chart-title">Platform Overview</div>
          <div style={{ display: 'grid', gap: '1rem', padding: '1rem 0' }}>
            {[
              { label: 'Total Applications', value: s.total_applications || 0, color: '#6366f1' },
              { label: 'Completed Assessments', value: s.completed_assessments || 0, color: '#14b8a6' },
              { label: 'AI Analyses Run', value: s.total_analyses || 0, color: '#f59e0b' },
            ].map((metric) => (
              <div key={metric.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderRadius: 'var(--radius-lg)', background: 'var(--bg-tertiary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 4, height: 28, borderRadius: 4, background: metric.color }} />
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{metric.label}</span>
                </div>
                <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>{metric.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div variants={item}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Administration</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
          {[
            { label: 'User Management', icon: Users, path: '/app/users', color: '#6366f1' },
            { label: 'Analytics', icon: BarChart3, path: '/app/analytics', color: '#14b8a6' },
            { label: 'Settings', icon: Settings, path: '/app/settings', color: '#f59e0b' },
            { label: 'Reports', icon: FileText, path: '/app/reports', color: '#3b82f6' },
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
