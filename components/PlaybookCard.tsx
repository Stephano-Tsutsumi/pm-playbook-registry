'use client';

import { useState } from 'react';
import type { Playbook } from '@/types';
import { CATEGORY_CONFIG } from '@/lib/categories';

interface PlaybookCardProps {
  playbook: Playbook;
}

export default function PlaybookCard({ playbook }: PlaybookCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const config = CATEGORY_CONFIG[playbook.category];
  const initials = playbook.contributor
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  async function handleCopy() {
    await navigator.clipboard.writeText(playbook.method);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDownload() {
    setDownloading(true);
    try {
      const res = await fetch(`/api/playbooks/${playbook.id}/download`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${playbook.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.skill`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="bg-surface border border-border rounded-xl flex flex-col transition-shadow hover:shadow-sm overflow-hidden">
      {playbook.featured && (
        <div className="bg-accent text-white text-xs font-semibold text-center py-1.5 tracking-wide uppercase">
          Start here
        </div>
      )}
      <div className="p-5 flex flex-col flex-1">
      <div className="flex items-start justify-between mb-3">
        <span className={`text-xs font-semibold uppercase tracking-wide px-2.5 py-0.5 rounded-full ${config.badge}`}>
          {config.label}
        </span>
        <span className="text-xs text-ink-3 bg-bg px-2 py-0.5 rounded font-mono">
          {playbook.tool}
        </span>
      </div>

      <h3 className="text-base font-semibold text-ink mb-2 font-display leading-snug">
        {playbook.title}
      </h3>

      <p className="text-sm text-ink-2 leading-relaxed mb-4 flex-1">
        {playbook.description}
      </p>

      {expanded && (
        <div className="mb-4 relative">
          <div className="bg-bg border border-border rounded-lg p-4 overflow-auto max-h-72">
            <pre className="text-xs font-mono text-ink-2 whitespace-pre-wrap leading-relaxed">
              {playbook.method}
            </pre>
          </div>
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 px-2.5 py-1 bg-surface border border-border rounded text-xs text-ink-2 hover:text-ink hover:border-border-strong transition-colors"
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center">
            {initials}
          </span>
          <span className="text-sm text-ink-2">{playbook.contributor}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs px-3 py-1.5 border border-border rounded-md text-ink-2 hover:text-ink hover:border-border-strong transition-colors"
          >
            {expanded ? 'hide prompt' : 'view prompt'}
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="text-xs px-3 py-1.5 border border-border rounded-md text-ink-2 hover:text-ink hover:border-border-strong transition-colors flex items-center gap-1 disabled:opacity-50"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v12m0 0l-4-4m4 4l4-4m-8 8h8" />
            </svg>
            .skill
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}
