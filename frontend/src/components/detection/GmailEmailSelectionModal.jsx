import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Search,
  Check,
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Loader2,
  RefreshCw,
  Lock,
  AlertCircle,
} from 'lucide-react';

import { getGmailMessages, getGmailStatus } from '../../services/api';

function GoogleIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

function cleanSender(rawFrom) {
  if (!rawFrom) return { name: 'Unknown Sender', email: '' };
  const match = rawFrom.match(/^(.*?)(?:<(.+?)>)?$/);
  if (!match) return { name: rawFrom, email: '' };
  const name = (match[1] || '').replace(/["']/g, '').trim();
  const email = (match[2] || '').trim();
  return {
    name: name || email || 'Unknown Sender',
    email: email && name && email !== name ? email : '',
  };
}

function formatEmailDate(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const now = new Date();
      const isToday = d.toDateString() === now.toDateString();
      if (isToday) {
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      }
      return d.toLocaleDateString([], { day: 'numeric', month: 'short' });
    }
  } catch {
    // fallback
  }
  return dateStr.slice(0, 10);
}

function getSenderBadge(senderName) {
  const s = (senderName || '').toLowerCase();
  if (s.includes('scamshield')) {
    return { bg: 'bg-blue-600 text-white', label: 'S' };
  }
  if (s.includes('mail delivery') || s.includes('subsystem')) {
    return { bg: 'bg-slate-700 text-slate-200', label: 'M' };
  }
  if (s.includes('amazon')) {
    return { bg: 'bg-black text-amber-400 font-bold', label: 'a' };
  }
  if (s.includes('linkedin')) {
    return { bg: 'bg-[#0077b5] text-white font-bold', label: 'in' };
  }
  if (s.includes('unstop')) {
    return { bg: 'bg-purple-700 text-white', label: 'U' };
  }
  if (s.includes('google')) {
    return { bg: 'bg-white text-slate-900 font-bold', label: 'G', isGoogle: true };
  }
  const colors = [
    'bg-rose-600 text-white',
    'bg-emerald-600 text-white',
    'bg-purple-600 text-white',
    'bg-sky-600 text-white',
    'bg-amber-600 text-white',
    'bg-indigo-600 text-white',
  ];
  const charCode = (senderName || 'E').charCodeAt(0);
  const color = colors[charCode % colors.length];
  return { bg: color, label: (senderName || 'E').charAt(0).toUpperCase() };
}

export default function GmailEmailSelectionModal({
  isOpen,
  onClose,
  onAnalyze,
  connectedEmail: initialEmail,
}) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [connectedEmail, setConnectedEmail] = useState(initialEmail || '');
  const [selectedIds, setSelectedIds] = useState([]);

  // Pagination state: exactly 10 emails per page
  const [currentPage, setCurrentPage] = useState(1);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [pageTokens, setPageTokens] = useState({ 1: null });
  const [pageCache, setPageCache] = useState({});

  const connectedEmailRef = useRef(connectedEmail);
  useEffect(() => {
    connectedEmailRef.current = connectedEmail;
  }, [connectedEmail]);

  // Search, Filter & Sort states
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'selected' | 'unselected'
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' | 'oldest' | 'sender'

  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Debounce search query changes
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 350);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch a specific page of messages from real Gmail API
  const fetchPage = useCallback(
    async (pageNumber, token, query = '') => {
      setLoading(true);
      setError('');
      try {
        const params = {
          max_results: 10,
          maxResults: 10,
        };
        if (token) {
          params.page_token = token;
          params.pageToken = token;
        }
        if (query) {
          params.q = query;
        }

        const res = await getGmailMessages(params);
        const fetchedMessages = res?.messages || res?.emails || [];
        const nextToken = res?.nextPageToken || null;

        setMessages(fetchedMessages);
        setNextPageToken(nextToken);
        setCurrentPage(pageNumber);

        // Cache page result to prevent duplicate calls and enable instant Previous navigation
        setPageCache((prev) => ({
          ...prev,
          [pageNumber]: {
            messages: fetchedMessages,
            nextPageToken: nextToken,
          },
        }));

        // Record token for the next page
        if (nextToken) {
          setPageTokens((prev) => ({
            ...prev,
            [pageNumber + 1]: nextToken,
          }));
        }

        // If connectedEmail is missing, populate it quietly in the background
        if (!connectedEmailRef.current) {
          getGmailStatus()
            .then((statusRes) => {
              if (statusRes?.email) {
                setConnectedEmail(statusRes.email);
              }
            })
            .catch(() => {});
        }
      } catch (err) {
        console.error('Failed to load Gmail messages for modal:', err);
        const detail = err?.response?.data?.detail;
        const errorMsg =
          typeof detail === 'string'
            ? detail
            : Array.isArray(detail)
            ? detail[0]?.msg || 'Validation error while loading messages.'
            : err?.message === 'Network Error'
            ? 'Network error: Cannot reach backend server. Please verify backend is accessible.'
            : 'Failed to load inbox emails from Gmail. Please try again.';
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Refresh current search or inbox: resets to page 1
  const handleRefresh = useCallback(() => {
    setCurrentPage(1);
    setPageTokens({ 1: null });
    setPageCache({});
    setNextPageToken(null);
    fetchPage(1, null, debouncedSearch);
  }, [fetchPage, debouncedSearch]);

  // Navigate to Next page using stored nextPageToken
  const handleNextPage = () => {
    if (!nextPageToken || loading) return;
    const nextPage = currentPage + 1;

    // Check if next page is already in local pageCache
    if (pageCache[nextPage]) {
      const cached = pageCache[nextPage];
      setMessages(cached.messages);
      setNextPageToken(cached.nextPageToken);
      setCurrentPage(nextPage);
      return;
    }

    fetchPage(nextPage, nextPageToken, debouncedSearch);
  };

  // Navigate to Previous page
  const handlePrevPage = () => {
    if (currentPage <= 1 || loading) return;
    const prevPage = currentPage - 1;

    // Check if previous page is already in local pageCache
    if (pageCache[prevPage]) {
      const cached = pageCache[prevPage];
      setMessages(cached.messages);
      setNextPageToken(cached.nextPageToken);
      setCurrentPage(prevPage);
      return;
    }

    const prevToken = pageTokens[prevPage] || null;
    fetchPage(prevPage, prevToken, debouncedSearch);
  };

  // Reset pagination and fetch page 1 when modal opens or when debounced search query changes
  const prevOpenRef = useRef(false);
  useEffect(() => {
    if (isOpen) {
      if (!prevOpenRef.current) {
        // Modal just opened: reset search query, filters, and fetch page 1
        setSearchQuery('');
        setDebouncedSearch('');
        setFilterType('all');
        setSortOrder('newest');
        setCurrentPage(1);
        setPageTokens({ 1: null });
        setPageCache({});
        setNextPageToken(null);
        fetchPage(1, null, '');
      } else {
        // Search query changed while modal is open
        setCurrentPage(1);
        setPageTokens({ 1: null });
        setPageCache({});
        setNextPageToken(null);
        fetchPage(1, null, debouncedSearch);
      }
    }
    prevOpenRef.current = isOpen;
  }, [isOpen, debouncedSearch, fetchPage]);

  useEffect(() => {
    if (initialEmail) {
      setConnectedEmail(initialEmail);
    }
  }, [initialEmail]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Toggle single email selection (preserved across pages)
  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Filtered & Sorted messages on current page
  const processedMessages = useMemo(() => {
    let list = [...messages];

    // Category filter
    if (filterType === 'selected') {
      list = list.filter((m) => selectedIds.includes(m.id));
    } else if (filterType === 'unselected') {
      list = list.filter((m) => !selectedIds.includes(m.id));
    }

    // Sort order
    if (sortOrder === 'oldest') {
      list.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
    } else if (sortOrder === 'sender') {
      list.sort((a, b) => (a.from || '').localeCompare(b.from || ''));
    } else {
      // newest
      list.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    }

    return list;
  }, [messages, filterType, sortOrder, selectedIds]);

  // All uniquely known messages across all loaded/cached pages
  const allLoadedMessages = useMemo(() => {
    const map = new Map();
    Object.values(pageCache).forEach((page) => {
      (page.messages || []).forEach((m) => {
        if (m && m.id) map.set(m.id, m);
      });
    });
    (messages || []).forEach((m) => {
      if (m && m.id) map.set(m.id, m);
    });
    return Array.from(map.values());
  }, [pageCache, messages]);

  // Option 1: Are all visible messages on the CURRENT page selected?
  const allVisibleSelected = useMemo(() => {
    if (processedMessages.length === 0) return false;
    return processedMessages.every((m) => selectedIds.includes(m.id));
  }, [processedMessages, selectedIds]);

  // Option 2: Are all messages across ALL known pages selected?
  const allPagesSelected = useMemo(() => {
    if (allLoadedMessages.length === 0) return false;
    return allLoadedMessages.every((m) => selectedIds.includes(m.id));
  }, [allLoadedMessages, selectedIds]);

  // Toggle selection for current page only (Option 1)
  const toggleSelectCurrentPage = () => {
    if (allVisibleSelected) {
      const visibleIds = new Set(processedMessages.map((m) => m.id));
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.has(id)));
    } else {
      const newIds = processedMessages.map((m) => m.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...newIds])));
    }
  };

  // State to indicate background loading when fetching all remaining pages
  const [isFetchingAllPages, setIsFetchingAllPages] = useState(false);

  // Toggle selection for ALL pages (Option 2: previous, current, next)
  const toggleSelectAllPages = async () => {
    // If all loaded messages are already selected and no remaining pages, deselect all
    if (allPagesSelected && !nextPageToken) {
      setSelectedIds([]);
      return;
    }

    // 1. Immediately select all currently loaded messages across all pages
    const loadedIds = allLoadedMessages.map((m) => m.id);
    setSelectedIds((prev) => Array.from(new Set([...prev, ...loadedIds])));

    // 2. If there are more pages in Gmail inbox, fetch them in background so all pages are selected
    if (nextPageToken && !isFetchingAllPages) {
      setIsFetchingAllPages(true);
      try {
        let currentToken = nextPageToken;
        const existingPageNumbers = Object.keys(pageCache).map(Number);
        let pNum = (existingPageNumbers.length > 0 ? Math.max(...existingPageNumbers) : currentPage) + 1;

        // Fetch up to 10 additional pages (up to 100 emails)
        for (let i = 0; i < 10 && currentToken; i++) {
          const res = await getGmailMessages({
            max_results: 10,
            maxResults: 10,
            page_token: currentToken,
            pageToken: currentToken,
            ...(debouncedSearch ? { q: debouncedSearch } : {}),
          });

          const fetched = res?.messages || res?.emails || [];
          const token = res?.nextPageToken || null;

          if (fetched.length > 0) {
            setPageCache((prev) => ({
              ...prev,
              [pNum]: { messages: fetched, nextPageToken: token },
            }));
            const ids = fetched.map((m) => m.id);
            setSelectedIds((prev) => Array.from(new Set([...prev, ...ids])));
            pNum++;
          }

          currentToken = token;
          if (!currentToken) break;
        }

        setNextPageToken(currentToken);
      } catch (err) {
        console.error('Failed to fetch all remaining Gmail pages:', err);
      } finally {
        setIsFetchingAllPages(false);
      }
    }
  };

  const handleStartAnalysis = () => {
    if (selectedIds.length === 0) return;
    onAnalyze(selectedIds);
    onClose();
  };


  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const userInitial = (connectedEmail || 'P').charAt(0).toUpperCase();

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
      }}
    >
      {/* Dimmed backdrop covering full screen */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
        }}
        onClick={onClose}
      />

      {/* Centered Modal Container */}
      <div
        className="relative w-full max-w-3xl bg-white dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800/90 rounded-2xl sm:rounded-3xl shadow-2xl shadow-slate-400/20 dark:shadow-black/95 flex flex-col max-h-[90vh] z-10 overflow-hidden text-slate-800 dark:text-slate-200 my-auto animate-fadeIn"
        onClick={(e) => {
          e.stopPropagation();
          setShowFilterDropdown(false);
          setShowSortDropdown(false);
        }}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 pb-4 flex items-start justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0 p-2 shadow-xs">
              <img
                src="https://www.gstatic.com/images/branding/product/1x/gmail_2020q4_48dp.png"
                alt="Gmail"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-950 dark:text-white tracking-tight">
                Choose Gmail Emails to Analyze
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Select the emails you want to scan with ScamShield AI
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Account Section */}
        <div className="px-5 sm:px-6 pt-4 pb-2">
          <div className="bg-slate-50 dark:bg-[#121c33] border border-slate-200 dark:border-slate-800/90 rounded-xl p-3 sm:p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-purple-700/80 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-inner">
                {userInitial}
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                  {connectedEmail || 'paldhaduk18@gmail.com'}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <Lock className="w-3 h-3 text-slate-400" />
                  <span>Gmail • Read-only access</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                // Reserved for future multi-account switcher
              }}
              className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-[#192748] hover:bg-blue-100 dark:hover:bg-[#20325d] text-blue-700 dark:text-blue-300 text-xs font-semibold border border-blue-200 dark:border-blue-600/30 flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
            >
              <span>Switch Account</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-80" />
            </button>
          </div>
        </div>

        {/* Search / Filter / Sort Bar */}
        <div className="px-5 sm:px-6 py-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 relative">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search emails by sender, subject, or keywords..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#121c33] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Controls: Filter & Sort */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Filter Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFilterDropdown(!showFilterDropdown);
                  setShowSortDropdown(false);
                }}
                className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#121c33] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>
                  {filterType === 'selected'
                    ? 'Selected Only'
                    : filterType === 'unselected'
                    ? 'Unselected Only'
                    : 'All Emails'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>

              {showFilterDropdown && (
                <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1 z-30 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setFilterType('all');
                      setShowFilterDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 ${
                      filterType === 'all' ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    All Emails
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFilterType('selected');
                      setShowFilterDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 ${
                      filterType === 'selected' ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    Selected Only
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFilterType('unselected');
                      setShowFilterDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 ${
                      filterType === 'unselected' ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    Unselected Only
                  </button>
                </div>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSortDropdown(!showSortDropdown);
                  setShowFilterDropdown(false);
                }}
                className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#121c33] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {sortOrder === 'oldest'
                    ? 'Oldest First'
                    : sortOrder === 'sender'
                    ? 'Sender (A-Z)'
                    : 'Newest First'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>

              {showSortDropdown && (
                <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1 z-30 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setSortOrder('newest');
                      setShowSortDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 ${
                      sortOrder === 'newest' ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    Newest First
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSortOrder('oldest');
                      setShowSortDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 ${
                      sortOrder === 'oldest' ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    Oldest First
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSortOrder('sender');
                      setShowSortDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 ${
                      sortOrder === 'sender' ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    Sender (A-Z)
                  </button>
                </div>
              )}
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={handleRefresh}
              disabled={loading}
              title="Refresh inbox"
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>


        {/* Banner when all on this page are selected but not all pages */}
        {allVisibleSelected && !allPagesSelected && (
          <div className="px-5 sm:px-6 py-2 bg-blue-50/80 dark:bg-gradient-to-r dark:from-blue-950/60 dark:to-indigo-950/50 border-b border-blue-200/80 dark:border-blue-900/40 flex items-center justify-between gap-3 text-xs text-blue-900 dark:text-blue-200 animate-fadeIn">
            <span className="flex items-center gap-1.5 truncate">
              <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>
                All <strong className="text-slate-900 dark:text-white font-mono">{processedMessages.length}</strong> emails on Page {currentPage} are selected.
              </span>
            </span>
            <button
              type="button"
              onClick={toggleSelectAllPages}
              disabled={isFetchingAllPages}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold underline shrink-0 cursor-pointer transition-colors"
            >
              {isFetchingAllPages ? (
                <span className="inline-flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin text-blue-600 dark:text-blue-400" />
                  <span>Loading all pages...</span>
                </span>
              ) : (
                `Select all ${allLoadedMessages.length}${nextPageToken ? '+' : ''} emails across all pages`
              )}
            </button>
          </div>
        )}

        {/* Scrollable Email List Container */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-2 divide-y divide-slate-100 dark:divide-slate-800/80 min-h-[260px] max-h-[380px] sm:max-h-[420px]">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Loading inbox emails from Gmail...</p>
            </div>
          ) : error ? (
            <div className="py-12 text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
              <p className="text-xs sm:text-sm text-rose-600 dark:text-rose-400 max-w-md mx-auto">{error}</p>
              <button
                type="button"
                onClick={handleRefresh}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg cursor-pointer transition-colors"
              >
                Retry
              </button>
            </div>
          ) : processedMessages.length === 0 ? (
            <div className="py-16 text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {searchQuery ? 'No emails match your search filter.' : 'Your connected Gmail inbox is empty.'}
            </div>
          ) : (
            processedMessages.map((msg) => {
              const isSelected = selectedIds.includes(msg.id);
              const sender = cleanSender(msg.from);
              const badge = getSenderBadge(sender.name);
              const dateText = formatEmailDate(msg.date);

              return (
                <div
                  key={msg.id}
                  onClick={() => toggleSelect(msg.id)}
                  className={`flex items-start gap-3.5 py-3 px-3 rounded-xl transition-colors cursor-pointer select-none ${
                    isSelected
                      ? 'bg-blue-50/90 dark:bg-[#152342]/90 border border-blue-200 dark:border-blue-600/40'
                      : 'hover:bg-slate-50 dark:hover:bg-[#111a2f]/60 border border-transparent'
                  }`}
                >
                  {/* Checkbox and active dot */}
                  <div className="flex items-center gap-1.5 pt-1 shrink-0">
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'border border-slate-300 dark:border-slate-600 hover:border-slate-400 bg-white dark:bg-slate-900/50'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />}
                  </div>

                  {/* Sender Avatar Badge */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${badge.bg}`}
                  >
                    {badge.isGoogle ? (
                      <GoogleIcon className="w-4 h-4" />
                    ) : (
                      badge.label
                    )}
                  </div>

                  {/* Email Content Info */}
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                        {sender.name}
                      </span>
                      {dateText && (
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 shrink-0 font-mono">
                          {dateText}
                        </span>
                      )}
                    </div>

                    <div className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">
                      {msg.subject || 'No Subject'}
                    </div>

                    {msg.snippet && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 leading-relaxed">
                        {msg.snippet}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination Controls Bar */}
        <div className="px-5 sm:px-6 py-2.5 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50 dark:bg-[#0c1324] flex items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span>
              Page <strong className="text-slate-900 dark:text-white font-mono">{currentPage}</strong>
            </span>
            <span className="text-slate-400 dark:text-slate-600">•</span>
            <span>
              {processedMessages.length} {processedMessages.length === 1 ? 'email' : 'emails'} shown
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrevPage}
              disabled={currentPage <= 1 || loading}
              className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#131d35] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700/60 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 transition-colors cursor-pointer"
              title="Previous page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <div className="px-2.5 py-1 rounded-md bg-blue-50 dark:bg-[#18233f] text-blue-700 dark:text-blue-400 font-bold font-mono min-w-[28px] text-center border border-blue-200 dark:border-blue-600/30">
              {currentPage}
            </div>

            <button
              type="button"
              onClick={handleNextPage}
              disabled={!nextPageToken || loading}
              className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#131d35] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700/60 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 transition-colors cursor-pointer"
              title="Next page"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200/80 dark:border-slate-800/90 flex flex-col md:flex-row items-center justify-between gap-3 bg-white dark:bg-[#0a0f1d]">
          {/* Two Selection Options (This Page vs All Pages) & Selection Counter */}
          <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto flex-wrap">
            {/* Option 1: Select This Page Only */}
            <button
              type="button"
              onClick={toggleSelectCurrentPage}
              disabled={processedMessages.length === 0}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border select-none disabled:opacity-40 disabled:cursor-not-allowed ${
                allVisibleSelected
                  ? 'bg-blue-50 dark:bg-blue-600/25 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-500/60 shadow-xs'
                  : 'bg-slate-50 dark:bg-[#131d35] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border-slate-200 dark:border-slate-700/70 hover:border-slate-300 dark:hover:border-slate-500'
              }`}
              title="Select or deselect only emails on the current page"
            >
              <div
                className={`w-3.5 h-3.5 rounded flex items-center justify-center transition-colors ${
                  allVisibleSelected
                    ? 'bg-blue-600 text-white'
                    : 'border border-slate-400 dark:border-slate-500'
                }`}
              >
                {allVisibleSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
              </div>
              <span>This Page ({processedMessages.length})</span>
            </button>

            {/* Option 2: Select All Pages (Previous, Current, Next) */}
            <button
              type="button"
              onClick={toggleSelectAllPages}
              disabled={allLoadedMessages.length === 0 || isFetchingAllPages}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border select-none disabled:opacity-40 disabled:cursor-not-allowed ${
                allPagesSelected
                  ? 'bg-indigo-50 dark:bg-indigo-600/25 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-500/60 shadow-xs'
                  : 'bg-slate-50 dark:bg-[#131d35] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border-slate-200 dark:border-slate-700/70 hover:border-slate-300 dark:hover:border-slate-500'
              }`}
              title="Select all emails across all pages (previous, current, and next)"
            >
              <div
                className={`w-3.5 h-3.5 rounded flex items-center justify-center transition-colors ${
                  allPagesSelected
                    ? 'bg-indigo-600 text-white'
                    : 'border border-slate-400 dark:border-slate-500'
                }`}
              >
                {allPagesSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
              </div>
              <span>
                {isFetchingAllPages ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Loader2 className="w-3 h-3 animate-spin text-indigo-600 dark:text-indigo-400" />
                    <span>Loading all pages...</span>
                  </span>
                ) : (
                  `All Pages (${allLoadedMessages.length}${nextPageToken ? '+' : ''})`
                )}
              </span>
            </button>

            {/* Selection Counter & Clear Action */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 pl-1">
              <span>
                Selected:{' '}
                <strong className="text-blue-600 dark:text-blue-400 font-bold font-mono">
                  {selectedIds.length}
                </strong>{' '}
                {selectedIds.length === 1 ? 'email' : 'emails'}
              </span>
              {selectedIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
                  className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 underline cursor-pointer ml-1 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>


          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-[#131d35] hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700/60 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleStartAnalysis}
              disabled={selectedIds.length === 0}
              className="flex-1 sm:flex-initial px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>
                {selectedIds.length > 0
                  ? `Analyze Selected (${selectedIds.length})`
                  : 'Analyze Selected Emails'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
}

