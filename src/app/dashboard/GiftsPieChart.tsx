'use client'

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS = ['#185FA5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

interface GiftData {
  name: string
  value: number
}

export default function GiftsPieChart({ data }: { data: GiftData[] }) {
  if (!data.length) {
    return <div className="h-[200px] flex items-center justify-center text-slate-400 text-sm">אין נתונים</div>
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', fontSize: 12 }}
        />
        <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-slate-600">{v}</span>} />
      </PieChart>
    </ResponsiveContainer>
  )
}
