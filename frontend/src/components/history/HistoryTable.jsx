import React from 'react';
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
  ShieldCheck
} from 'lucide-react';

export default function HistoryTable({
  items = [],
  onView,
  onDelete,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}) {
  const hasItems = Array.isArray(items) && items.length > 0;

  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'message':
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'email':
        return <Mail className="w-4 h-4 text-blue-500" />;
      case 'url':
        return <LinkIcon className="w-4 h-4 text-blue-500" />;
      default:
        return <ShieldCheck className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <Card className="p-0 overflow-hidden">
      {hasItems ? (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/70 text-xs font-semibold text-slate-500">
                  <th className="py-3.5 px-4">#</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Input (Preview)</th>
                  <th className="py-3.5 px-4">Result</th>
                  <th className="py-3.5 px-4">Confidence</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item, index) => (
                  <tr
                    key={item.id || index}
                    className="hover:bg-slate-50/60 transition-colors text-xs text-slate-700"
                  >
                    <td className="py-3.5 px-4 font-medium text-slate-400">
                      {index + 1}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="inline-flex items-center gap-2 font-medium text-blue-600 bg-blue-50/60 px-2.5 py-1 rounded-lg">
                        {getTypeIcon(item.type)}
                        <span className="capitalize">{item.type}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 max-w-xs truncate">
                      {item.preview || item.input}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={item.result}>{item.result}</Badge>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-600">
                      {item.confidence ? `${item.confidence}%` : '--'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {item.date_time || item.createdAt}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onView?.(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="View Detection Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete?.(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-1.5 p-4 border-t border-slate-100">
            <button
              disabled={currentPage <= 1}
              onClick={() => onPageChange?.(currentPage - 1)}
              className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="w-8 h-8 rounded-lg bg-blue-600 text-white font-semibold text-xs flex items-center justify-center">
              {currentPage}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange?.(currentPage + 1)}
              className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </>
      ) : (
        <div className="py-14">
          <EmptyState
            icon={Clock}
            title="No detection history yet."
            description="Your past scam and phishing analysis records will be organized and preserved here once you begin scanning."
            actionText="Start New Scan"
            onAction={() => window.location.assign('/detect')}
          />
        </div>
      )}
    </Card>
  );
}
