import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import DetectionTabs from '../components/detection/DetectionTabs';
import MessageInput from '../components/detection/MessageInput';
import EmailInput from '../components/detection/EmailInput';
import UrlInput from '../components/detection/UrlInput';
import DetectionExamples from '../components/detection/DetectionExamples';
import DetectionResult from '../components/detection/DetectionResult';
import GmailImportCard from '../components/detection/GmailImportCard';
import GmailAnalysisProgress from '../components/detection/GmailAnalysisProgress';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { Clock, ArrowRight, Shield } from 'lucide-react';
import {
  detectScam,
  detectEmailDL,
  getActiveGmailAnalysis,
} from '../services/api';

const isDLDisabled =
  import.meta.env.VITE_DISABLE_DL === 'true' ||
  (import.meta.env.PROD && import.meta.env.VITE_DISABLE_DL !== 'false');

export default function Detect() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const rawTab = searchParams.get('tab');
  const activeTab = ['message', 'email', 'url'].includes(rawTab) ? rawTab : 'message';

  // Sub-tab for Email Analysis: 'manual' | 'gmail'
  const [emailSource, setEmailSource] = useState('manual');
  const [activeGmailJob, setActiveGmailJob] = useState(null);
  const [autoOpenGmailModal, setAutoOpenGmailModal] = useState(false);

  const [messageText, setMessageText] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [emailModel, setEmailModel] = useState('ml');

  // Isolated per-channel detection states: 'idle' | 'loading' | 'success' | 'error'
  const [channelStates, setChannelStates] = useState({
    message: { status: 'idle', result: null, error: '' },
    email: { status: 'idle', result: null, error: '' },
    url: { status: 'idle', result: null, error: '' },
  });

  const currentChannelState = channelStates[activeTab] || {
    status: 'idle',
    result: null,
    error: '',
  };

  // Handle OAuth redirect return from Google
  useEffect(() => {
    const isConnected = searchParams.get('gmail_connected') === 'true';
    const gmailErr = searchParams.get('gmail_error');

    if (gmailErr) {
      toast.error(decodeURIComponent(gmailErr));
      const next = new URLSearchParams(searchParams);
      next.delete('gmail_error');
      setSearchParams(next, { replace: true });
    }

    if (isConnected) {
      // Clear query param so reload doesn't re-trigger
      const next = new URLSearchParams(searchParams);
      next.delete('gmail_connected');
      next.set('tab', 'email');
      setSearchParams(next, { replace: true });

      setEmailSource('gmail');
      setAutoOpenGmailModal(true);
      toast.success('Gmail connected! Select emails from your inbox to analyze.');
    }
  }, [searchParams, setSearchParams]);

  // Discover any currently running background job on mount or tab change
  useEffect(() => {
    let checkInterval;
    let isSubscribed = true;

    const checkActiveJob = async () => {
      try {
        const res = await getActiveGmailAnalysis();
        if (!isSubscribed) return;

        if (res?.active && res.job) {
          setActiveGmailJob((prev) => {
            if (
              prev?.job_id === res.job.job_id &&
              prev?.status === res.job.status &&
              prev?.processed === res.job.processed
            ) {
              return prev;
            }
            return res.job;
          });

          if (res.job.latest_result) {
            setChannelStates((prev) => {
              if (prev.email.status === 'success' && prev.email.result === res.job.latest_result) {
                return prev;
              }
              return {
                ...prev,
                email: { status: 'success', result: res.job.latest_result, error: '' },
              };
            });
          } else if (['starting', 'processing'].includes(res.job.status)) {
            setChannelStates((prev) => {
              if (prev.email.status === 'loading') return prev;
              return {
                ...prev,
                email: { status: 'loading', result: null, error: '' },
              };
            });
          }

          if (activeTab === 'email') {
            setEmailSource('gmail');
          }
        }
      } catch {
        // Backend not yet reached or guest user
      }
    };

    checkActiveJob();

    const activeJobStatus = activeGmailJob?.status;
    // Only poll periodically if currently on email tab and job is actively processing
    if (activeTab === 'email' && ['starting', 'processing'].includes(activeJobStatus)) {
      checkInterval = setInterval(checkActiveJob, 3500);
    }

    return () => {
      isSubscribed = false;
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [activeTab, emailSource, activeGmailJob?.status]);

  const handleTabChange = (tab) => {
    setSearchParams({ tab });
  };

  const handleSelectExample = (example) => {
    if (activeTab === 'message') {
      setMessageText(example.text);
    } else if (activeTab === 'email') {
      setEmailSource('manual');
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

    setChannelStates((prev) => ({
      ...prev,
      [activeTab]: { status: 'loading', result: null, error: '' },
    }));

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
      setChannelStates((prev) => ({
        ...prev,
        [activeTab]: { status: 'success', result: response, error: '' },
      }));
    } catch (err) {
      console.warn('Backend API error:', err?.message);
      let message =
        'Unable to analyze this content. The AI backend service is currently offline or unreachable. Please try again later.';

      if (typeof err.response?.data?.detail === 'string') {
        message = err.response.data.detail;
      } else if (Array.isArray(err.response?.data?.detail) && err.response.data.detail[0]?.msg) {
        message = err.response.data.detail[0].msg;
      }

      setChannelStates((prev) => ({
        ...prev,
        [activeTab]: { status: 'error', result: null, error: message },
      }));
    }
  };

  const handleReset = () => {
    setChannelStates((prev) => ({
      ...prev,
      [activeTab]: { status: 'idle', result: null, error: '' },
    }));
    if (activeTab === 'message') setMessageText('');
    if (activeTab === 'email') {
      setEmailSubject('');
      setEmailContent('');
    }
    if (activeTab === 'url') setUrlInput('');
  };

  const handleJobProgressUpdate = useCallback((job) => {
    setActiveGmailJob((prev) => {
      if (
        prev?.job_id === job?.job_id &&
        prev?.status === job?.status &&
        prev?.processed === job?.processed
      ) {
        return prev;
      }
      return job;
    });

    if (job?.latest_result) {
      setChannelStates((prev) => {
        if (prev.email.status === 'success' && prev.email.result === job.latest_result) {
          return prev;
        }
        return {
          ...prev,
          email: { status: 'success', result: job.latest_result, error: '' },
        };
      });
    }
  }, []);

  const handleJobCompleted = useCallback((job) => {
    setActiveGmailJob((prev) => {
      if (
        prev?.job_id === job?.job_id &&
        prev?.status === job?.status &&
        prev?.processed === job?.processed
      ) {
        return prev;
      }
      return job;
    });

    if (job?.latest_result) {
      setChannelStates((prev) => {
        if (prev.email.status === 'success' && prev.email.result === job.latest_result) {
          return prev;
        }
        return {
          ...prev,
          email: { status: 'success', result: job.latest_result, error: '' },
        };
      });
    }
  }, []);

  const handleJobCancel = useCallback(() => {
    setActiveGmailJob(null);
    setChannelStates((prev) => {
      if (prev.email.status === 'idle' && prev.email.result === null) return prev;
      return {
        ...prev,
        email: { status: 'idle', result: null, error: '' },
      };
    });
  }, []);

  const handleStartNew = useCallback(() => {
    setActiveGmailJob(null);
    setChannelStates((prev) => {
      if (prev.email.status === 'idle' && prev.email.result === null) return prev;
      return {
        ...prev,
        email: { status: 'idle', result: null, error: '' },
      };
    });
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 border-b border-slate-200/60 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/40 px-2.5 py-0.5 rounded-full font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              Live Security Engine
            </span>
            <span className="inline-flex items-center text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/40 px-2.5 py-0.5 rounded-full font-mono">
              3 Detection Channels
            </span>
          </div>
          <h1 className="text-xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight mt-1">
            Threat Classification
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
            Instant multi-vector detection for suspicious SMS messages, phishing emails, and deceptive URLs.
          </p>
        </div>
      </div>

      {/* Main Detection Workspace: Side-by-Side 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
        {/* Left Column: Input Form */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="p-3.5 sm:p-5 space-y-4 shadow-sm border border-slate-200/90 dark:border-slate-800">
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
                isLoading={currentChannelState.status === 'loading'}
              />
            )}

            {activeTab === 'email' && (
              <div className="space-y-4">
                {/* Email Source Switcher: [ Manual Email ]  [ Import from Gmail ] */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 dark:bg-slate-900/90 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEmailSource('manual')}
                    className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      emailSource === 'manual'
                        ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    Manual Email
                  </button>
                  <button
                    type="button"
                    onClick={() => setEmailSource('gmail')}
                    className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      emailSource === 'gmail'
                        ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <img
                      src="https://www.gstatic.com/images/branding/product/1x/gmail_2020q4_48dp.png"
                      className="w-3.5 h-3.5 object-contain"
                      alt=""
                    />
                    <span>Import from Gmail</span>
                    {activeGmailJob && ['starting', 'processing'].includes(activeGmailJob.status) && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    )}
                  </button>
                </div>

                {emailSource === 'manual' ? (
                  <EmailInput
                    subject={emailSubject}
                    content={emailContent}
                    onSubjectChange={setEmailSubject}
                    onContentChange={setEmailContent}
                    onSubmit={handleAnalyze}
                    isLoading={currentChannelState.status === 'loading'}
                    emailModel={emailModel}
                    onEmailModelChange={setEmailModel}
                  />
                ) : activeGmailJob && ['starting', 'processing', 'completed'].includes(activeGmailJob.status) ? (
                  <GmailAnalysisProgress
                    initialJob={activeGmailJob}
                    onProgressUpdate={handleJobProgressUpdate}
                    onCompleted={handleJobCompleted}
                    onCancel={handleJobCancel}
                    onStartNew={handleStartNew}
                  />
                ) : (
                  <GmailImportCard
                    onJobStarted={(job) => {
                      setActiveGmailJob(job);
                      setChannelStates((prev) => ({
                        ...prev,
                        email: {
                          status: job?.latest_result ? 'success' : 'loading',
                          result: job?.latest_result || null,
                          error: '',
                        },
                      }));
                    }}
                    autoOpenModal={autoOpenGmailModal}
                    onModalStateChange={(isOpen) => {
                      if (!isOpen) setAutoOpenGmailModal(false);
                    }}
                  />
                )}

              </div>
            )}

            {activeTab === 'url' && (
              <UrlInput
                value={urlInput}
                onChange={setUrlInput}
                onSubmit={handleAnalyze}
                isLoading={currentChannelState.status === 'loading'}
              />
            )}

            {/* Context-aware Test Samples (shown when on manual forms) */}
            {!(activeTab === 'email' && emailSource === 'gmail') && (
              <DetectionExamples activeTab={activeTab} onSelect={handleSelectExample} />
            )}
          </Card>

          {/* Compact Privacy Strip (matches reference layout) */}
          {activeTab === 'email' && emailSource === 'gmail' && !activeGmailJob && (
            <div className="p-3.5 sm:p-4 rounded-2xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-100/60 dark:border-blue-900/30 flex items-center gap-3.5 animate-fadeIn">
              <div className="w-9 h-9 rounded-xl bg-blue-100/80 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                  Your privacy is important
                </h5>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  We only read your email content for security analysis. Your data stays secure.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Prominently Highlighted Result Card */}
        <div className="lg:col-span-6">
          <DetectionResult
            status={currentChannelState.status}
            result={currentChannelState.result}
            channel={activeTab}
            errorMessage={currentChannelState.error}
            onRetry={handleAnalyze}
            onReset={handleReset}
          />
        </div>
      </div>

      {/* Quick History Log Banner */}
      {!(activeTab === 'email' && emailSource === 'gmail') && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-blue-50/40 dark:from-slate-900 dark:to-blue-950/20 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-950 dark:text-white flex items-center gap-2">
                <span>View Detection History</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                  Audit Log
                </span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Access your saved scans, past threats, severity scores, and timestamped classification records.
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() =>
              navigate(
                activeTab === 'email'
                  ? '/history/email'
                  : activeTab === 'url'
                  ? '/history/url'
                  : '/history/text'
              )
            }
            className="w-full sm:w-auto rounded-xl font-semibold text-xs px-5 py-2.5 shadow-sm shrink-0 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>
              {activeTab === 'email'
                ? 'Go to Email History'
                : activeTab === 'url'
                ? 'Go to URL History'
                : 'Go to Message History'}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
