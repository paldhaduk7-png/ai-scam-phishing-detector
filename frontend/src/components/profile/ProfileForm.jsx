import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import Button from '../common/Button';
import {
  User,
  Mail,
  Camera,
  Calendar,
  Trash2,
  AlertCircle,
  LogOut,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  uploadAvatar,
  deleteAvatar,
  updateProfileDetails,
  logoutUser,
} from '../../store/slices/authSlice';
import ConfirmModal from '../common/ConfirmModal';

export default function ProfileForm() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const fileInputRef = useRef(null);

  const [name, setName] = useState(user?.name || '');
  const [photoLoading, setPhotoLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Modals state
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showDeletePhotoModal, setShowDeletePhotoModal] = useState(false);
  const [deletingPhoto, setDeletingPhoto] = useState(false);

  // Compute initials for fallback avatar
  const getInitials = (fullName) => {
    if (!fullName) return 'U';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Format date
  const formatDate = (isoString) => {
    if (!isoString) return 'Recently';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return 'Recently';
    }
  };

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrorMsg('Please select a valid image file (JPEG, PNG, or WEBP).');
      toast.error('Please select a valid image file (JPEG, PNG, or WEBP).');
      return;
    }

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image size exceeds 5MB limit.');
      toast.error('Image size exceeds 5MB limit.');
      return;
    }

    setErrorMsg('');
    setPhotoLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await dispatch(uploadAvatar(formData)).unwrap();
      if (res) {
        toast.success('Profile photo updated successfully!');
      }
    } catch (err) {
      const msg = typeof err === 'string' ? err : 'Failed to upload profile photo.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setPhotoLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleConfirmDeletePhoto = async () => {
    setErrorMsg('');
    setDeletingPhoto(true);

    try {
      await dispatch(deleteAvatar()).unwrap();
      toast.success('Profile photo removed successfully.');
      setShowDeletePhotoModal(false);
    } catch (err) {
      const msg = typeof err === 'string' ? err : 'Failed to remove profile photo.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setDeletingPhoto(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Full name cannot be empty.');
      toast.error('Full name cannot be empty.');
      return;
    }

    setErrorMsg('');
    setProfileLoading(true);

    try {
      await dispatch(updateProfileDetails({ name: name.trim() })).unwrap();
      toast.success('Profile details updated successfully!');
    } catch (err) {
      const msg = typeof err === 'string' ? err : 'Failed to update profile.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleConfirmLogout = async () => {
    setLoggingOut(true);
    try {
      await dispatch(logoutUser());
      toast.success('Signed out successfully.');
      setShowLogoutModal(false);
      navigate('/login');
    } catch {
      toast.error('Sign out failed. Please try again.');
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Column (4 cols): Avatar & Account Overview */}
      <div className="lg:col-span-4 space-y-6">
        <Card className="flex flex-col items-center text-center p-6 sm:p-7 relative overflow-hidden">
          {/* Avatar Area */}
          <div className="relative mb-4 group">
            {user?.profile_photo ? (
              <img
                src={user.profile_photo}
                alt={user.name || 'User'}
                className="w-28 h-28 rounded-2xl object-cover ring-4 ring-blue-500/20 shadow-md transition-all group-hover:ring-blue-500/35"
              />
            ) : (
              <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center text-3xl font-extrabold ring-4 ring-blue-500/20 shadow-md">
                <span>{getInitials(user?.name)}</span>
              </div>
            )}

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoSelect}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
            />

            {/* Camera upload button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={photoLoading}
              className="absolute -bottom-1.5 -right-1.5 p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-500 shadow-md border-2 border-white dark:border-slate-900 transition-transform hover:scale-105 cursor-pointer disabled:opacity-50"
              title="Upload new photo (Cloudinary)"
              aria-label="Upload profile photo"
            >
              {photoLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
            </button>
          </div>

          <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            {user?.name || 'User'}
          </h2>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5 font-mono truncate max-w-full">
            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{user?.email || 'email@example.com'}</span>
          </p>

          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1.5 font-medium">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Member since {formatDate(user?.created_at)}</span>
          </p>

          {/* Delete Photo Button if photo exists */}
          {user?.profile_photo && (
            <button
              type="button"
              onClick={() => setShowDeletePhotoModal(true)}
              disabled={photoLoading || deletingPhoto}
              className="mt-3.5 inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:underline cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove Photo</span>
            </button>
          )}

          {/* Sign Out Card Button */}
          <div className="w-full mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowLogoutModal(true)}
              icon={LogOut}
              className="w-full justify-center text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-900/50"
            >
              Sign Out of Account
            </Button>
          </div>
        </Card>

        {/* Security Posture Note */}
        <Card className="p-5 bg-slate-50/60 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/80 space-y-3">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Account Security</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>HTTP-only JWT cookie authentication</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>bcrypt salted password storage</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Isolated personal detection history</span>
            </li>
          </ul>
        </Card>
      </div>

      {/* Right Column (8 cols): Profile Edit Form */}
      <div className="lg:col-span-8">
        <Card className="p-6 sm:p-8">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Personal Information
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Update your display name and review your verified account credentials.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-800 dark:text-red-200 text-xs font-medium flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Display Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50/70 dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-[#0b1120] focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 transition-all"
                />
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">
                This name is displayed across your dashboard and welcome greetings.
              </p>
            </div>

            {/* Email (Read Only) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Email Address
                </label>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                  <Lock className="w-3 h-3" />
                  Immutable
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed font-mono"
                />
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">
                Email address is permanently linked to your PostgreSQL detection records and cannot be changed directly.
              </p>
            </div>

            {/* Submit Actions */}
            <div className="pt-5 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={profileLoading}
                className="px-6 py-2.5 text-sm font-semibold rounded-xl shadow-xs"
              >
                {profileLoading ? 'Saving Changes...' : 'Save Profile Changes'}
              </Button>
            </div>
          </form>
        </Card>
      </div>

      {/* Sign Out Confirmation Modal */}
      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => !loggingOut && setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
        loading={loggingOut}
        title="Sign Out Confirmation"
        message="Are you sure you want to sign out of ScamShield? You will need to log back in to access your personal dashboard and scan history."
        confirmText="Sign Out"
        cancelText="Cancel"
      />

      {/* Delete Photo Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeletePhotoModal}
        onClose={() => !deletingPhoto && setShowDeletePhotoModal(false)}
        onConfirm={handleConfirmDeletePhoto}
        loading={deletingPhoto}
        title="Remove Profile Photo"
        message="Are you sure you want to remove your profile photo? Your avatar will reset to your initials."
        confirmText="Remove Photo"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
