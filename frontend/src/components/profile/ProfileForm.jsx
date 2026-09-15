import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import {
  User,
  Mail,
  Lock,
  Camera,
  Calendar,
  Eye,
  EyeOff,
  ShieldAlert,
} from 'lucide-react';

export default function ProfileForm() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column: Avatar & Summary Card */}
      <Card className="flex flex-col items-center text-center p-8">
        <div className="relative mb-5">
          <div className="w-28 h-28 rounded-full bg-slate-800 text-white flex items-center justify-center text-3xl font-bold ring-4 ring-blue-500/20 shadow-md">
            <span>PD</span>
          </div>
          <button
            type="button"
            className="absolute bottom-1 right-1 p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 shadow-sm border-2 border-white transition-transform hover:scale-105 cursor-pointer"
            title="Update photo (Auth required)"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>

        <h3 className="text-lg font-bold text-slate-900">Pal Dhaduk</h3>
        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
          <Mail className="w-3.5 h-3.5 text-slate-400" />
          <span>pal@example.com</span>
        </p>
        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>Member since September 2026</span>
        </p>

        <div className="w-full mt-6 pt-5 border-t border-slate-100">
          <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-left">
            <ShieldAlert className="w-4 h-4 text-blue-600 shrink-0" />
            <p className="text-[11px] text-blue-900 leading-snug">
              User account management will connect to FastAPI authentication in the next phase.
            </p>
          </div>
        </div>
      </Card>

      {/* Right Column: Profile Edit Form */}
      <Card className="lg:col-span-2 p-8">
        <form
          onSubmit={(e) => {
            e.preventDefault();
          }}
          className="space-y-6"
        >
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                defaultValue="Pal Dhaduk"
                placeholder="Enter your full name"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                defaultValue="pal@example.com"
                disabled
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Password Section */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                defaultValue="••••••••••••"
                readOnly
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-800 font-mono tracking-widest"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            <div className="mt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs font-semibold"
              >
                Change Password
              </Button>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="px-6 py-2.5 text-sm font-semibold"
            >
              Update Profile
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
