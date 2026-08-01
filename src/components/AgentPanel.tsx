import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ScanEye, Link2, Gauge, Sparkles } from 'lucide-react'
import { customers } from '../data/customers'

const steps = [
  { label: '信号扫描', icon: ScanEye },
  { label: '证据关联', icon: Link2 },
  { label: '风险判断', icon: Gauge },
  { label: '动作建议', icon: Sparkles },
]

const insights = customers
  .filter((c) => c.status !== '稳定')
  .slice(0, 6)
  .map((c) => ({
    customer: c.name,
    text: `${c.headline}，健康度 ${c.health} 分，判断为「${c.status}」`,
  }))

export default function AgentPanel() {
  const [stepIndex, setStepIndex] = useState(0)
  const [insightIndex, setInsightIndex] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setStepIndex((i) => (i + 1) % steps.length), 1300)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setInsightIndex((i) => (i + 1) % insights.length), 4200)
    return () => clearInterval(t)
  }, [])

  const current = insights[insightIndex]

  return (
    <div className="glass gradient-border relative overflow-hidden rounded-3xl p-6 shadow-lg shadow-violet-100/60">
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl opacity-40">
        <div className="absolute -left-10 -top-10 h-40 w-40 animate-gradient-x rounded-full bg-gradient-to-br from-violet-300 via-fuchsia-300 to-sky-300 blur-3xl" />
      </div>

      <div className="relative flex items-start gap-5">
        {/* breathing orb */}
        <div className="relative shrink-0">
          <div className="absolute inset-0 -m-3 animate-breathe rounded-full bg-gradient-to-br from-violet-400/30 via-fuchsia-400/30 to-sky-400/30 blur-xl" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 via-fuchsia-500 to-sky-500 shadow-lg shadow-fuchsia-200">
            <div className="absolute inset-0 overflow-hidden rounded-full">
              <div className="absolute inset-x-0 h-6 animate-scanline bg-white/25 blur-sm" />
            </div>
            <Sparkles size={26} className="text-white" strokeWidth={2} />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-slate-800">Value-Guard Agent</h2>
            <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-600">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              持续分析中
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-400">已接入 12 家客户 · 7 类数据源 · 本周期实时评估</p>

          <div className="mt-4 min-h-[44px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={insightIndex}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.35 }}
                className="rounded-xl bg-white/70 px-3.5 py-2.5 text-sm text-slate-600 shadow-inner"
              >
                <span className="font-medium text-slate-800">{current.customer}</span>
                <span className="mx-1.5 text-slate-300">·</span>
                {current.text}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-4 flex items-center gap-1.5">
            {steps.map((s, i) => {
              const Icon = s.icon
              const active = i === stepIndex
              return (
                <div key={s.label} className="flex flex-1 items-center gap-1.5">
                  <div
                    className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all duration-300 ${
                      active
                        ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-sm shadow-fuchsia-200 scale-105'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    <Icon size={12} />
                    {s.label}
                  </div>
                  {i < steps.length - 1 && (
                    <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent" />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
