import { useEffect, useState } from 'react';
import { apprenticeApi } from '@/api/client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer
} from 'recharts';
import { Brain, ChevronRight, ChevronLeft, CheckCircle, Loader2, ArrowRight } from 'lucide-react';
import type { PsychometricResult } from '@/types';

const QUESTIONS = [
  { id: "o1", text: "I have a vivid imagination." },
  { id: "o2", text: "I am interested in abstract ideas." },
  { id: "o3", text: "I enjoy trying new things and experiences." },
  { id: "o4", text: "I prefer routine over variety." },
  { id: "o5", text: "I appreciate art and creative expression." },
  { id: "o6", text: "I am curious about many different things." },
  { id: "o7", text: "I prefer practical solutions over theoretical ones." },
  { id: "o8", text: "I enjoy learning about different cultures." },
  { id: "c1", text: "I am always prepared." },
  { id: "c2", text: "I pay attention to details." },
  { id: "c3", text: "I like to keep things organized." },
  { id: "c4", text: "I often forget to put things back in their place." },
  { id: "c5", text: "I follow through on plans I make." },
  { id: "c6", text: "I tend to procrastinate on tasks." },
  { id: "c7", text: "I set high standards for myself." },
  { id: "c8", text: "I complete tasks successfully." },
  { id: "e1", text: "I feel comfortable around people." },
  { id: "e2", text: "I start conversations with strangers." },
  { id: "e3", text: "I am the life of the party." },
  { id: "e4", text: "I prefer to be alone rather than in a group." },
  { id: "e5", text: "I enjoy being the center of attention." },
  { id: "e6", text: "I feel energized after social interactions." },
  { id: "e7", text: "I tend to keep in the background." },
  { id: "e8", text: "I am talkative." },
  { id: "a1", text: "I am interested in other people's problems." },
  { id: "a2", text: "I feel others' emotions." },
  { id: "a3", text: "I have a soft heart." },
  { id: "a4", text: "I am not really interested in others." },
  { id: "a5", text: "I take time out for others." },
  { id: "a6", text: "I make people feel at ease." },
  { id: "a7", text: "I insult people." },
  { id: "a8", text: "I am helpful and unselfish with others." },
  { id: "n1", text: "I get stressed out easily." },
  { id: "n2", text: "I worry about things." },
  { id: "n3", text: "I am easily disturbed." },
  { id: "n4", text: "I am relaxed most of the time." },
  { id: "n5", text: "I get upset easily." },
  { id: "n6", text: "I seldom feel blue." },
  { id: "n7", text: "I often feel anxious." },
  { id: "n8", text: "I remain calm under pressure." },
];

const LIKERT = [
  { value: 1, label: 'Strongly Disagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Neutral' },
  { value: 4, label: 'Agree' },
  { value: 5, label: 'Strongly Agree' },
];

const ITEMS_PER_PAGE = 5;

export default function PsychometricPage() {
  const [existing, setExisting] = useState<PsychometricResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [page, setPage] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [showTest, setShowTest] = useState(false);

  useEffect(() => {
    apprenticeApi.getPsychometric()
      .then(res => { if (res.data) setExisting(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const totalPages = Math.ceil(QUESTIONS.length / ITEMS_PER_PAGE);
  const currentQuestions = QUESTIONS.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / QUESTIONS.length) * 100;
  const allAnswered = answeredCount === QUESTIONS.length;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const result = await apprenticeApi.submitPsychometric(answers);
      setExisting(result.data);
      setShowTest(false);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Submission failed');
    }
    setSubmitting(false);
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner" /></div>;
  }

  // Show results if existing
  if (existing && !showTest) {
    const radarData = existing.scores ? [
      { trait: 'Openness', value: existing.scores.openness, fullMark: 100 },
      { trait: 'Conscientiousness', value: existing.scores.conscientiousness, fullMark: 100 },
      { trait: 'Extraversion', value: existing.scores.extraversion, fullMark: 100 },
      { trait: 'Agreeableness', value: existing.scores.agreeableness, fullMark: 100 },
      { trait: 'Stability', value: 100 - (existing.scores.neuroticism || 0), fullMark: 100 },
    ] : [];

    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Personality Profile</h1>
          <p className="page-subtitle">Your Big Five (OCEAN) personality assessment results.</p>
        </div>

        <div className="charts-grid">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="chart-card">
            <div className="chart-title">
              <Brain size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
              Your Personality Radar
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--border-color)" />
                <PolarAngleAxis dataKey="trait" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                <Radar name="Score" dataKey="value" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.25} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="chart-card">
            <div className="chart-title">Trait Breakdown</div>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {existing.trait_explanations && Object.entries(existing.trait_explanations).map(([trait, info]) => (
                <div key={trait} style={{ padding: '0.875rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.8125rem', textTransform: 'capitalize' }}>{trait}</span>
                    <span className={`badge ${info.level === 'high' ? 'badge-success' : info.level === 'low' ? 'badge-warning' : 'badge-info'}`}>
                      {info.score}% — {info.level}
                    </span>
                  </div>
                  <div className="progress-bar" style={{ marginBottom: '0.375rem' }}>
                    <div className="progress-bar-fill" style={{ width: `${info.score}%` }} />
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{info.description}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
          <div className="card">
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--color-success)' }}>✦ Strengths</h3>
            <ul style={{ paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              {(existing.strengths || []).map((s, i) => <li key={i} style={{ marginBottom: '0.375rem' }}>{s}</li>)}
            </ul>
          </div>
          <div className="card">
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--color-warning)' }}>⚡ Growth Areas</h3>
            <ul style={{ paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              {(existing.growth_areas || []).map((g, i) => <li key={i} style={{ marginBottom: '0.375rem' }}>{g}</li>)}
            </ul>
          </div>
        </div>

        <button className="btn btn-secondary" style={{ marginTop: '1.5rem' }} onClick={() => { setShowTest(true); setAnswers({}); setPage(0); }}>
          Retake Test
        </button>
      </div>
    );
  }

  // Show test
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Personality Assessment</h1>
        <p className="page-subtitle">Answer 40 questions to discover your Big Five personality profile.</p>
      </div>

      {/* Progress */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            {answeredCount} of {QUESTIONS.length} answered
          </span>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{Math.round(progress)}%</span>
        </div>
        <div className="progress-bar" style={{ height: '0.625rem' }}>
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Questions */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Page {page + 1} of {totalPages}
            </div>
            {currentQuestions.map((q, i) => (
              <div key={q.id} style={{ marginBottom: i < currentQuestions.length - 1 ? '1.75rem' : 0 }}>
                <p style={{ fontWeight: 500, fontSize: '0.9375rem', marginBottom: '0.75rem' }}>
                  {page * ITEMS_PER_PAGE + i + 1}. {q.text}
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {LIKERT.map(opt => (
                    <button
                      key={opt.value}
                      className={`btn ${answers[q.id] === opt.value ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                      onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt.value }))}
                      style={{ flex: '1 1 auto', minWidth: 100 }}
                    >
                      {answers[q.id] === opt.value && <CheckCircle size={14} />}
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          className="btn btn-secondary"
          disabled={page === 0}
          onClick={() => setPage(p => p - 1)}
        >
          <ChevronLeft size={16} /> Previous
        </button>

        {page < totalPages - 1 ? (
          <button className="btn btn-primary" onClick={() => setPage(p => p + 1)}>
            Next <ChevronRight size={16} />
          </button>
        ) : (
          <button
            className="btn btn-primary"
            disabled={!allAnswered || submitting}
            onClick={handleSubmit}
          >
            {submitting ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle size={16} />}
            {submitting ? 'Submitting...' : 'Submit Assessment'}
          </button>
        )}
      </div>
    </div>
  );
}
