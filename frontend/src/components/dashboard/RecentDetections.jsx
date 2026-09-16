import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import Badge from '../common/Badge';
import EmptyState from '../common/EmptyState';
import { ShieldCheck, MessageSquare, Mail, Link as LinkIcon, FileSearch } from 'lucide-react';

export default function RecentDetections({ detections = [] }) {
  const navigate = useNavigate();
  const hasRecords = Array.isArray(detections) && detections.length > 0;

  const getTypeIcon = (type) => {
    const t = type?.toLowerCase();
    switch (t) {
      case 'message':
      case 'sms':
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'email':
        return <Mail className="w-4 h-4 text-indigo-500" />;
      case 'url':
        return <LinkIcon className="w-4 h-4 text-sky-500" />;
      default:
        return <ShieldCheck className="w-4 h-4 text-blue-500" />;
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
    <Card className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Recent Detections</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Latest scans analyzed by ScamShield</p>
        </div>
        <Link
          to="/history"
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline"
        >
          View All
        </Link>
      </div>

      {/* Table / Empty State */}
      <div className="flex-1 mt-2">
        {hasRecords ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-400 dark:text-slate-500">
                  <th className="py-3 px-2">Type</th>
                  <th className="py-3 px-2">Input (Preview)</th>
                  <th className="py-3 px-2">Result</th>
                  <th className="py-3 px-2">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {detections.map((item, index) => {
                  const type = item.type || item.input_type || '';
                  const preview = item.preview || item.input || item.input_text || '';
                  const result = item.result || (item.is_phishing ? 'Phishing' : (item.risk_percentage >= 40 ? 'Suspicious' : 'Safe')) || item.classification || 'Unknown';

                  return (
                    <tr key={item.id || index} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-2 flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300">
                        {getTypeIcon(type)}
                        <span className="capitalize">{getTypeLabel(type)}</span>
                      </td>
                      <td className="py-3 px-2 text-slate-600 dark:text-slate-300 max-w-[200px] truncate" title={typeof preview === 'string' ? preview : ''}>
                        {preview}
                      </td>
                      <td className="py-3 px-2">
                        <Badge status={result}>{result}</Badge>
                      </td>
                      <td className="py-3 px-2 text-xs text-slate-400 dark:text-slate-500">
                        {formatDateTime(item)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        ) : (
          <div className="py-6">
            <EmptyState
              icon={FileSearch}
              title="No recent detections"
              description="Your scanned messages, emails, and links will show up here once analyzed."
              actionText="Scan Content Now"
              onAction={() => navigate('/detect')}
              compact
            />
          </div>
        )}
      </div>
    </Card>
  );
}
