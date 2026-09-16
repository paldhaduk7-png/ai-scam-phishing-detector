import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import { CheckCircle2, ShieldCheck, ChevronRight } from 'lucide-react';

export default function SafetyTips() {
  const navigate = useNavigate();
  const tips = [
    "Don't click on unknown links.",
    "Verify the sender's email address.",
    "Be cautious with urgent messages.",
    "Use strong, unique passwords.",
    "Report suspicious activity.",
  ];

  return (
    <Card className="flex flex-col justify-between p-6 relative overflow-hidden">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80 mb-3.5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Safety Tips
            </h2>
          </div>
          <button
            type="button"
            onClick={() => navigate('/about')}
            className="inline-flex items-center gap-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline cursor-pointer group"
          >
            <span>Learn More</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <ul className="space-y-2.5">
          {tips.map((tip, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Cybersecurity posture footer badge */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
          Proactive Protection
        </span>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold border border-emerald-200/60 dark:border-emerald-800/50">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Stay alert, stay safe</span>
        </div>
      </div>
    </Card>
  );
}
