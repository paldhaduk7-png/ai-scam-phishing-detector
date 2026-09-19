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
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Detect', path: '/detect', icon: Search },
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
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/92 dark:bg-[#0a0f1d]/95 backdrop-blur-2xl border-t border-slate-200/80 dark:border-slate-800/80 shadow-[0_-6px_25px_rgba(0,0,0,0.06)] dark:shadow-[0_-6px_30px_rgba(0,0,0,0.6)] transition-all duration-200"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 0.45rem)' }}
    >
      <div className="max-w-md mx-auto px-3 py-1.5 flex items-center justify-around">
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
              className={`relative flex flex-col items-center justify-center py-1 px-3.5 rounded-2xl transition-all duration-150 active:scale-90 group focus-visible:outline-none select-none min-w-[62px] ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {/* Active top indicator glowing pill */}
              {isActive && (
                <span className="absolute -top-1.5 w-7 h-1 rounded-full bg-blue-600 dark:bg-blue-400 shadow-sm shadow-blue-500/60 animate-fadeIn" />
              )}

              {/* Icon Container with subtle active pill backdrop */}
              <div
                className={`p-1.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950/70 shadow-2xs scale-105 ring-1 ring-blue-500/20'
                    : 'group-hover:bg-slate-100 dark:group-hover:bg-slate-800/60'
                }`}
              >
                <Icon
                  className="w-5 h-5 transition-transform duration-150"
                  strokeWidth={isActive ? 2.35 : 1.9}
                />
              </div>

              {/* Label */}
              <span
                className={`text-[10.5px] tracking-tight leading-none mt-1 truncate ${
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
