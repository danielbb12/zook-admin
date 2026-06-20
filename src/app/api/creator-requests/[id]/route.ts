import { createAdminClient } from '@/lib/supabase/admin'
import type { NextRequest } from 'next/server'

export async function PATCH(req: NextRequest, ctx: RouteContext<'/api/creator-requests/[id]'>) {
  const { id } = await ctx.params
  const { status } = await req.json()
  const supabase = createAdminClient()
  const { error } = await supabase.from('creator_requests').update({ status }).eq('id', id)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}
