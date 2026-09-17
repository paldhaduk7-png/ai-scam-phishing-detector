import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import Badge from '../common/Badge';
import EmptyState from '../common/EmptyState';
import {
  MessageSquare,
  Mail,
  Link as LinkIcon,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Clock,
  ShieldCheck,
  Star,
} from 'lucide-react';

export default function HistoryTable({
  items = [],
  onView,
  onDelete,
  onToggleStar,
  isStarredView = false,
  onSwitchToScanHistory,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}) {
  const navigate = useNavigate();
  const hasItems = Array.isArray(items) && items.length > 0;

  const getTypeIcon = (type) => {
    const t = type?.toLowerCase();
    switch (t) {
      case 'message':
      case 'sms':
        return <MessageSquare className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />;
      case 'email':
        return <Mail className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />;
      case 'url':
        return <LinkIcon className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />;
      default:
        return <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />;
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
    <Card className="p-0 overflow-hidden">
      {hasItems ? (
        <>
          {/* Desktop & Tablet Table (sm and up) */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4">Payload Preview</th>
                  <th className="py-3 px-4">Verdict</th>
                  <th className="py-3 px-4">Risk Severity</th>
                  <th className="py-3 px-4">Logged At</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {items.map((item, index) => {
                  const type = item.type || item.input_type || '';
                  const preview = item.preview || item.input || item.input_text || '';
                  const result =
                    item.result ||
                    (item.is_phishing
                      ? 'Phishing'
                      : (item.risk_percentage >= 40
                      ? 'Suspicious'
                      : 'Safe')) ||
                    item.classification ||
                    'Unknown';
                  const confidence =
                    item.confidence != null ? item.confidence : item.risk_percentage;
                  const numRisk =
                    typeof confidence === 'number' && !isNaN(confidence)
                      ? Math.max(0, Math.min(100, confidence))
                      : null;

                  const isPhish =
                    item.is_phishing || String(result).toLowerCase().includes('phish');
                  const isSusp = !isPhish && numRisk !== null && numRisk >= 40.0;

                  return (
                    <tr
                      key={item.id || index}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors text-xs text-slate-700 dark:text-slate-300"
                    >
                      <td className="py-3.5 px-4 font-medium text-slate-400 dark:text-slate-500 text-center font-mono">
                        {(currentPage - 1) * 10 + (index + 1)}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 font-semibold text-slate-700 dark:text-slate-300">
                          {getTypeIcon(type)}
                          <span>{getTypeLabel(type)}</span>
                        </div>
                      </td>
                      <td
                        className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300 max-w-xs truncate cursor-help"
                        title={typeof preview === 'string' ? preview : ''}
                      >
                        {preview || 'Payload record'}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge status={result}>{result}</Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        {numRisk !== null ? (
                          <div className="flex items-center gap-2 max-w-[120px]">
                            <div className="w-16 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                              <div
                                style={{ width: `${numRisk}%` }}
                                className={`h-full rounded-full ${
                                  isPhish
                                    ? 'bg-red-500'
                                    : isSusp
                                    ? 'bg-amber-500'
                                    : 'bg-emerald-500'
                                }`}
                              />
                            </div>
                            <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                              {numRisk.toFixed(1)}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-mono">--</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {formatDateTime(item)}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onToggleStar?.(item)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                              item.is_starred
                                ? 'text-amber-700 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-700/60 shadow-sm'
                                : 'text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/60'
                            }`}
                            title={item.is_starred ? 'Remove from Starred History' : 'Move to Starred History'}
                          >
                            <Star
                              className={`w-3.5 h-3.5 ${
                                item.is_starred
                                  ? 'fill-amber-400 text-amber-500'
                                  : 'text-slate-400 group-hover:text-amber-500'
                              }`}
                            />
                            <span>{item.is_starred ? 'Starred' : 'Star'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onView?.(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/60 transition-colors cursor-pointer"
                            title="Inspect scan details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Inspect</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete?.(item)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/60 transition-colors cursor-pointer"
                            title="Delete this record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Stacked Card View (screens < 640px) */}
          <div className="sm:hidden p-4 space-y-3">
            {items.map((item, index) => {
              const type = item.type || item.input_type || '';
              const preview = item.preview || item.input || item.input_text || '';
              const result =
                item.result ||
                (item.is_phishing
                  ? 'Phishing'
                  : (item.risk_percentage >= 40
                  ? 'Suspicious'
                  : 'Safe')) ||
                item.classification ||
                'Unknown';
              const confidence =
                item.confidence != null ? item.confidence : item.risk_percentage;
              const numRisk =
                typeof confidence === 'number' && !isNaN(confidence)
                  ? Math.max(0, Math.min(100, confidence))
                  : null;

              return (
                <div
                  key={item.id || index}
                  className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 space-y-2.5 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                        {getTypeIcon(type)}
                      </span>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 capitalize">
                        {getTypeLabel(type)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge status={result} size="sm">
                        {result}
                      </Badge>
                      {numRisk !== null && (
                        <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                          {numRisk.toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>

                  <p
                    className="text-xs font-mono text-slate-700 dark:text-slate-300 truncate"
                    title={typeof preview === 'string' ? preview : ''}
                  >
                    {preview || 'Payload record'}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
                    <span>{formatDateTime(item)}</span>
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onToggleStar?.(item)}
                        className={`font-semibold inline-flex items-center gap-1 py-1 ${
                          item.is_starred
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-slate-500 dark:text-slate-400 hover:text-amber-600'
                        }`}
                        title={item.is_starred ? 'Remove from Starred History' : 'Move to Starred History'}
                      >
                        <Star
                          className={`w-3.5 h-3.5 ${
                            item.is_starred ? 'fill-amber-400 text-amber-500' : ''
                          }`}
                        />
                        <span>{item.is_starred ? 'Starred' : 'Star'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onView?.(item)}
                        className="text-blue-600 dark:text-blue-400 font-semibold inline-flex items-center gap-1 py-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete?.(item)}
                        className="text-red-600 dark:text-red-400 font-semibold inline-flex items-center gap-1 py-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Page <span className="font-bold text-slate-900 dark:text-white">{currentPage}</span> of{' '}
                <span className="font-bold text-slate-900 dark:text-white">{totalPages}</span>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => onPageChange?.(currentPage - 1)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => onPageChange?.(currentPage + 1)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="py-14">
          {isStarredView ? (
            <EmptyState
              icon={Star}
              title="No Starred Scans Yet"
              description="Click the Star button on any scan in your Scan History to save it here for quick access."
              actionText="Browse Scan History"
              onAction={() => {
                if (onSwitchToScanHistory) onSwitchToScanHistory();
                else navigate('/history');
              }}
            />
          ) : (
            <EmptyState
              icon={Clock}
              title="No Detection Records Found"
              description="No past scan records matched your criteria. Analyze an email, SMS, or URL to record audit history."
              actionText="Start New Threat Scan"
              onAction={() => navigate('/detect')}
            />
          )}
        </div>
      )}
    </Card>
  );
}
