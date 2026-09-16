import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import DetectionTabs from '../components/detection/DetectionTabs';
import MessageInput from '../components/detection/MessageInput';
import EmailInput from '../components/detection/EmailInput';
import UrlInput from '../components/detection/UrlInput';
import DetectionExamples from '../components/detection/DetectionExamples';
import DetectionResult from '../components/detection/DetectionResult';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import { detectScam, detectEmailDL } from '../services/api';
import {
  MessageSquare,
  Mail,
  Link as LinkIcon,
  Zap,
  Lock,
} from 'lucide-react';

export default function Detect() {
  const [searchParams, setSearchParams] = useSearchParams();

  const rawTab = searchParams.get('tab');
  const activeTab = ['message', 'email', 'url'].includes(rawTab) ? rawTab : 'message';

  const [messageText, setMessageText] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [emailModel, setEmailModel] = useState('ml');

  // Detection states: 'idle' | 'loading' | 'success' | 'error'
  const [analysisStatus, setAnalysisStatus] = useState('idle');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleTabChange = (tab) => {
    setSearchParams({ tab });
  };

  const handleSelectExample = (example) => {
    if (activeTab === 'message') {
      setMessageText(example.text);
    } else if (activeTab === 'email') {
      setEmailSubject('Urgent Notification');
      setEmailContent(example.text);
    } else if (activeTab === 'url') {
      if (example.text.includes('link') || example.text.includes('iPhone')) {
        setUrlInput('http://scam-offer.com/claim-prize');
      } else {
        setUrlInput('https://paypal-security-verify-account.com');
      }
    }
  };

  const handleAnalyze = async () => {
    let content = '';
    let content_type = 'sms';

    if (activeTab === 'message') {
      if (!messageText.trim()) return;
      content = messageText.trim();
      content_type = 'sms';
    } else if (activeTab === 'email') {
      if (!emailSubject.trim() && !emailContent.trim()) return;
      if (emailSubject.trim() && emailContent.trim()) {
        content = `Subject: ${emailSubject.trim()}\n\n${emailContent.trim()}`;
      } else if (emailSubject.trim()) {
        content = `Subject: ${emailSubject.trim()}`;
      } else {
        content = emailContent.trim();
      }
      content_type = 'email';
    } else if (activeTab === 'url') {
      if (!urlInput.trim()) return;
      content = urlInput.trim();
      content_type = 'url';
    }

    setAnalysisStatus('loading');
    setErrorMessage('');

    try {
      let response;
      if (activeTab === 'email' && emailModel === 'dl') {
        response = await detectEmailDL({ content });
      } else {
        response = await detectScam({
          content,
          content_type,
        });
      }
      setAnalysisResult(response);
      setAnalysisStatus('success');
      setErrorMessage('');
    } catch (err) {
      console.warn('Backend API error:', err?.message);
      let message =
        'Unable to analyze this content. The AI backend service is currently offline or unreachable. Please try again later.';

      if (typeof err.response?.data?.detail === 'string') {
        message = err.response.data.detail;
      } else if (Array.isArray(err.response?.data?.detail) && err.response.data.detail[0]?.msg) {
        message = err.response.data.detail[0].msg;
      } else if (err.response?.status === 500) {
        message = 'Detection service temporarily unavailable. Please try again later.';
      }

      setErrorMessage(message);
      setAnalysisStatus('error');
    }
  };

  const handleReset = () => {
    setAnalysisStatus('idle');
    setAnalysisResult(null);
    setErrorMessage('');
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn text-left">
      {/* Page Heading & Context Badge */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <Badge status="info" size="sm">
            AI Threat Inspection Engine
          </Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
          Detect Scams &amp; Phishing
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
          Screen suspicious text messages, full emails, or web hyperlinks using specialized machine learning and deep sequence modeling.
        </p>
      </div>

      {/* Main Detection Workspace & Assistant Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Input Canvas & Results (col-span-8) */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="p-6 space-y-6 shadow-sm">
            {/* Segmented Channel Selection Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
              <DetectionTabs activeTab={activeTab} onChange={handleTabChange} />
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider hidden sm:block">
                Channel: {activeTab}
              </span>
            </div>

            {/* Input Form Rendered by Active Tab */}
            {activeTab === 'message' && (
              <MessageInput
                value={messageText}
                onChange={setMessageText}
                onSubmit={handleAnalyze}
                isLoading={analysisStatus === 'loading'}
              />
            )}

            {activeTab === 'email' && (
              <EmailInput
                subject={emailSubject}
                content={emailContent}
                onSubjectChange={setEmailSubject}
                onContentChange={setEmailContent}
                onSubmit={handleAnalyze}
                isLoading={analysisStatus === 'loading'}
                emailModel={emailModel}
                onEmailModelChange={setEmailModel}
              />
            )}

            {activeTab === 'url' && (
              <UrlInput
                value={urlInput}
                onChange={setUrlInput}
                onSubmit={handleAnalyze}
                isLoading={analysisStatus === 'loading'}
              />
            )}

            {/* Sample Test Phrases Selector */}
            <DetectionExamples onSelect={handleSelectExample} />
          </Card>

          {/* Prominent Detection Result Section */}
          <DetectionResult
            status={analysisStatus}
            result={analysisResult}
            errorMessage={errorMessage}
            onRetry={handleAnalyze}
            onReset={handleReset}
          />
        </div>

        {/* Right Column: Threat Telemetry & Security Guidance (col-span-4) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card 1: Vector Inspection Guide */}
          <Card className="p-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Supported Vectors
            </h3>

            <div className="space-y-3.5">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-2xs">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    SMS &amp; Text Messages
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Evaluates smishing urgency, courier scams, and prize alerts.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-2xs">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Emails (Dual-Engine)
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Choose LinearSVC ML or 128-unit Bi-LSTM sequence neural net.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-2xs">
                  <LinkIcon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Suspicious URLs
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Analyzes typosquatting, deceptive domain entropy, and paths.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Card 2: Privacy Assurance */}
          <Card className="p-5 bg-gradient-to-b from-white to-blue-50/20 dark:from-[#0f172a] dark:to-blue-950/20 border-blue-100 dark:border-slate-800">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Privacy-Preserving Telemetry
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                  Guest analyses are evaluated entirely in ephemeral memory. Scans are only persisted to PostgreSQL when authenticated.
                </p>
              </div>
            </div>
          </Card>

          {/* Card 3: Model Architecture Telemetry */}
          <Card className="p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                Active Model Pipeline
              </span>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                Online
              </span>
            </div>
            <ul className="space-y-2 text-[11px] text-slate-600 dark:text-slate-400">
              <li className="flex items-center justify-between">
                <span>Email ML:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">LinearSVC + TF-IDF</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Email DL:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">Bi-LSTM (Keras)</span>
              </li>
              <li className="flex items-center justify-between">
                <span>SMS Spam:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">LinearSVC Pipeline</span>
              </li>
              <li className="flex items-center justify-between">
                <span>URL Scanner:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">XGBoost Classifier</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
