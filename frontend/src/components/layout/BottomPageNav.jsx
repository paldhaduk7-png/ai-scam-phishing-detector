import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  LayoutDashboard,
  Search,
  Clock,
  User,
  Info,
  ArrowRight,
  Shield,
  Compass,
} from 'lucide-react';

export default function BottomPageNav({ currentPage = 'detect' }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const allModules = [
    {
      id: 'detect',
      title: 'Threat Detection Scanner',
      description: 'Analyze suspicious SMS texts, phishing emails, and malicious URLs in real time.',
      icon: Search,
      badge: 'Live Scanner',
      path: '/detect',
      color: 'blue',
      authRequired: false,
    },
    {
      id: 'dashboard',
      title: 'Security Operations Dashboard',
      description: 'View threat score telemetry, incident distributions, and overall security posture.',
      icon: LayoutDashboard,
      badge: 'Analytics',
      path: '/dashboard',
      color: 'indigo',
      authRequired: true,
    },
    {
      id: 'history',
      title: 'Audit & Scan History',
      description: 'Review historical scans, forensic logs, confidence scores, and starred threat alerts.',
      icon: Clock,
      badge: 'Forensics',
      path: '/history',
      color: 'amber',
      authRequired: true,
    },
    {
      id: 'profile',
      title: 'Account & Security Settings',
      description: 'Configure your profile credentials, display avatar, and security verification session.',
      icon: User,
      badge: 'Preferences',
      path: '/profile',
      color: 'emerald',
      authRequired: true,
    },
    {
      id: 'about',
      title: 'Platform Architecture & AI',
      description: 'Learn about our multi-vector heuristic rules, NLP transformers, and threat databases.',
      icon: Info,
      badge: 'Documentation',
      path: '/about',
      color: 'slate',
      authRequired: false,
    },
  ];

  // Filter out current page
  const otherModules = allModules.filter((mod) => mod.id !== currentPage);

  // If not authenticated, hide pages requiring auth or show them with sign-in prompt
  const displayModules = otherModules.filter(
    (mod) => !mod.authRequired || isAuthenticated
  );

  const getColorClasses = (color) => {
    switch (color) {
      case 'blue':
        return {
          iconBg: 'bg-blue-600 text-white shadow-blue-500/20',
          badge: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300',
          borderHover: 'hover:border-blue-400 dark:hover:border-blue-700',
        };
      case 'indigo':
        return {
          iconBg: 'bg-indigo-600 text-white shadow-indigo-500/20',
          badge: 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300',
          borderHover: 'hover:border-indigo-400 dark:hover:border-indigo-700',
        };
      case 'amber':
        return {
          iconBg: 'bg-amber-600 text-white shadow-amber-500/20',
          badge: 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300',
          borderHover: 'hover:border-amber-400 dark:hover:border-amber-700',
        };
      case 'emerald':
        return {
          iconBg: 'bg-emerald-600 text-white shadow-emerald-500/20',
          badge: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300',
          borderHover: 'hover:border-emerald-400 dark:hover:border-emerald-700',
        };
      default:
        return {
          iconBg: 'bg-slate-700 dark:bg-slate-800 text-white shadow-slate-500/20',
          badge: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
          borderHover: 'hover:border-slate-400 dark:hover:border-slate-600',
        };
    }
  };

  return (
    <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800/80 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Navigate to Other Services
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Quickly switch between security analytics, scan history, settings, and documentation.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {displayModules.map((item) => {
          const Icon = item.icon;
          const colors = getColorClasses(item.color);

          return (
            <div
              key={item.id}
              role="button"
              tabIndex={0}
              onClick={() => navigate(item.path)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate(item.path);
                }
              }}
              className={`group p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800/90 shadow-2xs ${colors.borderHover} hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between text-left`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div
                    className={`w-9 h-9 rounded-xl ${colors.iconBg} flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform duration-200 shrink-0`}
                  >
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${colors.badge}`}
                  >
                    {item.badge}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform">
                <span>Go to page</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
