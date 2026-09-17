import React from 'react';
import { Sparkles } from 'lucide-react';

/**
 * DetectionExamples component renders realistic test phrases that
 * auto-fill into the active detection tab when clicked.
 */
export default function DetectionExamples({ activeTab = 'message', onSelect }) {
  const samplesByTab = {
    message: [
      { label: 'Prize Scam', text: 'You won a free iPhone 15 Pro! Claim your prize now: http://win-claim.xyz', type: 'message' },
      { label: 'Parcel Fraud', text: 'USPS: Your package #US9281 has failed delivery. Update address: http://usps-track-parcel.info', type: 'message' },
      { label: 'Safe SMS', text: 'Hey, are we still meeting for lunch at 12:30 today? Let me know!', type: 'message' },
    ],
    email: [
      { label: 'Account Suspension', text: 'Dear Customer, unusual sign-in activity was detected on your account. Verify your identity immediately at http://secure-auth-login.xyz to avoid suspension.', type: 'email' },
      { label: 'Wire Transfer Lure', text: 'Kindly review the attached overdue invoice. Remit the remaining balance of $4,850 via bank transfer today.', type: 'email' },
      { label: 'Safe Email', text: 'Hi team, please find attached the quarterly project review slides for tomorrow morning sprint sync.', type: 'email' },
    ],
    url: [
      { label: 'Legitimate', text: 'https://www.google.com', type: 'url' },
      { label: 'Phishing', text: 'https://paypal-security-verify-account.com', type: 'url' },
      { label: 'Prize Scam', text: 'http://scam-offer.com/claim-prize', type: 'url' },
      { label: 'Direct Domain', text: 'google.com', type: 'url' },
    ],
  };

  const currentSamples = samplesByTab[activeTab] || samplesByTab.message;

  return (
    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 text-left">
      <div className="flex items-center gap-1.5 mb-2">
        <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
          Quick test samples:
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {currentSamples.map((ex, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelect?.(ex)}
            className="px-2.5 py-1 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-700 dark:hover:text-blue-300 border border-slate-200/70 dark:border-slate-700/60 hover:border-blue-300 dark:hover:border-blue-800/70 transition-all duration-150 cursor-pointer shadow-2xs active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30"
          >
            <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 mr-1.5">
              {ex.label}:
            </span>
            <span className="truncate max-w-[180px] inline-block align-bottom font-mono text-[11px]">
              {ex.text}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
