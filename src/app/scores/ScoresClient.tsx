'use client'

import { Fragment, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Pagination from '@/components/ui/Pagination'
import { HiMagnifyingGlass, HiExclamationTriangle, HiNoSymbol, HiArrowPath } from 'react-icons/hi2'

const PAGE_SIZE = 20

interface VideoScoreRow {
  video_id: string | null
  score: number | null
  total_likes: number | null
  total_saves: number | null
  total_gifts: number | null
  updated_at: string | null
  video_title: string | null
  creator: { id: string; display_name: string | null; username: string | null } | null
}

interface CreatorScoreRow {
  user_id: string | null
  score: number | null
  avg_video_score: number | null
  follower_growth: number | null
  engagement_rate: number | null
  violation_count: number | null
  profile: { id: string; display_name: string | null; username: string | null } | null
}

interface UserScoreRow {
  user_id: string | null
  score: number | null
  positive_actions: number | null
  valid_reports: number | null
  received_blocks: number | null
  bad_word_attempts: number | null
  profile: { id: string; display_name: string | null; username: string | null } | null
}

function ScorePill({ value }: { value: number | null }) {
  if (value === null) return <span className="text-slate-400 text-xs">—</span>
  const color =
    value >= 70 ? 'bg-green-100 text-green-800' :
    value >= 40 ? 'bg-amber-100 text-amber-800' :
    'bg-red-100 text-red-800'
  return <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${color}`}>{value}</span>
}

function PenalizeModal({
  userId,
  onClose,
  onDone,
}: {
  userId: string
  onClose: () => void
  onDone: () => void
}) {
  const [penalty, setPenalty] = useState(10)
  const [loading, setLoading] = useState(false)

  async function confirm() {
    setLoading(true)
    await fetch('/api/scores/penalize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creator_id: userId, penalty }),
    })
    setLoading(false)
    onDone()
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-80">
        <h3 className="font-semibold text-slate-800 mb-1">עונש ליוצר</h3>
        <p className="text-sm text-slate-500 mb-4">הזן כמה נקודות להפחית מהציון</p>
        <input
          autoFocus
          type="number"
          min={1}
          max={100}
          value={penalty}
          onChange={(e) => setPenalty(+e.target.value)}
          className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100 mb-4"
        />
        <div className="flex gap-2">
          <button
            onClick={confirm}
            disabled={loading}
            className="flex-1 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'שולח...' : 'הענש'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200"
          >
            ביטול
          </button>
        </div>
      </div>
    </div>
  )
}

function VideoScoresTab({ rows }: { rows: VideoScoreRow[] }) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const filtered = rows.filter((r) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      (r.video_title?.toLowerCase().includes(q) ?? false) ||
      (r.creator?.display_name?.toLowerCase().includes(q) ?? false) ||
      (r.creator?.username?.toLowerCase().includes(q) ?? false)
    )
  })
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <HiMagnifyingGlass className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="חפש לפי שם / יוצר..."
            className="w-full pr-9 pl-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <span className="text-sm text-slate-500">{filtered.length} סרטונים</span>
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wide">
              <th className="text-right px-4 py-3 font-medium">#</th>
              <th className="text-right px-4 py-3 font-medium">שם סרטון</th>
              <th className="text-right px-4 py-3 font-medium">יוצר</th>
              <th className="text-right px-4 py-3 font-medium">ציון</th>
              <th className="text-right px-4 py-3 font-medium">לייקים</th>
              <th className="text-right px-4 py-3 font-medium">שמירות</th>
              <th className="text-right px-4 py-3 font-medium">מתנות</th>
              <th className="text-right px-4 py-3 font-medium">עדכון</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paged.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400 text-sm">
                  אין תוצאות
                </td>
              </tr>
            ) : paged.map((r, i) => (
              <tr key={r.video_id ?? i} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 text-slate-400 text-xs">{(page - 1) * PAGE_SIZE + i + 1}</td>
                <td className="px-4 py-3 font-medium text-slate-700 truncate max-w-[180px]">{r.video_title ?? '—'}</td>
                <td className="px-4 py-3 text-slate-500 text-xs">
                  {r.creator?.display_name || r.creator?.username || '—'}
                </td>
                <td className="px-4 py-3"><ScorePill value={r.score} /></td>
                <td className="px-4 py-3 text-slate-600 text-xs">{r.total_likes ?? '—'}</td>
                <td className="px-4 py-3 text-slate-600 text-xs">{r.total_saves ?? '—'}</td>
                <td className="px-4 py-3 text-slate-600 text-xs">{r.total_gifts ?? '—'}</td>
                <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                  {r.updated_at ? new Date(r.updated_at).toLocaleDateString('he-IL') : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onChange={setPage} />
      </div>
    </div>
  )
}

function CreatorScoresTab({
  rows,
  userScoreMap,
}: {
  rows: CreatorScoreRow[]
  userScoreMap: Record<string, UserScoreRow>
}) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [penalizingId, setPenalizingId] = useState<string | null>(null)
  const [recalculating, setRecalculating] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(1)
  const paged = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  async function recalculate(creatorId: string) {
    setRecalculating((prev) => new Set(prev).add(creatorId))
    await fetch('/api/scores/recalculate-creator', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creator_id: creatorId }),
    })
    setRecalculating((prev) => {
      const next = new Set(prev)
      next.delete(creatorId)
      return next
    })
    startTransition(() => router.refresh())
  }

  return (
    <div>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wide">
              <th className="text-right px-4 py-3 font-medium">#</th>
              <th className="text-right px-4 py-3 font-medium">יוצר</th>
              <th className="text-right px-4 py-3 font-medium">ציון</th>
              <th className="text-right px-4 py-3 font-medium">ממוצע סרטון</th>
              <th className="text-right px-4 py-3 font-medium">צמיחת עוקבים</th>
              <th className="text-right px-4 py-3 font-medium">Engagement</th>
              <th className="text-right px-4 py-3 font-medium">הפרות</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400 text-sm">
                  אין נתונים עדיין
                </td>
              </tr>
            ) : paged.map((r, i) => {
              const viewerScore = r.user_id ? (userScoreMap[r.user_id] ?? null) : null
              const isRecalc = r.user_id ? recalculating.has(r.user_id) : false
              return (
                <Fragment key={r.user_id ?? i}>
                  {/* Creator row */}
                  <tr className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-slate-400 text-xs">{(page - 1) * PAGE_SIZE + i + 1}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-700 text-sm">
                        {r.profile?.display_name || r.profile?.username || '—'}
                      </p>
                      {r.profile?.username && (
                        <p className="text-xs text-slate-400">@{r.profile.username}</p>
                      )}
                    </td>
                    <td className="px-4 py-3"><ScorePill value={r.score} /></td>
                    <td className="px-4 py-3 text-slate-600 text-xs">{r.avg_video_score ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-600 text-xs">
                      {r.follower_growth != null
                        ? `${r.follower_growth > 0 ? '+' : ''}${r.follower_growth}`
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs">
                      {r.engagement_rate != null
                        ? `${(r.engagement_rate * 100).toFixed(1)}%`
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {(r.violation_count ?? 0) > 0 ? (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                          {r.violation_count}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">0</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {r.user_id && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setPenalizingId(r.user_id!)}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                          >
                            <HiExclamationTriangle className="w-3.5 h-3.5" /> הענש
                          </button>
                          <button
                            onClick={() => recalculate(r.user_id!)}
                            disabled={isRecalc}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <HiArrowPath className={`w-3.5 h-3.5 ${isRecalc ? 'animate-spin' : ''}`} />
                            {isRecalc ? '...' : 'חשב מחדש'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>

                  {/* Viewer sub-row — only when the creator also has a user_score */}
                  {viewerScore && (
                    <tr className="bg-sky-50/50 border-t border-sky-100">
                      <td className="px-4 py-2" />
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-semibold text-sky-700 bg-sky-100 px-1.5 py-0.5 rounded">
                            כצופה
                          </span>
                          <span className="text-xs text-slate-500">
                            {r.profile?.display_name || r.profile?.username || '—'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2"><ScorePill value={viewerScore.score} /></td>
                      <td className="px-4 py-2 text-slate-500 text-xs">
                        חיובי: {viewerScore.positive_actions ?? '—'}
                      </td>
                      <td className="px-4 py-2 text-slate-500 text-xs">
                        דיווחים: {viewerScore.valid_reports ?? '—'}
                      </td>
                      <td className="px-4 py-2 text-slate-500 text-xs">
                        חסימות: {viewerScore.received_blocks ?? '—'}
                      </td>
                      <td className="px-4 py-2 text-slate-500 text-xs">
                        מילים: {viewerScore.bad_word_attempts ?? '—'}
                      </td>
                      <td />
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
        <Pagination page={page} pageSize={PAGE_SIZE} total={rows.length} onChange={setPage} />
      </div>

      {penalizingId && (
        <PenalizeModal
          userId={penalizingId}
          onClose={() => setPenalizingId(null)}
          onDone={() => {
            setPenalizingId(null)
            startTransition(() => router.refresh())
          }}
        />
      )}
    </div>
  )
}

function UserScoresTab({ rows }: { rows: UserScoreRow[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [page, setPage] = useState(1)
  const paged = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  async function resetScore(userId: string) {
    await fetch(`/api/user-scores/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score: 50 }),
    })
    startTransition(() => router.refresh())
  }

  async function suspendUser(userId: string) {
    if (!confirm('להשעות משתמש זה?')) return
    await fetch(`/api/profiles/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_suspended: true }),
    })
    startTransition(() => router.refresh())
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wide">
            <th className="text-right px-4 py-3 font-medium">#</th>
            <th className="text-right px-4 py-3 font-medium">משתמש</th>
            <th className="text-right px-4 py-3 font-medium">ציון</th>
            <th className="text-right px-4 py-3 font-medium">פעולות חיוביות</th>
            <th className="text-right px-4 py-3 font-medium">דיווחים תקינים</th>
            <th className="text-right px-4 py-3 font-medium">חסימות שהתקבל</th>
            <th className="text-right px-4 py-3 font-medium">ניסיונות מילים</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {paged.length === 0 ? (
            <tr>
              <td colSpan={8} className="py-12 text-center text-slate-400 text-sm">
                אין נתונים עדיין
              </td>
            </tr>
          ) : paged.map((r, i) => (
            <tr key={r.user_id ?? i} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-3 text-slate-400 text-xs">{(page - 1) * PAGE_SIZE + i + 1}</td>
              <td className="px-4 py-3">
                <p className="font-medium text-slate-700 text-sm">
                  {r.profile?.display_name || r.profile?.username || '—'}
                </p>
                {r.profile?.username && (
                  <p className="text-xs text-slate-400">@{r.profile.username}</p>
                )}
              </td>
              <td className="px-4 py-3"><ScorePill value={r.score} /></td>
              <td className="px-4 py-3 text-slate-600 text-xs">{r.positive_actions ?? '—'}</td>
              <td className="px-4 py-3 text-slate-600 text-xs">{r.valid_reports ?? '—'}</td>
              <td className="px-4 py-3 text-slate-600 text-xs">{r.received_blocks ?? '—'}</td>
              <td className="px-4 py-3 text-slate-600 text-xs">{r.bad_word_attempts ?? '—'}</td>
              <td className="px-4 py-3">
                {r.user_id && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => resetScore(r.user_id!)}
                      disabled={isPending}
                      title="אפס דירוג ל-50"
                      className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <HiArrowPath className="w-3.5 h-3.5" /> אפס
                    </button>
                    <button
                      onClick={() => suspendUser(r.user_id!)}
                      disabled={isPending}
                      title="השעה משתמש"
                      className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <HiNoSymbol className="w-3.5 h-3.5" /> השעה
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination page={page} pageSize={PAGE_SIZE} total={rows.length} onChange={setPage} />
    </div>
  )
}

const TABS = [
  { key: 'videos', label: 'דירוג סרטונים' },
  { key: 'creators', label: 'דירוג יוצרים' },
  { key: 'users', label: 'דירוג משתמשים' },
]

export default function ScoresClient({
  videoScores,
  creatorScores,
  userScores,
}: {
  videoScores: VideoScoreRow[]
  creatorScores: CreatorScoreRow[]
  userScores: UserScoreRow[]
}) {
  const [activeTab, setActiveTab] = useState('videos')

  const userScoreMap = Object.fromEntries(
    userScores.filter((u) => u.user_id).map((u) => [u.user_id!, u])
  )

  return (
    <div>
      <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-xl w-fit">
        {TABS.map((tab) => (
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
          </button>
        ))}
      </div>

      {activeTab === 'videos' && <VideoScoresTab rows={videoScores} />}
      {activeTab === 'creators' && <CreatorScoresTab rows={creatorScores} userScoreMap={userScoreMap} />}
      {activeTab === 'users' && <UserScoresTab rows={userScores} />}
    </div>
  )
}
