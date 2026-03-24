import { useEffect, useState } from 'react';
import { apprenticeApi } from '@/api/client';
import { motion } from 'framer-motion';
import { FileText, Clock, CheckCircle, XCircle, ArrowRight, Building2, MapPin } from 'lucide-react';
import type { Application } from '@/types';

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  pending: { color: '#fbbf24', bg: 'rgb(245 158 11 / 0.12)', label: 'Pending' },
  reviewing: { color: '#60a5fa', bg: 'rgb(59 130 246 / 0.12)', label: 'Under Review' },
  shortlisted: { color: '#818cf8', bg: 'rgb(99 102 241 / 0.12)', label: 'Shortlisted' },
  interview: { color: '#14b8a6', bg: 'rgb(20 184 166 / 0.12)', label: 'Interview' },
  offered: { color: '#4ade80', bg: 'rgb(34 197 94 / 0.12)', label: 'Offered' },
  accepted: { color: '#22c55e', bg: 'rgb(34 197 94 / 0.15)', label: 'Accepted' },
  rejected: { color: '#f87171', bg: 'rgb(239 68 68 / 0.12)', label: 'Rejected' },
  withdrawn: { color: '#94a3b8', bg: 'rgb(148 163 184 / 0.12)', label: 'Withdrawn' },
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    apprenticeApi.getApplications()
      .then(res => { setApplications(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? applications : applications.filter(a => a.status === filter);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Applications</h1>
        <p className="page-subtitle">Track the status of your apprenticeship applications.</p>
      </div>

      {/* Filters */}
      <div className="tabs" style={{ marginBottom: '1.5rem' }}>
        {['all', 'pending', 'shortlisted', 'interview', 'offered', 'rejected'].map(status => (
          <button
            key={status}
            className={`tab ${filter === status ? 'active' : ''}`}
            onClick={() => setFilter(status)}
          >
            {status === 'all' ? 'All' : statusConfig[status]?.label || status}
            {status === 'all' && ` (${applications.length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="card empty-state">
          <FileText size={48} />
          <h3 style={{ marginTop: '0.5rem' }}>No applications found</h3>
          <p>Start browsing opportunities to submit your first application.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {filtered.map((app, i) => {
            const sc = statusConfig[app.status] || statusConfig.pending;
            return (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="card card-hover"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                      {app.listing?.title || `Application #${app.id}`}
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      {app.listing?.company && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Building2 size={14} /> {app.listing.company.company_name}
                        </span>
                      )}
                      {app.listing?.location && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <MapPin size={14} /> {app.listing.location}
                        </span>
                      )}
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={14} /> {app.applied_at ? new Date(app.applied_at).toLocaleDateString() : 'Recently'}
                      </span>
                    </div>
                    {app.cover_letter && (
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {app.cover_letter}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span
                      className="badge"
                      style={{ background: sc.bg, color: sc.color, padding: '0.375rem 0.875rem', fontSize: '0.8125rem' }}
                    >
                      {sc.label}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
