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
  ArrowRight,
  AlertCircle,
  Sun,
  Moon,
  Home,
  Info,
  Sparkles,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
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
    location.state?.registeredEmail || location.state?.email || localStorage.getItem('scamshield_remembered_email') || '';
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

            {/* Sign Up Link Button */}
            <Link
              to="/register"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-600/25 transition-all"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Main Centered Split-Card Layout */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-5xl bg-white dark:bg-[#0d1424] rounded-[28px] border border-slate-200/80 dark:border-slate-800/80 shadow-xl shadow-slate-200/40 dark:shadow-none p-3 sm:p-4 md:p-5 flex flex-col lg:flex-row gap-6 lg:gap-8 items-stretch">
          
          {/* LEFT HERO GRADIENT CARD - Matches ScamShield Brand (Deep Navy to Electric Blue) */}
          <div className="w-full lg:w-[46%] rounded-[22px] bg-gradient-to-br from-[#0f1d3f] via-[#1d4ed8] to-[#3b82f6] p-6 sm:p-8 lg:p-10 text-white flex flex-col justify-between relative overflow-hidden shadow-inner">
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
              <div className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-100 mt-6 tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>AI-Powered Threat Protection</span>
              </div>

              {/* Headline */}
              <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-extrabold tracking-tight text-white leading-tight mt-3">
                Smart security that protects your digital world.
              </h1>

              {/* Sub-description */}
              <p className="text-xs sm:text-sm text-blue-100/90 mt-3 leading-relaxed">
                Real-time scam detection, phishing URL analysis, and email security powered by explainable machine learning.
              </p>
            </div>

            {/* Bottom Section: Metrics & Footnote */}
            <div className="relative z-10 pt-6 mt-6 border-t border-white/15">
              {/* 3 Metric Stats */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <div className="text-xl sm:text-2xl font-black text-white tracking-tight">99.4%</div>
                  <div className="text-[11px] text-blue-100 font-medium mt-0.5">Threat Accuracy</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-white tracking-tight">50K+</div>
                  <div className="text-[11px] text-blue-100 font-medium mt-0.5">Scans Analyzed</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-white tracking-tight">24/7</div>
                  <div className="text-[11px] text-blue-100 font-medium mt-0.5">Active Shield</div>
                </div>
              </div>

              {/* Footnote */}
              <p className="text-[11px] text-blue-200/80 mt-6 pt-3 border-t border-white/10">
                Protecting individuals and organizations from evolving cyber threats.
              </p>
            </div>
          </div>

          {/* RIGHT LOGIN FORM */}
          <div className="flex-1 flex flex-col justify-center px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="max-w-md w-full mx-auto">
              {/* Header Title */}
              <div className="mb-6">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Welcome back
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Login to access your security operations dashboard.
                </p>
              </div>

              {/* Error Banner */}
              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Address */}
                <div>
                  <label
                    htmlFor="login-email"
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                  >
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>Email Address</span>
                    <span className="text-red-500 font-bold">*</span>
                  </label>
                  <div className="relative">
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
                      className="w-full h-12 pl-10 pr-4 bg-[#f0f4f9] dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="login-password"
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                  >
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Password</span>
                    <span className="text-red-500 font-bold">*</span>
                  </label>
                  <div className="relative">
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
                      className="w-full h-12 pl-10 pr-10 bg-[#f0f4f9] dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
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

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between pt-1">
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
                    Forgot password?
                  </Link>
                </div>

                {/* Primary Login Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Login</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Guest Run Option */}
              <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Just want to scan a message or URL?</span>
                </div>
                <Link
                  to="/detect"
                  className="font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <span>Guest Scan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Don't have an account link */}
              <div className="text-center mt-5 text-xs text-slate-600 dark:text-slate-400">
                Don't have an account?{' '}
                <Link to="/register" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                  Sign up
                </Link>
              </div>

              {/* Divider */}
              <div className="relative my-5">
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
