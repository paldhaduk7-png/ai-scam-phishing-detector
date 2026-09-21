import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { forgotPassword, verifyOTP, resetPassword } from '../services/api';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import {
  Shield,
  Mail,
  KeyRound,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Sun,
  Moon,
  Lock,
  Eye,
  EyeOff,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  // Wizard Steps: 1: Email, 2: OTP, 3: New Password, 4: Success
  const [step, setStep] = useState(1);

  // Form States
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // UI States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Resend Countdown Timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Step 1: Send 6-Digit OTP
  const handleSendOTP = async (e) => {
    e?.preventDefault();
    setError('');

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      const msg = 'Please enter a valid email address.';
      setError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    try {
      const response = await forgotPassword(trimmedEmail);
      toast.success(response.message || 'Verification code sent to your email.');
      setStep(2);
      setResendCooldown(60);
    } catch (err) {
      const detail = err.response?.data?.detail;
      const message =
        typeof detail === 'string'
          ? detail
          : Array.isArray(detail)
          ? detail[0]?.msg
          : 'Unable to send verification code. Please try again.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify 6-Digit OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');

    const cleanOtp = otp.trim();
    if (cleanOtp.length !== 6 || !/^\d+$/.test(cleanOtp)) {
      const msg = 'Please enter the 6-digit verification code.';
      setError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    try {
      const response = await verifyOTP({ email: email.trim().toLowerCase(), otp: cleanOtp });
      if (response.reset_token) {
        setResetToken(response.reset_token);
      }
      toast.success('Verification code confirmed.');
      setStep(3);
    } catch (err) {
      const detail = err.response?.data?.detail;
      const message =
        typeof detail === 'string'
          ? detail
          : Array.isArray(detail)
          ? detail[0]?.msg
          : 'Invalid or expired verification code.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Set New Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (!password || password.length < 6) {
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

    setLoading(true);
    try {
      const response = await resetPassword({
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        reset_token: resetToken || undefined,
        password,
        confirm_password: confirmPassword,
      });

      toast.success(response.message || 'Password reset successfully! Please sign in.');
      navigate('/login', {
        replace: true,
        state: {
          registeredEmail: email.trim(),
          message: 'Password reset successfully! Please sign in with your new password.',
        },
      });
    } catch (err) {
      const detail = err.response?.data?.detail;
      const message =
        typeof detail === 'string'
          ? detail
          : Array.isArray(detail)
          ? detail[0]?.msg
          : 'Failed to reset password. Please request a new code.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Header */}
      <header className="w-full px-4 sm:px-6 lg:px-12 py-3 sm:py-4 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-[#0b101b]/70 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group focus-visible:outline-none">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white shadow-md shadow-blue-600/20 group-hover:scale-105 transition-transform shrink-0">
            <Shield className="w-5 h-5 fill-white/20 stroke-white stroke-[2.2]" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white block leading-tight">
              ScamShield
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400">
              Account Recovery
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
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
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline px-1 sm:px-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Login</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-16 flex flex-col items-center justify-center">
        <div className="w-full max-w-md">
          <Card className="p-5 sm:p-9 shadow-lg dark:shadow-2xl">
            {/* Step Indicators */}
            {step < 4 && (
              <div className="flex items-center justify-center gap-2 mb-6">
                <span
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    step >= 1 ? 'bg-blue-600 dark:bg-blue-500' : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                />
                <span
                  className={`w-8 h-0.5 rounded transition-colors ${
                    step >= 2 ? 'bg-blue-600 dark:bg-blue-500' : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                />
                <span
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    step >= 2 ? 'bg-blue-600 dark:bg-blue-500' : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                />
                <span
                  className={`w-8 h-0.5 rounded transition-colors ${
                    step >= 3 ? 'bg-blue-600 dark:bg-blue-500' : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                />
                <span
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    step >= 3 ? 'bg-blue-600 dark:bg-blue-500' : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                />
              </div>
            )}

            {/* Global Error Banner */}
            {error && (
              <div className="mb-5 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs flex items-center gap-2.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* STEP 1: Enter Email */}
            {step === 1 && (
              <div className="animate-fadeIn">
                <div className="text-center mb-6">
                  <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/50 flex items-center justify-center mx-auto mb-3 shadow-2xs">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Reset Password
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                    Enter your account email and we will send you a 6-digit verification code.
                  </p>
                </div>

                <form onSubmit={handleSendOTP} className="space-y-4">
                  <div>
                    <label
                      htmlFor="forgot-email"
                      className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                    >
                      Registered Email Address <span className="text-red-500 font-bold">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <input
                        id="forgot-email"
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

                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    isLoading={loading}
                    className="w-full rounded-xl mt-2 font-semibold shadow-xs shadow-blue-600/25"
                  >
                    Send 6-Digit Code
                  </Button>
                </form>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-center">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:underline"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Return to Sign In</span>
                  </Link>
                </div>
              </div>
            )}

            {/* STEP 2: Enter 6-Digit OTP */}
            {step === 2 && (
              <div className="animate-fadeIn">
                <div className="text-center mb-6">
                  <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/50 flex items-center justify-center mx-auto mb-3 shadow-2xs">
                    <Mail className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Enter Verification Code
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                    We sent a 6-digit code to{' '}
                    <strong className="text-slate-800 dark:text-slate-200">{email}</strong>.
                  </p>
                </div>

                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <div>
                    <label
                      htmlFor="otp-input"
                      className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 text-center"
                    >
                      6-Digit Code (Valid for 10 minutes) <span className="text-red-500 font-bold">*</span>
                    </label>
                    <input
                      id="otp-input"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      autoFocus
                      required
                      value={otp}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setOtp(val);
                        if (error) setError('');
                      }}
                      placeholder="000000"
                      className="w-full text-center tracking-[6px] sm:tracking-[12px] font-mono text-xl sm:text-3xl font-bold py-3 bg-slate-50 dark:bg-slate-900/80 hover:bg-slate-100/70 dark:hover:bg-slate-900 focus:bg-white dark:focus:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-blue-600 dark:text-blue-400 placeholder-slate-300 dark:placeholder-slate-700 focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:border-blue-500 transition-all"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    isLoading={loading}
                    disabled={otp.length !== 6}
                    className="w-full rounded-xl mt-2 font-semibold shadow-xs shadow-blue-600/25"
                  >
                    Verify Code
                  </Button>
                </form>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="hover:underline text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                  >
                    Change Email
                  </button>

                  <button
                    type="button"
                    disabled={resendCooldown > 0 || loading}
                    onClick={handleSendOTP}
                    className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>
                      {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend Code'}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Enter New Password */}
            {step === 3 && (
              <div className="animate-fadeIn">
                <div className="text-center mb-6">
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/50 flex items-center justify-center mx-auto mb-3 shadow-2xs">
                    <Lock className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Set New Password
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                    Code verified. Enter your new password below.
                  </p>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <label
                      htmlFor="new-password"
                      className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                    >
                      New Password <span className="text-red-500 font-bold">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <input
                        id="new-password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={6}
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

                  <div>
                    <label
                      htmlFor="confirm-new-password"
                      className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                    >
                      Confirm New Password <span className="text-red-500 font-bold">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <input
                        id="confirm-new-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        minLength={6}
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

                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    isLoading={loading}
                    className="w-full rounded-xl mt-2 font-semibold shadow-xs shadow-blue-600/25"
                  >
                    Reset Password
                  </Button>
                </form>
              </div>
            )}

            {/* STEP 4: Success State */}
            {step === 4 && (
              <div className="text-center space-y-5 animate-fadeIn">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-900/60 flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 className="w-7 h-7" />
                </div>

                <div className="space-y-1.5">
                  <Badge status="safe" size="md">
                    Password Reset Complete
                  </Badge>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-2">
                    Credentials Updated
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
                    Your password has been successfully updated. You can now sign in with your new credentials.
                  </p>
                </div>

                <div className="pt-3">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() =>
                      navigate('/login', {
                        replace: true,
                        state: {
                          registeredEmail: email,
                          message: 'Password successfully reset. Please log in.',
                        },
                      })
                    }
                    className="w-full rounded-xl shadow-xs shadow-blue-600/25 font-semibold"
                  >
                    Sign In to Account
                  </Button>
                </div>
              </div>
            )}
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
