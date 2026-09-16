import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { setCredentials } from '../store/slices/authSlice';
import { useTheme } from '../context/ThemeContext';
import {
  Shield,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Zap,
  Users,
  MessageSquare,
  Link as LinkIcon,
  Bug,
  User,
  Sun,
  Moon,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, isDark, toggleTheme } = useTheme();

  const { isAuthenticated } = useSelector((state) => state.auth);

  const initialEmail = location.state?.registeredEmail || localStorage.getItem('scamshield_remembered_email') || '';
  const initialSuccessMessage = location.state?.message || '';
  const fromPath = location.state?.from?.pathname || '/dashboard';

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => Boolean(localStorage.getItem('scamshield_remember_me') === 'true'));

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState(initialSuccessMessage);

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
    <div className="min-h-screen bg-[#051129] text-white flex flex-col font-sans relative overflow-x-hidden selection:bg-cyan-500 selection:text-black">
      {/* Background Cyber Glow Gradients & Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(14,116,244,0.25),transparent_70%)] pointer-events-none" />
      <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/10 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-dots-pattern opacity-15 pointer-events-none" />

      {/* Top Navbar */}
      <header className="relative z-30 w-full px-6 lg:px-12 xl:px-16 py-5 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-blue-500 to-cyan-400 flex items-center justify-center text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] group-hover:scale-105 transition-transform">
            <Shield className="w-5 h-5 fill-white/20 stroke-white stroke-[2.2]" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xl font-bold tracking-tight text-white leading-tight">
              ScamShield
            </span>
            <span className="text-[10px] text-cyan-400 font-semibold tracking-wide">
              AI Scam &amp; Phishing Detector
            </span>
          </div>
        </Link>

        {/* Right Navigation */}
        <nav className="flex items-center gap-6 sm:gap-8">
          <div className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-300">
            <Link to="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <Link to="/detect" className="hover:text-white transition-colors">
              Detect
            </Link>
            <Link to="/about" className="hover:text-white transition-colors">
              About
            </Link>
          </div>

          <div className="hidden sm:block h-4 w-px bg-slate-700/60" />

          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={() => {
                toggleTheme();
                toast.info(`Switched input theme to ${isDark ? 'White / Light' : 'Dark'} Mode`);
              }}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-slate-200 shadow-xs transition-all cursor-pointer hover:scale-105 active:scale-95"
              title={isDark ? 'Switch input side to White / Light Mode' : 'Switch input side to Dark Mode'}
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
              ) : (
                <Moon className="w-4 h-4 text-cyan-300" />
              )}
            </button>

            {/* Login Button (Current active) */}
            <Link
              to="/login"
              className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-blue-500/40 bg-blue-600/15 text-white hover:bg-blue-600/25 transition-all shadow-xs"
            >
              Login
            </Link>

            {/* Register Button */}
            <Link
              to="/register"
              className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-[#1d6eed] hover:bg-blue-600 text-white transition-all shadow-[0_0_20px_rgba(29,110,237,0.4)] active:scale-95"
            >
              Register
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content: Split 2 Columns */}
      <main className="flex-1 relative z-20 w-full px-6 lg:px-12 xl:px-16 py-6 lg:py-10 flex flex-col lg:flex-row items-center justify-between gap-8 xl:gap-14">
        
        {/* LEFT COLUMN: Hero Presentation + 3D Shield on Pedestal + Badges */}
        <div className="flex-1 w-full flex flex-col justify-center text-left space-y-7 max-w-3xl">
          
          {/* Main Hero Header */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-[46px] font-extrabold tracking-tight leading-[1.15] text-white">
              Stay Safe from <br />
              <span className="text-[#38bdf8]">Scams</span> and{' '}
              <span className="text-[#38bdf8]">Phishing</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-lg leading-relaxed pt-1 font-normal">
              AI-powered detection for emails, messages and suspicious URLs.<br />
              Fast. Accurate. Secure.
            </p>
          </div>

          {/* Central 3D Cyber Shield Illustration with Floating Feature Cards & Glowing Pedestal */}
          <div className="relative w-full max-w-[430px] mx-auto lg:mx-0 py-8 flex flex-col items-center justify-center select-none">
            
            {/* Outer Concentric Radar Rings */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-68 h-68 sm:w-72 sm:h-72 rounded-full border border-cyan-500/20 bg-cyan-500/5 animate-pulse" />
              <div className="absolute w-84 h-84 sm:w-88 sm:h-88 rounded-full border border-blue-500/15" />
            </div>

            {/* Glowing 3D Shield Container */}
            <div className="relative z-10 flex flex-col items-center justify-center">
              {/* SVG 3D Shield with Neon Glow */}
              <div className="relative w-40 h-48 sm:w-46 sm:h-54 flex items-center justify-center filter drop-shadow-[0_0_35px_rgba(6,182,212,0.55)]">
                <svg viewBox="0 0 100 120" className="w-full h-full fill-[#0c224e]/90 stroke-[#38bdf8] stroke-[3.2]">
                  <path d="M50 6 L88 22 C88 78 50 114 50 114 C50 114 12 78 12 22 Z" />
                </svg>
                
                {/* Central Glowing Padlock Emblem */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-[#1d6eed] via-[#2563eb] to-[#38bdf8] flex items-center justify-center text-white shadow-[0_0_25px_rgba(56,189,248,0.7)]">
                    <Lock className="w-8 h-8 sm:w-10 sm:h-10 stroke-[2.4]" />
                  </div>
                </div>
              </div>

              {/* Glowing Pedestal Platform */}
              <div className="relative w-64 sm:w-72 h-10 sm:h-12 -mt-7 flex items-center justify-center">
                <div className="w-full h-full rounded-[100%] bg-gradient-to-b from-[#38bdf8]/40 via-[#1d6eed]/50 to-transparent border border-[#38bdf8]/80 shadow-[0_0_25px_rgba(56,189,248,0.7)] flex items-center justify-center">
                  <div className="w-[85%] h-[60%] rounded-[100%] bg-gradient-to-b from-[#38bdf8]/20 to-[#0c224e]/80 border border-cyan-300/40" />
                </div>
              </div>
            </div>

            {/* Floating Card Top-Left: Email */}
            <div className="absolute top-2 -left-2 sm:-left-4 z-20 flex items-center gap-3 p-3 rounded-2xl bg-[#0d214a]/95 border border-[#38bdf8]/40 shadow-xl shadow-black/50 backdrop-blur-md transition-transform hover:-translate-y-0.5">
              <div className="w-9 h-9 rounded-xl bg-[#1d6eed] text-white flex items-center justify-center shadow-md shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div className="text-left pr-2">
                <p className="text-xs font-bold text-white leading-tight">Email</p>
                <p className="text-[10px] text-slate-300">Detect phishing emails</p>
              </div>
            </div>

            {/* Floating Card Top-Right: Messages */}
            <div className="absolute top-2 -right-2 sm:-right-4 z-20 flex items-center gap-3 p-3 rounded-2xl bg-[#0d214a]/95 border border-[#38bdf8]/40 shadow-xl shadow-black/50 backdrop-blur-md transition-transform hover:-translate-y-0.5">
              <div className="w-9 h-9 rounded-xl bg-[#1d6eed] text-white flex items-center justify-center shadow-md shrink-0">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="text-left pr-2">
                <p className="text-xs font-bold text-white leading-tight">Messages</p>
                <p className="text-[10px] text-slate-300">Identify scam SMS/texts</p>
              </div>
            </div>

            {/* Floating Card Bottom: URLs */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 p-3 rounded-2xl bg-[#0d214a]/95 border border-[#38bdf8]/40 shadow-xl shadow-black/50 backdrop-blur-md transition-transform hover:-translate-y-0.5">
              <div className="w-9 h-9 rounded-xl bg-[#1d6eed] text-white flex items-center justify-center shadow-md shrink-0">
                <LinkIcon className="w-5 h-5" />
              </div>
              <div className="text-left pr-2">
                <p className="text-xs font-bold text-white leading-tight">URLs</p>
                <p className="text-[10px] text-slate-300">Check suspicious links</p>
              </div>
            </div>

            {/* Cyber security nodes */}
            <div className="absolute left-4 bottom-8 w-8 h-8 rounded-full bg-[#0d214a] border border-[#38bdf8]/50 flex items-center justify-center text-[#38bdf8] shadow-md">
              <User className="w-4 h-4" />
            </div>
            <div className="absolute right-4 bottom-8 w-8 h-8 rounded-full bg-[#0d214a] border border-[#38bdf8]/50 flex items-center justify-center text-[#38bdf8] shadow-md">
              <Bug className="w-4 h-4" />
            </div>
          </div>

          {/* 3 Pillars Row */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-3 border-t border-blue-900/40">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 text-[#38bdf8] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-white">AI-Powered</p>
                <p className="text-[11px] text-slate-400">Advanced ML &amp; DL</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 text-[#38bdf8] flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-white">Real-time</p>
                <p className="text-[11px] text-slate-400">Instant Analysis</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 text-[#38bdf8] flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-white">Stay Informed</p>
                <p className="text-[11px] text-slate-400">Safer Digital Life</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: The Input Card (Adapts seamlessly between White & Dark Mode) */}
        <div className="w-full lg:w-[460px] xl:w-[480px]">
          <div
            className={`rounded-3xl p-7 sm:p-9 shadow-2xl transition-all duration-300 border ${
              isDark
                ? 'bg-[#0a1630]/95 backdrop-blur-xl text-white border-blue-900/70 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(30,58,138,0.25)]'
                : 'bg-white text-slate-900 border-slate-200/80 shadow-2xl shadow-black/40'
            }`}
          >
            {/* Card Brand Emblem */}
            <div className="flex flex-col items-center justify-center text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1d6eed] to-[#38bdf8] flex items-center justify-center text-white shadow-lg shadow-blue-500/25 mb-2.5">
                <Shield className="w-6 h-6 fill-white/20 stroke-white stroke-[2.2]" />
              </div>
              <span
                className={`text-xl font-extrabold tracking-tight ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                Scam<span className="text-[#1d6eed]">Shield</span>
              </span>
              <span
                className={`text-[10px] font-medium ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                AI Scam &amp; Phishing Detector
              </span>

              <h2
                className={`text-2xl font-extrabold tracking-tight mt-3 ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                Welcome Back
              </h2>
              <p
                className={`text-xs mt-0.5 ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                Sign in to continue protecting yourself.
              </p>
            </div>

            {/* Error banner */}
            {error && (
              <div
                className={`mb-4 p-3 rounded-xl border flex items-center gap-2.5 text-xs font-medium animate-fadeIn ${
                  isDark
                    ? 'bg-red-950/50 border-red-900/60 text-red-300'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}
              >
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Success banner */}
            {successMsg && (
              <div
                className={`mb-4 p-3 rounded-xl border flex items-center gap-2.5 text-xs font-medium animate-fadeIn ${
                  isDark
                    ? 'bg-emerald-950/50 border-emerald-900/60 text-emerald-300'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Email Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Email address"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium transition-all focus:outline-hidden ${
                    isDark
                      ? 'bg-[#112044] border border-blue-800/70 hover:border-blue-700 text-white placeholder:text-slate-400 focus:bg-[#162a54] focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20'
                      : 'bg-white border border-slate-300 hover:border-slate-400 text-slate-900 placeholder:text-slate-400 focus:border-[#1d6eed] focus:ring-4 focus:ring-blue-500/15'
                  }`}
                />
              </div>

              {/* Password Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Password"
                  className={`w-full pl-10 pr-11 py-3 rounded-xl text-sm font-medium transition-all focus:outline-hidden ${
                    isDark
                      ? 'bg-[#112044] border border-blue-800/70 hover:border-blue-700 text-white placeholder:text-slate-400 focus:bg-[#162a54] focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20'
                      : 'bg-white border border-slate-300 hover:border-slate-400 text-slate-900 placeholder:text-slate-400 focus:border-[#1d6eed] focus:ring-4 focus:ring-blue-500/15'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Remember me & Forgot Password */}
              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded-sm text-[#1d6eed] border-slate-300 dark:border-slate-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span
                    className={`text-xs font-medium ${
                      isDark ? 'text-slate-300' : 'text-slate-600'
                    }`}
                  >
                    Remember me
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() => toast.info('Password reset instructions will be sent to your registered email.')}
                  className="text-xs font-semibold text-[#1d6eed] hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-[#1d6eed] hover:bg-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>

            {/* OR Divider */}
            <div className="relative my-5 text-center">
              <div className="absolute inset-0 flex items-center">
                <div
                  className={`w-full border-t ${
                    isDark ? 'border-blue-900/50' : 'border-slate-200'
                  }`}
                />
              </div>
              <span
                className={`relative px-3 text-[11px] font-bold uppercase tracking-widest ${
                  isDark ? 'bg-[#0a1630] text-slate-400' : 'bg-white text-slate-400'
                }`}
              >
                OR
              </span>
            </div>

            {/* Continue as Guest Box */}
            <button
              type="button"
              onClick={() => navigate('/detect')}
              className={`w-full p-3 rounded-xl border transition-all cursor-pointer text-center group ${
                isDark
                  ? 'border-blue-800/60 bg-[#101e40] hover:bg-[#152752] text-cyan-300'
                  : 'border-blue-200 bg-blue-50/50 hover:bg-blue-100/60 text-blue-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-bold group-hover:underline">
                <ShieldCheck className="w-4 h-4" />
                <span>Continue as Guest</span>
              </div>
              <p
                className={`text-[11px] mt-0.5 ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                Need a quick scan? You can detect scams without logging in.
              </p>
            </button>

            {/* Switch to Register */}
            <div
              className={`mt-5 text-center text-xs ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}
            >
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-bold text-[#1d6eed] hover:underline ml-1"
              >
                Create Account
              </Link>
            </div>

            {/* Security Guarantee Footer */}
            <div
              className={`mt-5 pt-3.5 border-t flex items-center justify-center gap-2 text-[11px] ${
                isDark
                  ? 'border-blue-950 text-slate-500'
                  : 'border-slate-100 text-slate-400'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Your data is secure and never shared with third parties.</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
