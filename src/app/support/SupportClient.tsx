'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Pagination from '@/components/ui/Pagination'
import { HiXMark, HiDevicePhoneMobile, HiCheckCircle } from 'react-icons/hi2'

const PAGE_SIZE = 20

interface TicketRow {
  id: string
  type: string | null
  subject: string | null
  message: string | null
  status: string | null
  device_info: string | null
  app_version: string | null
  admin_notes: string | null
  created_at: string
  user_id: string | null
  profile: { id: string; display_name: string | null; username: string | null } | null
}

const STATUS_TABS = [
  { key: 'all', label: 'הכל' },
  { key: 'open', label: 'פתוח' },
  { key: 'in_progress', label: 'בטיפול' },
  { key: 'resolved', label: 'נפתר' },
  { key: 'closed', label: 'סגור' },
]

const TYPE_FILTERS = [
  { key: 'all', label: 'כל הסוגים' },
  { key: 'bug', label: 'באג' },
  { key: 'support', label: 'תמיכה' },
  { key: 'improvement', label: 'הצעת שיפור' },
]

const TYPE_LABEL: Record<string, string> = {
  bug: 'באג',
  support: 'תמיכה',
  improvement: 'הצעת שיפור',
}

const TYPE_COLOR: Record<string, string> = {
  bug: 'bg-red-100 text-red-700',
  support: 'bg-blue-100 text-blue-700',
  improvement: 'bg-purple-100 text-purple-700',
}

const STATUS_LABEL: Record<string, string> = {
  open: 'פתוח',
  in_progress: 'בטיפול',
  resolved: 'נפתר',
  closed: 'סגור',
}

const STATUS_COLOR: Record<string, string> = {
  open: 'bg-red-100 text-red-700',
  in_progress: 'bg-amber-100 text-amber-700',
  resolved: 'bg-green-100 text-green-700',
  closed: 'bg-slate-100 text-slate-500',
}

function TypeTag({ type }: { type: string | null }) {
  if (!type) return <span className="text-slate-400 text-xs">—</span>
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLOR[type] ?? 'bg-slate-100 text-slate-600'}`}>
      {TYPE_LABEL[type] ?? type}
    </span>
  )
}

function StatusBadge({ status }: { status: string | null }) {
  if (!status) return <span className="text-slate-400 text-xs">—</span>
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[status] ?? 'bg-slate-100 text-slate-600'}`}>
      {STATUS_LABEL[status] ?? status}
    </span>
  )
}

function TicketModal({
  ticket,
  onClose,
  onSaved,
}: {
  ticket: TicketRow
  onClose: () => void
  onSaved: () => void
}) {
  const [status, setStatus] = useState(ticket.status ?? 'open')
  const [notes, setNotes] = useState(ticket.admin_notes ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function save() {
    setSaving(true)
    await fetch(`/api/support/${ticket.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, admin_notes: notes }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    onSaved()
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-2 flex-wrap">
            <TypeTag type={ticket.type} />
            <StatusBadge status={ticket.status} />
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
          >
            <HiXMark className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Subject & user */}
          <div>
            <h2 className="text-base font-semibold text-slate-800 mb-1">{ticket.subject ?? '—'}</h2>
            <p className="text-xs text-slate-400">
              {ticket.profile?.display_name || ticket.profile?.username || 'משתמש לא ידוע'}
              {ticket.profile?.username && ` (@${ticket.profile.username})`}
              {' · '}
              {new Date(ticket.created_at).toLocaleString('he-IL', { dateStyle: 'short', timeStyle: 'short' })}
            </p>
          </div>

          {/* Message */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">הודעה</p>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50 rounded-lg p-3">
              {ticket.message ?? '—'}
            </p>
          </div>

          {/* Device info & version */}
          {(ticket.device_info || ticket.app_version) && (
            <div className="flex items-start gap-2 text-xs text-slate-500 bg-slate-50 rounded-lg p-3">
              <HiDevicePhoneMobile className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                {ticket.app_version && <p>גרסה: <span className="font-medium text-slate-700">{ticket.app_version}</span></p>}
                {ticket.device_info && <p>מכשיר: <span className="font-medium text-slate-700">{ticket.device_info}</span></p>}
              </div>
            </div>
          )}

          {/* Status */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">סטטוס</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100 bg-white"
            >
              <option value="open">פתוח</option>
              <option value="in_progress">בטיפול</option>
              <option value="resolved">נפתר</option>
              <option value="closed">סגור</option>
            </select>
          </div>

          {/* Admin notes */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
              הערות אדמין
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="הוסף הערה פנימית..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={save}
              disabled={saving}
              className="flex items-center gap-1.5 flex-1 justify-center py-2 bg-[#185FA5] text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saved ? (
                <><HiCheckCircle className="w-4 h-4" /> נשמר</>
              ) : saving ? 'שומר...' : 'שמור שינויים'}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors"
            >
              סגור
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SupportClient({ rows }: { rows: TicketRow[] }) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<TicketRow | null>(null)

  const filtered = rows.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false
    if (typeFilter !== 'all' && r.type !== typeFilter) return false
    return true
  })

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function applyStatusFilter(key: string) {
    setStatusFilter(key)
    setPage(1)
  }

  function applyTypeFilter(key: string) {
    setTypeFilter(key)
    setPage(1)
  }

  // Count per status tab
  const counts: Record<string, number> = { all: rows.length }
  for (const r of rows) {
    if (r.status) counts[r.status] = (counts[r.status] ?? 0) + 1
  }

  return (
    <div>
      {/* Status tabs */}
      <div className="flex gap-1 mb-4 bg-slate-100 p-1 rounded-xl w-fit">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => applyStatusFilter(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
              statusFilter === tab.key
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
            {counts[tab.key] != null && (
              <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full leading-none ${
                statusFilter === tab.key ? 'bg-slate-100 text-slate-600' : 'bg-slate-200 text-slate-500'
              }`}>
                {counts[tab.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Type filter */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs text-slate-500 font-medium">סוג:</span>
        {TYPE_FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => applyTypeFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              typeFilter === f.key
                ? 'bg-[#185FA5] text-white'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wide">
              <th className="text-right px-4 py-3 font-medium">סוג</th>
              <th className="text-right px-4 py-3 font-medium">נושא</th>
              <th className="text-right px-4 py-3 font-medium">משתמש</th>
              <th className="text-right px-4 py-3 font-medium">תאריך</th>
              <th className="text-right px-4 py-3 font-medium">סטטוס</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paged.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400 text-sm">
                  אין פניות
                </td>
              </tr>
            ) : paged.map((row) => (
              <tr
                key={row.id}
                onClick={() => setSelected(row)}
                className="hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <td className="px-4 py-3">
                  <TypeTag type={row.type} />
                </td>
                <td className="px-4 py-3 font-medium text-slate-700 max-w-[240px] truncate">
                  {row.subject ?? '—'}
                  {row.admin_notes && (
                    <span className="mr-2 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">
                      הערה
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-500 text-xs">
                  {row.profile?.display_name || row.profile?.username || '—'}
                </td>
                <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                  {new Date(row.created_at).toLocaleDateString('he-IL')}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={row.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onChange={setPage} />
      </div>

      {selected && (
        <TicketModal
          ticket={selected}
          onClose={() => setSelected(null)}
          onSaved={() => {
            setSelected(null)
            startTransition(() => router.refresh())
          }}
        />
      )}
    </div>
  )
}
