import { createAdminClient } from '@/lib/supabase/admin'

export async function PATCH(req: Request) {
  const { daily_coins, coins_cap } = await req.json()
  if (typeof daily_coins !== 'number' || typeof coins_cap !== 'number') {
    return Response.json({ error: 'ערכים לא תקינים' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { error } = await supabase.from('system_settings').upsert(
    [
      { key: 'daily_coins', value: daily_coins },
      { key: 'coins_cap', value: coins_cap },
    ],
    { onConflict: 'key' }
  )

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}
