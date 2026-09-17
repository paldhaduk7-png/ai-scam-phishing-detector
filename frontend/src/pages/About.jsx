import React from 'react';
import { useNavigate } from 'react-router-dom';
import PublicNavbar from '../components/layout/PublicNavbar';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import {
  Shield,
  ArrowRight,
  Code2,
  Server,
  BrainCircuit,
  Cpu,
  Database,
  Mail,
  MessageSquare,
  Link as LinkIcon,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export default function About() {
  const navigate = useNavigate();

  const detectionVectors = [
    {
      title: 'Email Phishing Detection',
      icon: Mail,
      badge: 'Dual-Engine ML/DL',
      color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200/70 dark:border-indigo-800/50',
      description:
        'Evaluates deceptive sender indicators, credential-harvesting triggers, and urgency schemes using LinearSVC with TF-IDF n-grams or a 128-unit Bi-LSTM sequence neural network.',
    },
    {
      title: 'SMS & Smishing Defense',
      icon: MessageSquare,
      badge: 'TF-IDF Linear Classifier',
      color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border-blue-200/70 dark:border-blue-800/50',
      description:
        'Identifies fraudulent package delivery alerts, fake banking lockouts, prize scams, and deceptive links tailored specifically to mobile SMS communication patterns.',
    },
    {
      title: 'Malicious URL Scanner',
      icon: LinkIcon,
      badge: 'Lexical XGBoost Model',
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200/70 dark:border-emerald-800/50',
      description:
        'Analyzes 23 offline lexical and structural features including domain length, subdomain entropy, protocol flags, and typosquatting heuristics with XGBoost gradient boosting.',
    },
  ];

  const techStack = [
    {
      name: 'React 19 & Vite',
      category: 'Frontend UI',
      icon: Code2,
      detail: 'Tailwind CSS, Redux Toolkit, Lucide Icons',
      color: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/50 border-cyan-200/60 dark:border-cyan-800/50',
    },
    {
      name: 'FastAPI & Python',
      category: 'API Microservice',
      icon: Server,
      detail: 'High-speed ASGI, Pydantic validation, CORS',
      color: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 border-teal-200/60 dark:border-teal-800/50',
    },
    {
      name: 'scikit-learn & XGBoost',
      category: 'Machine Learning',
      icon: BrainCircuit,
      detail: 'LinearSVC pipelines & Gradient-Boosted Trees',
      color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border-amber-200/60 dark:border-amber-800/50',
    },
    {
      name: 'TensorFlow & Keras',
      category: 'Deep Learning',
      icon: Cpu,
      detail: 'Bi-LSTM Recurrent Neural Networks with Embeddings',
      color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border-blue-200/60 dark:border-blue-800/50',
    },
    {
      name: 'PostgreSQL & SQLAlchemy',
      category: 'Database & Audit',
      icon: Database,
      detail: 'Relational history audit logging & JWT sessions',
      color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200/60 dark:border-indigo-800/50',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <PublicNavbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-fadeIn">
        {/* Page Header */}
        <div className="border-b border-slate-200/80 dark:border-slate-800/80 pb-6 text-left">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200/70 dark:border-blue-800/60 px-2.5 py-0.5 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              AI Cybersecurity Architecture
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight">
            About ScamShield
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2 max-w-2xl leading-relaxed">
            ScamShield combines Natural Language Processing, Deep Learning sequence modeling, and domain lexical heuristics to protect individuals and organizations from social engineering fraud.
          </p>
        </div>

        {/* Mission Statement Card */}
        <Card className="p-6 sm:p-8 relative overflow-hidden text-left border border-slate-200/80 dark:border-slate-800">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                <Shield className="w-4 h-4" />
                <span>Our Mission</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Democratizing Enterprise-Grade Scam &amp; Phishing Defense
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Social engineering attacks evolve constantly across text messages, spoofed banking notifications, and fraudulent web addresses. ScamShield provides immediate, multi-modal threat analysis in a clean and accessible interface with zero complex setup.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/50 border border-blue-200/70 dark:border-blue-900/60 flex items-center gap-3.5 shrink-0">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25 shrink-0">
                <Shield className="w-6 h-6 fill-white/20 stroke-white" />
              </div>
              <div>
                <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Real-Time AI Telemetry
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                  Multi-Channel Defense Core
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Supported Detection Channels */}
        <div className="text-left space-y-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Specialized Detection Channels
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Each communication vector is evaluated using purpose-built feature engineering and classification models.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {detectionVectors.map((vec, idx) => {
              const Icon = vec.icon;
              return (
                <Card key={idx} className="p-5 flex flex-col justify-between space-y-4 border border-slate-200/80 dark:border-slate-800">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-2xs ${vec.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <Badge size="sm">{vec.badge}</Badge>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {vec.title}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {vec.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Active in Threat Scanner</span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Technology Stack */}
        <div className="text-left space-y-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Technology Stack
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Production libraries and frameworks powering the frontend, inference engines, and database.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {techStack.map((tech, idx) => {
              const Icon = tech.icon;
              return (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex flex-col items-center text-center space-y-2 hover:shadow-xs transition-all"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${tech.color} shadow-2xs`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    {tech.name}
                  </h3>
                  <p className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                    {tech.category}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug">
                    {tech.detail}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Callout */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-blue-600/20 text-left">
          <div className="space-y-1">
            <h3 className="text-lg font-extrabold text-white">
              Ready to verify suspicious content?
            </h3>
            <p className="text-xs sm:text-sm text-blue-100">
              Run instant scans across messages, emails, or links with zero installation.
            </p>
          </div>
          <Button
            variant="secondary"
            size="md"
            onClick={() => navigate('/detect')}
            className="rounded-xl font-bold bg-white text-blue-700 hover:bg-slate-100 shrink-0 shadow-md"
          >
            <span>Launch Threat Scanner</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 bg-white dark:bg-[#0b101b] border-t border-slate-200/80 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
        <p>&copy; {new Date().getFullYear()} ScamShield — AI Scam &amp; Phishing Detection Platform.</p>
      </footer>
    </div>
  );
}
