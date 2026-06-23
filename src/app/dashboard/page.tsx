import { createAdminClient } from '@/lib/supabase/admin'
import StatCard from '@/components/ui/StatCard'
import PageHeader from '@/components/ui/PageHeader'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import UserGrowthChart from './UserGrowthChart'
import GiftsPieChart from './GiftsPieChart'
import { HiUsers, HiVideoCamera, HiExclamationCircle, HiArrowTrendingUp, HiLifebuoy } from 'react-icons/hi2'

function startOfDay(d: Date) {
  const r = new Date(d)
  r.setHours(0, 0, 0, 0)
  return r
}

function formatDate(d: Date) {
  return `${d.getDate()}/${d.getMonth() + 1}`
}

export default async function DashboardPage() {
  const supabase = createAdminClient()

  const today = startOfDay(new Date())
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const [
    { count: dauCount },
    { count: mauCount },
    { count: videosToday },
    { count: pendingCount },
    { count: openSupportCount },
    { data: recentProfiles },
    { data: recentVideos },
    { data: allGifts },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('last_active', today.toISOString()),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('last_active', thirtyDaysAgo.toISOString()),
    supabase.from('videos').select('*', { count: 'exact', head: true }).gte('created_at', today.toISOString()),
    supabase.from('videos').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('support_tickets').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('profiles').select('created_at').gte('created_at', sevenDaysAgo.toISOString()).order('created_at'),
    supabase.from('videos').select('id, title, status, created_at, creator_id').eq('status', 'pending').order('created_at', { ascending: false }).limit(5),
    supabase.from('gifts').select('gift_type'),
  ])

  // Build growth chart (last 7 days)
  const growthMap: Record<string, number> = {}
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    growthMap[formatDate(d)] = 0
  }
  for (const p of recentProfiles ?? []) {
    const key = formatDate(new Date(p.created_at))
    if (key in growthMap) growthMap[key]++
  }
  const growthData = Object.entries(growthMap).map(([date, users]) => ({ date, users }))

  // Fetch creator profiles for recent pending videos
  const creatorIds = [...new Set((recentVideos ?? []).map((v: any) => v.creator_id).filter(Boolean))]
  const { data: creators } = creatorIds.length > 0
    ? await supabase.from('profiles').select('id, display_name, username').in('id', creatorIds)
    : { data: [] }
  const creatorMap = Object.fromEntries((creators ?? []).map((p: any) => [p.id, p]))

  // Build gifts pie
  const giftCounts: Record<string, number> = {}
  for (const g of allGifts ?? []) {
    const t = g.gift_type ?? 'אחר'
    giftCounts[t] = (giftCounts[t] ?? 0) + 1
  }
  const giftsData = Object.entries(giftCounts).map(([name, value]) => ({ name, value }))

  type ActivityItem = {
    id: string; text: string; status: string | null; created_at: string
    actor: { id: string; display_name: string | null; username: string | null } | null
  }
  const feed: ActivityItem[] = (recentVideos ?? []).map((v: any) => ({
    id: v.id, text: v.title ?? 'סרטון', status: v.status, created_at: v.created_at,
    actor: v.creator_id ? (creatorMap[v.creator_id] ?? null) : null,
  }))

  return (
    <div>
      <PageHeader title="דשבורד" subtitle="סקירה כללית של פעילות הפלטפורמה" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard icon={<HiUsers className="w-5 h-5" />} label="DAU – פעילים היום" value={dauCount ?? 0} sparkline={growthData.map((d) => d.users)} />
        <StatCard icon={<HiArrowTrendingUp className="w-5 h-5" />} label="MAU – פעילים 30 יום" value={mauCount ?? 0} />
        <StatCard icon={<HiVideoCamera className="w-5 h-5" />} label="זוקים היום" value={videosToday ?? 0} />
        <StatCard icon={<HiExclamationCircle className="w-5 h-5" />} label="ממתינים לאישור" value={pendingCount ?? 0} color="text-red-500" />
        <StatCard icon={<HiLifebuoy className="w-5 h-5" />} label="פניות פתוחות" value={openSupportCount ?? 0} color="text-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-base font-semibold text-slate-700 mb-4">גדילת משתמשים – 7 ימים אחרונים</h2>
          <UserGrowthChart data={growthData} />
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-base font-semibold text-slate-700 mb-4">מתנות לפי סוג</h2>
          <GiftsPieChart data={giftsData} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-5">
        <h2 className="text-base font-semibold text-slate-700 mb-4">סרטונים ממתינים לאישור</h2>
        {feed.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-8">אין סרטונים ממתינים</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {feed.map((item) => (
              <div key={item.id} className="flex items-center gap-4 py-3">
                {item.actor ? (
                  <Avatar id={item.actor.id} name={item.actor.display_name} username={item.actor.username} url={null} size="sm" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-slate-200 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 truncate">
                    <span className="font-medium">{item.actor?.display_name || item.actor?.username || 'משתמש'}</span>{' '}
                    העלה: {item.text}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {new Date(item.created_at).toLocaleString('he-IL', { dateStyle: 'short', timeStyle: 'short' })}
                  </p>
                </div>
                <Badge value={item.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
