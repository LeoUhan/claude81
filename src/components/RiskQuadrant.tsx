import { useState } from 'react'
import { CustomerView } from '../engine/selectors'
import { useAgent } from '../store/AgentContext'

const STATUS = {
  稳定: { color: '#0ca30c', label: '稳定' },
  预警: { color: '#fab219', label: '预警' },
  高风险: { color: '#d03b3b', label: '高风险' },
} as const

const MAX_DAYS = 200
const COLS = 6
const ROWS = 6
const MIN = 6
const MAX = 94
const CELL_X = (MAX - MIN) / COLS
const CELL_Y = (MAX - MIN) / ROWS

function urgencyPct(daysToRenewal: number) {
  const raw = 100 * (1 - Math.min(daysToRenewal, MAX_DAYS) / MAX_DAYS)
  return Math.min(MAX, Math.max(MIN, raw))
}

function healthPct(score: number) {
  return Math.min(MAX, Math.max(MIN, score))
}

/** 网格吸附避免卡片重叠：先按最近格子分配，冲突时螺旋搜索最近的空格子 */
function layoutPoints(views: CustomerView[]): Map<string, { x: number; y: number }> {
  const occupied = new Set<string>()
  const result = new Map<string, { x: number; y: number }>()

  const withRaw = views.map((v) => ({
    id: v.customer.id,
    col: Math.round((urgencyPct(v.customer.daysToRenewal) - MIN) / CELL_X),
    row: Math.round((healthPct(v.health.score) - MIN) / CELL_Y),
  }))

  for (const p of withRaw) {
    let best: [number, number] | null = null
    let bestDist = Infinity
    for (let radius = 0; radius <= COLS + ROWS && !best; radius++) {
      for (let dc = -radius; dc <= radius; dc++) {
        for (let dr = -radius; dr <= radius; dr++) {
          if (Math.abs(dc) !== radius && Math.abs(dr) !== radius) continue
          const col = Math.min(COLS, Math.max(0, p.col + dc))
          const row = Math.min(ROWS, Math.max(0, p.row + dr))
          const key = `${col},${row}`
          if (occupied.has(key)) continue
          const dist = dc * dc + dr * dr
          if (dist < bestDist) {
            bestDist = dist
            best = [col, row]
          }
        }
      }
    }
    const [col, row] = best ?? [p.col, p.row]
    occupied.add(`${col},${row}`)
    result.set(p.id, { x: MIN + col * CELL_X, y: MIN + row * CELL_Y })
  }

  return result
}

export default function RiskQuadrant({ views }: { views: CustomerView[] }) {
  const { openDrawer } = useAgent()
  const [hoverId, setHoverId] = useState<string | null>(null)
  const positions = layoutPoints(views)

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">客户留存 · 风险分布</h2>
          <p className="mt-0.5 text-[11px] text-slate-400">纵轴：健康度（越高越靠上）· 横轴：续费紧迫度（越近到期越靠右）</p>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-500">
          {(Object.keys(STATUS) as Array<keyof typeof STATUS>).map((k) => (
            <span key={k} className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: STATUS[k].color }} />
              {STATUS[k].label}
            </span>
          ))}
        </div>
      </div>

      <div className="relative h-[320px] rounded-lg border border-slate-100 bg-slate-50/40">
        {/* quadrant backgrounds */}
        <div className="pointer-events-none absolute inset-0 grid grid-cols-2 grid-rows-2">
          <div className="border-b border-r border-dashed border-slate-200/80 bg-emerald-50/30" />
          <div className="border-b border-dashed border-slate-200/80 bg-amber-50/30" />
          <div className="border-r border-dashed border-slate-200/80 bg-slate-100/40" />
          <div className="bg-rose-50/40" />
        </div>

        {/* quadrant labels */}
        <span className="pointer-events-none absolute left-3 top-2 text-[11px] font-medium text-emerald-600/70">价值实现</span>
        <span className="pointer-events-none absolute right-3 top-2 text-[11px] font-medium text-amber-600/70">续费准备</span>
        <span className="pointer-events-none absolute bottom-2 left-3 text-[11px] font-medium text-slate-400">持续观察</span>
        <span className="pointer-events-none absolute bottom-2 right-3 text-[11px] font-medium text-rose-600/70">优先介入</span>

        {views.map((v) => {
          const pos = positions.get(v.customer.id)!
          const x = pos.x
          const y = pos.y
          const status = STATUS[v.health.level]
          const hasPeerGap = v.signals.some((s) => s.type === '同行落后')
          const isHover = hoverId === v.customer.id

          return (
            <button
              key={v.customer.id}
              onClick={() => openDrawer(`帮我看看 ${v.customer.name.replace(/^\S+\s*/, '')}`)}
              onMouseEnter={() => setHoverId(v.customer.id)}
              onMouseLeave={() => setHoverId(null)}
              className="absolute flex -translate-x-1/2 translate-y-1/2 items-stretch overflow-hidden rounded-lg border border-slate-200 bg-white text-left shadow-sm transition-transform hover:z-20 hover:scale-105 hover:shadow-md"
              style={{ left: `${x}%`, bottom: `${y}%`, zIndex: isHover ? 20 : 1, minWidth: 78 }}
            >
              <span className="w-1 shrink-0" style={{ background: status.color }} />
              <span className="px-2 py-1.5">
                <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-700">
                  {v.customer.id}
                  {hasPeerGap && <span title="同行业对标发现内容落后" className="text-violet-500">◆</span>}
                  <span className="ml-auto tabular-nums" style={{ color: status.color }}>
                    {v.health.score}
                  </span>
                </span>
                <span className="block text-[10px] tabular-nums text-slate-400">D-{v.customer.daysToRenewal}</span>
              </span>

              {isHover && (
                <div className="absolute bottom-full left-1/2 z-30 mb-2 w-56 -translate-x-1/2 rounded-lg border border-slate-200 bg-white p-2.5 text-left shadow-lg">
                  <p className="text-xs font-semibold text-slate-800">{v.customer.name}</p>
                  <p className="mt-0.5 text-[11px] text-slate-500">流失概率 {v.churnProbability}% · {v.health.level}</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{v.health.factors[0]}</p>
                  {hasPeerGap && <p className="mt-1 text-[11px] text-violet-600">◆ 同行业内容对标发现落后</p>}
                </div>
              )}
            </button>
          )
        })}
      </div>

      <div className="mt-2 flex justify-between text-[11px] text-slate-400">
        <span>远</span>
        <span>续费紧迫度 →</span>
        <span>近</span>
      </div>
    </div>
  )
}
