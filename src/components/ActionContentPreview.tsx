import { ActionRecord } from '../types'
import { customerSeed } from '../data/seed'
import peerReferenceImg from '../assets/peer-reference-encrea.webp'

function parseChecklist(content: string): string[] {
  const parts = content
    .split(/[0-9]\s*）/)
    .map((s) => s.trim())
    .filter(Boolean)
  if (parts.length <= 1) return [content]
  if (parts[0].endsWith('：') || parts[0].length < 8) parts.shift()
  return parts
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 px-2 py-2 text-center">
      <div className="text-base font-semibold text-slate-800">{value}</div>
      <div className="text-[10px] text-slate-400">{label}</div>
    </div>
  )
}

export default function ActionContentPreview({ action }: { action: ActionRecord }) {
  if (action.type === '客户触达') {
    return (
      <div className="rounded-xl bg-sky-50/60 p-3">
        <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-white px-3.5 py-2.5 text-sm leading-relaxed text-slate-700 shadow-sm">
          {action.content}
        </div>
        <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] text-blue-700">
          💬 {action.channel} · 发送给{action.target}
        </span>
      </div>
    )
  }

  if (action.type === '页面优化') {
    const hasPeerReason = action.triggerReason.includes('同行')
    return (
      <div className="overflow-hidden rounded-xl border border-slate-200">
        <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
          <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
          <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
          <span className="ml-1 flex-1 truncate rounded bg-white px-2 py-0.5 text-[10px] text-slate-400">{action.target}</span>
        </div>
        <div className="px-3.5 py-3 text-sm leading-relaxed text-slate-600">{action.content}</div>
        {hasPeerReason && (
          <div className="border-t border-slate-100 bg-slate-50/60 px-3.5 py-3">
            <a href={peerReferenceImg} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-lg border border-slate-200">
              <img src={peerReferenceImg} alt="同行业真实企业官网参考" className="max-h-40 w-full object-cover object-top" />
            </a>
            <p className="mt-1.5 text-[11px] text-slate-400">
              同行业结构参考：英科镭（ENCREA）官网解决方案页 · 真实网站截图，用于参考页面信息结构，非本客户直接竞争对手
            </p>
          </div>
        )}
      </div>
    )
  }

  if (action.type === '询盘修复') {
    const items = parseChecklist(action.content)
    return (
      <div className="divide-y divide-slate-50 rounded-xl border border-slate-100">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-slate-700">
            <span className="w-4 shrink-0 text-[10px] text-slate-400">{i + 1}</span>
            <span className="h-4 w-4 shrink-0 rounded border border-slate-300" />
            {item}
          </div>
        ))}
      </div>
    )
  }

  if (action.type === '续费复盘') {
    const customer = customerSeed.find((c) => c.id === action.customerId)
    return (
      <div>
        {customer && (
          <div className="grid grid-cols-3 gap-2">
            <Stat label="访问趋势" value={`${customer.metrics.trafficTrendPct}%`} />
            <Stat label="询盘条数" value={`${customer.metrics.inquiryCount}`} />
            <Stat label="询盘趋势" value={`${customer.metrics.inquiryTrendPct}%`} />
          </div>
        )}
        <p className="mt-2.5 text-sm leading-relaxed text-slate-600">{action.content}</p>
      </div>
    )
  }

  return <div className="rounded-lg bg-slate-50 p-3 text-sm leading-relaxed text-slate-600">{action.content}</div>
}
