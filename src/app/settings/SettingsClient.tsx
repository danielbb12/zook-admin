'use client'

import { useState } from 'react'

const SUB_NAV = [
  { key: 'general', label: 'כללי' },
  { key: 'content', label: 'תוכן וסינון' },
  { key: 'scoring', label: 'דירוגים' },
  { key: 'ai', label: 'AI ומאמן' },
  { key: 'team', label: 'צוות והרשאות' },
  { key: 'shabbat', label: 'שבת וחגים' },
  { key: 'audit', label: 'Audit Log' },
]

interface GeneralSettings {
  appName: string
  domain: string
  supportEmail: string
  maintenanceMode: boolean
  minAge: number
  videoMinSec: number
  videoMaxSec: number
}

const MOCK_AUDIT = [
  { id: 1, action: 'עדכון הגדרות כלליות', user: 'דניאל מזרחי', at: '2026-06-09T10:30:00' },
  { id: 2, action: 'השעיית יוצר #abc123', user: 'דניאל מזרחי', at: '2026-06-09T09:15:00' },
  { id: 3, action: 'אישור דיווח #def456', user: 'דניאל מזרחי', at: '2026-06-08T18:45:00' },
]

export default function SettingsClient() {
  const [activeTab, setActiveTab] = useState('general')
  const [saved, setSaved] = useState(false)
  const [settings, setSettings] = useState<GeneralSettings>({
    appName: 'ZOOK',
    domain: 'zook.app',
    supportEmail: 'support@zook.app',
    maintenanceMode: false,
    minAge: 13,
    videoMinSec: 5,
    videoMaxSec: 180,
  })

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="flex gap-6">
      {/* Sub-nav */}
      <aside className="w-48 flex-shrink-0">
        <nav className="bg-white rounded-xl shadow-sm p-2 sticky top-[76px]">
          {SUB_NAV.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`w-full text-right px-3 py-2.5 rounded-lg text-sm font-medium transition-all mb-0.5 ${
                activeTab === item.key
                  ? 'bg-blue-50 text-[#185FA5]'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <div className="flex-1">
        {activeTab === 'general' && (
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-5">
            <h2 className="text-base font-semibold text-slate-800 border-b border-slate-100 pb-4">הגדרות כלליות</h2>

            {saved && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-green-700 text-sm">
                ✓ ההגדרות נשמרו בהצלחה
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">שם האפליקציה</label>
                <input
                  value={settings.appName}
                  onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">דומיין</label>
                <input
                  value={settings.domain}
                  onChange={(e) => setSettings({ ...settings, domain: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">מייל תמיכה</label>
                <input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">גיל מינימלי</label>
                <input
                  type="number"
                  min={0}
                  value={settings.minAge}
                  onChange={(e) => setSettings({ ...settings, minAge: +e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">אורך סרטון (שניות)</label>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-xs text-slate-500 mb-1">מינימום</p>
                  <input
                    type="number"
                    min={1}
                    value={settings.videoMinSec}
                    onChange={(e) => setSettings({ ...settings, videoMinSec: +e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <span className="text-slate-400 mt-5">—</span>
                <div className="flex-1">
                  <p className="text-xs text-slate-500 mb-1">מקסימום</p>
                  <input
                    type="number"
                    min={1}
                    value={settings.videoMaxSec}
                    onChange={(e) => setSettings({ ...settings, videoMaxSec: +e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div>
                <p className="text-sm font-medium text-slate-700">מצב תחזוקה</p>
                <p className="text-xs text-slate-500 mt-0.5">כשפעיל, המשתמשים יראו מסך תחזוקה</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                className={`relative w-12 h-6 rounded-full transition-colors ${settings.maintenanceMode ? 'bg-[#185FA5]' : 'bg-slate-300'}`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                    settings.maintenanceMode ? 'translate-x-0.5' : 'translate-x-6'
                  }`}
                />
              </button>
            </div>

            <button
              onClick={handleSave}
              className="px-6 py-2.5 bg-[#185FA5] text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              שמור שינויים
            </button>
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-base font-semibold text-slate-800 border-b border-slate-100 pb-4 mb-4">Audit Log</h2>
            <div className="space-y-0">
              {MOCK_AUDIT.map((entry) => (
                <div key={entry.id} className="flex items-center gap-4 py-3 border-b border-slate-50 last:border-0">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-sm font-bold flex-shrink-0">
                    {entry.user[0]}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-700">{entry.action}</p>
                    <p className="text-xs text-slate-400">{entry.user}</p>
                  </div>
                  <p className="text-xs text-slate-400 whitespace-nowrap">
                    {new Date(entry.at).toLocaleString('he-IL', { dateStyle: 'short', timeStyle: 'short' })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab !== 'general' && activeTab !== 'audit' && (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <p className="text-slate-400 text-sm">בקרוב – {SUB_NAV.find((s) => s.key === activeTab)?.label}</p>
          </div>
        )}
      </div>
    </div>
  )
}
