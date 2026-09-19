import React from 'react';
import Card from '../common/Card';

export default function StatCard({
  title,
  value = '--',
  change,
  subtext = 'No scan data available',
  icon: Icon,
  colorScheme = 'blue',
}) {
  const schemes = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-950/60',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-100 dark:border-blue-900/60',
      dot: 'bg-blue-500',
      hoverBorder: 'hover:border-blue-200 dark:hover:border-blue-800',
    },
    green: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/60',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-100 dark:border-emerald-900/60',
      dot: 'bg-emerald-500',
      hoverBorder: 'hover:border-emerald-200 dark:hover:border-emerald-800',
    },
    amber: {
      bg: 'bg-amber-50 dark:bg-amber-950/60',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-100 dark:border-amber-900/60',
      dot: 'bg-amber-500',
      hoverBorder: 'hover:border-amber-200 dark:hover:border-amber-800',
    },
    red: {
      bg: 'bg-red-50 dark:bg-red-950/60',
      text: 'text-red-600 dark:text-red-400',
      border: 'border-red-100 dark:border-red-900/60',
      dot: 'bg-red-500',
      hoverBorder: 'hover:border-red-200 dark:hover:border-red-800',
    },
  };

  const scheme = schemes[colorScheme] || schemes.blue;

  return (
    <Card
      className={`relative p-3.5 sm:p-5 transition-all duration-200 hover:shadow-md ${scheme.hoverBorder} group overflow-hidden`}
    >
      {/* Subtle top indicator bar for mobile accent */}
      <div className={`sm:hidden absolute top-0 left-0 right-0 h-0.5 ${scheme.dot} opacity-70`} />

      <div className="flex items-start justify-between gap-2 sm:gap-3">
        <div className="space-y-1 sm:space-y-1.5 min-w-0 flex-1">
          <div className="flex items-center gap-1 sm:gap-1.5">
            <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${scheme.dot} shrink-0`} />
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
              {title}
            </p>
          </div>

          <div className="flex items-baseline gap-1.5 sm:gap-2 pt-0.5">
            <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
              {value}
            </span>
            {change && (
              <span className="text-[10px] sm:text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1 sm:px-1.5 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-800/40">
                {change}
              </span>
            )}
          </div>

          <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 leading-snug truncate pt-0.5">
            {subtext}
          </p>
        </div>

        {Icon && (
          <div
            className={`w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl ${scheme.bg} ${scheme.border} border flex items-center justify-center ${scheme.text} shrink-0 shadow-2xs group-hover:scale-105 transition-transform`}
          >
            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        )}
      </div>
    </Card>
  );
}
