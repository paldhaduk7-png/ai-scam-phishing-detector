import React, { useState, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import {
  Shield,
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  X,
  Upload,
  Sun,
  Moon,
  Home,
  Info,
  Sparkles,
  Zap,
  ArrowRight,
  Camera,
} from 'lucide-react';
import { toast } from 'sonner';
import { getApiBaseUrl } from '../services/api';

const API_BASE_URL = getApiBaseUrl();

function GoogleIcon({ className = 'w-4 h-4' }) {
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
  const [phone, setPhone] = useState('');
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

  // Password Strength Calculation
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: 'bg-slate-200 dark:bg-slate-700', width: '0%' };
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (password.length < 6) {
      return { score: 1, label: 'Too short', color: 'bg-red-500', width: '25%' };
    }
    if (score <= 1) {
      return { score: 1, label: 'Weak', color: 'bg-amber-500', width: '35%' };
    }
    if (score === 2 || score === 3) {
      return { score: 2, label: 'Medium', color: 'bg-yellow-500', width: '65%' };
    }
    return { score: 3, label: 'Strong', color: 'bg-emerald-500', width: '100%' };
  }, [password]);

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

  const handleRemovePhoto = (e) => {
    e.stopPropagation();
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Form Submission
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
          ? 'Cannot connect to backend server. Please verify backend is accessible.'
          : 'Registration failed. Please review your details and try again.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#080d17] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Branding Navigation Header */}
      <header className="w-full h-16 bg-white/90 dark:bg-[#090d16]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 shrink-0 sticky top-0 z-40 transition-colors">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group focus-visible:outline-none">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white shadow-md shadow-blue-600/25 group-hover:scale-105 transition-transform shrink-0">
              <Shield className="w-5 h-5 fill-white/20 stroke-white stroke-[2.2]" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
                ScamShield
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400 mt-0.5">
                AI Defense
              </span>
            </div>
          </Link>

          {/* Center Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            <Link
              to="/about"
              className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <Info className="w-3.5 h-3.5" />
              <span>About</span>
            </Link>
          </nav>

          {/* Right Action Items */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Guest Run Detector Button */}
            <Link
              to="/detect"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-900/60 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all shadow-xs"
              title="Run threat detection immediately without signing in"
            >
              <Zap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 fill-blue-600/20" />
              <span>Try Guest Detector</span>
            </Link>

            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={() => {
                toggleTheme();
                toast.info(`Switched to ${isDark ? 'Light' : 'Dark'} Mode`);
              }}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600 hover:text-blue-600" />
              )}
            </button>

            {/* Sign In Link Button */}
            <Link
              to="/login"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-600/25 transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Main Centered Split-Card Layout with Fixed-Height Frame */}
      <main className="flex-1 flex items-center justify-center p-3 sm:p-5 lg:p-6 min-h-0">
        <div className="w-full max-w-5xl bg-white dark:bg-[#0d1424] rounded-[28px] border border-slate-200/80 dark:border-slate-800/80 shadow-xl shadow-slate-200/40 dark:shadow-none p-3 sm:p-4 flex flex-col lg:flex-row gap-5 lg:gap-6 items-stretch lg:h-[630px] xl:h-[650px] lg:max-h-[calc(100vh-100px)] overflow-hidden">
          
          {/* LEFT HERO GRADIENT CARD - Fixed / Static, never scrolls */}
          <div className="w-full lg:w-[44%] xl:w-[45%] rounded-[22px] bg-gradient-to-br from-[#0f1d3f] via-[#1d4ed8] to-[#3b82f6] p-6 lg:p-8 text-white flex flex-col justify-between relative overflow-hidden shadow-inner shrink-0 h-full">
            {/* Background subtle decoration rings */}
            <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-cyan-400/15 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-12 w-64 h-64 rounded-full bg-blue-900/40 blur-3xl pointer-events-none" />

            {/* Top Logo Badge */}
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 text-white font-bold text-xs shadow-xs">
                <Shield className="w-4 h-4 fill-white/30 stroke-white stroke-[2]" />
                <span>ScamShield</span>
              </div>

              {/* Sparkle Tag */}
              <div className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-100 mt-5 tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Join the Defense Network</span>
              </div>

              {/* Headline */}
              <h1 className="text-2xl sm:text-3xl lg:text-[30px] font-extrabold tracking-tight text-white leading-tight mt-2.5">
                Start your journey. Protect your workspace.
              </h1>

              {/* Sub-description */}
              <p className="text-xs sm:text-sm text-blue-100/90 mt-2.5 leading-relaxed">
                Create your security account to detect phishing emails, analyze fraudulent URLs, and protect your digital assets.
              </p>

              {/* Feature Checklist */}
              <div className="space-y-3 mt-5 pt-4 border-t border-white/15">
                <div className="flex items-start gap-2.5 text-xs sm:text-sm text-blue-50">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span>Real-time multi-vector scam & phishing inspection</span>
                </div>

                <div className="flex items-start gap-2.5 text-xs sm:text-sm text-blue-50">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span>Instant fraud score with explainable AI breakdown</span>
                </div>

                <div className="flex items-start gap-2.5 text-xs sm:text-sm text-blue-50">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span>Persistent audit trail and 7-day threat telemetry</span>
                </div>
              </div>
            </div>

            {/* Bottom Footnote */}
            <div className="relative z-10 pt-3 mt-4 border-t border-white/15">
              <p className="text-[11px] text-blue-200/80">
                Individual and organizational defense. One unified platform.
              </p>
            </div>
          </div>

          {/* RIGHT REGISTRATION FORM - ONLY this side is scrollable */}
          <div className="flex-1 h-full overflow-y-auto px-3 sm:px-6 lg:px-7 py-2 sm:py-3 overscroll-contain">
            <div className="max-w-md w-full mx-auto pb-4">
              {/* Header Title */}
              <div className="text-center mb-3">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Create account
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Sign up to get started with ScamShield AI.
                </p>
              </div>

              {/* UPPER-SIDE ROUND SHAPE PHOTO UPLOAD */}
              <div className="flex flex-col items-center justify-center mb-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-full border-2 border-dashed border-blue-400/80 dark:border-blue-500/60 bg-blue-50/60 dark:bg-blue-950/40 p-1 group cursor-pointer hover:border-blue-600 transition-all shadow-xs flex items-center justify-center"
                  title="Upload profile picture"
                >
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Avatar Preview"
                      className="w-full h-full rounded-full object-cover shadow-sm"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-blue-500 dark:text-blue-400 group-hover:scale-105 transition-transform">
                      <User className="w-7 h-7 sm:w-8 sm:h-8 stroke-[1.75]" />
                    </div>
                  )}

                  {/* Circular Camera Badge at bottom-right of round shape */}
                  <div className="absolute bottom-0 right-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-blue-600 group-hover:bg-blue-700 text-white flex items-center justify-center shadow-md border-2 border-white dark:border-[#0d1424] transition-colors">
                    <Camera className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {photoFile ? photoFile.name : 'Upload photo (optional)'}
                  </span>
                  {photoFile && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="text-[11px] font-medium text-red-500 hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Error Banner */}
              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Success Banner */}
              {successMsg && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Full Name */}
                <div>
                  <label
                    htmlFor="register-name"
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                  >
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Full Name</span>
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
                      placeholder="Enter your full name"
                      autoComplete="name"
                      className="w-full h-11 pl-10 pr-4 bg-[#f0f4f9] dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label
                    htmlFor="register-email"
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                  >
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>Email Address</span>
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
                      className="w-full h-11 pl-10 pr-4 bg-[#f0f4f9] dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                {/* Phone Number (Optional) */}
                <div>
                  <label
                    htmlFor="register-phone"
                    className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                  >
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>Phone Number</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-normal">Optional</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      id="register-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter phone number"
                      autoComplete="tel"
                      className="w-full h-11 pl-10 pr-4 bg-[#f0f4f9] dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                {/* Password Field with Strength Meter */}
                <div>
                  <label
                    htmlFor="register-password"
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                  >
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Password</span>
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
                      placeholder="Create a password"
                      autoComplete="new-password"
                      className="w-full h-11 pl-10 pr-10 bg-[#f0f4f9] dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
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

                  {/* Password Strength Indicator Bar */}
                  {password && (
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                          style={{ width: passwordStrength.width }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 min-w-10 text-right">
                        {passwordStrength.label}
                      </span>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="register-confirm-password"
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                  >
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Confirm Password</span>
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
                      placeholder="Confirm your password"
                      autoComplete="new-password"
                      className={`w-full h-11 pl-10 pr-10 bg-[#f0f4f9] dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 border rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all ${
                        confirmPassword && password !== confirmPassword
                          ? 'border-red-400 focus:border-red-500'
                          : 'border-slate-200 dark:border-slate-700 focus:border-blue-500'
                      }`}
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
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-[10px] text-red-500 mt-1">Passwords do not match.</p>
                  )}
                </div>

                {/* Terms of Service Checkbox */}
                <div className="pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600 dark:text-slate-400">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500/30"
                    />
                    <span>
                      I agree to the{' '}
                      <Link to="/about" className="text-blue-600 dark:text-blue-400 hover:underline">
                        Terms of Service
                      </Link>
                    </span>
                  </label>
                </div>

                {/* Primary Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Guest Run Option */}
              <div className="mt-3.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Zap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Just exploring? Try instant scan</span>
                </div>
                <Link
                  to="/detect"
                  className="font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <span>Guest Mode</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {/* Already have an account */}
              <div className="text-center mt-3.5 text-xs text-slate-600 dark:text-slate-400">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                  Sign in
                </Link>
              </div>

              {/* Divider */}
              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white dark:bg-[#0d1424] px-3 text-slate-400 font-medium">
                    OR
                  </span>
                </div>
              </div>

              {/* Google Sign-In Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-xs"
              >
                <GoogleIcon className="w-4 h-4" />
                <span>Continue with Google</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
