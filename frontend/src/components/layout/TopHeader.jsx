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
  X,
  Mail,
  MessageSquare,
  Link as LinkIcon,
  Clock,
  ArrowRight,
  Loader2,
  Star,
  Settings,
} from 'lucide-react';
import { toast } from 'sonner';
import { logoutUser } from '../../store/slices/authSlice';
import { useTheme } from '../../context/ThemeContext';
import { getDetectionHistory } from '../../services/api';
import ConfirmModal from '../common/ConfirmModal';

export default function TopHeader({ onToggleSidebar, title }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { isDark, toggleTheme } = useTheme();

  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [historyResults, setHistoryResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const menuRef = useRef(null);
  const searchContainerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut: Ctrl+K / Cmd+K to focus search bar, Esc to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setSearchOpen(true);
      } else if (e.key === 'Escape') {
        setSearchOpen(false);
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Debounced search for historical scans
  useEffect(() => {
    const query = searchQuery.trim();
    if (!query) {
      setHistoryResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const response = await getDetectionHistory({ search: query });
        if (response && Array.isArray(response.items)) {
          setHistoryResults(response.items.slice(0, 4));
        } else if (Array.isArray(response)) {
          setHistoryResults(response.slice(0, 4));
        } else {
          setHistoryResults([]);
        }
      } catch {
        setHistoryResults([]);
      } finally {
        setSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const navSuggestions = [
    { label: 'Email Phishing Scanner', hint: 'Scan suspicious emails & phishing lures', path: '/detect?tab=email', icon: Mail },
    { label: 'SMS & Message Scanner', hint: 'Check text messages & prize smishing', path: '/detect?tab=message', icon: MessageSquare },
    { label: 'Malicious URL Scanner', hint: 'Inspect deceptive web domains & links', path: '/detect?tab=url', icon: LinkIcon },
    { label: 'Security Dashboard', hint: 'Threat intelligence & scan telemetry', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Detection History', hint: 'Review historical scans and audit records', path: '/history', icon: Clock },
    { label: 'Starred History', hint: 'Saved & bookmarked threat assessments', path: '/history?tab=starred', icon: Star },
    { label: 'User Account Profile', hint: 'Manage user credentials and settings', path: '/profile', icon: User },
  ];

  const filteredNav = navSuggestions.filter(
    (item) =>
      !searchQuery.trim() ||
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.hint.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchSubmit = (e) => {
    e?.preventDefault?.();
    const query = searchQuery.trim();
    setSearchOpen(false);
    searchInputRef.current?.blur();
    if (query) {
      navigate(`/history?search=${encodeURIComponent(query)}`);
    } else {
      navigate('/history');
    }
  };

  const handleSelectNav = (path) => {
    setSearchOpen(false);
    setSearchQuery('');
    navigate(path);
  };

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
            <div className="relative w-full max-w-md hidden sm:block" ref={searchContainerRef}>
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (!searchOpen) setSearchOpen(true);
                  }}
                  onFocus={() => setSearchOpen(true)}
                  placeholder="Search scans, threats, or history..."
                  className="w-full pl-9 pr-16 py-2 bg-slate-100/70 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-900 focus:bg-white dark:focus:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:border-blue-500 transition-all shadow-2xs"
                />

                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setHistoryResults([]);
                        searchInputRef.current?.focus();
                      }}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md cursor-pointer transition-colors"
                      title="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <kbd className="hidden md:inline-flex text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 shadow-2xs">
                    ⌘K
                  </kbd>
                </div>
              </form>

              {/* Live Search Results Dropdown */}
              {searchOpen && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-[#0f172a] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-[440px] flex flex-col animate-fadeIn backdrop-blur-md">
                  {/* Dropdown Header */}
                  <div className="p-3 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs bg-slate-50/50 dark:bg-slate-900/40">
                    <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">
                      {searchQuery ? `Matching "${searchQuery}"` : 'Quick Navigation & Threat Tools'}
                    </span>
                    {searching && (
                      <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 text-[11px] font-medium">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Searching...
                      </span>
                    )}
                  </div>

                  <div className="overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 max-h-[340px]">
                    {/* Matching Past Scans Section */}
                    {historyResults.length > 0 && (
                      <div className="p-2 space-y-1">
                        <span className="px-2.5 py-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          Past Scans &amp; Threats ({historyResults.length})
                        </span>
                        {historyResults.map((item) => {
                          const isPhishing =
                            item.is_phishing ||
                            item.result === 'phishing' ||
                            item.classification?.toLowerCase().includes('phishing');
                          const isSuspicious =
                            !isPhishing &&
                            (item.is_suspicious || item.result === 'suspicious');
                          const TypeIcon =
                            item.content_type === 'email'
                              ? Mail
                              : item.content_type === 'url'
                              ? LinkIcon
                              : MessageSquare;

                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                setSearchOpen(false);
                                navigate(`/history?search=${encodeURIComponent(item.content ? item.content.substring(0, 30) : '')}`);
                              }}
                              className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors flex items-center justify-between gap-3 group cursor-pointer"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/60 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                  <TypeIcon className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                    {item.content || item.subject || 'Scan record'}
                                  </p>
                                  <p className="text-[10px] text-slate-400 dark:text-slate-500 capitalize">
                                    {item.content_type || 'scan'} &bull; {item.classification || 'Completed'}
                                  </p>
                                </div>
                              </div>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                                  isPhishing
                                    ? 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300'
                                    : isSuspicious
                                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                                    : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                                }`}
                              >
                                {isPhishing ? 'Threat' : isSuspicious ? 'Suspicious' : 'Safe'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Navigation Items */}
                    {filteredNav.length > 0 && (
                      <div className="p-2 space-y-1">
                        <span className="px-2.5 py-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          Navigation Shortcuts
                        </span>
                        {filteredNav.map((navItem, idx) => {
                          const Icon = navItem.icon;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleSelectNav(navItem.path)}
                              className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors flex items-center justify-between gap-3 group cursor-pointer"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shrink-0">
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                    {navItem.label}
                                  </p>
                                  <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                                    {navItem.hint}
                                  </p>
                                </div>
                              </div>
                              <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 flex items-center gap-1 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                Jump <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Submit Full Search Action Button */}
                    {searchQuery.trim() && (
                      <div className="p-2">
                        <button
                          type="button"
                          onClick={handleSearchSubmit}
                          className="w-full text-left p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100/70 dark:hover:bg-blue-900/60 transition-colors flex items-center justify-between gap-2 font-semibold text-xs cursor-pointer"
                        >
                          <span className="flex items-center gap-2 truncate">
                            <Search className="w-3.5 h-3.5 shrink-0" />
                            <span>Search all history for &ldquo;{searchQuery}&rdquo;</span>
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-200/60 dark:bg-blue-900/80 text-blue-800 dark:text-blue-200 shrink-0">
                            ↵ Enter
                          </span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Footer Hint */}
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-900/70 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                    <span>Press <kbd className="font-mono bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1">↵</kbd> to search</span>
                    <span><kbd className="font-mono bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1">ESC</kbd> to dismiss</span>
                  </div>
                </div>
              )}
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
                        <span>My Profile</span>
                      </Link>
                      <Link
                        to="/history?tab=starred"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50/70 dark:hover:bg-amber-950/40 transition-colors"
                      >
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500/20" />
                        <span className="font-semibold">Starred History</span>
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors"
                      >
                        <Settings className="w-4 h-4 text-slate-500" />
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
