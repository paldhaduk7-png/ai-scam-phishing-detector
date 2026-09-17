import React from 'react';
import Card from '../common/Card';
import EmptyState from '../common/EmptyState';
import { BarChart3 } from 'lucide-react';

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
  const totalSafe = points.reduce((acc, d) => acc + (d.safe || 0), 0);
  const totalSusp = points.reduce((acc, d) => acc + (d.suspicious || 0), 0);
  const totalPhish = points.reduce((acc, d) => acc + (d.phishing || 0), 0);
  const hasActivity = totalScans > 0;

  const maxTotal = Math.max(...points.map((d) => d.total || 0), 1);

  return (
    <Card className="flex flex-col p-6">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Detection Activity Overview
            </h2>
            {hasActivity && (
              <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/40 px-2 py-0.5 rounded-full font-mono">
                {totalScans} Total
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real 7-day scan breakdown across Safe, Suspicious, and Phishing categories
          </p>
        </div>

        {/* Legend with counts */}
        <div className="flex items-center gap-3.5 text-xs font-medium text-slate-600 dark:text-slate-300 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-2xs" />
            <span>Safe</span>
            {hasActivity && <span className="text-[11px] text-slate-400 font-mono">({totalSafe})</span>}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-2xs" />
            <span>Suspicious</span>
            {hasActivity && <span className="text-[11px] text-slate-400 font-mono">({totalSusp})</span>}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-2xs" />
            <span>Phishing</span>
            {hasActivity && <span className="text-[11px] text-slate-400 font-mono">({totalPhish})</span>}
          </div>
        </div>
      </div>

      {/* Chart Body */}
      <div className="flex-1 flex items-center justify-center min-h-[240px] pt-6 overflow-x-auto">
        {hasActivity ? (
          <div className="w-full flex flex-col justify-between h-[230px] min-w-[260px]">
            <div className="flex-1 flex items-end justify-between gap-1 sm:gap-4 px-1 sm:px-2 pb-2">
              {points.map((pt, idx) => {
                const total = pt.total || 0;
                const safe = pt.safe || 0;
                const susp = pt.suspicious || 0;
                const phish = pt.phishing || 0;

                // Ensure active columns have a perceptible minimum height for stacked segments
                const heightPercent = total > 0 ? Math.max((total / maxTotal) * 100, 16) : 4;
                const safePct = total > 0 ? (safe / total) * 100 : 0;
                const suspPct = total > 0 ? (susp / total) * 100 : 0;
                const phishPct = total > 0 ? (phish / total) * 100 : 0;

                return (
                  <div
                    key={pt.date || idx}
                    className="flex-1 flex flex-col items-center gap-2 group relative"
                  >
                    {/* Tooltip on hover */}
                    <div className="absolute -top-14 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-150 pointer-events-none z-30 bg-slate-900/95 dark:bg-slate-950 text-white text-[11px] px-3 py-2 rounded-xl shadow-xl border border-slate-800/80 whitespace-nowrap backdrop-blur-md">
                      <div className="flex items-center justify-between gap-3 border-b border-slate-700/60 pb-1 mb-1">
                        <span className="font-bold text-slate-200">{pt.day}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{pt.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-300">
                        <span className="text-emerald-400 font-semibold">{safe} safe</span>
                        <span>•</span>
                        <span className="text-amber-400 font-semibold">{susp} susp</span>
                        <span>•</span>
                        <span className="text-red-400 font-semibold">{phish} phish</span>
                      </div>
                    </div>

                    {/* Total label above bar */}
                    <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 h-4 flex items-center">
                      {total > 0 ? total : ''}
                    </span>

                    {/* Stacked Bar Container */}
                    <div className="w-full max-w-[42px] bg-slate-100/90 dark:bg-slate-800/50 rounded-t-xl overflow-hidden flex flex-col justify-end h-[140px] border border-slate-200/50 dark:border-slate-800/40">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full flex flex-col justify-end transition-all duration-500 rounded-t-lg overflow-hidden"
                      >
                        {phish > 0 && (
                          <div
                            style={{ height: `${phishPct}%` }}
                            className="w-full bg-red-500 hover:brightness-110 transition-all"
                            title={`Phishing: ${phish}`}
                          />
                        )}
                        {susp > 0 && (
                          <div
                            style={{ height: `${suspPct}%` }}
                            className="w-full bg-amber-500 hover:brightness-110 transition-all"
                            title={`Suspicious: ${susp}`}
                          />
                        )}
                        {safe > 0 && (
                          <div
                            style={{ height: `${safePct}%` }}
                            className="w-full bg-emerald-500 hover:brightness-110 transition-all"
                            title={`Safe: ${safe}`}
                          />
                        )}
                      </div>
                    </div>

                    {/* Day label */}
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {pt.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <EmptyState
            icon={BarChart3}
            title="No 7-Day Detection Activity"
            description="Scan trends and threat statistics over time will populate here automatically once analysis records are logged."
            compact
          />
        )}
      </div>
    </Card>
  );
}

