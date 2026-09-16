import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import {
  Shield,
  ArrowRight,
  Code2,
  Server,
  BrainCircuit,
  Cpu,
  Database,
  Lock,
  Mail,
  MessageSquare,
  Link as LinkIcon,
  CheckCircle2,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function About() {
  const navigate = useNavigate();

  const pipelineSteps = [
    {
      num: '01',
      title: 'Payload Ingestion',
      subtitle: 'Data Preprocessing',
      description:
        'Raw text payloads (email headers/body, SMS copy, or web URL) are normalized and extracted using domain-specific lexical tokenizers.',
    },
    {
      num: '02',
      title: 'Multi-Model Inference',
      subtitle: 'ML & Deep Learning',
      description:
        'Payload is routed to specialized AI engines: LinearSVC n-gram classifiers, Bi-LSTM sequence neural networks, or lexical tree ensembles.',
    },
    {
      num: '03',
      title: 'Severity Assessment',
      subtitle: 'Calibrated Risk Scoring',
      description:
        'Model confidence and decision scores are mapped to a continuous 0%–100% risk meter with transparent Safe, Suspicious, or Threat classifications.',
    },
    {
      num: '04',
      title: 'PostgreSQL Audit Logging',
      subtitle: 'Compliance & Telemetry',
      description:
        'Authenticated user scans are recorded to PostgreSQL database tables for immediate 7-day dashboard visualization and audit history.',
    },
  ];

  const detectionVectors = [
    {
      title: 'Email Phishing Detection',
      icon: Mail,
      badge: 'Dual-Engine ML/DL',
      color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200/70 dark:border-indigo-800/50',
      description:
        'Evaluates deceptive sender indicators, credential-harvesting triggers, and urgent financial schemes. Supports both fast Traditional ML (TF-IDF + LinearSVC) and Deep Learning (Bi-LSTM neural networks).',
    },
    {
      title: 'SMS / Smishing Detection',
      icon: MessageSquare,
      badge: 'TF-IDF Linear Classifier',
      color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border-blue-200/70 dark:border-blue-800/50',
      description:
        'Identifies fraudulent package delivery texts, fake banking alerts, lottery scam claims, and suspicious shortened links commonly used in mobile smishing attacks.',
    },
    {
      title: 'Malicious URL Inspection',
      icon: LinkIcon,
      badge: 'Lexical Random Forest',
      color: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 border-sky-200/70 dark:border-sky-800/50',
      description:
        'Inspects 16 structural lexical features including domain length, subdomain entropy, IP address hosts, HTTPS certificate markers, and homograph character deception.',
    },
  ];

  const techStack = [
    {
      name: 'React 19 & Vite',
      category: 'Frontend Client',
      icon: Code2,
      detail: 'Tailwind CSS 4, Redux Toolkit, Lucide Icons',
      color: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/50 border-cyan-200/60 dark:border-cyan-800/50',
    },
    {
      name: 'FastAPI & Python',
      category: 'Backend Microservice',
      icon: Server,
      detail: 'Asynchronous ASGI, Pydantic validation, CORS',
      color: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 border-teal-200/60 dark:border-teal-800/50',
    },
    {
      name: 'scikit-learn',
      category: 'Traditional ML',
      icon: BrainCircuit,
      detail: 'TF-IDF Vectorizers, LinearSVC, Random Forest',
      color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border-amber-200/60 dark:border-amber-800/50',
    },
    {
      name: 'TensorFlow & Keras',
      category: 'Deep Learning',
      icon: Cpu,
      detail: 'Bi-LSTM Recurrent Neural Networks, Tokenizer',
      color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border-blue-200/60 dark:border-blue-800/50',
    },
    {
      name: 'PostgreSQL & SQLAlchemy',
      category: 'Relational Database',
      icon: Database,
      detail: 'Alembic migrations, relational detection models',
      color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200/60 dark:border-indigo-800/50',
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Title & Breadcrumb */}
      <div className="border-b border-slate-200/60 dark:border-slate-800/80 pb-4">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
            About ScamShield
          </h1>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200/70 dark:border-blue-800/60 px-2.5 py-0.5 rounded-full font-mono">
            <Sparkles className="w-3 h-3 text-blue-500" />
            AI Cybersecurity Platform
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
          Learn how ScamShield combines Natural Language Processing, Deep Learning sequence models, and lexical domain heuristics to protect users from social engineering attacks.
        </p>
      </div>

      {/* Mission & Purpose Card */}
      <Card className="p-6 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="space-y-3.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              <Shield className="w-4 h-4" />
              <span>Project Mission</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
              Democratizing Enterprise-Grade Scam & Phishing Defense for Everyday Users
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Social engineering attacks continue to evolve rapidly across emails, SMS messages, and spoofed domains. ScamShield bridges the gap between academic AI research and practical digital security by delivering real-time, multi-modal threat analysis in a clean and accessible user interface.
            </p>
          </div>

          {/* Right Posture Callout */}
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/70 dark:from-blue-950/50 dark:to-indigo-950/30 border border-blue-200/70 dark:border-blue-900/60 flex items-center gap-4 shrink-0 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 shrink-0">
              <Shield className="w-7 h-7 fill-white/20 stroke-white" />
            </div>
            <div>
              <p className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                Stay Aware
              </p>
              <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                Stay Protected
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                ScamShield AI Core
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Architectural Pipeline ("How It Works") */}
      <Card className="p-6 sm:p-8">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            <Layers className="w-4 h-4 text-blue-500" />
            <span>Detection Workflow</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight mt-1">
            End-to-End Analysis Architecture
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            How submitted payloads travel from the React client to trained machine learning models and return instant threat verdicts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {pipelineSteps.map((step, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-slate-50/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl font-extrabold text-blue-600/40 dark:text-blue-400/30 font-mono">
                  {step.num}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-200/50 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                  {step.subtitle}
                </span>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Core Detection Vectors */}
      <div>
        <div className="mb-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Supported Detection Channels
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Specialized threat classification pipelines tailored to specific digital communication channels.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {detectionVectors.map((vec, idx) => {
            const Icon = vec.icon;
            return (
              <Card key={idx} className="p-6 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center border shadow-2xs ${vec.color}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full font-mono">
                      {vec.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {vec.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {vec.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Real-time inference supported</span>
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Technologies Used Grid */}
      <Card className="p-6 sm:p-8">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Technology Stack & Frameworks
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Production-grade technologies utilized across the frontend, API, machine learning inference, and database layers.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {techStack.map((tech, idx) => {
            const Icon = tech.icon;
            return (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800/80 hover:shadow-xs transition-all flex flex-col items-center text-center group"
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 border ${tech.color} group-hover:scale-105 transition-transform shadow-2xs`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                  {tech.name}
                </h3>
                <p className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                  {tech.category}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                  {tech.detail}
                </p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Privacy & Security Posture Card */}
      <Card className="p-6 sm:p-7 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Data Privacy & Credential Security
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                ScamShield handles authentication via secure HTTP-only cookie JWTs, hashes all user passwords with salted bcrypt, and strictly scopes detection history to authenticated user identities.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/history')}
              className="rounded-xl text-xs font-semibold"
            >
              View History
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/detect')}
              icon={ArrowRight}
              className="rounded-xl text-xs font-semibold shadow-xs"
            >
              Start Detection
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
