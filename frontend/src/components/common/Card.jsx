import React from 'react';

export default function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-100 shadow-xs p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
