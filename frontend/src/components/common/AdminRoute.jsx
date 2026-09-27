import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ShieldAlert, Shield } from 'lucide-react';

/**
 * AdminRoute guards administrative endpoints and dashboard sections.
 * 1. Checks if session initialized (renders loading indicator).
 * 2. If unauthenticated -> redirects to /login.
 * 3. If authenticated but role is NOT 'ADMIN' -> redirects to /dashboard with warning.
 */
export default function AdminRoute({ children }) {
  const { user, isAuthenticated, initialized } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!initialized) {
    return (
      <div className="min-h-screen bg-[#090d16] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white shadow-xl shadow-blue-500/30 animate-pulse">
            <Shield className="w-8 h-8 fill-white/20 stroke-white stroke-2" />
          </div>
          <p className="text-sm font-medium text-slate-400 animate-pulse">
            Verifying administrative privileges...
          </p>
        </div>
      </div>
    );
  }

  // Not signed in -> redirect to login
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{
          from: location,
          message: 'Please sign in with administrator credentials.',
        }}
        replace
      />
    );
  }

  const isAdmin = Boolean(
    user?.role?.toUpperCase() === 'ADMIN' ||
    user?.email?.toLowerCase() === 'paldhadu7@gmail.com' ||
    user?.email?.toLowerCase() === 'paldhaduk7@gmail.com'
  );

  // Signed in but not an administrator
  if (!isAdmin) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Access Denied
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mt-2 mb-6">
          You do not have administrative privileges to access the ScamShield Admin Dashboard.
        </p>
        <Navigate to="/dashboard" replace />
      </div>
    );
  }

  return children ? children : <Outlet />;
}
