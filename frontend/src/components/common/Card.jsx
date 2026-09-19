import React from 'react';

/**
 * Modern Card container component with crisp 1px borders,
 * refined dark surface elevation, and soft SaaS shadows.
 */
export default function Card({
  children,
  className = '',
  hoverEffect = false,
  ...props
}) {
  const hoverStyles = hoverEffect
    ? 'hover:border-slate-300 dark:hover:border-slate-700/80 hover:shadow-md dark:hover:shadow-black/30 hover:-translate-y-0.5'
    : '';

  return (
    <div
      className={`bg-white dark:bg-[#0b111e] rounded-2xl border border-slate-200/80 dark:border-slate-800/70 shadow-xs dark:shadow-xl dark:shadow-black/20 p-5 sm:p-6 transition-all duration-200 ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
