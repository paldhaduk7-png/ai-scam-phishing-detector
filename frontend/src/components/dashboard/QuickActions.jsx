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
      color: 'text-blue-600 bg-blue-50 hover:bg-blue-100',
    },
    {
      label: 'Detect Email',
      icon: Mail,
      path: '/detect?tab=email',
      color: 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100',
    },
    {
      label: 'Scan URL',
      icon: LinkIcon,
      path: '/detect?tab=url',
      color: 'text-sky-600 bg-sky-50 hover:bg-sky-100',
    },
    {
      label: 'View History',
      icon: Clock,
      path: '/history',
      color: 'text-purple-600 bg-purple-50 hover:bg-purple-100',
    },
  ];

  return (
    <Card className="h-full">
      <h2 className="text-base font-bold text-slate-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, idx) => {
          const Icon = action.icon;
          return (
            <button
              key={idx}
              onClick={() => navigate(action.path)}
              className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-100 hover:border-slate-200 transition-all group cursor-pointer text-center"
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2.5 transition-transform group-hover:scale-110 ${action.color}`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">
                {action.label}
              </span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
