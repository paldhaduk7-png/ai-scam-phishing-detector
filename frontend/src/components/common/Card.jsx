import React from 'react';

export default function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`bg-white dark:bg-[#11192e] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs p-6 transition-colors ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
