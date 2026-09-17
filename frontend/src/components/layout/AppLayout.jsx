import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';
import BottomNav from './BottomNav';

/**
 * AppLayout provides the primary application frame for authenticated
 * and internal tool routes, managing the responsive sidebar and content container.
 */
export default function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = (pathname) => {
    switch (pathname) {
      case '/dashboard':
        return 'Security Operations Dashboard';
      case '/detect':
        return 'Multi-Vector Threat Detection';
      case '/history':
        return 'Audit & Scan History';
      case '/profile':
        return 'Account & Profile Settings';
      case '/about':
        return 'Platform Architecture & Mission';
      default:
        return 'ScamShield AI';
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex transition-colors duration-200 antialiased">
      {/* Sidebar Component */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-[padding] duration-300 pb-16 lg:pb-0">
        <TopHeader
          title={getPageTitle(location.pathname)}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fadeIn">
          <Outlet />
        </main>
      </div>

      {/* Mobile Persistent Bottom Navigation Bar */}
      <BottomNav />
    </div>
  );
}

