import React from 'react';
import { Search, Link as LinkIcon, Globe } from 'lucide-react';
import Button from '../common/Button';

/**
 * UrlInput component for scanning URLs, web links, and domain names for phishing and typosquatting.
 * Supports both full protocols (https://) and bare domains (google.com).
 */
export default function UrlInput({
  value = '',
  onChange,
  onSubmit,
  isLoading = false,
}) {
  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
      className="space-y-4 text-left"
    >
      <div>
        <label
          htmlFor="url-scanner-input"
          className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2"
        >
          <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Web Address or Domain</span>
        </label>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
            <LinkIcon className="w-4 h-4" />
          </div>
          <input
            id="url-scanner-input"
            type="text"
            inputMode="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="e.g. google.com or http://scam-offer.com/claim-prize"
            autoComplete="off"
            spellCheck="false"
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 dark:bg-[#070b13] border border-slate-200/90 dark:border-slate-800/90 rounded-xl text-sm font-mono text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 transition-all duration-150"
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
          Scan URL
        </Button>
      </div>
    </form>
  );
}
