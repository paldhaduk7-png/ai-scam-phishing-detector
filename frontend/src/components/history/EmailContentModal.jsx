import React from 'react';
import { createPortal } from 'react-dom';
import { X, Mail, User, AtSign, Calendar, AlignLeft } from 'lucide-react';
import Button from '../common/Button';

/**
 * EmailContentModal
 *
 * Displays the full content of a scanned email record when the user clicks
 * a row in the Email History table.
 *
 * Props:
 *   item    — the DetectionHistoryItem object (or null when closed)
 *   onClose — callback to close the modal
 */
export default function EmailContentModal({ item, onClose }) {
  if (!item) return null;

  const isGmail = item.source === 'gmail';

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Email Details"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#0b101b] border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/40 flex items-center justify-center">
              <Mail className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <span className="font-bold text-base text-slate-950 dark:text-white">
              Email Details
            </span>
            {isGmail && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200/80 dark:border-red-900/40">
                <img
                  src="https://www.gstatic.com/images/branding/product/1x/gmail_2020q4_48dp.png"
                  className="w-3 h-3 object-contain"
                  alt=""
                />
                Gmail
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close email details"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Metadata Fields ── */}
        <div className="px-6 pt-4 pb-3 space-y-3 shrink-0">

          {/* From */}
          <div className="flex gap-3 items-start">
            <div className="w-7 h-7 mt-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center shrink-0">
              <User className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">
                From
              </p>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 font-mono break-all">
                {item.sender || (
                  <span className="text-slate-400 dark:text-slate-500 italic font-sans font-normal">
                    Not available
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Subject */}
          <div className="flex gap-3 items-start">
            <div className="w-7 h-7 mt-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center shrink-0">
              <AtSign className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">
                Subject
              </p>
              <p className="text-xs font-semibold text-slate-900 dark:text-white break-words">
                {item.subject || (
                  <span className="text-slate-400 dark:text-slate-500 italic font-sans font-normal">
                    No subject
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Date */}
          <div className="flex gap-3 items-start">
            <div className="w-7 h-7 mt-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center shrink-0">
              <Calendar className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">
                Date
              </p>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {item.date_time || item.timestamp || item.created_at || '--'}
              </p>
            </div>
          </div>

        </div>

        {/* ── Divider ── */}
        <div className="mx-6 border-t border-slate-100 dark:border-slate-800 shrink-0" />

        {/* ── Body ── */}
        <div className="px-6 pt-3 pb-2 flex flex-col gap-2 min-h-0 flex-1 overflow-hidden">
          <div className="flex items-center gap-2 shrink-0">
            <AlignLeft className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Email Body
            </span>
          </div>
          <div className="flex-1 overflow-y-auto rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 text-xs text-slate-800 dark:text-slate-200 font-mono whitespace-pre-wrap break-words leading-relaxed min-h-[120px]">
            {item.input_text || item.input || (
              <span className="text-slate-400 dark:text-slate-500 italic font-sans">
                No email content available.
              </span>
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 flex justify-end border-t border-slate-100 dark:border-slate-800 shrink-0">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
