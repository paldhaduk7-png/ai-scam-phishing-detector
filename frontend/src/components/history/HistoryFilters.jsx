import React from 'react';
import { Search, Calendar, ChevronDown } from 'lucide-react';

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
  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 w-full">
      {/* Type Filter */}
      <div className="relative shrink-0 sm:w-40">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="w-full appearance-none pl-3.5 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
        >
          <option value="all">All Types</option>
          <option value="message">Message</option>
          <option value="email">Email</option>
          <option value="url">URL</option>
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      </div>

      {/* Result Filter */}
      <div className="relative shrink-0 sm:w-40">
        <select
          value={resultFilter}
          onChange={(e) => setResultFilter(e.target.value)}
          className="w-full appearance-none pl-3.5 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
        >
          <option value="all">All Results</option>
          <option value="safe">Safe</option>
          <option value="suspicious">Suspicious</option>
          <option value="phishing">Phishing</option>
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      </div>

      {/* Date Picker Button / Input */}
      <div className="relative shrink-0 sm:w-44">
        <div className="relative flex items-center">
          <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="date"
            value={dateFilter || ''}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
          />
        </div>
      </div>

      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
      </div>
    </div>
  );
}
