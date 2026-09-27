import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  Lock,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Mail,
  LogOut,
  Sparkles,
  Clock,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Send,
  Shield,
  ShieldAlert,
} from 'lucide-react';
import {
  getApiBaseUrl,
  getGmailStatus,
  getGmailAccessStatus,
  startGmailAnalysis,
  disconnectGmail,
} from '../../services/api';
import GmailEmailSelectionModal from './GmailEmailSelectionModal';
import GmailAccessRequestModal from './GmailAccessRequestModal';

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
  const { user } = useSelector((state) => state.auth);
  const isAdmin = Boolean(
    user?.role?.toUpperCase() === 'ADMIN' ||
    user?.email?.toLowerCase() === 'paldhadu7@gmail.com' ||
    user?.email?.toLowerCase() === 'paldhaduk7@gmail.com'
  );

  // Permission & Approval state: NOT_REQUESTED | PENDING | APPROVED | REJECTED | REVOKED
  // Administrators are always automatically APPROVED with full unrestricted access
  const [accessStatus, setAccessStatus] = useState(isAdmin ? 'APPROVED' : 'NOT_REQUESTED');
  const [accessData, setAccessData] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Effective status: always APPROVED for administrators
  const effectiveStatus = isAdmin ? 'APPROVED' : accessStatus;

  // Active OAuth connection state
  const [isConnected, setIsConnected] = useState(false);
  const [connectedEmail, setConnectedEmail] = useState(null);

  // Modals
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch both backend approval status and connection status
  const loadStatuses = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoadingStatus(true);

    try {
      // 1. Check user Gmail access permission status
      const accessRes = await getGmailAccessStatus();
      const currentAccess = isAdmin ? 'APPROVED' : (accessRes?.gmail_access_status || 'NOT_REQUESTED');
      setAccessStatus(currentAccess);
      setAccessData(accessRes);

      // 2. If approved (or admin), check if Gmail OAuth token is currently active
      if (isAdmin || currentAccess === 'APPROVED') {
        const connRes = await getGmailStatus();
        if (connRes?.connected) {
          setIsConnected(true);
          setConnectedEmail(connRes?.email || null);
        } else {
          setIsConnected(false);
          setConnectedEmail(null);
        }
      } else {
        setIsConnected(false);
        setConnectedEmail(null);
      }
    } catch {
      // Fallback
      if (isAdmin) {
        setAccessStatus('APPROVED');
        try {
          const connRes = await getGmailStatus();
          setIsConnected(Boolean(connRes?.connected));
          setConnectedEmail(connRes?.email || null);
        } catch {
          setIsConnected(false);
        }
      } else {
        setAccessStatus('NOT_REQUESTED');
        setIsConnected(false);
      }
    } finally {
      setLoadingStatus(false);
      setRefreshing(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    loadStatuses();
  }, [loadStatuses]);

  // Handle external trigger to open modal (e.g. after OAuth return)
  useEffect(() => {
    if (autoOpenModal && effectiveStatus === 'APPROVED' && isConnected) {
      setIsSelectionModalOpen(true);
      onModalStateChange?.(true);
    }
  }, [autoOpenModal, effectiveStatus, isConnected, onModalStateChange]);

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
      setIsSelectionModalOpen(false);
    } catch (err) {
      console.error('Failed to disconnect Gmail:', err);
    }
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

  const formatDate = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  if (loadingStatus) {
    return (
      <div className="border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-8 bg-white dark:bg-[#0b111e] shadow-xs flex flex-col items-center justify-center min-h-[220px] text-center">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-400 mb-2" />
        <p className="text-xs text-slate-500 dark:text-slate-400">Verifying Gmail access authorization...</p>
      </div>
    );
  }

  // ============================================================================
  // STATE 1: APPROVED & CONNECTED -> Active Inbox View
  // ============================================================================
  if (effectiveStatus === 'APPROVED' && isConnected) {
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
                  {isAdmin ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 border border-purple-200/60 dark:border-purple-800/40 px-2.5 py-0.5 rounded-full font-mono">
                      <Shield className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                      Admin Privileges
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-[10px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/40 px-2 py-0.5 rounded-full font-mono">
                      Approved
                    </span>
                  )}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white mt-1 flex items-center gap-1.5">
                  <span className="text-slate-500 dark:text-slate-400 font-normal">Active Account:</span>
                  <span className="text-blue-600 dark:text-blue-400 font-mono font-bold truncate">
                    {connectedEmail}
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
            onClick={() => {
              setIsSelectionModalOpen(true);
              onModalStateChange?.(true);
            }}
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
          isOpen={isSelectionModalOpen}
          onClose={() => {
            setIsSelectionModalOpen(false);
            onModalStateChange?.(false);
          }}
          onAnalyze={handleAnalyzeSelected}
          connectedEmail={connectedEmail}
        />
      </>
    );
  }

  // ============================================================================
  // STATE 2: APPROVED & NOT CONNECTED -> Show Approved Status + Connect Gmail
  // ============================================================================
  if (effectiveStatus === 'APPROVED' && !isConnected) {
    const approvedList = accessData?.approved_emails || [];
    return (
      <>
        <div className="border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 sm:p-6 bg-white dark:bg-[#0b111e] shadow-xs space-y-5 animate-fadeIn">
          {/* Header */}
          <div className="flex items-start gap-3.5 sm:gap-4">
            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${
              isAdmin
                ? 'bg-purple-50 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-800/40'
                : 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40'
            } flex items-center justify-center shrink-0 p-2.5 shadow-2xs`}>
              {isAdmin ? (
                <Shield className="w-7 h-7 text-purple-600 dark:text-purple-400" />
              ) : (
                <CheckCircle2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                {isAdmin ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 dark:text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 rounded-full font-mono">
                    <Shield className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                    Admin Full Access ✓
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-mono">
                    Status: Approved ✓
                  </span>
                )}
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight mt-1">
                {isAdmin ? 'Gmail Threat Analysis (Admin)' : 'Gmail Access Approved'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                {isAdmin
                  ? 'As an administrator, you have full unrestricted access to connect and analyze any Gmail account without requesting approval.'
                  : 'Your request has been approved by the administrator. You can now connect your approved Gmail account.'}
              </p>
            </div>
          </div>

          {/* Admin authorization status or Approved Emails Display */}
          {isAdmin ? (
            <div className="p-3.5 sm:p-4 rounded-xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-800/40 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-900 dark:text-purple-300">
                <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>All Gmail Accounts Authorized</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Administrators possess full platform access and can connect any Gmail address directly without submitting an access request.
              </p>
            </div>
          ) : (
            approvedList.length > 0 && (
              <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-[#070b13] border border-slate-200/80 dark:border-slate-800/80 space-y-2">
                <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">
                  Approved Gmail Address{approvedList.length > 1 ? 'es' : ''}:
                </span>
                <div className="flex flex-wrap gap-2">
                  {approvedList.map((em, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-medium rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60"
                    >
                      <Mail className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{em}</span>
                    </span>
                  ))}
                </div>
              </div>
            )
          )}

          {/* Security Information */}
          <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100/80 dark:border-blue-900/40 rounded-xl p-4 space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
            <div className="flex items-center gap-2 text-blue-950 dark:text-blue-100 font-bold">
              <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Secure Read-only Connection</span>
            </div>
            <div className="space-y-1.5 text-slate-600 dark:text-slate-400 text-[11px]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Only reads selected email headers and body text for scam detection</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Cannot send, delete, or modify any emails</span>
              </div>
            </div>
          </div>

          {/* Connect Action Button (Opens EXISTING OAuth Flow) */}
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={handleConnect}
              disabled={actionLoading}
              className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-75"
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
      </>
    );
  }

  // ============================================================================
  // STATE 3: PENDING -> Request Waiting for Admin Approval
  // ============================================================================
  if (accessStatus === 'PENDING') {
    const requestedList = accessData?.requested_emails || [];
    const requestDate = accessData?.latest_request?.requested_at;

    return (
      <>
        <div className="border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 sm:p-6 bg-white dark:bg-[#0b111e] shadow-xs space-y-5 animate-fadeIn">
          {/* Header */}
          <div className="flex items-start gap-3.5 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40 flex items-center justify-center shrink-0 p-2.5 shadow-2xs">
              <Clock className="w-7 h-7 text-amber-600 dark:text-amber-400 animate-pulse" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                  Status: Pending
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight mt-1">
                Gmail Access Request Pending
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                Your Gmail access request is waiting for administrator approval.
              </p>
            </div>
          </div>

          {/* Requested Emails Card */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#070b13] border border-slate-200/80 dark:border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">
                Requested Gmail Address{requestedList.length > 1 ? 'es' : ''}:
              </span>
              {requestDate && (
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  Requested on {formatDate(requestDate)}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {requestedList.length > 0 ? (
                requestedList.map((em, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-medium rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60"
                  >
                    <Mail className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>{em}</span>
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500">Your requested accounts</span>
              )}
            </div>
          </div>

          {/* Refresh Action (Explicitly NO Connect Gmail button) */}
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => loadStatuses(true)}
              disabled={refreshing}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Checking Status...' : 'Refresh Status'}</span>
            </button>

            <p className="text-center text-[11px] text-slate-400 dark:text-slate-500">
              Once an administrator approves your request, the Connect Gmail button will become active immediately.
            </p>
          </div>
        </div>
      </>
    );
  }

  // ============================================================================
  // STATE 4: REJECTED -> Show Rejection & Request Again
  // ============================================================================
  if (accessStatus === 'REJECTED') {
    const reason = accessData?.latest_request?.rejection_reason || 'Request was declined by administrator.';

    return (
      <>
        <div className="border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 sm:p-6 bg-white dark:bg-[#0b111e] shadow-xs space-y-5 animate-fadeIn">
          {/* Header */}
          <div className="flex items-start gap-3.5 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-800/40 flex items-center justify-center shrink-0 p-2.5 shadow-2xs">
              <XCircle className="w-7 h-7 text-rose-600 dark:text-rose-400" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 rounded-full font-mono">
                  Status: Rejected
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight mt-1">
                Gmail Access Request Rejected
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                Your request for Gmail analysis access was not approved by the administrator.
              </p>
            </div>
          </div>

          {/* Admin Rejection Reason Display */}
          <div className="p-4 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/70 dark:border-rose-900/50 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-900 dark:text-rose-300">
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>Administrator Reason:</span>
            </div>
            <p className="text-xs text-rose-700 dark:text-rose-300 leading-relaxed pl-6">
              {reason}
            </p>
          </div>

          {/* Request Again Action */}
          <button
            type="button"
            onClick={() => setIsRequestModalOpen(true)}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm shadow-blue-600/25 transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Request Again</span>
            <ArrowRight className="w-4 h-4 ml-0.5" />
          </button>
        </div>

        <GmailAccessRequestModal
          isOpen={isRequestModalOpen}
          onClose={() => setIsRequestModalOpen(false)}
          onSuccess={() => loadStatuses(true)}
          initialEmails={accessData?.requested_emails || []}
        />
      </>
    );
  }

  // ============================================================================
  // STATE 5: REVOKED -> Access Revoked by Admin
  // ============================================================================
  if (accessStatus === 'REVOKED') {
    return (
      <>
        <div className="border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 sm:p-6 bg-white dark:bg-[#0b111e] shadow-xs space-y-5 animate-fadeIn">
          {/* Header */}
          <div className="flex items-start gap-3.5 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-800/40 flex items-center justify-center shrink-0 p-2.5 shadow-2xs">
              <ShieldAlert className="w-7 h-7 text-rose-600 dark:text-rose-400" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 rounded-full font-mono">
                  Status: Revoked
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight mt-1">
                Gmail Access Revoked
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                Your Gmail analysis access has been revoked by the administrator.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#070b13] border border-slate-200/80 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Existing detection scans and history remain intact. If you require Gmail scanning access again, please submit a new authorization request.
          </div>

          {/* Request Access Again */}
          <button
            type="button"
            onClick={() => setIsRequestModalOpen(true)}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm shadow-blue-600/25 transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Request Access Again</span>
            <ArrowRight className="w-4 h-4 ml-0.5" />
          </button>
        </div>

        <GmailAccessRequestModal
          isOpen={isRequestModalOpen}
          onClose={() => setIsRequestModalOpen(false)}
          onSuccess={() => loadStatuses(true)}
          initialEmails={accessData?.approved_emails || accessData?.requested_emails || []}
        />
      </>
    );
  }

  // ============================================================================
  // STATE 0: NOT_REQUESTED -> User must request access first
  // ============================================================================
  return (
    <>
      <div className="border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 sm:p-6 bg-white dark:bg-[#0b111e] shadow-xs space-y-5 animate-fadeIn">
        {/* Header */}
        <div className="flex items-start gap-3.5 sm:gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/50 flex items-center justify-center shrink-0 p-2.5 shadow-2xs">
            <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Gmail Analysis Access
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Gmail analysis requires administrator approval before you can connect an account.
            </p>
          </div>
        </div>

        {/* Informational Callout */}
        <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100/80 dark:border-blue-900/40 rounded-xl p-4 sm:p-4.5 space-y-3">
          <div className="flex items-center gap-2 text-blue-950 dark:text-blue-100 font-bold text-xs sm:text-sm">
            <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Administrator Access Control</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            You need administrator approval before connecting Gmail. Submit your Gmail address(es) to request authorization for real-time scam and phishing inspection.
          </p>
        </div>

        {/* Primary Action: Request Gmail Access */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={() => setIsRequestModalOpen(true)}
            className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md shadow-blue-600/20 hover:shadow-lg transition-all duration-150 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Request Gmail Access</span>
            <ArrowRight className="w-4 h-4 ml-0.5" />
          </button>

          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 dark:text-slate-500 font-normal">
            <span>Requests are reviewed by administrators in accordance with security policies</span>
          </div>
        </div>
      </div>

      <GmailAccessRequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        onSuccess={() => loadStatuses(true)}
      />
    </>
  );
}
