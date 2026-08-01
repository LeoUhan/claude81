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

function parsePhoneScript(content: string): string[] {
  return content
    .split(/[①②③④⑤⑥]\s*/)
    .map((s) => s.trim())
    .filter(Boolean)
}

function parseEmail(content: string): { subject: string; body: string } {
  const subjectMatch = content.match(/主题：([^\n]+)/)
  const body = content.replace(/主题：[^\n]+\n*/, '').trim()
  return { subject: subjectMatch?.[1]?.trim() ?? '', body }
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
    if (action.channel === '电话') {
      const steps = parsePhoneScript(action.content)
      return (
        <div className="rounded-xl border border-slate-100">
          <div className="flex items-center gap-1.5 rounded-t-xl bg-slate-800 px-3.5 py-2 text-xs font-medium text-white">📞 通话要点脚本</div>
          <div className="divide-y divide-slate-50">
            {steps.map((s, i) => (
              <div key={i} className="px-3.5 py-2 text-sm leading-relaxed text-slate-700">
                {s}
              </div>
            ))}
          </div>
        </div>
      )
    }

    if (action.channel === '邮件') {
      const { subject, body } = parseEmail(action.content)
      return (
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <div className="border-b border-slate-100 bg-slate-50 px-3.5 py-2">
            <span className="text-[10px] text-slate-400">主题</span>
            <p className="text-sm font-medium text-slate-800">{subject}</p>
          </div>
          <div className="whitespace-pre-line px-3.5 py-3 text-sm leading-relaxed text-slate-600">{body}</div>
        </div>
      )
    }

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
        {hasPeerReason && (
          <a href={peerReferenceImg} target="_blank" rel="noreferrer" className="block border-b border-slate-100">
            <img src={peerReferenceImg} alt="同行业真实企业官网参考" className="w-full" />
          </a>
        )}
        <div className="px-3.5 py-3 text-sm leading-relaxed text-slate-600">{action.content}</div>
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
