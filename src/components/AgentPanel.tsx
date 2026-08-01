import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { CustomerView } from '../engine/selectors'
import { Link } from 'react-router-dom'

const steps = ['信号扫描', '证据关联', '风险判断', '动作建议']

export default function AgentPanel({ views }: { views: CustomerView[] }) {
  const insights = views
    .filter((v) => v.health.level !== '稳定')
    .slice(0, 6)
    .map((v) => ({
      id: v.customer.id,
      name: v.customer.name,
      text: `健康度 ${v.health.score} 分（${v.health.level}）· ${v.health.factors[0]}`,
    }))

  const [stepIndex, setStepIndex] = useState(0)
  const [insightIndex, setInsightIndex] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setStepIndex((i) => (i + 1) % steps.length), 1600)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (insights.length === 0) return
    const t = setInterval(() => setInsightIndex((i) => (i + 1) % insights.length), 4500)
    return () => clearInterval(t)
  }, [insights.length])

  if (insights.length === 0) return null
  const current = insights[insightIndex]

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white">
          <Sparkles size={18} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-800">Agent 洞察</h2>
            <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-600">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              持续分析中
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-400">已接入 12 家客户 · 7 类数据源 · 本周期实时评估</p>

          <div className="mt-3 min-h-[40px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.25 }}
              >
                <Link
                  to={`/customers/${current.id}`}
                  className="block rounded-lg bg-slate-50 px-3.5 py-2.5 text-sm text-slate-600 transition hover:bg-violet-50"
                >
                  <span className="font-medium text-slate-800">{current.name}</span>
                  <span className="mx-1.5 text-slate-300">·</span>
                  {current.text}
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-4 flex items-center gap-2">
            {steps.map((s, i) => (
              <div key={s} className="flex flex-1 items-center gap-2">
                <div
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold transition-colors ${
                    i === stepIndex ? 'bg-violet-600 text-white' : i < stepIndex ? 'bg-violet-100 text-violet-500' : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {i + 1}
                </div>
                <span className={`text-[11px] ${i === stepIndex ? 'font-medium text-slate-700' : 'text-slate-400'}`}>{s}</span>
                {i < steps.length - 1 && <div className="h-px flex-1 bg-slate-100" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
