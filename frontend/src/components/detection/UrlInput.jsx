import React from 'react';
import { Search, Link as LinkIcon } from 'lucide-react';
import Button from '../common/Button';

export default function UrlInput({
  value = '',
  onChange,
  onSubmit,
  isLoading = false,
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
          Suspicious URL
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <LinkIcon className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Enter suspicious URL (e.g. https://scam-security-check.com)..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 transition-all"
          />
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
