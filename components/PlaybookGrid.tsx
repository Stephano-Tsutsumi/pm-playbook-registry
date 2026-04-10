'use client';

import type { Playbook } from '@/types';
import PlaybookCard from './PlaybookCard';

interface PlaybookGridProps {
  playbooks: Playbook[];
}

export default function PlaybookGrid({ playbooks }: PlaybookGridProps) {
  if (playbooks.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-ink-3 text-sm">No playbooks found. Try adjusting your search or filters.</p>
      </div>
    );
  }

  const sorted = [...playbooks].sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return 0;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {sorted.map((playbook) => (
        <PlaybookCard key={playbook.id} playbook={playbook} />
      ))}
    </div>
  );
}
