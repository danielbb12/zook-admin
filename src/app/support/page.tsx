import { createAdminClient } from '@/lib/supabase/admin'
import PageHeader from '@/components/ui/PageHeader'
import SupportClient from './SupportClient'

export default async function SupportPage() {
  const supabase = createAdminClient()

  const [
    { data: tickets, error },
    { data: profileRows },
  ] = await Promise.all([
    supabase
      .from('support_tickets')
      .select('id, type, subject, message, status, device_info, app_version, admin_notes, created_at, user_id')
      .order('created_at', { ascending: false })
      .limit(500),
    supabase.from('profiles').select('id, display_name, username').limit(5000),
  ])

  if (error) console.error('[support] fetch error:', error.message)

  const profileMap = Object.fromEntries((profileRows ?? []).map((p) => [p.id, p]))

  const rows = (tickets ?? []).map((t) => ({
    ...t,
    profile: t.user_id
      ? (profileMap[t.user_id] as { id: string; display_name: string | null; username: string | null } | undefined) ?? null
      : null,
  }))

  const openCount = rows.filter((r) => r.status === 'open').length

  return (
    <div>
      <PageHeader
        title="תמיכה ופניות"
        subtitle={`${openCount} פתוחות מתוך ${rows.length} פניות`}
      />
      <SupportClient rows={rows} />
    </div>
  )
}
