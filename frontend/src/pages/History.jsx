import React, { useState, useEffect } from 'react';
import HistoryFilters from '../components/history/HistoryFilters';
import HistoryTable from '../components/history/HistoryTable';
import { getDetectionHistory, deleteDetectionRecord } from '../services/api';

export default function History() {
  const [historyItems, setHistoryItems] = useState([]);
  const [typeFilter, setTypeFilter] = useState('all');
  const [resultFilter, setResultFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await getDetectionHistory({
          type: typeFilter !== 'all' ? typeFilter : undefined,
          result: resultFilter !== 'all' ? resultFilter : undefined,
          date: dateFilter || undefined,
          search: searchQuery || undefined,
          page: currentPage,
        });

        if (response && Array.isArray(response.items)) {
          setHistoryItems(response.items);
          setTotalPages(response.totalPages || 1);
        } else if (Array.isArray(response)) {
          setHistoryItems(response);
        }
      } catch {
        // Backend not yet running; keep honest empty state []
      }
    };

    fetchHistory();
  }, [typeFilter, resultFilter, dateFilter, searchQuery, currentPage]);


  const handleView = (item) => {
    // Ready for future modal view
    alert(`Detection details for item #${item.id || 'N/A'}`);
  };

  const handleDelete = async (item) => {
    if (!window.confirm('Are you sure you want to delete this detection record?')) {
      return;
    }
    try {
      await deleteDetectionRecord(item.id);
      setHistoryItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch {
      alert('Unable to delete record. Backend database is currently offline.');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header matching Screenshot 1 */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Detection History
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          View and manage your past detections.
        </p>
      </div>

      {/* Filters Bar matching Screenshot 1 */}
      <HistoryFilters
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        resultFilter={resultFilter}
        setResultFilter={setResultFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
      />

      {/* Detections Table or Honest Empty State */}
      <HistoryTable
        items={historyItems}
        onView={handleView}
        onDelete={handleDelete}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
