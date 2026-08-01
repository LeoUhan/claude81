import { useEffect, useRef, useState } from 'react'
import { Sparkles, Send, User } from 'lucide-react'
import ActionCard from './ActionCard'
import { useAgent } from '../store/AgentContext'
import { useAppStore } from '../store/AppStore'
import { customerSeed } from '../data/seed'

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

export default function AgentThread({ compact = false }: { compact?: boolean }) {
  const { messages, send } = useAgent()
  const { state } = useAppStore()
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className={`flex h-full flex-col ${compact ? '' : 'mx-auto w-full max-w-3xl'}`}>
      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 pr-2">
        {messages.map((m) => (
          <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                m.role === 'agent' ? 'bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white' : 'bg-slate-200 text-slate-500'
              }`}
            >
              {m.role === 'agent' ? <Sparkles size={15} /> : <User size={15} />}
            </div>
            <div className={`max-w-[85%] space-y-2 ${m.role === 'user' ? 'items-end text-right' : ''}`}>
              <div
                className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === 'agent' ? 'border border-slate-200 bg-white text-slate-700' : 'bg-violet-600 text-white'
                }`}
              >
                {m.pending ? <ThinkingBubble /> : m.text.split('\n').map((line, i) => <p key={i}>{line}</p>)}
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
          setInput('')
        }}
        className="mx-4 mb-4 flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1.5 shadow-sm"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="问问 Agent，例如：帮我看看 A 客户 / 有哪些客户临近续费"
          className="flex-1 bg-transparent px-2 text-sm text-slate-700 outline-none placeholder:text-slate-300"
        />
        <button
          type="submit"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-600 text-white transition hover:bg-violet-700"
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  )
}
