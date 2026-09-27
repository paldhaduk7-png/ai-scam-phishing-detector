import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  ShieldCheck,
  UserCheck,
  Clock,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Eye,
  Mail,
  Shield,
  Calendar,
  AlertCircle,
  Info,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ShieldAlert,
  Loader2,
  ShieldOff,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getAdminStats,
  getAdminUsers,
  getAdminDeletedUsers,
  getAdminGmailRequests,
  approveAdminGmailRequest,
  rejectAdminGmailRequest,
  revokeAdminGmailRequest,
  revokeUserGmailAccess,
  grantUserGmailAccess,
  resetUserGmailAccess,
  getUserGmailHistory,
  softDeleteUser,
  restoreUser,
  permanentDeleteUser,
  getAdminAuditLogs,
} from '../services/api';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'requests' | 'all' | 'admins' | 'standard' | 'deleted' | 'audit'

  // Stats state
  const [stats, setStats] = useState({
    active_users: 0,
    pending_requests: 0,
    admin_users: 0,
    standard_users: 0,
    deleted_users: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Users Directory state
  const [users, setUsers] = useState([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotalPages, setUsersTotalPages] = useState(1);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersSearch, setUsersSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [gmailFilter, setGmailFilter] = useState('all');

  // Requests state
  const [requests, setRequests] = useState([]);
  const [requestsTotal, setRequestsTotal] = useState(0);
  const [requestsPage, setRequestsPage] = useState(1);
  const [requestsTotalPages, setRequestsTotalPages] = useState(1);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestStatusFilter, setRequestStatusFilter] = useState('all');
  const [requestSearch, setRequestSearch] = useState('');

  // Deleted Users state
  const [deletedUsers, setDeletedUsers] = useState([]);
  const [deletedTotal, setDeletedTotal] = useState(0);
  const [deletedPage, setDeletedPage] = useState(1);
  const [deletedTotalPages, setDeletedTotalPages] = useState(1);
  const [deletedLoading, setDeletedLoading] = useState(false);

  // Audit Logs state
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditTotal, setAuditTotal] = useState(0);
  const [auditPage, setAuditPage] = useState(1);
  const [auditTotalPages, setAuditTotalPages] = useState(1);
  const [auditLoading, setAuditLoading] = useState(false);

  // Interactive Modals
  const [approveModalReq, setApproveModalReq] = useState(null);
  const [rejectModalReq, setRejectModalReq] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [revokeModalReq, setRevokeModalReq] = useState(null);
  const [revokeReason, setRevokeReason] = useState('');
  const [revokeTargetUser, setRevokeTargetUser] = useState(null);
  const [userRevokeReason, setUserRevokeReason] = useState('');
  const [accessManageUser, setAccessManageUser] = useState(null);
  const [accessManageAction, setAccessManageAction] = useState('grant'); // 'grant' | 'revoke'
  const [manualGrantEmails, setManualGrantEmails] = useState('');
  const [manualGrantNote, setManualGrantNote] = useState('');
  const [accessManageLoading, setAccessManageLoading] = useState(false);
  const [softDeleteTarget, setSoftDeleteTarget] = useState(null);
  const [restoreTarget, setRestoreTarget] = useState(null);
  const [permanentDeleteTarget, setPermanentDeleteTarget] = useState(null);
  const [historyUser, setHistoryUser] = useState(null);
  const [historyList, setHistoryList] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [submittingAction, setSubmittingAction] = useState(false);

  // 1. Fetch live DB statistics
  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const data = await getAdminStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch admin stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // 2. Fetch users directory
  const fetchUsers = useCallback(async () => {
    try {
      setUsersLoading(true);
      const params = {
        search: usersSearch.trim() || undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        account_status: statusFilter !== 'all' ? statusFilter : undefined,
        gmail_access_status: gmailFilter !== 'all' ? gmailFilter : undefined,
        page: usersPage,
        limit: 10,
      };
      const res = await getAdminUsers(params);
      setUsers(res.users || []);
      setUsersTotal(res.total || 0);
      setUsersTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error('Failed to load users:', err);
      toast.error('Failed to load user records.');
    } finally {
      setUsersLoading(false);
    }
  }, [usersSearch, roleFilter, statusFilter, gmailFilter, usersPage]);

  // 3. Fetch Gmail access requests
  const fetchRequests = useCallback(async () => {
    try {
      setRequestsLoading(true);
      const params = {
        status: requestStatusFilter !== 'all' ? requestStatusFilter : undefined,
        search: requestSearch.trim() || undefined,
        page: requestsPage,
        limit: 10,
      };
      const res = await getAdminGmailRequests(params);
      setRequests(res.requests || []);
      setRequestsTotal(res.total || 0);
      setRequestsTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error('Failed to load requests:', err);
      toast.error('Failed to load Gmail access requests.');
    } finally {
      setRequestsLoading(false);
    }
  }, [requestStatusFilter, requestSearch, requestsPage]);

  // 4. Fetch soft-deleted users
  const fetchDeletedUsers = useCallback(async () => {
    try {
      setDeletedLoading(true);
      const res = await getAdminDeletedUsers({ page: deletedPage, limit: 10 });
      setDeletedUsers(res.users || []);
      setDeletedTotal(res.total || 0);
      setDeletedTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error('Failed to load deleted users:', err);
      toast.error('Failed to load trash records.');
    } finally {
      setDeletedLoading(false);
    }
  }, [deletedPage]);

  // 5. Fetch audit logs
  const fetchAuditLogs = useCallback(async () => {
    try {
      setAuditLoading(true);
      const res = await getAdminAuditLogs({ page: auditPage, limit: 15 });
      setAuditLogs(res.logs || []);
      setAuditTotal(res.total || 0);
      setAuditTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setAuditLoading(false);
    }
  }, [auditPage]);

  // Initial mount load
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Tab switch reaction
  useEffect(() => {
    if (activeTab === 'overview') {
      fetchStats();
      fetchRequests();
      fetchAuditLogs();
    } else if (activeTab === 'requests') {
      fetchRequests();
    } else if (activeTab === 'all') {
      fetchUsers();
    } else if (activeTab === 'admins') {
      setRoleFilter('admin');
      fetchUsers();
    } else if (activeTab === 'standard') {
      setRoleFilter('user');
      fetchUsers();
    } else if (activeTab === 'deleted') {
      fetchDeletedUsers();
    } else if (activeTab === 'audit') {
      fetchAuditLogs();
    }
  }, [activeTab, fetchStats, fetchRequests, fetchUsers, fetchDeletedUsers, fetchAuditLogs]);

  // Format date helper
  const formatDate = (isoString) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  // Action: Approve Request
  const handleApprove = async () => {
    if (!approveModalReq) return;
    setSubmittingAction(true);
    try {
      await approveAdminGmailRequest(approveModalReq.id);
      toast.success(`Approved Gmail access for ${approveModalReq.user_name}.`);
      setApproveModalReq(null);
      fetchRequests();
      fetchStats();
      if (activeTab === 'all' || activeTab === 'standard') fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Approval failed.');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Action: Reject Request
  const handleReject = async () => {
    if (!rejectModalReq) return;
    setSubmittingAction(true);
    try {
      await rejectAdminGmailRequest(rejectModalReq.id, {
        reason: rejectionReason.trim() || undefined,
      });
      toast.success(`Rejected Gmail request for ${rejectModalReq.user_name}.`);
      setRejectModalReq(null);
      setRejectionReason('');
      fetchRequests();
      fetchStats();
      if (activeTab === 'all' || activeTab === 'standard') fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Rejection failed.');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Action: Revoke Request
  const handleRevoke = async () => {
    if (!revokeModalReq) return;
    setSubmittingAction(true);
    try {
      await revokeAdminGmailRequest(revokeModalReq.id, {
        reason: revokeReason.trim() || undefined,
      });
      toast.success(`Revoked Gmail access for ${revokeModalReq.user_name}.`);
      setRevokeModalReq(null);
      setRevokeReason('');
      fetchRequests();
      fetchStats();
      if (activeTab === 'all' || activeTab === 'standard') fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Revocation failed.');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Action: Directly Revoke User Gmail Access by Admin
  const handleRevokeUserGmail = async () => {
    if (!revokeTargetUser) return;
    setSubmittingAction(true);
    try {
      await revokeUserGmailAccess(revokeTargetUser.id, {
        reason: userRevokeReason.trim() || undefined,
      });
      toast.success(`Revoked Gmail access authority for ${revokeTargetUser.name}.`);
      setRevokeTargetUser(null);
      setUserRevokeReason('');
      fetchUsers();
      fetchStats();
      fetchRequests();
      if (historyUser && historyUser.id === revokeTargetUser.id) {
        handleOpenHistory(revokeTargetUser);
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to revoke Gmail access.');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Action: Open Quick Manual Gmail Access Management Popup for any user
  const handleOpenAccessManage = (user) => {
    setAccessManageUser(user);
    const isApproved = user.gmail_access_status === 'APPROVED';
    setAccessManageAction(isApproved ? 'revoke' : 'grant');

    let emails = [];
    if (user.approved_emails && user.approved_emails.length > 0) {
      emails = user.approved_emails;
    } else if (user.requested_emails && user.requested_emails.length > 0) {
      emails = user.requested_emails;
    } else if (user.email) {
      emails = [user.email];
    }
    setManualGrantEmails(emails.join(', '));
    setManualGrantNote('');
  };

  // Action: Submit Manual Access Action (Grant, Revoke, or Reset)
  const handleSubmitAccessManage = async (mode) => {
    if (!accessManageUser) return;
    setAccessManageLoading(true);
    try {
      if (mode === 'grant') {
        const emails = manualGrantEmails
          .split(',')
          .map((e) => e.trim())
          .filter(Boolean);

        await grantUserGmailAccess(accessManageUser.id, {
          emails: emails.length > 0 ? emails : [accessManageUser.email],
          note: manualGrantNote.trim() || undefined,
        });
        toast.success(`Granted Gmail access to ${accessManageUser.name} (${accessManageUser.email}).`);
      } else if (mode === 'revoke') {
        await revokeUserGmailAccess(accessManageUser.id, {
          reason: manualGrantNote.trim() || undefined,
        });
        toast.success(`Revoked Gmail access for ${accessManageUser.name}.`);
      } else if (mode === 'reset') {
        await resetUserGmailAccess(accessManageUser.id, {
          reason: manualGrantNote.trim() || undefined,
        });
        toast.success(`Reset Gmail access status for ${accessManageUser.name} to NOT_REQUESTED.`);
      }

      setAccessManageUser(null);
      fetchUsers();
      fetchStats();
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update access status.');
    } finally {
      setAccessManageLoading(false);
    }
  };

  // Action: Soft Delete User
  const handleSoftDelete = async () => {
    if (!softDeleteTarget) return;
    setSubmittingAction(true);
    try {
      await softDeleteUser(softDeleteTarget.id);
      toast.success(`User ${softDeleteTarget.name} deactivated.`);
      setSoftDeleteTarget(null);
      fetchUsers();
      fetchStats();
      if (activeTab === 'deleted') fetchDeletedUsers();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to soft delete user.');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Action: Restore User
  const handleRestore = async () => {
    if (!restoreTarget) return;
    setSubmittingAction(true);
    try {
      await restoreUser(restoreTarget.id);
      toast.success(`User ${restoreTarget.name} restored to active status.`);
      setRestoreTarget(null);
      fetchDeletedUsers();
      fetchStats();
      if (activeTab === 'all' || activeTab === 'standard' || activeTab === 'admins') fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to restore user.');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Action: Permanent Delete User
  const handlePermanentDelete = async () => {
    if (!permanentDeleteTarget) return;
    setSubmittingAction(true);
    try {
      await permanentDeleteUser(permanentDeleteTarget.id);
      toast.success(`User ${permanentDeleteTarget.name} permanently deleted.`);
      setPermanentDeleteTarget(null);
      fetchDeletedUsers();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to permanently delete user.');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Action: Inspect User Gmail Access History
  const handleOpenHistory = async (user) => {
    setHistoryUser(user);
    setHistoryLoading(true);
    try {
      const records = await getUserGmailHistory(user.id);
      setHistoryList(records || []);
    } catch (err) {
      toast.error('Failed to load user access history.');
    } finally {
      setHistoryLoading(false);
    }
  };

  // Status Badge Component
  const renderStatusBadge = (statusVal) => {
    const s = (statusVal || '').toUpperCase();
    if (s === 'APPROVED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          APPROVED
        </span>
      );
    }
    if (s === 'PENDING') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
          PENDING
        </span>
      );
    }
    if (s === 'REJECTED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          REJECTED
        </span>
      );
    }
    if (s === 'REVOKED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
          REVOKED
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
        NOT_REQUESTED
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border border-rose-200/60 dark:border-rose-800/40 px-2.5 py-0.5 rounded-full font-mono">
              <ShieldAlert className="w-3.5 h-3.5" />
              Administrative Operations
            </span>
            <span className="inline-flex items-center text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/40 px-2.5 py-0.5 rounded-full font-mono">
              Access Control & User Directory
            </span>
          </div>
          <h1 className="text-xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight mt-1">
            Admin Management Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
            Real-time user authorization, Gmail OAuth permissions review, account deactivation, and security audit log.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            fetchStats();
            if (activeTab === 'requests' || activeTab === 'overview') fetchRequests();
            if (activeTab === 'all' || activeTab === 'admins' || activeTab === 'standard') fetchUsers();
            if (activeTab === 'deleted') fetchDeletedUsers();
            if (activeTab === 'audit') fetchAuditLogs();
            toast.info('Data refreshed from PostgreSQL.');
          }}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors cursor-pointer border border-slate-200/60 dark:border-slate-700"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sync Real Data</span>
        </button>
      </div>

      {/* 5 Real Metric Cards (Navigate/Filter to sections) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* 1. ACTIVE USERS */}
        <div
          onClick={() => {
            setActiveTab('all');
            setStatusFilter('active');
            setRoleFilter('all');
          }}
          className="group p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0b111e] border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:border-blue-500/50 hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Users
            </span>
            <Users className="w-4.5 h-4.5 text-blue-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
            {statsLoading ? '...' : stats.active_users}
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Live active accounts</p>
        </div>

        {/* 2. PENDING REQUESTS */}
        <div
          onClick={() => {
            setActiveTab('requests');
            setRequestStatusFilter('pending');
          }}
          className="group p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0b111e] border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:border-amber-500/50 hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Pending
            </span>
            <Clock className="w-4.5 h-4.5 text-amber-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400 font-mono">
            {statsLoading ? '...' : stats.pending_requests}
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Awaiting admin review</p>
        </div>

        {/* 3. ADMINS */}
        <div
          onClick={() => {
            setActiveTab('admins');
            setRoleFilter('admin');
            setStatusFilter('active');
          }}
          className="group p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0b111e] border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:border-indigo-500/50 hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Admins
            </span>
            <ShieldCheck className="w-4.5 h-4.5 text-indigo-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
            {statsLoading ? '...' : stats.admin_users}
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Full privileged roles</p>
        </div>

        {/* 4. STANDARD USERS */}
        <div
          onClick={() => {
            setActiveTab('standard');
            setRoleFilter('user');
            setStatusFilter('active');
          }}
          className="group p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0b111e] border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:border-emerald-500/50 hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Standard
            </span>
            <UserCheck className="w-4.5 h-4.5 text-emerald-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
            {statsLoading ? '...' : stats.standard_users}
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Standard user accounts</p>
        </div>

        {/* 5. DELETED USERS */}
        <div
          onClick={() => setActiveTab('deleted')}
          className="group p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0b111e] border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:border-rose-500/50 hover:shadow-md transition-all cursor-pointer col-span-2 sm:col-span-1"
        >
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Deleted
            </span>
            <Trash2 className="w-4.5 h-4.5 text-rose-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400 font-mono">
            {statsLoading ? '...' : stats.deleted_users}
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">30-day trash retention</p>
        </div>
      </div>

      {/* Main Admin Tab Navigation Bar */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 dark:bg-[#070b13] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview' },
          {
            id: 'requests',
            label: 'Gmail Access Requests',
            badge: stats.pending_requests > 0 ? stats.pending_requests : null,
          },
          { id: 'all', label: 'All Users' },
          { id: 'admins', label: 'Admins' },
          { id: 'standard', label: 'Standard Users' },
          { id: 'deleted', label: 'Deleted Users' },
          { id: 'audit', label: 'Audit Trail' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setActiveTab(tab.id);
              if (tab.id === 'all') {
                setRoleFilter('all');
                setStatusFilter('all');
              } else if (tab.id === 'admins') {
                setRoleFilter('admin');
                setStatusFilter('active');
              } else if (tab.id === 'standard') {
                setRoleFilter('user');
                setStatusFilter('active');
              }
            }}
            className={`py-2 px-3.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <span>{tab.label}</span>
            {tab.badge && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white font-mono">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB CONTENT: 1. OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Google Cloud Notice Box (Transparency Rule) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-950 dark:text-blue-200">
              <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>Google OAuth & ScamShield Access Architecture Note</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              ScamShield approval enforces our internal application security permissions. When approving users, ensure their Gmail accounts are also registered as authorized test users in your Google Cloud Console OAuth consent screen if the Google Project is in development/testing mode.
            </p>
          </div>

          {/* Quick Pending Requests Overview Card */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0b111e] border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Recent Gmail Access Requests
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Users awaiting administrator authorization to import and analyze Gmail inboxes.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('requests')}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                View all ({requestsTotal}) →
              </button>
            </div>

            {requestsLoading ? (
              <div className="py-8 flex justify-center text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            ) : requests.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No access requests currently submitted.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-semibold border-y border-slate-200/80 dark:border-slate-800/80">
                    <tr>
                      <th className="py-2.5 px-3">User</th>
                      <th className="py-2.5 px-3">Requested Addresses</th>
                      <th className="py-2.5 px-3">Submitted</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {requests.slice(0, 5).map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="py-3 px-3">
                          <p className="font-semibold text-slate-900 dark:text-white">{req.user_name}</p>
                          <p className="text-[11px] text-slate-400">{req.user_email}</p>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex flex-wrap gap-1">
                            {req.requested_emails.map((e, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                              >
                                {e}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-500 dark:text-slate-400">
                          {formatDate(req.requested_at)}
                        </td>
                        <td className="py-3 px-3">{renderStatusBadge(req.status)}</td>
                        <td className="py-3 px-3 text-right">
                          {req.status === 'PENDING' && (
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setApproveModalReq(req)}
                                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => setRejectModalReq(req)}
                                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                          {req.status === 'APPROVED' && (
                            <button
                              type="button"
                              onClick={() => setRevokeModalReq(req)}
                              className="px-2 py-1 text-xs font-medium rounded-lg text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 cursor-pointer"
                            >
                              Revoke
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: 2. GMAIL ACCESS REQUESTS */}
      {activeTab === 'requests' && (
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0b111e] border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={requestSearch}
                onChange={(e) => {
                  setRequestSearch(e.target.value);
                  setRequestsPage(1);
                }}
                placeholder="Search user or email..."
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#070b13] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={requestStatusFilter}
                onChange={(e) => {
                  setRequestStatusFilter(e.target.value);
                  setRequestsPage(1);
                }}
                className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#070b13] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="revoked">Revoked</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {requestsLoading ? (
            <div className="py-12 flex justify-center text-slate-400">
              <Loader2 className="w-7 h-7 animate-spin text-blue-500" />
            </div>
          ) : requests.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No Gmail access requests matching current filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-semibold border-y border-slate-200/80 dark:border-slate-800/80">
                  <tr>
                    <th className="py-3 px-3">Requesting User</th>
                    <th className="py-3 px-3">Login Email</th>
                    <th className="py-3 px-3">Requested Gmail Address(es)</th>
                    <th className="py-3 px-3">Count</th>
                    <th className="py-3 px-3">Request Date</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Reviewed At</th>
                    <th className="py-3 px-3">Reviewed By</th>
                    <th className="py-3 px-3">Reason / Note</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {requests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                        {req.user_name}
                      </td>
                      <td className="py-3 px-3 text-slate-500 dark:text-slate-400 font-mono">
                        {req.user_email}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {req.requested_emails.map((em, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                            >
                              {em}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold">{req.requested_count}</td>
                      <td className="py-3 px-3 text-slate-500">{formatDate(req.requested_at)}</td>
                      <td className="py-3 px-3">{renderStatusBadge(req.status)}</td>
                      <td className="py-3 px-3 text-slate-500">{formatDate(req.reviewed_at)}</td>
                      <td className="py-3 px-3 text-slate-500">{req.reviewer_name || '—'}</td>
                      <td className="py-3 px-3 text-slate-500 max-w-[150px] truncate" title={req.rejection_reason || req.admin_note}>
                        {req.rejection_reason || req.admin_note || '—'}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {req.status === 'PENDING' && (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setApproveModalReq(req)}
                              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => setRejectModalReq(req)}
                              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {req.status === 'APPROVED' && (
                          <button
                            type="button"
                            onClick={() => setRevokeModalReq(req)}
                            className="px-2 py-1 text-xs font-medium rounded-lg text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 cursor-pointer"
                          >
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {requestsTotalPages > 1 && (
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500">
                Page {requestsPage} of {requestsTotalPages} ({requestsTotal} total)
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={requestsPage <= 1}
                  onClick={() => setRequestsPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={requestsPage >= requestsTotalPages}
                  onClick={() => setRequestsPage((p) => Math.min(requestsTotalPages, p + 1))}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: 3. ALL USERS / ADMINS / STANDARD USERS */}
      {['all', 'admins', 'standard'].includes(activeTab) && (
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0b111e] border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
          {/* Header Note for Admins tab */}
          {activeTab === 'admins' && (
            <div className="p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/40 text-xs text-indigo-900 dark:text-indigo-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>
                  <strong>Last Administrator Protection Active:</strong> System safeguards prevent accidental demotion or deletion of the last remaining admin account.
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-md font-mono text-[10px] bg-indigo-100 dark:bg-indigo-900/60 font-bold">
                {stats.admin_users} Active Admin{stats.admin_users > 1 ? 's' : ''}
              </span>
            </div>
          )}

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={usersSearch}
                onChange={(e) => {
                  setUsersSearch(e.target.value);
                  setUsersPage(1);
                }}
                placeholder="Search user name or email..."
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#070b13] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {activeTab === 'all' && (
                <select
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value);
                    setUsersPage(1);
                  }}
                  className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#070b13] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admins</option>
                  <option value="user">Standard</option>
                </select>
              )}

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setUsersPage(1);
                }}
                className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#070b13] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="soft_deleted">Deactivated</option>
              </select>

              <select
                value={gmailFilter}
                onChange={(e) => {
                  setGmailFilter(e.target.value);
                  setUsersPage(1);
                }}
                className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#070b13] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
              >
                <option value="all">All Gmail Access</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
                <option value="revoked">Revoked</option>
                <option value="not_requested">Not Requested</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {usersLoading ? (
            <div className="py-12 flex justify-center text-slate-400">
              <Loader2 className="w-7 h-7 animate-spin text-blue-500" />
            </div>
          ) : users.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No users found matching current filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-semibold border-y border-slate-200/80 dark:border-slate-800/80">
                  <tr>
                    <th className="py-3 px-3">Name</th>
                    <th className="py-3 px-3">Email</th>
                    <th className="py-3 px-3">Role</th>
                    <th className="py-3 px-3">Account Status</th>
                    <th className="py-3 px-3">Gmail Access</th>
                    {activeTab === 'standard' && <th className="py-3 px-3">Approved Addresses</th>}
                    {activeTab === 'standard' && <th className="py-3 px-3">Request Date</th>}
                    <th className="py-3 px-3">Created</th>
                    <th className="py-3 px-3">Last Login</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {users.map((u) => {
                    const isLastAdmin = u.role === 'ADMIN' && stats.admin_users <= 1;

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                          {u.name}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-300">
                          {u.email}
                        </td>
                        <td className="py-3 px-3">
                          {u.role === 'ADMIN' ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-mono">
                              ADMIN
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
                              USER
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          {u.account_status === 'ACTIVE' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              Deactivated
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <button
                            type="button"
                            onClick={() => handleOpenAccessManage(u)}
                            title="Click to manually give, revoke, or configure Gmail access"
                            className="group inline-flex items-center gap-1.5 p-1 -m-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all cursor-pointer text-left focus:outline-none"
                          >
                            {renderStatusBadge(u.gmail_access_status)}
                            <span className="opacity-0 group-hover:opacity-100 text-[10px] text-blue-500 font-bold transition-opacity">
                              ✎
                            </span>
                          </button>
                        </td>
                        {activeTab === 'standard' && (
                          <td className="py-3 px-3">
                            {u.approved_emails && u.approved_emails.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {u.approved_emails.map((e, idx) => (
                                  <span key={idx} className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                                    {e}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              '—'
                            )}
                          </td>
                        )}
                        {activeTab === 'standard' && (
                          <td className="py-3 px-3 text-slate-500">{formatDate(u.request_date)}</td>
                        )}
                        <td className="py-3 px-3 text-slate-500">{formatDate(u.created_at)}</td>
                        <td className="py-3 px-3 text-slate-500">{formatDate(u.last_login_at)}</td>
                        <td className="py-3 px-3 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenHistory(u)}
                              title="Inspect Gmail Access Lifecycle History"
                              className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-transparent hover:border-blue-200/50 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {u.gmail_access_status === 'APPROVED' && (
                              <button
                                type="button"
                                onClick={() => {
                                  setRevokeTargetUser(u);
                                  setUserRevokeReason('');
                                }}
                                title="Revoke Gmail Access Authority"
                                className="p-1.5 rounded-lg text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-transparent hover:border-amber-200/50 cursor-pointer"
                              >
                                <ShieldOff className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {u.account_status === 'ACTIVE' && (
                              <button
                                type="button"
                                disabled={isLastAdmin}
                                onClick={() => setSoftDeleteTarget(u)}
                                title={isLastAdmin ? 'Cannot delete the last remaining administrator' : 'Soft Delete User'}
                                className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200/50 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {usersTotalPages > 1 && (
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500">
                Page {usersPage} of {usersTotalPages} ({usersTotal} total users)
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={usersPage <= 1}
                  onClick={() => setUsersPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={usersPage >= usersTotalPages}
                  onClick={() => setUsersPage((p) => Math.min(usersTotalPages, p + 1))}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: 4. DELETED USERS / TRASH */}
      {activeTab === 'deleted' && (
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0b111e] border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Soft-Deleted Users (Trash)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Users placed in trash remain safely restorable for 30 days. Their login & API access is blocked immediately.
              </p>
            </div>
          </div>

          {deletedLoading ? (
            <div className="py-12 flex justify-center text-slate-400">
              <Loader2 className="w-7 h-7 animate-spin text-blue-500" />
            </div>
          ) : deletedUsers.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              Trash is empty. No soft-deleted users.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-semibold border-y border-slate-200/80 dark:border-slate-800/80">
                  <tr>
                    <th className="py-3 px-3">Name</th>
                    <th className="py-3 px-3">Email</th>
                    <th className="py-3 px-3">Deleted Date</th>
                    <th className="py-3 px-3">Deleted By</th>
                    <th className="py-3 px-3">Days Remaining</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {deletedUsers.map((u) => {
                    const days = u.days_remaining ?? 30;
                    return (
                      <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                          {u.name}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-500">{u.email}</td>
                        <td className="py-3 px-3 text-slate-500">{formatDate(u.deleted_at)}</td>
                        <td className="py-3 px-3 text-slate-500">{u.deleted_by_name || 'Admin'}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono ${
                              days <= 5
                                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            }`}
                          >
                            {days} day{days !== 1 ? 's' : ''} left
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setRestoreTarget(u)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Restore</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setPermanentDeleteTarget(u)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Permanent Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: 5. AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0b111e] border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              System & Administrative Audit Logs
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Immutable chronological record of administrative actions, user deactivations, and Gmail authorizations.
            </p>
          </div>

          {auditLoading ? (
            <div className="py-12 flex justify-center text-slate-400">
              <Loader2 className="w-7 h-7 animate-spin text-blue-500" />
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No audit records logged yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-semibold border-y border-slate-200/80 dark:border-slate-800/80">
                  <tr>
                    <th className="py-3 px-3">Timestamp</th>
                    <th className="py-3 px-3">Action</th>
                    <th className="py-3 px-3">Target User</th>
                    <th className="py-3 px-3">Performed By</th>
                    <th className="py-3 px-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3 px-3 text-slate-500 font-mono">
                        {formatDate(log.timestamp)}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-700 dark:text-slate-300">
                        {log.target_user_email || '—'}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-500">
                        {log.admin_email || 'System'}
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                        {log.details || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* CONFIRMATION & REVIEW DIALOGS */}
      {/* ========================================================================= */}

      {/* Approve Confirmation Modal */}
      {approveModalReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-[#0b111e] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Approve Gmail Access Request
                </h3>
                <p className="text-xs text-slate-500">Confirm granting authorization to this user.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#070b13] border border-slate-200 dark:border-slate-800 text-xs space-y-1.5 font-sans">
              <p>
                <strong className="text-slate-500">User:</strong> {approveModalReq.user_name}
              </p>
              <p>
                <strong className="text-slate-500">Login Email:</strong> {approveModalReq.user_email}
              </p>
              <div>
                <strong className="text-slate-500">Requested Gmail Address(es):</strong>
                <div className="flex flex-wrap gap-1 mt-1">
                  {approveModalReq.requested_emails.map((e, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                      {e}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setApproveModalReq(null)}
                disabled={submittingAction}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApprove}
                disabled={submittingAction}
                className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer flex items-center gap-2"
              >
                {submittingAction && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm Approval</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation Modal with Optional Reason */}
      {rejectModalReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-[#0b111e] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center shrink-0">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Reject Gmail Access Request
                </h3>
                <p className="text-xs text-slate-500">Provide an optional reason for the user.</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#070b13] border border-slate-200 dark:border-slate-800 text-xs">
              <p>
                <strong>User:</strong> {rejectModalReq.user_name} ({rejectModalReq.user_email})
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Rejection Reason (visible to user)
              </label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Please provide a verified corporate email address."
                className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-[#070b13] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setRejectModalReq(null);
                  setRejectionReason('');
                }}
                disabled={submittingAction}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={submittingAction}
                className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white cursor-pointer flex items-center gap-2"
              >
                {submittingAction && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm Rejection</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revoke Confirmation Modal */}
      {revokeModalReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-[#0b111e] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Revoke Gmail Access
                </h3>
                <p className="text-xs text-slate-500">Are you sure you want to revoke Gmail access?</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Revoking access will immediately prevent <strong>{revokeModalReq.user_name}</strong> from analyzing Gmail emails or connecting their account. Past detection history will remain preserved.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRevokeModalReq(null)}
                disabled={submittingAction}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRevoke}
                disabled={submittingAction}
                className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white cursor-pointer flex items-center gap-2"
              >
                {submittingAction && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Revoke Access</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revoke User Gmail Access Confirmation Modal (Direct from User Management) */}
      {revokeTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-[#0b111e] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center shrink-0">
                <ShieldOff className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Revoke Gmail Access Authority
                </h3>
                <p className="text-xs text-slate-500">Remove administrator approval for this user.</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#070b13] border border-slate-200 dark:border-slate-800 text-xs space-y-1">
              <p className="text-slate-900 dark:text-white font-medium">
                <strong>User:</strong> {revokeTargetUser.name}
              </p>
              <p className="text-slate-500 font-mono">
                <strong>Email:</strong> {revokeTargetUser.email}
              </p>
              {revokeTargetUser.approved_emails && revokeTargetUser.approved_emails.length > 0 && (
                <p className="text-slate-500 font-mono">
                  <strong>Approved Addresses:</strong> {revokeTargetUser.approved_emails.join(', ')}
                </p>
              )}
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Revoking access will immediately cancel this user's Gmail authorization, invalidate active session tokens, and prohibit inbox message scanning until re-requested and approved.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Reason for Revocation (optional audit note)
              </label>
              <textarea
                rows={2}
                value={userRevokeReason}
                onChange={(e) => setUserRevokeReason(e.target.value)}
                placeholder="e.g. Periodic security compliance review, unauthorized address, or account role change."
                className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-[#070b13] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setRevokeTargetUser(null);
                  setUserRevokeReason('');
                }}
                disabled={submittingAction}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRevokeUserGmail}
                disabled={submittingAction}
                className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-amber-600 hover:bg-amber-700 text-white cursor-pointer flex items-center gap-2"
              >
                {submittingAction && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Revoke Authority</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Gmail Access Management Popup (Triggered by clicking on Gmail Access badge in table) */}
      {accessManageUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-lg bg-white dark:bg-[#0b111e] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500/20 to-indigo-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Manage Gmail Access Authority
                  </h3>
                  <p className="text-xs text-slate-500">
                    {accessManageUser.name} &bull; <span className="font-mono">{accessManageUser.email}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAccessManageUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Current Status Banner */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#070b13] border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-slate-500 text-[11px] font-medium block">Current Gmail Status:</span>
                <div className="mt-1">{renderStatusBadge(accessManageUser.gmail_access_status)}</div>
              </div>
              {accessManageUser.approved_emails && accessManageUser.approved_emails.length > 0 && (
                <div className="text-right">
                  <span className="text-slate-500 text-[11px] font-medium block">Linked Addresses:</span>
                  <div className="flex flex-wrap gap-1 justify-end mt-1">
                    {accessManageUser.approved_emails.map((em, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                        {em}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Mode Switcher */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
              <button
                type="button"
                onClick={() => setAccessManageAction('grant')}
                className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  accessManageAction === 'grant'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Give / Grant Access</span>
              </button>
              <button
                type="button"
                onClick={() => setAccessManageAction('revoke')}
                className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  accessManageAction === 'revoke'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <ShieldOff className="w-3.5 h-3.5" />
                <span>Remove / Revoke Access</span>
              </button>
            </div>

            {/* GIVE / GRANT ACCESS VIEW */}
            {accessManageAction === 'grant' && (
              <div className="space-y-3.5 animate-fadeIn">
                <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/30 text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
                  <strong>Administrator Authority:</strong> Manually authorize this user to connect and scan Gmail inboxes. Any existing requests will be marked as approved.
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Authorized Gmail Address(es)
                  </label>
                  <input
                    type="text"
                    value={manualGrantEmails}
                    onChange={(e) => setManualGrantEmails(e.target.value)}
                    placeholder="e.g. user@gmail.com, security@company.com"
                    className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-[#070b13] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                  <p className="text-[10px] text-slate-400">Comma-separated email addresses allowed for Gmail scanning.</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Audit Note / Reason (recorded in security logs)
                  </label>
                  <input
                    type="text"
                    value={manualGrantNote}
                    onChange={(e) => setManualGrantNote(e.target.value)}
                    placeholder="e.g. Granted by administrator for threat inspection testing"
                    className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-[#070b13] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => handleSubmitAccessManage('reset')}
                    disabled={accessManageLoading}
                    title="Reset state to NOT_REQUESTED"
                    className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset to Not Requested</span>
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setAccessManageUser(null)}
                      disabled={accessManageLoading}
                      className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSubmitAccessManage('grant')}
                      disabled={accessManageLoading}
                      className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer flex items-center gap-2"
                    >
                      {accessManageLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>Grant Gmail Access</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* REMOVE / REVOKE ACCESS VIEW */}
            {accessManageAction === 'revoke' && (
              <div className="space-y-3.5 animate-fadeIn">
                <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/30 text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                  <strong>Revoke Authority:</strong> Immediately removes authorization for <strong>{accessManageUser.name}</strong>, clears stored OAuth tokens, and blocks scanning.
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Revocation Reason (recorded in audit log)
                  </label>
                  <input
                    type="text"
                    value={manualGrantNote}
                    onChange={(e) => setManualGrantNote(e.target.value)}
                    placeholder="e.g. Access revoked during security audit or compliance review"
                    className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-[#070b13] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => handleSubmitAccessManage('reset')}
                    disabled={accessManageLoading}
                    title="Reset state to NOT_REQUESTED"
                    className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset to Not Requested</span>
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setAccessManageUser(null)}
                      disabled={accessManageLoading}
                      className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSubmitAccessManage('revoke')}
                      disabled={accessManageLoading}
                      className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-amber-600 hover:bg-amber-700 text-white cursor-pointer flex items-center gap-2"
                    >
                      {accessManageLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>Revoke Authority</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Soft Delete Modal */}
      {softDeleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-[#0b111e] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Deactivate User Account
                </h3>
                <p className="text-xs text-slate-500">Move user to trash with 30-day retention.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Are you sure you want to deactivate <strong>{softDeleteTarget.name}</strong> ({softDeleteTarget.email})?
              Their login and API tokens will be blocked immediately. The account can be restored within 30 days.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSoftDeleteTarget(null)}
                disabled={submittingAction}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSoftDelete}
                disabled={submittingAction}
                className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white cursor-pointer flex items-center gap-2"
              >
                {submittingAction && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Deactivate User</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restore User Modal */}
      {restoreTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-[#0b111e] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Restore User Account
                </h3>
                <p className="text-xs text-slate-500">Restore this user?</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Restore <strong>{restoreTarget.name}</strong> ({restoreTarget.email}) to active status?
              Normal application and login access will be immediately restored.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRestoreTarget(null)}
                disabled={submittingAction}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRestore}
                disabled={submittingAction}
                className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer flex items-center gap-2"
              >
                {submittingAction && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Restore User</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permanent Delete Modal */}
      {permanentDeleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-[#0b111e] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Permanent Deletion
                </h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Permanently delete user record for <strong>{permanentDeleteTarget.name}</strong> ({permanentDeleteTarget.email})? Historical threat detection records will remain safely preserved with user attribution unlinked.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPermanentDeleteTarget(null)}
                disabled={submittingAction}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePermanentDelete}
                disabled={submittingAction}
                className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-rose-700 hover:bg-rose-800 text-white cursor-pointer flex items-center gap-2"
              >
                {submittingAction && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Permanently Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Gmail Access Lifecycle History Modal */}
      {historyUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-xl bg-white dark:bg-[#0b111e] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Gmail Access History Lifecycle
                  </h3>
                  <p className="text-xs text-slate-500">
                    {historyUser.name} ({historyUser.email})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setHistoryUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {historyLoading ? (
              <div className="py-8 flex justify-center text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            ) : historyList.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No Gmail access transitions recorded for this user yet.
              </div>
            ) : (
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {historyList.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-[#070b13] border border-slate-200/80 dark:border-slate-800/80 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 font-mono">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        {item.action}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {formatDate(item.timestamp)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                      <span>Transition:</span>
                      <span className="font-mono text-slate-600 dark:text-slate-400">
                        {item.previous_status || 'NONE'} → {item.new_status}
                      </span>
                    </div>

                    {item.gmail_addresses && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 font-mono">
                        Target account(s): {item.gmail_addresses}
                      </p>
                    )}

                    {item.admin_note && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                        Note: "{item.admin_note}"
                      </p>
                    )}

                    <p className="text-[10px] text-slate-400 text-right">
                      Performed by: {item.performed_by_name || 'System'}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              {historyUser.gmail_access_status === 'APPROVED' ? (
                <button
                  type="button"
                  onClick={() => {
                    setRevokeTargetUser(historyUser);
                    setUserRevokeReason('');
                  }}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 cursor-pointer flex items-center gap-1.5"
                >
                  <ShieldOff className="w-3.5 h-3.5" />
                  <span>Revoke Gmail Access</span>
                </button>
              ) : (
                <div />
              )}
              <button
                type="button"
                onClick={() => setHistoryUser(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
