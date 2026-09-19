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
  channel = 'all',
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

  const renderSourceBadge = (item) => {
    const isGmail = item.source === 'gmail';
    return (
      <span
        className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
          isGmail
            ? 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-200/80 dark:border-red-900/40'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700'
        }`}
      >
        {isGmail ? (
          <img
            src="https://www.gstatic.com/images/branding/product/1x/gmail_2020q4_48dp.png"
            className="w-3 h-3 object-contain"
            alt=""
          />
        ) : (
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
        )}
        <span>{isGmail ? 'Gmail' : 'Manual'}</span>
      </span>
    );
  };

  return (
    <Card className="p-0 overflow-hidden border border-slate-200/90 dark:border-slate-800">
      {hasItems ? (
        <>
          {/* Desktop & Tablet Table — always shown, scrolls horizontally */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  {channel === 'email' && <th className="py-3 px-4 w-24">Source</th>}
                  {channel === 'all' && <th className="py-3 px-4 w-28">Channel</th>}
                  <th className="py-3 px-4">
                    {channel === 'email'
                      ? 'Subject / Preview'
                      : channel === 'url'
                      ? 'URL'
                      : 'Message Preview'}
                  </th>
                  {channel === 'email' && <th className="py-3 px-4 w-40">Sender</th>}
                  <th className="py-3 px-4 w-28">Verdict</th>
                  <th className="py-3 px-4 w-32">Risk Severity</th>
                  <th className="py-3 px-4 w-36">Date</th>
                  <th className="py-3 px-4 text-right w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {items.map((item, index) => {
                  const riskVal = item.risk_percentage ?? item.riskScore ?? item.confidence ?? 0;
                  const displayIdx = (currentPage - 1) * 10 + (index + 1);

                  return (
                    <tr
                      key={item.id || index}
                      className={`transition-colors ${
                        channel === 'email'
                          ? 'hover:bg-indigo-50/60 dark:hover:bg-indigo-950/20 cursor-pointer'
                          : 'hover:bg-slate-50/80 dark:hover:bg-slate-900/40'
                      }`}
                      onClick={channel === 'email' ? () => onView?.(item) : undefined}
                    >
                      {/* Row Index */}
                      <td className="py-3 px-4 text-center font-mono text-xs text-slate-400 dark:text-slate-500">
                        {displayIdx}
                      </td>

                      {/* Source Badge for Email Channel */}
                      {channel === 'email' && (
                        <td className="py-3 px-4">{renderSourceBadge(item)}</td>
                      )}

                      {/* Channel Badge for All Channels */}
                      {channel === 'all' && (
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            {getTypeIcon(item.input_type || item.type)}
                            <span className="text-xs font-semibold capitalize text-slate-700 dark:text-slate-300">
                              {item.input_type || item.type || 'Scan'}
                            </span>
                          </div>
                        </td>
                      )}

                      {/* Payload Preview / Subject */}
                      <td className="py-3 px-4">
                        <div className="max-w-md">
                          {item.subject && (
                            <span className="block font-semibold text-xs text-slate-900 dark:text-white truncate">
                              {item.subject}
                            </span>
                          )}
                          <span
                            className={`block truncate ${
                              item.subject
                                ? 'text-[11px] text-slate-500 dark:text-slate-400 mt-0.5'
                                : 'text-xs text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            {item.preview || item.input_text || item.input || '--'}
                          </span>
                        </div>
                      </td>

                      {/* Sender for Email Channel */}
                      {channel === 'email' && (
                        <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-300 truncate max-w-[160px]">
                          {item.sender || 'Unknown'}
                        </td>
                      )}

                      {/* Verdict Badge */}
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            item.is_phishing
                              ? 'phishing'
                              : item.risk_percentage >= 40.0
                              ? 'suspicious'
                              : 'safe'
                          }
                          size="sm"
                        >
                          {item.result || (item.is_phishing ? 'Phishing' : 'Safe')}
                        </Badge>
                      </td>

                      {/* Risk Severity Bar */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                riskVal >= 70
                                  ? 'bg-rose-500'
                                  : riskVal >= 40
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(100, Math.max(5, riskVal))}%` }}
                            />
                          </div>
                          <span className="font-mono text-xs font-semibold text-slate-600 dark:text-slate-400">
                            {riskVal}%
                          </span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {formatDateTime(item)}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onToggleStar?.(item); }}
                            aria-label={item.is_starred ? 'Unstar record' : 'Star record'}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              item.is_starred
                                ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/60'
                                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            <Star
                              className="w-3.5 h-3.5"
                              fill={item.is_starred ? 'currentColor' : 'none'}
                            />
                          </button>
                          {/* Eye button — only for non-email rows; email rows open modal on row click */}
                          {channel !== 'email' && (
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); onView?.(item); }}
                              aria-label="View details"
                              className="p-1.5 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onDelete?.(item); }}
                            aria-label="Delete record"
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
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

          {/* Mobile Card List (< sm) */}
          <div className="block sm:hidden divide-y divide-slate-100 dark:divide-slate-800/80">
            {items.map((item, index) => {
              const riskVal = item.risk_percentage ?? item.confidence ?? 0;
              const displayIdx = (currentPage - 1) * 10 + (index + 1);

              return (
                <div
                  key={item.id || index}
                  className={`p-3.5 space-y-2.5 ${
                    channel === 'email'
                      ? 'cursor-pointer hover:bg-indigo-50/40 dark:hover:bg-indigo-950/10 active:bg-indigo-50/60 dark:active:bg-indigo-950/20 transition-colors'
                      : ''
                  }`}
                  onClick={channel === 'email' ? () => onView?.(item) : undefined}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-slate-400 font-semibold">#{displayIdx}</span>
                      {channel === 'email' && renderSourceBadge(item)}
                      {channel === 'all' && (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100/90 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {getTypeIcon(item.input_type || item.type)}
                          <span className="capitalize">{item.input_type || item.type}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge
                        variant={
                          item.is_phishing
                            ? 'phishing'
                            : item.risk_percentage >= 40.0
                            ? 'suspicious'
                            : 'safe'
                        }
                        size="sm"
                      >
                        {item.result || (item.is_phishing ? 'Phishing' : 'Safe')}
                      </Badge>
                      {riskVal > 0 && (
                        <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400">
                          {typeof riskVal === 'number' ? riskVal.toFixed(1) : riskVal}%
                        </span>
                      )}
                    </div>
                  </div>

                  {item.subject && (
                    <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                      {item.subject}
                    </div>
                  )}

                  <p className="text-xs text-slate-600 dark:text-slate-300 font-mono line-clamp-2 bg-slate-50/60 dark:bg-slate-900/40 p-2 rounded-lg border border-slate-100 dark:border-slate-800/80">
                    {item.preview || item.input_text || '--'}
                  </p>

                  <div className="flex items-center justify-between text-[10.5px] text-slate-400 pt-1.5 border-t border-slate-100 dark:border-slate-800">
                    <span>{formatDateTime(item)}</span>
                    {/* Ergonomic mobile touch buttons (minimum 36px touch zone) */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onToggleStar?.(item); }}
                        aria-label="Toggle star"
                        className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-500 border border-amber-200/50 dark:border-amber-800/40 active:scale-90 transition-transform cursor-pointer"
                      >
                        <Star className="w-3.5 h-3.5" fill={item.is_starred ? 'currentColor' : 'none'} />
                      </button>
                      {/* Eye button only for non-email; email tap whole card */}
                      {channel !== 'email' && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); onView?.(item); }}
                          aria-label="View details"
                          className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/40 active:scale-90 transition-transform cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onDelete?.(item); }}
                        aria-label="Delete item"
                        className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/50 dark:border-rose-800/40 active:scale-90 transition-transform cursor-pointer"
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
            <div className="px-4 py-3 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onPageChange?.(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onPageChange?.(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="py-12">
          <EmptyState
            title={`No ${channel === 'email' ? 'Email' : channel === 'sms' ? 'Text' : channel === 'url' ? 'URL' : ''} Detections Yet`}
            description={`Scan ${channel === 'email' ? 'emails or connect Gmail' : channel === 'sms' ? 'messages' : 'URLs'} in the Detect Threats scanner to review past results here.`}
            actionLabel="Detect Threats"
            onAction={() => navigate(`/detect?tab=${channel === 'sms' ? 'message' : channel}`)}
          />
        </div>
      )}
    </Card>
  );
}
