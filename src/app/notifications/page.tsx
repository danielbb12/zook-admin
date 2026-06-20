import PageHeader from '@/components/ui/PageHeader'
import NotificationsClient from './NotificationsClient'

export default function NotificationsPage() {
  return (
    <div>
      <PageHeader title="התראות" subtitle="שליחה וניהול התראות Push" />
      <NotificationsClient />
    </div>
  )
}
