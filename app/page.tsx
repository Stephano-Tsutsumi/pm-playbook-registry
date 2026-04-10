import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import type { Playbook } from '@/types';
import PlaybookRegistry from '@/components/PlaybookRegistry';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: playbooks } = await supabase
    .from('playbooks')
    .select('*')
    .order('created_at', { ascending: false });

  return <PlaybookRegistry initialPlaybooks={(playbooks as Playbook[]) ?? []} />;
}
