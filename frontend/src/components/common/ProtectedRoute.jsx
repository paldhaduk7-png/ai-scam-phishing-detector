import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Shield } from 'lucide-react';

/**
 * ProtectedRoute guards sensitive application pages (Dashboard, History, Profile).
 * Unauthenticated requests are intercepted and redirected to /login with the target path preserved.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, initialized } = useSelector((state) => state.auth);
  const location = useLocation();

  // If session check has not completed yet, show sleek loading indicator
  if (!initialized) {
    return (
      <div className="min-h-screen bg-[#090d16] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white shadow-xl shadow-blue-500/30 animate-pulse">
            <Shield className="w-8 h-8 fill-white/20 stroke-white stroke-2" />
          </div>
          <p className="text-sm font-medium text-slate-400 animate-pulse">
            Verifying secure session...
          </p>
        </div>
      </div>
    );
  }

  // Not logged in -> redirect to login with original intended destination preserved
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{
          from: location,
          message: 'Please sign in to access this protected page.',
        }}
        replace
      />
    );
  }

  return children ? children : <Outlet />;
}
