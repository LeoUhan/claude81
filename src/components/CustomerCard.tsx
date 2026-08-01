import { motion } from 'framer-motion'
import { ArrowDownRight, ArrowRight, ArrowUpRight, Clock } from 'lucide-react'
import HealthRing from './HealthRing'
import { Customer, riskLevelStyle } from '../data/customers'

const trendIcon = {
  down: ArrowDownRight,
  flat: ArrowRight,
  up: ArrowUpRight,
}

const trendColor = {
  down: 'text-rose-500',
  flat: 'text-slate-400',
  up: 'text-emerald-500',
}

export default function CustomerCard({ c, delay = 0 }: { c: Customer; delay?: number }) {
  const style = riskLevelStyle[c.status]
  const TrendIcon = trendIcon[c.trend]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -3 }}
      className="glass gradient-border group cursor-pointer rounded-2xl p-4 shadow-sm shadow-slate-100 transition-shadow hover:shadow-lg hover:shadow-violet-100/70"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-slate-800">{c.name}</h3>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${style.bg} ${style.text}`}>
              <span className={`mr-1 inline-block h-1.5 w-1.5 rounded-full ${style.dot}`} />
              {c.status}
            </span>
          </div>
          <p className="mt-0.5 text-[11px] text-slate-400">
            {c.industry} · {c.region} · {c.owner}
          </p>
        </div>
        <HealthRing value={c.health} size={44} stroke={5} />
      </div>

      <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-slate-500">{c.headline}</p>

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
        <div className="flex items-center gap-1 text-[11px] text-slate-400">
          <Clock size={12} />
          距到期 {c.daysToRenewal} 天
        </div>
        <div className={`flex items-center gap-0.5 text-[11px] font-medium ${trendColor[c.trend]}`}>
          <TrendIcon size={13} />
          {c.trend === 'down' ? '走弱' : c.trend === 'up' ? '走强' : '平稳'}
        </div>
      </div>
    </motion.div>
  )
}
