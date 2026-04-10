'use client';

import { useState, useMemo, useCallback, useRef } from 'react';
import type { Playbook, PlaybookInsert, FilterOption, SortOption } from '@/types';
import { parseSkillMd, isCompletePlaybook } from '@/lib/skill-parser';
import Sidebar from './Sidebar';
import StatsBar from './StatsBar';
import SearchBar from './SearchBar';
import PlaybookGrid from './PlaybookGrid';
import ContributeModal from './ContributeModal';
import Toast from './Toast';

interface PlaybookRegistryProps {
  initialPlaybooks: Playbook[];
}

export default function PlaybookRegistry({ initialPlaybooks }: PlaybookRegistryProps) {
  const [playbooks, setPlaybooks] = useState<Playbook[]>(initialPlaybooks);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterOption>('all');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [prefillData, setPrefillData] = useState<Partial<PlaybookInsert>>();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [uploading, setUploading] = useState(false);
  const headerFileRef = useRef<HTMLInputElement>(null);

  const filteredPlaybooks = useMemo(() => {
    let result = [...playbooks];

    if (activeFilter !== 'all') {
      result = result.filter((p) => p.category === activeFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tool.toLowerCase().includes(q) ||
          p.method.toLowerCase().includes(q)
      );
    }

    if (sortOption === 'newest') {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortOption === 'alpha') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      result.sort((a, b) => b.downloads - a.downloads);
    }

    return result;
  }, [playbooks, activeFilter, searchQuery, sortOption]);

  const publishSkillFile = useCallback(async (file: File) => {
    setUploading(true);
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

      if (!skillMd) {
        setToast({ message: 'No SKILL.md found in file', type: 'error' });
        return;
      }

      const parsed = parseSkillMd(skillMd);

      if (!isCompletePlaybook(parsed)) {
        setPrefillData(parsed);
        setIsModalOpen(true);
        return;
      }

      const res = await fetch('/api/playbooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed),
      });

      if (!res.ok) {
        const err = await res.json();
        setToast({ message: err.error || 'Failed to publish', type: 'error' });
        return;
      }

      const refreshRes = await fetch('/api/playbooks');
      const refreshed = await refreshRes.json();
      setPlaybooks(refreshed);
      setToast({ message: `Playbook published — ${parsed.title}`, type: 'success' });
    } catch {
      setToast({ message: 'Failed to read .skill file', type: 'error' });
    } finally {
      setUploading(false);
    }
  }, []);

  async function handleManualSubmit(data: PlaybookInsert) {
    const res = await fetch('/api/playbooks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      const refreshRes = await fetch('/api/playbooks');
      const refreshed = await refreshRes.json();
      setPlaybooks(refreshed);
      setIsModalOpen(false);
      setPrefillData(undefined);
      setToast({ message: `Playbook published — ${data.title}`, type: 'success' });
    }
  }

  function handleHeaderFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) publishSkillFile(file);
    e.target.value = '';
  }

  return (
    <div className="flex min-h-screen">
      <div className="p-8 border-r border-border bg-bg">
        <Sidebar
          playbooks={playbooks}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          onSkillUpload={publishSkillFile}
        />
      </div>

      <main className="flex-1 p-8 overflow-auto">
        <div className="flex items-start justify-between mb-2">
          <StatsBar playbooks={playbooks} />
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={() => {
                setPrefillData(undefined);
                setIsModalOpen(true);
              }}
              className="text-xs text-ink-3 hover:text-ink-2 underline underline-offset-2 transition-colors"
            >
              add manually
            </button>
            <button
              onClick={() => headerFileRef.current?.click()}
              disabled={uploading}
              className="px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent/90 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 4v12m0 0l-4-4m4 4l4-4" />
              </svg>
              {uploading ? 'Publishing...' : 'Upload .skill'}
            </button>
            <input
              ref={headerFileRef}
              type="file"
              accept=".skill"
              onChange={handleHeaderFileInput}
              className="hidden"
            />
          </div>
        </div>

        <SearchBar
          query={searchQuery}
          onQueryChange={setSearchQuery}
          sort={sortOption}
          onSortChange={setSortOption}
          resultCount={filteredPlaybooks.length}
        />

        <PlaybookGrid playbooks={filteredPlaybooks} />
      </main>

      <ContributeModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setPrefillData(undefined);
        }}
        onSubmit={handleManualSubmit}
        prefillData={prefillData}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  );
}
