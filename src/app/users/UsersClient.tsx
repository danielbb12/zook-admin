'use client'

import { useState } from 'react'
import Avatar from '@/components/ui/Avatar'
import { HiMagnifyingGlass, HiEllipsisVertical, HiNoSymbol, HiTrash, HiStar, HiXMark, HiIdentification } from 'react-icons/hi2'
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

function formatLastSeen(dateStr: string | null): string {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  const diffMs = Date.now() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  if (diffMins < 2) return 'עכשיו'
  if (diffMins < 60) return `לפני ${diffMins} דק׳`
  if (diffHours < 24) return `לפני ${diffHours} שע׳`
  if (diffDays < 7) return `לפני ${diffDays} ימים`
  return date.toLocaleDateString('he-IL')
}

function PrefsSection({ label, prefs }: { label: string; prefs: Record<string, unknown> | null }) {
  if (!prefs || Object.keys(prefs).length === 0) {
    return (
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{label}</p>
        <p className="text-xs text-slate-400">לא הוגדר</p>
      </div>
    )
  }
  return (
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{label}</p>
      <div className="bg-slate-50 rounded-lg p-3 space-y-1.5">
        {Object.entries(prefs).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between text-xs">
            <span className="text-slate-600">{key}</span>
            {typeof value === 'boolean' ? (
              <span className={value ? 'text-green-600 font-medium' : 'text-slate-400'}>
                {value ? '✓ פעיל' : '—'}
              </span>
            ) : (
              <span className="text-slate-700 font-medium">{String(value)}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function UserDetailModal({ user, onClose }: { user: Profile; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <Avatar id={user.id} name={user.display_name} username={user.username} url={null} size="lg" />
            <div>
              <h2 className="text-base font-semibold text-slate-800">
                {user.display_name || user.username || '—'}
              </h2>
              <p className="text-sm text-slate-400">@{user.username ?? '—'}</p>
              {user.is_creator && (
                <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                  <HiStar className="w-3 h-3" /> יוצר
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
          >
            <HiXMark className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Bio */}
          {user.bio && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">ביו</p>
              <p className="text-sm text-slate-700 leading-relaxed">{user.bio}</p>
            </div>
          )}

          {/* Avatar ID */}
          {user.avatar_id && (
            <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 rounded-lg px-3 py-2">
              <HiIdentification className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="text-slate-500">אווטאר:</span>
              <span className="font-mono font-medium">{user.avatar_id}</span>
            </div>
          )}

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-slate-50 rounded-lg p-3 text-center">
              <p className={`text-lg font-bold ${streakColor(user.streak_days)}`}>
                {user.streak_days ?? '—'}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">ימי רצף</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-amber-700">
                {user.zook_coins?.toLocaleString() ?? '—'}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">זוקים</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-slate-700">
                {user.last_seen ? formatLastSeen(user.last_seen) : '—'}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">נראה לאחרונה</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-slate-700">
                {new Date(user.created_at).toLocaleDateString('he-IL')}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">הצטרף</p>
            </div>
          </div>

          {/* Prefs */}
          <PrefsSection label="העדפות התראות" prefs={user.notification_prefs} />
          <PrefsSection label="הגדרות פרטיות" prefs={user.privacy_prefs} />
        </div>
      </div>
    </div>
  )
}

function RowMenu({ id }: { id: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open) }}
        className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
      >
        <HiEllipsisVertical className="w-5 h-5" />
      </button>
      {open && (
        <div className="absolute left-0 top-9 bg-white border border-slate-200 rounded-xl shadow-lg z-10 py-1 w-36">
          <button
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-amber-700 hover:bg-amber-50"
            onClick={() => setOpen(false)}
          >
            <HiNoSymbol className="w-4 h-4" /> השעה
          </button>
          <button
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-700 hover:bg-red-50"
            onClick={() => setOpen(false)}
          >
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
  const [selected, setSelected] = useState<Profile | null>(null)

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
                <th className="text-right px-4 py-3 font-medium">זוקים</th>
                <th className="text-right px-4 py-3 font-medium">פעיל לאחרונה</th>
                <th className="text-right px-4 py-3 font-medium">נרשם</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((u) => (
                <tr
                  key={u.id}
                  onClick={() => setSelected(u)}
                  className="hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative flex-shrink-0">
                        <Avatar id={u.id} name={u.display_name} username={u.username} url={null} size="sm" />
                        {u.avatar_id && (
                          <span
                            title={`אווטאר: ${u.avatar_id}`}
                            className="absolute -bottom-0.5 -left-0.5 w-3 h-3 bg-[#185FA5] rounded-full border border-white"
                          />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-700 truncate">
                          {u.display_name || u.username || '—'}
                        </p>
                        {u.bio && (
                          <p className="text-xs text-slate-400 truncate max-w-[180px]">{u.bio}</p>
                        )}
                      </div>
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
                  <td className="px-4 py-3 text-xs">
                    {u.zook_coins != null ? (
                      <span className="font-semibold text-amber-700">{u.zook_coins.toLocaleString()}</span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                    {formatLastSeen(u.last_seen)}
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                    {new Date(u.created_at).toLocaleDateString('he-IL')}
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <RowMenu id={u.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selected && (
        <UserDetailModal user={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
