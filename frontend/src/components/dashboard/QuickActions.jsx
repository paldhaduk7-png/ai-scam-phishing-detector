import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import {
  MessageSquare,
  Mail,
  Link as LinkIcon,
  Clock,
  ArrowUpRight,
  Zap,
} from 'lucide-react';

export default function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      label: 'Detect Message',
      description: 'SMS, chat & fraud text scans',
      icon: MessageSquare,
      path: '/detect?tab=message',
      color:
        'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border-blue-200/60 dark:border-blue-800/40',
    },
    {
      label: 'Detect Email',
      description: 'Neural filter & Gmail inbox sync',
      icon: Mail,
      path: '/detect?tab=email',
      color:
        'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200/60 dark:border-indigo-800/40',
    },
    {
      label: 'Scan URL',
      description: 'Lexical spoofing & domain audit',
      icon: LinkIcon,
      path: '/detect?tab=url',
      color:
        'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 border-sky-200/60 dark:border-sky-800/40',
    },
    {
      label: 'Audit History',
      description: 'Search & export threat records',
      icon: Clock,
      path: '/history',
      color:
        'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 border-purple-200/60 dark:border-purple-800/40',
    },
  ];

  return (
    <Card className="flex flex-col justify-between p-4 sm:p-6 h-full">
      <div>
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-800/70 mb-3 sm:mb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500/20" />
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Quick Launchers
            </h2>
          </div>
          <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Shortcuts
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
          {actions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => navigate(action.path)}
                className="flex items-center gap-3 p-2.5 sm:p-3 rounded-xl border border-slate-800/60 bg-slate-900/30 hover:bg-slate-800/60 hover:border-slate-700/60 hover:shadow-sm active:scale-[0.98] transition-all text-left cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105 shadow-2xs ${action.color}`}
                >
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                      {action.label}
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
                  </div>
                  <p className="text-[10.5px] sm:text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {action.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-3.5 pt-3 border-t border-slate-800/70 flex items-center justify-between text-[11px] text-slate-500">
        <span>ScamShield Engine</span>
        <span className="font-medium text-blue-600 dark:text-blue-400">Ready</span>
      </div>
    </Card>
  );
}
