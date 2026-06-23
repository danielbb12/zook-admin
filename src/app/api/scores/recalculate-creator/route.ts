import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  const { creator_id } = await req.json()
  const supabase = createAdminClient()
  const { error } = await supabase.rpc('recalculate_creator_score', { p_creator_id: creator_id })
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}
