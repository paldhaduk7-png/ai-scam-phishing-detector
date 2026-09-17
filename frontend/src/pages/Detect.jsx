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

const isDLDisabled =
  import.meta.env.VITE_DISABLE_DL === 'true' ||
  (import.meta.env.PROD && import.meta.env.VITE_DISABLE_DL !== 'false');

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
      setEmailSubject(example.label || 'Urgent Notification');
      setEmailContent(example.text);
    } else if (activeTab === 'url') {
      setUrlInput(example.text);
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
      if (activeTab === 'email' && emailModel === 'dl' && !isDLDisabled) {
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
    setMessageText('');
    setEmailSubject('');
    setEmailContent('');
    setUrlInput('');
  };

  return (
    <div className="space-y-6 animate-fadeIn text-left">
      {/* Page Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 dark:border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge status="info" size="sm">
              AI Security Scanner
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
            Threat Classification
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
            Instant multi-vector detection for suspicious SMS messages, phishing emails, and deceptive URLs.
          </p>
        </div>
      </div>

      {/* Main Detection Workspace: Side-by-Side 2 Columns (Input on Left, Result on Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Input Form (col-span-12 lg:col-span-6) */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="p-5 sm:p-6 space-y-5 shadow-sm border border-slate-200/90 dark:border-slate-800">
            {/* Segmented Channel Selection Tabs */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <DetectionTabs activeTab={activeTab} onChange={handleTabChange} />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 hidden sm:block font-mono">
                {activeTab}
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

            {/* Context-aware Test Samples */}
            <DetectionExamples activeTab={activeTab} onSelect={handleSelectExample} />
          </Card>
        </div>

        {/* Right Column: Prominently Highlighted Result Card (col-span-12 lg:col-span-6) */}
        <div className="lg:col-span-6">
          <DetectionResult
            status={analysisStatus}
            result={analysisResult}
            errorMessage={errorMessage}
            onRetry={handleAnalyze}
            onReset={handleReset}
          />
        </div>
      </div>
    </div>
  );
}
