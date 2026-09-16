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
  ShieldCheck,
  Users,
  MessageSquare,
  Link as LinkIcon,
  BarChart3,
  Sun,
  Moon,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export default function Register() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { theme, isDark, toggleTheme } = useTheme();

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
    <div className="min-h-screen bg-[#051129] text-white flex flex-col font-sans relative overflow-x-hidden selection:bg-cyan-500 selection:text-black">
      {/* Background Cyber Glow Gradients & Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(14,116,244,0.25),transparent_70%)] pointer-events-none" />
      <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/10 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-dots-pattern opacity-15 pointer-events-none" />

      {/* Top Navbar - Aligns with main content */}
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
        <nav className="flex items-center gap-5 sm:gap-7">
          <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-300">
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

            {/* Login Button */}
            <Link
              to="/login"
              className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-slate-700/60 bg-white/5 text-slate-200 hover:bg-white/10 transition-all shadow-xs"
            >
              Login
            </Link>

            {/* Register Button (Current active) */}
            <Link
              to="/register"
              className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-[#1d6eed] hover:bg-blue-600 text-white transition-all shadow-[0_0_20px_rgba(29,110,237,0.4)] active:scale-95"
            >
              Register
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content: Full-width responsive layout without empty left margin */}
      <main className="flex-1 relative z-20 w-full px-6 lg:px-12 xl:px-16 py-4 lg:py-6 flex flex-col lg:flex-row items-center justify-between gap-8 xl:gap-12">
        
        {/* LEFT COLUMN: Features List + 3D Shield Graphic + Quotes matching reference exactly */}
        <div className="flex-1 w-full flex flex-col justify-center text-left space-y-5 lg:space-y-6 max-w-3xl xl:max-w-4xl">
          
          {/* Tag & Title */}
          <div className="space-y-2">
            <span className="text-xs font-bold tracking-widest text-[#38bdf8] uppercase">
              SAFER PEOPLE. A SAFER INTERNET.
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold tracking-tight leading-[1.15] text-white">
              Create an Account <br />
              for a <span className="text-[#38bdf8]">Safer Tomorrow</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed pt-0.5 font-normal">
              Join ScamShield and get access to your scan history, personalized insights, and more. Detection is always available without an account.
            </p>
          </div>

          {/* Left Feature Pillars + Central 3D Shield Grouped Naturally without Empty Space */}
          <div className="flex flex-col md:flex-row items-center justify-start gap-6 sm:gap-10 xl:gap-14 pt-1">
            
            {/* 3 Value Pillars */}
            <div className="w-full md:w-64 xl:w-72 shrink-0 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#0c2049] border border-blue-500/30 text-[#38bdf8] flex items-center justify-center shrink-0 shadow-md">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-white leading-tight">Track Your History</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">View and manage all your scans</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#0c2049] border border-blue-500/30 text-[#38bdf8] flex items-center justify-center shrink-0 shadow-md">
                  <User className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-white leading-tight">Personalized Dashboard</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Get insights and stay informed</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#0c2049] border border-blue-500/30 text-[#38bdf8] flex items-center justify-center shrink-0 shadow-md">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-white leading-tight">Protect What Matters</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">AI-powered detection for emails, messages and URLs</p>
                </div>
              </div>
            </div>

            {/* Central 3D Shield on Glowing Pedestal with Floating Cards */}
            <div className="w-72 sm:w-80 shrink-0 flex flex-col items-center justify-center relative min-h-[240px] py-4 select-none">
              
              {/* Outer Radar Rings */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-56 h-56 rounded-full border border-cyan-500/20 bg-cyan-500/5 animate-pulse" />
              </div>

              {/* Glowing 3D Shield */}
              <div className="relative z-10 flex flex-col items-center justify-center">
                <div className="relative w-36 h-44 sm:w-40 sm:h-48 flex items-center justify-center filter drop-shadow-[0_0_30px_rgba(6,182,212,0.6)]">
                  <svg viewBox="0 0 100 120" className="w-full h-full fill-[#0c224e]/90 stroke-[#38bdf8] stroke-[3.2]">
                    <path d="M50 6 L88 22 C88 78 50 114 50 114 C50 114 12 78 12 22 Z" />
                  </svg>
                  
                  {/* Central Padlock */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-tr from-[#1d6eed] to-[#38bdf8] flex items-center justify-center text-white shadow-[0_0_22px_rgba(56,189,248,0.7)]">
                      <Lock className="w-8 h-8 stroke-[2.4]" />
                    </div>
                  </div>
                </div>

                {/* Pedestal Base */}
                <div className="relative w-60 sm:w-68 h-10 -mt-6 flex items-center justify-center">
                  <div className="w-full h-full rounded-[100%] bg-gradient-to-b from-[#38bdf8]/40 via-[#1d6eed]/50 to-transparent border border-[#38bdf8]/80 shadow-[0_0_22px_rgba(56,189,248,0.7)] flex items-center justify-center">
                    <div className="w-[85%] h-[60%] rounded-[100%] bg-gradient-to-b from-[#38bdf8]/20 to-[#0c224e]/80 border border-cyan-300/40" />
                  </div>
                </div>
              </div>

              {/* Floating Cards matching reference */}
              <div className="absolute top-2 left-2 sm:left-4 z-20 flex items-center gap-2.5 p-2.5 rounded-xl bg-[#0d214a]/95 border border-[#38bdf8]/40 shadow-lg">
                <div className="w-7 h-7 rounded-lg bg-[#1d6eed] text-white flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-bold text-white leading-tight">Email</p>
                  <p className="text-[9px] text-slate-300">Detect phishing emails</p>
                </div>
              </div>

              <div className="absolute top-2 right-2 sm:right-4 z-20 flex items-center gap-2.5 p-2.5 rounded-xl bg-[#0d214a]/95 border border-[#38bdf8]/40 shadow-lg">
                <div className="w-7 h-7 rounded-lg bg-[#1d6eed] text-white flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-bold text-white leading-tight">Messages</p>
                  <p className="text-[9px] text-slate-300">Identify scam SMS/texts</p>
                </div>
              </div>

              <div className="absolute bottom-1 right-4 sm:right-8 z-20 flex items-center gap-2.5 p-2.5 rounded-xl bg-[#0d214a]/95 border border-[#38bdf8]/40 shadow-lg">
                <div className="w-7 h-7 rounded-lg bg-[#1d6eed] text-white flex items-center justify-center">
                  <LinkIcon className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-bold text-white leading-tight">URLs</p>
                  <p className="text-[9px] text-slate-300">Check suspicious links</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row: Handwritten Quote & Motto Accent */}
          <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-blue-900/40">
            <div className="italic font-serif text-xl sm:text-2xl text-slate-200 tracking-wide font-normal">
              Small Scans, Big Protection
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0d214a]/80 border border-blue-500/30 text-xs text-slate-300">
              <span>“ AI today. A safer tomorrow. ”</span>
              <span className="text-[#38bdf8] font-semibold">— ScamShield</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: The Form Card matching reference */}
        <div className="w-full lg:w-[460px] xl:w-[480px] shrink-0">
          <div
            className={`rounded-3xl p-6 sm:p-7 shadow-2xl transition-all duration-300 border ${
              isDark
                ? 'bg-[#0a1630]/95 backdrop-blur-xl text-white border-blue-900/70 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(30,58,138,0.25)]'
                : 'bg-white text-slate-900 border-slate-200/90 shadow-2xl shadow-black/40'
            }`}
          >
            {/* Card Brand Emblem */}
            <div className="flex flex-col items-center justify-center text-center mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1d6eed] to-[#38bdf8] flex items-center justify-center text-white shadow-lg shadow-blue-500/25 mb-2">
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
                className={`text-2xl font-extrabold tracking-tight mt-2 ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                Create Your Account
              </h2>
              <p
                className={`text-xs mt-0.5 ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                Start protecting yourself with AI-powered scam detection.
              </p>
            </div>

            {/* Error banner */}
            {error && (
              <div
                className={`mb-3 p-2.5 rounded-xl border flex items-center gap-2.5 text-xs font-medium animate-fadeIn ${
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
                className={`mb-3 p-2.5 rounded-xl border flex items-center gap-2.5 text-xs font-medium animate-fadeIn ${
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
            <form onSubmit={handleSubmit} className="space-y-3">
              
              {/* Full Name */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Enter your full name"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium transition-all focus:outline-hidden ${
                    isDark
                      ? 'bg-[#112044] border border-blue-800/70 hover:border-blue-700 text-white placeholder:text-slate-400 focus:bg-[#162a54] focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20'
                      : 'bg-white border border-slate-300 hover:border-slate-400 text-slate-900 placeholder:text-slate-400 focus:border-[#1d6eed] focus:ring-4 focus:ring-blue-500/15'
                  }`}
                />
              </div>

              {/* Email Address */}
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
                  placeholder="Enter your email address"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium transition-all focus:outline-hidden ${
                    isDark
                      ? 'bg-[#112044] border border-blue-800/70 hover:border-blue-700 text-white placeholder:text-slate-400 focus:bg-[#162a54] focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20'
                      : 'bg-white border border-slate-300 hover:border-slate-400 text-slate-900 placeholder:text-slate-400 focus:border-[#1d6eed] focus:ring-4 focus:ring-blue-500/15'
                  }`}
                />
              </div>

              {/* Password */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Create a password"
                  className={`w-full pl-10 pr-11 py-2.5 rounded-xl text-sm font-medium transition-all focus:outline-hidden ${
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

              {/* Confirm Password */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Confirm your password"
                  className={`w-full pl-10 pr-11 py-2.5 rounded-xl text-sm font-medium transition-all focus:outline-hidden ${
                    isDark
                      ? 'bg-[#112044] border border-blue-800/70 hover:border-blue-700 text-white placeholder:text-slate-400 focus:bg-[#162a54] focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20'
                      : 'bg-white border border-slate-300 hover:border-slate-400 text-slate-900 placeholder:text-slate-400 focus:border-[#1d6eed] focus:ring-4 focus:ring-blue-500/15'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                  tabIndex={-1}
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Profile Photo (Optional) */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoChange}
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
              />

              <div
                className={`flex items-center justify-between gap-3 p-2.5 rounded-xl border transition-all ${
                  isDark
                    ? 'bg-[#112044]/80 border-blue-800/70'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {photoPreview ? (
                    <div className="relative shrink-0">
                      <img
                        src={photoPreview}
                        alt="Profile preview"
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-[#1d6eed]"
                      />
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] cursor-pointer"
                        title="Remove photo"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ) : (
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      <User className="w-5 h-5" />
                    </div>
                  )}

                  <div className="text-left min-w-0">
                    <p
                      className={`text-xs font-bold leading-tight ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      Profile Photo (Optional)
                    </p>
                    <p
                      className={`text-[10px] mt-0.5 truncate ${
                        isDark ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      {photoFile ? photoFile.name : 'Upload a profile picture (JPG, PNG, WEBP, max 5MB)'}
                    </p>
                    <p
                      className={`text-[9px] ${
                        isDark ? 'text-slate-500' : 'text-slate-400'
                      }`}
                    >
                      You can add or change this later from your profile.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
                    isDark
                      ? 'border-blue-700/80 bg-[#162b5a] text-cyan-300 hover:bg-[#1a336a]'
                      : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload</span>
                </button>
              </div>

              {/* Terms of Service Checkbox */}
              <div className="pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 rounded-sm text-[#1d6eed] border-slate-300 dark:border-slate-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span
                    className={`text-xs ${
                      isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}
                  >
                    I agree to the{' '}
                    <Link to="/about" className="text-[#1d6eed] hover:underline font-semibold">
                      Terms of Service
                    </Link>{' '}
                    and Privacy Policy
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#1d6eed] hover:bg-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* OR Divider */}
            <div className="relative my-3 text-center">
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
              className={`w-full p-2.5 rounded-xl border transition-all cursor-pointer text-center group ${
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
                Quick scan without an account? Use Detection as a guest.
              </p>
            </button>

            {/* Switch to Sign In */}
            <div
              className={`mt-3.5 text-center text-xs ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}
            >
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-bold text-[#1d6eed] hover:underline ml-1"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
