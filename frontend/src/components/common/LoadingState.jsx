import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingState({
  text = 'Loading...',
  subtext,
  className = '',
  compact = false,
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${
        compact ? 'py-6 px-4' : 'py-12 px-6'
      } ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-blue-50/80 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/60 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-3 shadow-xs">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
      <p className="text-sm font-semibold text-slate-800 dark:text-white">{text}</p>
      {subtext && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">{subtext}</p>}
    </div>
  );
}
