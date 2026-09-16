import React from 'react';
import Card from '../common/Card';
import EmptyState from '../common/EmptyState';
import { LineChart as ChartIcon } from 'lucide-react';

function aggregate7Days(items = []) {
  const days = [];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    days.push({
      date: dateStr,
      day: dayName,
      safe: 0,
      suspicious: 0,
      phishing: 0,
      total: 0,
    });
  }

  const daysMap = new Map(days.map((item) => [item.date, item]));

  items.forEach((item) => {
    const raw = item.created_at || item.createdAt || item.date_time || item.timestamp;
    if (!raw) return;
    try {
      const d = new Date(raw);
      if (!isNaN(d.getTime())) {
        const dateStr = d.toISOString().split('T')[0];
        const entry = daysMap.get(dateStr);
        if (entry) {
          entry.total += 1;
          const isPhish =
            item.is_phishing === true ||
            String(item.result || item.classification).toLowerCase().includes('phish');
          const risk =
            item.confidence != null
              ? item.confidence
              : item.risk_percentage != null
              ? item.risk_percentage
              : 0;
          if (isPhish) {
            entry.phishing += 1;
          } else if (risk < 40) {
            entry.safe += 1;
          } else {
            entry.suspicious += 1;
          }
        }
      }
    } catch {
      // ignore parsing error
    }
  });

  return days;
}

export default function DetectionChart({ data = null }) {
  let points = [];
  if (Array.isArray(data) && data.length > 0) {
    if (data[0] && typeof data[0].day === 'string' && ('safe' in data[0] || 'total' in data[0])) {
      points = data;
    } else {
      points = aggregate7Days(data);
    }
  }

  const totalScans = points.reduce((acc, d) => acc + (d.total || 0), 0);
  const hasActivity = totalScans > 0;

  const maxTotal = Math.max(...points.map((d) => d.total || 0), 1);

  return (
    <Card className="flex flex-col">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Detection Overview</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Total scans and results over the last 7 days
          </p>
        </div>

        {/* Legend matching screenshot */}
        <div className="flex items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-300">
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
        {hasActivity ? (
          <div className="w-full flex flex-col justify-between h-[200px] pt-2">
            <div className="flex-1 flex items-end justify-between gap-2 sm:gap-4 px-2 pb-2">
              {points.map((pt, idx) => {
                const total = pt.total || 0;
                const safe = pt.safe || 0;
                const susp = pt.suspicious || 0;
                const phish = pt.phishing || 0;

                const heightPercent = total > 0 ? Math.max((total / maxTotal) * 100, 15) : 4;
                const safePct = total > 0 ? (safe / total) * 100 : 0;
                const suspPct = total > 0 ? (susp / total) * 100 : 0;
                const phishPct = total > 0 ? (phish / total) * 100 : 0;

                return (
                  <div
                    key={pt.date || idx}
                    className="flex-1 flex flex-col items-center gap-2 group relative"
                  >
                    {/* Tooltip on hover */}
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 bg-slate-900 text-white text-[11px] px-2.5 py-1 rounded-lg shadow-lg whitespace-nowrap">
                      <p className="font-bold">{pt.day} ({pt.date})</p>
                      <p className="text-[10px] text-slate-300">
                        {total} scans: {safe} safe, {susp} susp, {phish} phish
                      </p>
                    </div>

                    {/* Total label above bar */}
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 h-4 flex items-center">
                      {total > 0 ? total : ''}
                    </span>

                    {/* Stacked Bar */}
                    <div className="w-full max-w-[36px] bg-slate-100 dark:bg-slate-800 rounded-t-lg overflow-hidden flex flex-col justify-end h-[120px]">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full flex flex-col justify-end transition-all duration-500 rounded-t-lg overflow-hidden"
                      >
                        {phish > 0 && (
                          <div
                            style={{ height: `${phishPct}%` }}
                            className="w-full bg-red-500 transition-all"
                            title={`Phishing: ${phish}`}
                          />
                        )}
                        {susp > 0 && (
                          <div
                            style={{ height: `${suspPct}%` }}
                            className="w-full bg-amber-500 transition-all"
                            title={`Suspicious: ${susp}`}
                          />
                        )}
                        {safe > 0 && (
                          <div
                            style={{ height: `${safePct}%` }}
                            className="w-full bg-emerald-500 transition-all"
                            title={`Safe: ${safe}`}
                          />
                        )}
                      </div>
                    </div>

                    {/* Day label */}
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {pt.day}
                    </span>
                  </div>
                );
              })}
            </div>
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

