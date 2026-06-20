'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import { HiCheckCircle, HiNoSymbol } from 'react-icons/hi2'

const TABS = [
  { key: 'all', label: 'כל הבקשות' },
  { key: 'pending', label: 'ממתינות' },
  { key: 'approved', label: 'אושרו' },
  { key: 'rejected', label: 'נדחו' },
]

interface CreatorRequestRow {
  id: string
  user_id: string | null
  video_links: string[] | null
  status: string | null
  rejection_reason: string | null
  created_at: string
  profile: {
    id: string
    display_name: string | null
    username: string | null
  } | null
}

function ActionButtons({ id, status }: { id: string; status: string | null }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  if (status !== 'pending') return null

  async function update(newStatus: string) {
    await fetch(`/api/creator-requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    startTransition(() => { router.refresh() })
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => update('approved')}
        disabled={isPending}
        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50"
      >
        <HiCheckCircle className="w-3.5 h-3.5" /> אשר
      </button>
      <button
        onClick={() => update('rejected')}
        disabled={isPending}
        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
      >
        <HiNoSymbol className="w-3.5 h-3.5" /> דחה
      </button>
    </div>
  )
}

export default function CreatorsClient({ data, pendingCount }: { data: CreatorRequestRow[]; pendingCount: number }) {
  const [activeTab, setActiveTab] = useState('all')

  const filtered = activeTab === 'all' ? data : data.filter((c) => c.status === activeTab)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
              {tab.key === 'pending' && pendingCount > 0 && (
                <span className="mr-1.5 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>
        <span className="text-sm text-slate-500">{filtered.length} בקשות</span>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">אין בקשות בקטגוריה זו</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wide">
                <th className="text-right px-4 py-3 font-medium">שם</th>
                <th className="text-right px-4 py-3 font-medium">שם משתמש</th>
                <th className="text-right px-4 py-3 font-medium">סטטוס</th>
                <th className="text-right px-4 py-3 font-medium">קישורי וידאו</th>
                <th className="text-right px-4 py-3 font-medium">תאריך בקשה</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar
                        id={c.profile?.id ?? c.id}
                        name={c.profile?.display_name ?? null}
                        username={c.profile?.username ?? null}
                        url={null}
                        size="sm"
                      />
                      <span className="font-medium text-slate-700">
                        {c.profile?.display_name || c.profile?.username || '—'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-xs">
                    @{c.profile?.username ?? '—'}
                  </td>
                  <td className="px-4 py-3"><Badge value={c.status} /></td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {c.video_links?.length ?? 0} קישורים
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                    {new Date(c.created_at).toLocaleDateString('he-IL')}
                  </td>
                  <td className="px-4 py-3">
                    <ActionButtons id={c.id} status={c.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
