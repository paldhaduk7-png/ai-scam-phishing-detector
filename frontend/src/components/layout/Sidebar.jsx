import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import {
  LayoutDashboard,
  Search,
  Clock,
  Mail,
  MessageSquare,
  Link as LinkIcon,
  User,
  LogOut,
  LogIn,
  Shield,
  X,
  Sun,
  Moon,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { logoutUser } from '../../store/slices/authSlice';
import { useTheme } from '../../context/ThemeContext';
import ConfirmModal from '../common/ConfirmModal';

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { isDark, toggleTheme } = useTheme();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(true);

  const isHistoryActive = location.pathname.startsWith('/history');

  const historySubItems = [
    { name: 'Email History', path: '/history/email', icon: Mail },
    { name: 'Text History', path: '/history/text', icon: MessageSquare },
    { name: 'URL History', path: '/history/url', icon: LinkIcon },
  ];

  const handleConfirmLogout = async () => {
    setLoggingOut(true);
    try {
      await dispatch(logoutUser());
      toast.success('Signed out successfully.');
      setShowLogoutModal(false);
      onClose?.();
      navigate('/login');
    } catch {
      toast.error('Sign out failed. Please try again.');
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 max-w-[85vw] bg-white dark:bg-[#0b101b] text-slate-800 dark:text-slate-100 border-r border-slate-200/90 dark:border-slate-800/80 flex flex-col transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Header / Brand Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200/80 dark:border-slate-800/80">
          <NavLink
            to="/"
            onClick={onClose}
            className="flex items-center gap-3 group focus-visible:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white shadow-md shadow-blue-600/20 group-hover:scale-105 transition-transform shrink-0">
              <Shield className="w-5 h-5 fill-white/20 stroke-white stroke-[2.2]" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white font-sans block leading-tight">
                ScamShield
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 dark:text-slate-500">
                Security Suite
              </span>
            </div>
          </NavLink>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Navigation
          </p>

          {/* Dashboard */}
          {isAuthenticated && (
            <NavLink
              to="/dashboard"
              onClick={onClose}
              className={({ isActive }) =>
                `relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-50/90 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/60 shadow-2xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-5 rounded-full bg-blue-600 dark:bg-blue-400" />
                  )}
                  <LayoutDashboard className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span className="truncate">Dashboard</span>
                </>
              )}
            </NavLink>
          )}

          {/* Detect Threats */}
          <NavLink
            to="/detect"
            onClick={onClose}
            className={({ isActive }) =>
              `relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-blue-50/90 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/60 shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/50'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-5 rounded-full bg-blue-600 dark:bg-blue-400" />
                )}
                <Search className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
                <span className="truncate">Detect Threats</span>
              </>
            )}
          </NavLink>

          {/* Detection History Dropdown / Group */}
          {isAuthenticated && (
            <div className="space-y-1 pt-1">
              <button
                type="button"
                onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer ${
                  isHistoryActive
                    ? 'text-blue-700 dark:text-blue-300 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Clock className={`w-4.5 h-4.5 shrink-0 ${isHistoryActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span>Detection History</span>
                </div>
                {isHistoryExpanded ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {/* Sub-items for Email, Text, URL */}
              {isHistoryExpanded && (
                <div className="pl-6 space-y-1">
                  {historySubItems.map((sub) => {
                    const SubIcon = sub.icon;
                    const isSubActive = location.pathname === sub.path;

                    return (
                      <NavLink
                        key={sub.path}
                        to={sub.path}
                        onClick={onClose}
                        className={`relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                          isSubActive
                            ? 'bg-blue-50/90 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200/80 dark:border-blue-800/60 shadow-2xs'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        {isSubActive && (
                          <span className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-3.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                        )}
                        <SubIcon className={`w-3.5 h-3.5 shrink-0 ${isSubActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                        <span className="truncate">{sub.name}</span>
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Profile */}
          {isAuthenticated && (
            <NavLink
              to="/profile"
              onClick={onClose}
              className={({ isActive }) =>
                `relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-50/90 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/60 shadow-2xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-5 rounded-full bg-blue-600 dark:bg-blue-400" />
                  )}
                  <User className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span className="truncate">My Profile</span>
                </>
              )}
            </NavLink>
          )}


        </nav>

        {/* Bottom User / Session / Theme Section */}
        <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/80 space-y-2 bg-slate-50/50 dark:bg-slate-900/30">
          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={() => {
              toggleTheme();
              toast.info(`Switched to ${isDark ? 'Light' : 'Dark'} Mode`);
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700/60"
          >
            <span className="flex items-center gap-2.5">
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400 shrink-0" />
              ) : (
                <Moon className="w-4 h-4 text-blue-600 shrink-0" />
              )}
              <span>{isDark ? 'Dark Theme' : 'Light Theme'}</span>
            </span>
            <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              Toggle
            </span>
          </button>

          {/* Logout / Sign In Action */}
          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => setShowLogoutModal(true)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50/80 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Sign Out</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                onClose?.();
                navigate('/login');
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50/80 dark:hover:bg-blue-950/30 transition-colors cursor-pointer"
            >
              <LogIn className="w-4 h-4 shrink-0" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => !loggingOut && setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
        loading={loggingOut}
        title="Sign Out Confirmation"
        message="Are you sure you want to end your current session? You will need to log in again to access protected history and threat analytics."
        confirmText="Sign Out"
        cancelText="Stay Signed In"
      />
    </>
  );
}
