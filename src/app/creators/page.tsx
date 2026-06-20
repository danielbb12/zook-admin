import { createAdminClient } from '@/lib/supabase/admin'
import PageHeader from '@/components/ui/PageHeader'
import CreatorsClient from './CreatorsClient'

export default async function CreatorsPage() {
  const supabase = createAdminClient()

  const { data: requests, error } = await supabase
    .from('creator_requests')
    .select('id, user_id, video_links, status, rejection_reason, created_at')
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) {
    return (
      <div>
        <PageHeader title="יוצרים" />
        <p className="text-red-500 text-sm">שגיאה: {error.message}</p>
      </div>
    )
  }

  const userIds = [...new Set((requests ?? []).map((r) => r.user_id).filter(Boolean))]
  const { data: profiles } = userIds.length > 0
    ? await supabase.from('profiles').select('id, display_name, username').in('id', userIds)
    : { data: [] }

  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]))

  const data = (requests ?? []).map((r) => ({
    ...r,
    profile: r.user_id ? (profileMap[r.user_id] ?? null) : null,
  }))

  const pendingCount = data.filter((c) => c.status === 'pending').length

  return (
    <div>
      <PageHeader
        title="יוצרים"
        subtitle={`${data.length} בקשות`}
        action={
          pendingCount > 0 ? (
            <button className="px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors">
              בקשות ממתינות ({pendingCount})
            </button>
          ) : undefined
        }
      />
      <CreatorsClient data={data} pendingCount={pendingCount} />
    </div>
  )
}
