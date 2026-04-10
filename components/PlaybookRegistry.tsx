'use client';

import { useState, useMemo, useCallback } from 'react';
import type { Playbook, PlaybookInsert, FilterOption, SortOption } from '@/types';
import Sidebar from './Sidebar';
import StatsBar from './StatsBar';
import SearchBar from './SearchBar';
import PlaybookGrid from './PlaybookGrid';
import ContributeModal from './ContributeModal';

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

  const handleSkillUpload = useCallback((data: Partial<PlaybookInsert>) => {
    setPrefillData(data);
    setIsModalOpen(true);
  }, []);

  async function handleSubmit(data: PlaybookInsert) {
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
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="p-8 border-r border-border bg-bg">
        <Sidebar
          playbooks={playbooks}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          onSkillUpload={handleSkillUpload}
        />
      </div>

      <main className="flex-1 p-8 overflow-auto">
        <div className="flex items-start justify-between mb-2">
          <StatsBar playbooks={playbooks} />
          <button
            onClick={() => {
              setPrefillData(undefined);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent/90 transition-colors flex-shrink-0"
          >
            + Contribute
          </button>
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
        onSubmit={handleSubmit}
        prefillData={prefillData}
      />
    </div>
  );
}
