import type { Metadata } from 'next'
import './globals.css'
import { createAdminClient } from '@/lib/supabase/admin'
import Sidebar from '@/components/ui/Sidebar'
import TopBar from '@/components/ui/TopBar'

export const metadata: Metadata = {
  title: 'ZOOK Admin',
  description: 'פאנל ניהול ZOOK',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = createAdminClient()
  const { count: openSupportCount } = await supabase
    .from('support_tickets')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'open')

  return (
    <html lang="he" dir="rtl" className="h-full">
      <body className="min-h-screen bg-[#F8FAFC]">
        <Sidebar openSupportCount={openSupportCount ?? 0} />
        <TopBar />
        <main className="mr-[240px] mt-[60px] p-6 min-h-[calc(100vh-60px)]">
          {children}
        </main>
      </body>
    </html>
  )
}
