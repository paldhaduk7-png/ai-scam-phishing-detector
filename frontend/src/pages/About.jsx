import React from 'react';
import Card from '../components/common/Card';
import {
  Shield,
  ArrowRight,
  Code2,
  Server,
  BrainCircuit,
  Cpu,
  Database,
} from 'lucide-react';

export default function About() {
  const steps = [
    {
      num: '1',
      title: 'Input Analysis',
      description: 'We analyze your input (message, email or URL).',
    },
    {
      num: '2',
      title: 'AI Models',
      description: 'We use traditional ML and deep learning models to analyze the content.',
    },
    {
      num: '3',
      title: 'Instant Results',
      description: 'Get a clear prediction with confidence score and explanation.',
    },
  ];

  const technologies = [
    {
      name: 'React',
      role: 'Frontend',
      icon: Code2,
      color: 'text-cyan-500 bg-cyan-50 border-cyan-100 dark:bg-cyan-950/50 dark:border-cyan-900/50 dark:text-cyan-400',
    },
    {
      name: 'FastAPI',
      role: 'Backend',
      icon: Server,
      color: 'text-teal-600 bg-teal-50 border-teal-100 dark:bg-teal-950/50 dark:border-teal-900/50 dark:text-teal-400',
    },
    {
      name: 'Machine Learning',
      role: '(TF-IDF, SVM, LLM)',
      icon: BrainCircuit,
      color: 'text-amber-500 bg-amber-50 border-amber-100 dark:bg-amber-950/50 dark:border-amber-900/50 dark:text-amber-400',
    },
    {
      name: 'Deep Learning',
      role: '(Bi-LSTM)',
      icon: Cpu,
      color: 'text-blue-600 bg-blue-50 border-blue-100 dark:bg-blue-950/50 dark:border-blue-900/50 dark:text-blue-400',
    },
    {
      name: 'PostgreSQL',
      role: 'Database',
      icon: Database,
      color: 'text-sky-700 bg-sky-50 border-sky-100 dark:bg-sky-950/50 dark:border-sky-900/50 dark:text-sky-400',
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          About ScamShield
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Learn how our AI-driven security architecture detects modern digital threats.
        </p>
      </div>

      {/* Our Mission Card matching Screenshot 1 */}
      <Card className="p-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Our Mission</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              To create a safer digital world by using artificial intelligence to detect and prevent scams, phishing attacks and online fraud. We believe in a more secure internet for everyone.
            </p>
          </div>

          {/* Right badge matching screenshot */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/40 border border-blue-100 dark:border-blue-900/50 flex items-center gap-4 shrink-0 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/30">
              <Shield className="w-8 h-8 fill-white/20 stroke-white" />
            </div>
            <div>
              <p className="text-base font-extrabold text-blue-950 dark:text-white">Stay Aware</p>
              <p className="text-base font-extrabold text-blue-700 dark:text-blue-400">Stay Safe</p>
            </div>
          </div>
        </div>
      </Card>

      {/* How It Works matching Screenshot 1 */}
      <Card className="p-8">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-8">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {steps.map((step, idx) => (
            <div key={idx} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 font-bold text-base flex items-center justify-center shrink-0">
                {step.num}
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{step.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
              {idx < steps.length - 1 && (
                <div className="hidden md:flex items-center text-slate-300 dark:text-slate-600 ml-auto self-center">
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Technologies Used matching Screenshot 1 */}
      <Card className="p-8">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Technologies Used</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {technologies.map((tech, idx) => {
            const Icon = tech.icon;
            return (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all flex flex-col items-center text-center group"
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 border ${tech.color} group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">{tech.name}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{tech.role}</p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
