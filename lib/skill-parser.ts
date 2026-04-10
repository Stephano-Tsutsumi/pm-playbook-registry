import type { Category, PlaybookInsert } from '@/types';

export function parseSkillMd(content: string): Partial<PlaybookInsert> {
  const result: Partial<PlaybookInsert> = {};

  const parts = content.split('---');
  if (parts.length < 3) return result;

  const frontmatter = parts[1];
  const body = parts.slice(2).join('---').trim();

  const nameMatch = frontmatter.match(/name:\s*(.+)/);
  if (nameMatch) {
    result.title = nameMatch[1]
      .trim()
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  const blockDescMatch = frontmatter.match(/description:\s*>\n([\s\S]*?)(?=\n\S|$)/);
  if (blockDescMatch) {
    result.description = blockDescMatch[1]
      .split('\n')
      .map((l) => l.trim())
      .join(' ')
      .trim()
      .slice(0, 400);
  } else {
    const inlineDescMatch = frontmatter.match(/description:\s*(.+)/);
    if (inlineDescMatch) {
      result.description = inlineDescMatch[1].trim().slice(0, 400);
    }
  }

  if (body) {
    result.method = body;
  }

  return result;
}
