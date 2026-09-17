import React from 'react';
import { Search, MessageSquare } from 'lucide-react';
import Button from '../common/Button';

/**
 * MessageInput component for scanning SMS, text messages, and mobile chat threats.
 */
export default function MessageInput({
  value = '',
  onChange,
  onSubmit,
  isLoading = false,
  maxLength = 1000,
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
      className="space-y-4 text-left"
    >
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label
            htmlFor="sms-message-input"
            className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200"
          >
            <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Message or SMS Content</span>
          </label>
          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
            {value.length} / {maxLength} chars
          </span>
        </div>

        <div className="relative">
          <textarea
            id="sms-message-input"
            rows={4}
            maxLength={maxLength}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Paste or type suspicious text message, prize notification, or banking alert here..."
            className="w-full p-3.5 bg-slate-50/70 dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-900 focus:bg-white dark:focus:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:border-blue-500 resize-none transition-all duration-150 leading-relaxed"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <Button
          type="submit"
          variant="primary"
          size="md"
          icon={Search}
          isLoading={isLoading}
          disabled={!value.trim() || isLoading}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-semibold shadow-xs shadow-blue-600/25 justify-center"
        >
          Analyze Message
        </Button>
      </div>
    </form>
  );
}
