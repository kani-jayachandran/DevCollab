import { useState, useCallback } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useAI } from '../../hooks/useAI.js';
import { reviewCode } from '../../api/aiApi.js';
import { useCopyToClipboard } from '../../hooks/useCopyToClipboard.js';
import AILoadingDots from './AILoadingDots.jsx';

// Languages supported by both the backend and the syntax highlighter
const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python',     label: 'Python'     },
  { value: 'java',       label: 'Java'       },
  { value: 'cpp',        label: 'C++'        },
  { value: 'go',         label: 'Go'         },
];

// Score → colour mapping
function scoreColour(score) {
  if (score >= 8) return { ring: '#34d399', text: 'text-green-400',  bg: 'bg-green-500/10  border-green-500/30'  };
  if (score >= 5) return { ring: '#fbbf24', text: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30' };
  return           { ring: '#f87171', text: 'text-red-400',    bg: 'bg-red-500/10    border-red-500/30'    };
}

// Circular SVG score ring
function ScoreRing({ score }) {
  const radius = 30;
  const circ   = 2 * Math.PI * radius;
  const dash   = ((score / 10) * circ).toFixed(2);
  const { ring, text } = scoreColour(score);

  return (
    <div className="relative flex items-center justify-center w-20 h-20 shrink-0">
      <svg width="80" height="80" viewBox="0 0 80 80" className="-rotate-90">
        <circle cx="40" cy="40" r={radius} fill="none" stroke="#374151" strokeWidth="7" />
        <circle
          cx="40" cy="40" r={radius}
          fill="none" stroke={ring} strokeWidth="7" strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          style={{ transition: 'stroke-dasharray 0.7s ease' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center leading-none">
        <span className={`text-2xl font-bold ${text}`}>{score}</span>
        <span className="text-[9px] text-gray-500 mt-0.5">/ 10</span>
      </div>
    </div>
  );
}

// A single feedback category row
function FeedbackSection({ icon, label, items, colour }) {
  if (!items?.length) return null;
  return (
    <div>
      <h4 className={`text-xs font-semibold uppercase tracking-wider mb-2 ${colour}`}>
        {icon} {label}
      </h4>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
            <span className="text-gray-600 shrink-0 mt-0.5">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AICodeReviewPanel({ workspaceId, projectId }) {
  const [language, setLanguage] = useState('javascript');
  const [code,     setCode]     = useState('');
  const [copied,   copy]        = useCopyToClipboard();

  const apiFn = useCallback(
    (lang, src) => reviewCode(workspaceId, projectId, lang, src),
    [workspaceId, projectId]
  );
  const { result, loading, error, run, reset } = useAI(apiFn);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    run(language, code.trim());
  };

  const handleReset = () => {
    reset();
    setCode('');
  };

  const review = result?.review;
  const colours = review ? scoreColour(review.score) : null;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-800">
        <span className="text-lg">🔍</span>
        <div>
          <h3 className="text-sm font-semibold text-white">AI Code Review</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Paste a snippet — get bugs, performance, readability and security feedback
          </p>
        </div>
      </div>

      {/* ── Input form ─────────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} className="px-5 pt-4 pb-3 space-y-3">
        {/* Language selector */}
        <div className="flex items-center gap-3">
          <label className="text-xs text-gray-400 shrink-0">Language</label>
          <div className="flex gap-1.5 flex-wrap">
            {LANGUAGES.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setLanguage(value)}
                className={`text-xs px-3 py-1 rounded-lg border transition
                  ${language === value
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'
                  }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Code textarea */}
        <div className="relative">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={`Paste your ${LANGUAGES.find(l => l.value === language)?.label} code here…`}
            rows={10}
            disabled={loading}
            spellCheck={false}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-green-300 placeholder-gray-600 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-y disabled:opacity-50"
          />
          {code && (
            <button
              type="button"
              onClick={() => copy(code)}
              className={`absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded border transition
                ${copied
                  ? 'border-green-500/50 text-green-400 bg-green-500/10'
                  : 'border-gray-600 text-gray-500 hover:text-white bg-gray-800'
                }`}
            >
              {copied ? '✓' : 'Copy'}
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2 rounded-lg transition"
          >
            {loading ? 'Reviewing…' : 'Review code'}
          </button>
          {(result || error) && (
            <button
              type="button"
              onClick={handleReset}
              className="text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-4 py-2 rounded-lg transition"
            >
              Clear
            </button>
          )}
        </div>
      </form>

      {/* ── Loading ─────────────────────────────────────────────────────────── */}
      {loading && (
        <div className="px-5 pb-5">
          <AILoadingDots label="Analysing code…" />
        </div>
      )}

      {/* ── Error ───────────────────────────────────────────────────────────── */}
      {error && !loading && (
        <div className="px-5 pb-5">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* ── Results ─────────────────────────────────────────────────────────── */}
      {review && !loading && (
        <div className="border-t border-gray-800">
          {/* Score + summary bar */}
          <div className={`flex items-center gap-5 px-5 py-5 border-b border-gray-800 ${colours.bg} border-l-4`}
            style={{ borderLeftColor: colours.ring }}
          >
            <ScoreRing score={review.score} />
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${colours.text}`}>
                Quality score: {review.score}/10
              </p>
              <p className="text-sm text-gray-200 leading-relaxed">{review.summary}</p>
            </div>
          </div>

          {/* Syntax-highlighted code preview */}
          <div className="border-b border-gray-800 overflow-x-auto">
            <SyntaxHighlighter
              language={language === 'cpp' ? 'cpp' : language}
              style={vscDarkPlus}
              customStyle={{
                margin: 0,
                padding: '0.875rem 1.25rem',
                background: 'transparent',
                fontSize: '0.75rem',
                lineHeight: '1.6',
                maxHeight: '220px',
                overflowY: 'auto',
              }}
              showLineNumbers
              lineNumberStyle={{ color: '#4b5563', minWidth: '2.25em' }}
            >
              {code}
            </SyntaxHighlighter>
          </div>

          {/* Feedback categories */}
          <div className="px-5 py-5 space-y-5">
            <FeedbackSection
              icon="🐛" label="Bugs & Logic Errors"
              items={review.bugs}
              colour="text-red-400"
            />
            <FeedbackSection
              icon="⚡" label="Performance"
              items={review.performance}
              colour="text-yellow-400"
            />
            <FeedbackSection
              icon="📖" label="Readability"
              items={review.readability}
              colour="text-blue-400"
            />
            <FeedbackSection
              icon="🔒" label="Security"
              items={review.security}
              colour="text-orange-400"
            />
            {review.suggestions?.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider mb-2 text-indigo-400">
                  ✨ Top Suggestions
                </h4>
                <ol className="space-y-1.5 list-none">
                  {review.suggestions.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="text-indigo-500 font-mono text-xs shrink-0 mt-0.5">
                        {i + 1}.
                      </span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* All-clear message */}
            {!review.bugs?.length &&
             !review.performance?.length &&
             !review.readability?.length &&
             !review.security?.length && (
              <p className="text-sm text-green-400">
                ✓ No significant issues found.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Empty state ─────────────────────────────────────────────────────── */}
      {!loading && !error && !result && (
        <div className="px-5 pb-5">
          <p className="text-xs text-gray-600">
            Select a language, paste your code, and click Review to get AI feedback.
          </p>
        </div>
      )}
    </div>
  );
}
