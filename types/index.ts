export type Category =
  | 'analysis'
  | 'engineering'
  | 'product'
  | 'comms'
  | 'eval';

export interface Playbook {
  id: string;
  title: string;
  category: Category;
  tool: string;
  contributor: string;
  description: string;
  method: string;
  downloads: number;
  featured: boolean;
  created_at: string;
}

export interface PlaybookInsert {
  title: string;
  category: Category;
  tool: string;
  contributor: string;
  description: string;
  method: string;
}

export type SortOption = 'newest' | 'alpha' | 'downloads';
export type FilterOption = 'all' | Category;
