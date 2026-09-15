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
    const classification = result.classification || result.result || 'Analysis Complete';
    const threatLevel = result.threat_level || result.threatLevel || classification;
    const confidence = result.confidence !== undefined ? `${result.confidence}%` : null;
    const riskScore = result.risk_score || result.riskScore || confidence;
    const inputAnalyzed = result.input_analyzed || result.inputAnalyzed || result.input;
    const indicators = result.indicators || [];
    const explanation = result.explanation;
    const recommendations = result.recommendations || [];

    const isPhishing =
      String(threatLevel).toLowerCase().includes('phishing') ||
      String(classification).toLowerCase().includes('phishing');
    const isSuspicious =
      String(threatLevel).toLowerCase().includes('suspicious') ||
      String(classification).toLowerCase().includes('suspicious');
    const isSafe =
      String(threatLevel).toLowerCase().includes('safe') ||
      String(classification).toLowerCase().includes('safe');

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

          {riskScore && (
            <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1 shrink-0">
              <span className="text-xs uppercase tracking-wider font-bold opacity-70">
                Risk Score
              </span>
              <div
                className={`px-3.5 py-1.5 rounded-xl font-extrabold text-base ${scoreBadgeClass}`}
              >
                {riskScore}
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
