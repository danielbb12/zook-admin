import { createAdminClient } from '@/lib/supabase/admin'
import PageHeader from '@/components/ui/PageHeader'
import GiftsClient from './GiftsClient'

export default async function GiftsPage() {
  const supabase = createAdminClient()

  const { data: gifts, error } = await supabase
    .from('gifts')
    .select('id, gift_type, points, created_at, sender_id, video_id')
    .order('created_at', { ascending: false })
    .limit(500)

  if (error) {
    return (
      <div>
        <PageHeader title="מתנות" />
        <p className="text-red-500 text-sm">שגיאה: {error.message}</p>
      </div>
    )
  }

  const videoIds = [...new Set((gifts ?? []).map((g) => g.video_id).filter(Boolean))]
  const { data: videos } = videoIds.length > 0
    ? await supabase.from('videos').select('id, title, creator_id').in('id', videoIds)
    : { data: [] }

  const videoMap = Object.fromEntries((videos ?? []).map((v) => [v.id, v]))

  const profileIds = [...new Set([
    ...(gifts ?? []).map((g) => g.sender_id).filter(Boolean),
    ...(videos ?? []).map((v) => v.creator_id).filter(Boolean),
  ])]
  const { data: profiles } = profileIds.length > 0
    ? await supabase.from('profiles').select('id, display_name, username').in('id', profileIds)
    : { data: [] }

  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]))

  const data = (gifts ?? []).map((g) => {
    const video = g.video_id ? (videoMap[g.video_id] ?? null) : null
    const receiverId = video?.creator_id ?? null
    return {
      id: g.id,
      gift_type: g.gift_type,
      points: g.points,
      created_at: g.created_at,
      sender: g.sender_id ? (profileMap[g.sender_id] ?? null) : null,
      receiver: receiverId ? (profileMap[receiverId] ?? null) : null,
      video: video ? { id: video.id, title: video.title } : null,
    }
  })

  // Fetch gift_types for settings tab
  const { data: giftTypes } = await supabase
    .from('gift_types')
    .select('id, emoji, name, points, score_boost, daily_cost, is_active')
    .order('name')

  return (
    <div>
      <PageHeader title="מתנות" subtitle={`${data.length} מתנות`} />
      <GiftsClient data={data} giftTypes={giftTypes ?? []} />
    </div>
  )
}
