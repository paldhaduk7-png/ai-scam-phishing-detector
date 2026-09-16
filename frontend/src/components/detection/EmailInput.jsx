import React from 'react';
import { Search, Cpu, Sparkles } from 'lucide-react';
import Button from '../common/Button';

export default function EmailInput({
  subject = '',
  content = '',
  onSubjectChange,
  onContentChange,
  onSubmit,
  isLoading = false,
  maxLength = 2000,
  emailModel = 'ml',
  onEmailModelChange,
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
      className="space-y-4"
    >
      <div>
        <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
          Subject
        </label>
        <input
          type="text"
          value={subject}
          onChange={(e) => onSubjectChange?.(e.target.value)}
          placeholder="e.g. Urgent: Action Required on Your Account"
          className="w-full px-4 py-2.5 bg-white dark:bg-[#0b1120] border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
          Email Content
        </label>
        <div className="relative">
          <textarea
            rows={5}
            maxLength={maxLength}
            value={content}
            onChange={(e) => onContentChange?.(e.target.value)}
            placeholder="Type or paste the full email content here..."
            className="w-full p-4 bg-white dark:bg-[#0b1120] border border-slate-200 dark:border-slate-700/80 rounded-2xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 resize-none transition-all"
          />
          <div className="absolute right-4 bottom-3 text-xs font-medium text-slate-400 dark:text-slate-500 select-none">
            {content.length}/{maxLength}
          </div>
        </div>
      </div>

      {/* Email Model Selector */}
      <div className="pt-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Detection Model
          </label>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {emailModel === 'dl'
              ? 'Bi-LSTM — Deep learning email analysis'
              : 'Traditional ML — Fast text-based analysis'}
          </span>
        </div>

        <div
          role="radiogroup"
          aria-label="Detection Model"
          className="inline-flex p-1 bg-slate-100/90 dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800 gap-1 w-full sm:w-auto"
        >
          <button
            type="button"
            role="radio"
            aria-checked={emailModel === 'ml'}
            onClick={() => onEmailModelChange?.('ml')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-150 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 ${
              emailModel === 'ml'
                ? 'bg-white dark:bg-[#1e293b] text-blue-700 dark:text-blue-400 shadow-xs border border-slate-200/80 dark:border-slate-700 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/50 border border-transparent'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Traditional ML</span>
          </button>

          <button
            type="button"
            role="radio"
            aria-checked={emailModel === 'dl'}
            onClick={() => onEmailModelChange?.('dl')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-150 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 ${
              emailModel === 'dl'
                ? 'bg-white dark:bg-[#1e293b] text-blue-700 dark:text-blue-400 shadow-xs border border-slate-200/80 dark:border-slate-700 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/50 border border-transparent'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Bi-LSTM</span>
          </button>
        </div>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="md"
        icon={Search}
        isLoading={isLoading}
        disabled={(!subject.trim() && !content.trim()) || isLoading}
        className="px-6 py-2.5 rounded-xl font-semibold shadow-md shadow-blue-600/20"
      >
        Analyze Now
      </Button>
    </form>
  );
}

