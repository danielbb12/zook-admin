'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Avatar from '@/components/ui/Avatar'
import Pagination from '@/components/ui/Pagination'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from 'recharts'

const COLORS = ['#185FA5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']
const PAGE_SIZE = 20

interface GiftRow {
  id: string
  gift_type: string | null
  points: number | null
  created_at: string
  sender: { id: string; display_name: string | null; username: string | null } | null
  receiver: { id: string; display_name: string | null; username: string | null } | null
  video: { id: string; title: string | null } | null
}

interface GiftTypeRow {
  id: string
  emoji: string | null
  name: string | null
  points: number | null
  score_boost: number | null
  daily_cost: number | null
  is_active: boolean | null
}

function buildDailyChart(data: GiftRow[]) {
  const map: Record<string, number> = {}
  for (let i = 29; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i)
    const key = `${d.getDate()}/${d.getMonth() + 1}`
    map[key] = 0
  }
  for (const g of data) {
    const d = new Date(g.created_at)
    const key = `${d.getDate()}/${d.getMonth() + 1}`
    if (key in map) map[key]++
  }
  return Object.entries(map).map(([date, count]) => ({ date, count }))
}

function buildTypeChart(data: GiftRow[]) {
  const map: Record<string, number> = {}
  for (const g of data) {
    const t = g.gift_type ?? 'אחר'
    map[t] = (map[t] ?? 0) + 1
  }
  return Object.entries(map).map(([type, count]) => ({ type, count }))
}

function GiftSettings({ giftTypes }: { giftTypes: GiftTypeRow[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [localTypes, setLocalTypes] = useState<GiftTypeRow[]>(giftTypes)
  const [saving, setSaving] = useState<string | null>(null)

  async function save(gt: GiftTypeRow) {
    setSaving(gt.id)
    await fetch(`/api/gift-types/${gt.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        points: gt.points,
        score_boost: gt.score_boost,
        daily_cost: gt.daily_cost,
        is_active: gt.is_active,
      }),
    })
    setSaving(null)
    startTransition(() => router.refresh())
  }

  function update(id: string, field: keyof GiftTypeRow, value: unknown) {
    setLocalTypes((prev) => prev.map((gt) => gt.id === id ? { ...gt, [field]: value } : gt))
  }

  if (localTypes.length === 0) {
    return <p className="text-slate-400 text-sm">אין סוגי מתנות מוגדרים</p>
  }

  return (
    <div className="space-y-3">
      {localTypes.map((gt) => (
        <div key={gt.id} className="flex items-center gap-4 p-4 border border-slate-200 rounded-xl">
          <span className="text-2xl w-8 text-center flex-shrink-0">{gt.emoji ?? '🎁'}</span>
          <span className="font-medium text-slate-700 w-28 flex-shrink-0">{gt.name ?? '—'}</span>
          <label className="flex items-center gap-2 text-sm text-slate-600 flex-shrink-0">
            <input
              type="checkbox"
              checked={gt.is_active !== false}
              onChange={(e) => update(gt.id, 'is_active', e.target.checked)}
              className="rounded"
            />
            פעיל
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            נקודות:
            <input
              type="number"
              value={gt.points ?? 0}
              onChange={(e) => update(gt.id, 'points', +e.target.value)}
              className="w-20 px-2 py-1 border border-slate-200 rounded-lg text-sm outline-none"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            Score boost:
            <input
              type="number"
              step="0.1"
              value={gt.score_boost ?? 0}
              onChange={(e) => update(gt.id, 'score_boost', +e.target.value)}
              className="w-20 px-2 py-1 border border-slate-200 rounded-lg text-sm outline-none"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            עלות יומית:
            <input
              type="number"
              value={gt.daily_cost ?? 0}
              onChange={(e) => update(gt.id, 'daily_cost', +e.target.value)}
              className="w-20 px-2 py-1 border border-slate-200 rounded-lg text-sm outline-none"
            />
          </label>
          <button
            onClick={() => save(gt)}
            disabled={saving === gt.id || isPending}
            className="mr-auto px-3 py-1.5 bg-[#185FA5] text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving === gt.id ? 'שומר...' : 'שמור'}
          </button>
        </div>
      ))}
    </div>
  )
}

export default function GiftsClient({ data, giftTypes }: { data: GiftRow[]; giftTypes: GiftTypeRow[] }) {
  const [activeTab, setActiveTab] = useState<'log' | 'settings'>('log')
  const [page, setPage] = useState(1)

  const today = new Date(); today.setHours(0, 0, 0, 0)
  const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7)
  const monthAgo = new Date(today); monthAgo.setDate(monthAgo.getDate() - 30)

  const todayCount = data.filter((g) => new Date(g.created_at) >= today).length
  const weekCount = data.filter((g) => new Date(g.created_at) >= weekAgo).length
  const monthCount = data.filter((g) => new Date(g.created_at) >= monthAgo).length
  const topType = buildTypeChart(data).sort((a, b) => b.count - a.count)[0]?.type ?? '—'

  const dailyData = buildDailyChart(data)
  const typeData = buildTypeChart(data)
  const paged = data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div>
      <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-xl w-fit">
        {(['log', 'settings'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {tab === 'log' ? 'יומן מתנות' : 'הגדרות מתנות'}
          </button>
        ))}
      </div>

      {activeTab === 'log' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'היום', value: todayCount },
              { label: 'שבוע', value: weekCount },
              { label: 'חודש', value: monthCount },
              { label: 'מתנה פופולרית', value: topType },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl shadow-sm p-4">
                <p className="text-2xl font-bold text-slate-800">{s.value}</p>
                <p className="text-sm text-slate-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">מתנות יומיות – 30 יום</h3>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={dailyData.filter((_, i) => i % 5 === 0 || i === dailyData.length - 1)} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={30} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', fontSize: 12 }} />
                  <Line type="monotone" dataKey="count" name="מתנות" stroke="#185FA5" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">מתנות לפי סוג</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={typeData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="type" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={30} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', fontSize: 12 }} />
                  <Bar dataKey="count" name="כמות" radius={[4, 4, 0, 0]}>
                    {typeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wide">
                  <th className="text-right px-4 py-3 font-medium">זמן</th>
                  <th className="text-right px-4 py-3 font-medium">שולח</th>
                  <th className="text-right px-4 py-3 font-medium">מקבל</th>
                  <th className="text-right px-4 py-3 font-medium">זוק</th>
                  <th className="text-right px-4 py-3 font-medium">מתנה</th>
                  <th className="text-right px-4 py-3 font-medium">נקודות</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paged.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                      {new Date(g.created_at).toLocaleString('he-IL', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="px-4 py-3">
                      {g.sender ? (
                        <div className="flex items-center gap-2">
                          <Avatar id={g.sender.id} name={g.sender.display_name} username={g.sender.username} url={null} size="sm" />
                          <span className="text-slate-600 text-xs truncate max-w-[80px]">{g.sender.display_name || g.sender.username || '—'}</span>
                        </div>
                      ) : <span className="text-slate-400">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {g.receiver ? (
                        <div className="flex items-center gap-2">
                          <Avatar id={g.receiver.id} name={g.receiver.display_name} username={g.receiver.username} url={null} size="sm" />
                          <span className="text-slate-600 text-xs truncate max-w-[80px]">{g.receiver.display_name || g.receiver.username || '—'}</span>
                        </div>
                      ) : <span className="text-slate-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs truncate max-w-[120px]">{g.video?.title ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">{g.gift_type ?? '—'}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-semibold text-xs">{g.points ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination page={page} pageSize={PAGE_SIZE} total={data.length} onChange={setPage} />
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-base font-semibold text-slate-700 mb-4">הגדרות סוגי מתנות</h3>
          <GiftSettings giftTypes={giftTypes} />
        </div>
      )}
    </div>
  )
}
