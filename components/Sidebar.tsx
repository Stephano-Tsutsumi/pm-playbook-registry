'use client';

import { useRef, useState } from 'react';
import type { Category, FilterOption, Playbook, PlaybookInsert } from '@/types';
import { CATEGORIES, CATEGORY_CONFIG } from '@/lib/categories';
import { parseSkillMd } from '@/lib/skill-parser';

interface SidebarProps {
  playbooks: Playbook[];
  activeFilter: FilterOption;
  onFilterChange: (f: FilterOption) => void;
  onSkillUpload: (data: Partial<PlaybookInsert>) => void;
}

export default function Sidebar({ playbooks, activeFilter, onFilterChange, onSkillUpload }: SidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const totalCount = playbooks.length;
  const categoryCounts = CATEGORIES.reduce(
    (acc, cat) => {
      acc[cat] = playbooks.filter((p) => p.category === cat).length;
      return acc;
    },
    {} as Record<Category, number>
  );

  async function handleFile(file: File) {
    try {
      const JSZip = (await import('jszip')).default;
      const zip = await JSZip.loadAsync(file);

      let skillMd: string | null = null;
      for (const path of Object.keys(zip.files)) {
        if (path.endsWith('SKILL.md')) {
          skillMd = await zip.files[path].async('string');
          break;
        }
      }
      if (!skillMd) return;

      const parsed = parseSkillMd(skillMd);
      onSkillUpload(parsed);
    } catch {
      // silently fail for invalid files
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.skill')) handleFile(file);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  }

  return (
    <aside className="w-60 flex-shrink-0 pr-8">
      <div className="mb-10">
        <h1 className="text-2xl font-display font-bold text-ink leading-tight">
          Playbook<br />Registry
        </h1>
        <p className="text-[11px] tracking-[0.15em] uppercase text-ink-3 mt-1.5 font-medium">
          AI Workflow Library
        </p>
      </div>

      <div className="mb-8">
        <p className="text-[11px] tracking-[0.15em] uppercase text-ink-3 font-semibold mb-3">Browse</p>
        <button
          onClick={() => onFilterChange('all')}
          className={`flex items-center justify-between w-full px-3 py-1.5 rounded-md text-sm transition-colors ${
            activeFilter === 'all'
              ? 'bg-accent-light text-accent font-semibold'
              : 'text-ink-2 hover:text-ink hover:bg-surface'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent" />
            All playbooks
          </div>
          <span className="text-xs text-ink-3">{totalCount}</span>
        </button>
      </div>

      <div className="mb-8">
        <p className="text-[11px] tracking-[0.15em] uppercase text-ink-3 font-semibold mb-3">Category</p>
        <div className="space-y-0.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => onFilterChange(cat)}
              className={`flex items-center justify-between w-full px-3 py-1.5 rounded-md text-sm transition-colors ${
                activeFilter === cat
                  ? 'bg-accent-light text-accent font-semibold'
                  : 'text-ink-2 hover:text-ink hover:bg-surface'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${CATEGORY_CONFIG[cat].pip}`} />
                {CATEGORY_CONFIG[cat].label}
              </div>
              <span className="text-xs text-ink-3">{categoryCounts[cat]}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[11px] tracking-[0.15em] uppercase text-ink-3 font-semibold mb-3">Add a Skill</p>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-accent bg-accent-light'
              : 'border-border hover:border-border-strong'
          }`}
        >
          <p className="text-sm font-medium text-ink-2">Drop .skill file</p>
          <p className="text-xs text-ink-3 mt-1">or click to browse</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".skill"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      </div>
    </aside>
  );
}
