import React from 'react';
import { MessageSquare, Mail, Link as LinkIcon } from 'lucide-react';

/**
 * DetectionTabs provides a modern segmented control for switching
 * between Message (SMS), Email, and URL detection channels.
 */
export default function DetectionTabs({ activeTab, onChange }) {
  const tabs = [
    { id: 'message', label: 'Message / SMS', shortLabel: 'SMS / Text', icon: MessageSquare },
    { id: 'email', label: 'Email Analysis', shortLabel: 'Email', icon: Mail },
    { id: 'url', label: 'URL Scanner', shortLabel: 'URL', icon: LinkIcon },
  ];

  return (
    <div
      role="tablist"
      aria-label="Detection Channels"
      className="inline-flex p-1 sm:p-1.5 bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-2xl gap-1 sm:gap-1.5 w-full sm:w-auto shadow-2xs"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-4.5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 select-none ${
              isActive
                ? 'bg-white dark:bg-[#1e293b] text-blue-700 dark:text-blue-300 shadow-xs border border-slate-200/90 dark:border-slate-700/80 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 border border-transparent'
            }`}
          >
            <Icon
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 transition-colors ${
                isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'
              }`}
            />
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.shortLabel}</span>
          </button>
        );
      })}
    </div>
  );
}
