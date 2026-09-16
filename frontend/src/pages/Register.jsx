import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
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
  UserCheck,
} from 'lucide-react';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export default function Register() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { isDark, toggleTheme } = useTheme();

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
      const msg = 'Passwords do not match.';
      setError(msg);
      toast.error(msg);
      return;
    }

    if (!agreeTerms) {
      const msg = 'Please agree to the Terms of Service to continue.';
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
      formData.append('confirm_password', confirmPassword);

      if (photoFile) {
        formData.append('profile_photo', photoFile);
      }

      const response = await axios.post(`${API_BASE_URL}/auth/register`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });

      if (response.status === 201 || response.data) {
        setSuccessMsg('Account registered successfully! Redirecting to login...');
        toast.success('Registration successful! Redirecting to login...');

        localStorage.setItem('scamshield_remembered_email', trimmedEmail);

        setTimeout(() => {
          navigate('/login', {
            replace: true,
            state: {
              registeredEmail: trimmedEmail,
              message: 'Account created successfully! Please sign in with your password.',
            },
          });
        }, 1000);
      }
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
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Simple Navigation Header */}
      <header className="w-full px-6 lg:px-12 py-4 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-[#0b101b]/70 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group focus-visible:outline-none">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white shadow-md shadow-blue-600/20 group-hover:scale-105 transition-transform shrink-0">
            <Shield className="w-5 h-5 fill-white/20 stroke-white stroke-[2.2]" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white block leading-tight">
              ScamShield
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400">
              Cybersecurity
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={() => {
              toggleTheme();
              toast.info(`Switched to ${isDark ? 'Light' : 'Dark'} Mode`);
            }}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-slate-200/60 dark:border-slate-800"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-blue-600" />
            )}
          </button>

          <Link
            to="/login"
            className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline px-2"
          >
            Already have an account?
          </Link>
        </div>
      </header>

      {/* Main Dual-Column Canvas */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-16">
        {/* Left Column: Why Register with ScamShield (Desktop) */}
        <div className="flex-1 max-w-lg space-y-6 text-left">
          <Badge status="info" size="md">
            Personal Security Suite
          </Badge>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white leading-tight">
            Create Your ScamShield Account
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Create a personal workspace to persist your threat detection history, unlock 7-day activity metrics, and customize your profile.
          </p>

          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <History className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Automated Scan History Persistence
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Save every message, email, or URL scan to your private PostgreSQL log.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Activity className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  7-Day Security Operations Trends
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Monitor your personal daily encounter metrics (Safe vs. Phishing).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <UserCheck className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Profile Personalization &amp; Avatar
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Optional cloud avatar image management powered by Cloudinary.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Clean Registration Form Card */}
        <div className="w-full max-w-md">
          <Card className="p-7 sm:p-9 shadow-lg dark:shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/50 flex items-center justify-center mx-auto mb-3 shadow-2xs">
                <User className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Create Account
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Enter your details to register for ScamShield.
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs flex items-center gap-2.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Success Banner */}
            {successMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2.5 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Optional Avatar Upload Area */}
              <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800">
                {photoPreview ? (
                  <div className="relative">
                    <img
                      src={photoPreview}
                      alt="Avatar Preview"
                      className="w-12 h-12 rounded-xl object-cover ring-2 ring-blue-500/30 shrink-0"
                    />
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="absolute -top-1.5 -right-1.5 p-0.5 rounded-full bg-red-600 text-white hover:bg-red-700 shadow-xs"
                      aria-label="Remove photo"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-blue-100/70 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-dashed border-blue-300 dark:border-blue-800">
                    <Upload className="w-5 h-5" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Profile Photo (Optional)
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">
                    JPG, PNG or WEBP under 5MB
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline mt-0.5 block cursor-pointer"
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

              {/* Full Name Input */}
              <div>
                <label
                  htmlFor="register-name"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Full Name
                </label>
                <div className="relative">
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
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/80 hover:bg-slate-100/70 dark:hover:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Email Address Input */}
              <div>
                <label
                  htmlFor="register-email"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Email Address
                </label>
                <div className="relative">
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
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/80 hover:bg-slate-100/70 dark:hover:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label
                  htmlFor="register-password"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Password (min. 6 characters)
                </label>
                <div className="relative">
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
                    className="w-full pl-10 pr-11 py-2.5 bg-slate-50 dark:bg-slate-900/80 hover:bg-slate-100/70 dark:hover:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:border-blue-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div>
                <label
                  htmlFor="register-confirm-password"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Confirm Password
                </label>
                <div className="relative">
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
                    className="w-full pl-10 pr-11 py-2.5 bg-slate-50 dark:bg-slate-900/80 hover:bg-slate-100/70 dark:hover:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:border-blue-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md cursor-pointer"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Agree to Terms */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer select-none text-xs text-slate-600 dark:text-slate-400">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500/30 mt-0.5"
                  />
                  <span>
                    I agree to the cybersecurity terms of service and acknowledge that analyses are used solely for threat detection.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={loading}
                className="w-full rounded-xl mt-2 font-semibold shadow-xs shadow-blue-600/25"
              >
                Create Account
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Already registered?{' '}
                <Link
                  to="/login"
                  className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Sign in to your account
                </Link>
              </p>
            </div>
          </Card>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="py-6 border-t border-slate-200/80 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
        <p>&copy; {new Date().getFullYear()} ScamShield — Enterprise AI Multi-Vector Threat Intelligence.</p>
      </footer>
    </div>
  );
}
