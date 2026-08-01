import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import { ActionRecord, EventLogItem } from '../types'
import { customerSeed } from '../data/seed'
import { buildCustomerView } from '../engine/selectors'
import { generateActionsForCustomer, generateReplyFollowup } from '../engine/actions'

interface State {
  actions: ActionRecord[]
  events: EventLogItem[]
  lastScanAt: string | null
}

const STORAGE_KEY = 'value-guard-state-v4'

let eventCounter = 0
function logEvent(events: EventLogItem[], kind: string, detail: string, customerId?: string, actionId?: string) {
  eventCounter += 1
  events.push({ id: `evt-${Date.now()}-${eventCounter}`, at: new Date().toISOString(), kind, detail, customerId, actionId })
}

function runScan(state: State): State {
  const actions = [...state.actions]
  const events = [...state.events]
  for (const customer of customerSeed) {
    const view = buildCustomerView(customer, actions)
    if (view.signals.length > 0) {
      logEvent(events, 'signal_detected', `识别到 ${view.signals.length} 个信号，健康度 ${view.health.score}（${view.health.level}）`, customer.id)
    }
    const drafts = generateActionsForCustomer(customer, view.signals, actions)
    for (const d of drafts) {
      actions.push(d)
      logEvent(events, 'action_created', `生成动作：${d.purpose}`, customer.id, d.id)
    }
  }
  return { actions, events, lastScanAt: new Date().toISOString() }
}

type Action =
  | { kind: 'SCAN' }
  | { kind: 'APPROVE'; actionId: string }
  | { kind: 'EXECUTE'; actionId: string }
  | { kind: 'REPLY'; actionId: string; intent: string; text: string; sentiment: number }
  | { kind: 'REVIEW'; actionId: string; outcome: 'improved' | 'no-change' | 'escalate' }
  | { kind: 'CANCEL'; actionId: string; reason: string }
  | { kind: 'REGENERATE'; actionId: string; content: string }
  | { kind: 'EDIT'; actionId: string; content: string }
  | { kind: 'SET_CHANNEL'; actionId: string; channel: string; content: string; variantIndex: number }
  | { kind: 'ADD_ACTION'; action: ActionRecord }
  | { kind: 'RESET' }

function updateAction(state: State, id: string, fn: (a: ActionRecord) => ActionRecord): State {
  return { ...state, actions: state.actions.map((a) => (a.id === id ? fn(a) : a)) }
}

function reducer(state: State, action: Action): State {
  const now = new Date().toISOString()
  switch (action.kind) {
    case 'SCAN':
      return runScan(state)

    case 'APPROVE':
      return updateAction(state, action.actionId, (a) => ({
        ...a,
        status: '已批准',
        history: [...a.history, { at: now, note: '人工已确认授权' }],
      }))

    case 'EXECUTE': {
      const events = [...state.events]
      const actions = state.actions.map((a) => {
        if (a.id !== action.actionId) return a
        const isOutreach = a.type === '客户触达'
        logEvent(events, 'action_executed', `动作已执行：${a.purpose}`, a.customerId, a.id)
        return {
          ...a,
          status: isOutreach ? ('等待客户结果' as const) : ('已收到结果' as const),
          history: [
            ...a.history,
            { at: now, note: isOutreach ? '消息已发送，等待客户查看/回复' : '动作已执行，结果已回流' },
          ],
        }
      })
      return { ...state, actions, events }
    }

    case 'REPLY': {
      const events = [...state.events]
      const source = state.actions.find((a) => a.id === action.actionId)
      let actions = state.actions.map((a) =>
        a.id === action.actionId
          ? {
              ...a,
              status: '已收到结果' as const,
              customerReply: { at: now, text: action.text, intent: action.intent, sentiment: action.sentiment },
              history: [...a.history, { at: now, note: `收到客户回复：${action.intent}` }],
            }
          : a,
      )
      if (source) {
        const customer = customerSeed.find((c) => c.id === source.customerId)!
        const updatedSource = actions.find((a) => a.id === action.actionId)!
        const followup = generateReplyFollowup(customer, updatedSource)
        actions = [...actions, followup]
        logEvent(events, 'customer_replied', `客户回复（${action.intent}），已生成下一步处理动作`, source.customerId, source.id)
      }
      return { ...state, actions, events }
    }

    case 'REVIEW': {
      const events = [...state.events]
      const actions = state.actions.map((a) => {
        if (a.id !== action.actionId) return a
        logEvent(events, 'review_completed', `复查完成，结论：${outcomeLabel(action.outcome)}`, a.customerId, a.id)
        return {
          ...a,
          status: action.outcome === 'improved' ? ('已完成' as const) : ('需升级' as const),
          reviewOutcome: action.outcome,
          history: [...a.history, { at: now, note: `复查结论：${outcomeLabel(action.outcome)}` }],
        }
      })
      return { ...state, actions, events }
    }

    case 'CANCEL':
      return updateAction(state, action.actionId, (a) => ({
        ...a,
        status: '已取消',
        history: [...a.history, { at: now, note: `已取消：${action.reason}` }],
      }))

    case 'REGENERATE':
      return updateAction(state, action.actionId, (a) => ({
        ...a,
        content: action.content,
        history: [...a.history, { at: now, note: '已重新生成文案（历史版本见下方记录）' }],
      }))

    case 'EDIT':
      return updateAction(state, action.actionId, (a) => ({
        ...a,
        content: action.content,
        history: [...a.history, { at: now, note: '负责人已手动修改文案' }],
      }))

    case 'SET_CHANNEL':
      return updateAction(state, action.actionId, (a) => ({
        ...a,
        channel: action.channel,
        content: action.content,
        variantIndex: action.variantIndex,
        history: [...a.history, { at: now, note: `已切换联系渠道为「${action.channel}」并重新生成文案` }],
      }))

    case 'ADD_ACTION': {
      if (state.actions.some((a) => a.id === action.action.id)) return state
      const events = [...state.events]
      logEvent(events, 'action_created', `Agent 对话生成动作：${action.action.purpose}`, action.action.customerId, action.action.id)
      return { ...state, actions: [...state.actions, action.action], events }
    }

    case 'RESET':
      localStorage.removeItem(STORAGE_KEY)
      return runScan({ actions: [], events: [], lastScanAt: null })

    default:
      return state
  }
}

function outcomeLabel(o: 'improved' | 'no-change' | 'escalate') {
  return { improved: '风险降低，问题已改善', 'no-change': '暂无明显改善，需继续处理', escalate: '需升级人工介入' }[o]
}

function loadInitial(): State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as State
  } catch {
    // ignore corrupted storage
  }
  return runScan({ actions: [], events: [], lastScanAt: null })
}

interface Ctx {
  state: State
  dispatch: React.Dispatch<Action>
}

const AppContext = createContext<Ctx | null>(null)

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadInitial)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const value = useMemo(() => ({ state, dispatch }), [state])
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppStore() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppStore 必须在 AppStoreProvider 内使用')
  return ctx
}

export { customerSeed }
