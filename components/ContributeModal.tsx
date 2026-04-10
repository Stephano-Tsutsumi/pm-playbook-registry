'use client';

import { useRef, useEffect } from 'react';
import type { Category, PlaybookInsert } from '@/types';
import { CATEGORIES, CATEGORY_CONFIG } from '@/lib/categories';

interface ContributeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PlaybookInsert) => Promise<void>;
  prefillData?: Partial<PlaybookInsert>;
}

export default function ContributeModal({ isOpen, onClose, onSubmit, prefillData }: ContributeModalProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [isOpen]);

  useEffect(() => {
    if (prefillData && formRef.current) {
      const form = formRef.current;
      if (prefillData.title) (form.elements.namedItem('title') as HTMLInputElement).value = prefillData.title;
      if (prefillData.category) (form.elements.namedItem('category') as HTMLSelectElement).value = prefillData.category;
      if (prefillData.tool) (form.elements.namedItem('tool') as HTMLInputElement).value = prefillData.tool;
      if (prefillData.contributor) (form.elements.namedItem('contributor') as HTMLInputElement).value = prefillData.contributor;
      if (prefillData.description) (form.elements.namedItem('description') as HTMLTextAreaElement).value = prefillData.description;
      if (prefillData.method) (form.elements.namedItem('method') as HTMLTextAreaElement).value = prefillData.method;
    }
  }, [prefillData]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const form = formRef.current!;
    const formData = new FormData(form);

    const data: PlaybookInsert = {
      title: formData.get('title') as string,
      category: formData.get('category') as Category,
      tool: formData.get('tool') as string,
      contributor: formData.get('contributor') as string,
      description: formData.get('description') as string,
      method: formData.get('method') as string,
    };

    await onSubmit(data);
    form.reset();
  }

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="backdrop:bg-black/40 bg-transparent p-0 m-auto max-w-lg w-full"
    >
      <div className="bg-surface rounded-xl border border-border shadow-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-display font-bold text-ink">Contribute a Playbook</h2>
          <button onClick={onClose} className="text-ink-3 hover:text-ink transition-colors text-xl leading-none">
            ×
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-ink-2 mb-1">Title</label>
            <input
              id="title"
              name="title"
              type="text"
              required
              maxLength={120}
              className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm text-ink focus:outline-none focus:border-border-strong"
              placeholder="e.g. Weekly call outcome dashboard from CSV"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-ink-2 mb-1">Category</label>
              <select
                id="category"
                name="category"
                required
                className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm text-ink focus:outline-none focus:border-border-strong"
              >
                <option value="">Select...</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{CATEGORY_CONFIG[cat].label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="tool" className="block text-sm font-medium text-ink-2 mb-1">Tool</label>
              <input
                id="tool"
                name="tool"
                type="text"
                required
                className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm text-ink focus:outline-none focus:border-border-strong"
                placeholder="e.g. pandas + Claude"
              />
            </div>
          </div>

          <div>
            <label htmlFor="contributor" className="block text-sm font-medium text-ink-2 mb-1">Your name</label>
            <input
              id="contributor"
              name="contributor"
              type="text"
              required
              className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm text-ink focus:outline-none focus:border-border-strong"
              placeholder="e.g. Steph"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-ink-2 mb-1">
              Description <span className="text-ink-3 font-normal">(max 400 chars)</span>
            </label>
            <textarea
              id="description"
              name="description"
              required
              maxLength={400}
              rows={3}
              className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm text-ink focus:outline-none focus:border-border-strong resize-none"
              placeholder="2-3 sentence summary of what this playbook does..."
            />
          </div>

          <div>
            <label htmlFor="method" className="block text-sm font-medium text-ink-2 mb-1">Method / Prompt</label>
            <textarea
              id="method"
              name="method"
              required
              rows={8}
              className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm font-mono text-ink focus:outline-none focus:border-border-strong resize-y"
              placeholder="The full prompt or workflow steps..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-ink-2 hover:text-ink transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent/90 transition-colors"
            >
              Submit Playbook
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
