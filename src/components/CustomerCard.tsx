import { Link } from 'react-router-dom'
import { ArrowDownRight, ArrowRight, ArrowUpRight, Clock } from 'lucide-react'
import HealthRing from './HealthRing'
import { CustomerView } from '../engine/selectors'
import { riskLevelStyle } from '../ui/styles'

function trendOf(pct: number) {
  if (pct <= -5) return 'down' as const
  if (pct >= 5) return 'up' as const
  return 'flat' as const
}

const trendIcon = { down: ArrowDownRight, flat: ArrowRight, up: ArrowUpRight }
const trendColor = { down: 'text-rose-500', flat: 'text-slate-400', up: 'text-emerald-500' }
const trendText = { down: '走弱', flat: '平稳', up: '走强' }

export default function CustomerCard({ view }: { view: CustomerView }) {
  const { customer: c, health } = view
  const style = riskLevelStyle[health.level]
  const trend = trendOf(c.metrics.trafficTrendPct)
  const TrendIcon = trendIcon[trend]

  return (
    <Link
      to={`/customers/${c.id}`}
      className="group block rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-slate-800 group-hover:text-violet-700">{c.name}</h3>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${style.bg} ${style.text}`}>
              <span className={`mr-1 inline-block h-1.5 w-1.5 rounded-full ${style.dot}`} />
              {health.level}
            </span>
          </div>
          <p className="mt-0.5 text-[11px] text-slate-400">
            {c.industry} · {c.region} · {c.owner}
          </p>
        </div>
        <HealthRing value={health.score} size={44} stroke={5} />
      </div>

      <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-slate-500">{health.factors[0]}</p>

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
        <div className="flex items-center gap-1 text-[11px] text-slate-400">
          <Clock size={12} />
          距到期 {c.daysToRenewal} 天
        </div>
        <div className={`flex items-center gap-0.5 text-[11px] font-medium ${trendColor[trend]}`}>
          <TrendIcon size={13} />
          {trendText[trend]}
        </div>
      </div>
    </Link>
  )
}
