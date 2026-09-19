import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import HistoryFilters from '../components/history/HistoryFilters';
import HistoryTable from '../components/history/HistoryTable';
import EmailContentModal from '../components/history/EmailContentModal';
import ConfirmModal from '../components/common/ConfirmModal';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import {
  getDetectionHistory,
  deleteDetectionRecord,
  clearAllDetectionHistory,
  toggleStarDetection,
  getActiveGmailAnalysis,
} from '../services/api';
import {
  X,
  Copy,
  Check,
  Trash2,
  Plus,
  Star,
  Clock,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

export default function History({ channel: propChannel }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Determine active channel from prop or route path
  let activeChannel = propChannel;
  if (!activeChannel) {
    if (location.pathname.includes('/history/email')) activeChannel = 'email';
    else if (location.pathname.includes('/history/text')) activeChannel = 'sms';
    else if (location.pathname.includes('/history/url')) activeChannel = 'url';
    else activeChannel = 'all';
  }

  const activeTab = searchParams.get('tab') === 'starred' ? 'starred' : 'all';

  const [historyItems, setHistoryItems] = useState([]);
  const [typeFilter, setTypeFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all'); // 'all' | 'manual' | 'gmail'
  const [resultFilter, setResultFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Active Gmail Background Job Tracking
  const [activeGmailJob, setActiveGmailJob] = useState(null);

  // Modal states
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showClearAllModal, setShowClearAllModal] = useState(false);
  const [clearAllLoading, setClearAllLoading] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [emailViewItem, setEmailViewItem] = useState(null);
  const [copied, setCopied] = useState(false);

  // Poll for active background analysis job
  useEffect(() => {
    let jobInterval;
    const checkJob = async () => {
      try {
        const res = await getActiveGmailAnalysis();
        if (res?.active && res.job) {
          setActiveGmailJob(res.job);
        } else {
          setActiveGmailJob(null);
        }
      } catch {
        // ignore
      }
    };

    checkJob();
    jobInterval = setInterval(checkJob, 3000);
    return () => clearInterval(jobInterval);
  }, []);

  // Fetch History records
  const fetchHistory = async () => {
    try {
      const channelParam =
        activeChannel !== 'all'
          ? activeChannel
          : typeFilter !== 'all'
          ? typeFilter
          : undefined;

      const response = await getDetectionHistory({
        type: channelParam,
        source: activeChannel === 'email' && sourceFilter !== 'all' ? sourceFilter : undefined,
        result: resultFilter !== 'all' ? resultFilter : undefined,
        date: dateFilter || undefined,
        search: searchQuery || undefined,
        page: currentPage,
        starred: activeTab === 'starred' ? true : false,
      });

      if (response && Array.isArray(response.items)) {
        setHistoryItems(response.items);
        setTotalPages(response.totalPages || 1);
        setTotalCount(response.total || response.items.length);
      } else if (Array.isArray(response)) {
        setHistoryItems(response);
        setTotalCount(response.length);
      }
    } catch {
      // Backend not yet running
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [activeChannel, typeFilter, sourceFilter, resultFilter, dateFilter, searchQuery, currentPage, activeTab]);

  // If a background job is running, refresh history every 3s so new records appear live
  useEffect(() => {
    if (activeGmailJob && ['starting', 'processing'].includes(activeGmailJob.status)) {
      const liveInterval = setInterval(() => {
        fetchHistory();
      }, 3000);
      return () => clearInterval(liveInterval);
    }
  }, [activeGmailJob]);

  const handleTabChange = (tabKey) => {
    const nextParams = new URLSearchParams(searchParams);
    if (tabKey === 'starred') {
      nextParams.set('tab', 'starred');
    } else {
      nextParams.delete('tab');
    }
    setSearchParams(nextParams);
    setCurrentPage(1);
  };

  const handleToggleStar = async (item) => {
    const nextState = !item.is_starred;
    setHistoryItems((prev) =>
      prev.map((it) => (it.id === item.id ? { ...it, is_starred: nextState } : it))
    );
    try {
      await toggleStarDetection(item.id);
      toast.success(nextState ? 'Marked as starred.' : 'Removed from starred.');
    } catch {
      setHistoryItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, is_starred: !nextState } : it))
      );
      toast.error('Failed to update star status.');
    }
  };

  const handleDeletePrompt = (item) => {
    setItemToDelete(item);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setDeleteLoading(true);
    try {
      await deleteDetectionRecord(itemToDelete.id);
      setHistoryItems((prev) => prev.filter((it) => it.id !== itemToDelete.id));
      setItemToDelete(null);
      toast.success('Detection record permanently removed.');
      fetchHistory();
    } catch {
      toast.error('Failed to delete detection record.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleConfirmClearAll = async () => {
    setClearAllLoading(true);
    try {
      await clearAllDetectionHistory();
      setHistoryItems([]);
      setShowClearAllModal(false);
      toast.success('Detection history cleared.');
    } catch {
      toast.error('Failed to clear detection history.');
    } finally {
      setClearAllLoading(false);
    }
  };

  const handleView = (item) => {
    // Email items open the dedicated email content popup
    const isEmail = (item.input_type || item.type || '').toLowerCase() === 'email';
    if (isEmail) {
      setEmailViewItem(item);
    } else {
      setViewItem(item);
      setCopied(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copied payload to clipboard.');
  };

  const getPageTitle = () => {
    if (activeChannel === 'email') return 'Email History';
    if (activeChannel === 'sms') return 'Text History';
    if (activeChannel === 'url') return 'URL History';
    return 'Detection History';
  };

  const getPageSubtitle = () => {
    if (activeChannel === 'email') return 'All your email scan results from manual input and connected Gmail.';
    if (activeChannel === 'sms') return 'SMS and text scam detection audit records.';
    if (activeChannel === 'url') return 'Website link and malicious URL scan records.';
    return 'Complete chronological audit log of all multi-vector security scans.';
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 border-b border-slate-200/60 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/40 px-2.5 py-0.5 rounded-full font-mono">
              <Clock className="w-3.5 h-3.5" />
              {activeChannel === 'email' ? 'Email Scanner Log' : activeChannel === 'sms' ? 'SMS Smishing Log' : 'URL Threat Log'}
            </span>
            <span className="inline-flex items-center text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 rounded-full font-mono">
              {totalCount} Total Records
            </span>
          </div>

          <h1 className="text-xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight mt-1">
            {getPageTitle()}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
            {getPageSubtitle()}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate(`/detect?tab=${activeChannel === 'sms' ? 'message' : activeChannel === 'url' ? 'url' : 'email'}`)}
            className="rounded-xl font-semibold text-xs px-4 py-2 shadow-sm shrink-0 flex items-center gap-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Scan</span>
          </Button>

          {historyItems.length > 0 && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowClearAllModal(true)}
              className="rounded-xl font-semibold text-xs px-3 py-2 shrink-0 flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear History</span>
            </Button>
          )}
        </div>
      </div>

      {/* Live Gmail Background Processing Banner (If Active) */}
      {activeGmailJob && ['starting', 'processing'].includes(activeGmailJob.status) && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-indigo-500/10 border border-emerald-500/30 dark:border-emerald-500/20 shadow-xs flex items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/20">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  Gmail Auto-Analysis in Progress
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 animate-pulse">
                  Live updating...
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Analyzed {activeGmailJob.processed} of {activeGmailJob.total} emails ({activeGmailJob.progress_percent}%). New results appear below automatically.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/detect?tab=email')}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline shrink-0"
          >
            View Live Progress &rarr;
          </button>
        </div>
      )}

      {/* Tabs: All Detections vs Starred Items */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => handleTabChange('all')}
            className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'all'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span>All Logs</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {totalCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('starred')}
            className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'starred'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>Starred Threats</span>
          </button>
        </div>
      </div>

      {/* Filters Card */}
      <HistoryFilters
        channel={activeChannel}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        sourceFilter={sourceFilter}
        setSourceFilter={setSourceFilter}
        resultFilter={resultFilter}
        setResultFilter={setResultFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
      />

      {/* History Table */}
      <HistoryTable
        items={historyItems}
        channel={activeChannel}
        onView={handleView}
        onDelete={handleDeletePrompt}
        onToggleStar={handleToggleStar}
        isStarredView={activeTab === 'starred'}
        onSwitchToScanHistory={() => handleTabChange('all')}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* Delete Record Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(itemToDelete)}
        onClose={() => !deleteLoading && setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
        title="Delete Detection Record"
        message={`Are you sure you want to permanently delete this ${itemToDelete?.type || 'detection'} record from your audit history? This action cannot be undone.`}
        confirmText="Delete Record"
        cancelText="Cancel"
      />

      {/* Clear All Confirmation Modal */}
      <ConfirmModal
        isOpen={showClearAllModal}
        onClose={() => !clearAllLoading && setShowClearAllModal(false)}
        onConfirm={handleConfirmClearAll}
        loading={clearAllLoading}
        title="Clear Detection History"
        message="Are you sure you want to permanently delete ALL detection records? This action cannot be undone."
        confirmText="Clear All Records"
        cancelText="Cancel"
      />

      {/* Email Content Popup (email channel only) */}
      <EmailContentModal
        item={emailViewItem}
        onClose={() => setEmailViewItem(null)}
      />

      {/* View Item Detail Modal */}
      {viewItem &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn"
            onClick={() => setViewItem(null)}
          >
            <div
              className="bg-white dark:bg-[#0b101b] border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base text-slate-950 dark:text-white">
                    Detection Forensic Details
                  </span>
                  <Badge
                    variant={
                      viewItem.is_phishing
                        ? 'phishing'
                        : viewItem.risk_percentage >= 40.0
                        ? 'suspicious'
                        : 'safe'
                    }
                    size="sm"
                  >
                    {viewItem.result || (viewItem.is_phishing ? 'Phishing' : 'Safe')}
                  </Badge>
                </div>
                <button
                  type="button"
                  onClick={() => setViewItem(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Channel</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                    {viewItem.input_type || viewItem.type}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Source</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                    {viewItem.source || 'Manual'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Risk Score</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                    {viewItem.risk_percentage}%
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Engine</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {viewItem.model_used || 'ML'}
                  </span>
                </div>
              </div>

              {viewItem.subject && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">Email Subject</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {viewItem.subject}
                  </span>
                </div>
              )}

              {viewItem.sender && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">Sender</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                    {viewItem.sender}
                  </span>
                </div>
              )}

              {/* Payload Text */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Full Evaluated Payload</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(viewItem.input_text || viewItem.input)}
                    className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 max-h-60 overflow-y-auto whitespace-pre-wrap break-words">
                  {viewItem.input_text || viewItem.input}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button variant="secondary" size="sm" onClick={() => setViewItem(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
