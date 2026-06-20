export type Profile = {
  id: string
  username: string | null
  display_name: string | null
  is_creator: boolean | null
  streak_days: number | null
  created_at: string
}

export type Video = {
  id: string
  creator_id: string | null
  title: string | null
  description: string | null
  status: string | null
  risk_score: number | null
  video_score: number | null
  created_at: string
}

export type Report = {
  id: string
  video_id: string | null
  reporter_id: string | null
  assigned_to: string | null
  reason: string | null
  status: string | null
  priority: string | null
  created_at: string
}

export type Gift = {
  id: string
  sender_id: string | null
  receiver_id: string | null
  video_id: string | null
  gift_type: string | null
  points: number | null
  created_at: string
}

export type Category = {
  id: string
  name: string | null
  parent_id: string | null
  slug: string | null
}

export type CreatorProfile = {
  id: string
  user_id: string | null
  followers_count: number | null
  gift_points: number | null
  creator_score: number | null
  status: string | null
}
