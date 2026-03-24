import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { analysisApi } from '@/api/client';
import { motion } from 'framer-motion';
import {
  Upload, FileText, Mic, Video, Brain, Loader2, CheckCircle, AlertCircle,
  Sparkles, BarChart3, ArrowRight
} from 'lucide-react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer
} from 'recharts';
import type { AnalysisResult } from '@/types';

export default function AnalyzerPage() {
  const [inputType, setInputType] = useState<'text' | 'pdf'>('text');
  const [textInput, setTextInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');
  const [pollingMsg, setPollingMsg] = useState('');

  const handleAnalyze = async () => {
    setError('');
    setResult(null);
    setLoading(true);

    try {
      let jobRes;
      if (inputType === 'text') {
        if (!textInput.trim()) { setError('Please enter some text to analyze'); setLoading(false); return; }
        jobRes = await analysisApi.analyzeText({ input_type: 'text', input_text: textInput });
      } else {
        if (!file) { setError('Please select a file'); setLoading(false); return; }
        jobRes = await analysisApi.analyzeFile(file, 'pdf');
      }

      const jobId = jobRes.data.id;
      setPollingMsg('Processing your profile...');

      // Poll for completion
      let attempts = 0;
      while (attempts < 30) {
        await new Promise(r => setTimeout(r, 2000));
        const status = await analysisApi.getJobStatus(jobId);
        if (status.data.status === 'completed') {
          const resultRes = await analysisApi.getJobResult(jobId);
          setResult(resultRes.data);
          break;
        } else if (status.data.status === 'failed') {
          setError(status.data.error_message || 'Analysis failed');
          break;
        }
        attempts++;
        setPollingMsg(`Analyzing... (${attempts * 2}s)`);
      }

      if (attempts >= 30) setError('Analysis timed out. Please try again.');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Analysis failed');
    }
    setLoading(false);
    setPollingMsg('');
  };

  const radarData = result?.personality_scores ? [
    { trait: 'Openness', value: result.personality_scores.openness },
    { trait: 'Conscient.', value: result.personality_scores.conscientiousness },
    { trait: 'Extraversion', value: result.personality_scores.extraversion },
    { trait: 'Agreeable.', value: result.personality_scores.agreeableness },
    { trait: 'Stability', value: 100 - (result.personality_scores.neuroticism || 0) },
  ] : [];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">AI Profile Analyzer</h1>
        <p className="page-subtitle">Upload your CV or paste your profile text for AI-powered analysis.</p>
      </div>

      {/* Input Section */}
      {!result && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <button
              className={`btn ${inputType === 'text' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setInputType('text')}
            >
              <FileText size={16} /> Paste Text
            </button>
            <button
              className={`btn ${inputType === 'pdf' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setInputType('pdf')}
            >
              <Upload size={16} /> Upload PDF
            </button>
          </div>

          {inputType === 'text' ? (
            <div>
              <label className="label">Paste your CV / profile text</label>
              <textarea
                className="input"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Paste your CV content, LinkedIn summary, or professional profile here..."
                style={{ minHeight: 200, fontFamily: 'var(--font-sans)' }}
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                {textInput.length} characters · For best results, include your skills, experience, and education.
              </p>
            </div>
          ) : (
            <div>
              <label className="label">Upload your CV (PDF)</label>
              <div
                style={{
                  border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-xl)',
                  padding: '3rem', textAlign: 'center', cursor: 'pointer',
                  background: file ? 'rgb(99 102 241 / 0.05)' : 'transparent',
                  transition: 'all 0.2s',
                }}
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <input
                  id="file-input"
                  type="file"
                  accept=".pdf"
                  style={{ display: 'none' }}
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                {file ? (
                  <div>
                    <CheckCircle size={32} style={{ color: 'var(--color-success)', marginBottom: '0.5rem' }} />
                    <p style={{ fontWeight: 500 }}>{file.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div>
                    <Upload size={32} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }} />
                    <p style={{ color: 'var(--text-secondary)' }}>Click to upload or drag and drop</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PDF files up to 50MB</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: 'var(--radius-lg)', background: 'rgb(239 68 68 / 0.1)', border: '1px solid rgb(239 68 68 / 0.2)', marginTop: '1rem', fontSize: '0.8125rem', color: '#f87171' }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <button
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '1.5rem' }}
            onClick={handleAnalyze}
            disabled={loading}
          >
            {loading ? (
              <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> {pollingMsg || 'Analyzing...'}</>
            ) : (
              <><Brain size={18} /> Analyze with AI</>
            )}
          </button>
        </motion.div>
      )}

      {/* Results */}
      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Summary */}
          <div className="card" style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--color-primary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Sparkles size={18} style={{ color: 'var(--color-primary-light)' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>AI Summary</h3>
              {result.confidence_score && (
                <span className="badge badge-success" style={{ marginLeft: 'auto' }}>
                  {Math.round(result.confidence_score * 100)}% confidence
                </span>
              )}
            </div>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              {result.candidate_summary || result.ai_insights?.candidate_summary || 'Analysis complete.'}
            </p>
          </div>

          <div className="charts-grid">
            {/* Personality */}
            {radarData.length > 0 && (
              <div className="chart-card">
                <div className="chart-title"><Brain size={16} style={{ display: 'inline', marginRight: '0.5rem' }} /> Personality Profile</div>
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="var(--border-color)" />
                    <PolarAngleAxis dataKey="trait" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                    <PolarRadiusAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} domain={[0, 100]} />
                    <Radar name="Score" dataKey="value" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.2} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Skills & Insights */}
            <div className="chart-card">
              <div className="chart-title"><BarChart3 size={16} style={{ display: 'inline', marginRight: '0.5rem' }} /> Detected Skills</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {(result.skills_detected || []).map(skill => (
                  <span key={skill} className="badge badge-primary">{skill}</span>
                ))}
                {(!result.skills_detected || result.skills_detected.length === 0) && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No skills detected</p>
                )}
              </div>

              {result.ai_insights?.strengths && (
                <div style={{ marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-success)' }}>✦ Strengths</h4>
                  <ul style={{ paddingLeft: '1.25rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    {result.ai_insights.strengths.map((s, i) => <li key={i} style={{ marginBottom: '0.25rem' }}>{s}</li>)}
                  </ul>
                </div>
              )}

              {result.ai_insights?.gaps && (
                <div>
                  <h4 style={{ fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-warning)' }}>⚡ Growth Areas</h4>
                  <ul style={{ paddingLeft: '1.25rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    {result.ai_insights.gaps.map((g, i) => <li key={i} style={{ marginBottom: '0.25rem' }}>{g}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Detailed Insights */}
          {result.ai_insights && (
            <div className="card" style={{ marginTop: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Detailed Insights</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                {result.ai_insights.communication_style && (
                  <div style={{ padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)' }}>
                    <h4 style={{ fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>Communication Style</h4>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{result.ai_insights.communication_style}</p>
                  </div>
                )}
                {result.ai_insights.role_fit && (
                  <div style={{ padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)' }}>
                    <h4 style={{ fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>Best Role Fit</h4>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{result.ai_insights.role_fit}</p>
                  </div>
                )}
                {result.ai_insights.learning_potential && (
                  <div style={{ padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)' }}>
                    <h4 style={{ fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>Learning Potential</h4>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{result.ai_insights.learning_potential}</p>
                  </div>
                )}
              </div>

              {result.ai_insights.recommended_paths && result.ai_insights.recommended_paths.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <h4 style={{ fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.5rem' }}>Recommended Paths</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {result.ai_insights.recommended_paths.map((p, i) => (
                      <span key={i} className="badge badge-info">{p}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Reset */}
          <button
            className="btn btn-secondary"
            style={{ marginTop: '1.5rem' }}
            onClick={() => { setResult(null); setTextInput(''); setFile(null); }}
          >
            Analyze Another Profile
          </button>
        </motion.div>
      )}
    </div>
  );
}
