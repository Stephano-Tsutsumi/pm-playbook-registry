import { createClient } from '@/utils/supabase/server';
import type { Playbook } from '@/types';
import PlaybookRegistry from '@/components/PlaybookRegistry';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const supabase = createClient();
  const { data: playbooks } = await supabase
    .from('playbooks')
    .select('*')
    .order('created_at', { ascending: false });

  return <PlaybookRegistry initialPlaybooks={(playbooks as Playbook[]) ?? []} />;
}
