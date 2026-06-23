import { createAdminClient } from '@/lib/supabase/admin'
import type { NextRequest } from 'next/server'

export async function PATCH(req: NextRequest, ctx: RouteContext<'/api/support/[id]'>) {
  const { id } = await ctx.params
  const body = await req.json()
  const supabase = createAdminClient()
  const { error } = await supabase.from('support_tickets').update(body).eq('id', id)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}
