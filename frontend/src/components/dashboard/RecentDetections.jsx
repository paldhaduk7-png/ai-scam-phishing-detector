import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import Badge from '../common/Badge';
import EmptyState from '../common/EmptyState';
import {
  ShieldCheck,
  MessageSquare,
  Mail,
  Link as LinkIcon,
  FileSearch,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

export default function RecentDetections({ detections = [] }) {
  const navigate = useNavigate();
  const hasRecords = Array.isArray(detections) && detections.length > 0;

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
    if (item.date_time) return item.date_time;
    if (item.timestamp) return item.timestamp;
    const raw = item.created_at || item.createdAt || item.dateTime;
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
    <Card className="flex flex-col p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
            Recent Detections
          </h2>
          {hasRecords && (
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full font-mono">
              {detections.length} {detections.length === 1 ? 'record' : 'records'}
            </span>
          )}
        </div>
        <Link
          to="/history"
          className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors group"
        >
          <span>View All History</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 mt-2.5 sm:mt-3">
        {hasRecords ? (
          <div>
            {/* Desktop / Tablet Table View (hidden on very small screens) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Analyzed Payload</th>
                    <th className="py-2.5 px-3">Threat Result</th>
                    <th className="py-2.5 px-3 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {detections.map((item, index) => {
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
                    const risk =
                      typeof item.risk_percentage === 'number'
                        ? item.risk_percentage.toFixed(1)
                        : null;

                    return (
                      <tr
                        key={item.id || index}
                        onClick={() => navigate('/history')}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
                      >
                        <td className="py-3 px-3">
                          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50 text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {getTypeIcon(type)}
                            <span>{getTypeLabel(type)}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-600 dark:text-slate-300 max-w-[220px] md:max-w-[280px]">
                          <p
                            className="text-xs font-mono truncate"
                            title={typeof preview === 'string' ? preview : ''}
                          >
                            {preview || 'Content payload analyzed'}
                          </p>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <Badge status={result} size="sm">
                              {result}
                            </Badge>
                            {risk !== null && (
                              <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400">
                                {risk}%
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right text-xs font-medium text-slate-400 dark:text-slate-500 whitespace-nowrap">
                          {formatDateTime(item)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Card View (displayed only on small screens < 640px) */}
            <div className="sm:hidden space-y-2.5">
              {detections.map((item, index) => {
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
                const risk =
                  typeof item.risk_percentage === 'number'
                    ? item.risk_percentage.toFixed(1)
                    : null;
                const riskNum = typeof item.risk_percentage === 'number' ? item.risk_percentage : 0;

                return (
                  <div
                    key={item.id || index}
                    onClick={() => navigate('/history')}
                    className="p-3 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 space-y-2 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 active:scale-[0.98] transition-all shadow-2xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100/90 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {getTypeIcon(type)}
                        <span>{getTypeLabel(type)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Badge status={result} size="sm">
                          {result}
                        </Badge>
                        {risk !== null && (
                          <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400">
                            {risk}%
                          </span>
                        )}
                      </div>
                    </div>

                    <p
                      className="text-xs text-slate-700 dark:text-slate-300 font-mono truncate"
                      title={typeof preview === 'string' ? preview : ''}
                    >
                      {preview || 'Content payload analyzed'}
                    </p>

                    {/* Mini risk visual bar */}
                    {risk !== null && (
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${Math.min(riskNum, 100)}%` }}
                          className={`h-full rounded-full ${
                            riskNum >= 70
                              ? 'bg-red-500'
                              : riskNum >= 40
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[10.5px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                      <span>{formatDateTime(item)}</span>
                      <span className="inline-flex items-center gap-0.5 text-blue-600 dark:text-blue-400 font-semibold">
                        Details <ExternalLink className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="py-6">
            <EmptyState
              icon={FileSearch}
              title="No Recent Detections"
              description="Your analyzed emails, messages, and web URLs will appear here once scans are processed."
              actionText="Run New Threat Scan"
              onAction={() => navigate('/detect')}
              compact
            />
          </div>
        )}
      </div>
    </Card>
  );
}
