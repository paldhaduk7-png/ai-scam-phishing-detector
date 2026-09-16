import React, { useEffect } from 'react';
import { AlertTriangle, LogOut, X, Loader2 } from 'lucide-react';
import Button from './Button';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Sign Out Confirmation',
  message = 'Are you sure you want to sign out? You will need to sign back in to access your personal dashboard and scan history.',
  confirmText = 'Sign Out',
  cancelText = 'Cancel',
  icon: Icon = LogOut,
  variant = 'danger',
  loading = false,
}) {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-fadeIn"
        onClick={!loading ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        className="relative z-10 w-full max-w-md bg-[#11192e] border border-slate-700/80 rounded-2xl shadow-2xl p-6 sm:p-7 text-left transform transition-all animate-scaleUp overflow-hidden"
      >
        {/* Subtle decorative glow */}
        <div className="absolute -top-12 -left-12 w-36 h-36 bg-red-600/15 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer disabled:opacity-50"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon + Content */}
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
              variant === 'danger'
                ? 'bg-red-500/15 text-red-400 border border-red-500/30 shadow-red-500/10'
                : 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-amber-500/10'
            }`}
          >
            <Icon className="w-6 h-6" />
          </div>

          <div className="space-y-1.5 pr-4">
            <h3
              id="confirm-modal-title"
              className="text-lg font-bold text-white tracking-tight"
            >
              {title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-7 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 sm:gap-3 border-t border-slate-800/80 pt-5">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-700/80 transition-colors cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white shadow-lg transition-all cursor-pointer disabled:opacity-50 ${
              variant === 'danger'
                ? 'bg-red-600 hover:bg-red-500 shadow-red-600/30'
                : 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Icon className="w-4 h-4" />
                <span>{confirmText}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
