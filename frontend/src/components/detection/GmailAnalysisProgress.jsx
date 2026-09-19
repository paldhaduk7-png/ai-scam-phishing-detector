import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  CheckCircle2,
  Loader2,
  ArrowRight,
  ExternalLink,
  AlertOctagon,
  Inbox,
  Clock,
  Sparkles,
  StopCircle,
} from 'lucide-react';
import { getGmailAnalysisProgress, cancelGmailAnalysis } from '../../services/api';

export default function GmailAnalysisProgress({
  initialJob,
  onProgressUpdate,
  onCompleted,
  onCancel,
  onStartNew,
}) {
  const navigate = useNavigate();
  const [job, setJob] = useState(initialJob);
  const [cancelling, setCancelling] = useState(false);

  const onCompletedRef = useRef(onCompleted);
  const onProgressUpdateRef = useRef(onProgressUpdate);
  const notifiedCompletedJobId = useRef(null);

  useEffect(() => {
    onCompletedRef.current = onCompleted;
  }, [onCompleted]);

  useEffect(() => {
    onProgressUpdateRef.current = onProgressUpdate;
  }, [onProgressUpdate]);

  useEffect(() => {
    if (initialJob?.job_id) {
      setJob((prev) => {
        if (
          prev?.job_id === initialJob.job_id &&
          prev?.status === initialJob.status &&
          prev?.processed === initialJob.processed
        ) {
          return prev;
        }
        return initialJob;
      });
    }
  }, [initialJob]);

  useEffect(() => {
    if (!job?.job_id) return;

    // Do not poll if already completed, failed, or cancelled
    if (job.status === 'completed') {
      if (notifiedCompletedJobId.current !== job.job_id) {
        notifiedCompletedJobId.current = job.job_id;
        onCompletedRef.current?.(job);
      }
      return;
    }

    if (['failed', 'cancelled'].includes(job.status)) {
      return;
    }

    let isSubscribed = true;
    const intervalId = setInterval(async () => {
      try {
        const updated = await getGmailAnalysisProgress(job.job_id);
        if (!isSubscribed) return;

        setJob(updated);
        onProgressUpdateRef.current?.(updated);

        if (updated.status === 'completed') {
          clearInterval(intervalId);
          if (notifiedCompletedJobId.current !== updated.job_id) {
            notifiedCompletedJobId.current = updated.job_id;
            if (onCompletedRef.current) {
              onCompletedRef.current(updated);
            } else {
              navigate('/history/email');
            }
          }
        } else if (['failed', 'cancelled'].includes(updated.status)) {
          clearInterval(intervalId);
        }
      } catch (err) {
        console.warn('Error polling Gmail analysis progress:', err);
      }
    }, 1500);

    return () => {
      isSubscribed = false;
      clearInterval(intervalId);
    };
  }, [job?.job_id, job?.status, navigate]);

  const handleCancel = async () => {
    if (!job?.job_id || cancelling) return;
    setCancelling(true);
    try {
      const res = await cancelGmailAnalysis(job.job_id);
      if (res?.job) {
        setJob(res.job);
      }
      onCancel?.();
    } catch (err) {
      console.error('Failed to cancel job:', err);
    } finally {
      setCancelling(false);
    }
  };

  const total = job?.total || 0;
  const processed = job?.processed || 0;
  const remaining = job?.remaining ?? Math.max(0, total - processed);
  const progressPercent = job?.progress_percent || (total > 0 ? Math.round((processed / total) * 100) : 0);
  const currentEmail = job?.current_email;
  const isCompleted = job?.status === 'completed';
  const isFailed = job?.status === 'failed';
  const isCancelled = job?.status === 'cancelled';

  return (
    <div className="bg-white dark:bg-[#0b101b] border border-slate-200/90 dark:border-slate-800/80 rounded-2xl p-6 sm:p-8 max-w-2xl mx-auto shadow-sm space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-xs">
            {isCompleted ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            ) : (
              <Mail className="w-6 h-6 animate-pulse text-emerald-600 dark:text-emerald-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                {isCompleted ? 'Analysis Completed!' : 'Analysing Your Emails'}
              </h3>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Live
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isCompleted
                ? 'All available emails have been scanned and classified into your Email History.'
                : 'We are fetching and analyzing all your emails. This background job will continue even if you leave this page.'}
            </p>
          </div>
        </div>

        {/* View History Shortcut */}
        <button
          type="button"
          onClick={() => navigate('/history/email')}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded-lg border border-blue-200/60 dark:border-blue-800/50 transition-colors"
        >
          <span>Email History</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Metric Cards (Total, Analyzed, Remaining) */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-3 sm:p-4 text-center">
          <span className="block text-[11px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">
            Total Emails
          </span>
          <span className="block text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1 font-mono">
            {total.toLocaleString()}
          </span>
        </div>

        <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-900/40 rounded-xl p-3 sm:p-4 text-center">
          <span className="block text-[11px] uppercase tracking-wider font-semibold text-emerald-700 dark:text-emerald-400">
            Analyzed
          </span>
          <span className="block text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
            {processed.toLocaleString()}
          </span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-3 sm:p-4 text-center">
          <span className="block text-[11px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">
            Remaining
          </span>
          <span className="block text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1 font-mono">
            {remaining.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
          <span>Overall Progress</span>
          <span className="font-mono text-blue-600 dark:text-blue-400">{progressPercent}%</span>
        </div>
        <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
          <div
            className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 transition-all duration-300 rounded-full"
            style={{ width: `${Math.min(100, progressPercent)}%` }}
          />
        </div>
      </div>

      {/* Current Email Card */}
      {currentEmail && !isCompleted && (
        <div className="bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 rounded-xl p-3.5 flex items-start gap-3 text-left">
          <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
            <Loader2 className="w-4 h-4 animate-spin" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-900 dark:text-blue-300">
              <span>Analyzing Email {processed} of {total}</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-200 font-medium truncate mt-0.5">
              <span className="text-slate-500 dark:text-slate-400">From:</span> {currentEmail.from}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300 truncate">
              <span className="text-slate-500 dark:text-slate-400">Subject:</span> {currentEmail.subject}
            </p>
          </div>
        </div>
      )}

      {/* Real-time Checklist Status */}
      <div className="bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 rounded-xl p-4 space-y-2 text-xs text-slate-600 dark:text-slate-300 text-left">
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Gmail connected and authorized</span>
        </div>

        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Fetched {total.toLocaleString()} emails using Gmail API pagination</span>
        </div>

        {!isCompleted && !isCancelled && !isFailed && (
          <>
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium">
              <Loader2 className="w-4 h-4 shrink-0 animate-spin" />
              <span>Analyzing email {processed}/{total} with ML phishing detection engine</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-slate-400" />
              <span>Saving results directly to PostgreSQL Email History</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Sparkles className="w-4 h-4 shrink-0 text-amber-500" />
              <span>Streaming next email in background...</span>
            </div>
          </>
        )}

        {isCompleted && (
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>All results saved. Navigating to Email History...</span>
          </div>
        )}

        {isCancelled && (
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-medium">
            <AlertOctagon className="w-4 h-4 shrink-0" />
            <span>Analysis was stopped by user. Processed {processed} emails.</span>
          </div>
        )}

        {isFailed && (
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-medium">
            <AlertOctagon className="w-4 h-4 shrink-0" />
            <span>{job.error_message || 'Analysis encountered an error.'}</span>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-2">
        {!isCompleted && !isCancelled && !isFailed ? (
          <button
            type="button"
            onClick={handleCancel}
            disabled={cancelling}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg border border-rose-200 dark:border-rose-900/50 transition-colors cursor-pointer"
          >
            <StopCircle className="w-3.5 h-3.5" />
            <span>{cancelling ? 'Stopping...' : 'Stop Analysis'}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onStartNew || onCancel}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Scan Again</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => navigate('/history/email')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all cursor-pointer"
        >
          <span>Open Email History</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
