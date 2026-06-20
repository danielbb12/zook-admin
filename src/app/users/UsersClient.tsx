'use client'

import { useState } from 'react'
import Avatar from '@/components/ui/Avatar'
import { HiMagnifyingGlass, HiEllipsisVertical, HiNoSymbol, HiTrash, HiStar } from 'react-icons/hi2'
import type { Profile } from '@/types'

const CREATOR_OPTIONS = [
  { value: '', label: 'כל המשתמשים' },
  { value: 'true', label: 'יוצרים' },
  { value: 'false', label: 'משתמשים רגילים' },
]

function streakColor(days: number | null) {
  if (days === null) return 'text-slate-400'
  if (days >= 30) return 'text-green-600 font-semibold'
  if (days >= 7) return 'text-amber-500'
  return 'text-slate-500'
}

function RowMenu({ id }: { id: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
      >
        <HiEllipsisVertical className="w-5 h-5" />
      </button>
      {open && (
        <div className="absolute left-0 top-9 bg-white border border-slate-200 rounded-xl shadow-lg z-10 py-1 w-36">
          <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-amber-700 hover:bg-amber-50" onClick={() => setOpen(false)}>
            <HiNoSymbol className="w-4 h-4" /> השעה
          </button>
          <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-700 hover:bg-red-50" onClick={() => setOpen(false)}>
            <HiTrash className="w-4 h-4" /> מחק
          </button>
        </div>
      )}
    </div>
  )
}

export default function UsersClient({ data }: { data: Profile[] }) {
  const [search, setSearch] = useState('')
  const [creatorFilter, setCreatorFilter] = useState('')

  const filtered = data.filter((u) => {
    const matchSearch =
      !search ||
      (u.display_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (u.username ?? '').toLowerCase().includes(search.toLowerCase())
    const matchCreator =
      !creatorFilter ||
      (creatorFilter === 'true' ? u.is_creator === true : u.is_creator !== true)
    return matchSearch && matchCreator
  })

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <HiMagnifyingGlass className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="חיפוש לפי שם או שם משתמש..."
            className="w-full pr-9 pl-4 py-2.5 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
          />
        </div>
        <select
          value={creatorFilter}
          onChange={(e) => setCreatorFilter(e.target.value)}
          className="px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
        >
          {CREATOR_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <span className="text-sm text-slate-500">{filtered.length} משתמשים</span>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">לא נמצאו משתמשים</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wide">
                <th className="text-right px-4 py-3 font-medium">משתמש</th>
                <th className="text-right px-4 py-3 font-medium">שם משתמש</th>
                <th className="text-right px-4 py-3 font-medium">יוצר</th>
                <th className="text-right px-4 py-3 font-medium">רצף ימים</th>
                <th className="text-right px-4 py-3 font-medium">נרשם</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar id={u.id} name={u.display_name} username={u.username} url={null} size="sm" />
                      <span className="font-medium text-slate-700">
                        {u.display_name || u.username || '—'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-xs">@{u.username ?? '—'}</td>
                  <td className="px-4 py-3">
                    {u.is_creator ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                        <HiStar className="w-3 h-3" /> יוצר
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs">—</span>
                    )}
                  </td>
                  <td className={`px-4 py-3 text-sm ${streakColor(u.streak_days)}`}>
                    {u.streak_days !== null ? `${u.streak_days} ימים` : '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                    {new Date(u.created_at).toLocaleDateString('he-IL')}
                  </td>
                  <td className="px-4 py-3">
                    <RowMenu id={u.id} />
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
