import React, { useState } from 'react';
import { Mail, Plus, Trash2, X, AlertCircle, Loader2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { requestGmailAccess } from '../../services/api';

export default function GmailAccessRequestModal({
  isOpen,
  onClose,
  onSuccess,
  initialEmails = [],
}) {
  const [emails, setEmails] = useState(
    initialEmails && initialEmails.length > 0 ? initialEmails : ['']
  );
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleAddEmail = () => {
    setEmails((prev) => [...prev, '']);
  };

  const handleRemoveEmail = (index) => {
    if (emails.length === 1) {
      setEmails(['']);
      return;
    }
    setEmails((prev) => prev.filter((_, i) => i !== index));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  };

  const handleEmailChange = (index, value) => {
    setEmails((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
    if (errors[index]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[index];
        return next;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    const cleanList = [];
    const seen = new Set();

    emails.forEach((raw, idx) => {
      const trimmed = raw.trim();
      if (!trimmed) {
        newErrors[idx] = 'Email address cannot be empty.';
        return;
      }
      if (!emailRegex.test(trimmed)) {
        newErrors[idx] = 'Please enter a valid email address.';
        return;
      }
      const lower = trimmed.toLowerCase();
      if (seen.has(lower)) {
        newErrors[idx] = 'Duplicate email address.';
        return;
      }
      seen.add(lower);
      cleanList.push(lower);
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please correct the highlighted email entries.');
      return;
    }

    if (cleanList.length === 0) {
      toast.error('Please enter at least one valid Gmail address.');
      return;
    }

    setLoading(true);
    try {
      const statusRes = await requestGmailAccess(cleanList);
      toast.success('Gmail access request submitted! Waiting for administrator review.');
      onSuccess?.(statusRes);
      onClose();
    } catch (err) {
      const detail = err.response?.data?.detail || 'Failed to submit access request. Please try again.';
      toast.error(typeof detail === 'string' ? detail : 'Submission failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#0b111e] rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xl p-6 sm:p-7 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200/70 dark:border-blue-800/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Request Gmail Analysis Access
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Specify the Gmail account(s) you wish to scan with ScamShield.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Security Info Banner */}
        <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-xs text-slate-600 dark:text-slate-300 space-y-1">
          <div className="flex items-center gap-2 font-semibold text-blue-900 dark:text-blue-200">
            <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>Administrator Verification Required</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
            In compliance with security policies, our administrators verify your requested Gmail addresses before enabling live email threat analysis.
          </p>
        </div>

        {/* Dynamic Email Input List Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Gmail Address(es)
            </label>

            {emails.map((email, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => handleEmailChange(idx, e.target.value)}
                      placeholder={idx === 0 ? 'user@gmail.com' : 'another@gmail.com'}
                      className={`w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-[#070b13] border rounded-xl font-mono text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none transition-colors ${
                        errors[idx]
                          ? 'border-rose-500 focus:border-rose-500 ring-1 ring-rose-500/20'
                          : 'border-slate-200 dark:border-slate-800 focus:border-blue-500'
                      }`}
                    />
                  </div>

                  {emails.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveEmail(idx)}
                      title="Remove this email"
                      className="p-2.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200/50 dark:hover:border-rose-900/30 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {errors[idx] && (
                  <p className="text-[11px] text-rose-500 flex items-center gap-1 font-medium pl-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors[idx]}</span>
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Add Another Email Button */}
          <button
            type="button"
            onClick={handleAddEmail}
            className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 py-1 px-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add another Gmail address</span>
          </button>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold rounded-xl shadow-sm shadow-blue-600/25 transition-all cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Send Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
