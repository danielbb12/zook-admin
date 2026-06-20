'use client'

import { usePathname } from 'next/navigation'
import { HiMagnifyingGlass, HiBell, HiMoon } from 'react-icons/hi2'

const PAGE_NAMES: Record<string, string> = {
  '/dashboard': 'דשבורד',
  '/reports': 'דיווחים',
  '/users': 'משתמשים',
  '/creators': 'יוצרים',
  '/content': 'תוכן וסרטונים',
  '/gifts': 'מתנות',
  '/categories': 'קטגוריות',
  '/notifications': 'התראות',
  '/settings': 'הגדרות',
}

export default function TopBar() {
  const pathname = usePathname()
  const segment = '/' + pathname.split('/')[1]
  const pageName = PAGE_NAMES[segment] || 'ZOOK Admin'

  return (
    <header className="fixed top-0 left-0 right-[240px] h-[60px] bg-white border-b border-slate-200 z-30 flex items-center justify-between px-6">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <span className="text-slate-400">ZOOK Admin</span>
        <span>/</span>
        <span className="text-slate-800 font-medium">{pageName}</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <HiMagnifyingGlass className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="search"
            placeholder="חיפוש..."
            className="w-56 pr-9 pl-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all placeholder:text-slate-400"
          />
        </div>
        <button className="relative w-9 h-9 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
          <HiBell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <button className="w-9 h-9 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
          <HiMoon className="w-5 h-5" />
        </button>
      </div>
    </header>
  )
}
