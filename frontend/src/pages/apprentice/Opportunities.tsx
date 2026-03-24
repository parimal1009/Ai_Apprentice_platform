import { useEffect, useState } from 'react';
import { publicApi, apprenticeApi } from '@/api/client';
import { motion } from 'framer-motion';
import { Search, MapPin, Clock, Briefcase, Building2, Filter, X, ExternalLink, Heart } from 'lucide-react';
import type { Listing } from '@/types';

export default function OpportunitiesPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ sector: '', location: '', work_type: '' });
  const [selected, setSelected] = useState<Listing | null>(null);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    publicApi.getListings({ search: search || undefined, ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v)) })
      .then(res => { setListings(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [search, filters]);

  const handleApply = async (listingId: number) => {
    setApplying(true);
    try {
      await apprenticeApi.createApplication({ listing_id: listingId });
      alert('Application submitted successfully!');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to apply');
    }
    setApplying(false);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Opportunities</h1>
        <p className="page-subtitle">Browse and apply to apprenticeship positions.</p>
      </div>

      {/* Search & Filters */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 300px' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              className="input"
              placeholder="Search by title, company, or skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.25rem' }}
            />
          </div>
          <select className="select" value={filters.sector} onChange={(e) => setFilters(p => ({ ...p, sector: e.target.value }))} style={{ width: 180 }}>
            <option value="">All Sectors</option>
            <option value="IT & Technology">IT & Technology</option>
            <option value="Marketing">Marketing</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Finance">Finance</option>
          </select>
          <select className="select" value={filters.work_type} onChange={(e) => setFilters(p => ({ ...p, work_type: e.target.value }))} style={{ width: 150 }}>
            <option value="">All Types</option>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
            <option value="onsite">On-site</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner" /></div>
      ) : listings.length === 0 ? (
        <div className="card empty-state">
          <Briefcase size={48} />
          <h3 style={{ marginTop: '0.5rem' }}>No opportunities found</h3>
          <p>Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {listings.map((listing, i) => (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card card-hover"
              style={{ cursor: 'pointer' }}
              onClick={() => setSelected(listing)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, marginBottom: '0.375rem' }}>{listing.title}</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                    {listing.company && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Building2 size={14} /> {listing.company.company_name}
                      </span>
                    )}
                    {listing.location && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <MapPin size={14} /> {listing.location}
                      </span>
                    )}
                    {listing.duration && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={14} /> {listing.duration}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {listing.description}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginTop: '0.75rem' }}>
                    {listing.skills_required.slice(0, 4).map(skill => (
                      <span key={skill} className="badge badge-primary">{skill}</span>
                    ))}
                    {listing.level && <span className="badge badge-info">{listing.level}</span>}
                    {listing.work_type && <span className="badge badge-success" style={{ textTransform: 'capitalize' }}>{listing.work_type}</span>}
                  </div>
                </div>
                <div style={{ textAlign: 'right', minWidth: 120 }}>
                  {listing.salary_range && (
                    <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-success)', marginBottom: '0.375rem' }}>
                      {listing.salary_range}
                    </div>
                  )}
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={(e) => { e.stopPropagation(); handleApply(listing.id); }}
                    disabled={applying}
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="overlay" onClick={() => setSelected(null)}>
          <motion.div
            className="modal"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ maxWidth: 640, maxHeight: '90vh', overflow: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{selected.title}</h2>
                {selected.company && <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{selected.company.company_name}</p>}
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setSelected(null)}><X size={20} /></button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
              {selected.location && <span className="badge badge-info"><MapPin size={12} /> {selected.location}</span>}
              {selected.work_type && <span className="badge badge-success" style={{ textTransform: 'capitalize' }}>{selected.work_type}</span>}
              {selected.level && <span className="badge badge-primary">{selected.level}</span>}
              {selected.duration && <span className="badge badge-warning"><Clock size={12} /> {selected.duration}</span>}
            </div>

            {selected.salary_range && (
              <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-success)', marginBottom: '1rem' }}>{selected.salary_range}</div>
            )}

            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Description</h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{selected.description}</p>
            </div>

            {selected.requirements && (
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Requirements</h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{selected.requirements}</p>
              </div>
            )}

            {selected.skills_required.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Required Skills</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                  {selected.skills_required.map(s => <span key={s} className="badge badge-primary">{s}</span>)}
                </div>
              </div>
            )}

            {selected.benefits.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Benefits</h4>
                <ul style={{ paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  {selected.benefits.map(b => <li key={b} style={{ marginBottom: '0.25rem' }}>{b}</li>)}
                </ul>
              </div>
            )}

            <button
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
              onClick={() => handleApply(selected.id)}
              disabled={applying}
            >
              Apply for this Position
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
