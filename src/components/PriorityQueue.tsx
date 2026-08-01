import { ArrowUpRight } from 'lucide-react'
import { PriorityCategory, PriorityItem } from '../engine/priority'
import { useAgent } from '../store/AgentContext'

const CATEGORY_STYLE: Record<PriorityCategory, { bg: string; text: string }> = {
  平台: { bg: '#e8f0fc', text: '#2a78d6' },
  合同: { bg: '#fdece4', text: '#c14f22' },
  网站: { bg: '#eeecf9', text: '#4a3aa7' },
  正向: { bg: '#e3f7ef', text: '#0f8c5f' },
  跟进: { bg: '#fbeaf1', text: '#c34a76' },
}

function titleFor(item: PriorityItem) {
  const keyword: Record<PriorityCategory, string> = {
    平台: '运营信号下行',
    合同: `续费窗口 D-${item.daysToRenewal}`,
    网站: '网站表现待处理',
    正向: '价值信号稳定',
    跟进: '待跟进处理',
  }
  return `${item.shortName} · ${keyword[item.category]}`
}

export default function PriorityQueue({ items, total }: { items: PriorityItem[]; total: number }) {
  const { openDrawer } = useAgent()

  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-800">优先队列</h2>
        <span className="text-[11px] text-slate-400">共 {total} 个客户</span>
      </div>

      <div className="flex-1 space-y-2.5 overflow-y-auto">
        {items.map((item, i) => {
          const style = CATEGORY_STYLE[item.category]
          return (
            <button
              key={item.customerId}
              onClick={() => openDrawer(`帮我看看 ${item.shortName}`)}
              className="group flex w-full items-start gap-3 rounded-lg border border-slate-100 p-3 text-left transition hover:border-violet-200 hover:bg-violet-50/40"
            >
              <span className="mt-0.5 text-xs font-semibold tabular-nums text-slate-300">{String(i + 1).padStart(2, '0')}</span>
              <div className="min-w-0 flex-1">
                <span
                  className="mb-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-medium"
                  style={{ background: style.bg, color: style.text }}
                >
                  {item.category}
                </span>
                <p className="truncate text-sm font-medium text-slate-800">{titleFor(item)}</p>
                <p className="mt-0.5 truncate text-[11px] text-slate-400">{item.reason}</p>
              </div>
              <ArrowUpRight size={14} className="mt-1 shrink-0 text-slate-300 transition group-hover:text-violet-500" />
            </button>
          )
        })}
        {items.length === 0 && <p className="text-sm text-slate-400">当前没有需要立即处理的客户。</p>}
      </div>
    </div>
  )
}
