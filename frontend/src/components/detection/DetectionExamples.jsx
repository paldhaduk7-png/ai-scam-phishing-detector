import React from 'react';

export default function DetectionExamples({ onSelect }) {
  const examples = [
    { text: 'You won a free iPhone!', type: 'message' },
    { text: 'Can you send me money?', type: 'message' },
    { text: 'Check this link', type: 'message' },
    { text: 'Urgent: Update your account', type: 'message' },
  ];

  return (
    <div className="pt-2">
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">Try these examples:</p>
      <div className="flex flex-wrap gap-2">
        {examples.map((ex, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelect?.(ex)}
            className="px-3 py-1.5 rounded-full text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-50/80 dark:bg-blue-950/50 hover:bg-blue-100/80 dark:hover:bg-blue-900/60 border border-blue-100 dark:border-blue-900/60 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            {ex.text}
          </button>
        ))}
      </div>
    </div>
  );
}
