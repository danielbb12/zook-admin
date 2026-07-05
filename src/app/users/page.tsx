import { createAdminClient } from '@/lib/supabase/admin'
import PageHeader from '@/components/ui/PageHeader'
import UsersClient from './UsersClient'

export default async function UsersPage() {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, display_name, bio, avatar_id, is_creator, streak_days, zook_coins, last_seen, created_at, notification_prefs, privacy_prefs')
    .order('created_at', { ascending: false })
    .limit(500)

  if (error) {
    return (
      <div>
        <PageHeader title="משתמשים" />
        <p className="text-red-500 text-sm">שגיאה: {error.message}</p>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="משתמשים"
        subtitle={`${data?.length ?? 0} משתמשים רשומים`}
        action={
          <button className="px-4 py-2 bg-[#185FA5] text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
            + הוסף משתמש
          </button>
        }
      />
      <UsersClient data={data ?? []} />
    </div>
  )
}
