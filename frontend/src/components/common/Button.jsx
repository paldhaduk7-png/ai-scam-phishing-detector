import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Enhanced Button component with tactile feedback, consistent height tokens,
 * accessible focus states, and refined hover/active micro-interactions.
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  icon: Icon,
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-xl select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98]';

  const variants = {
    primary:
      'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-xs shadow-blue-600/25 focus-visible:ring-blue-500',
    secondary:
      'bg-slate-100 hover:bg-slate-200 active:bg-slate-300 dark:bg-slate-800/90 dark:hover:bg-slate-700 dark:active:bg-slate-600 text-slate-800 dark:text-slate-100 focus-visible:ring-slate-400',
    outline:
      'border border-slate-200 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-800/70 active:bg-slate-100 dark:active:bg-slate-800 text-slate-700 dark:text-slate-200 focus-visible:ring-blue-500',
    ghost:
      'hover:bg-slate-100 dark:hover:bg-slate-800/70 active:bg-slate-200 dark:active:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white focus-visible:ring-slate-400',
    danger:
      'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-xs shadow-red-600/25 focus-visible:ring-red-500',
    subtleBlue:
      'bg-blue-50/90 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 active:bg-blue-200/80 dark:active:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-200/70 dark:border-blue-800/50 focus-visible:ring-blue-400',
  };

  const sizes = {
    sm: 'h-8 px-3 text-xs gap-1.5 font-medium',
    md: 'h-10 px-4 text-sm gap-2 font-medium',
    lg: 'h-12 px-6 text-base gap-2.5 font-semibold',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      {children}
    </button>
  );
}
