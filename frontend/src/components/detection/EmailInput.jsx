import React from 'react';
import { Search } from 'lucide-react';
import Button from '../common/Button';

export default function EmailInput({
  subject = '',
  content = '',
  onSubjectChange,
  onContentChange,
  onSubmit,
  isLoading = false,
  maxLength = 2000,
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
        <label className="block text-sm font-semibold text-slate-800 mb-2">
          Subject
        </label>
        <input
          type="text"
          value={subject}
          onChange={(e) => onSubjectChange(e.target.value)}
          placeholder="e.g. Urgent: Action Required on Your Account"
          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-800 mb-2">
          Email Content
        </label>
        <div className="relative">
          <textarea
            rows={5}
            maxLength={maxLength}
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            placeholder="Type or paste the full email content here..."
            className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 resize-none transition-all"
          />
          <div className="absolute right-4 bottom-3 text-xs font-medium text-slate-400 select-none">
            {content.length}/{maxLength}
          </div>
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
