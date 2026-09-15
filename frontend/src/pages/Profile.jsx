import React from 'react';
import ProfileForm from '../components/profile/ProfileForm';

export default function Profile() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          My Profile
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your account information.
        </p>
      </div>

      <ProfileForm />
    </div>
  );
}
