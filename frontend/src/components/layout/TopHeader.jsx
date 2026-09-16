import React from 'react';
import { useSelector } from 'react-redux';
import { Menu, Search, Bell, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TopHeader({ onToggleSidebar, title }) {
  const { user } = useSelector((state) => state.auth);

  const getInitials = (fullName) => {
    if (!fullName) return 'U';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3.5 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Left Section: Mobile Menu + Search or Page Title */}
        <div className="flex items-center gap-4 flex-1 max-w-xl">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden focus:outline-hidden"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search bar */}
          <div className="relative w-full max-w-md hidden sm:block">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search anything..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
            />
          </div>

          {title && (
            <h1 className="text-lg font-bold text-slate-900 sm:hidden truncate">
              {title}
            </h1>
          )}
        </div>

        {/* Right Section: Notifications + User Profile Area */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Notification Button */}
          <button
            type="button"
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors focus:outline-hidden"
            aria-label="Notifications"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white" />
          </button>

          {/* User Profile Link */}
          <Link
            to="/profile"
            className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all group"
          >
            {user?.profile_photo ? (
              <img
                src={user.profile_photo}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500/20"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-semibold text-xs overflow-hidden ring-2 ring-blue-500/20">
                <span className="font-medium text-slate-200">{getInitials(user?.name)}</span>
              </div>
            )}
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                {user?.name || 'My Account'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
          </Link>
        </div>
      </div>
    </header>
  );
}
