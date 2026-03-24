import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { Shield, Eye, EyeOff, AlertCircle, Loader2, GraduationCap, Building2, BookOpen } from 'lucide-react';

const roles = [
  { value: 'apprentice', label: 'Apprentice', icon: GraduationCap, desc: 'Find apprenticeships' },
  { value: 'company', label: 'Company', icon: Building2, desc: 'Hire apprentices' },
  { value: 'training_provider', label: 'Training Provider', icon: BookOpen, desc: 'Manage programs' },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', first_name: '', last_name: '', role: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.role) { setError('Please select a role'); return; }
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/app/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
      padding: '1rem',
    }}>
      <div style={{ position: 'fixed', top: '-20%', left: '-10%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(20,184,166,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ width: '100%', maxWidth: 480 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 'var(--radius-xl)', margin: '0 auto 1rem',
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 30px rgba(99,102,241,0.3)',
          }}>
            <Shield size={28} color="white" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}><span className="gradient-text">Create Account</span></h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>Join the AI Apprentice Platform</p>
        </div>

        <div className="glass-card" style={{ padding: '2rem' }}>
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: 'var(--radius-lg)', background: 'rgb(239 68 68 / 0.1)', border: '1px solid rgb(239 68 68 / 0.2)', marginBottom: '1.25rem', fontSize: '0.8125rem', color: '#f87171' }}>
                <AlertCircle size={16} /> {error}
              </div>
            )}

            {/* Role Selection */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label className="label">I am a...</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                {roles.map((r) => (
                  <button
                    type="button"
                    key={r.value}
                    onClick={() => setForm(prev => ({ ...prev, role: r.value }))}
                    style={{
                      padding: '0.875rem 0.5rem', borderRadius: 'var(--radius-lg)',
                      border: `2px solid ${form.role === r.value ? 'var(--color-primary)' : 'var(--border-color)'}`,
                      background: form.role === r.value ? 'rgb(99 102 241 / 0.08)' : 'var(--bg-tertiary)',
                      cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                    }}
                  >
                    <r.icon size={22} style={{ margin: '0 auto 0.375rem', color: form.role === r.value ? 'var(--color-primary-light)' : 'var(--text-muted)' }} />
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: form.role === r.value ? 'var(--color-primary-light)' : 'var(--text-primary)' }}>{r.label}</div>
                    <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>{r.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div>
                <label className="label">First Name</label>
                <input className="input" placeholder="John" value={form.first_name} onChange={(e) => setForm(p => ({ ...p, first_name: e.target.value }))} required />
              </div>
              <div>
                <label className="label">Last Name</label>
                <input className="input" placeholder="Doe" value={form.last_name} onChange={(e) => setForm(p => ({ ...p, last_name: e.target.value }))} required />
              </div>
            </div>

            <div style={{ marginBottom: '0.75rem' }}>
              <label className="label">Email</label>
              <input type="email" className="input" placeholder="name@example.com" value={form.email} onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))} required />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label className="label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input"
                  placeholder="Min 8 chars, uppercase + digit"
                  value={form.password}
                  onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))}
                  required
                  style={{ paddingRight: '2.5rem' }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%' }}>
              {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : null}
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--color-primary-light)', textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
