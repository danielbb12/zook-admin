'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import { HiCheck, HiXMark } from 'react-icons/hi2'

const TABS = [
  { key: 'pending', label: 'ממתינים' },
  { key: 'flagged', label: 'מסומנים' },
]

interface VideoModerationRow {
  id: string
  title: string | null
  status: string | null
  created_at: string
  creator: { id: string; display_name: string | null; username: string | null } | null
}

function sla(createdAt: string) {
  const ms = Date.now() - new Date(createdAt).getTime()
  const hours = Math.floor(ms / 3600000)
  if (hours < 1) return 'פחות משעה'
  if (hours < 24) return `${hours}ש׳`
  return `${Math.floor(hours / 24)}י׳`
}

function ActionButtons({ videoId }: { videoId: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  async function update(status: string) {
    await fetch(`/api/videos/${videoId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    startTransition(() => { router.refresh() })
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => update('active')}
        disabled={isPending}
        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50"
      >
        <HiCheck className="w-3.5 h-3.5" /> אשר
      </button>
      <button
        onClick={() => update('rejected')}
        disabled={isPending}
        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
      >
        <HiXMark className="w-3.5 h-3.5" /> דחה
      </button>
    </div>
  )
}

export default function ReportsClient({ data }: { data: VideoModerationRow[] }) {
  const [activeTab, setActiveTab] = useState('pending')

  const filtered = data.filter((v) => v.status === activeTab)

  return (
    <div>
      <div className="flex gap-1 mb-4 bg-slate-100 p-1 rounded-xl w-fit">
        {TABS.map((tab) => {
          const count = data.filter((v) => v.status === tab.key).length
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className={`mr-1.5 text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-500'}`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">אין סרטונים בקטגוריה זו</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wide">
                <th className="text-right px-4 py-3 font-medium">כותרת</th>
                <th className="text-right px-4 py-3 font-medium">יוצר</th>
                <th className="text-right px-4 py-3 font-medium">סטטוס</th>
                <th className="text-right px-4 py-3 font-medium">תאריך העלאה</th>
                <th className="text-right px-4 py-3 font-medium">SLA</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-700 truncate max-w-[180px]">
                      {v.title ?? 'ללא כותרת'}
                    </p>
                    <p className="text-xs text-slate-400 font-mono">{v.id.slice(0, 8)}</p>
                  </td>
                  <td className="px-4 py-3">
                    {v.creator ? (
                      <div className="flex items-center gap-2">
                        <Avatar id={v.creator.id} name={v.creator.display_name} username={v.creator.username} url={null} size="sm" />
                        <span className="text-slate-600 truncate max-w-[100px]">
                          {v.creator.display_name || v.creator.username || '—'}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3"><Badge value={v.status} /></td>
                  <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                    {new Date(v.created_at).toLocaleDateString('he-IL')}
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{sla(v.created_at)}</td>
                  <td className="px-4 py-3">
                    <ActionButtons videoId={v.id} />
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
