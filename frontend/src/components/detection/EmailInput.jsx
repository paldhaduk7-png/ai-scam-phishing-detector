import React from 'react';
import { Search, Cpu, Sparkles, Mail } from 'lucide-react';
import Button from '../common/Button';

/**
 * EmailInput component with dual-engine model selection (Traditional ML vs. Bi-LSTM),
 * subject line input, email body textarea, and character limits.
 */
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
      className="space-y-4 text-left"
    >
      {/* Subject Line */}
      <div>
        <label
          htmlFor="email-subject-input"
          className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2"
        >
          <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Email Subject (Optional)</span>
        </label>
        <input
          id="email-subject-input"
          type="text"
          value={subject}
          onChange={(e) => onSubjectChange?.(e.target.value)}
          placeholder="e.g. URGENT: Verification required for your account access"
          className="w-full px-4 py-2.5 bg-slate-50/70 dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-900 focus:bg-white dark:focus:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:border-blue-500 transition-all duration-150"
        />
      </div>

      {/* Email Body Content */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label
            htmlFor="email-body-input"
            className="block text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200"
          >
            Email Body Content
          </label>
          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
            {content.length} / {maxLength} chars
          </span>
        </div>

        <div className="relative">
          <textarea
            id="email-body-input"
            rows={5}
            maxLength={maxLength}
            value={content}
            onChange={(e) => onContentChange?.(e.target.value)}
            placeholder="Paste full email text, including headers or suspicious link references..."
            className="w-full p-4 bg-slate-50/70 dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-900 focus:bg-white dark:focus:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:border-blue-500 resize-none transition-all duration-150 leading-relaxed"
          />
        </div>
      </div>

      {/* Email Model Selection Segmented Controls */}
      <div className="p-3 rounded-2xl bg-slate-100/60 dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            AI Classification Engine
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            {emailModel === 'dl'
              ? 'Deep Learning — Recurrent neural sequence analysis'
              : 'Traditional ML — Fast TF-IDF + LinearSVC classification'}
          </span>
        </div>

        <div
          role="radiogroup"
          aria-label="Detection Model"
          className="grid grid-cols-2 gap-2"
        >
          <button
            type="button"
            role="radio"
            aria-checked={emailModel === 'ml'}
            onClick={() => onEmailModelChange?.('ml')}
            className={`flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 ${
              emailModel === 'ml'
                ? 'bg-white dark:bg-[#1e293b] text-blue-700 dark:text-blue-300 shadow-xs border border-blue-200/80 dark:border-blue-800/80 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50 border border-transparent'
            }`}
          >
            <Cpu className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>Traditional ML</span>
          </button>

          <button
            type="button"
            role="radio"
            aria-checked={emailModel === 'dl'}
            onClick={() => onEmailModelChange?.('dl')}
            className={`flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 ${
              emailModel === 'dl'
                ? 'bg-white dark:bg-[#1e293b] text-indigo-700 dark:text-indigo-300 shadow-xs border border-indigo-200/80 dark:border-indigo-800/80 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50 border border-transparent'
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span>Bi-LSTM Neural Net</span>
          </button>
        </div>
      </div>

      {/* Action Row */}
      <div className="flex items-center justify-between pt-1">
        <Button
          type="submit"
          variant="primary"
          size="md"
          icon={Search}
          isLoading={isLoading}
          disabled={(!subject.trim() && !content.trim()) || isLoading}
          className="px-6 py-2.5 rounded-xl font-semibold shadow-xs shadow-blue-600/25"
        >
          Analyze Email
        </Button>
      </div>
    </form>
  );
}
