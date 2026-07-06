import { createAdminClient } from '@/lib/supabase/admin'
import PageHeader from '@/components/ui/PageHeader'
import ReportsClient from './ReportsClient'

export default async function ReportsPage() {
  const supabase = createAdminClient()

  const { data: videos, error } = await supabase
    .from('videos')
    .select('id, title, status, created_at, creator_id')
    .in('status', ['pending', 'pending_review', 'flagged'])
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) {
    return (
      <div>
        <PageHeader title="תור בדיקת תוכן" />
        <p className="text-red-500 text-sm">שגיאה בטעינת הנתונים: {error.message}</p>
      </div>
    )
  }

  const creatorIds = [...new Set((videos ?? []).map((v) => v.creator_id).filter(Boolean))]
  const { data: profiles } = creatorIds.length > 0
    ? await supabase.from('profiles').select('id, display_name, username').in('id', creatorIds)
    : { data: [] }

  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]))

  const data = (videos ?? []).map((v) => ({
    ...v,
    creator: v.creator_id ? (profileMap[v.creator_id] ?? null) : null,
  }))

  return (
    <div>
      <PageHeader
        title="תור בדיקת תוכן"
        subtitle={`${data.length} סרטונים ממתינים לבדיקה`}
      />
      <ReportsClient data={data} />
    </div>
  )
}
