import { createAdminClient } from '@/lib/supabase/admin'
import PageHeader from '@/components/ui/PageHeader'
import SettingsClient from './SettingsClient'

export default async function SettingsPage() {
  const supabase = createAdminClient()

  const { data: rows } = await supabase
    .from('system_settings')
    .select('key, value')
    .in('key', ['daily_coins', 'coins_cap'])

  const map = Object.fromEntries((rows ?? []).map((r) => [r.key, r.value]))

  const initialCoins = {
    dailyCoins: Number(map['daily_coins'] ?? 25),
    coinsCap: Number(map['coins_cap'] ?? 500),
  }

  return (
    <div>
      <PageHeader title="הגדרות" subtitle="ניהול הגדרות המערכת" />
      <SettingsClient initialCoins={initialCoins} />
    </div>
  )
}
