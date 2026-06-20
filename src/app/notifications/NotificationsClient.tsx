'use client'

import { useState } from 'react'
import { HiBell, HiDevicePhoneMobile } from 'react-icons/hi2'

const AUDIENCE_OPTIONS = [
  { value: 'all', label: 'כל המשתמשים' },
  { value: 'creators', label: 'יוצרים בלבד' },
  { value: 'active', label: 'משתמשים פעילים' },
]

const CTA_OPTIONS = [
  { value: '', label: 'ללא CTA' },
  { value: 'open_app', label: 'פתח אפליקציה' },
  { value: 'view_profile', label: 'צפה בפרופיל' },
  { value: 'watch_video', label: 'צפה בסרטון' },
]

const SCHEDULE_OPTIONS = [
  { value: 'now', label: 'עכשיו' },
  { value: 'later', label: 'תזמן' },
]

const TABS = [
  { key: 'send', label: 'שליחה חדשה' },
  { key: 'history', label: 'היסטוריה' },
  { key: 'templates', label: 'תבניות אוטומטיות' },
  { key: 'stats', label: 'סטטיסטיקות' },
]

interface NotifForm {
  audience: string
  title: string
  body: string
  cta: string
  schedule: string
  scheduledAt: string
}

export default function NotificationsClient() {
  const [activeTab, setActiveTab] = useState('send')
  const [form, setForm] = useState<NotifForm>({
    audience: 'all',
    title: '',
    body: '',
    cta: '',
    schedule: 'now',
    scheduledAt: '',
  })
  const [sent, setSent] = useState(false)

  function handleSend() {
    if (!form.title.trim()) return
    setSent(true)
    setTimeout(() => setSent(false), 3000)
  }

  return (
    <div>
      <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-xl w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'send' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Preview (right in RTL) */}
          <div className="lg:col-span-1 flex flex-col items-center">
            <p className="text-sm text-slate-500 mb-4">תצוגה מקדימה</p>
            <div className="w-64 bg-slate-800 rounded-3xl p-3 shadow-2xl">
              <div className="bg-white rounded-2xl overflow-hidden">
                {/* Phone status bar */}
                <div className="bg-slate-100 px-4 py-2 flex items-center justify-between">
                  <span className="text-xs text-slate-500">9:41</span>
                  <div className="flex gap-1">
                    <span className="text-xs text-slate-500">●●●</span>
                  </div>
                </div>
                {/* Notification */}
                <div className="p-4">
                  <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 bg-[#185FA5] rounded-lg flex items-center justify-center flex-shrink-0">
                        <HiBell className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">
                          {form.title || 'כותרת ההודעה'}
                        </p>
                        <p className="text-xs text-slate-500">ZOOK</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {form.body || 'תוכן ההודעה יוצג כאן...'}
                    </p>
                    {form.cta && (
                      <button className="mt-2 w-full py-1.5 bg-[#185FA5] text-white text-xs rounded-lg font-medium">
                        {CTA_OPTIONS.find((o) => o.value === form.cta)?.label}
                      </button>
                    )}
                  </div>
                </div>
                <div className="px-4 pb-4">
                  <div className="flex items-center gap-1">
                    <HiDevicePhoneMobile className="w-3 h-3 text-slate-400" />
                    <span className="text-xs text-slate-400">
                      {AUDIENCE_OPTIONS.find((o) => o.value === form.audience)?.label}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form (left in RTL = main content) */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 space-y-5">
            {sent && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-green-700 text-sm">
                ✓ ההתראה נשלחה בהצלחה
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">קהל יעד</label>
              <div className="flex gap-3">
                {AUDIENCE_OPTIONS.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="audience"
                      value={opt.value}
                      checked={form.audience === opt.value}
                      onChange={(e) => setForm({ ...form, audience: e.target.value })}
                      className="accent-[#185FA5]"
                    />
                    <span className="text-sm text-slate-600">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                כותרת <span className="text-slate-400 font-normal">({form.title.length}/50)</span>
              </label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value.slice(0, 50) })}
                placeholder="הכנס כותרת..."
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                תוכן ההודעה <span className="text-slate-400 font-normal">({form.body.length}/200)</span>
              </label>
              <textarea
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value.slice(0, 200) })}
                placeholder="הכנס תוכן..."
                rows={4}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">CTA</label>
              <select
                value={form.cta}
                onChange={(e) => setForm({ ...form, cta: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
              >
                {CTA_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">תזמון</label>
              <div className="flex gap-4 items-center">
                {SCHEDULE_OPTIONS.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="schedule"
                      value={opt.value}
                      checked={form.schedule === opt.value}
                      onChange={(e) => setForm({ ...form, schedule: e.target.value })}
                      className="accent-[#185FA5]"
                    />
                    <span className="text-sm text-slate-600">{opt.label}</span>
                  </label>
                ))}
                {form.schedule === 'later' && (
                  <input
                    type="datetime-local"
                    value={form.scheduledAt}
                    onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
                    className="px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none"
                  />
                )}
              </div>
            </div>

            <button
              onClick={handleSend}
              disabled={!form.title.trim()}
              className="w-full py-3 bg-[#185FA5] text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              שלח התראה
            </button>
          </div>
        </div>
      )}

      {activeTab !== 'send' && (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <p className="text-slate-400 text-sm">בקרוב – {TABS.find((t) => t.key === activeTab)?.label}</p>
        </div>
      )}
    </div>
  )
}
