import { Cloud, Globe2, ListChecks, TrendingDown } from 'lucide-react'
import { HeroEvent, timeAgo } from '../engine/heroStream'

interface Props {
  monitoredCount: number
  highRisk: number
  actionCount: number
  avgLead: number
  peerGapCount: number
  events: HeroEvent[]
}

const SAT_ICONS = [Cloud, ListChecks, TrendingDown, Globe2]
const SAT_ANGLES = [0, 90, 180, 270]
const ORBIT_DURATION = '20s'

export default function AgentHero({ monitoredCount, highRisk, actionCount, avgLead, peerGapCount, events }: Props) {
  return (
    <div className="relative flex items-center gap-8 overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_25%_30%,#2e1065_0%,#0f172a_55%,#0b1120_100%)] px-10 py-7">
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '26px 26px',
        }}
      />

      <div className="relative h-[150px] w-[150px] shrink-0">
        <div className="absolute inset-0 rounded-full border border-violet-400/20" />
        <div className="absolute inset-[16px] rounded-full border border-fuchsia-400/20" />
        <div
          className="absolute inset-0 animate-[spin_6s_linear_infinite] rounded-full"
          style={{ background: 'conic-gradient(from 60deg, rgba(167,139,250,0.28), transparent 45%)' }}
        />
        <div className="absolute inset-[46px] animate-[breathe_3s_ease-in-out_infinite] rounded-full bg-[radial-gradient(circle_at_35%_30%,#c4b5fd,#7c3aed_45%,#4c1d95_85%)] shadow-[0_0_50px_10px_rgba(124,58,237,0.5),0_0_100px_24px_rgba(217,70,239,0.22)]">
          <div className="absolute inset-0 flex items-center justify-center text-[19px] text-white [text-shadow:0_0_12px_rgba(255,255,255,0.8)]">
            ✦
          </div>
        </div>

        {SAT_ICONS.map((Icon, i) => (
          <div key={i} className="absolute inset-0" style={{ transform: `rotate(${SAT_ANGLES[i]}deg)` }}>
            <div className="absolute inset-0 animate-[spin_20s_linear_infinite]">
              <div className="absolute left-1/2 top-0 flex h-7 w-7 -translate-x-1/2 items-center justify-center">
                <div
                  className="flex h-7 w-7 animate-[spin_20s_linear_infinite_reverse] items-center justify-center rounded-md border border-white/15 bg-white/10 text-violet-100 shadow-[0_0_18px_rgba(124,58,237,0.32)]"
                >
                  <Icon size={13} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="relative min-w-[400px] flex-none">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] text-violet-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_0_5px_rgba(74,222,128,0.2)]" />
          Agent Live · 正在监测 {monitoredCount} 家客户
        </div>
        <div className="mt-2 text-lg font-bold text-white">
          Value-Guard 正在
          <span className="bg-gradient-to-r from-violet-300 to-fuchsia-300 bg-clip-text text-transparent">实时分析</span>
          客户经营信号
        </div>
        <div className="mt-3.5 flex gap-2.5">
          <div className="min-w-[80px] rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2">
            <div className="text-[15px] font-bold text-rose-400">{highRisk} 家</div>
            <div className="mt-0.5 text-[9px] text-slate-400">高风险待处理</div>
          </div>
          <div className="min-w-[80px] rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2">
            <div className="text-[15px] font-bold text-white">{actionCount} 项</div>
            <div className="mt-0.5 text-[9px] text-slate-400">本周期动作</div>
          </div>
          <div className="min-w-[80px] rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2">
            <div className="text-[15px] font-bold text-white">{avgLead} 天</div>
            <div className="mt-0.5 text-[9px] text-slate-400">平均续费窗口</div>
          </div>
          <div className="min-w-[80px] rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2">
            <div className="text-[15px] font-bold text-white">{peerGapCount} 家</div>
            <div className="mt-0.5 text-[9px] text-slate-400">同行内容落后</div>
          </div>
        </div>
      </div>

      <div className="relative h-[150px] w-px shrink-0 self-stretch bg-gradient-to-b from-transparent via-white/10 to-transparent" />

      <div className="relative min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <h3 className="text-[10.5px] font-semibold tracking-wide text-slate-400">实时信号流</h3>
          <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2 py-0.5 text-[9px] text-emerald-300">● LIVE</span>
        </div>
        {events.map((ev) => (
          <div key={ev.id} className="flex items-center gap-2 border-b border-white/[0.06] py-1.5 last:border-b-0">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: ev.color }} />
            <span className="min-w-0 flex-1 truncate text-[11.5px] text-slate-200">{ev.text}</span>
            <span className="shrink-0 font-mono text-[9.5px] text-slate-500">{timeAgo(ev.at)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
