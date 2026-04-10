'use client';

import type { SortOption } from '@/types';

interface SearchBarProps {
  query: string;
  onQueryChange: (q: string) => void;
  sort: SortOption;
  onSortChange: (s: SortOption) => void;
  resultCount: number;
}

export default function SearchBar({ query, onQueryChange, sort, onSortChange, resultCount }: SearchBarProps) {
  return (
    <div className="mb-6">
      <div className="flex gap-3 mb-4">
        <div className="flex-1 relative">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search playbooks, tools, methods..."
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-surface border border-border rounded-lg text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:border-border-strong transition-colors"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="px-4 py-3 bg-surface border border-border rounded-lg text-sm text-ink focus:outline-none focus:border-border-strong cursor-pointer"
        >
          <option value="newest">Newest first</option>
          <option value="alpha">A → Z</option>
          <option value="downloads">Most downloaded</option>
        </select>
      </div>
      <p className="text-sm text-ink-3">
        Showing <span className="font-semibold text-ink">{resultCount}</span> playbooks
      </p>
    </div>
  );
}
