import { createAdminClient } from '@/lib/supabase/admin'
import type { NextRequest } from 'next/server'

export async function PATCH(req: NextRequest, ctx: RouteContext<'/api/gift-types/[id]'>) {
  const { id } = await ctx.params
  const body = await req.json()
  const supabase = createAdminClient()
  const { error } = await supabase.from('gift_types').update(body).eq('id', id)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}
