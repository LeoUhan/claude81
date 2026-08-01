import { useState } from 'react'
import { CheckCircle2, Clock, RefreshCcw, ShieldAlert, XCircle } from 'lucide-react'
import { ActionRecord } from '../types'
import { actionStatusStyle } from '../ui/styles'
import { useAppStore } from '../store/AppStore'
import { useRole } from '../store/RoleContext'

const REPLY_INTENTS: { intent: string; text: string }[] = [
  { intent: '积极意向', text: '好的，麻烦帮我们看看，我们也想把网站利用起来。' },
  { intent: '观望', text: '再看看吧，最近这块不是我们重点。' },
  { intent: '异议', text: '说实话感觉最近效果一般，这个费用是不是有点高了。' },
  { intent: '投诉升级', text: '之前反馈的问题一直没解决，这次服务让我们很不满意。' },
  { intent: '技术问题', text: '后台登录一直报错，麻烦帮忙看一下。' },
]

const REGEN_SUFFIXES = ['（更简洁的版本）', '（更强调数据依据的版本）', '（更委婉的版本）']

export default function ActionCard({ action, customerName }: { action: ActionRecord; customerName?: string }) {
  const { dispatch } = useAppStore()
  const { canApprove } = useRole()
  const [showReply, setShowReply] = useState(false)
  const [showReview, setShowReview] = useState(false)
  const style = actionStatusStyle[action.status]
  const [regenN, setRegenN] = useState(0)

  function regenerate() {
    const next = (regenN + 1) % REGEN_SUFFIXES.length
    setRegenN(next)
    dispatch({ kind: 'REGENERATE', actionId: action.id, content: `${action.content.split('（')[0]}${REGEN_SUFFIXES[next]}` })
  }

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

      <div className="mt-2 rounded-lg bg-slate-50 p-3 text-sm leading-relaxed text-slate-600">{action.content}</div>

      <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-slate-400 sm:grid-cols-4">
        <div>目标对象：{action.target}</div>
        <div>渠道：{action.channel}</div>
        <div>负责人：{action.owner}</div>
        <div>复查时间：{new Date(action.reviewAt).toLocaleDateString()}</div>
      </div>

      {action.customerReply && (
        <div className="mt-2 rounded-lg border border-violet-100 bg-violet-50/60 p-3 text-sm text-slate-700">
          <span className="text-xs font-medium text-violet-600">客户回复（{action.customerReply.intent}）：</span>
          {action.customerReply.text}
        </div>
      )}

      {!canApprove && !['已完成', '已取消'].includes(action.status) && (
        <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-400">
          系统管理员无业务审批权限，需由 CSM / 销售 / 主管确认执行。
        </div>
      )}

      <div
        className={`mt-3 flex flex-wrap items-center gap-2 ${
          !canApprove && !['已完成', '已取消'].includes(action.status) ? 'hidden' : ''
        }`}
      >
        {action.status === '待确认' && (
          <>
            <button
              onClick={() => dispatch({ kind: 'APPROVE', actionId: action.id })}
              className="flex items-center gap-1 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-700"
            >
              <CheckCircle2 size={13} />
              人工确认授权
            </button>
            {!action.needsApproval && (
              <button
                onClick={() => dispatch({ kind: 'EXECUTE', actionId: action.id })}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                直接执行（低风险内部动作）
              </button>
            )}
            <button
              onClick={() => dispatch({ kind: 'CANCEL', actionId: action.id, reason: '人工判断当前无需处理' })}
              className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs text-slate-400 hover:text-rose-500"
            >
              <XCircle size={13} />
              取消
            </button>
          </>
        )}

        {action.status === '已批准' && (
          <button
            onClick={() => dispatch({ kind: 'EXECUTE', actionId: action.id })}
            className="rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-sky-700"
          >
            执行动作
          </button>
        )}

        {action.type === '客户触达' && (action.status === '待确认' || action.status === '已批准') && (
          <button onClick={regenerate} className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-50">
            <RefreshCcw size={13} />
            重新生成
          </button>
        )}

        {action.status === '等待客户结果' && !action.customerReply && (
          <div className="w-full">
            <button
              onClick={() => setShowReply((v) => !v)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              模拟客户回复
            </button>
            {showReply && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {REPLY_INTENTS.map((r) => (
                  <button
                    key={r.intent}
                    onClick={() => {
                      dispatch({ kind: 'REPLY', actionId: action.id, intent: r.intent, text: r.text })
                      setShowReply(false)
                    }}
                    className="rounded-full border border-slate-200 px-2.5 py-1 text-[11px] text-slate-600 hover:border-violet-300 hover:bg-violet-50"
                  >
                    {r.intent}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {action.status === '已收到结果' && (
          <div className="w-full">
            <button
              onClick={() => setShowReview((v) => !v)}
              className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700"
            >
              进行复查
            </button>
            {showReview && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                <button
                  onClick={() => dispatch({ kind: 'REVIEW', actionId: action.id, outcome: 'improved' })}
                  className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-100"
                >
                  风险降低 / 已改善
                </button>
                <button
                  onClick={() => dispatch({ kind: 'REVIEW', actionId: action.id, outcome: 'no-change' })}
                  className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700 hover:bg-amber-100"
                >
                  暂无明显改善
                </button>
                <button
                  onClick={() => dispatch({ kind: 'REVIEW', actionId: action.id, outcome: 'escalate' })}
                  className="flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-medium text-rose-700 hover:bg-rose-100"
                >
                  <ShieldAlert size={12} />
                  需升级人工
                </button>
              </div>
            )}
          </div>
        )}

        {action.status === '需升级' && (
          <span className="flex items-center gap-1 text-xs font-medium text-rose-600">
            <ShieldAlert size={13} />
            已标记升级，下一轮扫描将生成后续动作
          </span>
        )}

        {(action.status === '已完成' || action.status === '已取消') && (
          <span className="text-xs text-slate-400">该动作已结束</span>
        )}
      </div>

      <details className="mt-3">
        <summary className="cursor-pointer text-[11px] text-slate-400">历史记录（{action.history.length}）</summary>
        <ul className="mt-1.5 space-y-1 border-l border-slate-100 pl-3">
          {action.history.map((h, i) => (
            <li key={i} className="text-[11px] text-slate-400">
              <span className="text-slate-500">{new Date(h.at).toLocaleString()}</span> — {h.note}
            </li>
          ))}
        </ul>
      </details>
    </div>
  )
}
