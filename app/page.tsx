import { createClient } from '@/utils/supabase/server';
import type { Playbook } from '@/types';
import PlaybookRegistry from '@/components/PlaybookRegistry';

export const dynamic = 'force-dynamic';

export default async function Home() {
  let playbooks: Playbook[] = [];

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('playbooks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase query error:', error.message);
    } else {
      playbooks = (data as Playbook[]) ?? [];
    }
  } catch (err) {
    console.error('Failed to connect to Supabase:', err);
  }

  return <PlaybookRegistry initialPlaybooks={playbooks} />;
}
