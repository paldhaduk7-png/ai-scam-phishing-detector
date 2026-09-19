import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Search,
  LayoutDashboard,
  Clock,
  User,
  Home,
  LogIn,
} from 'lucide-react';

export default function BottomNav() {
  const location = useLocation();
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Dynamic navigation items based on authentication state
  const navItems = isAuthenticated
    ? [
        { name: 'Detect', path: '/detect', icon: Search },
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'History', path: '/history', icon: Clock },
        { name: 'Profile', path: '/profile', icon: User },
      ]
    : [
        { name: 'Home', path: '/', icon: Home },
        { name: 'Detect', path: '/detect', icon: Search },
        { name: 'Sign In', path: '/login', icon: LogIn },
      ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 dark:bg-[#0b101b]/95 backdrop-blur-xl border-t border-slate-200/90 dark:border-slate-800/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_25px_rgba(0,0,0,0.5)] transition-colors"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 0.35rem)' }}
    >
      <div className="max-w-md mx-auto px-2 py-1.5 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.path === '/history'
              ? location.pathname.startsWith('/history')
              : location.pathname === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 active:scale-95 group focus-visible:outline-none ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {/* Active top indicator pill */}
              {isActive && (
                <span className="absolute -top-1.5 w-6 h-1 rounded-full bg-blue-600 dark:bg-blue-400 shadow-sm shadow-blue-500/50 animate-fadeIn" />
              )}

              {/* Icon with subtle active background highlight */}
              <div
                className={`p-1 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950/60'
                    : 'group-hover:bg-slate-100 dark:group-hover:bg-slate-800/50'
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-transform duration-150 ${
                    isActive ? 'scale-105' : 'group-hover:scale-105'
                  }`}
                  strokeWidth={isActive ? 2.3 : 1.9}
                />
              </div>

              {/* Label */}
              <span
                className={`text-[11px] tracking-tight leading-none mt-1 truncate ${
                  isActive ? 'font-bold' : 'font-medium'
                }`}
              >
                {item.name}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
