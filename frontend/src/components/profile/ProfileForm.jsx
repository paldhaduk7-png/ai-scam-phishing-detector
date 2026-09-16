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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column: Avatar & Summary Card */}
      <Card className="flex flex-col items-center text-center p-8">
        <div className="relative mb-5">
          {user?.profile_photo ? (
            <img
              src={user.profile_photo}
              alt={user.name}
              className="w-28 h-28 rounded-full object-cover ring-4 ring-blue-500/20 shadow-md"
            />
          ) : (
            <div className="w-28 h-28 rounded-full bg-slate-800 text-white flex items-center justify-center text-3xl font-bold ring-4 ring-blue-500/20 shadow-md">
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
            className="absolute bottom-1 right-1 p-2.5 rounded-full bg-blue-600 text-white hover:bg-blue-700 shadow-md border-2 border-white transition-transform hover:scale-105 cursor-pointer disabled:opacity-50"
            title="Upload new photo (Cloudinary)"
          >
            {photoLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Camera className="w-4 h-4" />
            )}
          </button>
        </div>

        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{user?.name || 'User'}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
          <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          <span>{user?.email || 'email@example.com'}</span>
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          <span>Member since {formatDate(user?.created_at)}</span>
        </p>

        {/* Delete Photo Button if photo exists */}
        {user?.profile_photo && (
          <button
            type="button"
            onClick={() => setShowDeletePhotoModal(true)}
            disabled={photoLoading || deletingPhoto}
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Remove Photo</span>
          </button>
        )}

        <div className="w-full mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowLogoutModal(true)}
            className="w-full justify-center text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-900/50"
          >
            <LogOut className="w-3.5 h-3.5 mr-1.5" />
            Sign Out
          </Button>
        </div>
      </Card>

      {/* Right Column: Profile Edit Form */}
      <Card className="lg:col-span-2 p-8">
        {errorMsg && (
          <div className="mb-6 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-800 dark:text-red-200 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleProfileSubmit} className="space-y-6">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Full Name
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
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 dark:bg-[#0b1120] border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-[#0b1120] focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Email (Read Only) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Email Address (Account Identifier)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed"
              />
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">
              Email address is permanently linked to your detection records and cannot be changed directly.
            </p>
          </div>

          {/* Submit Actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={profileLoading}
              className="px-6 py-2.5 text-sm font-semibold"
            >
              {profileLoading ? 'Saving...' : 'Update Profile'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Sign Out Confirmation Modal */}
      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => !loggingOut && setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
        loading={loggingOut}
        title="Sign Out Confirmation"
        message="Are you sure you want to sign out of ScamShield? You will need to log back in to access your personal dashboard."
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
