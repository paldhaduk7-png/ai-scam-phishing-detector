import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { setCredentials } from '../store/slices/authSlice';
import { useTheme } from '../context/ThemeContext';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import {
  Shield,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Zap,
  AlertCircle,
  Sun,
  Moon,
  Database,
  History,
} from 'lucide-react';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();

  const { isAuthenticated } = useSelector((state) => state.auth);

  const initialEmail =
    location.state?.registeredEmail || localStorage.getItem('scamshield_remembered_email') || '';
  const initialSuccessMessage = location.state?.message || '';
  const fromPath = location.state?.from?.pathname || '/dashboard';

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(
    () => Boolean(localStorage.getItem('scamshield_remember_me') === 'true')
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
          ? 'Cannot connect to backend server. Please verify backend is running on port 8000.'
          : 'Invalid email or password. Please verify your credentials.';
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
            to="/register"
            className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline px-2"
          >
            Don't have an account?
          </Link>
        </div>
      </header>

      {/* Main Dual-Column Authentication Canvas */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-16">
        {/* Left Column: Security Value Proposition (Desktop) */}
        <div className="flex-1 max-w-lg space-y-6 text-left">
          <Badge status="info" size="md">
            Security Operations Access
          </Badge>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white leading-tight">
            Sign In to Your Security Operations Workspace
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Access your personalized detection history, 7-day activity telemetry, and manage saved scan assessments in an isolated environment.
          </p>

          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <History className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Comprehensive Detection Audit Log
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Review every past message, email, or URL scan with raw model scores.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Zap className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Real-Time 7-Day Dashboard Trends
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Track safe vs. phishing encounters across the last seven days.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 shadow-2xs">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Database className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Relational PostgreSQL Persistence
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Strictly user-scoped database isolation with encrypted sessions.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Clean Login Form Card */}
        <div className="w-full max-w-md">
          <Card className="p-7 sm:p-9 shadow-lg dark:shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/50 flex items-center justify-center mx-auto mb-3 shadow-2xs">
                <Lock className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Welcome Back
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
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

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="login-email"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Email Address
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
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/80 hover:bg-slate-100/70 dark:hover:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="login-password"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Password
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

              {/* Remember Me Checkbox */}
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
                  to="/detect"
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Guest Scan
                </Link>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={loading}
                className="w-full rounded-xl mt-2 font-semibold shadow-xs shadow-blue-600/25"
              >
                Sign In to Account
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                New to ScamShield?{' '}
                <Link
                  to="/register"
                  className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </Card>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="py-6 border-t border-slate-200/80 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
        <p>&copy; {new Date().getFullYear()} ScamShield — Protected by AI Multi-Vector Threat Intelligence.</p>
      </footer>
    </div>
  );
}
