import React from 'react';
import PublicNavbar from '../components/layout/PublicNavbar';
import Footer from '../components/layout/Footer';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import {
  Shield,
  Mail,
  Trash2,
  Cpu,
  Server,
  KeyRound,
  ExternalLink,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

export default function PrivacyPolicy() {
  const lastUpdated = 'September 22, 2026';

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <PublicNavbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10 animate-fadeIn">
        {/* Header Section */}
        <div className="border-b border-slate-200/80 dark:border-slate-800/80 pb-6 text-left">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge variant="primary" size="sm">
              <Shield className="w-3.5 h-3.5 mr-1" />
              Legal &amp; Privacy Disclosure
            </Badge>
            <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
              <Calendar className="w-3.5 h-3.5" />
              Effective Date: {lastUpdated}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2 max-w-3xl leading-relaxed">
            This Privacy Policy details how ScamShield collects, processes, stores, and protects your information,
            including our specific data practices when you connect your Google Account or import emails via the Gmail API.
          </p>
        </div>

        {/* Section 1: Overview */}
        <section className="space-y-4 text-left">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-extrabold flex items-center justify-center">
              1
            </span>
            About ScamShield
          </h2>
          <Card className="p-6 space-y-3 border border-slate-200/80 dark:border-slate-800">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              ScamShield (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;the Platform&rdquo;) is an AI-powered scam and phishing threat detection application. The service evaluates digital communications across three primary channels: <strong>Email</strong>, <strong>SMS / Text Messages</strong>, and <strong>Web URLs</strong> to help individuals and security professionals identify deceptive lures, spoofed headers, and credential harvesting schemes.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              We believe in strict data minimization and transparent engineering. We only process data required to perform security analysis and maintain your private scan history audit logs.
            </p>
          </Card>
        </section>

        {/* Section 2: Information Collected */}
        <section className="space-y-4 text-left">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-extrabold flex items-center justify-center">
              2
            </span>
            Information We Collect
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-5 space-y-2.5 border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                <KeyRound className="w-4 h-4" />
                <span>Account &amp; Profile Data</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                When you create an account, we collect your full name, email address, and a password. Passwords are immediately hashed using standard salted <strong>bcrypt</strong> before storage in our PostgreSQL database; plaintext passwords are never stored, logged, or retrievable. If you optionally upload a profile photo, it is stored securely on Cloudinary.
              </p>
            </Card>

            <Card className="p-5 space-y-2.5 border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                <Shield className="w-4 h-4" />
                <span>Submitted Scan Content</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                When you submit content through manual paste or Gmail import, we process the text (email subject, sender, body text up to 20,000 characters, SMS text, or URL). For authenticated users, this content and the calculated risk metrics are recorded in your private detection history table.
              </p>
            </Card>

            <Card className="p-5 space-y-2.5 border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                <Mail className="w-4 h-4" />
                <span>Password Recovery Data</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                When you request a password reset, a 6-digit verification code is generated. The code is sent via encrypted SMTP to your registered email. In the database, we store only a cryptographic <strong>SHA-256 hash</strong> of the code combined with your user ID and a 10-minute expiration timestamp.
              </p>
            </Card>

            <Card className="p-5 space-y-2.5 border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                <Server className="w-4 h-4" />
                <span>Abuse Prevention Telemetry</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                To prevent automated Denial of Service and scraping attacks on public threat scanning endpoints, client IP addresses are tracked strictly in server memory (RAM) in a rolling 60-second sliding window to enforce a rate limit of 60 requests per minute.
              </p>
            </Card>
          </div>
        </section>

        {/* Section 3: Google OAuth & Gmail Integration */}
        <section className="space-y-4 text-left">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-extrabold flex items-center justify-center">
              3
            </span>
            Google OAuth &amp; Gmail Integration
          </h2>

          <Card className="p-6 space-y-4 border border-blue-200/70 dark:border-blue-900/60 bg-blue-50/20 dark:bg-blue-950/10">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Gmail API Usage &amp; Access Scope
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              ScamShield offers an optional Gmail integration that enables users to scan their incoming inbox messages for phishing and fraud lures without manually copying and pasting raw email bodies.
            </p>

            <div className="space-y-3 pt-2">
              <div className="p-3.5 rounded-xl bg-white dark:bg-[#0c121e] border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
                <span className="font-semibold text-slate-900 dark:text-white block">
                  Requested OAuth Scopes:
                </span>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    <code className="text-blue-600 dark:text-blue-400 font-mono text-[11px]">
                      openid, email, profile
                    </code>
                    : Used during Google Sign-In to verify your identity, read your verified email address, full name, and avatar picture.
                  </li>
                  <li>
                    <code className="text-blue-600 dark:text-blue-400 font-mono text-[11px]">
                      https://www.googleapis.com/auth/gmail.readonly
                    </code>
                    : Read-only access to view email messages and settings.
                  </li>
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Strict Read-Only Enforcement</span>
                </div>
                <p className="leading-relaxed">
                  ScamShield <strong>never requests write, send, or administrative permissions</strong>. ScamShield cannot compose emails, send messages, delete messages, modify your mailbox folders, or change your Google account configuration.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-[#0c121e] border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
                <span className="font-semibold text-slate-900 dark:text-white block">
                  What Email Information is Accessed:
                </span>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    <strong>Preview metadata</strong>: Message ID, Sender (From), Subject line, Date, and a short text snippet to display your recent inbox list in the selection modal.
                  </li>
                  <li>
                    <strong>Full text content (for analyzed emails only)</strong>: Subject line, Sender address, and plain text body (or decoded HTML converted to plain text).
                  </li>
                  <li>
                    <strong>Attachments are NOT accessed</strong>: Email attachments (PDFs, executables, ZIP archives, images) are <em>not downloaded, opened, parsed, or analyzed</em> by ScamShield.
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </section>

        {/* Section 4: Google API Services User Data Policy / Limited Use */}
        <section className="space-y-4 text-left">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-extrabold flex items-center justify-center">
              4
            </span>
            Google API Services User Data Policy &amp; Limited Use Disclosure
          </h2>

          <Card className="p-6 space-y-3.5 border border-slate-200/80 dark:border-slate-800">
            <div className="p-4 rounded-xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
              ScamShield&rsquo;s use and transfer to any other app of information received from Google APIs will adhere to the{' '}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 underline font-semibold inline-flex items-center gap-0.5 hover:text-blue-700"
              >
                Google API Services User Data Policy
                <ExternalLink className="w-3 h-3 ml-0.5 inline" />
              </a>
              , including the Limited Use requirements.
            </div>

            <div className="space-y-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>In accordance with the Limited Use requirements:</p>
              <ul className="space-y-2 list-none pl-0">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Specific User-Facing Functionality</strong>: We only access Google user data to provide user-facing threat detection features (identifying phishing, spam, and fraud in your emails) that are prominently displayed in the ScamShield interface.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>No Data Transfer to Third Parties</strong>: We do not transfer Google user data to third parties, except as necessary to provide or improve security features, comply with applicable laws, or as part of a merger/acquisition with user consent.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>No Advertising or Profiling</strong>: We never use or transfer Google user data for serving advertisements, personalized marketing, retargeting, or data-broker sales.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>No External AI / LLM Model Training</strong>: We do not use Google user data to train, fine-tune, or develop generalized machine learning or artificial intelligence models.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>No Human Reading of Emails</strong>: No humans read your email content unless you give explicit affirmative consent for a specific support investigation, it is necessary for security reasons (such as investigating abuse), or as required by law.
                  </span>
                </li>
              </ul>
            </div>
          </Card>
        </section>

        {/* Section 5: How Email Content is Analyzed & Local ML/DL Architecture */}
        <section className="space-y-4 text-left">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-extrabold flex items-center justify-center">
              5
            </span>
            How Content is Analyzed (Local AI Models)
          </h2>

          <Card className="p-6 space-y-3.5 border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              <Cpu className="w-4 h-4" />
              <span>Self-Hosted Local Inference Only</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              When an email, text message, or URL is submitted for evaluation, the analysis is executed <strong>entirely on ScamShield&rsquo;s own backend server</strong> using our pre-trained Machine Learning (LinearSVC with TF-IDF n-grams, XGBoost lexical tree classifiers) and Deep Learning sequence models (Bi-LSTM neural network).
            </p>
            <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-xs text-slate-600 dark:text-slate-300 space-y-1">
              <span className="font-semibold text-slate-900 dark:text-white block">
                No External AI Providers:
              </span>
              <p className="leading-relaxed">
                Your email text is <strong>never transmitted to external AI cloud APIs</strong> such as OpenAI, Google Gemini, Anthropic Claude, or any third-party commercial LLM provider. Inference runs in-process on the ScamShield server infrastructure.
              </p>
            </div>
          </Card>
        </section>

        {/* Section 6: Data Storage, Retention & Deletion */}
        <section className="space-y-4 text-left">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-extrabold flex items-center justify-center">
              6
            </span>
            Data Storage, Retention &amp; User Controls
          </h2>

          <Card className="p-6 space-y-4 border border-slate-200/80 dark:border-slate-800">
            <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                  1. Analyzed Emails vs. Unanalyzed Emails
                </h4>
                <p>
                  <strong>Unanalyzed emails</strong> shown in the inbox preview selection modal are retrieved temporarily to populate the preview list and are <strong>never written to our database</strong>.
                </p>
                <p className="mt-1">
                  <strong>Analyzed emails</strong> (emails you select and run through the detector) are saved in our PostgreSQL database under your user account in the <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">detections</code> table. Stored data includes the email sender (up to 255 characters), subject line (up to 500 characters), extracted plain text body (up to 20,000 characters), model classification, and risk percentage score.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                  2. Temporary In-Memory OAuth Token Handling
                </h4>
                <p>
                  Gmail OAuth <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">access_token</code> and <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">refresh_token</code> are stored <strong>strictly in volatile server RAM</strong> on the backend during your active session. They are <strong>never stored in PostgreSQL</strong> and are never exposed to browser localStorage or client JavaScript. Tokens are cleared immediately when you click &ldquo;Disconnect Gmail&rdquo;, when the token expires (~1 hour), or when the server process restarts.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1 flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                  <Trash2 className="w-4 h-4" />
                  <span>3. User Control &amp; Instant Data Deletion</span>
                </h4>
                <p>
                  You retain complete control over your detection history. From your ScamShield dashboard and History tabs, you can:
                </p>
                <ul className="list-disc pl-5 space-y-1 mt-1">
                  <li>
                    <strong>Delete individual detection records</strong>: Clicking the delete button on any scan permanently removes that record and its stored text from PostgreSQL.
                  </li>
                  <li>
                    <strong>Clear all history</strong>: Clicking &ldquo;Clear All History&rdquo; executes a bulk deletion that permanently purges all your scan records from the database.
                  </li>
                </ul>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                  4. How to Revoke Google Access
                </h4>
                <p>
                  You can revoke ScamShield&rsquo;s access to your Google account at any time through either of the following methods:
                </p>
                <ul className="list-disc pl-5 space-y-1 mt-1">
                  <li>
                    <strong>In ScamShield</strong>: Navigate to the Threat Scanner page and click <strong>Disconnect Gmail</strong>. This immediately removes active tokens from server memory.
                  </li>
                  <li>
                    <strong>In your Google Account</strong>: Visit{' '}
                    <a
                      href="https://myaccount.google.com/permissions"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 underline font-medium inline-flex items-center gap-0.5"
                    >
                      Google Third-party apps with account access
                      <ExternalLink className="w-3 h-3 ml-0.5 inline" />
                    </a>{' '}
                    and select <em>ScamShield</em> &rarr; <em>Remove Access</em>.
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </section>

        {/* Section 7: Third-Party Service Providers */}
        <section className="space-y-4 text-left">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-extrabold flex items-center justify-center">
              7
            </span>
            Third-Party Infrastructure &amp; Services
          </h2>

          <Card className="p-6 space-y-3.5 border border-slate-200/80 dark:border-slate-800">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              ScamShield utilizes reliable cloud infrastructure to host and serve the application:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-white block">Vercel Inc.</span>
                <span className="text-slate-500 dark:text-slate-400 mt-0.5 block">
                  Hosts the frontend web application (React/Vite).
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-white block">Render Services Inc.</span>
                <span className="text-slate-500 dark:text-slate-400 mt-0.5 block">
                  Hosts the backend FastAPI Python web application.
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-white block">Cloud-Hosted PostgreSQL</span>
                <span className="text-slate-500 dark:text-slate-400 mt-0.5 block">
                  Secure relational database for user accounts and detection history.
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-white block">Cloudinary</span>
                <span className="text-slate-500 dark:text-slate-400 mt-0.5 block">
                  Secure storage and delivery for user profile avatars.
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-white block">Google Identity Services</span>
                <span className="text-slate-500 dark:text-slate-400 mt-0.5 block">
                  OAuth 2.0 authentication and authorization protocols.
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-white block">Google SMTP (smtp.gmail.com)</span>
                <span className="text-slate-500 dark:text-slate-400 mt-0.5 block">
                  Encrypted TLS transport for password reset verification emails.
                </span>
              </div>
            </div>
          </Card>
        </section>

        {/* Section 8: Cookies & Browser Storage */}
        <section className="space-y-4 text-left">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-extrabold flex items-center justify-center">
              8
            </span>
            Cookies &amp; Local Storage
          </h2>

          <Card className="p-6 space-y-3.5 border border-slate-200/80 dark:border-slate-800">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              ScamShield uses essential cookies and local storage items strictly for security, authentication, and user preferences:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              <li>
                <strong>HTTP-Only Cookie (<code className="text-xs font-mono">access_token</code>)</strong>: Stores your signed JWT session credential with <code className="text-xs font-mono">HttpOnly</code>, <code className="text-xs font-mono">SameSite</code>, and <code className="text-xs font-mono">Secure</code> flags to protect against cross-site scripting (XSS).
              </li>
              <li>
                <strong>State Cookies (<code className="text-xs font-mono">oauth_state</code>, <code className="text-xs font-mono">gmail_oauth_state</code>)</strong>: Short-lived (5–10 minute) cryptographic tokens used strictly during OAuth redirects to protect against Cross-Site Request Forgery (CSRF).
              </li>
              <li>
                <strong>localStorage (<code className="text-xs font-mono">scamshield_token</code>)</strong>: Stored client-side to attach Authorization headers for authenticated REST API calls.
              </li>
              <li>
                <strong>localStorage (<code className="text-xs font-mono">scamshield_theme</code>)</strong>: Remembers your selected visual interface theme (<code className="text-xs font-mono">&apos;dark&apos;</code> or <code className="text-xs font-mono">&apos;light&apos;</code>).
              </li>
            </ul>
          </Card>
        </section>

        {/* Section 9: Data Security & Protections */}
        <section className="space-y-4 text-left">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-extrabold flex items-center justify-center">
              9
            </span>
            Data Security Measures
          </h2>

          <Card className="p-6 space-y-3 border border-slate-200/80 dark:border-slate-800">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <span><strong>Encryption in Transit</strong>: All data is transmitted over HTTPS with TLS 1.3 encryption.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <span><strong>Zero Credential Logging</strong>: Passwords, tokens, and authorization codes are filtered out of all server logs.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <span><strong>Isolated Multi-Tenancy</strong>: All history queries are strictly scoped to the authenticated user ID.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <span><strong>Short-Lived Ephemeral State</strong>: OAuth CSRF states expire automatically within minutes.</span>
              </div>
            </div>
          </Card>
        </section>

        {/* Section 10: Contact Information */}
        <section className="space-y-4 text-left">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-extrabold flex items-center justify-center">
              10
            </span>
            Contact &amp; Privacy Requests
          </h2>

          <Card className="p-6 space-y-3 border border-slate-200/80 dark:border-slate-800">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              If you have any questions about this Privacy Policy, your personal data, or wish to exercise data rights such as account deletion, please contact our team:
            </p>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-1">
              <p><strong>Project</strong>: ScamShield — AI Scam &amp; Phishing Detection Platform</p>
              <p><strong>Website</strong>: <a href="https://ai-scam-phishing-detector.vercel.app" className="text-blue-600 dark:text-blue-400 underline">https://ai-scam-phishing-detector.vercel.app</a></p>
              <p><strong>Email</strong>: <a href="mailto:paldhaduk18@gmail.com" className="font-mono text-blue-600 dark:text-blue-400 underline">paldhaduk18@gmail.com</a></p>
            </div>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
}
