import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, ArrowRight, Sparkles, Users, Brain, BarChart3, GraduationCap, Building2, BookOpen, CheckCircle } from 'lucide-react';

const features = [
  { icon: Brain, title: 'AI-Powered Analysis', desc: 'Smart candidate profiling with LLM-generated insights, personality analysis, and skill detection.' },
  { icon: Users, title: 'Multi-Role Platform', desc: 'Tailored experiences for apprentices, companies, training providers, and administrators.' },
  { icon: BarChart3, title: 'Rich Analytics', desc: 'Interactive dashboards with charts, reports, and actionable metrics for every stakeholder.' },
  { icon: Sparkles, title: 'Smart Matching', desc: 'AI-driven recommendations connecting the right candidates with the right opportunities.' },
];

const stats = [
  { value: '10K+', label: 'Active Apprentices' },
  { value: '500+', label: 'Partner Companies' },
  { value: '95%', label: 'Placement Rate' },
  { value: '50+', label: 'Training Providers' },
];

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Header */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(71, 85, 105, 0.2)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0.875rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Shield size={20} color="white" />
            </div>
            <span style={{ fontSize: '1.125rem', fontWeight: 700 }} className="gradient-text">AI Apprentice</span>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/login" className="btn btn-ghost">Sign In</Link>
            <Link to="/register" className="btn btn-primary">Get Started <ArrowRight size={16} /></Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section style={{ paddingTop: '8rem', paddingBottom: '5rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: 800, height: 800, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '30%', left: '20%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(20,184,166,0.05) 0%, transparent 60%)', pointerEvents: 'none' }} />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          style={{ maxWidth: 800, margin: '0 auto', padding: '0 1.5rem', position: 'relative' }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 1rem', borderRadius: '9999px', background: 'rgb(99 102 241 / 0.1)', border: '1px solid rgb(99 102 241 / 0.2)', marginBottom: '1.5rem', fontSize: '0.8125rem', color: 'var(--color-primary-light)' }}>
            <Sparkles size={14} /> AI-Powered Apprenticeship Management
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.75rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem' }}>
            The Future of<br />
            <span className="gradient-text">Apprenticeship Management</span>
          </h1>
          <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
            Connect apprentices with companies and training providers through AI-driven insights,
            personality analysis, and smart matching — all in one beautiful platform.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary btn-lg" style={{ fontSize: '1rem', padding: '0.875rem 2rem' }}>
              Start Free <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn btn-secondary btn-lg" style={{ fontSize: '1rem', padding: '0.875rem 2rem' }}>
              View Demo
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '0 1.5rem 4rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass-card"
              style={{ padding: '1.5rem', textAlign: 'center' }}
            >
              <div style={{ fontSize: '2rem', fontWeight: 800 }} className="gradient-text">{stat.value}</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.75rem' }}>Powerful Features</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto' }}>
            Everything you need to manage the complete apprenticeship lifecycle.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="card card-hover"
            >
              <div style={{
                width: 48, height: 48, borderRadius: 'var(--radius-lg)',
                background: 'linear-gradient(135deg, rgb(99 102 241 / 0.15), rgb(20 184 166 / 0.1))',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem',
              }}>
                <f.icon size={24} style={{ color: 'var(--color-primary-light)' }} />
              </div>
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, marginBottom: '0.5rem' }}>{f.title}</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Roles */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.75rem' }}>Built for Everyone</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Tailored dashboards and workflows for every role.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {[
            { icon: GraduationCap, title: 'Apprentices', items: ['Discover opportunities', 'AI profile analysis', 'Personality insights', 'Track applications'] },
            { icon: Building2, title: 'Companies', items: ['Post apprenticeships', 'Search candidates', 'AI-powered matching', 'Application management'] },
            { icon: BookOpen, title: 'Training Providers', items: ['Manage cohorts', 'Create assessments', 'Track progress', 'Employer collaboration'] },
          ].map((role, i) => (
            <motion.div key={role.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }} className="card card-hover">
              <role.icon size={28} style={{ color: 'var(--color-primary-light)', marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>{role.title}</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {role.items.map((item) => (
                  <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    <CheckCircle size={14} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ textAlign: 'center', padding: '4rem 1.5rem 6rem' }}>
        <div className="glass-card" style={{ maxWidth: 700, margin: '0 auto', padding: '3rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.75rem' }}>Ready to Transform Apprenticeships?</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Join thousands of apprentices, companies, and training providers already using our platform.</p>
          <Link to="/register" className="btn btn-primary btn-lg" style={{ padding: '1rem 2.5rem', fontSize: '1rem' }}>
            Get Started Free <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-color)', textAlign: 'center', padding: '2rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
        © 2026 AI Apprentice Platform. Built with ❤️ for the future of learning.
      </footer>
    </div>
  );
}
