import { createClient } from '@/utils/supabase/server';
import { generateSkillMd, toKebabCase } from '@/lib/skill-generator';
import type { Playbook } from '@/types';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createClient();

  const { data: p, error } = await supabase
    .from('playbooks')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !p) return new Response('Not found', { status: 404 });

  const playbook = p as Playbook;

  supabase
    .from('playbooks')
    .update({ downloads: playbook.downloads + 1 })
    .eq('id', playbook.id)
    .then();

  const skillMd = generateSkillMd(playbook);
  const skillId = toKebabCase(playbook.title);

  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();
  zip.folder(skillId)!.file('SKILL.md', skillMd);
  const buffer = await zip.generateAsync({ type: 'arraybuffer' });

  return new Response(new Blob([buffer], { type: 'application/zip' }), {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${skillId}.skill"`,
    },
  });
}
