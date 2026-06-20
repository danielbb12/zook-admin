import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  const { name, parent_id, slug } = await req.json()
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('categories')
    .insert({ name, parent_id: parent_id ?? null, slug, is_active: true })
    .select()
    .single()
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}
