import React from 'react';
import Card from '../common/Card';
import EmptyState from '../common/EmptyState';
import { LineChart as ChartIcon } from 'lucide-react';

export default function DetectionChart({ data = null }) {
  const hasData = Array.isArray(data) && data.length > 0;

  return (
    <Card className="flex flex-col h-full">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900">Detection Overview</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Total scans and results over the last 7 days
          </p>
        </div>

        {/* Legend matching screenshot */}
        <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Safe</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Suspicious</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span>Phishing</span>
          </div>
        </div>
      </div>

      {/* Chart Body */}
      <div className="flex-1 flex items-center justify-center min-h-[220px] pt-4">
        {hasData ? (
          // Future data render area
          <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
            Real chart data available
          </div>
        ) : (
          <EmptyState
            icon={ChartIcon}
            title="No detection activity yet"
            description="Scan trends and threat statistics over time will appear here once analysis data is logged."
            compact
          />
        )}
      </div>
    </Card>
  );
}
