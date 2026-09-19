import React from 'react';
import Card from '../common/Card';
import { Search, Calendar, ChevronDown, RotateCcw } from 'lucide-react';

export default function HistoryFilters({
  channel = 'all',
  typeFilter,
  setTypeFilter,
  sourceFilter = 'all',
  setSourceFilter,
  resultFilter,
  setResultFilter,
  searchQuery,
  setSearchQuery,
  dateFilter,
  setDateFilter,
}) {
  const isFiltered =
    (channel === 'all' && typeFilter !== 'all') ||
    (channel === 'email' && sourceFilter !== 'all') ||
    resultFilter !== 'all' ||
    Boolean(dateFilter) ||
    Boolean(searchQuery.trim());

  const handleReset = () => {
    if (setTypeFilter) setTypeFilter('all');
    if (setSourceFilter) setSourceFilter('all');
    setResultFilter('all');
    setDateFilter('');
    setSearchQuery('');
  };

  const getSearchPlaceholder = () => {
    if (channel === 'email') return 'Search emails, subjects, senders...';
    if (channel === 'sms') return 'Search messages...';
    if (channel === 'url') return 'Search URLs...';
    return 'Search payload content, keywords...';
  };

  return (
    <Card className="p-3.5 sm:p-5 space-y-2.5 sm:space-y-3">
      {/* Email Source Switcher Pills (All / Manual / Gmail) when in Email History */}
      {channel === 'email' && (
        <div className="flex items-center gap-1 p-1 bg-[#0b111e] dark:bg-[#0b111e] rounded-xl max-w-xs border border-slate-800/80">
          <button
            type="button"
            onClick={() => setSourceFilter?.('all')}
            className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              sourceFilter === 'all'
                ? 'bg-slate-700/60 text-blue-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-200'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setSourceFilter?.('manual')}
            className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              sourceFilter === 'manual'
                ? 'bg-slate-700/60 text-blue-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-200'
            }`}
          >
            Manual
          </button>
          <button
            type="button"
            onClick={() => setSourceFilter?.('gmail')}
            className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              sourceFilter === 'gmail'
                ? 'bg-slate-700/60 text-blue-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-200'
            }`}
          >
            <img
              src="https://www.gstatic.com/images/branding/product/1x/gmail_2020q4_48dp.png"
              className="w-3 h-3 object-contain"
              alt=""
            />
            <span>Gmail</span>
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2.5 sm:gap-3 w-full">
        {/* Search Input */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder={getSearchPlaceholder()}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#0b111e] border border-slate-800/80 rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600/50 transition-all"
          />
        </div>

        {/* Filter Controls Row: 2 cols on mobile, 3 cols on tablet, flex on desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex items-center gap-2 sm:gap-2.5">
          {/* Type Filter (only visible when channel === 'all') */}
          {channel === 'all' && (
            <div className="relative sm:w-36 col-span-1">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter?.(e.target.value)}
                className="w-full appearance-none pl-2.5 sm:pl-3 pr-7 sm:pr-8 py-2 bg-[#0b111e] border border-slate-800/80 rounded-xl text-xs font-semibold text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600/50 transition-all cursor-pointer"
              >
                <option value="all">All Channels</option>
                <option value="message">SMS / Message</option>
                <option value="email">Email</option>
                <option value="url">Web URL</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>
          )}

          {/* Result Filter */}
          <div className="relative sm:w-36 col-span-1">
            <select
              value={resultFilter}
              onChange={(e) => setResultFilter(e.target.value)}
              className="w-full appearance-none pl-2.5 sm:pl-3 pr-7 sm:pr-8 py-2 bg-[#0b111e] border border-slate-800/80 rounded-xl text-xs font-semibold text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600/50 transition-all cursor-pointer"
            >
              <option value="all">All Verdicts</option>
              <option value="safe">Safe</option>
              <option value="suspicious">Suspicious</option>
              <option value="phishing">Phishing</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          </div>

          {/* Date Filter */}
          <div className={`relative sm:w-36 ${channel === 'all' ? 'col-span-2 sm:col-span-1' : 'col-span-1'}`}>
            <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full pl-8 pr-2 py-1.5 bg-[#0b111e] border border-slate-800/80 rounded-xl text-xs font-semibold text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600/50 transition-all cursor-pointer"
            />
          </div>

          {/* Clear Filters Reset Button */}
          {isFiltered && (
            <button
              type="button"
              onClick={handleReset}
              className="col-span-2 sm:col-span-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/60 rounded-xl transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}
