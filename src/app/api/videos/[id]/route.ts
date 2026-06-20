import { createAdminClient } from '@/lib/supabase/admin'
import type { NextRequest } from 'next/server'

export async function PATCH(req: NextRequest, ctx: RouteContext<'/api/videos/[id]'>) {
  const { id } = await ctx.params
  const { status, rejection_reason } = await req.json()
  const supabase = createAdminClient()

  const update: Record<string, unknown> = { status }
  if (rejection_reason) update.rejection_reason = rejection_reason

  const { error } = await supabase.from('videos').update(update).eq('id', id)
  if (error) return Response.json({ error: error.message }, { status: 500 })

  // Fetch video to get creator_id for notification
  const { data: video } = await supabase
    .from('videos')
    .select('creator_id, title')
    .eq('id', id)
    .single()

  if (video?.creator_id) {
    const isApproved = status === 'active'
    await supabase.from('notifications').insert({
      user_id: video.creator_id,
      title: isApproved ? 'הסרטון שלך אושר' : 'הסרטון שלך נדחה',
      body: isApproved
        ? `הסרטון "${video.title ?? ''}" אושר ועלה לאוויר.`
        : `הסרטון "${video.title ?? ''}" נדחה.${rejection_reason ? ` סיבה: ${rejection_reason}` : ''}`,
      type: isApproved ? 'video_approved' : 'video_rejected',
      is_read: false,
    })
    // silently ignore notification errors
  }

  return Response.json({ ok: true })
}
