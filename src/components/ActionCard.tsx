import { useState } from 'react'
import { CheckCircle2, Clock, Loader2, Pencil, RefreshCcw, Send, ShieldAlert, XCircle } from 'lucide-react'
import { ActionRecord, OutreachChannel } from '../types'
import { actionStatusStyle, actionTypeStyle } from '../ui/styles'
import { useAppStore, customerSeed } from '../store/AppStore'
import { useRole } from '../store/RoleContext'
import { buildCustomerView } from '../engine/selectors'
import { OUTREACH_CHANNELS, buildOutreachContent } from '../engine/outreachContent'
import ActionContentPreview from './ActionContentPreview'

const REPLY_INTENTS: { intent: string; text: string; sentiment: number }[] = [
  { intent: '积极意向', text: '好的，麻烦帮我们看看，我们也想把网站利用起来。', sentiment: 0.8 },
  { intent: '观望', text: '再看看吧，最近这块不是我们重点。', sentiment: 0 },
  { intent: '异议', text: '说实话感觉最近效果一般，这个费用是不是有点高了。', sentiment: -0.4 },
  { intent: '投诉升级', text: '之前反馈的问题一直没解决，这次服务让我们很不满意。', sentiment: -0.9 },
  { intent: '技术问题', text: '后台登录一直报错，麻烦帮忙看一下。', sentiment: -0.2 },
]

const REVIEW_LABEL: Record<'improved' | 'no-change' | 'escalate', string> = {
  improved: '风险降低 / 已改善',
  'no-change': '暂无明显改善',
  escalate: '需升级人工',
}

export default function ActionCard({ action, customerName }: { action: ActionRecord; customerName?: string }) {
  const { state, dispatch } = useAppStore()
  const { canApprove } = useRole()
  const [showReply, setShowReply] = useState(false)
  const style = actionStatusStyle[action.status]
  const typeStyle = actionTypeStyle[action.type]
  const [editing, setEditing] = useState(false)
  const [draftText, setDraftText] = useState(action.content)
  const [sending, setSending] = useState(false)
  const [justSent, setJustSent] = useState(false)
  const [reviewStage, setReviewStage] = useState<'idle' | 'loading' | 'confirm'>('idle')
  const [reviewSnapshot, setReviewSnapshot] = useState<ReturnType<typeof buildCustomerView>['health'] | null>(null)
  const isOutreach = action.type === '客户触达'
  const customer = customerSeed.find((c) => c.id === action.customerId)

  function regenerate() {
    if (!customer || !action.outreachScenario) return
    const nextVariant = (action.variantIndex ?? 0) + 1
    const content = buildOutreachContent(action.outreachScenario, action.channel as OutreachChannel, nextVariant, customer)
    dispatch({ kind: 'REGENERATE', actionId: action.id, content })
  }

  function switchChannel(channel: OutreachChannel) {
    if (!customer || !action.outreachScenario || channel === action.channel) return
    const content = buildOutreachContent(action.outreachScenario, channel, 0, customer)
    dispatch({ kind: 'SET_CHANNEL', actionId: action.id, channel, content, variantIndex: 0 })
  }

  function startEdit() {
    setDraftText(action.content)
    setEditing(true)
  }

  function saveEdit() {
    dispatch({ kind: 'EDIT', actionId: action.id, content: draftText })
    setEditing(false)
  }

  function sendWithCeremony() {
    setSending(true)
    setTimeout(() => {
      dispatch({ kind: 'EXECUTE', actionId: action.id })
      setSending(false)
      setJustSent(true)
      setTimeout(() => setJustSent(false), 2200)
    }, 1300)
  }

  function startReview() {
    setReviewStage('loading')
    setTimeout(() => {
      if (customer) {
        const view = buildCustomerView(customer, state.actions)
        setReviewSnapshot(view.health)
      }
      setReviewStage('confirm')
    }, 1300)
  }

  function confirmReview(outcome: 'improved' | 'no-change' | 'escalate') {
    dispatch({ kind: 'REVIEW', actionId: action.id, outcome })
    setReviewStage('idle')
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${typeStyle.badgeBg} ${typeStyle.badgeText}`}>{action.type}</span>
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${style.bg} ${style.text}`}>{action.status}</span>
        {customerName && <span className="text-xs text-slate-400">{customerName}</span>}
        <span className="ml-auto flex items-center gap-1 text-[11px] text-slate-400">
          <Clock size={12} />
          截止 {new Date(action.deadline).toLocaleDateString()}
        </span>
      </div>

      <p className="mt-2 text-sm font-medium text-slate-800">{action.purpose}</p>
      <p className="mt-1 text-xs text-slate-400">触发原因：{action.triggerReason}</p>

      {isOutreach && !editing && (action.status === '待确认' || action.status === '已批准') && (
        <div className="mt-2 flex items-center gap-1.5">
          <span className="text-[11px] text-slate-400">联系渠道：</span>
          {OUTREACH_CHANNELS.map((ch) => (
            <button
              key={ch}
              onClick={() => switchChannel(ch)}
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
                action.channel === ch ? 'text-white' : 'border border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
              style={action.channel === ch ? { background: typeStyle.accent } : undefined}
            >
              {ch}
            </button>
          ))}
        </div>
      )}

      <div className="mt-2">
        {editing ? (
          <div className="rounded-xl border border-violet-200 bg-violet-50/40 p-3">
            <textarea
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              rows={5}
              className="w-full resize-none rounded-lg border border-slate-200 bg-white p-2.5 text-sm text-slate-700 outline-none focus:border-violet-400"
            />
            <div className="mt-2 flex gap-2">
              <button
                onClick={saveEdit}
                className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-700"
              >
                保存文案
              </button>
              <button
                onClick={() => setEditing(false)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-50"
              >
                取消
              </button>
            </div>
          </div>
        ) : (
          <ActionContentPreview action={action} />
        )}

        {justSent && isOutreach && (
          <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
            <CheckCircle2 size={13} />
            已送达 · {new Date().toLocaleTimeString()}
          </div>
        )}
      </div>

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
          editing || (!canApprove && !['已完成', '已取消'].includes(action.status)) ? 'hidden' : ''
        }`}
      >
        {action.status === '待确认' && (
          <>
            <button
              onClick={() => dispatch({ kind: 'APPROVE', actionId: action.id })}
              className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-white opacity-95 hover:opacity-100"
              style={{ background: typeStyle.accent }}
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

        {action.status === '已批准' && !isOutreach && (
          <button
            onClick={() => dispatch({ kind: 'EXECUTE', actionId: action.id })}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-white opacity-95 hover:opacity-100"
            style={{ background: typeStyle.accent }}
          >
            执行动作
          </button>
        )}

        {action.status === '已批准' && isOutreach && !editing && (
          <button
            onClick={sendWithCeremony}
            disabled={sending}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-white opacity-95 hover:opacity-100 disabled:opacity-70"
            style={{ background: typeStyle.accent }}
          >
            {sending ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
            {sending ? '发送中…' : '确认发送'}
          </button>
        )}

        {isOutreach && (action.status === '待确认' || action.status === '已批准') && !editing && (
          <>
            <button onClick={startEdit} className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-50">
              <Pencil size={13} />
              编辑文案
            </button>
            <button onClick={regenerate} className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-50">
              <RefreshCcw size={13} />
              换一版
            </button>
          </>
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
                      dispatch({ kind: 'REPLY', actionId: action.id, intent: r.intent, text: r.text, sentiment: r.sentiment })
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
            {reviewStage === 'idle' && (
              <button onClick={startReview} className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700">
                进行复查
              </button>
            )}

            {reviewStage === 'loading' && (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Loader2 size={14} className="animate-spin text-slate-400" />
                复查中…正在重新读取客户最新信号与健康度
              </div>
            )}

            {reviewStage === 'confirm' && reviewSnapshot && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-medium text-slate-600">复查依据（本次重新计算的结果）</p>
                <p className="mt-1 text-sm text-slate-700">
                  当前健康度 <span className="font-semibold">{reviewSnapshot.score}</span> 分（{reviewSnapshot.level}）
                </p>
                <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-slate-500">
                  {reviewSnapshot.factors.slice(0, 3).map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
                <p className="mt-2 text-[11px] text-slate-400">
                  预期观察指标：{action.expectedMetric}。请基于以上依据判断本次动作是否达到预期。
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {(['improved', 'no-change', 'escalate'] as const).map((outcome) => (
                    <button
                      key={outcome}
                      onClick={() => confirmReview(outcome)}
                      className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                        outcome === 'improved'
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : outcome === 'no-change'
                            ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                            : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                      }`}
                    >
                      {outcome === 'escalate' && <ShieldAlert size={12} />}
                      {REVIEW_LABEL[outcome]}
                    </button>
                  ))}
                </div>
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
