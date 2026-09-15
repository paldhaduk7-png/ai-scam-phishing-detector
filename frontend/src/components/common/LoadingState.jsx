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
      <div className="w-12 h-12 rounded-2xl bg-blue-50/80 border border-blue-100 flex items-center justify-center text-blue-600 mb-3 shadow-xs">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
      <p className="text-sm font-semibold text-slate-800">{text}</p>
      {subtext && <p className="text-xs text-slate-500 mt-1 max-w-xs">{subtext}</p>}
    </div>
  );
}
