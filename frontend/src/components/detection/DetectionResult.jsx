import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import Button from '../common/Button';
import Badge from '../common/Badge';
import {
  AlertTriangle,
  ShieldCheck,
  AlertCircle,
  Lock,
  Search,
  CheckCircle2,
  Clock,
  RotateCcw,
  Cpu,
  Layers,
  Activity,
  Terminal,
} from 'lucide-react';

/**
 * Enhanced DetectionResult component displaying real threat classification,
 * continuous risk scoring, model telemetry, and safety recommendations.
 */
export default function DetectionResult({
  status = 'idle', // 'idle' | 'loading' | 'success' | 'error'
  result = null,
  errorMessage = 'Unable to analyze this content. Please try again.',
  onRetry,
  onReset,
}) {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  // 1. Idle State
  if (status === 'idle') {
    return (
      <Card className="flex flex-col items-center justify-center p-8 text-center min-h-[300px] border-dashed">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/60 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-3 shadow-2xs">
          <Search className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
          Awaiting Input Analysis
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm">
          Submit an email body, text message, or web URL above. ScamShield will evaluate deceptive markers and display an instant threat report here.
        </p>
      </Card>
    );
  }

  // 2. Loading / Analyzing State
  if (status === 'loading') {
    return (
      <Card className="flex flex-col items-center justify-center p-8 text-center min-h-[300px] animate-fadeIn">
        <div className="relative w-16 h-16 mb-4 flex items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-blue-600/10 dark:bg-blue-500/10 animate-ping" />
          <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Activity className="w-7 h-7 animate-pulse" />
          </div>
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
          Analyzing Threat Vectors...
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md">
          Extracting text n-grams, evaluating lexical domain markers, and executing neural sequence inference.
        </p>
        <div className="w-48 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-4">
          <div className="w-full h-full bg-blue-600 rounded-full animate-pulseGlow" />
        </div>
      </Card>
    );
  }

  // 3. Error State
  if (status === 'error') {
    return (
      <Card className="p-6 text-left border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/20 animate-fadeIn">
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 shrink-0 mt-0.5">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1 flex-1">
            <h3 className="text-base font-bold text-red-950 dark:text-red-200">
              Analysis Request Failed
            </h3>
            <p className="text-xs sm:text-sm text-red-800 dark:text-red-300/90 leading-relaxed">
              {errorMessage}
            </p>
            {onRetry && (
              <div className="pt-3">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={onRetry}
                  icon={RotateCcw}
                  className="rounded-xl font-semibold shadow-xs"
                >
                  Retry Analysis
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  }

  // 4. Success State (Prominent Result Display)
  if (status === 'success' && result) {
    const classification = result.classification || 'Analysis Complete';
    const isPhishing = Boolean(result.is_phishing);
    const riskPercentage =
      typeof result.risk_percentage === 'number' && !isNaN(result.risk_percentage)
        ? Math.max(0, Math.min(100, result.risk_percentage))
        : 0;
    const isSuspicious = !isPhishing && riskPercentage >= 40.0;

    const inputAnalyzed = result.input_analyzed || result.inputAnalyzed || result.input;

    let explanation = result.error || result.explanation;
    if (!explanation) {
      if (isPhishing) {
        explanation = result.is_spam
          ? 'This message exhibits strong characteristics of an unsolicited financial or smishing fraud scheme.'
          : 'Significant deceptive or credential-harvesting indicators were detected by the AI classification engine.';
      } else if (isSuspicious) {
        explanation =
          'Potential risk patterns or urgent phrasing were identified. Exercise caution before clicking or replying.';
      } else {
        explanation =
          'No malicious or deceptive patterns were flagged. This content appears safe and legitimate.';
      }
    }

    // Telemetry items directly from backend response
    const telemetryItems = [];

    if (result.score_type) {
      telemetryItems.push({
        label: 'Model / Algorithm',
        value: result.score_type,
        icon: Cpu,
      });
    }

    if (typeof result.score === 'number' && !isNaN(result.score)) {
      telemetryItems.push({
        label: 'Raw Decision Score',
        value: result.score.toFixed(4),
        icon: Layers,
      });
    }

    if (result.is_spam !== null && result.is_spam !== undefined) {
      telemetryItems.push({
        label: 'SMS Spam Filter Flag',
        value: result.is_spam ? 'Spam Detected' : 'Clean (Ham)',
        icon: Activity,
      });
    }

    if (result.predicted_label !== null && result.predicted_label !== undefined) {
      telemetryItems.push({
        label: 'Binary Class Match',
        value: result.predicted_label === 1 ? 'Class 1 (Threat)' : 'Class 0 (Benign)',
        icon: Terminal,
      });
    }

    // Recommendations based on risk
    const recommendations =
      result.recommendations && result.recommendations.length > 0
        ? result.recommendations
        : isPhishing
        ? [
            'Do not open any attached files or click hyperlinks in this message.',
            'Never provide account passwords, social security numbers, or payment details.',
            'Verify sender identity using independent, verified communication channels.',
            'Block the sender and report this message to your security provider.',
          ]
        : isSuspicious
        ? [
            'Verify the web domain in your browser address bar for subtle misspellings.',
            'Contact the alleged sender independently to confirm if the message is authentic.',
            'Avoid entering sensitive credentials if the webpage lacks trusted security certificates.',
          ]
        : [
            'The content conforms to standard benign communication patterns.',
            'Always practice proactive digital hygiene when interacting with unexpected links.',
          ];

    // Card tone styling
    let verdictStyles = {
      card: 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/80 dark:bg-emerald-950/30',
      iconBox: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400',
      badgeStatus: 'safe',
      textColor: 'text-emerald-950 dark:text-emerald-200',
      barColor: 'bg-emerald-500',
      icon: ShieldCheck,
    };

    if (isPhishing) {
      verdictStyles = {
        card: 'border-red-200 dark:border-red-900/60 bg-red-50/80 dark:bg-red-950/30',
        iconBox: 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400',
        badgeStatus: 'phishing',
        textColor: 'text-red-950 dark:text-red-200',
        barColor: 'bg-red-600',
        icon: AlertTriangle,
      };
    } else if (isSuspicious) {
      verdictStyles = {
        card: 'border-amber-200 dark:border-amber-900/60 bg-amber-50/80 dark:bg-amber-950/30',
        iconBox: 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400',
        badgeStatus: 'suspicious',
        textColor: 'text-amber-950 dark:text-amber-200',
        barColor: 'bg-amber-500',
        icon: AlertCircle,
      };
    }

    const VerdictIcon = verdictStyles.icon;

    return (
      <div className="space-y-6 animate-fadeIn text-left">
        {/* Prominent Threat Verdict Banner */}
        <div
          className={`p-6 rounded-2xl border ${verdictStyles.card} shadow-xs space-y-4`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${verdictStyles.iconBox}`}
              >
                <VerdictIcon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {classification}
                  </h3>
                  <Badge status={verdictStyles.badgeStatus} size="sm">
                    {isPhishing ? 'Threat Detected' : isSuspicious ? 'Caution Required' : 'Safe Result'}
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-1 leading-relaxed max-w-xl">
                  {explanation}
                </p>
              </div>
            </div>

            {/* Actions & Risk Percentage Gauge Callout */}
            <div className="flex items-center gap-3 shrink-0">
              {onReset && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onReset}
                  icon={RotateCcw}
                  className="rounded-xl text-xs bg-white/80 dark:bg-slate-900/80 border-slate-200/80 dark:border-slate-800"
                >
                  New Scan
                </Button>
              )}
              <div className="flex sm:flex-col items-baseline sm:items-end justify-between gap-1 shrink-0 p-3 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
                  Threat Severity
                </span>
                <span className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white">
                  {riskPercentage.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Accurate Progress Meter representing real risk_percentage */}
          <div className="space-y-1 pt-1">
            <div className="w-full h-2 rounded-full bg-slate-200/80 dark:bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${verdictStyles.barColor}`}
                style={{ width: `${riskPercentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 dark:text-slate-500">
              <span>0% Low Risk</span>
              <span>40% Suspicious Threshold</span>
              <span>100% Critical Threat</span>
            </div>
          </div>
        </div>

        {/* Telemetry / Model Details */}
        {telemetryItems.length > 0 && (
          <Card>
            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
              Model Inference Telemetry
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {telemetryItems.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase">
                        {item.label}
                      </p>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {item.value}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Input Analyzed Snippet */}
        {inputAnalyzed && (
          <Card>
            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              Analyzed Payload Snippet
            </h4>
            <div className="p-3.5 bg-slate-50 dark:bg-[#0b1120] border border-slate-200/80 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-mono break-all leading-relaxed max-h-40 overflow-y-auto">
              {inputAnalyzed}
            </div>
          </Card>
        )}

        {/* Safety Recommendations */}
        {recommendations.length > 0 && (
          <Card>
            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
              Recommended Security Actions
            </h4>
            <ul className="space-y-2">
              {recommendations.map((rec, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{rec}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Save / History Notification Card */}
        {isAuthenticated ? (
          <Card className="bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200/70 dark:border-emerald-900/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <ShieldCheck className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Detection Logged to PostgreSQL
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  This record is available in your audit history and reflected in your 7-day dashboard chart.
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/history')}
              icon={Clock}
              className="rounded-xl text-xs shrink-0"
            >
              View in History
            </Button>
          </Card>
        ) : (
          <Card className="bg-blue-50/60 dark:bg-blue-950/30 border-blue-200/70 dark:border-blue-900/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Save Scan Assessments
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Create a free account to track threat encounters and access personal history.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/login')}
                className="rounded-xl text-xs"
              >
                Sign In
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/register')}
                className="rounded-xl text-xs shadow-xs"
              >
                Register
              </Button>
            </div>
          </Card>
        )}
      </div>
    );
  }

  return null;
}
