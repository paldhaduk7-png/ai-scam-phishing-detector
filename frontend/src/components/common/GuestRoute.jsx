import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { Shield } from 'lucide-react';

/**
 * GuestRoute prevents already authenticated users from visiting
 * login and registration pages, redirecting them directly to /dashboard.
 */
export default function GuestRoute({ children }) {
  const { isAuthenticated, initialized } = useSelector((state) => state.auth);

  if (!initialized) {
    return (
      <div className="min-h-screen bg-[#090d16] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/30 animate-pulse">
            <Shield className="w-8 h-8 fill-white/20 stroke-white stroke-2" />
          </div>
          <p className="text-sm font-medium text-slate-400">
            Checking session...
          </p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children ? children : <Outlet />;
}
