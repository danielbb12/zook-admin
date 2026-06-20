const COLORS = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-cyan-500',
  'bg-indigo-500',
  'bg-teal-500',
]

function colorFor(id: string) {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash)
  }
  return COLORS[Math.abs(hash) % COLORS.length]
}

function initials(name: string | null, username: string | null) {
  const src = name || username || '?'
  const parts = src.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return src[0].toUpperCase()
}

interface AvatarProps {
  id: string
  name: string | null
  username?: string | null
  url?: string | null
  size?: 'sm' | 'md' | 'lg'
}

export default function Avatar({ id, name, username, url, size = 'md' }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-11 h-11 text-base',
  }

  if (url) {
    return (
      <img
        src={url}
        alt={name || username || ''}
        className={`${sizeClasses[size]} rounded-full object-cover flex-shrink-0`}
      />
    )
  }

  return (
    <div
      className={`${sizeClasses[size]} ${colorFor(id)} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0`}
    >
      {initials(name, username ?? null)}
    </div>
  )
}
