import { createContext, useContext, useMemo, useState } from 'react'
import { answerQuery } from '../engine/chat'
import { useAppStore } from './AppStore'
import { useRole } from './RoleContext'

export interface Message {
  id: string
  role: 'user' | 'agent'
  text: string
  pending?: boolean
  customerId?: string
  actionId?: string
  suggestions?: string[]
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

interface AgentCtx {
  messages: Message[]
  send: (text: string) => void
  isDrawerOpen: boolean
  openDrawer: (seedText?: string) => void
  closeDrawer: () => void
}

const Ctx = createContext<AgentCtx | null>(null)

export function AgentProvider({ children }: { children: React.ReactNode }) {
  const { state, dispatch } = useAppStore()
  const { ownerScope } = useRole()
  const [messages, setMessages] = useState<Message[]>([WELCOME])
  const [isDrawerOpen, setDrawerOpen] = useState(false)

  function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed) return
    const userMsg: Message = { id: mid(), role: 'user', text: trimmed }
    const pendingId = mid()
    setMessages((m) => [...m, userMsg, { id: pendingId, role: 'agent', text: '', pending: true }])

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

  function openDrawer(seedText?: string) {
    setDrawerOpen(true)
    if (seedText) send(seedText)
  }

  function closeDrawer() {
    setDrawerOpen(false)
  }

  const value = useMemo(() => ({ messages, send, isDrawerOpen, openDrawer, closeDrawer }), [messages, isDrawerOpen])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAgent() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAgent 必须在 AgentProvider 内使用')
  return ctx
}
