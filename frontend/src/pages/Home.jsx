import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PublicNavbar from '../components/layout/PublicNavbar';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import {
  MessageSquare,
  Mail,
  Link as LinkIcon,
  ArrowRight,
  ShieldCheck,
  Zap,
  FileCheck,
  BrainCircuit,
  Cpu,
  History,
  Activity,
  CheckCircle2,
  LayoutDashboard,
} from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const trustItems = [
    {
      label: 'Email Threat Detection',
      description: 'LinearSVC ML & Bi-LSTM sequence deep learning',
      icon: Mail,
      color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border-blue-200/60 dark:border-blue-900/50',
    },
    {
      label: 'SMS Smishing Defense',
      description: 'Detection for text fraud, urgent lures & prize scams',
      icon: MessageSquare,
      color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200/60 dark:border-indigo-900/50',
    },
    {
      label: 'Malicious URL Scanner',
      description: 'Lexical analysis for deceptive and phishing links',
      icon: LinkIcon,
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200/60 dark:border-emerald-900/50',
    },
    {
      label: 'Multi-Model AI Scoring',
      description: 'Real-time threat percentage and verdict analysis',
      icon: BrainCircuit,
      color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 border-purple-200/60 dark:border-purple-900/50',
    },
  ];

  const features = [
    {
      title: 'Traditional ML Email Detection',
      description:
        'Analyzes email subjects and message bodies using TF-IDF n-gram vectorization and LinearSVC classification for rapid identification of credential harvesting.',
      badge: 'Machine Learning',
      icon: BrainCircuit,
      colorScheme: 'blue',
      tab: 'email',
    },
    {
      title: 'Bi-LSTM Deep Learning',
      description:
        'Employs a 128-unit Bidirectional LSTM neural network with word tokenization and dense embeddings for deep semantic context and sentence sequence evaluation.',
      badge: 'Deep Learning',
      icon: Cpu,
      colorScheme: 'indigo',
      tab: 'email',
    },
    {
      title: 'SMS Spam & Smishing Detection',
      description:
        'Trained specifically on SMS communication patterns to detect unsolicited text threats, urgent wire-transfer demands, and fake shipping alerts.',
      badge: 'Message Scanner',
      icon: MessageSquare,
      colorScheme: 'purple',
      tab: 'message',
    },
    {
      title: 'URL Phishing & Domain Scanner',
      description:
        'Evaluates URL lexical structure, special character ratios, and suspicious domain patterns using an XGBoost gradient-boosted decision model.',
      badge: 'Link Analysis',
      icon: LinkIcon,
      colorScheme: 'emerald',
      tab: 'url',
    },
    {
      title: 'Operations Dashboard & Analytics',
      description:
        'Provides real-time visibility into your personal detection activity with 7-day trend charts, threat category breakdowns, and security advisories.',
      badge: 'Analytics',
      icon: Activity,
      colorScheme: 'sky',
      route: '/dashboard',
    },
    {
      title: 'Personalized Scan Audit Trail',
      description:
        'Stores authenticated detection records in PostgreSQL with full-text search, channel filtering, and detailed threat indicator modals.',
      badge: 'Audit Trail',
      icon: History,
      colorScheme: 'amber',
      route: '/history',
    },
  ];

  const steps = [
    {
      step: '01',
      title: 'Submit Suspicious Content',
      description:
        'Paste any suspicious email body, text message, or web link directly into the ScamShield detection portal.',
      icon: FileCheck,
    },
    {
      step: '02',
      title: 'AI Multi-Vector Analysis',
      description:
        'Specialized machine learning pipelines or Bi-LSTM sequence models evaluate deceptive phrasing and risk markers.',
      icon: Zap,
    },
    {
      step: '03',
      title: 'Inspect Risk Rating & Advice',
      description:
        'Receive an instant normalized threat score (0-100%), classification verdict, and actionable security guidance.',
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-18 lg:pt-18 lg:pb-24 bg-grid-pattern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/70 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 text-xs font-semibold shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
                <span>AI-Powered Cybersecurity Telemetry</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 dark:text-white tracking-tight leading-[1.12]">
                Detect Scams &amp; Phishing Before You Click
              </h1>

              <p className="text-lg sm:text-xl font-medium text-slate-700 dark:text-slate-300 leading-snug">
                Unified protection across Emails, SMS messages, and Web Links using dual Machine Learning &amp; Deep Learning models.
              </p>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
                ScamShield analyzes deceptive language, spoofed identities, urgency triggers, and malicious domains in real time to help individuals and teams prevent credential theft and social engineering fraud.
              </p>

              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/detect')}
                  className="rounded-xl px-7 shadow-md shadow-blue-600/25 group font-semibold text-sm sm:text-base"
                >
                  <span>Launch Threat Scanner</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    const el = document.getElementById('features');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="rounded-xl px-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-sm sm:text-base shadow-2xs"
                >
                  Explore Capabilities
                </Button>
              </div>

              {/* Sub-hero trust bullets */}
              <div className="pt-3 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs font-medium text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  No Sign-Up Required for Scanning
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  Dual Traditional ML &amp; Bi-LSTM Engines
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  Ephemeral In-Memory Guest Analysis
                </span>
              </div>
            </div>

            {/* Right Hero Product Preview Mockup */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div className="w-full max-w-md bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xl overflow-hidden transition-all duration-200">
                {/* Mockup Header Bar */}
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    </div>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 ml-1">
                      scamshield.ai/scanner
                    </span>
                  </div>
                  <Badge status="safe" size="sm">
                    Engine Online
                  </Badge>
                </div>

                {/* Mockup Simulated Telemetry Alerts */}
                <div className="p-4 space-y-3">
                  {/* Alert 1: Email Phishing */}
                  <div className="p-3.5 rounded-xl bg-red-50/80 dark:bg-red-950/30 border border-red-200/70 dark:border-red-900/40 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                          Urgent: Bank Access Restricted
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          Verify credentials at http://chase-update-security.xyz
                        </p>
                      </div>
                    </div>
                    <Badge status="phishing" size="sm" className="shrink-0">
                      Phishing 98.4%
                    </Badge>
                  </div>

                  {/* Alert 2: SMS Suspicious */}
                  <div className="p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/40 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                          Package on Hold: Address Needed
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          Follow delivery link to resolve parcel dispatch
                        </p>
                      </div>
                    </div>
                    <Badge status="suspicious" size="sm" className="shrink-0">
                      Suspicious 68.5%
                    </Badge>
                  </div>

                  {/* Alert 3: URL Safe */}
                  <div className="p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-900/40 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                        <LinkIcon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                          https://www.google.com
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          Legitimate domain with standard reputation
                        </p>
                      </div>
                    </div>
                    <Badge status="safe" size="sm" className="shrink-0">
                      Safe 0.2%
                    </Badge>
                  </div>
                </div>

                {/* Mockup Console Footer */}
                <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    LinearSVC + Keras Bi-LSTM
                  </span>
                  <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Capabilities Strip */}
      <section className="py-10 border-y border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0b101b]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trustItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="flex items-start gap-3.5 p-3 rounded-xl">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 shadow-2xs ${item.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                      {item.label}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Comprehensive Features Section */}
      <section id="features" className="py-20 bg-slate-50/60 dark:bg-[#090d16]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <Badge size="md" className="mb-3">
              Core Security Modules
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight">
              Purpose-Built Multi-Channel Threat Intelligence
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2">
              Every communication channel requires distinct feature extraction and classification strategies. ScamShield integrates specialized pipelines for each vector.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={idx}
                  hoverEffect
                  className="flex flex-col justify-between cursor-pointer group"
                  onClick={() => {
                    if (feature.tab) {
                      navigate(`/detect?tab=${feature.tab}`);
                    } else if (feature.route) {
                      navigate(feature.route);
                    }
                  }}
                >
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/50 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">
                        {feature.badge}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {feature.title}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform">
                    <span>Try {feature.title.split(' ')[0]} Detection</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works (3-Step Visual Flow) */}
      <section className="py-20 bg-white dark:bg-[#0b101b] border-y border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
              How ScamShield Protects You
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              A transparent, high-speed 3-step threat analysis workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {steps.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex flex-col items-start space-y-3 relative"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-2xl font-extrabold font-mono text-slate-300 dark:text-slate-700">
                      {item.step}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white pt-1">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final Call to Action Banner */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white dark:from-[#090d16] dark:to-[#0f172a]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-600/20 relative overflow-hidden">
            <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Ready to Verify a Suspicious Message?
              </h2>
              <p className="text-sm sm:text-base text-blue-100 leading-relaxed">
                Scan emails, SMS alerts, and web addresses with instant AI analysis. Keep your personal data, bank accounts, and passwords safe.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => navigate('/detect')}
                  className="rounded-xl px-7 bg-white text-blue-700 hover:bg-slate-100 font-bold shadow-md"
                >
                  Start Scanning Now
                </Button>
                {isAuthenticated ? (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => navigate('/dashboard')}
                    className="rounded-xl px-6 border-white/40 text-white hover:bg-white/10 font-bold flex items-center gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Go to Dashboard</span>
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => navigate('/register')}
                    className="rounded-xl px-6 border-white/40 text-white hover:bg-white/10 font-bold"
                  >
                    Create Account
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-white dark:bg-[#0b101b] border-t border-slate-200/80 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
        <p>&copy; {new Date().getFullYear()} ScamShield — AI Scam &amp; Phishing Detection Platform. Built for digital security and transparency.</p>
      </footer>
    </div>
  );
}
