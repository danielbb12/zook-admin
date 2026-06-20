import { createAdminClient } from '@/lib/supabase/admin'
import PageHeader from '@/components/ui/PageHeader'
import ScoresClient from './ScoresClient'

export default async function ScoresPage() {
  const supabase = createAdminClient()

  const [
    { data: videoScores },
    { data: creatorScores },
    { data: userScores },
    { data: videos },
    { data: profiles },
  ] = await Promise.all([
    supabase.from('video_scores').select('video_id, score, total_likes, total_saves, total_gifts, updated_at').order('score', { ascending: false }).limit(300),
    supabase.from('creator_scores').select('user_id, score, avg_video_score, follower_growth, engagement_rate, violation_count').order('score', { ascending: false }).limit(300),
    supabase.from('user_scores').select('user_id, score, positive_actions, valid_reports, received_blocks, bad_word_attempts').order('score', { ascending: false }).limit(300),
    supabase.from('videos').select('id, title, creator_id').limit(500),
    supabase.from('profiles').select('id, display_name, username').limit(1000),
  ])

  const videoMap = Object.fromEntries((videos ?? []).map((v) => [v.id, v]))
  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]))

  const videoScoreRows = (videoScores ?? []).map((s) => {
    const video = s.video_id ? (videoMap[s.video_id] ?? null) : null
    const creatorId = video?.creator_id ?? null
    return {
      ...s,
      video_title: video?.title ?? null,
      creator: creatorId ? (profileMap[creatorId] ?? null) : null,
    }
  })

  const creatorScoreRows = (creatorScores ?? []).map((s) => ({
    ...s,
    profile: s.user_id ? (profileMap[s.user_id] ?? null) : null,
  }))

  const userScoreRows = (userScores ?? []).map((s) => ({
    ...s,
    profile: s.user_id ? (profileMap[s.user_id] ?? null) : null,
  }))

  return (
    <div>
      <PageHeader title="דירוגים" subtitle="ניהול ציונים ודירוגים" />
      <ScoresClient
        videoScores={videoScoreRows}
        creatorScores={creatorScoreRows}
        userScores={userScoreRows}
      />
    </div>
  )
}
