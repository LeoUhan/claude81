import { Clock, MessageCircle, Sparkles } from 'lucide-react'
import { ActionRecord } from '../types'
import { actionStatusStyle } from '../ui/styles'
import { useAgent } from '../store/AgentContext'

export default function ActionSummaryCard({ action, customerName }: { action: ActionRecord; customerName?: string }) {
  const { openDrawer } = useAgent()
  const style = actionStatusStyle[action.status]
  const isTerminal = action.status === '已完成' || action.status === '已取消'

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">{action.type}</span>
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${style.bg} ${style.text}`}>{action.status}</span>
        {customerName && <span className="text-xs text-slate-400">{customerName}</span>}
        <span className="ml-auto flex items-center gap-1 text-[11px] text-slate-400">
          <Clock size={12} />
          截止 {new Date(action.deadline).toLocaleDateString()}
        </span>
      </div>

      <p className="mt-2 text-sm font-medium text-slate-800">{action.purpose}</p>
      <p className="mt-1 text-xs text-slate-400">触发原因：{action.triggerReason}</p>

      <div className="mt-2 line-clamp-2 rounded-lg bg-slate-50 p-3 text-sm leading-relaxed text-slate-500">{action.content}</div>

      {action.customerReply && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-violet-600">
          <MessageCircle size={12} />
          客户已回复（{action.customerReply.intent}）
        </div>
      )}

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
        <span className="text-[11px] text-slate-400">负责人：{action.owner} · 复查 {new Date(action.reviewAt).toLocaleDateString()}</span>
        {isTerminal ? (
          <span className="text-xs text-slate-400">该动作已结束</span>
        ) : (
          <button
            onClick={() => openDrawer(`处理动作 ${action.id}`)}
            className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-500 px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-90"
          >
            <Sparkles size={13} />
            与 Agent 处理
          </button>
        )}
      </div>
    </div>
  )
}
