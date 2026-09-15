import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import LoadingState from '../common/LoadingState';
import ErrorState from '../common/ErrorState';
import EmptyState from '../common/EmptyState';
import {
  AlertTriangle,
  ShieldCheck,
  AlertCircle,
  Lock,
  Search,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DetectionResult({
  status = 'idle', // 'idle' | 'loading' | 'success' | 'error'
  result = null,
  errorMessage = 'Unable to analyze this content. Please try again.',
  onRetry,
}) {
  const navigate = useNavigate();

  if (status === 'idle') {
    return (
      <Card className="flex flex-col items-center justify-center p-8 text-center min-h-[340px]">
        <EmptyState
          icon={Search}
          title="Detection Result"
          description="Submit content to begin analysis. Our AI will evaluate the input and provide threat indicators."
          compact
        />
      </Card>
    );
  }

  if (status === 'loading') {
    return (
      <Card className="flex flex-col items-center justify-center p-8 text-center min-h-[340px]">
        <LoadingState
          text="Analyzing content..."
          subtext="Evaluating natural language patterns, threat indicators, and URL reputation."
        />
      </Card>
    );
  }

  if (status === 'error') {
    return (
      <Card className="flex flex-col items-center justify-center p-8 text-center min-h-[340px]">
        <ErrorState
          title="Analysis Failed"
          message={errorMessage}
          onRetry={onRetry}
        />
      </Card>
    );
  }

  // Success state: display real response received from backend
  if (status === 'success' && result) {
    const classification = result.classification || 'Analysis Complete';
    const isPhishing = Boolean(result.is_phishing);
    const isSuspicious = !isPhishing && typeof result.risk_percentage === 'number' && result.risk_percentage >= 40;
    const isSafe = !isPhishing && !isSuspicious;

    let formattedRiskScore = null;
    if (typeof result.risk_percentage === 'number' && !isNaN(result.risk_percentage)) {
      formattedRiskScore = `${result.risk_percentage.toFixed(1)}%`;
    }

    const inputAnalyzed = result.input_analyzed || result.inputAnalyzed || result.input;

    let explanation = result.error || result.explanation;
    if (!explanation) {
      if (isPhishing) {
        explanation = result.is_spam
          ? 'This message exhibits characteristic indicators of an unsolicited smishing or scam attempt.'
          : 'Our AI model detected significant deceptive or credential-harvesting phishing patterns in this content.';
      } else {
        explanation = 'No deceptive phishing or scam patterns were detected. This content appears safe and legitimate.';
      }
    }

    // Build analysis details from actual backend response fields
    const indicators = [...(result.indicators || [])];
    if (indicators.length === 0) {
      if (result.score_type) {
        const scoreStr = typeof result.score === 'number' && !isNaN(result.score)
          ? ` (Raw Score: ${result.score.toFixed(4)})`
          : '';
        indicators.push({
          title: 'Scoring Model',
          description: `${result.score_type}${scoreStr}`,
        });
      }

      if (result.is_spam !== null && result.is_spam !== undefined) {
        indicators.push({
          title: 'SMS Spam Filter',
          description: result.is_spam
            ? 'Flagged as potential spam or smishing message.'
            : 'Passed spam filter (classified as legitimate/ham).',
        });
      }

      if (result.predicted_label !== null && result.predicted_label !== undefined) {
        indicators.push({
          title: 'Model Classification Outcome',
          description: result.predicted_label === 1
            ? 'Positive match for malicious / phishing threat (Class 1).'
            : 'Negative match for threats — classified as benign (Class 0).',
        });
      }

      if (result.error) {
        indicators.push({
          title: 'Detection Notice',
          description: String(result.error),
        });
      }
    }

    // Recommended actions based on risk
    const recommendations = result.recommendations && result.recommendations.length > 0
      ? result.recommendations
      : isPhishing
        ? [
            'Do not click any embedded links or download unexpected attachments.',
            'Never reveal sensitive passwords, banking credentials, or one-time passcodes.',
            'Verify the sender by contacting the organization directly through official channels.',
            'Mark this communication as junk/phishing and delete or block the sender.',
          ]
        : [
            'The content does not trigger standard phishing or scam heuristic rules.',
            'Always verify the destination domain before entering credentials online.',
          ];

    let bannerBg = 'bg-slate-50 border-slate-200 text-slate-900';
    let icon = <HelpCircle className="w-8 h-8 text-slate-500" />;
    let scoreBadgeClass = 'bg-slate-200 text-slate-800';

    if (isPhishing) {
      bannerBg = 'bg-red-50/90 border-red-200 text-red-900';
      icon = <AlertTriangle className="w-8 h-8 text-red-600" />;
      scoreBadgeClass = 'bg-red-100 text-red-700 border border-red-200';
    } else if (isSuspicious) {
      bannerBg = 'bg-amber-50/90 border-amber-200 text-amber-900';
      icon = <AlertCircle className="w-8 h-8 text-amber-600" />;
      scoreBadgeClass = 'bg-amber-100 text-amber-700 border border-amber-200';
    } else if (isSafe) {
      bannerBg = 'bg-emerald-50/90 border-emerald-200 text-emerald-900';
      icon = <ShieldCheck className="w-8 h-8 text-emerald-600" />;
      scoreBadgeClass = 'bg-emerald-100 text-emerald-700 border border-emerald-200';
    }

    return (
      <div className="space-y-6">
        {/* Result Banner matching Screenshot 3 */}
        <div
          className={`p-6 rounded-2xl border ${bannerBg} flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs`}
        >
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-xl bg-white/80 shadow-xs shrink-0">
              {icon}
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight">{classification}</h3>
              {explanation && (
                <p className="text-sm opacity-90 mt-1 max-w-xl">{explanation}</p>
              )}
            </div>
          </div>

          {formattedRiskScore && (
            <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1 shrink-0">
              <span className="text-xs uppercase tracking-wider font-bold opacity-70">
                Risk Score
              </span>
              <div
                className={`px-3.5 py-1.5 rounded-xl font-extrabold text-base ${scoreBadgeClass}`}
              >
                {formattedRiskScore}
              </div>
            </div>
          )}
        </div>

        {/* Input Analyzed */}
        {inputAnalyzed && (
          <Card>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Input Analyzed
            </h4>
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-sm text-slate-800 font-mono break-all leading-relaxed">
              {inputAnalyzed}
            </div>
          </Card>
        )}

        {/* Analysis Details / Threat Indicators */}
        {indicators.length > 0 && (
          <Card>
            <h4 className="text-sm font-bold text-slate-900 mb-3">Analysis Details</h4>
            <div className="space-y-3">
              {indicators.map((indicator, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/70 border border-slate-100"
                >
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-slate-800">
                      {indicator.title || indicator.name || indicator}
                    </p>
                    {indicator.description && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        {indicator.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <Card>
            <h4 className="text-sm font-bold text-slate-900 mb-2">Recommendations</h4>
            <ul className="space-y-1.5">
              {recommendations.map((rec, index) => (
                <li key={index} className="flex items-center gap-2 text-xs text-slate-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Guest Save CTA Card matching Screenshot 3 */}
        <Card className="bg-blue-50/60 border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-sm font-bold text-slate-900">Want to save this result?</h5>
              <p className="text-xs text-slate-600 mt-0.5">
                Create an account to keep your detection history and access it anytime.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="bg-white hover:bg-slate-50 border-slate-200 text-xs"
            >
              Login
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="text-xs"
            >
              Create Account
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return null;
}
