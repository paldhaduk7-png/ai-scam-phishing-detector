import React from 'react';
import { Link } from 'react-router-dom';
import PublicNavbar from '../components/layout/PublicNavbar';
import Footer from '../components/layout/Footer';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import {
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Scale,
  Ban,
} from 'lucide-react';

export default function TermsOfService() {
  const lastUpdated = 'September 22, 2026';

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <PublicNavbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10 animate-fadeIn">
        {/* Header Section */}
        <div className="border-b border-slate-200/80 dark:border-slate-800/80 pb-6 text-left">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge variant="primary" size="sm">
              <Scale className="w-3.5 h-3.5 mr-1" />
              Terms &amp; Conditions
            </Badge>
            <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
              <Calendar className="w-3.5 h-3.5" />
              Effective Date: {lastUpdated}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white tracking-tight">
            Terms of Service
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2 max-w-3xl leading-relaxed">
            Please read these Terms of Service carefully before accessing or using ScamShield. By creating an account,
            accessing the platform, or submitting content for analysis, you agree to be bound by these terms.
          </p>
        </div>

        {/* Section 1: Acceptance of Terms */}
        <section className="space-y-4 text-left">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-extrabold flex items-center justify-center">
              1
            </span>
            Acceptance of Terms
          </h2>
          <Card className="p-6 space-y-3 border border-slate-200/80 dark:border-slate-800">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of the ScamShield website, APIs, detection engines, and user interfaces (collectively, the &ldquo;Service&rdquo;). By accessing, registering for, or using the Service, you signify that you have read, understood, and agree to be bound by these Terms and our <Link to="/privacy-policy" className="text-blue-600 dark:text-blue-400 underline font-medium">Privacy Policy</Link>.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              If you do not agree with any part of these Terms, you must immediately cease accessing or using the Service.
            </p>
          </Card>
        </section>

        {/* Section 2: Description of Service */}
        <section className="space-y-4 text-left">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-extrabold flex items-center justify-center">
              2
            </span>
            Description of the Service
          </h2>
          <Card className="p-6 space-y-3 border border-slate-200/80 dark:border-slate-800">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              ScamShield is an educational and assistive cybersecurity software application designed to detect social engineering lures, spam, and phishing threats across:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              <li><strong>Emails</strong>: Analyzed using TF-IDF LinearSVC machine learning and Bi-LSTM deep learning sequence modeling.</li>
              <li><strong>SMS / Text Messages</strong>: Evaluated for smishing keywords, urgent calls to action, and fraudulent alerts.</li>
              <li><strong>Web URLs</strong>: Inspected using 23 structural and lexical heuristics with gradient-boosted decision trees (XGBoost).</li>
            </ul>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
              ScamShield also features an optional Gmail integration allowing users to connect their Google mailbox via the official Google OAuth 2.0 read-only scope for automated phishing analysis.
            </p>
          </Card>
        </section>

        {/* Section 3: AI & ML Detection Limitations (Critical Disclaimer) */}
        <section className="space-y-4 text-left">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-extrabold flex items-center justify-center">
              3
            </span>
            AI/ML Detection Limitations &amp; Disclaimers
          </h2>

          <Card className="p-6 space-y-4 border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/20 dark:bg-amber-950/10">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4" />
              <span>Probabilistic Evaluation — Not an Absolute Guarantee</span>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                <strong>No Infallibility Guarantee</strong>: The threat scores, classifications, and indicators generated by ScamShield are the output of statistical Machine Learning and Deep Learning models. <strong>No AI or machine learning model is 100% accurate.</strong>
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <strong>False Positives</strong>: Legitimate communications, receipts, newsletters, or security notices may occasionally be classified as suspicious or phishing.
                </li>
                <li>
                  <strong>False Negatives</strong>: Highly sophisticated, novel, zero-day, or targeted spear-phishing campaigns may evade detection and receive a &ldquo;Safe&rdquo; rating.
                </li>
              </ul>
              <div className="p-3.5 rounded-xl bg-white dark:bg-[#0c121e] border border-amber-200/70 dark:border-amber-900/40 text-xs text-slate-700 dark:text-slate-300">
                <strong>User Responsibility:</strong> ScamShield is provided strictly as an <em>assistive security advisor</em>. You are solely responsible for exercising standard human diligence before clicking links, opening external attachments, submitting personal credentials, or transferring money. You must never rely solely on ScamShield as your sole defense against online fraud.
              </div>
            </div>
          </Card>
        </section>

        {/* Section 4: Permitted and Prohibited Use */}
        <section className="space-y-4 text-left">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-extrabold flex items-center justify-center">
              4
            </span>
            Permitted &amp; Prohibited Use
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-5 space-y-2.5 border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Permitted Use</span>
              </div>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <li>Evaluating suspicious emails, texts, and URLs received by you.</li>
                <li>Conducting security research and personal threat analysis.</li>
                <li>Auditing your personal Gmail inbox for potential fraud threats.</li>
                <li>Reviewing detection history to improve your personal cybersecurity awareness.</li>
              </ul>
            </Card>

            <Card className="p-5 space-y-2.5 border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                <Ban className="w-4 h-4" />
                <span>Prohibited Use</span>
              </div>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <li>Bypassing or attempting to circumvent rate limits (60 req/min) or security headers.</li>
                <li>Automating mass data scraping or denial-of-service (DoS) attacks on detection endpoints.</li>
                <li>Reverse engineering or extracting model weights for unauthorized commercial redistribution.</li>
                <li>Using the platform to test and refine phishing payloads to evade detection filters.</li>
                <li>Attempting unauthorized access to accounts or data belonging to other users.</li>
              </ul>
            </Card>
          </div>
        </section>

        {/* Section 5: Google Account & Gmail Integration Terms */}
        <section className="space-y-4 text-left">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-extrabold flex items-center justify-center">
              5
            </span>
            Google Account &amp; Gmail Integration
          </h2>

          <Card className="p-6 space-y-3.5 border border-slate-200/80 dark:border-slate-800">
            <div className="space-y-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                When you connect your Google Account via Google Sign-In or Gmail integration:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <strong>Read-Only Authority</strong>: You grant ScamShield temporary, read-only access (<code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">gmail.readonly</code>) solely to inspect email messages for threats upon your request. ScamShield cannot send, compose, or delete emails.
                </li>
                <li>
                  <strong>Authority to Access</strong>: You represent that you are the authorized owner or administrator of the Google Account connected to the Service.
                </li>
                <li>
                  <strong>Revocation at Will</strong>: You may disconnect Gmail or revoke Google permissions at any time via the ScamShield Threat Scanner or directly in your Google Account security settings.
                </li>
                <li>
                  <strong>No Google Endorsement</strong>: Google LLC is an independent third party. Google does not endorse, certify, or sponsor ScamShield, and ScamShield operates under Google&rsquo;s applicable developer policies.
                </li>
              </ul>
            </div>
          </Card>
        </section>

        {/* Section 6: Third-Party Services & Links */}
        <section className="space-y-4 text-left">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-extrabold flex items-center justify-center">
              6
            </span>
            Third-Party Services
          </h2>

          <Card className="p-6 space-y-3 border border-slate-200/80 dark:border-slate-800">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              The Service integrates with third-party infrastructure providers including Google Cloud Platform, Cloudinary, Vercel, and Render. ScamShield is not responsible for the availability, terms, or privacy practices of these third parties.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              When analyzing URLs or hyperlinks, ScamShield does not endorse or control the destination websites. Visiting links evaluated by ScamShield is done entirely at your own risk.
            </p>
          </Card>
        </section>

        {/* Section 7: Intellectual Property */}
        <section className="space-y-4 text-left">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-extrabold flex items-center justify-center">
              7
            </span>
            Intellectual Property Rights
          </h2>

          <Card className="p-6 space-y-3 border border-slate-200/80 dark:border-slate-800">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              All rights, titles, and interests in ScamShield, including the software code, user interface, brand assets, feature extraction algorithms, and trained model weights, are the exclusive property of ScamShield and its creators.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              You retain all ownership rights in the content and messages you submit for analysis. You grant ScamShield a limited, non-exclusive license solely to process and analyze such content in accordance with these Terms and our Privacy Policy.
            </p>
          </Card>
        </section>

        {/* Section 8: Disclaimer of Warranties & Limitation of Liability */}
        <section className="space-y-4 text-left">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-extrabold flex items-center justify-center">
              8
            </span>
            Warranty Disclaimers &amp; Limitation of Liability
          </h2>

          <Card className="p-6 space-y-3.5 border border-slate-200/80 dark:border-slate-800">
            <div className="space-y-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <p className="uppercase text-[11px] font-bold text-slate-900 dark:text-white tracking-wide">
                &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo;
              </p>
              <p>
                THE SERVICE IS PROVIDED ON AN &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; BASIS WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE, INCLUDING WITHOUT LIMITATION WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.
              </p>
              <p className="uppercase text-[11px] font-bold text-slate-900 dark:text-white tracking-wide pt-2">
                LIMITATION ON DAMAGES
              </p>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL SCAMSHIELD, ITS CONTRIBUTORS, DEVELOPERS, OR AFFILIATES BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO: LOSS OF PROFITS, DATA LOSS, COMPROMISE OF CREDENTIALS, IDENTITY THEFT, PHISHING DAMAGES, SERVICE INTERRUPTIONS, OR COMPUTER SYSTEM DAMAGE ARISING FROM OR RELATED TO YOUR USE OF OR INABILITY TO USE THE SERVICE.
              </p>
            </div>
          </Card>
        </section>

        {/* Section 9: Service Modifications & Termination */}
        <section className="space-y-4 text-left">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-extrabold flex items-center justify-center">
              9
            </span>
            Modifications &amp; Termination
          </h2>

          <Card className="p-6 space-y-3 border border-slate-200/80 dark:border-slate-800">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time, with or without prior notice. We may update these Terms periodically; your continued use of ScamShield following the posting of revised Terms constitutes acceptance of the changes.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              You may terminate your agreement with these Terms at any time by ceasing all use of the platform and deleting your detection history.
            </p>
          </Card>
        </section>

        {/* Section 10: Contact Information */}
        <section className="space-y-4 text-left">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 text-xs font-extrabold flex items-center justify-center">
              10
            </span>
            Contact &amp; Legal Notices
          </h2>

          <Card className="p-6 space-y-3 border border-slate-200/80 dark:border-slate-800">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              For any questions, legal notices, or feedback regarding these Terms of Service, please contact:
            </p>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-1">
              <p><strong>Project</strong>: ScamShield — AI Scam &amp; Phishing Detection Platform</p>
              <p><strong>Website</strong>: <a href="https://ai-scam-phishing-detector.vercel.app" className="text-blue-600 dark:text-blue-400 underline">https://ai-scam-phishing-detector.vercel.app</a></p>
              <p><strong>Contact Email</strong>: <a href="mailto:paldhaduk18@gmail.com" className="font-mono text-blue-600 dark:text-blue-400 underline">paldhaduk18@gmail.com</a></p>
            </div>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
}
