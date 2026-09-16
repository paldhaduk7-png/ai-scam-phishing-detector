import React from 'react';

/**
 * Modern Card container component with crisp border contrast,
 * refined surface elevation, and responsive dark/light transitions.
 */
export default function Card({
  children,
  className = '',
  hoverEffect = false,
  ...props
}) {
  const hoverStyles = hoverEffect
    ? 'hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md dark:hover:shadow-black/30 hover:-translate-y-0.5'
    : '';

  return (
    <div
      className={`bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/85 dark:border-slate-800/80 shadow-xs dark:shadow-md dark:shadow-black/20 p-6 transition-all duration-200 ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
