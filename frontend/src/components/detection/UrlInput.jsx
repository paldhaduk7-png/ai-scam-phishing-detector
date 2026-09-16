import React from 'react';
import { Search, Link as LinkIcon } from 'lucide-react';
import Button from '../common/Button';

/**
 * UrlInput component for scanning URLs, web links, and domain names for phishing and typosquatting.
 */
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
      className="space-y-4 text-left"
    >
      <div>
        <label
          htmlFor="url-scanner-input"
          className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2"
        >
          <LinkIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Suspicious URL or Web Address</span>
        </label>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
            <LinkIcon className="w-4 h-4" />
          </div>
          <input
            id="url-scanner-input"
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://paypal-security-update.xyz or http://bank-login.com"
            autoComplete="url"
            className="w-full pl-10 pr-4 py-3 bg-slate-50/70 dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-900 focus:bg-white dark:focus:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-mono text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:border-blue-500 transition-all duration-150"
          />
        </div>

        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
          Extracts domain depth, special symbol ratios, entropy, and keywords using an XGBoost detection model.
        </p>
      </div>

      <div className="flex items-center justify-between pt-1">
        <Button
          type="submit"
          variant="primary"
          size="md"
          icon={Search}
          isLoading={isLoading}
          disabled={!value.trim() || isLoading}
          className="px-6 py-2.5 rounded-xl font-semibold shadow-xs shadow-blue-600/25"
        >
          Scan URL
        </Button>
      </div>
    </form>
  );
}
