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
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-100',
    },
    green: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      border: 'border-emerald-100',
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      border: 'border-amber-100',
    },
    red: {
      bg: 'bg-red-50',
      text: 'text-red-600',
      border: 'border-red-100',
    },
  };

  const scheme = schemes[colorScheme] || schemes.blue;

  return (
    <Card className="flex items-center justify-between p-5 hover:border-slate-300 transition-colors">
      <div className="space-y-2">
        <p className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
          {title}
        </p>
        <div className="flex items-baseline gap-2.5">
          <span className="text-2xl font-bold text-slate-900 tracking-tight">
            {value}
          </span>
          {change && (
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-sm">
              {change}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-400">{subtext}</p>
      </div>

      <div
        className={`w-12 h-12 rounded-2xl ${scheme.bg} ${scheme.border} border flex items-center justify-center ${scheme.text} shrink-0`}
      >
        {Icon && <Icon className="w-6 h-6" />}
      </div>
    </Card>
  );
}
