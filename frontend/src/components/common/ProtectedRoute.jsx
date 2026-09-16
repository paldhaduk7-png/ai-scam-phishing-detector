import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Shield } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, initialized } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!initialized) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/30 animate-pulse">
              <Shield className="w-8 h-8 fill-white/20 stroke-white stroke-2" />
            </div>
          </div>
          <p className="text-sm font-medium text-slate-400">
            Initializing security session...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ? children : <Outlet />;
}
