'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HiSquares2X2,
  HiBell,
  HiUsers,
  HiStar,
  HiVideoCamera,
  HiGift,
  HiCog6Tooth,
  HiChartBar,
  HiTag,
  HiLifebuoy,
} from 'react-icons/hi2'
import type { ComponentType } from 'react'

interface NavItem {
  href: string
  label: string
  icon: ComponentType<{ className?: string }>
  badge?: string | number
}

function buildNavItems(openSupportCount: number): NavItem[] {
  return [
    { href: '/dashboard', label: 'דשבורד', icon: HiSquares2X2 },
    { href: '/reports', label: 'דיווחים', icon: HiBell, badge: '6' },
    { href: '/users', label: 'משתמשים', icon: HiUsers },
    { href: '/creators', label: 'יוצרים', icon: HiStar, badge: '3' },
    { href: '/content', label: 'תוכן וסרטונים', icon: HiVideoCamera },
    { href: '/gifts', label: 'מתנות', icon: HiGift },
    { href: '/categories', label: 'קטגוריות', icon: HiTag },
    { href: '/scores', label: 'דירוגים', icon: HiChartBar },
    { href: '/support', label: 'תמיכה ופניות', icon: HiLifebuoy, badge: openSupportCount > 0 ? openSupportCount : undefined },
    { href: '/notifications', label: 'התראות', icon: HiBell },
    { href: '/settings', label: 'הגדרות', icon: HiCog6Tooth },
  ]
}

export default function Sidebar({ openSupportCount = 0 }: { openSupportCount?: number }) {
  const pathname = usePathname()
  const NAV_ITEMS = buildNavItems(openSupportCount)

  return (
    <aside className="fixed right-0 top-0 h-screen w-[240px] bg-[#0F2547] flex flex-col z-40">
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#185FA5] rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-sm">Z</span>
          </div>
          <span className="text-white font-bold text-lg tracking-wide">ZOOK Admin</span>
        </div>
      </div>

      <nav className="flex-1 py-3 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 mx-2 rounded-lg mb-0.5 transition-all text-sm font-medium ${
                isActive
                  ? 'bg-[#185FA5] text-white shadow-sm'
                  : 'text-blue-200 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.badge != null && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            ד
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">דניאל מזרחי</p>
            <p className="text-blue-300 text-xs truncate">אדמין ראשי</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
