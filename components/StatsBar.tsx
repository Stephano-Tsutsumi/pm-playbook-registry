'use client';

import type { Playbook } from '@/types';

interface StatsBarProps {
  playbooks: Playbook[];
}

export default function StatsBar({ playbooks }: StatsBarProps) {
  const totalPlaybooks = playbooks.length;
  const uniqueContributors = new Set(playbooks.map((p) => p.contributor)).size;
  const totalDownloads = playbooks.reduce((sum, p) => sum + p.downloads, 0);

  return (
    <div className="flex gap-12 mb-8">
      <div>
        <span className="text-4xl font-bold font-display text-ink">{totalPlaybooks}</span>
        <p className="text-sm text-ink-3 mt-0.5">playbooks</p>
      </div>
      <div>
        <span className="text-4xl font-bold font-display text-ink">{uniqueContributors}</span>
        <p className="text-sm text-ink-3 mt-0.5">contributors</p>
      </div>
      <div>
        <span className="text-4xl font-bold font-display text-ink">{totalDownloads}</span>
        <p className="text-sm text-ink-3 mt-0.5">downloads</p>
      </div>
    </div>
  );
}
