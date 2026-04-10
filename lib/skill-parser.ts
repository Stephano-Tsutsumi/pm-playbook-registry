import type { Category, PlaybookInsert } from '@/types';

const VALID_CATEGORIES: Category[] = ['analysis', 'engineering', 'product', 'comms', 'eval'];

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
    const categoryMatch = body.match(/\*\*Category\*\*:\s*(\w+)/);
    if (categoryMatch && VALID_CATEGORIES.includes(categoryMatch[1] as Category)) {
      result.category = categoryMatch[1] as Category;
    }

    const toolMatch = body.match(/\*\*Tool\*\*:\s*([^|*]+)/);
    if (toolMatch) result.tool = toolMatch[1].trim();

    const contribMatch = body.match(/\*\*Contributor\*\*:\s*([^*\n]+)/);
    if (contribMatch) result.contributor = contribMatch[1].trim();

    result.method = body;
  }

  return result;
}

export function isCompletePlaybook(data: Partial<PlaybookInsert>): data is PlaybookInsert {
  return !!(data.title && data.category && data.tool && data.contributor && data.description && data.method);
}
