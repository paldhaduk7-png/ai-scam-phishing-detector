import React, { useState, useRef, useCallback } from "react";
import Card from "../common/Card";
import EmptyState from "../common/EmptyState";
import { BarChart3 } from "lucide-react";

function aggregate7Days(items) {
  if (!items) items = [];
  const days = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
    days.push({ date: dateStr, day: dayName, safe: 0, suspicious: 0, phishing: 0, total: 0 });
  }
  const daysMap = new Map(days.map((item) => [item.date, item]));
  items.forEach((item) => {
    const raw = item.created_at || item.createdAt || item.date_time || item.timestamp;
    if (!raw) return;
    try {
      const d = new Date(raw);
      if (!isNaN(d.getTime())) {
        const dateStr = d.toISOString().split("T")[0];
        const entry = daysMap.get(dateStr);
        if (entry) {
          entry.total += 1;
          const isPhish = item.is_phishing === true || String(item.result || item.classification || "").toLowerCase().includes("phish");
          const risk = item.confidence != null ? item.confidence : item.risk_percentage != null ? item.risk_percentage : 0;
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
  if (!pts || pts.length < 2) return "";
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const cp1x = pts[i].x + (pts[i + 1].x - pts[i].x) / 3;
    const cp2x = pts[i + 1].x - (pts[i + 1].x - pts[i].x) / 3;
    d += ` C ${cp1x} ${pts[i].y}, ${cp2x} ${pts[i + 1].y}, ${pts[i + 1].x} ${pts[i + 1].y}`;
  }
  return d;
}

function AreaSeries({ pts, baseY, color, gradId, fillOpacity }) {
  if (!pts || pts.length < 2) return null;
  const opacity = fillOpacity || 0.18;
  const linePath = smoothPath(pts);
  const areaPath = `${linePath} L ${pts[pts.length - 1].x} ${baseY} L ${pts[0].x} ${baseY} Z`;
  return (
    React.createElement("g", null,
      React.createElement("defs", null,
        React.createElement("linearGradient", { id: gradId, x1: "0", y1: "0", x2: "0", y2: "1" },
          React.createElement("stop", { offset: "0%", stopColor: color, stopOpacity: opacity * 3.5 }),
          React.createElement("stop", { offset: "100%", stopColor: color, stopOpacity: 0 })
        )
      ),
      React.createElement("path", { d: areaPath, fill: `url(#${gradId})` }),
      React.createElement("path", { d: linePath, fill: "none", stroke: color, strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round" })
    )
  );
}

export default function DetectionChart({ data }) {
  data = data || null;
  const [hoverIdx, setHoverIdx] = useState(null);
  const svgRef = useRef(null);

  let points = [];
  if (Array.isArray(data) && data.length > 0) {
    if (data[0] && typeof data[0].day === "string" && ("safe" in data[0] || "total" in data[0])) {
      points = data;
    } else {
      points = aggregate7Days(data);
    }
  }

  const totalScans = points.reduce((a, d) => a + (d.total || 0), 0);
  const totalSafe  = points.reduce((a, d) => a + (d.safe || 0), 0);
  const totalSusp  = points.reduce((a, d) => a + (d.suspicious || 0), 0);
  const totalPhish = points.reduce((a, d) => a + (d.phishing || 0), 0);
  const hasActivity = totalScans > 0;

  const W = 600, H = 180;
  const padL = 12, padR = 12, padT = 22, padB = 2;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const baseY = padT + chartH;
  const maxVal = hasActivity ? Math.max(...points.map((p) => p.total || 0), 1) : 5;

  const xPos = (i) => padL + (i / Math.max(points.length - 1, 1)) * chartW;
  const yPos = (v) => padT + chartH - (v / maxVal) * chartH;

  const safePts  = points.map((p, i) => ({ x: xPos(i), y: yPos(p.safe || 0) }));
  const suspPts  = points.map((p, i) => ({ x: xPos(i), y: yPos(p.suspicious || 0) }));
  const phishPts = points.map((p, i) => ({ x: xPos(i), y: yPos(p.phishing || 0) }));

  const gridLines = [0.25, 0.5, 0.75, 1].map((f) => ({
    y: padT + chartH - f * chartH,
    label: Math.round(f * maxVal),
  }));

  const handleMouseMove = useCallback((e) => {
    const svg = svgRef.current;
    if (!svg || points.length === 0) return;
    const rect = svg.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width) * W;
    let closest = 0, minDist = Infinity;
    points.forEach((_, i) => {
      const dist = Math.abs(xPos(i) - mx);
      if (dist < minDist) { minDist = dist; closest = i; }
    });
    setHoverIdx(closest);
  }, [points]);

  const hovered = hoverIdx !== null ? points[hoverIdx] : null;

  const seriesList = [
    { label: "Safe",       count: totalSafe,  dot: "bg-emerald-500" },
    { label: "Suspicious", count: totalSusp,  dot: "bg-amber-500"   },
    { label: "Phishing",   count: totalPhish, dot: "bg-rose-500"    },
  ];

  const dotSeries = [
    { color: "#10b981", key: "safe"       },
    { color: "#f59e0b", key: "suspicious" },
    { color: "#f43f5e", key: "phishing"   },
  ];

  const tooltipRows = [
    { label: "Safe",       key: "safe",       cls: "text-emerald-400" },
    { label: "Suspicious", key: "suspicious", cls: "text-amber-400"   },
    { label: "Phishing",   key: "phishing",   cls: "text-rose-400"    },
  ];

  return (
    React.createElement(Card, { className: "flex flex-col p-4 sm:p-6" },
      React.createElement("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/80" },
        React.createElement("div", null,
          React.createElement("div", { className: "flex items-center gap-2 flex-wrap" },
            React.createElement("h2", { className: "text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight" }, "Detection Activity Overview"),
            hasActivity && React.createElement("span", { className: "text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/40 px-2 py-0.5 rounded-full font-mono" }, totalScans + " Total")
          ),
          React.createElement("p", { className: "text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5" }, "7-day scan activity — Safe, Suspicious, and Phishing")
        ),
        React.createElement("div", { className: "flex items-center gap-3 sm:gap-4 text-xs font-semibold flex-wrap" },
          seriesList.map(({ label, count, dot }) =>
            React.createElement("div", { key: label, className: "flex items-center gap-1.5" },
              React.createElement("span", { className: `w-2.5 h-2.5 rounded-full ${dot}` }),
              React.createElement("span", { className: "text-slate-600 dark:text-slate-300" }, label),
              hasActivity && React.createElement("span", { className: "text-[10px] font-mono text-slate-400 dark:text-slate-500" }, `(${count})`)
            )
          )
        )
      ),
      React.createElement("div", { className: "flex-1 min-h-[200px] pt-4" },
        hasActivity
          ? React.createElement("div", { className: "relative w-full select-none" },
              React.createElement("svg", {
                ref: svgRef,
                viewBox: `0 0 ${W} ${H + 26}`,
                className: "w-full",
                style: { overflow: "visible" },
                onMouseMove: handleMouseMove,
                onMouseLeave: () => setHoverIdx(null),
              },
                gridLines.map(({ y, label }) =>
                  React.createElement("g", { key: y },
                    React.createElement("line", { x1: padL, y1: y, x2: W - padR, y2: y, stroke: "currentColor", strokeOpacity: "0.06", strokeWidth: "1", strokeDasharray: "5 4", className: "text-slate-900 dark:text-white" }),
                    React.createElement("text", { x: padL - 4, y: y + 3.5, textAnchor: "end", fontSize: "9", fillOpacity: "0.4", className: "fill-slate-600 dark:fill-slate-400" }, label)
                  )
                ),
                React.createElement("line", { x1: padL, y1: baseY, x2: W - padR, y2: baseY, stroke: "currentColor", strokeOpacity: "0.10", strokeWidth: "1", className: "text-slate-900 dark:text-white" }),
                React.createElement(AreaSeries, { pts: safePts,  baseY, color: "#10b981", gradId: "gs", fillOpacity: 0.18 }),
                React.createElement(AreaSeries, { pts: suspPts,  baseY, color: "#f59e0b", gradId: "gu", fillOpacity: 0.16 }),
                React.createElement(AreaSeries, { pts: phishPts, baseY, color: "#f43f5e", gradId: "gp", fillOpacity: 0.20 }),
                hoverIdx !== null && React.createElement("line", { x1: xPos(hoverIdx), y1: padT, x2: xPos(hoverIdx), y2: baseY, stroke: "#818cf8", strokeOpacity: "0.40", strokeWidth: "1.5", strokeDasharray: "4 3" }),
                hoverIdx !== null && dotSeries.map(({ color, key }) => {
                  const v = points[hoverIdx][key] || 0;
                  return v > 0 ? React.createElement("g", { key },
                    React.createElement("circle", { cx: xPos(hoverIdx), cy: yPos(v), r: "7", fill: color, fillOpacity: "0.15" }),
                    React.createElement("circle", { cx: xPos(hoverIdx), cy: yPos(v), r: "4", fill: color, stroke: "white", strokeWidth: "2" })
                  ) : null;
                }),
                points.map((pt, i) =>
                  React.createElement("text", {
                    key: pt.date || i,
                    x: xPos(i), y: H + 20,
                    textAnchor: "middle", fontSize: "11",
                    fontWeight: hoverIdx === i ? "700" : "500",
                    className: hoverIdx === i ? "fill-indigo-500 dark:fill-indigo-400" : "fill-slate-500 dark:fill-slate-400",
                  }, pt.day)
                ),
                hoverIdx !== null && points[hoverIdx].total > 0 &&
                  React.createElement("text", {
                    x: xPos(hoverIdx),
                    y: yPos(points[hoverIdx].total) - 10,
                    textAnchor: "middle", fontSize: "10", fontWeight: "800",
                    className: "fill-indigo-500 dark:fill-indigo-300",
                  }, points[hoverIdx].total)
              ),
              hovered && hovered.total > 0 && hoverIdx !== null &&
                React.createElement("div", {
                  className: "pointer-events-none absolute z-30 top-0 bg-slate-900 dark:bg-slate-950 text-white text-[11px] px-3 py-2.5 rounded-xl shadow-2xl border border-slate-700/50 backdrop-blur-md whitespace-nowrap animate-fadeIn",
                  style: {
                    left: `${(xPos(hoverIdx) / W) * 100}%`,
                    transform: hoverIdx > points.length / 2 ? "translate(calc(-100% - 10px), 0)" : "translate(10px, 0)",
                  },
                },
                  React.createElement("div", { className: "flex items-center justify-between gap-4 border-b border-slate-700/50 pb-1.5 mb-1.5" },
                    React.createElement("span", { className: "font-bold text-slate-100" }, hovered.day),
                    React.createElement("span", { className: "text-slate-400 font-mono text-[10px]" }, hovered.date)
                  ),
                  React.createElement("div", { className: "space-y-1" },
                    tooltipRows.map(({ label, key, cls }) =>
                      React.createElement("div", { key: label, className: "flex items-center justify-between gap-8" },
                        React.createElement("span", { className: "text-slate-400" }, label),
                        React.createElement("span", { className: `font-bold font-mono ${cls}` }, hovered[key] || 0)
                      )
                    )
                  )
                )
            )
          : React.createElement("div", { className: "flex items-center justify-center min-h-[180px]" },
              React.createElement(EmptyState, {
                icon: BarChart3,
                title: "No 7-Day Detection Activity",
                description: "Scan trends and statistics will appear here once you run your first analysis.",
                compact: true,
              })
            )
      )
    )
  );
}
