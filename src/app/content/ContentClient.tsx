'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import Pagination from '@/components/ui/Pagination'
import { HiCheck, HiXMark, HiPlayCircle } from 'react-icons/hi2'

const PAGE_SIZE = 20

const STATUS_OPTIONS = [
  { value: 'pending', label: 'ממתינים לאישור' },
  { value: 'active', label: 'פעיל' },
  { value: 'rejected', label: 'נדחה' },
  { value: '', label: 'הכל' },
]

interface VideoScore {
  score: number | null
  total_likes: number | null
  total_saves: number | null
  total_gifts: number | null
}

interface VideoRow {
  id: string
  title: string | null
  category: string | null
  status: string | null
  views: number | null
  created_at: string
  thumbnail_url: string | null
  video_url: string | null
  creator: { id: string; display_name: string | null; username: string | null } | null
  score: VideoScore | null
}

function RejectModal({
  videoId,
  onClose,
  onDone,
}: {
  videoId: string
  onClose: () => void
  onDone: () => void
}) {
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  async function confirm() {
    setLoading(true)
    await fetch(`/api/videos/${videoId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'rejected', rejection_reason: reason }),
    })
    setLoading(false)
    onDone()
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-96">
        <h3 className="font-semibold text-slate-800 mb-1">דחיית סרטון</h3>
        <p className="text-sm text-slate-500 mb-4">ציין סיבה (אופציונלי)</p>
        <textarea
          autoFocus
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="תוכן לא הולם / איכות נמוכה / ..."
          className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100 resize-none mb-4"
        />
        <div className="flex gap-2">
          <button
            onClick={confirm}
            disabled={loading}
            className="flex-1 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'שולח...' : 'דחה סרטון'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors"
          >
            ביטול
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ContentClient({ data }: { data: VideoRow[] }) {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState('pending')
  const [page, setPage] = useState(1)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const filtered = data.filter((v) => !statusFilter || v.status === statusFilter)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function changeFilter(val: string) {
    setStatusFilter(val)
    setPage(1)
  }

  async function approve(id: string) {
    await fetch(`/api/videos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'active' }),
    })
    startTransition(() => router.refresh())
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
          {STATUS_OPTIONS.map((o) => (
            <button
              key={o.value}
              onClick={() => changeFilter(o.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${statusFilter === o.value ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {o.label}
              <span className="mr-1.5 text-xs text-slate-400">
                ({data.filter((v) => !o.value || v.status === o.value).length})
              </span>
            </button>
          ))}
        </div>
        <span className="text-sm text-slate-500 mr-auto">{filtered.length} סרטונים</span>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wide">
              <th className="text-right px-4 py-3 font-medium">תמונה</th>
              <th className="text-right px-4 py-3 font-medium">כותרת</th>
              <th className="text-right px-4 py-3 font-medium">יוצר</th>
              <th className="text-right px-4 py-3 font-medium">קטגוריה</th>
              <th className="text-right px-4 py-3 font-medium">ציון</th>
              <th className="text-right px-4 py-3 font-medium">סטטוס</th>
              <th className="text-right px-4 py-3 font-medium">תאריך</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paged.length === 0 ? (
              <tr><td colSpan={8} className="py-16 text-center text-slate-400 text-sm">אין תוצאות</td></tr>
            ) : paged.map((v) => (
              <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">
                  {v.thumbnail_url ? (
                    <img src={v.thumbnail_url} alt="" className="w-16 h-10 object-cover rounded-lg bg-slate-100" />
                  ) : (
                    <div className="w-16 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                      <HiPlayCircle className="w-5 h-5 text-slate-300" />
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-700 truncate max-w-[160px]">{v.title ?? '—'}</p>
                  <p className="text-xs text-slate-400 font-mono">{v.id.slice(0, 8)}</p>
                </td>
                <td className="px-4 py-3">
                  {v.creator ? (
                    <div className="flex items-center gap-2">
                      <Avatar id={v.creator.id} name={v.creator.display_name} username={v.creator.username} url={null} size="sm" />
                      <span className="text-slate-600 truncate max-w-[90px] text-xs">
                        {v.creator.display_name || v.creator.username || '—'}
                      </span>
                    </div>
                  ) : <span className="text-slate-400">—</span>}
                </td>
                <td className="px-4 py-3 text-slate-500 text-xs">{v.category ?? '—'}</td>
                <td className="px-4 py-3">
                  {v.score ? (
                    <div>
                      <p className="font-semibold text-slate-700 text-xs">{v.score.score ?? '—'}</p>
                      <p className="text-[10px] text-slate-400">❤️{v.score.total_likes ?? 0} ⭐{v.score.total_saves ?? 0} 🎁{v.score.total_gifts ?? 0}</p>
                    </div>
                  ) : <span className="text-slate-400 text-xs">—</span>}
                </td>
                <td className="px-4 py-3"><Badge value={v.status} /></td>
                <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                  {new Date(v.created_at).toLocaleDateString('he-IL')}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    {v.status === 'pending' && (
                      <>
                        <button
                          onClick={() => approve(v.id)}
                          disabled={isPending}
                          title="אשר"
                          className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <HiCheck className="w-3.5 h-3.5" /> אשר
                        </button>
                        <button
                          onClick={() => setRejectingId(v.id)}
                          title="דחה"
                          className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <HiXMark className="w-3.5 h-3.5" /> דחה
                        </button>
                      </>
                    )}
                    {v.video_url && (
                      <a
                        href={v.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        <HiPlayCircle className="w-3.5 h-3.5" /> צפה
                      </a>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onChange={setPage} />
      </div>

      {rejectingId && (
        <RejectModal
          videoId={rejectingId}
          onClose={() => setRejectingId(null)}
          onDone={() => {
            setRejectingId(null)
            startTransition(() => router.refresh())
          }}
        />
      )}
    </div>
  )
}
