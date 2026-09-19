import React, { useState, useEffect, useCallback } from 'react';
import {
  Lock,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Mail,
  LogOut,
  Sparkles,
} from 'lucide-react';
import {
  getApiBaseUrl,
  getGmailStatus,
  startGmailAnalysis,
  disconnectGmail,
} from '../../services/api';
import GmailEmailSelectionModal from './GmailEmailSelectionModal';

function GoogleIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export default function GmailImportCard({
  onConnect,
  onJobStarted,
  autoOpenModal = false,
  onModalStateChange,
}) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectedEmail, setConnectedEmail] = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const checkStatus = useCallback(async () => {
    setCheckingStatus(true);
    try {
      const res = await getGmailStatus();
      if (res?.connected) {
        setIsConnected(true);
        setConnectedEmail(res?.email || null);
      } else {
        setIsConnected(false);
        setConnectedEmail(null);
      }
    } catch {
      setIsConnected(false);
    } finally {
      setCheckingStatus(false);
    }
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  // Handle external trigger to open modal (e.g. after OAuth return)
  useEffect(() => {
    if (autoOpenModal && isConnected) {
      setIsModalOpen(true);
      onModalStateChange?.(true);
    }
  }, [autoOpenModal, isConnected, onModalStateChange]);

  const handleConnect = () => {
    if (onConnect) {
      onConnect();
    } else {
      window.location.href = `${getApiBaseUrl()}/gmail/connect`;
    }
  };

  const handleDisconnect = async (e) => {
    e?.stopPropagation();
    try {
      await disconnectGmail();
      setIsConnected(false);
      setConnectedEmail(null);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to disconnect Gmail:', err);
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
    onModalStateChange?.(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    onModalStateChange?.(false);
  };

  const handleAnalyzeSelected = async (selectedIds) => {
    if (!selectedIds || selectedIds.length === 0) return;
    setActionLoading(true);
    try {
      const job = await startGmailAnalysis(selectedIds);
      if (onJobStarted) {
        onJobStarted(job);
      }
    } catch (err) {
      console.error('Failed to start selective Gmail analysis:', err);
    } finally {
      setActionLoading(false);
    }
  };

  if (checkingStatus) {
    return (
      <div className="border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-8 bg-white dark:bg-[#0b111e] shadow-xs flex flex-col items-center justify-center min-h-[220px] text-center">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-400 mb-2" />
        <p className="text-xs text-slate-500 dark:text-slate-400">Verifying Gmail connection status...</p>
      </div>
    );
  }

  // State: Connected
  if (isConnected) {
    return (
      <>
        <div className="border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 sm:p-6 bg-white dark:bg-[#0b111e] shadow-xs space-y-5 animate-fadeIn">
          {/* Header Bar */}
          <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-center shrink-0 p-2 shadow-2xs">
                <img
                  src="https://www.gstatic.com/images/branding/product/1x/gmail_2020q4_48dp.png"
                  alt="Gmail"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Connected ✓
                  </span>
                </div>
                <div className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white mt-1 flex items-center gap-1.5">
                  <span className="text-slate-500 dark:text-slate-400 font-normal">Gmail Account:</span>
                  <span className="text-blue-600 dark:text-blue-400 font-mono font-bold truncate">
                    {connectedEmail || 'paldhaduk18@gmail.com'}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDisconnect}
              title="Disconnect Gmail"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200/60 dark:border-rose-900/40 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Disconnect</span>
            </button>
          </div>

          {/* Action Callout */}
          <div className="bg-blue-50/50 dark:bg-[#070b13] border border-blue-100/80 dark:border-slate-800/80 rounded-xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center gap-2 text-blue-950 dark:text-blue-100 font-bold text-xs sm:text-sm">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Selective Threat Analysis</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Open your connected Gmail inbox to choose specific emails to analyze for phishing, scams, and deceptive content using ScamShield AI.
            </p>
          </div>

          {/* Button to Open Selection Modal */}
          <button
            type="button"
            onClick={handleOpenModal}
            disabled={actionLoading}
            className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm shadow-blue-500/25 transition-all duration-150 cursor-pointer disabled:opacity-75"
          >
            <Mail className="w-4 h-4" />
            <span>Choose Gmail Emails to Analyze</span>
            <ArrowRight className="w-4 h-4 ml-0.5" />
          </button>

          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 dark:text-slate-500 font-normal">
            <span>Google OAuth 2.0 • Read-only access</span>
          </div>
        </div>

        {/* Gmail Selection Modal Popup */}
        <GmailEmailSelectionModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onAnalyze={handleAnalyzeSelected}
          connectedEmail={connectedEmail}
        />
      </>
    );
  }

  // State: Disconnected -> Connect Gmail
  return (
    <div className="border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 sm:p-6 bg-white dark:bg-[#0b111e] shadow-xs space-y-5 animate-fadeIn">
      {/* Header: Gmail Icon + Title & Description */}
      <div className="flex items-start gap-3.5 sm:gap-4">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-center shrink-0 p-2.5 shadow-2xs">
          <img
            src="https://www.gstatic.com/images/branding/product/1x/gmail_2020q4_48dp.png"
            alt="Gmail"
            className="w-full h-full object-contain"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Connect Gmail
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Connect your Gmail account to open the inbox selector, choose emails, and scan them with ScamShield ML detection.
          </p>
        </div>
      </div>

      {/* Security Panel */}
      <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100/80 dark:border-blue-900/40 rounded-xl p-4 sm:p-4.5 space-y-3">
        <div className="flex items-center justify-between gap-2 pb-1">
          <div className="flex items-center gap-2 text-blue-950 dark:text-blue-100 font-bold text-xs sm:text-sm">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Lock className="w-3.5 h-3.5" />
            </div>
            <span>Secure Gmail Access</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100/80 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/50 font-mono">
            Read-only
          </span>
        </div>

        <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Read-only access to your emails</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>ScamShield cannot send emails</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>ScamShield cannot modify emails</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>ScamShield cannot delete emails</span>
          </div>
        </div>
      </div>

      {/* Connect Action Button */}
      <div className="space-y-2.5">
        <button
          type="button"
          onClick={handleConnect}
          disabled={actionLoading}
          className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md shadow-blue-600/20 hover:shadow-lg transition-all duration-150 cursor-pointer disabled:opacity-75"
        >
          <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shrink-0 shadow-2xs">
            <GoogleIcon className="w-3.5 h-3.5" />
          </div>
          <span>Connect Gmail</span>
          <ArrowRight className="w-4 h-4 ml-0.5" />
        </button>

        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 dark:text-slate-500 font-normal">
          <span>Google OAuth 2.0 • Read-only access</span>
        </div>
      </div>
    </div>
  );
}
