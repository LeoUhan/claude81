import type { LucideIcon } from 'lucide-react'

interface Props {
  icon: LucideIcon
  label: string
  value: string
  sub?: string
  accent: string
}

export default function StatTile({ icon: Icon, label, value, sub, accent }: Props) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-white"
        style={{ background: accent }}
      >
        <Icon size={20} strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <div className="text-xs text-slate-500">{label}</div>
        <div className="text-xl font-semibold leading-tight text-slate-800">{value}</div>
        {sub && <div className="truncate text-[11px] text-slate-400">{sub}</div>}
      </div>
    </div>
  )
}
