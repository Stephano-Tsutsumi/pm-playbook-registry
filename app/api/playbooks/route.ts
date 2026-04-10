import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import type { PlaybookInsert } from '@/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q        = searchParams.get('q') ?? '';
  const category = searchParams.get('category') ?? 'all';
  const sort     = searchParams.get('sort') ?? 'newest';

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  let query = supabase.from('playbooks').select('*');

  if (q) {
    query = query.or(
      `title.ilike.%${q}%,description.ilike.%${q}%,tool.ilike.%${q}%,method.ilike.%${q}%`
    );
  }
  if (category !== 'all') {
    query = query.eq('category', category);
  }

  query = query.order('featured', { ascending: false });

  if (sort === 'newest')    query = query.order('created_at', { ascending: false });
  else if (sort === 'alpha') query = query.order('title');
  else                       query = query.order('downloads', { ascending: false });

  const { data, error } = await query;
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function POST(request: Request) {
  const body: PlaybookInsert = await request.json();

  const required: (keyof PlaybookInsert)[] = ['title', 'category', 'tool', 'contributor', 'description', 'method'];
  for (const field of required) {
    if (!body[field]) {
      return Response.json({ error: `${field} is required` }, { status: 400 });
    }
  }

  const validCategories = ['analysis', 'engineering', 'product', 'comms', 'eval'];
  if (!validCategories.includes(body.category)) {
    return Response.json({ error: 'Invalid category' }, { status: 400 });
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase
    .from('playbooks')
    .insert(body)
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data, { status: 201 });
}
