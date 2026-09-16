import React from 'react';
import { Mail, Link2, Check, Lock } from 'lucide-react';

/**
 * 3D-styled Glossy Blue Shield SVG
 */
function GlossyShield({ size = 180, icon: _icon = Lock, checkmark = false }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size * 1.15 }}>
      {/* Outer ambient glow */}
      <div className="absolute inset-0 bg-blue-500/25 blur-2xl rounded-full scale-110 pointer-events-none" />

      {/* Main SVG Shield */}
      <svg
        viewBox="0 0 200 230"
        className="w-full h-full drop-shadow-xl"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Main Shield Gradient */}
          <linearGradient id="shieldGrad" x1="20" y1="10" x2="180" y2="220" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="25%" stopColor="#3b82f6" />
            <stop offset="85%" stopColor="#1d4ed8" />
            <stop offset="100%" stopColor="#1e40af" />
          </linearGradient>

          {/* Inner Highlight Gradient for 3D Bevel */}
          <linearGradient id="shieldHighlight" x1="100" y1="15" x2="100" y2="180" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
            <stop offset="40%" stopColor="#ffffff" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          {/* Soft Rim Light */}
          <linearGradient id="shieldRim" x1="0" y1="0" x2="200" y2="230" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.6" />
          </linearGradient>
        </defs>

        {/* Shield Outer Body */}
        <path
          d="M100 12 C135 12 178 30 186 52 C186 122 152 188 100 218 C48 188 14 122 14 52 C22 30 65 12 100 12 Z"
          fill="url(#shieldGrad)"
        />

        {/* 3D Bevel Rim */}
        <path
          d="M100 12 C135 12 178 30 186 52 C186 122 152 188 100 218 C48 188 14 122 14 52 C22 30 65 12 100 12 Z"
          stroke="url(#shieldRim)"
          strokeWidth="3.5"
          fill="none"
        />

        {/* Subtle Top Specular Curved Highlight */}
        <path
          d="M100 20 C130 20 166 35 174 54 C174 100 152 155 100 182 C72 165 44 130 36 90 C32 68 56 40 100 20 Z"
          fill="url(#shieldHighlight)"
        />
      </svg>

      {/* Central Icon: Lock or Checkmark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-2">
        {checkmark ? (
          <Check className="w-16 h-16 text-white stroke-[3.5] drop-shadow-md" />
        ) : (
          <div className="flex flex-col items-center justify-center text-white drop-shadow-md">
            <div className="w-10 h-8 border-[4.5px] border-white rounded-t-full mb-[-2px]" />
            <div className="w-12 h-10 bg-white rounded-md flex items-center justify-center shadow-inner">
              <div className="w-2.5 h-3.5 bg-blue-700 rounded-sm" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Login Center Cybersecurity Illustration
 * - Large 3D Shield with White Padlock
 * - Orbital rings
 * - Floating badges (Mail, Chat, Link)
 * - Orbital accent dots
 */
export function LoginShieldIllustration() {
  return (
    <div className="relative w-72 sm:w-80 h-72 sm:h-80 flex items-center justify-center select-none pointer-events-none">
      {/* Background Soft Glow */}
      <div className="absolute w-72 h-72 rounded-full bg-gradient-to-tr from-blue-100/70 via-blue-50/50 to-transparent dark:from-blue-900/30 dark:via-blue-950/20 blur-xl" />

      {/* Thin Orbital Rings */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 320" fill="none">
        <ellipse
          cx="160"
          cy="160"
          rx="145"
          ry="90"
          transform="rotate(-25 160 160)"
          stroke="#93c5fd"
          strokeWidth="1.5"
          strokeDasharray="5 7"
          className="opacity-70 dark:opacity-40"
        />
        <ellipse
          cx="160"
          cy="160"
          rx="125"
          ry="135"
          stroke="#bfdbfe"
          strokeWidth="1"
          className="opacity-50 dark:opacity-20"
        />
      </svg>

      {/* Floating Accent Sphere: Top Cyan */}
      <div className="absolute top-8 left-28 w-3 h-3 rounded-full bg-blue-600 shadow-sm shadow-blue-500 animate-pulse" />

      {/* Floating Accent Sphere: Bottom Green */}
      <div className="absolute bottom-16 left-12 w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm" />

      {/* Floating Badge 1: Top-Left Email Card */}
      <div className="absolute top-12 left-4 w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl shadow-lg shadow-blue-900/10 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-blue-600 dark:text-blue-400 z-10 transform -rotate-6">
        <Mail className="w-5 h-5 fill-blue-50 stroke-blue-600 dark:stroke-blue-400 stroke-[2.2]" />
      </div>

      {/* Floating Badge 2: Top-Right Green Chat Bubble */}
      <div className="absolute top-8 right-6 w-11 h-11 bg-emerald-500 dark:bg-emerald-600 rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-center text-white z-10 transform rotate-6">
        <div className="flex items-center gap-0.5">
          <div className="w-1.5 h-1.5 rounded-full bg-white" />
          <div className="w-1.5 h-1.5 rounded-full bg-white" />
          <div className="w-1.5 h-1.5 rounded-full bg-white" />
        </div>
      </div>

      {/* Floating Badge 3: Bottom-Right Violet Link Card */}
      <div className="absolute bottom-8 right-8 w-11 h-11 bg-gradient-to-tr from-purple-600 to-indigo-500 rounded-2xl shadow-lg shadow-indigo-600/25 flex items-center justify-center text-white z-10 transform rotate-12">
        <Link2 className="w-5 h-5 stroke-[2.5]" />
      </div>

      {/* Center 3D Shield */}
      <div className="relative z-0 scale-95 hover:scale-100 transition-transform duration-500">
        <GlossyShield size={175} />
      </div>
    </div>
  );
}

/**
 * Register Center Profile & Shield Illustration
 * - White/Light ID Window Card with User silhouette & skeleton lines
 * - Overlapping 3D Shield with Checkmark
 * - Cursive "A Safer Digital Tomorrow" with underline swoosh
 */
export function RegisterProfileIllustration() {
  return (
    <div className="relative w-80 sm:w-96 flex flex-col items-center justify-center select-none pointer-events-none">
      {/* Background Soft Glow */}
      <div className="absolute w-80 h-80 rounded-full bg-gradient-to-tr from-blue-100/70 via-blue-50/50 to-transparent dark:from-blue-950/40 blur-2xl" />

      {/* Thin Orbital Arc & Accent Dots */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 360 280" fill="none">
        <path
          d="M 50 140 A 130 110 0 0 1 310 140"
          stroke="#93c5fd"
          strokeWidth="1.5"
          strokeDasharray="5 7"
          className="opacity-70 dark:opacity-40"
        />
        <circle cx="160" cy="30" r="3.5" fill="#3b82f6" />
        <circle cx="310" cy="140" r="3.5" fill="#2563eb" />
        <circle cx="160" cy="220" r="3" fill="#1d4ed8" />
      </svg>

      {/* Floating Badge 1: Top-Left White Card with Blue Chain Link */}
      <div className="absolute top-10 left-3 w-11 h-11 bg-white dark:bg-slate-800 rounded-2xl shadow-lg shadow-blue-900/10 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-blue-600 dark:text-blue-400 z-20 transform -rotate-12">
        <Link2 className="w-5 h-5 stroke-[2.5]" />
      </div>

      {/* Floating Badge 2: Top-Right Green Badge with Dots */}
      <div className="absolute top-8 right-8 w-10 h-10 bg-emerald-500 dark:bg-emerald-600 rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-center text-white z-20 transform rotate-6">
        <div className="flex flex-col gap-0.5 items-center">
          <div className="w-3.5 h-1 bg-white rounded-full" />
          <div className="w-3.5 h-1 bg-white rounded-full" />
          <div className="w-3.5 h-1 bg-white rounded-full" />
        </div>
      </div>

      {/* Floating Badge 3: Bottom-Right Purple Badge with Chain Link */}
      <div className="absolute bottom-16 right-4 w-11 h-11 bg-gradient-to-tr from-purple-600 to-indigo-500 rounded-2xl shadow-lg shadow-indigo-600/25 flex items-center justify-center text-white z-20 transform rotate-12">
        <Link2 className="w-5 h-5 stroke-[2.5]" />
      </div>

      {/* Window & Shield Container */}
      <div className="relative w-80 h-56 flex items-center justify-center mt-2">
        {/* Profile / ID Card Window */}
        <div className="absolute left-6 top-3 w-60 h-48 bg-white dark:bg-[#0f172a] rounded-2xl shadow-xl shadow-slate-200/70 dark:shadow-black/40 border border-slate-100 dark:border-slate-800 p-4 transform -rotate-3 transition-transform">
          {/* Window Top Bar: 3 Dots */}
          <div className="flex items-center justify-end gap-1.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700" />
            <div className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700" />
            <div className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700" />
          </div>

          {/* Profile Card Body */}
          <div className="flex items-center gap-3.5 pt-4">
            {/* Avatar Circle */}
            <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-950/80 flex items-center justify-center overflow-hidden shrink-0 border border-blue-200/60 dark:border-blue-800">
              <svg className="w-10 h-10 text-blue-500 dark:text-blue-400 translate-y-1.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>

            {/* Skeleton Information Lines */}
            <div className="space-y-2 flex-1">
              <div className="h-3 bg-blue-200/70 dark:bg-blue-900/60 rounded-full w-24" />
              <div className="h-2 bg-blue-100 dark:bg-slate-800 rounded-full w-16" />
            </div>
          </div>

          {/* Bottom Card Bar */}
          <div className="mt-5 space-y-1.5">
            <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full w-28" />
            <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full w-20" />
          </div>
        </div>

        {/* Overlapping 3D Shield with Checkmark */}
        <div className="absolute right-3 bottom-0 z-10 scale-90 transform rotate-2">
          <GlossyShield size={150} checkmark={true} />
        </div>
      </div>

      {/* Cursive Handwriting Slogan below ID Card */}
      <div className="mt-5 text-center transform -rotate-6">
        <p className="font-handwriting text-3xl sm:text-4xl text-blue-500/80 dark:text-blue-400 tracking-wide font-bold">
          A Safer Digital Tomorrow
        </p>
        <svg className="w-36 mx-auto -mt-1 text-blue-400 dark:text-blue-500" viewBox="0 0 140 18" fill="none">
          <path
            d="M5 9 Q 70 16, 135 5"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}

/**
 * Handwritten Accents on the Far Right
 * Login: "Stay Safe Online"
 * Register: "Detect Prevent Stay Safe"
 */
export function HandwrittenAccent({ type = 'login' }) {
  if (type === 'login') {
    return (
      <div className="hidden xl:flex flex-col items-start select-none pointer-events-none transform -rotate-6 text-slate-400 dark:text-slate-500 pl-4">
        <div className="font-handwriting text-2xl sm:text-3xl font-bold leading-tight">
          <p>Stay</p>
          <p className="pl-3">Safe</p>
          <p className="pl-6">Online</p>
        </div>
        <svg className="w-24 mt-1 text-blue-400 dark:text-blue-500/70" viewBox="0 0 100 16" fill="none">
          <path
            d="M4 8 Q 50 15, 96 4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className="hidden xl:flex flex-col items-start select-none pointer-events-none transform -rotate-6 text-slate-400 dark:text-slate-500 pl-4">
      <div className="font-handwriting text-2xl sm:text-3xl font-bold leading-tight">
        <p>Detect</p>
        <p className="pl-3">Prevent</p>
        <p className="pl-6">Stay Safe</p>
      </div>
      <svg className="w-28 mt-1 text-blue-400 dark:text-blue-500/70" viewBox="0 0 120 16" fill="none">
        <path
          d="M6 8 Q 60 15, 114 4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
