interface Props {
  series: number[]
  label: string
  trendPct: number
}

const BAR_AREA_HEIGHT = 96

export default function TrendBars({ series, label, trendPct }: Props) {
  const max = Math.max(...series)
  const declining = trendPct < 0
  const emphasisColor = declining ? '#d03b3b' : '#0ca30c'

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">价值信号趋势</h2>
          <p className="mt-0.5 text-[11px] text-slate-400">{label} · 近 {series.length} 周（按真实环比变化率 {trendPct > 0 ? '+' : ''}{trendPct}% 插值出的趋势形状，非独立历史采样点）</p>
        </div>
        <span className="text-xs font-semibold tabular-nums" style={{ color: emphasisColor }}>
          {trendPct > 0 ? '+' : ''}
          {trendPct}%
        </span>
      </div>

      <div className="mt-4 flex items-end gap-2" style={{ height: BAR_AREA_HEIGHT }}>
        {series.map((v, i) => {
          const isLast = i === series.length - 1
          const barPx = Math.max(6, Math.round((v / max) * BAR_AREA_HEIGHT))
          return (
            <div key={i} className="flex h-full flex-1 flex-col items-center justify-end">
              <div
                className="w-full rounded-t"
                style={{
                  height: barPx,
                  background: isLast ? emphasisColor : '#2a78d6',
                  opacity: isLast ? 1 : 0.55 + (i / series.length) * 0.3,
                }}
              />
            </div>
          )
        })}
      </div>
      <div className="mt-1.5 flex gap-2">
        {series.map((_, i) => (
          <span key={i} className="flex-1 text-center text-[10px] text-slate-400">
            W{i + 1}
          </span>
        ))}
      </div>

      <p className="mt-2 text-[11px] text-slate-400">
        当前状态：<span className="font-medium" style={{ color: emphasisColor }}>{declining ? '走弱' : '走强'}</span>
      </p>
    </div>
  )
}
