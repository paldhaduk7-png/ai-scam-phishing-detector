import React, { useState, useRef, useCallback } from 'react';
import Card from '../common/Card';
import EmptyState from '../common/EmptyState';
import { BarChart3, TrendingUp } from 'lucide-react';

function aggregate7Days(items) {
  if (!items) items = [];
  const days = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    days.push({ date: dateStr, day: dayName, safe: 0, suspicious: 0, phishing: 0, total: 0 });
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
            String(item.result || item.classification || '').toLowerCase().includes('phish');
          const risk =
            item.confidence != null
              ? item.confidence
              : item.risk_percentage != null
              ? item.risk_percentage
              : 0;
          if (isPhish) entry.phishing += 1;
          else if (risk < 40) entry.safe += 1;
          else entry.suspicious += 1;
        }
      }
    } catch (_) {}
  });
  return days;
}

function smoothPath(pts) {
  if (!pts || pts.length < 2) return '';
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const cp1x = pts[i].x + (pts[i + 1].x - pts[i].x) / 3;
    const cp2x = pts[i + 1].x - (pts[i + 1].x - pts[i].x) / 3;
    d += ` C ${cp1x} ${pts[i].y}, ${cp2x} ${pts[i + 1].y}, ${pts[i + 1].x} ${pts[i + 1].y}`;
  }
  return d;
}

function AreaSeries({ pts, baseY, color, gradId, fillOpacity = 0.2 }) {
  if (!pts || pts.length < 2) return null;
  const linePath = smoothPath(pts);
  const areaPath = `${linePath} L ${pts[pts.length - 1].x} ${baseY} L ${pts[0].x} ${baseY} Z`;

  return (
    <g>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={fillOpacity * 3} />
          <stop offset="90%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradId})`} />
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );
}

export default function DetectionChart({ data = null }) {
  const [hoverIdx, setHoverIdx] = useState(null);
  const svgRef = useRef(null);

  let points = [];
  if (Array.isArray(data) && data.length > 0) {
    if (data[0] && typeof data[0].day === 'string' && ('safe' in data[0] || 'total' in data[0])) {
      points = data;
    } else {
      points = aggregate7Days(data);
    }
  } else {
    points = aggregate7Days([]);
  }

  const totalScans = points.reduce((a, d) => a + (d.total || 0), 0);
  const totalSafe = points.reduce((a, d) => a + (d.safe || 0), 0);
  const totalSusp = points.reduce((a, d) => a + (d.suspicious || 0), 0);
  const totalPhish = points.reduce((a, d) => a + (d.phishing || 0), 0);
  const hasActivity = totalScans > 0;

  const W = 620;
  const H = 190;
  const padL = 20;
  const padR = 20;
  const padT = 25;
  const padB = 25;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const baseY = padT + chartH;

  const maxVal = hasActivity ? Math.max(...points.map((p) => p.total || 0), 1) : 5;

  const xPos = (i) => padL + (i / Math.max(points.length - 1, 1)) * chartW;
  const yPos = (v) => padT + chartH - (v / maxVal) * chartH;

  const safePts = points.map((p, i) => ({ x: xPos(i), y: yPos(p.safe || 0) }));
  const suspPts = points.map((p, i) => ({ x: xPos(i), y: yPos(p.suspicious || 0) }));
  const phishPts = points.map((p, i) => ({ x: xPos(i), y: yPos(p.phishing || 0) }));

  const gridSteps = [0.25, 0.5, 0.75, 1];
  const gridLines = gridSteps.map((f) => ({
    y: padT + chartH - f * chartH,
    label: Math.round(f * maxVal),
  }));

  const handleMouseMove = useCallback(
    (e) => {
      const svg = svgRef.current;
      if (!svg || points.length === 0) return;
      const rect = svg.getBoundingClientRect();
      const mx = ((e.clientX - rect.left) / rect.width) * W;
      let closest = 0;
      let minDist = Infinity;
      points.forEach((_, i) => {
        const dist = Math.abs(xPos(i) - mx);
        if (dist < minDist) {
          minDist = dist;
          closest = i;
        }
      });
      setHoverIdx(closest);
    },
    [points]
  );

  const hovered = hoverIdx !== null ? points[hoverIdx] : null;

  return (
    <Card className="flex flex-col p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80 dark:border-slate-800/70">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Detection Activity
            </h2>
            <span className="text-[10px] sm:text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/40 px-2.5 py-0.5 rounded-full font-mono">
              7-Day Trend
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Safe vs Suspicious vs Phishing threats identified over the past week
          </p>
        </div>

        {/* Legend pills with live counters */}
        <div className="flex items-center gap-2.5 sm:gap-3 text-xs font-semibold flex-wrap">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/50 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Safe</span>
            <span className="font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              ({totalSafe})
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/50 dark:border-amber-800/40 text-amber-700 dark:text-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Suspicious</span>
            <span className="font-mono text-[11px] font-bold text-amber-600 dark:text-amber-400">
              ({totalSusp})
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200/50 dark:border-rose-800/40 text-rose-700 dark:text-rose-300">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Phishing</span>
            <span className="font-mono text-[11px] font-bold text-rose-600 dark:text-rose-400">
              ({totalPhish})
            </span>
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="flex-1 min-h-[210px] pt-4">
        {hasActivity ? (
          <div className="relative w-full select-none">
            <svg
              ref={svgRef}
              viewBox={`0 0 ${W} ${H}`}
              className="w-full h-auto"
              style={{ overflow: 'visible' }}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setHoverIdx(null)}
            >
              {/* Horizontal grid lines */}
              {gridLines.map(({ y, label }) => (
                <g key={y}>
                  <line
                    x1={padL}
                    y1={y}
                    x2={W - padR}
                    y2={y}
                    stroke="currentColor"
                    strokeOpacity="0.08"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                    className="text-slate-900 dark:text-white"
                  />
                  <text
                    x={padL - 6}
                    y={y + 3.5}
                    textAnchor="end"
                    fontSize="9"
                    fillOpacity="0.45"
                    className="fill-slate-600 dark:fill-slate-400 font-mono"
                  >
                    {label}
                  </text>
                </g>
              ))}

              {/* Baseline */}
              <line
                x1={padL}
                y1={baseY}
                x2={W - padR}
                y2={baseY}
                stroke="currentColor"
                strokeOpacity="0.12"
                strokeWidth="1"
                className="text-slate-900 dark:text-white"
              />

              {/* Day vertical hover columns */}
              {points.map((pt, i) => (
                <rect
                  key={`col-${pt.date || i}`}
                  x={xPos(i) - chartW / (points.length * 2)}
                  y={padT}
                  width={chartW / points.length}
                  height={chartH}
                  fill="transparent"
                  className="cursor-pointer"
                />
              ))}

              {/* Area & line paths */}
              <AreaSeries pts={safePts} baseY={baseY} color="#10b981" gradId="grad-safe" fillOpacity={0.16} />
              <AreaSeries pts={suspPts} baseY={baseY} color="#f59e0b" gradId="grad-susp" fillOpacity={0.16} />
              <AreaSeries pts={phishPts} baseY={baseY} color="#f43f5e" gradId="grad-phish" fillOpacity={0.2} />

              {/* Hover vertical indicator line */}
              {hoverIdx !== null && (
                <line
                  x1={xPos(hoverIdx)}
                  y1={padT}
                  x2={xPos(hoverIdx)}
                  y2={baseY}
                  stroke="#6366f1"
                  strokeOpacity="0.5"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                />
              )}

              {/* Dot indicators at hover point */}
              {hoverIdx !== null && (
                <>
                  {points[hoverIdx].safe > 0 && (
                    <g>
                      <circle cx={xPos(hoverIdx)} cy={yPos(points[hoverIdx].safe)} r="6" fill="#10b981" fillOpacity="0.25" />
                      <circle cx={xPos(hoverIdx)} cy={yPos(points[hoverIdx].safe)} r="3.5" fill="#10b981" stroke="white" strokeWidth="1.5" />
                    </g>
                  )}
                  {points[hoverIdx].suspicious > 0 && (
                    <g>
                      <circle cx={xPos(hoverIdx)} cy={yPos(points[hoverIdx].suspicious)} r="6" fill="#f59e0b" fillOpacity="0.25" />
                      <circle cx={xPos(hoverIdx)} cy={yPos(points[hoverIdx].suspicious)} r="3.5" fill="#f59e0b" stroke="white" strokeWidth="1.5" />
                    </g>
                  )}
                  {points[hoverIdx].phishing > 0 && (
                    <g>
                      <circle cx={xPos(hoverIdx)} cy={yPos(points[hoverIdx].phishing)} r="7" fill="#f43f5e" fillOpacity="0.25" />
                      <circle cx={xPos(hoverIdx)} cy={yPos(points[hoverIdx].phishing)} r="4" fill="#f43f5e" stroke="white" strokeWidth="2" />
                    </g>
                  )}
                </>
              )}

              {/* X-axis Day labels */}
              {points.map((pt, i) => {
                const isHovered = hoverIdx === i;
                const isToday = i === points.length - 1;
                return (
                  <text
                    key={pt.date || i}
                    x={xPos(i)}
                    y={H - 6}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight={isHovered || isToday ? '700' : '500'}
                    className={
                      isHovered
                        ? 'fill-blue-600 dark:fill-blue-400'
                        : isToday
                        ? 'fill-slate-900 dark:fill-white font-bold'
                        : 'fill-slate-400 dark:fill-slate-500'
                    }
                  >
                    {pt.day}
                  </text>
                );
              })}
            </svg>

            {/* Interactive Tooltip Card */}
            {hovered && hovered.total > 0 && hoverIdx !== null && (
              <div
                className="pointer-events-none absolute z-30 top-1 bg-[#0b111e]/98 text-white text-[11px] px-3.5 py-2.5 rounded-xl shadow-xl border border-slate-700/50 backdrop-blur-md whitespace-nowrap animate-fadeIn"
                style={{
                  left: `${(xPos(hoverIdx) / W) * 100}%`,
                  transform:
                    hoverIdx > points.length / 2
                      ? 'translate(calc(-100% - 12px), 0)'
                      : 'translate(12px, 0)',
                }}
              >
                <div className="flex items-center justify-between gap-4 border-b border-slate-700/60 pb-1.5 mb-2">
                  <span className="font-bold text-slate-100">{hovered.day}</span>
                  <span className="text-slate-400 font-mono text-[10px]">{hovered.date}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-6">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Safe
                    </span>
                    <span className="font-bold font-mono text-emerald-400">{hovered.safe || 0}</span>
                  </div>
                  <div className="flex items-center justify-between gap-6">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      Suspicious
                    </span>
                    <span className="font-bold font-mono text-amber-400">{hovered.suspicious || 0}</span>
                  </div>
                  <div className="flex items-center justify-between gap-6">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                      Phishing
                    </span>
                    <span className="font-bold font-mono text-rose-400">{hovered.phishing || 0}</span>
                  </div>
                  <div className="pt-1.5 mt-1 border-t border-slate-800 flex items-center justify-between gap-6 text-[10px] text-slate-400">
                    <span>Total Scans</span>
                    <span className="font-bold font-mono text-white">{hovered.total || 0}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center min-h-[190px]">
            <EmptyState
              icon={BarChart3}
              title="No 7-Day Detection Activity"
              description="Threat telemetry trends will automatically chart here once security scans are executed."
              compact
            />
          </div>
        )}
      </div>
    </Card>
  );
}
