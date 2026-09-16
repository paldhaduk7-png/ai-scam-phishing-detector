import React from 'react';
import ProfileForm from '../components/profile/ProfileForm';
import { UserCheck } from 'lucide-react';

export default function Profile() {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Account Settings Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 border-b border-slate-200/60 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
              Account & Profile
            </h1>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/40 px-2.5 py-0.5 rounded-full font-mono">
              <UserCheck className="w-3.5 h-3.5" />
              Verified Session
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your personal credentials, profile photo avatar, and security preferences.
          </p>
        </div>
      </div>

      <ProfileForm />
    </div>
  );
}
