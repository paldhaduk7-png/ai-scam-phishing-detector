import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import {
  Shield,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  X,
  Upload,
  Sun,
  Moon,
  History,
  Activity,
  Database,
} from 'lucide-react';
import { toast } from 'sonner';
import { RegisterProfileIllustration } from '../components/auth/AuthIllustrations';

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

function GoogleIcon({ className = 'w-5 h-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.37 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.97 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.63 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { isDark, toggleTheme } = useTheme();

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/auth/google/login`;
  };

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Profile Photo State
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  // UI Feedback State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Process image file
  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      const msg = 'Please upload a valid image file (JPEG, PNG, or WEBP).';
      setError(msg);
      toast.error(msg);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      const msg = 'Photo size must be less than 5MB.';
      setError(msg);
      toast.error(msg);
      return;
    }

    setError('');
    setPhotoFile(file);
    toast.info(`Photo selected: ${file.name}`);

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.info('Selected photo cleared');
  };

  // Form Submission with Axios
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName) {
      const msg = 'Please enter your full name.';
      setError(msg);
      toast.error(msg);
      return;
    }

    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      const msg = 'Please enter a valid email address.';
      setError(msg);
      toast.error(msg);
      return;
    }

    if (password.length < 6) {
      const msg = 'Password must be at least 6 characters long.';
      setError(msg);
      toast.error(msg);
      return;
    }

    if (password !== confirmPassword) {
      const msg = 'Passwords do not match. Please verify both fields.';
      setError(msg);
      toast.error(msg);
      return;
    }

    if (!agreeTerms) {
      const msg = 'You must agree to the Terms of Service to create an account.';
      setError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', trimmedName);
      formData.append('email', trimmedEmail);
      formData.append('password', password);

      if (photoFile) {
        formData.append('photo', photoFile);
      }

      await axios.post(`${API_BASE_URL}/auth/register`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });

      const successNotice = 'Account registered successfully! Please sign in.';
      setSuccessMsg(successNotice);
      toast.success(successNotice);

      setTimeout(() => {
        navigate('/login', {
          state: {
            registeredEmail: trimmedEmail,
            message: 'Registration successful! Please sign in to continue.',
          },
        });
      }, 1200);
    } catch (err) {
      const detail = err.response?.data?.detail;
      const message =
        typeof detail === 'string'
          ? detail
          : Array.isArray(detail)
          ? detail[0]?.msg
          : err.message === 'Network Error'
          ? 'Cannot connect to backend server. Please verify backend is running on port 8000.'
          : 'Registration failed. Please review your details and try again.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* 1. Full-Width White Header (compact height ~54px) */}
      <header className="w-full h-14 bg-white dark:bg-[#0b101b] border-b border-slate-200/80 dark:border-slate-800 shrink-0 flex items-center">
        <div className="w-full max-w-[1500px] mx-auto px-6 lg:px-12 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group focus-visible:outline-none">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-600/25 group-hover:scale-105 transition-transform shrink-0">
              <Shield className="w-4.5 h-4.5 fill-white stroke-blue-600 stroke-[1.5]" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                ScamShield
              </span>
              <span className="text-[9px] uppercase font-bold tracking-widest text-blue-600 dark:text-blue-400 mt-0.5">
                Cybersecurity
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={() => {
                toggleTheme();
                toast.info(`Switched to ${isDark ? 'Light' : 'Dark'} Mode`);
              }}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600 hover:text-blue-600" />
              )}
            </button>

            <span className="hidden sm:inline text-xs text-slate-500 dark:text-slate-400 font-medium">
              Already have an account?
            </span>

            <Link
              to="/login"
              className="px-3.5 py-1.5 rounded-lg border border-blue-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 hover:bg-blue-50/70 dark:hover:bg-slate-800 text-xs font-semibold shadow-2xs transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Main Content Starts Immediately Below Header with Compact ~16-20px Gap */}
      <main className="w-full max-w-[1500px] mx-auto px-6 lg:px-12 pt-4 sm:pt-5 pb-8 flex-1">
        <div className="w-full flex flex-col lg:flex-row items-start justify-between gap-6 xl:gap-10">
          {/* LEFT COLUMN: ~500px wide */}
          <div className="w-full lg:w-[480px] xl:w-[500px] space-y-4 text-left shrink-0">
            {/* Personal Security Suite Green Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900/60 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Personal Security Suite</span>
            </div>

            {/* Large Heading */}
            <h1 className="text-2xl sm:text-3xl xl:text-[34px] font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.18]">
              Create Your ScamShield<br />Account
            </h1>

            {/* Subtitle Description */}
            <p className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed max-w-lg">
              Create a personal workspace to persist your threat detection history, unlock 7-day activity metrics, and customize your profile.
            </p>

            {/* Three Wide Horizontal Feature Cards (~500px wide) */}
            <div className="space-y-2.5 pt-0.5">
              {/* Card 1: Automated Scan History Persistence */}
              <div className="w-full flex items-center gap-3.5 p-3 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <History className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-slate-100">
                    Automated Scan History Persistence
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">
                    Save every message, email, or URL scan to your private PostgreSQL log.
                  </p>
                </div>
              </div>

              {/* Card 2: 7-Day Security Operations Trends */}
              <div className="w-full flex items-center gap-3.5 p-3 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Activity className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-slate-100">
                    7-Day Security Operations Trends
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">
                    Monitor your personal daily encounter metrics (Safe vs. Phishing).
                  </p>
                </div>
              </div>

              {/* Card 3: Profile Personalization & Avatar */}
              <div className="w-full flex items-center gap-3.5 p-3 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                  <Database className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-slate-100">
                    Profile Personalization &amp; Avatar
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">
                    Optional cloud avatar image management powered by Cloudinary.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CENTER COLUMN: Large Profile/Account + Blue Shield Illustration (320–350px) */}
          <div className="hidden lg:flex items-center justify-center shrink-0 w-[300px] xl:w-[350px] pt-2">
            <RegisterProfileIllustration />
          </div>

          {/* RIGHT COLUMN: Wide (520–540px) & Vertically Compact Registration Card */}
          <div className="w-full max-w-[540px] lg:w-[520px] xl:w-[540px] shrink-0">
            <div className="w-full bg-white dark:bg-[#0f172a] rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 px-7 sm:px-8 py-5 sm:py-6">
              {/* 1. Blue Account Icon */}
              <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center mx-auto mb-1.5">
                <User className="w-5 h-5 stroke-[2.2]" />
              </div>

              {/* 2. Create Account Heading & Subtitle */}
              <div className="text-center mb-3">
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                  Create Account
                </h2>
                <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-0.5">
                  Enter your details to register for ScamShield.
                </p>
              </div>

              {/* Error Banner */}
              {error && (
                <div className="mb-2.5 p-2 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs flex items-center gap-2 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Success Banner */}
              {successMsg && (
                <div className="mb-2.5 p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Registration Form with 100% Full-Width 44px Inputs & Compact Vertical Spacing */}
              <form onSubmit={handleSubmit} className="space-y-2.5">
                {/* 4. Profile Photo (Optional) Upload Box - Full width, compact */}
                <div className="w-full flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                  {photoPreview ? (
                    <div className="relative shrink-0">
                      <img
                        src={photoPreview}
                        alt="Avatar Preview"
                        className="w-9 h-9 rounded-xl object-cover ring-2 ring-blue-500/30 shrink-0"
                      />
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="absolute -top-1 -right-1 p-0.5 rounded-full bg-red-600 text-white hover:bg-red-700 shadow-xs cursor-pointer"
                        aria-label="Remove photo"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200/60 dark:border-blue-800/60">
                      <Upload className="w-4.5 h-4.5" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-tight">
                      Profile Photo (Optional)
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">
                      JPG, PNG or WEBP under 5MB
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer leading-tight"
                    >
                      {photoFile ? 'Choose another image' : 'Upload photo'}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* 5. Full Name Input - 100% full width, 44px height */}
                <div className="w-full">
                  <label
                    htmlFor="register-name"
                    className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5"
                  >
                    Full Name
                  </label>
                  <div className="relative w-full">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      id="register-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (error) setError('');
                      }}
                      placeholder="Alex Morgan"
                      autoComplete="name"
                      className="w-full h-11 pl-10 pr-4 bg-slate-50/70 dark:bg-slate-900/80 hover:bg-slate-100/70 dark:hover:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-[13px] text-slate-900 dark:text-white placeholder-slate-400 focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                {/* 6. Email Address Input - 100% full width, 44px height */}
                <div className="w-full">
                  <label
                    htmlFor="register-email"
                    className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5"
                  >
                    Email Address
                  </label>
                  <div className="relative w-full">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      id="register-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError('');
                      }}
                      placeholder="name@example.com"
                      autoComplete="email"
                      className="w-full h-11 pl-10 pr-4 bg-slate-50/70 dark:bg-slate-900/80 hover:bg-slate-100/70 dark:hover:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-[13px] text-slate-900 dark:text-white placeholder-slate-400 focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                {/* 7. Password Input - 100% full width, 44px height */}
                <div className="w-full">
                  <label
                    htmlFor="register-password"
                    className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5"
                  >
                    Password (min. 6 characters)
                  </label>
                  <div className="relative w-full">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      id="register-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (error) setError('');
                      }}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className="w-full h-11 pl-10 pr-10 bg-slate-50/70 dark:bg-slate-900/80 hover:bg-slate-100/70 dark:hover:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-[13px] text-slate-900 dark:text-white placeholder-slate-400 focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:border-blue-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-md cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* 8. Confirm Password Input - 100% full width, 44px height */}
                <div className="w-full">
                  <label
                    htmlFor="register-confirm-password"
                    className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5"
                  >
                    Confirm Password
                  </label>
                  <div className="relative w-full">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      id="register-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (error) setError('');
                      }}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className="w-full h-11 pl-10 pr-10 bg-slate-50/70 dark:bg-slate-900/80 hover:bg-slate-100/70 dark:hover:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-[13px] text-slate-900 dark:text-white placeholder-slate-400 focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:border-blue-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-md cursor-pointer"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* 9. Terms Checkbox */}
                <div className="pt-0.5">
                  <label className="flex items-start gap-2 cursor-pointer select-none text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500/30 mt-0.5 shrink-0"
                    />
                    <span>
                      I agree to the cybersecurity terms of service and acknowledge that analyses are used solely for threat detection.
                    </span>
                  </label>
                </div>

                {/* 10. Create Account Button - 100% full width, 44px height */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 mt-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-60"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>Create Account</span>
                  )}
                </button>
              </form>

              {/* 11. OR CONTINUE WITH Divider */}
              <div className="relative my-2.5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100 dark:border-slate-800" />
                </div>
                <div className="relative flex justify-center text-[9px] uppercase">
                  <span className="bg-white dark:bg-[#0f172a] px-2.5 text-slate-400 font-semibold tracking-wider">
                    OR CONTINUE WITH
                  </span>
                </div>
              </div>

              {/* 12. Continue with Google Button - 100% full width, 44px height */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full h-11 flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 font-semibold text-xs sm:text-sm cursor-pointer shadow-2xs transition-all"
              >
                <GoogleIcon className="w-4 h-4 shrink-0" />
                <span>Continue with Google</span>
              </button>

              {/* 13. Guest Scan Link */}
              <div className="mt-2.5 text-center">
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Just want to test?{' '}
                  <Link
                    to="/detect"
                    className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Run a Guest Scan
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
