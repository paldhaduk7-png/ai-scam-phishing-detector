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
  Check,
  AlertCircle,
  LogOut,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import {
  uploadAvatar,
  deleteAvatar,
  updateProfileDetails,
  logoutUser,
} from '../../store/slices/authSlice';

export default function ProfileForm() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const fileInputRef = useRef(null);

  const [name, setName] = useState(user?.name || '');
  const [photoLoading, setPhotoLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

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
      return;
    }

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image size exceeds 5MB limit.');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setPhotoLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await dispatch(uploadAvatar(formData)).unwrap();
      if (res) {
        setSuccessMsg('Profile photo updated successfully!');
      }
    } catch (err) {
      setErrorMsg(typeof err === 'string' ? err : 'Failed to upload profile photo.');
    } finally {
      setPhotoLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeletePhoto = async () => {
    if (!window.confirm('Are you sure you want to remove your profile photo?')) return;

    setErrorMsg('');
    setSuccessMsg('');
    setPhotoLoading(true);

    try {
      await dispatch(deleteAvatar()).unwrap();
      setSuccessMsg('Profile photo removed.');
    } catch (err) {
      setErrorMsg(typeof err === 'string' ? err : 'Failed to remove profile photo.');
    } finally {
      setPhotoLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Full name cannot be empty.');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setProfileLoading(true);

    try {
      await dispatch(updateProfileDetails({ name: name.trim() })).unwrap();
      setSuccessMsg('Profile details updated successfully!');
    } catch (err) {
      setErrorMsg(typeof err === 'string' ? err : 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
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

        <h3 className="text-lg font-bold text-slate-900">{user?.name || 'User'}</h3>
        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
          <Mail className="w-3.5 h-3.5 text-slate-400" />
          <span>{user?.email || 'email@example.com'}</span>
        </p>
        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>Member since {formatDate(user?.created_at)}</span>
        </p>

        {/* Delete Photo Button if photo exists */}
        {user?.profile_photo && (
          <button
            type="button"
            onClick={handleDeletePhoto}
            disabled={photoLoading}
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Remove Photo</span>
          </button>
        )}

        <div className="w-full mt-6 pt-5 border-t border-slate-100 space-y-3">
          <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-left">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
            <p className="text-[11px] text-blue-900 leading-snug">
              Protected session active with secure HTTP-only cookies and Cloudinary storage.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-center text-xs font-semibold text-slate-700 hover:text-red-600 hover:border-red-200"
          >
            <LogOut className="w-3.5 h-3.5 mr-1.5" />
            Sign Out
          </Button>
        </div>
      </Card>

      {/* Right Column: Profile Edit Form */}
      <Card className="lg:col-span-2 p-8">
        {successMsg && (
          <div className="mb-6 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleProfileSubmit} className="space-y-6">
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
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Email (Read Only) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Email Address (Account Identifier)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Email address is permanently linked to your detection records and cannot be changed directly.
            </p>
          </div>

          {/* Cloudinary Info Badge */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <h4 className="text-xs font-bold text-slate-700">Cloudinary Avatar Storage</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Profile images are safely processed, cropped, and served securely via Cloudinary CDN. Photos can be removed or replaced at any time.
            </p>
          </div>

          {/* Submit Actions */}
          <div className="pt-4 border-t border-slate-100 flex justify-end">
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
    </div>
  );
}
