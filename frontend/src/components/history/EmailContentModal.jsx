import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, Mail, User, AtSign, Calendar, AlignLeft, Copy, Check, ExternalLink } from 'lucide-react';
import Button from '../common/Button';

/**
 * Strips HTML, style tags, script tags, and CSS artifacts from raw email text.
 * Also removes duplicate "Subject: ..." prefix from the start of body if present.
 */
function cleanEmailBody(rawText, subject) {
  if (!rawText) return '';

  let text = rawText;

  // 1. Remove duplicate Subject header from the start of the body
  if (subject) {
    const escapedSubject = subject.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const subjRegex = new RegExp(`^Subject:\\s*${escapedSubject}\\s*\\n*`, 'i');
    text = text.replace(subjRegex, '');
  } else {
    text = text.replace(/^Subject:[^\n]*\n+/i, '');
  }

  // 2. Strip <style> and <script> blocks completely
  text = text.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');
  text = text.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<head\b[^>]*>[\s\S]*?<\/head>/gi, '');
  text = text.replace(/<!doctype[^>]*>/gi, '');

  // 3. Strip CSS media queries or rule blocks if any raw CSS leaked into text
  text = text.replace(/@media[^{]*\{[\s\S]*?\}/gi, '');
  text = text.replace(/(?:^|\n)\s*\.[a-zA-Z0-9_-]+\s*\{[^}]*\}/g, '');

  // 4. Strip any remaining HTML tags
  text = text.replace(/<[^>]+>/g, ' ');

  // 5. Decode common HTML entities
  text = text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&copy;/gi, '©');

  // 6. Clean up line breaks and excessive whitespace
  const lines = text.split(/\r?\n/).map((l) => l.trim());
  const cleanLines = [];
  let prevEmpty = false;

  for (const line of lines) {
    if (!line) {
      if (!prevEmpty) {
        cleanLines.push('');
        prevEmpty = true;
      }
    } else {
      cleanLines.push(line);
      prevEmpty = false;
    }
  }

  return cleanLines.join('\n').trim();
}

/**
 * Formats a block of text into React elements with clickable markdown links and URLs.
 */
function renderFormattedContent(text) {
  if (!text) return null;

  // Split into paragraphs by double newlines
  const paragraphs = text.split(/\n\n+/);

  return paragraphs.map((para, pIdx) => {
    // Check if paragraph is a bullet item
    const isBullet = para.startsWith('•') || para.startsWith('- ');
    const displayPara = isBullet ? para.replace(/^[•\-]\s*/, '') : para;

    // Tokenize markdown links [text](url) and raw URLs
    const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)|(https?:\/\/[^\s<]+)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(displayPara)) !== null) {
      if (match.index > lastIndex) {
        parts.push(displayPara.substring(lastIndex, match.index));
      }

      if (match[1] && match[2]) {
        // [link text](url)
        parts.push(
          <a
            key={`${pIdx}-${match.index}`}
            href={match[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline font-medium break-all"
            onClick={(e) => e.stopPropagation()}
          >
            {match[1]}
          </a>
        );
      } else if (match[3]) {
        // raw https:// url
        parts.push(
          <a
            key={`${pIdx}-${match.index}`}
            href={match[3]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline font-medium break-all inline-flex items-center gap-0.5"
            onClick={(e) => e.stopPropagation()}
          >
            {match[3].length > 45 ? `${match[3].substring(0, 45)}...` : match[3]}
            <ExternalLink className="w-2.5 h-2.5 inline shrink-0" />
          </a>
        );
      }

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < displayPara.length) {
      parts.push(displayPara.substring(lastIndex));
    }

    if (isBullet) {
      return (
        <div key={pIdx} className="flex items-start gap-2 mb-2">
          <span className="text-blue-500 font-bold shrink-0 mt-0.5">•</span>
          <div className="leading-relaxed">{parts}</div>
        </div>
      );
    }

    return (
      <p key={pIdx} className="mb-3.5 leading-relaxed whitespace-pre-line last:mb-0">
        {parts}
      </p>
    );
  });
}

/**
 * EmailContentModal
 *
 * Displays clean, human-readable email body and metadata when viewing a scanned email.
 */
export default function EmailContentModal({ item, onClose }) {
  if (!item) return null;

  const isGmail = item.source === 'gmail';
  const [copied, setCopied] = useState(false);

  const rawContent = item.input_text || item.input || '';
  const cleanedBody = useMemo(() => {
    return cleanEmailBody(rawContent, item.subject);
  }, [rawContent, item.subject]);

  const handleCopyBody = () => {
    if (!cleanedBody) return;
    navigator.clipboard.writeText(cleanedBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Email Details"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#0b111e] border border-slate-200/80 dark:border-slate-800/80 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/40 flex items-center justify-center">
              <Mail className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <span className="font-bold text-base text-slate-950 dark:text-white">
              Email Details
            </span>
            {isGmail && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200/80 dark:border-red-900/40">
                <span className="inline-flex items-center justify-center w-3 h-3 rounded-full bg-gradient-to-br from-blue-500 via-red-500 to-yellow-400 text-white text-[7px] font-black leading-none shrink-0">G</span>
                Gmail
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close email details"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Metadata Fields ── */}
        <div className="px-6 pt-4 pb-3 space-y-3 shrink-0">

          {/* From */}
          <div className="flex gap-3 items-start">
            <div className="w-7 h-7 mt-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center shrink-0">
              <User className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">
                From
              </p>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 font-mono break-all">
                {item.sender || (
                  <span className="text-slate-400 dark:text-slate-500 italic font-sans font-normal">
                    Not available
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Subject */}
          <div className="flex gap-3 items-start">
            <div className="w-7 h-7 mt-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center shrink-0">
              <AtSign className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">
                Subject
              </p>
              <p className="text-xs font-semibold text-slate-900 dark:text-white break-words">
                {item.subject || (
                  <span className="text-slate-400 dark:text-slate-500 italic font-sans font-normal">
                    No subject
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Date */}
          <div className="flex gap-3 items-start">
            <div className="w-7 h-7 mt-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center shrink-0">
              <Calendar className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">
                Date
              </p>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {item.date_time || item.timestamp || item.created_at || '--'}
              </p>
            </div>
          </div>

        </div>

        {/* ── Divider ── */}
        <div className="mx-6 border-t border-slate-100 dark:border-slate-800 shrink-0" />

        {/* ── Body ── */}
        <div className="px-6 pt-3 pb-2 flex flex-col gap-2 min-h-0 flex-1 overflow-hidden">
          <div className="flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <AlignLeft className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Email Body
              </span>
            </div>
            {cleanedBody && (
              <button
                type="button"
                onClick={handleCopyBody}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer px-2 py-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Copy email body"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto rounded-xl bg-slate-50 dark:bg-[#070b13] border border-slate-200/80 dark:border-slate-800/80 p-4 text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-sans break-words leading-relaxed min-h-[160px] select-text">
            {cleanedBody ? (
              renderFormattedContent(cleanedBody)
            ) : (
              <span className="text-slate-400 dark:text-slate-500 italic font-sans text-xs">
                No email content available.
              </span>
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 flex justify-end border-t border-slate-100 dark:border-slate-800 shrink-0">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}

