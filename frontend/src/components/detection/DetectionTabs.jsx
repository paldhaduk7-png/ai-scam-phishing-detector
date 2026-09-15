import React from 'react';
import { MessageSquare, Mail, Link as LinkIcon } from 'lucide-react';

export default function DetectionTabs({ activeTab, onChange }) {
  const tabs = [
    { id: 'message', label: 'Message', icon: MessageSquare },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'url', label: 'URL', icon: LinkIcon },
  ];

  return (
    <div className="inline-flex p-1.5 bg-slate-100/90 rounded-2xl gap-1">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer ${
              isActive
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
