import React, { useState, useEffect } from 'react';
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
} from '../services/api';
import {
  FileText,
  ShieldCheck,
  AlertCircle,
  AlertTriangle,
  Shield,
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useSelector((state) => state.auth);
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


  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Welcome Banner & Quote Row matching Screenshot 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Welcome Banner Card (col-span-8) */}
        <Card className="lg:col-span-8 p-6 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {user?.profile_photo ? (
                <div className="relative shrink-0">
                  <img
                    src={user.profile_photo}
                    alt={user.name || 'User'}
                    className="w-16 h-16 rounded-full object-cover ring-4 ring-blue-500/20 shadow-md"
                  />
                  <span
                    className="absolute bottom-0.5 right-0.5 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full shadow-xs"
                    title="Active User Session"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-xl shadow-md ring-4 ring-blue-500/20 shrink-0">
                  {user?.name ? user.name.substring(0, 2).toUpperCase() : 'U'}
                </div>
              )}
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-950 dark:text-white tracking-tight">
                    Welcome Back, {user?.name || 'User'}!
                  </h1>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800/40 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Active Account
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {user?.email || 'Logged in user'}
                </p>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-0.5">
                  Stay Safe. Think Before You Click. AI Scam & Phishing Protection active.
                </p>
              </div>
            </div>

            {/* Laptop Security Illustration matching screenshot */}
            <div className="hidden sm:flex flex-col items-center justify-center p-3 text-center shrink-0">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Shield className="w-7 h-7 fill-white/20 stroke-white" />
              </div>
              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 mt-1.5">
                Protected by<br />ScamShield
              </span>
            </div>
          </div>
        </Card>

        {/* Security Quote Card (col-span-4) matching screenshot */}
        <Card className="lg:col-span-4 p-6 flex flex-col justify-center relative overflow-hidden">
          <div className="space-y-2 z-10">
            <span className="text-2xl text-blue-500 font-serif leading-none">“</span>
            <p className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
              Small Clicks Can Make a Big Difference
            </p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Be Aware. Be Safe.
            </p>
          </div>

          <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-blue-100/50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 pointer-events-none">
            <Shield className="w-10 h-10 opacity-30" />
          </div>
        </Card>
      </div>

      {/* 4 Statistics Cards matching Screenshot 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Scans"
          value={stats.totalScans}
          subtext="No scan data available"
          icon={FileText}
          colorScheme="blue"
        />
        <StatCard
          title="Safe Results"
          value={stats.safeResults}
          subtext="No scan data available"
          icon={ShieldCheck}
          colorScheme="green"
        />
        <StatCard
          title="Suspicious"
          value={stats.suspicious}
          subtext="No scan data available"
          icon={AlertCircle}
          colorScheme="amber"
        />
        <StatCard
          title="Phishing"
          value={stats.phishing}
          subtext="No scan data available"
          icon={AlertTriangle}
          colorScheme="red"
        />
      </div>

      {/* Middle & Lower Grid: Charts, Tables, Quick Actions, Tips */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Chart + Recent Detections */}
        <div className="lg:col-span-8 space-y-6">
          <DetectionChart data={chartData} />
          <RecentDetections detections={recentScans} />
        </div>

        {/* Right Column (4 cols): Quick Actions + Safety Tips */}
        <div className="lg:col-span-4 space-y-6">
          <QuickActions />
          <SafetyTips />
        </div>
      </div>
    </div>
  );
}
