import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import StatCard from '../components/dashboard/StatCard';
import DetectionChart from '../components/dashboard/DetectionChart';
import RecentDetections from '../components/dashboard/RecentDetections';
import QuickActions from '../components/dashboard/QuickActions';
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
  ArrowRight,
  Plus,
  Clock,
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
        // Backend not yet running; keep clean initial state '--'
      }

      let recentItems = [];
      try {
        const recentData = await getRecentDetections();
        if (Array.isArray(recentData)) {
          setRecentScans(recentData);
          recentItems = recentData;
        }
      } catch {
        // Backend not yet running; keep clean empty state []
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
    <div className="space-y-5 sm:space-y-6 animate-fadeIn">
      {/* 1. Executive Dashboard Header with Integrated User Context & Quick CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0d1424] border border-slate-200/80 dark:border-slate-800/60 shadow-xs dark:shadow-sm">
        <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
          {user?.profile_photo ? (
            <div className="relative shrink-0">
              <img
                src={user.profile_photo}
                alt={user.name || 'User'}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover ring-2 ring-blue-500/20 shadow-sm"
              />
              <span
                className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-[#0d1424] rounded-full shadow-sm"
                title="Active Session"
              />
            </div>
          ) : (
            <div className="relative shrink-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-lg sm:text-xl shadow-sm ring-2 ring-blue-500/20">
                {user?.name ? user.name.substring(0, 2).toUpperCase() : 'U'}
              </div>
              <span
                className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-[#0d1424] rounded-full shadow-sm"
                title="Active Session"
              />
            </div>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-2xl font-extrabold text-slate-950 dark:text-white tracking-tight truncate">
                Welcome back, {user?.name || 'Security Analyst'}
              </h1>
              <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/40 px-2.5 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Monitoring
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              {user?.email ? `${user.email} • ` : ''}Real-time scam analysis overview & threat telemetry
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0">
          <button
            type="button"
            onClick={() => navigate('/history')}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-700/60 rounded-xl border border-slate-200 dark:border-slate-700/60 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Audit History</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/detect')}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 active:scale-95 rounded-xl transition-all shadow-sm shadow-blue-500/25 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Threat Scan</span>
          </button>
        </div>
      </div>

      {/* Active Gmail Background Analysis Banner */}
      {activeGmailJob && ['starting', 'processing'].includes(activeGmailJob.status) && (
        <div className="p-3.5 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-indigo-500/10 border border-emerald-500/30 dark:border-emerald-800/40 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 animate-fadeIn">
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
                Processed {activeGmailJob.processed || 0} of {activeGmailJob.total || 0} emails. Results are saved directly to audit records.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              type="button"
              onClick={() => navigate('/detect?tab=email')}
              className="px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-xl border border-blue-200/80 dark:border-slate-800/60 transition-colors shadow-xs cursor-pointer"
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

      {/* 2. Key Security Metrics - 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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

      {/* 3. Telemetry & Quick Action Launchers (8 cols DetectionChart + 4 cols QuickActions) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-stretch">
        <div className="lg:col-span-8 flex flex-col">
          <DetectionChart data={chartData} />
        </div>
        <div className="lg:col-span-4 flex flex-col">
          <QuickActions />
        </div>
      </div>

      {/* 4. Full-Width Recent Detections Audit Table */}
      <div className="w-full">
        <RecentDetections detections={recentScans} />
      </div>
    </div>
  );
}
