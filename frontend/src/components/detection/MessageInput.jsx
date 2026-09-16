import React from 'react';
import { Search } from 'lucide-react';
import Button from '../common/Button';

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
      className="space-y-4"
    >
      <div>
        <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
          Enter Message Text
        </label>
        <div className="relative">
          <textarea
            rows={5}
            maxLength={maxLength}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Type or paste the message here..."
            className="w-full p-4 bg-white dark:bg-[#0b1120] border border-slate-200 dark:border-slate-700/80 rounded-2xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 resize-none transition-all"
          />
          <div className="absolute right-4 bottom-3 text-xs font-medium text-slate-400 dark:text-slate-500 select-none">
            {value.length}/{maxLength}
          </div>
        </div>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="md"
        icon={Search}
        isLoading={isLoading}
        disabled={!value.trim() || isLoading}
        className="px-6 py-2.5 rounded-xl font-semibold shadow-md shadow-blue-600/20"
      >
        Analyze Now
      </Button>
    </form>
  );
}
