import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import DetectionTabs from '../components/detection/DetectionTabs';
import MessageInput from '../components/detection/MessageInput';
import EmailInput from '../components/detection/EmailInput';
import UrlInput from '../components/detection/UrlInput';
import DetectionExamples from '../components/detection/DetectionExamples';
import DetectionResult from '../components/detection/DetectionResult';
import Card from '../components/common/Card';
import { detectScam } from '../services/api';
import {
  Shield,
  Search,
  MessageSquare,
  Mail,
  Link as LinkIcon,
  FileCheck,
} from 'lucide-react';

export default function Detect() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('tab');
  const activeTab = ['message', 'email', 'url'].includes(rawTab) ? rawTab : 'message';

  const [messageText, setMessageText] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [urlInput, setUrlInput] = useState('');

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
    let payload = {};
    if (activeTab === 'message') {
      if (!messageText.trim()) return;
      payload = { type: 'message', text: messageText };
    } else if (activeTab === 'email') {
      if (!emailSubject.trim() && !emailContent.trim()) return;
      payload = { type: 'email', subject: emailSubject, text: emailContent };
    } else if (activeTab === 'url') {
      if (!urlInput.trim()) return;
      payload = { type: 'url', url: urlInput };
    }

    setAnalysisStatus('loading');
    setErrorMessage('');

    try {
      const response = await detectScam(payload);
      setAnalysisResult(response);
      setAnalysisStatus('success');
    } catch (err) {
      console.warn('Backend API offline or error:', err.message);
      setErrorMessage(
        'Unable to analyze this content. The AI backend service is currently offline or unreachable. Please try again later.'
      );
      setAnalysisStatus('error');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Detect Scams &amp; Phishing
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Analyze messages, emails or URLs using advanced AI to stay safe online.
        </p>
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
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-blue-950">Your privacy matters</p>
              <p className="text-xs text-blue-800/80">
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
          <Card className="p-6 bg-gradient-to-b from-white to-blue-50/30 border-blue-100">
            {/* Cybersecurity graphic illustration */}
            <div className="w-full py-4 flex items-center justify-center">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-blue-100/70 flex items-center justify-center text-blue-600 shadow-inner">
                  <Search className="w-10 h-10 stroke-[2.2]" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-md">
                  <FileCheck className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div className="text-center mt-2">
              <h3 className="text-base font-bold text-slate-900">
                Detect. Prevent. Stay Safe.
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Our AI analyzes your input and provides an instant risk assessment to help you avoid scams and phishing attacks.
              </p>
            </div>
          </Card>

          {/* Card 2: Supported Input Types */}
          <Card className="p-6">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              Supported Input Types
            </h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-800">Text Messages</h5>
                  <p className="text-xs text-slate-500">SMS, WhatsApp, and chat messages</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-800">Emails</h5>
                  <p className="text-xs text-slate-500">Full email body, subjects &amp; headers</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <LinkIcon className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-800">URLs</h5>
                  <p className="text-xs text-slate-500">Check suspicious links &amp; web domains</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
