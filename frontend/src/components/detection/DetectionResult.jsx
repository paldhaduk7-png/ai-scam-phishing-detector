import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import Button from '../common/Button';
import Badge from '../common/Badge';
import {
  AlertTriangle,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  Cpu,
  Activity,
  Shield,
  Clock,
  ArrowRight,
  Mail,
} from 'lucide-react';

/**
 * Compact, highly visible DetectionResult component designed to render
 * directly beside the input form without requiring page scrolling.
 * Displays highlighted verdicts, calibrated risk scores, and essential guidance.
 */
export default function DetectionResult({
  status = 'idle', // 'idle' | 'loading' | 'success' | 'error'
  result = null,
  channel = 'message',
  errorMessage = 'Unable to analyze this content. Please try again.',
  onRetry,
  onReset,
}) {
  const navigate = useNavigate();
  const historyPath =
    channel === 'email'
      ? '/history/email'
      : channel === 'url'
      ? '/history/url'
      : '/history/text';

  // 1. Idle State: Clean ready-to-scan card
  if (status === 'idle') {
    return (
      <Card className="flex flex-col items-center justify-center p-6 sm:p-8 text-center min-h-[280px] sm:min-h-[420px] border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/70 dark:border-blue-800/60 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-3 sm:mb-4 shadow-sm">
          {channel === 'email' ? (
            <Mail className="w-7 h-7 sm:w-8 sm:h-8" />
          ) : (
            <Shield className="w-7 h-7 sm:w-8 sm:h-8" />
          )}
        </div>
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-1.5">
          {channel === 'email'
            ? 'Ready for Email Analysis'
            : channel === 'url'
            ? 'Ready for URL Scan'
            : 'Ready for SMS / Threat Analysis'}
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed mb-5">
          {channel === 'email'
            ? 'Enter email text or select emails from Gmail on the left to see real-time AI security scoring and phishing verdict here.'
            : channel === 'url'
            ? 'Enter a website link on the left and click Scan to evaluate malicious indicators and domain risk.'
            : 'Enter text or an SMS on the left and click Scan to see real-time AI security scoring and risk verdict here.'}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-xs text-left mb-5">
          {channel === 'email' ? (
            <>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-100/70 dark:bg-slate-800/50 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Phishing lure detection</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-100/70 dark:bg-slate-800/50 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Credential harvest scan</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-100/70 dark:bg-slate-800/50 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Sender domain spoof check</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-100/70 dark:bg-slate-800/50 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Instant risk meter</span>
              </div>
            </>
          ) : channel === 'url' ? (
            <>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-100/70 dark:bg-slate-800/50 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Malicious domain checks</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-100/70 dark:bg-slate-800/50 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Redirect chain analysis</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-100/70 dark:bg-slate-800/50 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Spoofed branding alerts</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-100/70 dark:bg-slate-800/50 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Domain trust scoring</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-100/70 dark:bg-slate-800/50 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>SMS smishing scan</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-100/70 dark:bg-slate-800/50 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Urgency trigger checks</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-100/70 dark:bg-slate-800/50 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Deceptive link scanner</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-100/70 dark:bg-slate-800/50 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Instant risk meter</span>
              </div>
            </>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(historyPath)}
          className="rounded-xl text-xs font-semibold px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-300 dark:border-slate-700 shadow-2xs text-slate-700 dark:text-slate-200"
        >
          <Clock className="w-3.5 h-3.5 mr-1.5 text-blue-600 dark:text-blue-400" />
          <span>View Scan History</span>
          <ArrowRight className="w-3 h-3 ml-1.5" />
        </Button>
      </Card>
    );
  }

  // 2. Loading State: High-tech scanning radar
  if (status === 'loading') {
    return (
      <Card className="flex flex-col items-center justify-center p-6 sm:p-8 text-center min-h-[280px] sm:min-h-[420px] animate-fadeIn border border-blue-200/60 dark:border-blue-900/40 bg-white/70 dark:bg-slate-900/60">
        <div className="relative w-16 h-16 mb-4 flex items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-blue-600/15 dark:bg-blue-500/20 animate-ping" />
          <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-lg shadow-blue-500/25">
            {channel === 'email' ? (
              <Mail className="w-7 h-7 animate-pulse" />
            ) : (
              <Activity className="w-7 h-7 animate-pulse" />
            )}
          </div>
        </div>
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-1">
          {channel === 'email'
            ? 'Analyzing Email Threat Vectors...'
            : channel === 'url'
            ? 'Scanning URL Safety...'
            : 'Analyzing Message Threat Vectors...'}
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
          {channel === 'email'
            ? 'Evaluating email headers, deceptive lures, urgency cues, and running AI inference.'
            : channel === 'url'
            ? 'Analyzing domain reputation, redirection hops, and malicious indicators.'
            : 'Evaluating lexical markers, deceptive linguistic patterns, and running AI inference.'}
        </p>
        <div className="w-44 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-5">
          <div className="w-full h-full bg-blue-600 rounded-full animate-pulseGlow" />
        </div>
      </Card>
    );
  }

  // 3. Error State: Clean highlighted error card
  if (status === 'error') {
    return (
      <Card className="p-5 sm:p-6 text-left border border-red-200 dark:border-red-900/60 bg-red-50/70 dark:bg-red-950/30 animate-fadeIn min-h-[280px] sm:min-h-[420px] flex flex-col justify-center">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 shrink-0 mt-0.5">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1.5 flex-1">
            <h3 className="text-base font-bold text-red-950 dark:text-red-200">
              Analysis Failed
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
                  Retry Scan
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  }

  // 4. Success State: Prominently highlighted result card
  if (status === 'success' && result) {
    const isPhishing = Boolean(result.is_phishing);
    const riskPercentage =
      typeof result.risk_percentage === 'number' && !isNaN(result.risk_percentage)
        ? Math.max(0, Math.min(100, result.risk_percentage))
        : 0;
    const isSuspicious = !isPhishing && riskPercentage >= 40.0;

    // Sanitize classification label based on active channel
    let classification = result.classification || 'Scan Complete';
    if (channel === 'email') {
      if (
        classification.toLowerCase().includes('sms') ||
        classification.toLowerCase().includes('message') ||
        classification === 'Spam'
      ) {
        classification = isPhishing
          ? 'Phishing Email Threat'
          : isSuspicious
          ? 'Suspicious Email Lure'
          : 'Safe / Legitimate Email';
      }
    } else if (channel === 'url') {
      if (classification.toLowerCase().includes('sms') || classification.toLowerCase().includes('email')) {
        classification = isPhishing
          ? 'Malicious Phishing URL'
          : isSuspicious
          ? 'Suspicious Web Link'
          : 'Safe / Benign URL';
      }
    }

    let explanation = result.error || result.explanation;
    if (
      !explanation ||
      (channel === 'email' &&
        (explanation.toLowerCase().includes('smishing') || explanation.toLowerCase().includes('sms')))
    ) {
      if (isPhishing) {
        explanation =
          channel === 'email'
            ? 'High-risk email phishing indicators identified. Deceptive lures or suspicious spoofing detected.'
            : result.is_spam
            ? 'High-risk smishing indicators identified. Unsolicited fraud pattern detected.'
            : 'Severe phishing indicators detected. Likely attempting credential harvesting or financial fraud.';
      } else if (isSuspicious) {
        explanation =
          channel === 'email'
            ? 'Potential email phishing indicators detected. Exercise heightened caution before clicking links or downloading attachments.'
            : 'Potential risk markers detected. Exercise heightened caution before interacting.';
      } else {
        explanation =
          channel === 'email'
            ? 'No phishing or deceptive markers were flagged. This email appears legitimate.'
            : 'No malicious or deceptive markers were flagged. This content appears legitimate.';
      }
    }

    // High-impact styling tailored to verdict
    let verdictStyles = {
      card: 'border-2 border-emerald-500/80 bg-emerald-50/90 dark:bg-emerald-950/40 shadow-lg shadow-emerald-500/10',
      badgeStatus: 'safe',
      badgeLabel: 'Safe / Benign',
      iconBox: 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30',
      titleColor: 'text-emerald-950 dark:text-emerald-100',
      barColor: 'bg-emerald-500',
      scoreColor: 'text-emerald-700 dark:text-emerald-300',
      icon: ShieldCheck,
    };

    if (isPhishing) {
      verdictStyles = {
        card: 'border-2 border-red-500/90 bg-red-50/90 dark:bg-red-950/40 shadow-lg shadow-red-500/15 animate-pulseGlow',
        badgeStatus: 'phishing',
        badgeLabel: 'Critical Threat',
        iconBox: 'bg-red-600 text-white shadow-md shadow-red-600/30',
        titleColor: 'text-red-950 dark:text-red-100',
        barColor: 'bg-red-600',
        scoreColor: 'text-red-700 dark:text-red-300',
        icon: AlertTriangle,
      };
    } else if (isSuspicious) {
      verdictStyles = {
        card: 'border-2 border-amber-500/80 bg-amber-50/90 dark:bg-amber-950/40 shadow-lg shadow-amber-500/10',
        badgeStatus: 'suspicious',
        badgeLabel: 'Suspicious Lure',
        iconBox: 'bg-amber-500 text-white shadow-md shadow-amber-500/30',
        titleColor: 'text-amber-950 dark:text-amber-100',
        barColor: 'bg-amber-500',
        scoreColor: 'text-amber-700 dark:text-amber-300',
        icon: AlertCircle,
      };
    }

    const VerdictIcon = verdictStyles.icon;

    // Direct concise guidance customized per channel
    const guidance =
      channel === 'email'
        ? isPhishing
          ? [
              'Do NOT click email links, open attachments, or download files.',
              'Inspect the sender email address closely for domain spoofing.',
              'Never provide credentials, passwords, or financial information.',
            ]
          : isSuspicious
          ? [
              'Verify sender authenticity via an out-of-band channel before replying.',
              'Hover over embedded links to inspect the actual destination URL.',
            ]
          : [
              'Matches verified benign communication and trusted sender heuristics.',
              'Standard digital hygiene is always recommended.',
            ]
        : channel === 'url'
        ? isPhishing
          ? [
              'Do NOT visit this link or enter personal information.',
              'Domain has known phishing signatures or suspicious hosting.',
              'Close any browser tabs opened by this destination.',
            ]
          : isSuspicious
          ? [
              'Inspect domain registration age and SSL certificate before proceeding.',
              'Never authorize wallet transactions or OAuth permissions on this site.',
            ]
          : [
              'Domain does not exhibit deceptive or phishing signatures.',
              'Proceed with normal safe browsing precautions.',
            ]
        : isPhishing
        ? [
            'Do NOT click links, open attachments, or send wire transfers.',
            'Never provide passwords, verification PINs, or card numbers.',
            'Block the sender or blacklist the suspicious sender phone number.',
          ]
        : isSuspicious
        ? [
            'Verify sender details via an official trusted channel before replying.',
            'Check incoming phone number carefully for area code spoofing.',
          ]
        : [
            'Matches verified benign communication and structural heuristics.',
            'Standard digital hygiene is always recommended.',
          ];

    return (
      <div className="space-y-4 animate-fadeIn text-left">
        {/* Prominent Highlighted Verdict Card */}
        <div className={`p-5 sm:p-6 rounded-2xl ${verdictStyles.card} space-y-4 transition-all`}>
          {/* Header Row: Icon + Verdict Title + Badge + Reset */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${verdictStyles.iconBox}`}>
                <VerdictIcon className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className={`text-lg sm:text-xl font-extrabold tracking-tight ${verdictStyles.titleColor}`}>
                    {classification}
                  </h3>
                  <Badge status={verdictStyles.badgeStatus} size="sm">
                    {verdictStyles.badgeLabel}
                  </Badge>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-snug">
                  {explanation}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(historyPath)}
                icon={Clock}
                className="rounded-xl text-xs bg-white/90 dark:bg-slate-900/90 border-slate-300 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800"
              >
                History
              </Button>
              {onReset && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onReset}
                  icon={RotateCcw}
                  className="rounded-xl text-xs bg-white/90 dark:bg-slate-900/90 border-slate-300 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800"
                >
                  Reset
                </Button>
              )}
            </div>
          </div>

          {/* Email Specific Header (Subject & Sender metadata if available) */}
          {(result.subject || result.sender) && (
            <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 text-xs space-y-1">
              {result.subject && (
                <div className="flex items-baseline gap-2 truncate">
                  <span className="font-semibold text-slate-500 dark:text-slate-400 shrink-0">Subject:</span>
                  <span className="font-bold text-slate-900 dark:text-white truncate">{result.subject}</span>
                </div>
              )}
              {result.sender && (
                <div className="flex items-baseline gap-2 truncate">
                  <span className="font-semibold text-slate-500 dark:text-slate-400 shrink-0">From:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300 truncate">{result.sender}</span>
                </div>
              )}
            </div>
          )}

          {/* Prominent Threat Severity Score Gauge */}
          <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Threat Severity Score
              </span>
              <span className={`text-2xl font-black font-mono tracking-tight ${verdictStyles.scoreColor}`}>
                {riskPercentage.toFixed(1)}%
              </span>
            </div>

            <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${verdictStyles.barColor}`}
                style={{ width: `${riskPercentage}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 dark:text-slate-500 pt-0.5">
              <span>0% Safe</span>
              <span>40% Threshold</span>
              <span>100% Critical Threat</span>
            </div>
          </div>

          {/* Actionable Guidance Checklist */}
          <div className="space-y-1.5 pt-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Recommended Action:
            </p>
            <ul className="space-y-1.5">
              {guidance.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-800 dark:text-slate-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Footer Metadata & View History Action */}
          <div className="pt-2.5 border-t border-slate-200/60 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5 flex-wrap">
              <Cpu className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>{result.score_type || 'Machine Learning Pipeline'}</span>
              {result.score !== null && result.score !== undefined && (
                <span className="font-mono text-[10px] ml-1">Raw: {Number(result.score).toFixed(4)}</span>
              )}
            </span>
            <button
              type="button"
              onClick={() => navigate(historyPath)}
              className="inline-flex items-center gap-1 font-bold text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline cursor-pointer self-start sm:self-auto"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>View History</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
