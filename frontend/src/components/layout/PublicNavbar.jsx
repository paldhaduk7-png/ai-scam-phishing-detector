import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Shield, Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import Button from '../common/Button';
import { logoutUser } from '../../store/slices/authSlice';

export default function PublicNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 group focus:outline-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white shadow-md shadow-blue-600/20 group-hover:scale-105 transition-transform">
            <Shield className="w-5 h-5 fill-white/20 stroke-white stroke-[2.2]" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 font-sans">
            ScamShield
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            to="/"
            className="text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors"
          >
            Home
          </Link>
          <Link
            to="/detect"
            className="text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors"
          >
            Detect
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className="text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                to="/history"
                className="text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors"
              >
                History
              </Link>
              <Link
                to="/profile"
                className="text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors"
              >
                Profile
              </Link>
            </>
          ) : (
            <>
              <a
                href="#features"
                className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
              >
                Features
              </a>
              <Link
                to="/about"
                className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
              >
                About
              </Link>
            </>
          )}
        </nav>

        {/* Right CTA / Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="text-slate-700 font-medium inline-flex items-center gap-1.5"
              >
                <LayoutDashboard className="w-4 h-4 text-blue-600" />
                <span>Dashboard</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-slate-500 hover:text-red-600 font-medium inline-flex items-center gap-1.5"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/login')}
                className="text-slate-600 hover:text-slate-900 font-medium"
              >
                Login
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/detect')}
                className="rounded-full px-5 py-2 text-sm shadow-md shadow-blue-500/25"
              >
                Try Free Scan
              </Button>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 md:hidden"
          aria-label="Toggle mobile menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-800 hover:bg-slate-50"
          >
            Home
          </Link>
          <Link
            to="/detect"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-800 hover:bg-slate-50"
          >
            Detect
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-800 hover:bg-slate-50"
              >
                Dashboard
              </Link>
              <Link
                to="/history"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-800 hover:bg-slate-50"
              >
                History
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-800 hover:bg-slate-50"
              >
                Profile
              </Link>
              <div className="pt-3 border-t border-slate-100">
                <Button
                  variant="outline"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full justify-center text-red-600"
                >
                  Sign Out ({user?.name || 'Account'})
                </Button>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-600 hover:bg-slate-50"
              >
                About
              </Link>
              <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/login');
                  }}
                  className="w-full justify-center"
                >
                  Login
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/detect');
                  }}
                  className="w-full justify-center"
                >
                  Try Free Scan
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </header>
  );
}
