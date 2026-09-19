import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import StatCard from '../components/dashboard/StatCard';
import DetectionChart from '../components/dashboard/DetectionChart';
import RecentDetections from '../components/dashboard/RecentDetections';
import QuickActions from '../components/dashboard/QuickActions';
import SafetyTips from '../components/dashboard/SafetyTips';
import Card from '../components/common/Card';
import {
  getDashboardStats,
  getRecentDetections,
  getDashboardChart,
  getDetectionHistory,
  getActiveGmailAnalysis,
} from '../services/api';
import {
  FileText,
  ShieldCheck,
  AlertCircle,
  AlertTriangle,
  Shield,
  Loader2,
  Mail,
  ArrowRight,
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [activeGmailJob, setActiveGmailJob] = useState(null);
  const [stats, setStats] = useState({
    totalScans: '--',
    safeResults: '--',
    suspicious: '--',
    phishing: '--',
  });
  const [recentScans, setRecentScans] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const statsData = await getDashboardStats();
        if (statsData) {
          setStats(statsData);
        }
      } catch {
        // Backend not yet running; keep clean honest initial state '--'
      }

      let recentItems = [];
      try {
        const recentData = await getRecentDetections();
        if (Array.isArray(recentData)) {
          setRecentScans(recentData);
          recentItems = recentData;
        }
      } catch {
        // Backend not yet running; keep clean honest empty state []
      }

      let chartFilled = false;
      try {
        const chart = await getDashboardChart();
        if (Array.isArray(chart) && chart.some((d) => (d.total || 0) > 0)) {
          setChartData(chart);
          chartFilled = true;
        }
      } catch {
        // dedicated endpoint not reached
      }

      if (!chartFilled) {
        try {
          const hist = await getDetectionHistory({ limit: 50 });
          const items = Array.isArray(hist?.items) ? hist.items : Array.isArray(hist) ? hist : [];
          if (items.length > 0) {
            setChartData(items);
            chartFilled = true;
          }
        } catch {
          // ignore
        }
      }

      if (!chartFilled && recentItems.length > 0) {
        setChartData(recentItems);
      }
    };

    fetchDashboard();
  }, []);

  // Poll for background Gmail analysis jobs
  useEffect(() => {
    let jobInterval;
    const checkJob = async () => {
      try {
        const res = await getActiveGmailAnalysis();
        if (res?.active && res.job) {
          setActiveGmailJob(res.job);
        } else {
          setActiveGmailJob(null);
        }
      } catch {
        // ignore
      }
    };

    checkJob();
    jobInterval = setInterval(checkJob, 3500);
    return () => clearInterval(jobInterval);
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Dashboard Page Title & Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
              Security Dashboard
            </h1>
            <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200/70 dark:border-blue-800/60 px-2 sm:px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              Live Telemetry
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 sm:line-clamp-none">
            Real-time scam analysis overview, 7-day threat vectors, and PostgreSQL audit intelligence.
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2 self-start sm:self-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-2xs">
            <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>AI Inference Engine Ready</span>
          </div>
        </div>
      </div>

      {/* Active Gmail Background Analysis Banner */}
      {activeGmailJob && ['starting', 'processing'].includes(activeGmailJob.status) && (
        <div className="p-3.5 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-indigo-500/10 border border-emerald-500/30 dark:border-emerald-500/20 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 animate-fadeIn">
          <div className="flex items-center gap-3 sm:gap-3.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/20">
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  Gmail Background Analysis Active
                </h4>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  {activeGmailJob.progress_percent || 0}% Complete
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Processed {activeGmailJob.processed || 0} of {activeGmailJob.total || 0} emails. Results are being saved directly to PostgreSQL.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              type="button"
              onClick={() => navigate('/detect?tab=email')}
              className="px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors shadow-2xs cursor-pointer"
            >
              View Progress
            </button>
            <button
              type="button"
              onClick={() => navigate('/history/email')}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>Email History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 2. User Welcome & Security Awareness Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-6 items-stretch">
        {/* User Identity Banner (8 cols) */}
        <Card className="lg:col-span-8 p-4 sm:p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              {user?.profile_photo ? (
                <div className="relative shrink-0">
                  <img
                    src={user.profile_photo}
                    alt={user.name || 'User'}
                    className="w-11 h-11 sm:w-16 sm:h-16 rounded-2xl object-cover ring-2 ring-blue-500/30 shadow-md"
                  />
                  <span
                    className="absolute -bottom-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full shadow-xs"
                    title="Active User Session"
                  />
                </div>
              ) : (
                <div className="relative shrink-0">
                  <div className="w-11 h-11 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-base sm:text-xl shadow-md ring-2 ring-blue-500/30">
                    {user?.name ? user.name.substring(0, 2).toUpperCase() : 'U'}
                  </div>
                  <span
                    className="absolute -bottom-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full shadow-xs"
                    title="Active User Session"
                  />
                </div>
              )}
              <div className="space-y-0.5 sm:space-y-1 min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight truncate">
                    Welcome back, {user?.name || 'User'}
                  </h2>
                  <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/40 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Authenticated
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-mono truncate">
                  {user?.email || 'Active session'}
                </p>
                <p className="text-[11px] sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-0.5 line-clamp-1 sm:line-clamp-none">
                  Your scam detection activity is monitored and preserved for security compliance.
                </p>
              </div>
            </div>

            {/* Protection Badge */}
            <div className="hidden sm:flex flex-col items-center justify-center p-3 text-center shrink-0 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100/80 dark:border-blue-900/40">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25">
                <Shield className="w-5 h-5 fill-white/20 stroke-white" />
              </div>
              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 mt-1.5 leading-tight">
                Protected by<br />ScamShield
              </span>
            </div>
          </div>
        </Card>

        {/* Security Hygiene Awareness Card (4 cols on desktop, compact on mobile) */}
        <Card className="lg:col-span-4 p-4 sm:p-6 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-900/80">
          <div className="space-y-1.5 sm:space-y-2.5 z-10">
            <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
              <span className="text-2xl sm:text-3xl font-serif leading-none select-none">“</span>
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Security Principle
              </span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug">
              Small Clicks Can Make a Big Difference
            </p>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">
              Be Aware. Be Safe. Think before you click.
            </p>
          </div>

          <div className="pt-2.5 sm:pt-3 mt-2 sm:mt-0 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between z-10 text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500">
            <span>Cyber Hygiene</span>
            <span className="font-semibold text-slate-600 dark:text-slate-300">ScamShield Advisory</span>
          </div>

          <div className="absolute -bottom-5 -right-5 w-24 h-24 rounded-full bg-blue-100/40 dark:bg-blue-900/10 flex items-center justify-center text-blue-600 pointer-events-none">
            <Shield className="w-12 h-12 opacity-20" />
          </div>
        </Card>
      </div>

      {/* 3. Real 4 Statistics Cards: 2x2 grid on mobile, 4-col on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <StatCard
          title="Total Scans"
          value={stats.totalScans}
          subtext={stats.totalScans !== '--' ? 'Across all channels' : 'No scan data available'}
          icon={FileText}
          colorScheme="blue"
        />
        <StatCard
          title="Safe Results"
          value={stats.safeResults}
          subtext={stats.safeResults !== '--' ? 'Benign & verified' : 'No scan data available'}
          icon={ShieldCheck}
          colorScheme="green"
        />
        <StatCard
          title="Suspicious"
          value={stats.suspicious}
          subtext={stats.suspicious !== '--' ? 'Caution warranted' : 'No scan data available'}
          icon={AlertCircle}
          colorScheme="amber"
        />
        <StatCard
          title="Phishing"
          value={stats.phishing}
          subtext={stats.phishing !== '--' ? 'Threats blocked' : 'No scan data available'}
          icon={AlertTriangle}
          colorScheme="red"
        />
      </div>

      {/* Mobile-only Quick Actions (Thumb-accessible right after KPI stats) */}
      <div className="block lg:hidden">
        <QuickActions />
      </div>

      {/* 4. Middle & Lower Grid: Charts, Tables, Quick Actions, Tips */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
        {/* Left Column (8 cols on desktop): 7-Day Chart + Recent Detections */}
        <div className="lg:col-span-8 space-y-4 sm:space-y-6">
          <DetectionChart data={chartData} />
          <RecentDetections detections={recentScans} />
        </div>

        {/* Right Column (4 cols on desktop): Quick Actions (desktop only) + Safety Tips */}
        <div className="lg:col-span-4 space-y-4 sm:space-y-6">
          <div className="hidden lg:block">
            <QuickActions />
          </div>
          <SafetyTips />
        </div>
      </div>

    </div>
  );
}
