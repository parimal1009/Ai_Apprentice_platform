import { useState, useRef, useCallback, useEffect } from 'react';
import { analysisApi } from '@/api/client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer
} from 'recharts';
import {
  Video, VideoOff, Mic, MicOff, Camera, ChevronRight, ChevronLeft, SkipForward,
  Square, Circle, Loader2, CheckCircle, Brain, Sparkles, BarChart3, Download,
  AlertCircle, Clock, Play, RotateCcw, FileText
} from 'lucide-react';
import type { AnalysisResult } from '@/types';

const INTERVIEW_QUESTIONS = [
  { id: 1, text: "Tell us about yourself and why you're interested in an apprenticeship.", category: "Introduction", timeLimit: 120 },
  { id: 2, text: "What skills and strengths do you bring to the table?", category: "Skills", timeLimit: 90 },
  { id: 3, text: "Describe a challenge you've faced and how you overcame it.", category: "Problem Solving", timeLimit: 120 },
  { id: 4, text: "Where do you see yourself in 3-5 years?", category: "Goals", timeLimit: 90 },
  { id: 5, text: "How do you approach learning new things?", category: "Learning", timeLimit: 90 },
  { id: 6, text: "Tell us about a project or achievement you're proud of.", category: "Experience", timeLimit: 120 },
  { id: 7, text: "How do you handle working in a team?", category: "Teamwork", timeLimit: 90 },
  { id: 8, text: "What do you know about the industry you're applying to?", category: "Knowledge", timeLimit: 90 },
];

type RecordingState = 'idle' | 'preview' | 'countdown' | 'recording' | 'paused' | 'review';
type PageState = 'intro' | 'recording' | 'uploading' | 'processing' | 'report';

export default function VideoInterviewPage() {
  // Page state
  const [pageState, setPageState] = useState<PageState>('intro');
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [countdown, setCountdown] = useState(3);
  const [timer, setTimer] = useState(0);
  const [recordings, setRecordings] = useState<Map<number, Blob>>(new Map());
  const [skippedQuestions, setSkippedQuestions] = useState<Set<number>>(new Set());

  // Media refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const reviewVideoRef = useRef<HTMLVideoElement>(null);

  // Processing state
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState('');
  const [report, setReport] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');

  const currentQuestion = INTERVIEW_QUESTIONS[currentQIndex];
  const totalQuestions = INTERVIEW_QUESTIONS.length;

  // Start webcam
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: 'user' },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setRecordingState('preview');
    } catch (err) {
      setError('Camera access denied. Please allow camera and microphone permissions.');
    }
  }, []);

  // Stop webcam
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Start countdown then record
  const startRecording = useCallback(() => {
    setCountdown(3);
    setRecordingState('countdown');

    let c = 3;
    const countdownInterval = setInterval(() => {
      c--;
      setCountdown(c);
      if (c <= 0) {
        clearInterval(countdownInterval);
        actuallyStartRecording();
      }
    }, 1000);
  }, []);

  const actuallyStartRecording = useCallback(() => {
    if (!streamRef.current) return;

    chunksRef.current = [];
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
      ? 'video/webm;codecs=vp9,opus'
      : 'video/webm';

    const mediaRecorder = new MediaRecorder(streamRef.current, { mimeType });
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      const newRecordings = new Map(recordings);
      newRecordings.set(currentQIndex, blob);
      setRecordings(newRecordings);
      setRecordingState('review');

      // Show review video
      if (reviewVideoRef.current) {
        reviewVideoRef.current.src = URL.createObjectURL(blob);
      }
    };

    mediaRecorder.start(1000);
    setRecordingState('recording');
    setTimer(0);

    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev >= (currentQuestion?.timeLimit || 120)) {
          stopRecording();
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
  }, [recordings, currentQIndex, currentQuestion]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const retakeRecording = useCallback(() => {
    const newRecordings = new Map(recordings);
    newRecordings.delete(currentQIndex);
    setRecordings(newRecordings);
    setRecordingState('preview');
  }, [currentQIndex, recordings]);

  const skipQuestion = useCallback(() => {
    const newSkipped = new Set(skippedQuestions);
    newSkipped.add(currentQIndex);
    setSkippedQuestions(newSkipped);
    goToNextQuestion();
  }, [currentQIndex, skippedQuestions]);

  const goToNextQuestion = useCallback(() => {
    if (currentQIndex < totalQuestions - 1) {
      setCurrentQIndex(prev => prev + 1);
      setRecordingState('preview');
      setTimer(0);
    }
  }, [currentQIndex, totalQuestions]);

  const goToPrevQuestion = useCallback(() => {
    if (currentQIndex > 0) {
      setCurrentQIndex(prev => prev - 1);
      setRecordingState(recordings.has(currentQIndex - 1) ? 'review' : 'preview');
      setTimer(0);
    }
  }, [currentQIndex, recordings]);

  // Merge all recordings into one video and upload
  const submitRecordings = useCallback(async () => {
    stopCamera();
    setPageState('uploading');
    setError('');

    try {
      // Combine all recorded blobs into one
      const allBlobs: Blob[] = [];
      for (let i = 0; i < totalQuestions; i++) {
        if (recordings.has(i)) {
          allBlobs.push(recordings.get(i)!);
        }
      }

      if (allBlobs.length === 0) {
        setError('No recordings to submit. Please record at least one answer.');
        setPageState('recording');
        return;
      }

      const combinedBlob = new Blob(allBlobs, { type: 'video/webm' });
      const file = new File([combinedBlob], 'interview_recording.webm', { type: 'video/webm' });

      setUploadProgress(30);
      setProcessingStatus('Uploading your video interview...');

      // Upload to analysis API
      const jobRes = await analysisApi.analyzeFile(file, 'video');
      const jobId = jobRes.data.id;

      setUploadProgress(100);
      setPageState('processing');
      setProcessingStatus('AI is transcribing your responses...');

      // Poll for completion
      let attempts = 0;
      while (attempts < 60) {
        await new Promise(r => setTimeout(r, 3000));
        const status = await analysisApi.getJobStatus(jobId);

        if (status.data.status === 'completed') {
          setProcessingStatus('Generating your report...');
          const resultRes = await analysisApi.getJobResult(jobId);
          setReport(resultRes.data);
          setPageState('report');
          return;
        } else if (status.data.status === 'failed') {
          setError(status.data.error_message || 'Analysis failed. Please try again.');
          setPageState('intro');
          return;
        }

        attempts++;
        if (attempts < 10) setProcessingStatus('AI is transcribing your responses...');
        else if (attempts < 20) setProcessingStatus('Analyzing personality traits...');
        else if (attempts < 30) setProcessingStatus('Detecting skills and competencies...');
        else setProcessingStatus('Generating comprehensive report...');
      }

      setError('Processing timed out. Please try again.');
      setPageState('intro');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Upload failed. Please try again.');
      setPageState('intro');
    }
  }, [recordings, totalQuestions, stopCamera]);

  // Cleanup
  useEffect(() => {
    return () => {
      stopCamera();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stopCamera]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const answeredCount = recordings.size;
  const skippedCount = skippedQuestions.size;
  const isLastQuestion = currentQIndex === totalQuestions - 1;

  // ======================== INTRO PAGE ========================
  if (pageState === 'intro') {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Video Interview</h1>
          <p className="page-subtitle">Record your answers to interview questions for AI-powered analysis.</p>
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: 'var(--radius-lg)', background: 'rgb(239 68 68 / 0.1)', border: '1px solid rgb(239 68 68 / 0.2)', marginBottom: '1.5rem', fontSize: '0.8125rem', color: '#f87171' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{
            width: 80, height: 80, borderRadius: 'var(--radius-xl)', margin: '0 auto 1.5rem',
            background: 'linear-gradient(135deg, rgb(99 102 241 / 0.15), rgb(20 184 166 / 0.1))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Video size={36} style={{ color: 'var(--color-primary-light)' }} />
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>AI-Powered Video Interview</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto 2rem', lineHeight: 1.7 }}>
            Answer {totalQuestions} interview questions on camera. Your responses will be transcribed
            and analyzed by our AI to generate a comprehensive personality & skills report.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', maxWidth: 700, margin: '0 auto 2rem' }}>
            {[
              { icon: Camera, label: 'Record Answers', desc: 'One question at a time' },
              { icon: Brain, label: 'AI Analysis', desc: 'Speech → text → insights' },
              { icon: FileText, label: 'Full Report', desc: 'Personality, skills & more' },
            ].map((step, i) => (
              <div key={step.label} style={{ padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
                <step.icon size={24} style={{ color: 'var(--color-primary-light)', marginBottom: '0.5rem' }} />
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{step.label}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{step.desc}</div>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem', textAlign: 'left' }}>Interview Questions:</h3>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {INTERVIEW_QUESTIONS.map((q, i) => (
                <div key={q.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.875rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)', textAlign: 'left' }}>
                  <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgb(99 102 241 / 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary-light)', flexShrink: 0 }}>{i + 1}</span>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', flex: 1 }}>{q.text}</span>
                  <span className="badge badge-info" style={{ fontSize: '0.6875rem' }}>{formatTime(q.timeLimit)}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary btn-lg"
              onClick={() => { setPageState('recording'); startCamera(); }}
              style={{ padding: '1rem 2.5rem' }}
            >
              <Camera size={20} /> Start Interview
            </button>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
            You can skip questions you don't want to answer. Requires camera & microphone access.
          </p>
        </motion.div>
      </div>
    );
  }

  // ======================== RECORDING PAGE ========================
  if (pageState === 'recording') {
    return (
      <div>
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="page-title">Question {currentQIndex + 1} of {totalQuestions}</h1>
            <p className="page-subtitle">{answeredCount} answered · {skippedCount} skipped</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {isLastQuestion && answeredCount > 0 && (
              <button className="btn btn-primary" onClick={submitRecordings}>
                <CheckCircle size={16} /> Finish & Analyze
              </button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="progress-bar" style={{ marginBottom: '1.5rem', height: '0.5rem' }}>
          <div className="progress-bar-fill" style={{ width: `${((currentQIndex + 1) / totalQuestions) * 100}%` }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem' }}>
          {/* Video area */}
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            {/* Question banner */}
            <div style={{ padding: '1rem 1.5rem', background: 'linear-gradient(90deg, rgb(99 102 241 / 0.12), rgb(20 184 166 / 0.08))', borderBottom: '1px solid var(--border-color)' }}>
              <span className="badge badge-primary" style={{ marginBottom: '0.375rem' }}>{currentQuestion.category}</span>
              <p style={{ fontSize: '1rem', fontWeight: 600, lineHeight: 1.5 }}>{currentQuestion.text}</p>
            </div>

            {/* Video */}
            <div style={{ position: 'relative', background: '#000', aspectRatio: '16/9' }}>
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                style={{
                  width: '100%', height: '100%', objectFit: 'cover',
                  display: recordingState === 'review' ? 'none' : 'block',
                  transform: 'scaleX(-1)',
                }}
              />

              {recordingState === 'review' && (
                <video
                  ref={reviewVideoRef}
                  controls
                  playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )}

              {/* Countdown overlay */}
              {recordingState === 'countdown' && (
                <div style={{
                  position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(0,0,0,0.6)', zIndex: 10,
                }}>
                  <motion.div
                    key={countdown}
                    initial={{ scale: 2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    style={{ fontSize: '6rem', fontWeight: 800, color: 'white' }}
                  >
                    {countdown}
                  </motion.div>
                </div>
              )}

              {/* Recording indicator */}
              {recordingState === 'recording' && (
                <div style={{
                  position: 'absolute', top: '1rem', left: '1rem',
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.375rem 0.75rem', borderRadius: 'var(--radius-lg)',
                  background: 'rgba(239, 68, 68, 0.9)', color: 'white', fontSize: '0.8125rem', fontWeight: 600,
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white', animation: 'pulse-glow 1.5s infinite' }} />
                  REC {formatTime(timer)}
                </div>
              )}

              {/* Time limit indicator */}
              {recordingState === 'recording' && (
                <div style={{
                  position: 'absolute', top: '1rem', right: '1rem',
                  padding: '0.375rem 0.75rem', borderRadius: 'var(--radius-lg)',
                  background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '0.8125rem',
                }}>
                  <Clock size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.25rem' }} />
                  {formatTime(currentQuestion.timeLimit - timer)} left
                </div>
              )}
            </div>

            {/* Controls */}
            <div style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              {recordingState === 'preview' && (
                <>
                  <button className="btn btn-primary btn-lg" onClick={startRecording}>
                    <Circle size={18} /> Start Recording
                  </button>
                  <button className="btn btn-secondary" onClick={skipQuestion}>
                    <SkipForward size={16} /> Skip
                  </button>
                </>
              )}

              {recordingState === 'recording' && (
                <button className="btn btn-danger btn-lg" onClick={stopRecording}>
                  <Square size={18} /> Stop Recording
                </button>
              )}

              {recordingState === 'review' && (
                <>
                  <button className="btn btn-secondary" onClick={retakeRecording}>
                    <RotateCcw size={16} /> Retake
                  </button>
                  {!isLastQuestion ? (
                    <button className="btn btn-primary" onClick={goToNextQuestion}>
                      Next Question <ChevronRight size={16} />
                    </button>
                  ) : (
                    <button className="btn btn-primary btn-lg" onClick={submitRecordings}>
                      <CheckCircle size={18} /> Finish & Analyze
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Questions sidebar */}
          <div className="card" style={{ maxHeight: 600, overflowY: 'auto' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem' }}>Questions</h3>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {INTERVIEW_QUESTIONS.map((q, i) => {
                const isAnswered = recordings.has(i);
                const isSkipped = skippedQuestions.has(i);
                const isCurrent = i === currentQIndex;
                return (
                  <button
                    key={q.id}
                    onClick={() => { setCurrentQIndex(i); setRecordingState(recordings.has(i) ? 'review' : 'preview'); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      padding: '0.625rem 0.75rem', borderRadius: 'var(--radius-lg)',
                      background: isCurrent ? 'rgb(99 102 241 / 0.12)' : 'var(--bg-tertiary)',
                      border: isCurrent ? '1px solid var(--color-primary)' : '1px solid transparent',
                      cursor: 'pointer', textAlign: 'left', width: '100%',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{
                      width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isAnswered ? 'var(--color-success)' : isSkipped ? 'var(--bg-tertiary)' : 'rgb(99 102 241 / 0.15)',
                      fontSize: '0.6875rem', fontWeight: 600,
                      color: isAnswered ? 'white' : isSkipped ? 'var(--text-muted)' : 'var(--color-primary-light)',
                    }}>
                      {isAnswered ? <CheckCircle size={12} /> : isSkipped ? '−' : i + 1}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 500, color: isCurrent ? 'var(--text-primary)' : 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {q.text}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{q.category}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {answeredCount > 0 && (
              <button
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '1rem' }}
                onClick={submitRecordings}
              >
                <CheckCircle size={16} /> Submit ({answeredCount} answers)
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ======================== UPLOADING / PROCESSING ========================
  if (pageState === 'uploading' || pageState === 'processing') {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Analyzing Your Interview</h1>
          <p className="page-subtitle">Your video is being processed by our AI engine.</p>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ textAlign: 'center', padding: '4rem 2rem', maxWidth: 600, margin: '0 auto' }}>
          <div style={{ position: 'relative', width: 120, height: 120, margin: '0 auto 2rem' }}>
            <svg viewBox="0 0 120 120" style={{ width: 120, height: 120, transform: 'rotate(-90deg)' }}>
              <circle cx="60" cy="60" r="54" fill="none" stroke="var(--border-color)" strokeWidth="6" />
              <motion.circle
                cx="60" cy="60" r="54" fill="none" stroke="var(--color-primary)" strokeWidth="6"
                strokeLinecap="round" strokeDasharray={339.3} strokeDashoffset={339.3 * (1 - (pageState === 'uploading' ? uploadProgress / 100 : 1))}
                animate={{ strokeDashoffset: pageState === 'processing' ? [339.3 * 0.3, 339.3 * 0.1, 339.3 * 0.3] : undefined }}
                transition={pageState === 'processing' ? { repeat: Infinity, duration: 3, ease: 'easeInOut' } : undefined}
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {pageState === 'uploading' ? (
                <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>{uploadProgress}%</span>
              ) : (
                <Brain size={32} style={{ color: 'var(--color-primary-light)', animation: 'pulse-glow 2s infinite' }} />
              )}
            </div>
          </div>

          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            {pageState === 'uploading' ? 'Uploading Video' : 'AI Processing'}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
            {processingStatus}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {[
              { label: 'Transcribe Speech', done: pageState === 'processing' },
              { label: 'Analyze Personality', done: false },
              { label: 'Detect Skills', done: false },
              { label: 'Generate Report', done: false },
            ].map((step) => (
              <div key={step.label} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: step.done ? 'var(--color-primary-light)' : 'var(--text-muted)' }}>
                {step.done ? <CheckCircle size={14} /> : <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
                {step.label}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  // ======================== REPORT PAGE ========================
  if (pageState === 'report' && report) {
    const radarData = report.personality_scores ? [
      { trait: 'Openness', value: report.personality_scores.openness },
      { trait: 'Conscientiousness', value: report.personality_scores.conscientiousness },
      { trait: 'Extraversion', value: report.personality_scores.extraversion },
      { trait: 'Agreeableness', value: report.personality_scores.agreeableness },
      { trait: 'Stability', value: 100 - (report.personality_scores.neuroticism || 0) },
    ] : [];

    return (
      <div>
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="page-title">Video Interview Report</h1>
            <p className="page-subtitle">AI-generated analysis from your video interview responses.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-secondary" onClick={() => { setPageState('intro'); setRecordings(new Map()); setSkippedQuestions(new Set()); setCurrentQIndex(0); setReport(null); }}>
              <RotateCcw size={16} /> New Interview
            </button>
          </div>
        </div>

        {/* Summary Card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--color-primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Sparkles size={18} style={{ color: 'var(--color-primary-light)' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>AI Summary</h3>
            {report.confidence_score != null && (
              <span className="badge badge-success" style={{ marginLeft: 'auto' }}>
                {Math.round(report.confidence_score * 100)}% confidence
              </span>
            )}
          </div>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.9375rem' }}>
            {report.candidate_summary || report.ai_insights?.candidate_summary || 'Video interview analysis complete.'}
          </p>
        </motion.div>

        {/* Transcript */}
        {report.extracted_text && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mic size={16} /> Transcript
            </h3>
            <div style={{ padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.8, maxHeight: 200, overflow: 'auto' }}>
              {report.extracted_text}
            </div>
          </motion.div>
        )}

        {/* Charts Row */}
        <div className="charts-grid">
          {/* OCEAN Radar */}
          {radarData.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="chart-card">
              <div className="chart-title"><Brain size={16} style={{ display: 'inline', marginRight: '0.5rem' }} /> Personality Profile</div>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="var(--border-color)" />
                  <PolarAngleAxis dataKey="trait" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                  <PolarRadiusAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} domain={[0, 100]} />
                  <Radar name="Score" dataKey="value" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* Skills & Strengths */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="chart-card">
            <div className="chart-title"><BarChart3 size={16} style={{ display: 'inline', marginRight: '0.5rem' }} /> Skills Detected</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {(report.skills_detected || []).map((skill: string) => (
                <span key={skill} className="badge badge-primary" style={{ padding: '0.375rem 0.875rem' }}>{skill}</span>
              ))}
              {(!report.skills_detected || report.skills_detected.length === 0) && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>Skills will be matched from transcript</p>
              )}
            </div>

            {report.ai_insights?.strengths && (
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-success)' }}>✦ Strengths</h4>
                <ul style={{ paddingLeft: '1.25rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  {report.ai_insights.strengths.map((s: string, i: number) => <li key={i} style={{ marginBottom: '0.25rem' }}>{s}</li>)}
                </ul>
              </div>
            )}

            {report.ai_insights?.gaps && (
              <div>
                <h4 style={{ fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-warning)' }}>⚡ Growth Areas</h4>
                <ul style={{ paddingLeft: '1.25rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  {report.ai_insights.gaps.map((g: string, i: number) => <li key={i} style={{ marginBottom: '0.25rem' }}>{g}</li>)}
                </ul>
              </div>
            )}
          </motion.div>
        </div>

        {/* Detailed Insights */}
        {report.ai_insights && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card" style={{ marginTop: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Detailed Interview Insights</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {report.ai_insights.communication_style && (
                <div style={{ padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)' }}>
                  <h4 style={{ fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>🗣️ Communication Style</h4>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{report.ai_insights.communication_style}</p>
                </div>
              )}
              {report.ai_insights.role_fit && (
                <div style={{ padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)' }}>
                  <h4 style={{ fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>🎯 Best Role Fit</h4>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{report.ai_insights.role_fit}</p>
                </div>
              )}
              {report.ai_insights.learning_potential && (
                <div style={{ padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)' }}>
                  <h4 style={{ fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>📚 Learning Potential</h4>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{report.ai_insights.learning_potential}</p>
                </div>
              )}
              {report.ai_insights.coach_notes && (
                <div style={{ padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)' }}>
                  <h4 style={{ fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>📋 Coach Notes</h4>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{report.ai_insights.coach_notes}</p>
                </div>
              )}
            </div>

            {report.ai_insights.recommended_paths && report.ai_insights.recommended_paths.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <h4 style={{ fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.5rem' }}>Recommended Paths</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {report.ai_insights.recommended_paths.map((p: string, i: number) => (
                    <span key={i} className="badge badge-info" style={{ padding: '0.375rem 0.875rem' }}>{p}</span>
                  ))}
                </div>
              </div>
            )}

            {report.ai_insights.interview_suggestions && report.ai_insights.interview_suggestions.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <h4 style={{ fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.5rem' }}>Follow-up Interview Suggestions</h4>
                <ul style={{ paddingLeft: '1.25rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  {report.ai_insights.interview_suggestions.map((q: string, i: number) => (
                    <li key={i} style={{ marginBottom: '0.25rem' }}>{q}</li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}

        {/* Interview Stats */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="card" style={{ marginTop: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Interview Stats</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgb(99 102 241 / 0.12)' }}>
                <Video size={20} style={{ color: 'var(--color-primary-light)' }} />
              </div>
              <div>
                <div className="stat-value">{answeredCount}</div>
                <div className="stat-label">Questions Answered</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgb(245 158 11 / 0.12)' }}>
                <SkipForward size={20} style={{ color: '#fbbf24' }} />
              </div>
              <div>
                <div className="stat-value">{skippedCount}</div>
                <div className="stat-label">Questions Skipped</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgb(34 197 94 / 0.12)' }}>
                <Brain size={20} style={{ color: '#4ade80' }} />
              </div>
              <div>
                <div className="stat-value">{(report.skills_detected || []).length}</div>
                <div className="stat-label">Skills Detected</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
}
