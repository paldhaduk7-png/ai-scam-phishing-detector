import React, { useState, useEffect } from 'react';
import HistoryFilters from '../components/history/HistoryFilters';
import HistoryTable from '../components/history/HistoryTable';
import ConfirmModal from '../components/common/ConfirmModal';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { getDetectionHistory, deleteDetectionRecord } from '../services/api';
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
} from 'lucide-react';
import { toast } from 'sonner';

export default function History() {
  const [historyItems, setHistoryItems] = useState([]);
  const [typeFilter, setTypeFilter] = useState('all');
  const [resultFilter, setResultFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal states
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
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
  }, [typeFilter, resultFilter, dateFilter, searchQuery, currentPage]);

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
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case 'email':
        return <Mail className="w-5 h-5 text-indigo-500" />;
      case 'url':
        return <LinkIcon className="w-5 h-5 text-sky-500" />;
      default:
        return <ShieldCheck className="w-5 h-5 text-blue-500" />;
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
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          Detection History
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          View and manage your past scam and phishing detections.
        </p>
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
        message={`Are you sure you want to delete this ${itemToDelete?.type || 'detection'} record? This action cannot be undone.`}
        confirmText="Delete Record"
        cancelText="Cancel"
        icon={Trash2}
        variant="danger"
      />

      {/* Inspection Details Modal */}
      {viewItem && (() => {
        const viewType = viewItem.type || viewItem.input_type || '';
        const viewResult = viewItem.result || (viewItem.is_phishing ? 'Phishing' : (viewItem.risk_percentage >= 40 ? 'Suspicious' : 'Safe')) || viewItem.classification || 'Unknown';
        const viewConfidence = viewItem.confidence != null ? viewItem.confidence : viewItem.risk_percentage;
        const viewContent = viewItem.input || viewItem.input_text || viewItem.preview || 'No raw content recorded.';
        const viewDate = formatDateTime(viewItem);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-fadeIn"
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
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/60 flex items-center justify-center">
                    {getTypeIcon(viewType)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white capitalize">
                      {getTypeLabel(viewType)} Detection Details
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{viewDate}</span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setViewItem(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Verdict + Confidence */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-[#0b1120] border border-slate-200/80 dark:border-slate-800">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Classification
                  </span>
                  <div>
                    <Badge status={viewResult} size="md">
                      {viewResult}
                    </Badge>
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Risk / Confidence
                  </span>
                  <p className="text-base font-extrabold text-slate-900 dark:text-white">
                    {viewConfidence != null ? `${viewConfidence}%` : '--'}
                  </p>
                </div>
              </div>

              {/* Content Analyzed */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Content Analyzed
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyContent(viewContent)}
                    className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-[#0b1120] border border-slate-200/80 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-800 dark:text-slate-200 max-h-48 overflow-y-auto break-all leading-relaxed select-text">
                  {viewContent}
                </div>
              </div>

              {/* Close footer */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setViewItem(null)}
                  className="px-5 py-2 text-xs font-semibold"
                >
                  Close Details
                </Button>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
}

