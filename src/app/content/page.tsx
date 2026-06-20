import { createAdminClient } from '@/lib/supabase/admin'
import PageHeader from '@/components/ui/PageHeader'
import ContentClient from './ContentClient'

export default async function ContentPage() {
  const supabase = createAdminClient()

  const { data: videos, error } = await supabase
    .from('videos')
    .select('id, title, category, status, views, created_at, creator_id, thumbnail_url, video_url')
    .order('created_at', { ascending: false })
    .limit(300)

  if (error) {
    return (
      <div>
        <PageHeader title="תוכן וסרטונים" />
        <p className="text-red-500 text-sm">שגיאה: {error.message}</p>
      </div>
    )
  }

  const videoIds = (videos ?? []).map((v) => v.id)
  const creatorIds = [...new Set((videos ?? []).map((v) => v.creator_id).filter(Boolean))]

  const [{ data: scores }, { data: profiles }] = await Promise.all([
    videoIds.length > 0
      ? supabase.from('video_scores').select('video_id, score, total_likes, total_saves, total_gifts').in('video_id', videoIds)
      : Promise.resolve({ data: [] }),
    creatorIds.length > 0
      ? supabase.from('profiles').select('id, display_name, username').in('id', creatorIds)
      : Promise.resolve({ data: [] }),
  ])

  const scoreMap = Object.fromEntries((scores ?? []).map((s) => [s.video_id, s]))
  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]))

  const data = (videos ?? []).map((v) => ({
    ...v,
    creator: v.creator_id ? (profileMap[v.creator_id] ?? null) : null,
    score: scoreMap[v.id] ?? null,
  }))

  return (
    <div>
      <PageHeader title="תוכן וסרטונים" subtitle={`${data.length} סרטונים`} />
      <ContentClient data={data} />
    </div>
  )
}
