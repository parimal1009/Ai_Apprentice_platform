import { useEffect, useState } from 'react';
import { companyApi } from '@/api/client';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';
import { Briefcase, Users, FileText, TrendingUp, ArrowRight, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { DashboardStats } from '@/types';

const COLORS = ['#6366f1', '#14b8a6', '#f59e0b', '#3b82f6', '#ef4444', '#22c55e', '#8b5cf6'];

export default function CompanyDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    companyApi.dashboard().then(res => { setStats(res.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner" /></div>;

  const s = stats?.stats || {};
  const funnel = s.application_funnel || {};
  const funnelData = Object.entries(funnel).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count as number,
  })).filter(d => d.value > 0);

  const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
  const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <div className="page-header">
        <h1 className="page-title">Company Dashboard</h1>
        <p className="page-subtitle">Overview of your recruitment pipeline and apprenticeship activity.</p>
      </div>

      <motion.div variants={item} className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgb(99 102 241 / 0.12)' }}>
            <Briefcase size={20} style={{ color: 'var(--color-primary-light)' }} />
          </div>
          <div><div className="stat-value">{s.active_listings || 0}</div><div className="stat-label">Active Listings</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgb(59 130 246 / 0.12)' }}>
            <FileText size={20} style={{ color: '#60a5fa' }} />
          </div>
          <div><div className="stat-value">{s.total_applications || 0}</div><div className="stat-label">Total Applications</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgb(34 197 94 / 0.12)' }}>
            <Users size={20} style={{ color: '#4ade80' }} />
          </div>
          <div><div className="stat-value">{s.shortlisted || 0}</div><div className="stat-label">Shortlisted</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgb(245 158 11 / 0.12)' }}>
            <TrendingUp size={20} style={{ color: '#fbbf24' }} />
          </div>
          <div><div className="stat-value">{Math.round(((s.shortlisted || 0) / Math.max(s.total_applications || 1, 1)) * 100)}%</div><div className="stat-label">Shortlist Rate</div></div>
        </div>
      </motion.div>

      <div className="charts-grid">
        <motion.div variants={item} className="chart-card">
          <div className="chart-title">Application Funnel</div>
          {funnelData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={funnelData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={50} paddingAngle={2}>
                  {funnelData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', fontSize: '0.8125rem' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state"><p>No applications yet</p></div>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem', justifyContent: 'center' }}>
            {funnelData.map((d, i) => (
              <span key={d.name} className="badge" style={{ background: `${COLORS[i % COLORS.length]}20`, color: COLORS[i % COLORS.length] }}>
                {d.name}: {d.value}
              </span>
            ))}
          </div>
        </motion.div>

        <motion.div variants={item} className="chart-card">
          <div className="chart-title">Skill Demand</div>
          {s.skill_demand && s.skill_demand.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={s.skill_demand.map((skill: string) => ({ name: skill, demand: 40 + Math.random() * 50 }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }} />
                <Bar dataKey="demand" fill="var(--color-secondary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state"><p>Update your profile to see skill demand</p></div>
          )}
        </motion.div>
      </div>

      <motion.div variants={item}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Quick Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
          <Link to="/app/listings" className="card card-hover" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', textDecoration: 'none', color: 'inherit' }}>
            <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-lg)', background: '#6366f118', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Briefcase size={20} style={{ color: '#6366f1' }} />
            </div>
            <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>Manage Listings</span>
          </Link>
          <Link to="/app/candidates" className="card card-hover" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', textDecoration: 'none', color: 'inherit' }}>
            <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-lg)', background: '#14b8a618', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={20} style={{ color: '#14b8a6' }} />
            </div>
            <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>Search Candidates</span>
          </Link>
          <Link to="/app/applications" className="card card-hover" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', textDecoration: 'none', color: 'inherit' }}>
            <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-lg)', background: '#3b82f618', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={20} style={{ color: '#3b82f6' }} />
            </div>
            <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>View Applications</span>
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}
