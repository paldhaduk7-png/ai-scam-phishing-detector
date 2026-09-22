import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Cpu, ExternalLink } from 'lucide-react';

export default function Footer({ className = '' }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={`bg-white dark:bg-[#080c14] border-t border-slate-200/80 dark:border-slate-800/70 transition-colors text-slate-600 dark:text-slate-400 font-sans ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand & Mission Column */}
          <div className="md:col-span-2 space-y-3.5 text-left">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white shadow-sm shadow-blue-600/25 group-hover:scale-105 transition-transform">
                <Shield className="w-4 h-4 fill-white/20 stroke-white stroke-[2.2]" />
              </div>
              <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                ScamShield
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-200/60 dark:border-blue-800/50">
                AI Defense
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
              Multi-vector scam and phishing threat detection for Email, SMS, and URLs.
              Powered by localized Machine Learning and Deep Learning inference architectures.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                <Cpu className="w-3 h-3 text-blue-500" />
                Local Backend Inference
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                <Lock className="w-3 h-3 text-emerald-500" />
                Read-Only OAuth 2.0
              </span>
            </div>
          </div>

          {/* Platform Navigation */}
          <div className="text-left space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  to="/"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Architecture &amp; Mission
                </Link>
              </li>
              <li>
                <Link
                  to="/detect"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Threat Scanner
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Governance */}
          <div className="text-left space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Legal &amp; Transparency
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  to="/privacy-policy"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium text-slate-700 dark:text-slate-300"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium text-slate-700 dark:text-slate-300"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <a
                  href="https://developers.google.com/terms/api-services-user-data-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Google User Data Policy
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
          <p>
            &copy; {currentYear} ScamShield — AI Scam &amp; Phishing Detection Platform.
          </p>
          <div className="flex items-center gap-4 text-xs font-medium">
            <Link
              to="/privacy-policy"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Privacy Policy
            </Link>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <Link
              to="/terms"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>

        {/* Disclaimer Notice */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/40 text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed text-center sm:text-left">
          <p>
            ScamShield provides automated heuristic and neural threat detection as an assistive security tool.
            Machine learning classifications are probabilistic evaluations and do not constitute an infallible guarantee.
            Users should exercise standard verification before interacting with suspicious communications.
          </p>
        </div>
      </div>
    </footer>
  );
}
