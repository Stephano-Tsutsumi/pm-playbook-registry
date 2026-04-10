import type { Category, Playbook } from '@/types';

export function generateSkillMd(p: Playbook): string {
  const skillId = toKebabCase(p.title);
  const triggers = TRIGGER_MAP[p.category];

  const frontmatter = [
    '---',
    `name: ${skillId}`,
    `description: >`,
    `  ${p.description} Use this skill when ${triggers}.`,
    '---',
  ].join('\n');

  if (p.method.trimStart().startsWith('#')) {
    return frontmatter + '\n\n' + p.method;
  }

  return [
    frontmatter,
    '',
    `# ${p.title}`,
    '',
    `**Category**: ${p.category} | **Tool**: ${p.tool} | **Contributor**: ${p.contributor}`,
    '',
    '## Method / Prompt',
    '',
    '```',
    p.method,
    '```',
  ].join('\n');
}

export function toKebabCase(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const TRIGGER_MAP: Record<Category, string> = {
  analysis:    'analyzing data, reconciling metrics, debugging KPI discrepancies',
  engineering: 'designing systems, writing Jira tickets, architecting workflows',
  product:     'writing specs, designing QA workflows, documenting features',
  comms:       'writing stakeholder updates, drafting RCAs, creating decision logs',
  eval:        'designing evaluation frameworks, scoring AI interaction quality',
};
