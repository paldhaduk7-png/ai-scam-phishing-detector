import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import DetectionTabs from '../components/detection/DetectionTabs';
import MessageInput from '../components/detection/MessageInput';
import EmailInput from '../components/detection/EmailInput';
import UrlInput from '../components/detection/UrlInput';
import DetectionExamples from '../components/detection/DetectionExamples';
import DetectionResult from '../components/detection/DetectionResult';
import Card from '../components/common/Card';
import { detectScam, detectEmailDL } from '../services/api';
import {
  Shield,
  Search,
  MessageSquare,
  Mail,
  Link as LinkIcon,
  FileCheck,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

export default function Detect() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
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

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Detect Scams &amp; Phishing
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Analyze messages, emails or URLs using advanced AI to stay safe online.
          </p>
        </div>

        {/* User Session Info Badge */}
        {isAuthenticated ? (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-xs font-medium self-start sm:self-auto shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              Signed in as <strong>{user?.name || 'User'}</strong> — scans saved to history
            </span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 text-blue-800 dark:text-blue-300 text-xs font-medium self-start sm:self-auto shadow-xs">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>
              Guest Mode — No login required.{' '}
              <Link to="/login" className="underline font-semibold hover:text-blue-950 dark:hover:text-blue-100">
                Sign in
              </Link>{' '}
              to save scans.
            </span>
          </div>
        )}
      </div>

      {/* Main Detect Form & Right Side Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form & Result (col-span-8) */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="p-6 space-y-6">
            {/* Tabs */}
            <DetectionTabs activeTab={activeTab} onChange={handleTabChange} />

            {/* Input by Active Tab */}
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

            {/* Examples Selector */}
            <DetectionExamples onSelect={handleSelectExample} />
          </Card>

          {/* Privacy Note Card matching Screenshot 2 & 3 */}
          <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-blue-950 dark:text-blue-100">Your privacy matters</p>
              <p className="text-xs text-blue-800/80 dark:text-blue-300/80">
                We do not store your input data for guest users. All analysis is evaluated in ephemeral memory.
              </p>
            </div>
          </div>

          {/* Detection Result Card */}
          <DetectionResult
            status={analysisStatus}
            result={analysisResult}
            errorMessage={errorMessage}
            onRetry={handleAnalyze}
          />
        </div>

        {/* Right Column: Info / Assistant Card matching Screenshot 2 (col-span-4) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card 1: Detect. Prevent. Stay Safe. */}
          <Card className="p-6 bg-gradient-to-b from-white to-blue-50/30 dark:from-[#11192e] dark:to-blue-950/20 border-blue-100 dark:border-slate-800">
            {/* Cybersecurity graphic illustration */}
            <div className="w-full py-4 flex items-center justify-center">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-blue-100/70 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-inner">
                  <Search className="w-10 h-10 stroke-[2.2]" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-md">
                  <FileCheck className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div className="text-center mt-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Detect. Prevent. Stay Safe.
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Our AI analyzes your input and provides an instant risk assessment to help you avoid scams and phishing attacks.
              </p>
            </div>
          </Card>

          {/* Card 2: Supported Input Types */}
          <Card className="p-6">
            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">
              Supported Input Types
            </h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">Text Messages</h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400">SMS, WhatsApp, and chat messages</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">Emails</h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Full email body, subjects &amp; headers</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <LinkIcon className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">URLs</h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Check suspicious links &amp; web domains</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
