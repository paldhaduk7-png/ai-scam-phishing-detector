import React from 'react';

export default function Card({ children, className = '', ...props }) {
  const hasBg = className.includes('bg-');
  const bgClasses = hasBg ? '' : 'bg-white dark:bg-[#11192e]';
  const hasBorder = className.includes('border-');
  const borderClasses = hasBorder ? '' : 'border border-slate-200/90 dark:border-slate-700/70';

  return (
    <div
      className={`${bgClasses} rounded-2xl ${borderClasses} shadow-sm dark:shadow-md dark:shadow-black/25 p-6 transition-colors ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

