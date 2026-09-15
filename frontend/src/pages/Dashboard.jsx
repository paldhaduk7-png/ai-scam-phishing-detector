import React, { useState, useEffect } from 'react';
import StatCard from '../components/dashboard/StatCard';
import DetectionChart from '../components/dashboard/DetectionChart';
import RecentDetections from '../components/dashboard/RecentDetections';
import QuickActions from '../components/dashboard/QuickActions';
import SafetyTips from '../components/dashboard/SafetyTips';
import Card from '../components/common/Card';
import { getDashboardStats, getRecentDetections } from '../services/api';
import {
  FileText,
  ShieldCheck,
  AlertCircle,
  AlertTriangle,
  Shield,
} from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalScans: '--',
    safeResults: '--',
    suspicious: '--',
    phishing: '--',
  });
  const [recentScans, setRecentScans] = useState([]);

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

      try {
        const recentData = await getRecentDetections();
        if (Array.isArray(recentData)) {
          setRecentScans(recentData);
        }
      } catch {
        // Backend not yet running; keep clean honest empty state []
      }
    };

    fetchDashboard();
  }, []);


  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Welcome Banner & Quote Row matching Screenshot 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Welcome Banner Card (col-span-8) */}
        <Card className="lg:col-span-8 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white border-blue-100 p-6 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-md">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight">
                Welcome Back, Pal!
              </h1>
              <p className="text-sm font-semibold text-blue-700">
                Stay Safe. Think Before You Click.
              </p>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
                Detect suspicious messages, emails and URLs using AI and machine learning.
              </p>
            </div>

            {/* Laptop Security Illustration matching screenshot */}
            <div className="hidden sm:flex flex-col items-center justify-center p-3 text-center shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Shield className="w-8 h-8 fill-white/20 stroke-white" />
              </div>
              <span className="text-[11px] font-bold text-slate-700 mt-2">
                A Safer Internet<br />for Everyone
              </span>
            </div>
          </div>
        </Card>

        {/* Security Quote Card (col-span-4) matching screenshot */}
        <Card className="lg:col-span-4 bg-gradient-to-br from-white to-blue-50/50 border-blue-100 p-6 flex flex-col justify-center relative overflow-hidden">
          <div className="space-y-2 z-10">
            <span className="text-2xl text-blue-500 font-serif leading-none">“</span>
            <p className="text-sm font-bold text-slate-900 leading-snug">
              Small Clicks Can Make a Big Difference
            </p>
            <p className="text-xs font-semibold text-slate-500">
              Be Aware. Be Safe.
            </p>
          </div>

          <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-blue-100/50 flex items-center justify-center text-blue-600 pointer-events-none">
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
          <DetectionChart />
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
