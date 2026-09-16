import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import { MessageSquare, Mail, Link as LinkIcon, Clock } from 'lucide-react';

export default function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      label: 'Detect Message',
      icon: MessageSquare,
      path: '/detect?tab=message',
      color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60',
    },
    {
      label: 'Detect Email',
      icon: Mail,
      path: '/detect?tab=email',
      color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60',
    },
    {
      label: 'Scan URL',
      icon: LinkIcon,
      path: '/detect?tab=url',
      color: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900/60',
    },
    {
      label: 'View History',
      icon: Clock,
      path: '/history',
      color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60',
    },
  ];

  return (
    <Card className="h-full">
      <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, idx) => {
          const Icon = action.icon;
          return (
            <button
              key={idx}
              onClick={() => navigate(action.path)}
              className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:border-slate-200 dark:hover:border-slate-700 transition-all group cursor-pointer text-center"
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2.5 transition-transform group-hover:scale-110 ${action.color}`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {action.label}
              </span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
