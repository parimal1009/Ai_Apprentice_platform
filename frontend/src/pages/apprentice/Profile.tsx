import { useEffect, useState } from 'react';
import { apprenticeApi } from '@/api/client';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { User, Save, Plus, X, Loader2, CheckCircle, Target } from 'lucide-react';
import type { ApprenticeProfile } from '@/types';

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ApprenticeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    apprenticeApi.getProfile()
      .then(res => { setProfile(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const res = await apprenticeApi.updateProfile(profile);
      setProfile(res.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to save');
    }
    setSaving(false);
  };

  const addSkill = () => {
    if (newSkill.trim() && profile) {
      setProfile({ ...profile, skills: [...(profile.skills || []), newSkill.trim()] });
      setNewSkill('');
    }
  };

  const removeSkill = (index: number) => {
    if (profile) {
      setProfile({ ...profile, skills: profile.skills.filter((_, i) => i !== index) });
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner" /></div>;
  if (!profile) return <div className="card empty-state"><p>Profile not found</p></div>;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Complete your profile to attract the best opportunities.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Target size={16} style={{ color: 'var(--color-primary-light)' }} />
            <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{profile.profile_completeness}%</span>
            <div className="progress-bar" style={{ width: 100 }}>
              <div className="progress-bar-fill" style={{ width: `${profile.profile_completeness}%` }} />
            </div>
          </div>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : saved ? <CheckCircle size={16} /> : <Save size={16} />}
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Profile'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {/* Personal Info */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={18} /> Personal Information
          </h3>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <div>
              <label className="label">Headline</label>
              <input className="input" value={profile.headline || ''} onChange={(e) => setProfile({ ...profile, headline: e.target.value })} placeholder="e.g., Aspiring Software Developer" />
            </div>
            <div>
              <label className="label">Bio</label>
              <textarea className="input" value={profile.bio || ''} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} placeholder="Tell us about yourself..." style={{ minHeight: 100 }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label className="label">Phone</label>
                <input className="input" value={profile.phone || ''} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="+44 7700 900123" />
              </div>
              <div>
                <label className="label">City</label>
                <input className="input" value={profile.city || ''} onChange={(e) => setProfile({ ...profile, city: e.target.value })} placeholder="London" />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label className="label">Postcode</label>
                <input className="input" value={profile.postcode || ''} onChange={(e) => setProfile({ ...profile, postcode: e.target.value })} placeholder="SW1A 1AA" />
              </div>
              <div>
                <label className="label">Date of Birth</label>
                <input className="input" type="date" value={profile.date_of_birth || ''} onChange={(e) => setProfile({ ...profile, date_of_birth: e.target.value })} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Skills */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem' }}>Skills</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
            {(profile.skills || []).map((skill, i) => (
              <span key={i} className="badge badge-primary" style={{ padding: '0.375rem 0.75rem', cursor: 'pointer' }} onClick={() => removeSkill(i)}>
                {skill} <X size={12} style={{ marginLeft: '0.25rem' }} />
              </span>
            ))}
            {(!profile.skills || profile.skills.length === 0) && (
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>No skills added yet</span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              className="input"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add a skill..."
              onKeyDown={(e) => e.key === 'Enter' && addSkill()}
              style={{ flex: 1 }}
            />
            <button className="btn btn-primary btn-sm" onClick={addSkill}><Plus size={16} /></button>
          </div>
        </motion.div>

        {/* Preferences */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem' }}>Preferences</h3>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <div>
              <label className="label">Work Preference</label>
              <select className="select" value={profile.work_preference || ''} onChange={(e) => setProfile({ ...profile, work_preference: e.target.value })}>
                <option value="">Select preference</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">On-site</option>
              </select>
            </div>
            <div>
              <label className="label">Availability</label>
              <select className="select" value={profile.availability || ''} onChange={(e) => setProfile({ ...profile, availability: e.target.value })}>
                <option value="">Select availability</option>
                <option value="immediate">Immediate</option>
                <option value="1_month">Within 1 month</option>
                <option value="3_months">Within 3 months</option>
                <option value="6_months">Within 6 months</option>
              </select>
            </div>
            <div>
              <label className="label">Apprenticeship Level</label>
              <select className="select" value={profile.apprenticeship_level || ''} onChange={(e) => setProfile({ ...profile, apprenticeship_level: e.target.value })}>
                <option value="">Select level</option>
                <option value="level_2">Level 2 (Intermediate)</option>
                <option value="level_3">Level 3 (Advanced)</option>
                <option value="level_4">Level 4 (Higher)</option>
                <option value="level_5">Level 5 (Foundation Degree)</option>
                <option value="level_6">Level 6 (Degree)</option>
                <option value="level_7">Level 7 (Master's)</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Languages */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card">
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem' }}>Languages</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {(profile.languages || []).map((lang, i) => (
              <span key={i} className="badge badge-info" style={{ padding: '0.375rem 0.75rem' }}>{lang}</span>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
