import { Cloud, Globe2, ListChecks, TrendingDown } from 'lucide-react'

interface Props {
  monitoredCount: number
  highRisk: number
  actionCount: number
  avgLead: number
  peerGapCount: number
}

export default function AgentHero({ monitoredCount, highRisk, actionCount, avgLead, peerGapCount }: Props) {
  return (
    <div className="relative flex items-center gap-10 overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_25%_30%,#2e1065_0%,#0f172a_55%,#0b1120_100%)] px-10 py-7">
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '26px 26px',
        }}
      />

      <div className="relative h-[150px] w-[150px] shrink-0">
        <div className="absolute inset-0 animate-[spin_18s_linear_infinite] rounded-full border border-violet-400/20" />
        <div className="absolute inset-[16px] animate-[spin_14s_linear_infinite_reverse] rounded-full border border-fuchsia-400/20" />
        <div className="absolute inset-[32px] rounded-full border border-violet-400/25" />
        <div className="absolute inset-[46px] rounded-full bg-[radial-gradient(circle_at_35%_30%,#c4b5fd,#7c3aed_45%,#4c1d95_85%)] shadow-[0_0_50px_10px_rgba(124,58,237,0.5),0_0_100px_24px_rgba(217,70,239,0.22)]">
          <div className="absolute inset-0 flex animate-pulse items-center justify-center text-[19px] text-white [text-shadow:0_0_12px_rgba(255,255,255,0.8)]">
            ✦
          </div>
        </div>

        <div className="absolute left-1/2 top-0 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-md border border-white/15 bg-white/10 text-violet-100 shadow-[0_0_18px_rgba(124,58,237,0.32)]">
          <Cloud size={13} />
        </div>
        <div className="absolute right-0 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md border border-white/15 bg-white/10 text-violet-100 shadow-[0_0_18px_rgba(124,58,237,0.32)]">
          <ListChecks size={13} />
        </div>
        <div className="absolute bottom-0 left-1/2 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-md border border-white/15 bg-white/10 text-violet-100 shadow-[0_0_18px_rgba(124,58,237,0.32)]">
          <TrendingDown size={13} />
        </div>
        <div className="absolute left-0 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md border border-white/15 bg-white/10 text-violet-100 shadow-[0_0_18px_rgba(124,58,237,0.32)]">
          <Globe2 size={13} />
        </div>
      </div>

      <div className="relative min-w-0 flex-1">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] text-violet-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_0_5px_rgba(74,222,128,0.2)]" />
          Agent Live · 正在监测 {monitoredCount} 家客户
        </div>
        <div className="mt-2 text-xl font-bold text-white">
          Value-Guard 正在
          <span className="bg-gradient-to-r from-violet-300 to-fuchsia-300 bg-clip-text text-transparent">实时分析</span>
          客户经营信号
        </div>
        <div className="mt-3 flex gap-2.5">
          <div className="min-w-[88px] rounded-xl border border-white/10 bg-white/[0.06] px-3.5 py-2">
            <div className="text-base font-bold text-rose-400">{highRisk} 家</div>
            <div className="mt-0.5 text-[10px] text-slate-400">高风险待处理</div>
          </div>
          <div className="min-w-[88px] rounded-xl border border-white/10 bg-white/[0.06] px-3.5 py-2">
            <div className="text-base font-bold text-white">{actionCount} 项</div>
            <div className="mt-0.5 text-[10px] text-slate-400">本周期动作</div>
          </div>
          <div className="min-w-[88px] rounded-xl border border-white/10 bg-white/[0.06] px-3.5 py-2">
            <div className="text-base font-bold text-white">{avgLead} 天</div>
            <div className="mt-0.5 text-[10px] text-slate-400">平均续费窗口</div>
          </div>
          <div className="min-w-[88px] rounded-xl border border-white/10 bg-white/[0.06] px-3.5 py-2">
            <div className="text-base font-bold text-white">{peerGapCount} 家</div>
            <div className="mt-0.5 text-[10px] text-slate-400">同行内容落后</div>
          </div>
        </div>
      </div>
    </div>
  )
}
