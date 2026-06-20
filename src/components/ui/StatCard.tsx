import type { ReactNode } from 'react'

function Sparkline({ data }: { data: number[] }) {
  if (data.length < 2) return null
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const W = 64
  const H = 24
  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * W,
    y: H - ((v - min) / range) * H,
  }))
  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
  return (
    <svg width={W} height={H} className="opacity-60">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

interface StatCardProps {
  icon: ReactNode
  label: string
  value: string | number
  trend?: number
  sparkline?: number[]
  color?: string
}

export default function StatCard({ icon, label, value, trend, sparkline, color = 'text-[#185FA5]' }: StatCardProps) {
  const trendPositive = trend !== undefined && trend >= 0

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className={`p-2 rounded-lg bg-blue-50 ${color}`}>{icon}</div>
        {sparkline && <Sparkline data={sparkline} />}
      </div>
      <div>
        <p className="text-3xl font-bold text-slate-800">{value.toLocaleString()}</p>
        <p className="text-sm text-slate-500 mt-0.5">{label}</p>
      </div>
      {trend !== undefined && (
        <p className={`text-xs font-medium ${trendPositive ? 'text-green-600' : 'text-red-500'}`}>
          {trendPositive ? '↑' : '↓'} {Math.abs(trend)}% מהשבוע שעבר
        </p>
      )}
    </div>
  )
}
