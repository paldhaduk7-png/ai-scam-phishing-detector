import React from 'react';
import { useNavigate } from 'react-router-dom';
import PublicNavbar from '../components/layout/PublicNavbar';
import Button from '../components/common/Button';
import {
  Shield,
  MessageSquare,
  Mail,
  Link as LinkIcon,
  ArrowRight,
  ShieldCheck,
  Zap,
  Lock,
  Eye,
  AlertTriangle,
  Gift,
} from 'lucide-react';


export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-semibold">
                <span className="text-blue-500">★</span> AI-Powered Security
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 dark:text-white tracking-tight leading-[1.1]">
                AI Scam &amp; Phishing Detector
              </h1>

              <p className="text-xl sm:text-2xl font-semibold text-slate-800 dark:text-slate-200">
                Stay Safe. Think Before You Click.
              </p>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
                Detect suspicious messages, emails and URLs using advanced AI and machine learning. Protect yourself from scams, phishing attacks and online fraud.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/detect')}
                  className="rounded-full px-8 py-3.5 shadow-lg shadow-blue-600/25 group font-semibold text-base"
                >
                  <span>Try Detection</span>
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    const el = document.getElementById('features');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="rounded-full px-7 py-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-base"
                >
                  Learn More
                </Button>
              </div>
            </div>

            {/* Right Hero Visual Illustration matching screenshot */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              {/* Decorative floating badges */}
              <div className="absolute -top-4 left-6 z-20 hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 shadow-md border border-slate-100 dark:border-slate-800 text-xs font-bold text-blue-600 dark:text-blue-400 animate-bounce duration-1000">
                <Shield className="w-3.5 h-3.5" />
                <span>Detect Scams</span>
              </div>

              <div className="absolute top-12 -right-2 z-20 hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 shadow-md border border-slate-100 dark:border-slate-800 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Stay Safe Online</span>
              </div>

              {/* Laptop Graphic Mockup */}
              <div className="w-full max-w-md bg-white dark:bg-[#11192e] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden p-4 relative">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <div className="text-[11px] font-mono text-slate-400">scamshield.ai</div>
                </div>

                {/* Simulated scan warnings matching screenshot */}
                <div className="space-y-2.5">
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/50 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                        Urgent! Your account will be suspended!
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-200 dark:bg-red-900 text-red-800 dark:text-red-200 shrink-0">
                      Phishing
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/50 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                        <LinkIcon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                        http://scam-offer.com
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200 shrink-0">
                      Suspicious
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                        <Gift className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                        Congratulations! You've won a prize!
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-200 dark:bg-red-900 text-red-800 dark:text-red-200 shrink-0">
                      Scam
                    </span>
                  </div>
                </div>

                {/* Base of laptop */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> AI Threat Scanner Active
                  </span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">v1.0.0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Detection Types Section */}
      <section id="features" className="py-20 bg-white dark:bg-[#0d162a]/95 border-y border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Comprehensive Multi-Channel Detection
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2">
              Protect yourself from threats across every communication vector.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: Message Detection */}
            <div
              onClick={() => navigate('/detect?tab=message')}
              className="p-8 rounded-2xl bg-slate-50 dark:bg-[#11192e] border border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-lg hover:shadow-blue-500/5 transition-all cursor-pointer group"
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-6 shadow-md shadow-blue-500/20 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Message Detection
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Identify scam texts, SMS fraud, and instant message pressure tactics with natural language analysis.
              </p>
            </div>

            {/* Card 2: Email Analysis */}
            <div
              onClick={() => navigate('/detect?tab=email')}
              className="p-8 rounded-2xl bg-slate-50 dark:bg-[#11192e] border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-lg hover:shadow-indigo-500/5 transition-all cursor-pointer group"
            >
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mb-6 shadow-md shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                <Mail className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Email Analysis
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Analyze suspicious email content, headers, subject urgency, and sender impersonation attempts.
              </p>
            </div>

            {/* Card 3: URL Scanner */}
            <div
              onClick={() => navigate('/detect?tab=url')}
              className="p-8 rounded-2xl bg-slate-50 dark:bg-[#11192e] border border-slate-200/80 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-lg hover:shadow-emerald-500/5 transition-all cursor-pointer group"
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mb-6 shadow-md shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                <LinkIcon className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                URL Scanner
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Check suspicious web links, typosquatting domains, credential harvest pages, and malicious redirects.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Static Capabilities Section */}
      <section className="py-16 bg-[#f8fafc] dark:bg-[#090d16]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-[#11192e] border border-slate-200/80 dark:border-slate-800 text-center">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3">
                <Zap className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Real-Time Scoring</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Instant threat risk assessment</p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-[#11192e] border border-slate-200/80 dark:border-slate-800 text-center">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Multi-Model AI</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">NLP &amp; Machine Learning pipeline</p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-[#11192e] border border-slate-200/80 dark:border-slate-800 text-center">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
                <Eye className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Clear Indicators</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Actionable threat explanations</p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-[#11192e] border border-slate-200/80 dark:border-slate-800 text-center">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto mb-3">
                <Lock className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Privacy-First</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Zero storage for guest analyses</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 bg-white dark:bg-[#0d162a] border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
        <p>&copy; {new Date().getFullYear()} ScamShield — AI Scam &amp; Phishing Detection Platform. Built for digital security.</p>
      </footer>
    </div>
  );
}
