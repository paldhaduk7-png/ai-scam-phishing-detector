import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  User,
  LogOut,
  LayoutDashboard,
  Sun,
  Moon,
  Shield,
} from 'lucide-react';
import { toast } from 'sonner';
import { logoutUser } from '../../store/slices/authSlice';
import { useTheme } from '../../context/ThemeContext';
import ConfirmModal from '../common/ConfirmModal';

export default function TopHeader({ onToggleSidebar, title }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { isDark, toggleTheme } = useTheme();

  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const menuRef = useRef(null);

  // Close dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (fullName) => {
    if (!fullName) return 'U';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleConfirmLogout = async () => {
    setLoggingOut(true);
    try {
      await dispatch(logoutUser());
      toast.success('Signed out successfully.');
      setShowLogoutModal(false);
      setMenuOpen(false);
      navigate('/login');
    } catch {
      toast.error('Sign out failed. Please try again.');
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/85 dark:bg-[#0b101b]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-6 lg:px-8 py-3 transition-colors">
        <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto w-full">
          {/* Left Section: Mobile Menu + Search or Page Title */}
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <button
              type="button"
              onClick={onToggleSidebar}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden focus-visible:outline-none cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Global Search Bar */}
            <div className="relative w-full max-w-md hidden sm:block">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search scans, threats, or history..."
                className="w-full pl-9 pr-14 py-2 bg-slate-100/70 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:border-blue-500 transition-all"
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none hidden md:flex items-center gap-0.5">
                <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 shadow-2xs">
                  ⌘K
                </kbd>
              </div>
            </div>

            {title && (
              <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white sm:hidden truncate">
                {title}
              </h1>
            )}
          </div>

          {/* Right Section: Theme Toggle + Notifications + User Profile Area */}
          <div className="flex items-center gap-2 sm:gap-3 relative" ref={menuRef}>
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={() => {
                toggleTheme();
                toast.info(`Switched to ${isDark ? 'Light' : 'Dark'} Mode`);
              }}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer border border-slate-200/60 dark:border-slate-800"
              aria-label="Toggle theme mode"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400 transition-transform hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 text-blue-600 transition-transform hover:-rotate-12" />
              )}
            </button>

            {/* Notification Bell */}
            <button
              type="button"
              onClick={() => toast.info('System notifications: All detection engines operational.')}
              className="relative p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer border border-slate-200/60 dark:border-slate-800"
              aria-label="System notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white dark:ring-[#0b101b]" />
            </button>

            {/* User Profile Trigger / Session Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 transition-all cursor-pointer focus-visible:outline-none"
                  aria-expanded={menuOpen}
                >
                  {user?.profile_photo ? (
                    <img
                      src={user.profile_photo}
                      alt={user?.name || 'User'}
                      className="w-7 h-7 rounded-lg object-cover ring-1 ring-blue-500/20 shrink-0"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                      {getInitials(user?.name)}
                    </div>
                  )}
                  <span className="text-xs font-semibold hidden md:block max-w-[120px] truncate">
                    {user?.name || 'User'}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                      menuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Card */}
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xl py-2 z-50 animate-scaleUp">
                    {/* User Header */}
                    <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {user?.name || 'Account'}
                      </p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                        {user?.email || ''}
                      </p>
                    </div>

                    {/* Menu Options */}
                    <div className="p-1 space-y-0.5">
                      <Link
                        to="/dashboard"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-blue-500" />
                        <span>Security Dashboard</span>
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors"
                      >
                        <User className="w-4 h-4 text-indigo-500" />
                        <span>Account Settings</span>
                      </Link>
                    </div>

                    {/* Sign Out */}
                    <div className="p-1 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          setShowLogoutModal(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-xs shadow-blue-600/20 transition-all cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => !loggingOut && setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
        loading={loggingOut}
        title="Sign Out Confirmation"
        message="Are you sure you want to sign out of ScamShield? You will need to sign back in to view your scan history."
        confirmText="Sign Out"
        cancelText="Cancel"
      />
    </>
  );
}
