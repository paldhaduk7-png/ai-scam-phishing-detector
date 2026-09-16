import React from 'react';

export default function Badge({ children, status = 'default', size = 'md', className = '' }) {
  const normalized = String(children || status).toLowerCase().trim();

  let styles = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';

  if (normalized.includes('phishing') || normalized.includes('danger') || normalized.includes('scam')) {
    styles = 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-200 dark:border-red-900/60';
  } else if (normalized.includes('suspicious') || normalized.includes('warning') || normalized.includes('medium')) {
    styles = 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/60';
  } else if (normalized.includes('safe') || normalized.includes('legit') || normalized.includes('clean') || normalized.includes('low')) {
    styles = 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60';
  } else if (normalized.includes('info') || normalized.includes('message') || normalized.includes('email') || normalized.includes('url')) {
    styles = 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/60';
  }

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-medium',
    lg: 'text-sm px-3 py-1.5 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full border ${sizes[size] || sizes.md} ${styles} ${className}`}
    >
      {children}
    </span>
  );
}
