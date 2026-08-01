import { ActionRecord, CustomerRecord, SignalEvent } from '../types'
import { computeHealth } from './health'
import { buildFollowupSignals, buildMetricSignals } from './signals'

const OUTCOME_SCORE: Record<NonNullable<ActionRecord['reviewOutcome']>, number> = {
  improved: 88,
  'no-change': 45,
  escalate: 25,
}

export function getActionScore(customerId: string, actions: ActionRecord[]): number | null {
  const reviewed = actions.filter((a) => a.customerId === customerId && a.reviewOutcome)
  if (reviewed.length === 0) return null
  const sum = reviewed.reduce((acc, a) => acc + OUTCOME_SCORE[a.reviewOutcome!], 0)
  return Math.round(sum / reviewed.length)
}

export interface CustomerView {
  customer: CustomerRecord
  signals: SignalEvent[]
  health: ReturnType<typeof computeHealth>
}

export function buildCustomerView(customer: CustomerRecord, allActions: ActionRecord[]): CustomerView {
  const signals = [...buildMetricSignals(customer), ...buildFollowupSignals(customer, allActions)]
  const actionScore = getActionScore(customer.id, allActions)
  const health = computeHealth(customer, actionScore)
  return { customer, signals, health }
}

/** 跨客户优先级排序：风险等级 → 续费紧迫性 → 健康度 */
export function priorityRank(views: CustomerView[]): CustomerView[] {
  const order = { 高风险: 0, 预警: 1, 稳定: 2 } as const
  return [...views].sort((a, b) => {
    if (order[a.health.level] !== order[b.health.level]) return order[a.health.level] - order[b.health.level]
    if (a.customer.daysToRenewal !== b.customer.daysToRenewal) return a.customer.daysToRenewal - b.customer.daysToRenewal
    return a.health.score - b.health.score
  })
}
