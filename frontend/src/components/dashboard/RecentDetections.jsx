import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../common/Card';
import Badge from '../common/Badge';
import EmptyState from '../common/EmptyState';
import { ShieldCheck, MessageSquare, Mail, Link as LinkIcon, FileSearch } from 'lucide-react';

export default function RecentDetections({ detections = [] }) {
  const hasRecords = Array.isArray(detections) && detections.length > 0;

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
    <Card className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900">Recent Detections</h2>
          <p className="text-xs text-slate-500 mt-0.5">Latest scans analyzed by ScamShield</p>
        </div>
        <Link
          to="/history"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
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
                <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400">
                  <th className="py-3 px-2">Type</th>
                  <th className="py-3 px-2">Input (Preview)</th>
                  <th className="py-3 px-2">Result</th>
                  <th className="py-3 px-2">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {detections.map((item, index) => (
                  <tr key={item.id || index} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-2 flex items-center gap-2 font-medium text-slate-700">
                      {getTypeIcon(item.type)}
                      <span className="capitalize">{item.type}</span>
                    </td>
                    <td className="py-3 px-2 text-slate-600 max-w-[200px] truncate">
                      {item.preview || item.input}
                    </td>
                    <td className="py-3 px-2">
                      <Badge status={item.result}>{item.result}</Badge>
                    </td>
                    <td className="py-3 px-2 text-xs text-slate-400">
                      {item.timestamp || item.dateTime}
                    </td>
                  </tr>
                ))}
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
              onAction={() => {}}
              compact
            />
          </div>
        )}
      </div>
    </Card>
  );
}
