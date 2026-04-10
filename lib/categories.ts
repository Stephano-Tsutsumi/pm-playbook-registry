import type { Category } from '@/types';

export const CATEGORY_CONFIG = {
  analysis:    { label: 'Analysis',    pip: 'bg-blue-500',    badge: 'text-blue-800 bg-blue-50' },
  engineering: { label: 'Engineering', pip: 'bg-purple-500',  badge: 'text-purple-800 bg-purple-50' },
  product:     { label: 'Product',     pip: 'bg-emerald-500', badge: 'text-emerald-800 bg-emerald-50' },
  comms:       { label: 'Comms',       pip: 'bg-orange-500',  badge: 'text-orange-800 bg-orange-50' },
  eval:        { label: 'Eval',        pip: 'bg-amber-500',   badge: 'text-amber-800 bg-amber-50' },
} satisfies Record<Category, { label: string; pip: string; badge: string }>;

export const CATEGORIES = Object.keys(CATEGORY_CONFIG) as Category[];
