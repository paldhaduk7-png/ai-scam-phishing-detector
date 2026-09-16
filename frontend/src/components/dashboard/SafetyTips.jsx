import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import { CheckCircle2, Lightbulb } from 'lucide-react';

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
    <Card className="flex flex-col justify-between relative overflow-hidden">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Safety Tips</h2>
          </div>
          <button
            type="button"
            onClick={() => navigate('/about')}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline cursor-pointer"
          >
            See More
          </button>
        </div>

        <ul className="space-y-2.5">
          {tips.map((tip, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span className="leading-snug">{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Decorative lightbulb icon matching reference */}
      <div className="mt-4 pt-3 border-t border-slate-50 dark:border-slate-800 flex items-center justify-end">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 text-xs font-medium border border-amber-200/60 dark:border-amber-900/50">
          <Lightbulb className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
          <span>Stay alert, stay safe</span>
        </div>
      </div>
    </Card>
  );
}
