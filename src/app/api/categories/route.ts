import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  const { name } = await req.json()
  if (!name?.trim()) return Response.json({ error: 'שם חובה' }, { status: 400 })

  const supabase = createAdminClient()

  // Compute next sort_order
  const { data: maxRow } = await supabase
    .from('categories')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  const sort_order = (maxRow?.sort_order ?? 0) + 1

  const { data, error } = await supabase
    .from('categories')
    .insert({ name: name.trim(), is_active: true, sort_order })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}
