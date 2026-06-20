'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { HiPlus, HiPencil, HiTrash, HiCheck, HiXMark } from 'react-icons/hi2'

interface CategoryRow {
  id: string
  name: string | null
  parent_id: string | null
  slug: string | null
  is_active: boolean | null
  video_count: number
}

const TABS = ['קטגוריות', 'תגיות', 'מילים אסורות']

function AddModal({
  parentId,
  parentName,
  onClose,
  onDone,
}: {
  parentId: string | null
  parentName: string | null
  onClose: () => void
  onDone: () => void
}) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  async function submit() {
    if (!name.trim()) return
    setLoading(true)
    setErr('')
    const slug = name.trim().replace(/\s+/g, '-').toLowerCase()
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), parent_id: parentId, slug }),
    })
    const json = await res.json()
    if (!res.ok) { setErr(json.error ?? 'שגיאה'); setLoading(false); return }
    setLoading(false)
    onDone()
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-80">
        <h3 className="font-semibold text-slate-800 mb-1">
          {parentId ? `תת-קטגוריה תחת "${parentName ?? ''}"` : 'קטגוריה חדשה'}
        </h3>
        {err && <p className="text-red-500 text-xs mb-2">{err}</p>}
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="שם הקטגוריה"
          className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100 mb-4 mt-2"
        />
        <div className="flex gap-2">
          <button onClick={submit} disabled={loading} className="flex-1 px-4 py-2 bg-[#185FA5] text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'שומר...' : 'הוסף'}
          </button>
          <button onClick={onClose} className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200">ביטול</button>
        </div>
      </div>
    </div>
  )
}

function EditModal({
  cat,
  onClose,
  onDone,
}: {
  cat: CategoryRow
  onClose: () => void
  onDone: () => void
}) {
  const [name, setName] = useState(cat.name ?? '')
  const [loading, setLoading] = useState(false)

  async function submit() {
    setLoading(true)
    await fetch(`/api/categories/${cat.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    setLoading(false)
    onDone()
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-80">
        <h3 className="font-semibold text-slate-800 mb-4">עריכת קטגוריה</h3>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100 mb-4"
        />
        <div className="flex gap-2">
          <button onClick={submit} disabled={loading} className="flex-1 px-4 py-2 bg-[#185FA5] text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'שומר...' : 'שמור'}
          </button>
          <button onClick={onClose} className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200">ביטול</button>
        </div>
      </div>
    </div>
  )
}

export default function CategoryTree({ initialCategories }: { initialCategories: CategoryRow[] }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('קטגוריות')
  const [addingUnder, setAddingUnder] = useState<{ id: string | null; name: string | null } | null>(null)
  const [editingCat, setEditingCat] = useState<CategoryRow | null>(null)
  const [isPending, startTransition] = useTransition()

  const parentMap = Object.fromEntries(initialCategories.map((c) => [c.id, c.name ?? '—']))

  async function toggleActive(cat: CategoryRow) {
    await fetch(`/api/categories/${cat.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !cat.is_active }),
    })
    startTransition(() => router.refresh())
  }

  async function deleteCat(cat: CategoryRow) {
    if (cat.video_count > 0) {
      alert('לא ניתן למחוק קטגוריה עם סרטונים')
      return
    }
    if (!confirm(`למחוק את "${cat.name}"?`)) return
    const res = await fetch(`/api/categories/${cat.id}`, { method: 'DELETE' })
    if (!res.ok) {
      const json = await res.json()
      alert(json.error ?? 'שגיאה במחיקה')
      return
    }
    startTransition(() => router.refresh())
  }

  function refresh() {
    startTransition(() => router.refresh())
  }

  return (
    <div>
      <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-xl w-fit">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'קטגוריות' && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-700">
              {isPending && <span className="text-slate-400 font-normal ml-2">מעדכן...</span>}
            </h3>
            <button
              onClick={() => setAddingUnder({ id: null, name: null })}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#185FA5] text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <HiPlus className="w-4 h-4" /> הוסף קטגוריה
            </button>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wide">
                <th className="text-right px-4 py-3 font-medium">שם</th>
                <th className="text-right px-4 py-3 font-medium">קטגוריה-על</th>
                <th className="text-right px-4 py-3 font-medium">סטטוס</th>
                <th className="text-right px-4 py-3 font-medium">סרטונים</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {initialCategories.length === 0 ? (
                <tr><td colSpan={5} className="py-12 text-center text-slate-400 text-sm">אין קטגוריות</td></tr>
              ) : initialCategories.map((cat) => (
                <tr key={cat.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-700">{cat.name ?? '—'}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {cat.parent_id ? (parentMap[cat.parent_id] ?? cat.parent_id) : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(cat)}
                      disabled={isPending}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                        cat.is_active !== false
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {cat.is_active !== false ? <><HiCheck className="w-3 h-3" /> פעיל</> : <>כבוי</>}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-slate-600 text-xs">{cat.video_count}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setAddingUnder({ id: cat.id, name: cat.name })}
                        title="הוסף תת-קטגוריה"
                        className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <HiPlus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingCat(cat)}
                        title="ערוך"
                        className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      >
                        <HiPencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteCat(cat)}
                        title="מחק"
                        disabled={cat.video_count > 0}
                        className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <HiTrash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab !== 'קטגוריות' && (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <p className="text-slate-400 text-sm">בקרוב – {activeTab}</p>
        </div>
      )}

      {addingUnder !== undefined && addingUnder !== null && (
        <AddModal
          parentId={addingUnder.id}
          parentName={addingUnder.name}
          onClose={() => setAddingUnder(null)}
          onDone={() => { setAddingUnder(null); refresh() }}
        />
      )}

      {editingCat && (
        <EditModal
          cat={editingCat}
          onClose={() => setEditingCat(null)}
          onDone={() => { setEditingCat(null); refresh() }}
        />
      )}
    </div>
  )
}
