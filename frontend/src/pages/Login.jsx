import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { setCredentials, checkAuth } from '../store/slices/authSlice';
import { useTheme } from '../context/ThemeContext';
import {
  Shield,
  Mail,
  Lock,
  Eye,
  EyeOff,
  FileText,
  BarChart3,
  Database,
  ArrowRight,
  AlertCircle,
  Sun,
  Moon,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  LoginShieldIllustration,
} from '../components/auth/AuthIllustrations';

import { getApiBaseUrl, exchangeGoogleCode } from '../services/api';

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

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { isDark, toggleTheme } = useTheme();

  const { isAuthenticated } = useSelector((state) => state.auth);

  const initialEmail =
    location.state?.registeredEmail || localStorage.getItem('scamshield_remembered_email') || '';
  const initialSuccessMessage = location.state?.message || '';
  const fromPath = location.state?.from?.pathname || '/dashboard';
  const initialGoogleError = searchParams.get('error')
    ? decodeURIComponent(searchParams.get('error'))
    : '';

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(
    () => Boolean(localStorage.getItem('scamshield_remember_me') === 'true')
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(initialGoogleError);

  useEffect(() => {
    if (initialGoogleError) {
      toast.error(initialGoogleError);
    }
  }, [initialGoogleError]);

  // Handle Google OAuth callback parameters
  useEffect(() => {
    const googleAuth = searchParams.get('google_auth');
    const code = searchParams.get('code');
    if (googleAuth === 'success') {
      if (code) {
        // Secure single-use exchange code flow (NO JWT in URL!)
        exchangeGoogleCode(code)
          .then((userData) => {
            if (userData?.access_token) {
              localStorage.setItem('scamshield_token', userData.access_token);
            }
            dispatch(setCredentials(userData));
            toast.success(`Welcome back, ${userData.name || 'User'}!`);
            navigate(fromPath, { replace: true });
          })
          .catch((err) => {
            const failMsg =
              err.response?.data?.detail ||
              'Google authentication session expired or invalid. Please try signing in again.';
            setError(failMsg);
            toast.error(failMsg);
          });
      } else {
        // Fallback for cookie session (e.g. localhost)
        dispatch(checkAuth())
          .unwrap()
          .then((userData) => {
            toast.success(`Welcome back, ${userData.name || 'User'}!`);
            navigate(fromPath, { replace: true });
          })
          .catch(() => {
            const failMsg = 'Google authentication session expired or invalid.';
            setError(failMsg);
            toast.error(failMsg);
          });
      }
    }
  }, [searchParams, dispatch, navigate, fromPath]);

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/auth/google/login`;
  };

  useEffect(() => {
    if (initialSuccessMessage) {
      toast.success(initialSuccessMessage);
    }
  }, [initialSuccessMessage]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      const msg = 'Please enter your email address.';
      setError(msg);
      toast.error(msg);
      return;
    }

    if (!password) {
      const msg = 'Please enter your password.';
      setError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);

    try {
      if (rememberMe) {
        localStorage.setItem('scamshield_remember_me', 'true');
        localStorage.setItem('scamshield_remembered_email', trimmedEmail);
      } else {
        localStorage.removeItem('scamshield_remember_me');
        localStorage.removeItem('scamshield_remembered_email');
      }

      const response = await axios.post(
        `${API_BASE_URL}/auth/login`,
        {
          email: trimmedEmail,
          password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );

      if (response.data) {
        const userData = response.data;
        if (userData.access_token) {
          localStorage.setItem('scamshield_token', userData.access_token);
        }
        toast.success(`Welcome back, ${userData.name || 'User'}!`);
        dispatch(setCredentials(userData));
        navigate(fromPath, { replace: true });
      }
    } catch (err) {
      const detail = err.response?.data?.detail;
      const message =
        typeof detail === 'string'
          ? detail
          : Array.isArray(detail)
          ? detail[0]?.msg
          : err.message === 'Network Error'
          ? 'Cannot connect to backend server. Please verify backend is accessible.'
          : 'Invalid email or password. Please verify your credentials.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Branding Navigation Header - Full width white bar (height ~54px) */}
      <header className="w-full h-14 bg-[#0b101b] border-b border-slate-800/60 shrink-0 flex items-center">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 flex items-center justify-between">
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
              Don't have an account?
            </span>

            <Link
              to="/register"
              className="px-3.5 py-1.5 rounded-lg border border-slate-700/60 bg-slate-800/50 text-blue-400 hover:bg-slate-700/60 text-xs font-semibold shadow-sm transition-all"
            >
              Create Account
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Shifted Left with Small Outer Margin */}
      <main className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 pt-4 sm:pt-5 pb-8 flex-1">
        <div className="w-full flex flex-col lg:flex-row items-start justify-between gap-6 xl:gap-10">
          {/* LEFT SECTION (~500px wide): Security Proposition & 3 WIDE Feature Cards */}
          <div className="w-full lg:w-[480px] xl:w-[500px] space-y-5 text-left shrink-0">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/60 text-blue-600 dark:text-blue-400 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
              <span>Security Operations Access</span>
            </div>

            {/* Main Title */}
            <h1 className="text-2xl sm:text-3xl xl:text-[34px] font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.2]">
              Sign In to Your Security Operations Workspace
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Access your personalized detection history, 7-day activity telemetry, and manage saved scan assessments in an isolated environment.
            </p>

            {/* 3 WIDE Security Feature Cards (450–500px) */}
            <div className="space-y-3 pt-1">
              {/* Card 1: Comprehensive Detection Audit Log */}
              <div className="w-full flex items-center gap-4 p-3.5 rounded-xl bg-[#0d1424] border border-slate-800/60 shadow-sm hover:shadow-md hover:border-slate-700/60 transition-all">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                    Comprehensive Detection Audit Log
                  </p>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">
                    Review every past message, email, or URL scan with raw model scores.
                  </p>
                </div>
              </div>

              {/* Card 2: Real-Time 7-Day Dashboard Trends */}
              <div className="w-full flex items-center gap-4 p-3.5 rounded-xl bg-[#0d1424] border border-slate-800/60 shadow-sm hover:shadow-md hover:border-slate-700/60 transition-all">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                    Real-Time 7-Day Dashboard Trends
                  </p>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">
                    Track safe vs, phishing encounters across the last seven days.
                  </p>
                </div>
              </div>

              {/* Card 3: Relational PostgreSQL Persistence */}
              <div className="w-full flex items-center gap-4 p-3.5 rounded-xl bg-[#0d1424] border border-slate-800/60 shadow-sm hover:shadow-md hover:border-slate-700/60 transition-all">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <Database className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                    Relational PostgreSQL Persistence
                  </p>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">
                    Strictly user-scoped database isolation with encrypted sessions.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CENTER ILLUSTRATION (300-350px): 3D Cybersecurity Shield Illustration */}
          <div className="hidden lg:flex items-center justify-center shrink-0 w-[300px] xl:w-[340px]">
            <LoginShieldIllustration />
          </div>

          {/* RIGHT LOGIN CARD (~460px wide, exactly matching reference) */}
          <div
            className="w-full max-w-[460px] lg:w-[460px] shrink-0 relative flex items-center justify-center mx-auto lg:mx-0"
          >
            <div className="w-full bg-[#0d1424] rounded-2xl shadow-xl border border-slate-800/60 p-5 sm:p-8">
              {/* Top Lock Badge */}
              <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center mx-auto mb-3">
                <Lock className="w-5 h-5 stroke-[2.2]" />
              </div>

              {/* Title & Subtitle */}
              <div className="text-center mb-5">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Welcome Back
                </h2>
                <p className="text-xs text-slate-400 dark:text-slate-400 mt-1">
                  Enter your credentials to access ScamShield.
                </p>
              </div>

              {/* Error Banner */}
              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs flex items-center gap-2.5 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Login Form with Exactly Aligned Full-Width 46px Inputs */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {/* Email Field - 100% full width, 46px height */}
                <div className="w-full">
                  <label
                    htmlFor="login-email"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                  >
                    Email Address
                  </label>
                  <div className="relative w-full">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      id="login-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError('');
                      }}
                      placeholder="name@example.com"
                      autoComplete="email"
                      className="w-full h-[46px] pl-10 pr-4 bg-slate-50/70 dark:bg-slate-900/80 hover:bg-slate-100/70 dark:hover:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-[13px] text-slate-900 dark:text-white placeholder-slate-400 focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                {/* Password Field - 100% full width, 46px height */}
                <div className="w-full">
                  <label
                    htmlFor="login-password"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                  >
                    Password
                  </label>
                  <div className="relative w-full">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (error) setError('');
                      }}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className="w-full h-[46px] pl-10 pr-10 bg-slate-50/70 dark:bg-slate-900/80 hover:bg-slate-100/70 dark:hover:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-[13px] text-slate-900 dark:text-white placeholder-slate-400 focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:border-blue-500 transition-all"
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

                {/* Remember Me Checkbox & Forgot Password Link */}
                <div className="flex items-center justify-between pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600 dark:text-slate-400">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500/30"
                    />
                    <span>Remember email</span>
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>

                {/* Submit Button - Exactly matching input width, 46px height */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-[46px] mt-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-60"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Sign In to Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100 dark:border-slate-800" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-white dark:bg-[#0f172a] px-3 text-slate-400 font-semibold tracking-wider">
                    OR CONTINUE WITH
                  </span>
                </div>
              </div>

              {/* Continue with Google Button - Exactly matching input width, 46px height */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full h-[46px] flex items-center justify-center gap-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 font-semibold text-xs sm:text-sm cursor-pointer shadow-2xs transition-all"
              >
                <GoogleIcon className="w-4 h-4 shrink-0" />
                <span>Continue with Google</span>
              </button>

              {/* Bottom Card Footer */}
              <div className="mt-4 text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  New to ScamShield?{' '}
                  <Link
                    to="/register"
                    className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Create an account
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
