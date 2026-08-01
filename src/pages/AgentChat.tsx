import { useEffect, useRef, useState } from 'react'
import { Sparkles, Send, User } from 'lucide-react'
import Topbar from '../components/Topbar'
import ActionCard from '../components/ActionCard'
import { useAppStore } from '../store/AppStore'
import { useRole } from '../store/RoleContext'
import { answerQuery } from '../engine/chat'
import { customerSeed } from '../data/seed'

interface Message {
  id: string
  role: 'user' | 'agent'
  text: string
  pending?: boolean
  customerId?: string
  actionId?: string
  suggestions?: string[]
}

const STEPS = ['信号扫描', '证据关联', '风险判断', '动作建议']

function ThinkingBubble() {
  const [step, setStep] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % STEPS.length), 380)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="flex items-center gap-2 text-xs text-slate-400">
      <span className="flex h-2 w-2 animate-ping rounded-full bg-violet-400" />
      Agent 正在{STEPS[step]}…
    </div>
  )
}

let msgCounter = 0
function mid() {
  msgCounter += 1
  return `msg-${Date.now()}-${msgCounter}`
}

const WELCOME: Message = {
  id: mid(),
  role: 'agent',
  text:
    '你好，我是 Value-Guard Agent。我可以帮你排查客户风险、解释判断依据、生成触达文案或页面优化建议，并推进到执行与复查。直接说客户名字，或者试试下面的问题。',
  suggestions: ['当前最该处理的客户有哪些？', '哪些客户临近续费？', '本周期效能怎么样？', '帮我看看 A 客户'],
}

export default function AgentChat() {
  const { state, dispatch } = useAppStore()
  const { ownerScope } = useRole()
  const [messages, setMessages] = useState<Message[]>([WELCOME])
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed) return
    const userMsg: Message = { id: mid(), role: 'user', text: trimmed }
    const pendingId = mid()
    setMessages((m) => [...m, userMsg, { id: pendingId, role: 'agent', text: '', pending: true }])
    setInput('')

    setTimeout(() => {
      const answer = answerQuery(trimmed, state.actions, state.events, ownerScope)
      if (answer.draftAction) {
        dispatch({ kind: 'ADD_ACTION', action: answer.draftAction })
      }
      setMessages((m) =>
        m.map((msg) =>
          msg.id === pendingId
            ? {
                ...msg,
                pending: false,
                text: answer.text,
                customerId: answer.customerId,
                actionId: answer.draftAction?.id ?? answer.existingActionId,
                suggestions: answer.suggestions,
              }
            : msg,
        ),
      )
    }, 900)
  }

  return (
    <div className="flex h-screen flex-col">
      <Topbar title="Agent 对话" subtitle="与 Value-Guard Agent 对话，识别风险、生成动作、一键推进" />
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col overflow-hidden px-6 py-4">
        <div className="flex-1 space-y-4 overflow-y-auto pr-1">
          {messages.map((m) => (
            <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  m.role === 'agent' ? 'bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white' : 'bg-slate-200 text-slate-500'
                }`}
              >
                {m.role === 'agent' ? <Sparkles size={15} /> : <User size={15} />}
              </div>
              <div className={`max-w-[80%] space-y-2 ${m.role === 'user' ? 'items-end text-right' : ''}`}>
                <div
                  className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    m.role === 'agent' ? 'bg-white border border-slate-200 text-slate-700' : 'bg-violet-600 text-white'
                  }`}
                >
                  {m.pending ? (
                    <ThinkingBubble />
                  ) : (
                    m.text.split('\n').map((line, i) => <p key={i}>{line}</p>)
                  )}
                </div>

                {!m.pending && m.actionId && (
                  <div className="text-left">
                    {(() => {
                      const action = state.actions.find((a) => a.id === m.actionId)
                      const customer = customerSeed.find((c) => c.id === m.customerId)
                      return action ? <ActionCard action={action} customerName={customer?.name} /> : null
                    })()}
                  </div>
                )}

                {!m.pending && m.suggestions && m.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {m.suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-500 hover:border-violet-300 hover:text-violet-600"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            send(input)
          }}
          className="mt-3 flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1.5 shadow-sm"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="问问 Agent，例如：帮我看看 A 客户 / 有哪些客户临近续费"
            className="flex-1 bg-transparent px-2 text-sm text-slate-700 outline-none placeholder:text-slate-300"
          />
          <button
            type="submit"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 text-white transition hover:bg-violet-700"
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  )
}
