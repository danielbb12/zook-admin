import PageHeader from '@/components/ui/PageHeader'
import SettingsClient from './SettingsClient'

export default function SettingsPage() {
  return (
    <div>
      <PageHeader title="הגדרות" subtitle="ניהול הגדרות המערכת" />
      <SettingsClient />
    </div>
  )
}
