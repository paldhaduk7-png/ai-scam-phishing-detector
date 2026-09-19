import React from 'react';

/**
 * Enhanced Badge component with compact pill style,
 * subtle translucent tints, and crisp status dot indicators inspired by MailSentry.
 */
export default function Badge({
  children,
  status = 'default',
  size = 'md',
  className = '',
  showDot = true,
}) {
  const normalized = String(children || status).toLowerCase().trim();

  let styles =
    'bg-slate-100/90 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/60';
  let dotColor = 'bg-slate-400';
  let isAnimated = false;

  if (
    normalized.includes('phishing') ||
    normalized.includes('danger') ||
    normalized.includes('scam') ||
    normalized.includes('malicious')
  ) {
    styles =
      'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/25 dark:border-rose-500/20';
    dotColor = 'bg-rose-500';
    isAnimated = true;
  } else if (
    normalized.includes('suspicious') ||
    normalized.includes('warning') ||
    normalized.includes('medium')
  ) {
    styles =
      'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25 dark:border-amber-500/20';
    dotColor = 'bg-amber-500';
  } else if (
    normalized.includes('safe') ||
    normalized.includes('legit') ||
    normalized.includes('clean') ||
    normalized.includes('low')
  ) {
    styles =
      'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25 dark:border-emerald-500/20';
    dotColor = 'bg-emerald-500';
  } else if (
    normalized.includes('info') ||
    normalized.includes('message') ||
    normalized.includes('sms') ||
    normalized.includes('email') ||
    normalized.includes('url')
  ) {
    styles =
      'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/25 dark:border-blue-500/20';
    dotColor = 'bg-blue-500';
  }

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 gap-1.5 font-medium',
    md: 'text-xs px-2.5 py-0.5 gap-1.5 font-semibold',
    lg: 'text-sm px-3 py-1 gap-2 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full border ${sizes[size] || sizes.md} ${styles} ${className}`}
    >
      {showDot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${dotColor} shrink-0 ${
            isAnimated ? 'animate-pulse' : ''
          }`}
        />
      )}
      <span>{children}</span>
    </span>
  );
}
