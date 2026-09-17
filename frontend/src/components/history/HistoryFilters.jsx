import React from 'react';
import Card from '../common/Card';
import { Search, Calendar, ChevronDown, RotateCcw } from 'lucide-react';

export default function HistoryFilters({
  typeFilter,
  setTypeFilter,
  resultFilter,
  setResultFilter,
  searchQuery,
  setSearchQuery,
  dateFilter,
  setDateFilter,
}) {
  const isFiltered =
    typeFilter !== 'all' ||
    resultFilter !== 'all' ||
    Boolean(dateFilter) ||
    Boolean(searchQuery.trim());

  const handleReset = () => {
    setTypeFilter('all');
    setResultFilter('all');
    setDateFilter('');
    setSearchQuery('');
  };

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 w-full">
        {/* Search Input */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search payload content, keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:flex items-center gap-2.5">
          {/* Type Filter */}
          <div className="relative sm:w-36">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full appearance-none pl-3 pr-8 py-2 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 transition-all cursor-pointer"
            >
              <option value="all">All Channels</option>
              <option value="message">SMS / Message</option>
              <option value="email">Email</option>
              <option value="url">Web URL</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
          </div>

          {/* Result Filter */}
          <div className="relative sm:w-36">
            <select
              value={resultFilter}
              onChange={(e) => setResultFilter(e.target.value)}
              className="w-full appearance-none pl-3 pr-8 py-2 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 transition-all cursor-pointer"
            >
              <option value="all">All Verdicts</option>
              <option value="safe">Safe</option>
              <option value="suspicious">Suspicious</option>
              <option value="phishing">Phishing</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
          </div>

          {/* Date Picker Filter */}
          <div className="relative sm:w-40">
            <div className="relative flex items-center">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
              <input
                type="date"
                value={dateFilter || ''}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full pl-9 pr-2.5 py-2 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 transition-all cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Clear / Reset Filters Button */}
        {isFiltered && (
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer shrink-0"
            title="Reset active filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </Card>
  );
}
