import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useSearchParams } from 'react-router-dom';
import HistoryFilters from '../components/history/HistoryFilters';
import HistoryTable from '../components/history/HistoryTable';
import ConfirmModal from '../components/common/ConfirmModal';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import {
  getDetectionHistory,
  deleteDetectionRecord,
  clearAllDetectionHistory,
  toggleStarDetection,
} from '../services/api';
import {
  MessageSquare,
  Mail,
  Link as LinkIcon,
  ShieldCheck,
  X,
  Copy,
  Check,
  Calendar,
  Trash2,
  Plus,
  Star,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';

export default function History() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') === 'starred' ? 'starred' : 'all';

  const [historyItems, setHistoryItems] = useState([]);
  const [typeFilter, setTypeFilter] = useState('all');
  const [resultFilter, setResultFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Sync searchQuery if URL param changes
  useEffect(() => {
    const q = searchParams.get('search');
    if (q !== null && q !== searchQuery) {
      setSearchQuery(q);
    }
  }, [searchParams]);

  // Modal states
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showClearAllModal, setShowClearAllModal] = useState(false);
  const [clearAllLoading, setClearAllLoading] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await getDetectionHistory({
          type: typeFilter !== 'all' ? typeFilter : undefined,
          result: resultFilter !== 'all' ? resultFilter : undefined,
          date: dateFilter || undefined,
          search: searchQuery || undefined,
          page: currentPage,
          starred: activeTab === 'starred' ? true : false,
        });

        if (response && Array.isArray(response.items)) {
          setHistoryItems(response.items);
          setTotalPages(response.totalPages || 1);
        } else if (Array.isArray(response)) {
          setHistoryItems(response);
        }
      } catch {
        // Backend not yet running; keep honest empty state []
      }
    };

    fetchHistory();
  }, [typeFilter, resultFilter, dateFilter, searchQuery, currentPage, activeTab]);

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
    if (!item?.id) return;
    try {
      const res = await toggleStarDetection(item.id);
      const isNowStarred = res?.is_starred ?? !item.is_starred;

      // As per user specification:
      // When starred in normal history: removed from normal history and moved to starred history.
      // When unstarred in starred history: removed from starred history and moved back to scan history.
      setHistoryItems((prev) => prev.filter((i) => i.id !== item.id));

      if (isNowStarred) {
        toast.success('Moved to Starred History ⭐', {
          description: 'This scan is now saved in your Starred History tab.',
        });
      } else {
        toast.success('Removed from Starred History', {
          description: 'This scan has been moved back to your general Scan History.',
        });
      }
    } catch (err) {
      console.error('Error toggling star:', err);
      toast.error('Failed to update star status. Please try again.');
    }
  };

  const handleView = (item) => {
    setViewItem(item);
    setCopied(false);
  };

  const handleDeletePrompt = (item) => {
    setItemToDelete(item);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setDeleteLoading(true);
    try {
      await deleteDetectionRecord(itemToDelete.id);
      setHistoryItems((prev) => prev.filter((i) => i.id !== itemToDelete.id));
      toast.success('Detection record removed successfully.');
      setItemToDelete(null);
    } catch {
      toast.error('Unable to delete record. Service may be temporarily offline.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleConfirmClearAll = async () => {
    setClearAllLoading(true);
    try {
      await clearAllDetectionHistory();
      setHistoryItems([]);
      setTotalPages(1);
      toast.success('All detection history cleared successfully.');
      setShowClearAllModal(false);
    } catch {
      toast.error('Unable to clear history. Service may be temporarily offline.');
    } finally {
      setClearAllLoading(false);
    }
  };

  const handleCopyContent = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Analyzed content copied to clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  const getTypeIcon = (type) => {
    const t = type?.toLowerCase();
    switch (t) {
      case 'message':
      case 'sms':
        return <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'email':
        return <Mail className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
      case 'url':
        return <LinkIcon className="w-5 h-5 text-sky-600 dark:text-sky-400" />;
      default:
        return <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
    }
  };

  const getTypeLabel = (type) => {
    const t = type?.toLowerCase();
    if (t === 'sms') return 'SMS';
    if (t === 'message') return 'Message';
    if (t === 'email') return 'Email';
    if (t === 'url') return 'URL';
    return type || 'Scan';
  };

  const formatDateTime = (item) => {
    if (!item) return '--';
    if (item.date_time) return item.date_time;
    if (item.timestamp) return item.timestamp;
    const raw = item.created_at || item.createdAt;
    if (!raw) return '--';
    try {
      const d = new Date(raw);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });
      }
    } catch {
      // fallback
    }
    return raw;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight flex items-center gap-2.5">
              {activeTab === 'starred' ? (
                <>
                  <span className="p-1.5 rounded-xl bg-amber-100/80 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 text-amber-600 dark:text-amber-400">
                    <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
                  </span>
                  <span>Starred History</span>
                </>
              ) : (
                <>
                  <span className="p-1.5 rounded-xl bg-blue-100/80 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 text-blue-600 dark:text-blue-400">
                    <Clock className="w-5 h-5" />
                  </span>
                  <span>Scan History</span>
                </>
              )}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {activeTab === 'starred'
              ? 'Quickly access and inspect all saved high-priority messages and threat assessments.'
              : 'Review, inspect, and manage historical scan assessments across email, SMS, and web channels.'}
          </p>
        </div>

        <div className="self-start sm:self-auto flex items-center gap-2.5">
          {historyItems.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowClearAllModal(true)}
              icon={Trash2}
              className="rounded-xl border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 hover:border-red-300 dark:hover:border-red-800 font-semibold shadow-2xs"
            >
              Delete All
            </Button>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/detect')}
            icon={Plus}
            className="rounded-xl shadow-xs"
          >
            Start New Scan
          </Button>
        </div>
      </div>

      {/* View Switcher Tabs: Scan History vs Starred History */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 w-fit">
        <button
          type="button"
          onClick={() => handleTabChange('all')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab !== 'starred'
              ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Scan History</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('starred')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'starred'
              ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Star
            className={`w-4 h-4 ${
              activeTab === 'starred' ? 'fill-amber-400 text-amber-500' : ''
            }`}
          />
          <span>Starred History</span>
        </button>
      </div>

      {/* Filters Bar */}
      <HistoryFilters
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        resultFilter={resultFilter}
        setResultFilter={setResultFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
      />

      {/* Detections Table or Empty State */}
      <HistoryTable
        items={historyItems}
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
        icon={Trash2}
        variant="danger"
      />

      {/* Inspection Details Modal */}
      {viewItem && (() => {
        const viewType = viewItem.type || viewItem.input_type || '';
        const viewResult =
          viewItem.result ||
          (viewItem.is_phishing
            ? 'Phishing'
            : (viewItem.risk_percentage >= 40
            ? 'Suspicious'
            : 'Safe')) ||
          viewItem.classification ||
          'Unknown';
        const rawConfidence =
          viewItem.confidence != null ? viewItem.confidence : viewItem.risk_percentage;
        const viewConfidence =
          typeof rawConfidence === 'number' && !isNaN(rawConfidence)
            ? Math.max(0, Math.min(100, rawConfidence))
            : null;
        const viewContent =
          viewItem.input ||
          viewItem.input_text ||
          viewItem.preview ||
          'No raw content recorded.';
        const viewDate = formatDateTime(viewItem);

        const isPhish =
          viewItem.is_phishing || String(viewResult).toLowerCase().includes('phish');
        const isSusp = !isPhish && viewConfidence !== null && viewConfidence >= 40.0;

        return createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity animate-fadeIn"
              onClick={() => setViewItem(null)}
              aria-hidden="true"
            />

            <div
              role="dialog"
              aria-modal="true"
              className="relative z-10 w-full max-w-lg bg-white dark:bg-[#11192e] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-7 text-left transform transition-all animate-scaleUp overflow-hidden space-y-5"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/60 flex items-center justify-center shrink-0 shadow-2xs">
                    {getTypeIcon(viewType)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white capitalize tracking-tight">
                      {getTypeLabel(viewType)} Inspection Details
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{viewDate}</span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setViewItem(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  aria-label="Close dialog"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Verdict + Confidence Banner */}
              <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Verdict Classification
                    </span>
                    <div>
                      <Badge status={viewResult} size="md">
                        {viewResult}
                      </Badge>
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Risk Score
                    </span>
                    <p className="text-lg font-extrabold font-mono text-slate-900 dark:text-white">
                      {viewConfidence !== null ? `${viewConfidence.toFixed(1)}%` : '--'}
                    </p>
                  </div>
                </div>

                {/* Visual Risk Progress Bar */}
                {viewConfidence !== null && (
                  <div className="space-y-1 pt-1 border-t border-slate-200/50 dark:border-slate-800/60">
                    <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div
                        style={{ width: `${viewConfidence}%` }}
                        className={`h-full rounded-full transition-all duration-300 ${
                          isPhish
                            ? 'bg-red-500'
                            : isSusp
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Content Analyzed */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Analyzed Content Payload
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyContent(viewContent)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline cursor-pointer"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-3.5 bg-slate-50 dark:bg-[#0b1120] border border-slate-200/80 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-800 dark:text-slate-200 max-h-48 overflow-y-auto break-all leading-relaxed select-text">
                  {viewContent}
                </div>
              </div>

              {/* Close footer */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewItem(null)}
                  className="px-5 py-2 text-xs font-semibold rounded-xl"
                >
                  Close Inspection
                </Button>
              </div>
            </div>
          </div>,
          document.body
        );
      })()}

      {/* Delete Single Item Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(itemToDelete)}
        onClose={() => !deleteLoading && setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
        title="Delete Scan Record"
        message="Are you sure you want to delete this scan record from your detection history? This action cannot be undone."
        confirmText="Delete Record"
        cancelText="Cancel"
        icon={Trash2}
      />

      {/* Delete All History Confirmation Modal */}
      <ConfirmModal
        isOpen={showClearAllModal}
        onClose={() => !clearAllLoading && setShowClearAllModal(false)}
        onConfirm={handleConfirmClearAll}
        loading={clearAllLoading}
        title="Delete All Detection History?"
        message="Are you sure you want to delete all historical detection scans? This action cannot be undone and will permanently remove all your past threat assessments."
        confirmText="Delete All"
        cancelText="Cancel"
        icon={Trash2}
      />
    </div>
  );
}

