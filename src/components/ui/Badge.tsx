type Variant = 'status' | 'priority'

const STATUS_CLASSES: Record<string, string> = {
  פעיל: 'bg-green-100 text-green-800',
  active: 'bg-green-100 text-green-800',
  approved: 'bg-green-100 text-green-800',
  מושעה: 'bg-amber-100 text-amber-800',
  suspended: 'bg-amber-100 text-amber-800',
  חסום: 'bg-red-100 text-red-800',
  blocked: 'bg-red-100 text-red-800',
  rejected: 'bg-red-100 text-red-800',
  flagged: 'bg-orange-100 text-orange-800',
  בבדיקה: 'bg-blue-100 text-blue-800',
  pending: 'bg-blue-100 text-blue-800',
  pending_review: 'bg-orange-100 text-orange-800',
  processing: 'bg-slate-100 text-slate-600',
  in_progress: 'bg-purple-100 text-purple-800',
  appealing: 'bg-orange-100 text-orange-800',
  closed: 'bg-gray-100 text-gray-600',
  resolved: 'bg-gray-100 text-gray-600',
  verified: 'bg-green-100 text-green-800',
  מאומת: 'bg-green-100 text-green-800',
}

const PRIORITY_CLASSES: Record<string, string> = {
  urgent: 'bg-red-100 text-red-800',
  דחוף: 'bg-red-100 text-red-800',
  high: 'bg-orange-100 text-orange-800',
  גבוה: 'bg-orange-100 text-orange-800',
  medium: 'bg-blue-100 text-blue-800',
  בינוני: 'bg-blue-100 text-blue-800',
  low: 'bg-gray-100 text-gray-600',
  נמוך: 'bg-gray-100 text-gray-600',
}

const STATUS_LABELS: Record<string, string> = {
  active: 'פעיל',
  approved: 'אושר',
  suspended: 'מושעה',
  blocked: 'חסום',
  rejected: 'נדחה',
  flagged: 'מסומן',
  pending: 'ממתין',
  pending_review: 'ממתין לאישור',
  processing: 'בעיבוד',
  in_progress: 'בטיפול',
  appealing: 'בערעור',
  closed: 'סגור',
  resolved: 'נסגר',
  verified: 'מאומת',
}

const PRIORITY_LABELS: Record<string, string> = {
  urgent: 'דחוף',
  high: 'גבוה',
  medium: 'בינוני',
  low: 'נמוך',
}

interface BadgeProps {
  value: string | null
  variant?: Variant
}

export default function Badge({ value, variant = 'status' }: BadgeProps) {
  if (!value) return <span className="text-gray-400 text-xs">—</span>

  const key = value.toLowerCase()
  const classes =
    variant === 'priority'
      ? PRIORITY_CLASSES[key] || PRIORITY_CLASSES[value] || 'bg-gray-100 text-gray-600'
      : STATUS_CLASSES[key] || STATUS_CLASSES[value] || 'bg-gray-100 text-gray-600'

  const label =
    variant === 'priority'
      ? PRIORITY_LABELS[key] || value
      : STATUS_LABELS[key] || value

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${classes}`}>
      {label}
    </span>
  )
}
