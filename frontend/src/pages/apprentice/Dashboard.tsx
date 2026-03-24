import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apprenticeApi } from '@/api/client';
import { motion } from 'framer-motion';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';
import {
  FileText, Brain, TrendingUp, CheckCircle, Target, Briefcase, Sparkles, ArrowRight, Upload
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { DashboardStats } from '@/types';

export default function ApprenticeDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apprenticeApi.dashboard().then(res => {
      setStats(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner" /></div>;
  }

  const s = stats?.stats || {};
  const personalityScores = stats?.charts_data?.personality_scores;
  const skills = stats?.charts_data?.skills || [];

  const radarData = personalityScores ? [
    { trait: 'Openness', value: personalityScores.openness },
    { trait: 'Conscient.', value: personalityScores.conscientiousness },
    { trait: 'Extraversion', value: personalityScores.extraversion },
    { trait: 'Agreeable.', value: personalityScores.agreeableness },
    { trait: 'Stability', value: 100 - (personalityScores.neuroticism || 0) },
  ] : [];

  const skillsData = skills.map((s: string, i: number) => ({ name: s, proficiency: 60 + Math.random() * 35 }));

  const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
  const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Welcome back, {user?.first_name} 👋</h1>
        <p className="page-subtitle">Here's what's happening with your apprenticeship journey.</p>
      </div>

      {/* Stats Grid */}
      <motion.div variants={item} className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgb(99 102 241 / 0.12)' }}>
            <Target size={20} style={{ color: 'var(--color-primary-light)' }} />
          </div>
          <div>
            <div className="stat-value">{s.profile_completeness || 0}%</div>
            <div className="stat-label">Profile Complete</div>
            <div className="progress-bar" style={{ width: 120, marginTop: '0.5rem' }}>
              <div className="progress-bar-fill" style={{ width: `${s.profile_completeness || 0}%` }} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgb(59 130 246 / 0.12)' }}>
            <FileText size={20} style={{ color: '#60a5fa' }} />
          </div>
          <div>
            <div className="stat-value">{s.total_applications || 0}</div>
            <div className="stat-label">Applications</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgb(245 158 11 / 0.12)' }}>
            <Brain size={20} style={{ color: '#fbbf24' }} />
          </div>
          <div>
            <div className="stat-value">{s.total_analyses || 0}</div>
            <div className="stat-label">AI Analyses</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgb(34 197 94 / 0.12)' }}>
            <CheckCircle size={20} style={{ color: '#4ade80' }} />
          </div>
          <div>
            <div className="stat-value">{s.completed_assessments || 0}</div>
            <div className="stat-label">Assessments Done</div>
          </div>
        </div>
      </motion.div>

      {/* Charts Row */}
      <div className="charts-grid">
        {/* Personality Radar */}
        <motion.div variants={item} className="chart-card">
          <div className="chart-title">
            <Brain size={16} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
            Personality Profile
          </div>
          {radarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--border-color)" />
                <PolarAngleAxis dataKey="trait" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <PolarRadiusAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} domain={[0, 100]} />
                <Radar name="Score" dataKey="value" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">
              <Brain size={32} />
              <p>Take the personality test to see your profile</p>
              <Link to="/app/psychometric" className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem' }}>
                Start Test <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </motion.div>

        {/* Skills Chart */}
        <motion.div variants={item} className="chart-card">
          <div className="chart-title">
            <TrendingUp size={16} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
            Skills Overview
          </div>
          {skillsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={skillsData} layout="vertical" margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} width={100} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', fontSize: '0.8125rem' }}
                  labelStyle={{ color: 'var(--text-primary)' }}
                />
                <Bar dataKey="proficiency" fill="var(--color-primary)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">
              <Sparkles size={32} />
              <p>Add skills to your profile to see them here</p>
              <Link to="/app/profile" className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem' }}>
                Edit Profile <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div variants={item}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Quick Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
          {[
            { label: 'Browse Opportunities', icon: Briefcase, path: '/app/opportunities', color: '#6366f1' },
            { label: 'Complete Profile', icon: Target, path: '/app/profile', color: '#14b8a6' },
            { label: 'Personality Test', icon: Brain, path: '/app/psychometric', color: '#f59e0b' },
            { label: 'AI Analyzer', icon: Upload, path: '/app/analyzer', color: '#3b82f6' },
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
