import React from 'react';
import { Sparkles } from 'lucide-react';

/**
 * DetectionExamples component renders realistic test phrases that
 * auto-fill into the active detection tab when clicked.
 */
export default function DetectionExamples({ onSelect }) {
  const examples = [
    { text: 'You won a free iPhone!', type: 'message' },
    { text: 'Can you send me money?', type: 'message' },
    { text: 'Check this link', type: 'message' },
    { text: 'Urgent: Update your account', type: 'message' },
  ];

  return (
    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 text-left">
      <div className="flex items-center gap-1.5 mb-2">
        <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
          Try a sample scan:
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {examples.map((ex, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelect?.(ex)}
            className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-700 dark:hover:text-blue-300 border border-slate-200/70 dark:border-slate-700/60 hover:border-blue-300 dark:hover:border-blue-800/70 transition-all duration-150 cursor-pointer shadow-2xs active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30"
          >
            "{ex.text}"
          </button>
        ))}
      </div>
    </div>
  );
}
