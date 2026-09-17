import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import {
  MessageSquare,
  Mail,
  Link as LinkIcon,
  Clock,
  ArrowUpRight,
} from 'lucide-react';

export default function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      label: 'Detect Message',
      description: 'SMS & chat scams',
      icon: MessageSquare,
      path: '/detect?tab=message',
      color:
        'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border-blue-200/60 dark:border-blue-800/40',
    },
    {
      label: 'Detect Email',
      description: 'ML & Bi-LSTM neural filter',
      icon: Mail,
      path: '/detect?tab=email',
      color:
        'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200/60 dark:border-indigo-800/40',
    },
    {
      label: 'Scan URL',
      description: 'Lexical link analyzer',
      icon: LinkIcon,
      path: '/detect?tab=url',
      color:
        'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 border-sky-200/60 dark:border-sky-800/40',
    },
    {
      label: 'View History',
      description: 'Audit logs & scan records',
      icon: Clock,
      path: '/history',
      color:
        'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 border-purple-200/60 dark:border-purple-800/40',
    },
  ];

  return (
    <Card className="flex flex-col p-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80 mb-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
          Quick Actions
        </h2>
        <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          Shortcuts
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {actions.map((action, idx) => {
          const Icon = action.icon;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => navigate(action.path)}
              className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800/80 hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-xs transition-all text-left cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
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
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {action.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
