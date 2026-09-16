import React from 'react';
import Card from '../common/Card';

export default function StatCard({
  title,
  value = '--',
  change,
  subtext = 'No data yet',
  icon: Icon,
  colorScheme = 'blue',
}) {
  const schemes = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-950/60',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-100 dark:border-blue-900/60',
    },
    green: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/60',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-100 dark:border-emerald-900/60',
    },
    amber: {
      bg: 'bg-amber-50 dark:bg-amber-950/60',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-100 dark:border-amber-900/60',
    },
    red: {
      bg: 'bg-red-50 dark:bg-red-950/60',
      text: 'text-red-600 dark:text-red-400',
      border: 'border-red-100 dark:border-red-900/60',
    },
  };

  const scheme = schemes[colorScheme] || schemes.blue;

  return (
    <Card className="flex items-center justify-between p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
      <div className="space-y-2">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase">
          {title}
        </p>
        <div className="flex items-baseline gap-2.5">
          <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {value}
          </span>
          {change && (
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded-sm">
              {change}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500">{subtext}</p>
      </div>

      <div
        className={`w-12 h-12 rounded-2xl ${scheme.bg} ${scheme.border} border flex items-center justify-center ${scheme.text} shrink-0`}
      >
        {Icon && <Icon className="w-6 h-6" />}
      </div>
    </Card>
  );
}
