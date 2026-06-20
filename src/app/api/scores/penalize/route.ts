import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  const { creator_id, penalty } = await req.json()
  const supabase = createAdminClient()
  const { error } = await supabase.rpc('penalize_creator', { creator_id, penalty })
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}
