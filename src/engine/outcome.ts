import { ActionRecord, CustomerRecord } from '../types'
import { computeHealth } from './health'
import { getActionScore } from './selectors'

export type OutcomeStatus = '已续费' | '已流失' | '观察中'

export const CSM_NAMES: Record<string, string> = {
  'CSM-001': '陈雨桐',
  'CSM-002': '林哲',
  'CSM-003': '王梦琪',
}

export function csmName(owner: string) {
  return CSM_NAMES[owner] ?? owner
}

export interface CustomerOutcome {
  customer: CustomerRecord
  outcome: OutcomeStatus
  beforeScore: number
  afterScore: number
  lastReviewAt: string | null
}

/**
 * 结果状态由该客户全部动作的复查结论（reviewOutcome）推导，取时间上最新一次复查的结论：
 * improved → 已续费（风险已解除），escalate → 已流失（需升级仍未解决），
 * 其余（no-change 或尚无复查记录）→ 观察中。
 */
export function computeCustomerOutcome(customerId: string, actions: ActionRecord[]): { outcome: OutcomeStatus; lastReviewAt: string | null } {
  const reviewed = actions
    .filter((a) => a.customerId === customerId && a.reviewOutcome)
    .map((a) => ({ outcome: a.reviewOutcome!, at: a.history[a.history.length - 1]?.at ?? a.createdAt }))
    .sort((a, b) => a.at.localeCompare(b.at))

  if (reviewed.length === 0) return { outcome: '观察中', lastReviewAt: null }

  const latest = reviewed[reviewed.length - 1]
  const outcome: OutcomeStatus = latest.outcome === 'improved' ? '已续费' : latest.outcome === 'escalate' ? '已流失' : '观察中'
  return { outcome, lastReviewAt: latest.at }
}

export function buildCustomerOutcome(customer: CustomerRecord, actions: ActionRecord[]): CustomerOutcome {
  const { outcome, lastReviewAt } = computeCustomerOutcome(customer.id, actions)
  const beforeScore = computeHealth(customer, null).score
  const actionScore = getActionScore(customer.id, actions)
  const afterScore = computeHealth(customer, actionScore).score
  return { customer, outcome, beforeScore, afterScore, lastReviewAt }
}

export function buildCustomerOutcomes(customers: CustomerRecord[], actions: ActionRecord[]): CustomerOutcome[] {
  return customers.map((c) => buildCustomerOutcome(c, actions))
}

export interface CsmSummary {
  owner: string
  name: string
  customerCount: number
  renewed: number
  churned: number
  observing: number
  renewalRate: number
  completionRate: number
  avgReviewHours: number | null
}

function hoursBetween(a: string, b: string) {
  return Math.max(0, (new Date(b).getTime() - new Date(a).getTime()) / 3_600_000)
}

export function buildCsmSummary(owner: string, customers: CustomerRecord[], actions: ActionRecord[]): CsmSummary {
  const owned = customers.filter((c) => c.owner === owner)
  const outcomes = owned.map((c) => computeCustomerOutcome(c.id, actions).outcome)
  const renewed = outcomes.filter((o) => o === '已续费').length
  const churned = outcomes.filter((o) => o === '已流失').length
  const observing = outcomes.length - renewed - churned
  const resolved = renewed + churned
  const renewalRate = resolved > 0 ? Math.round((renewed / resolved) * 100) : 0

  const ownedActions = actions.filter((a) => owned.some((c) => c.id === a.customerId) && a.status !== '已取消')
  const completionRate = ownedActions.length > 0
    ? Math.round((ownedActions.filter((a) => a.status === '已完成').length / ownedActions.length) * 100)
    : 0

  const reviewed = ownedActions.filter((a) => a.reviewOutcome)
  const avgReviewHours = reviewed.length > 0
    ? Math.round(
        reviewed.reduce((sum, a) => sum + hoursBetween(a.createdAt, a.history[a.history.length - 1]?.at ?? a.createdAt), 0) /
          reviewed.length,
      )
    : null

  return {
    owner,
    name: csmName(owner),
    customerCount: owned.length,
    renewed,
    churned,
    observing,
    renewalRate,
    completionRate,
    avgReviewHours,
  }
}

export const CUSTOMER_FACING_TYPES = ['客户触达', '页面优化', '询盘修复', '续费复盘'] as const

export interface ConversionStat {
  type: (typeof CUSTOMER_FACING_TYPES)[number]
  total: number
  converted: number
  rate: number
}

export function buildConversionStats(actions: ActionRecord[]): ConversionStat[] {
  return CUSTOMER_FACING_TYPES.map((type) => {
    const typeActions = actions.filter((a) => a.type === type && a.status !== '已取消')
    const converted = typeActions.filter((a) => a.reviewOutcome === 'improved' || a.status === '已完成').length
    const rate = typeActions.length > 0 ? Math.round((converted / typeActions.length) * 100) : 0
    return { type, total: typeActions.length, converted, rate }
  }).filter((s) => s.total > 0)
}
