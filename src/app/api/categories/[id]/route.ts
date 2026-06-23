import { createAdminClient } from '@/lib/supabase/admin'
import type { NextRequest } from 'next/server'

export async function PATCH(req: NextRequest, ctx: RouteContext<'/api/categories/[id]'>) {
  const { id } = await ctx.params
  const body = await req.json()
  const supabase = createAdminClient()
  const { error } = await supabase.from('categories').update(body).eq('id', id)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<'/api/categories/[id]'>) {
  const { id } = await ctx.params
  const supabase = createAdminClient()

  // Fetch the category name to check videos by name
  const { data: cat, error: catError } = await supabase
    .from('categories')
    .select('name')
    .eq('id', id)
    .single()

  if (catError || !cat) return Response.json({ error: 'קטגוריה לא נמצאה' }, { status: 404 })

  const { count } = await supabase
    .from('videos')
    .select('*', { count: 'exact', head: true })
    .eq('category', cat.name)

  if ((count ?? 0) > 0) {
    return Response.json({ error: 'לא ניתן למחוק קטגוריה עם סרטונים' }, { status: 400 })
  }

  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}
