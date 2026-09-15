import React from 'react';

export default function Badge({ children, status = 'default', size = 'md', className = '' }) {
  const normalized = String(children || status).toLowerCase().trim();

  let styles = 'bg-slate-100 text-slate-700 border-slate-200';

  if (normalized.includes('phishing') || normalized.includes('danger') || normalized.includes('scam')) {
    styles = 'bg-red-50 text-red-700 border-red-200';
  } else if (normalized.includes('suspicious') || normalized.includes('warning') || normalized.includes('medium')) {
    styles = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (normalized.includes('safe') || normalized.includes('legit') || normalized.includes('clean') || normalized.includes('low')) {
    styles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (normalized.includes('info') || normalized.includes('message') || normalized.includes('email') || normalized.includes('url')) {
    styles = 'bg-blue-50 text-blue-700 border-blue-200';
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
