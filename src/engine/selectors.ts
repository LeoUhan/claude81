import { ActionRecord, CustomerRecord, SignalEvent, SignalType } from '../types'
import { computeHealth } from './health'
import { buildFollowupSignals, buildMetricSignals } from './signals'
import { computeChurnProbability } from './churn'

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

/** 多个信号叠加时的交叉推理：不是罗列信号，而是说明信号之间如何互相印证或加剧 */
export function buildCrossInsights(signals: SignalEvent[]): string[] {
  const types = new Set<SignalType>(signals.map((s) => s.type))
  const insights: string[] = []

  if (types.has('流量下滑') && types.has('同行落后')) {
    insights.push('流量下滑与同行内容对比同时出现，更可能是自身内容/运营问题，而非行业整体波动')
  }
  if (types.has('运营停滞') && types.has('询盘异常')) {
    insights.push('运营停滞与询盘异常同时出现，两个问题可能相互加剧，建议同时处理而非只解决一个')
  }
  if (types.has('持续价值') && types.has('续费窗口临近')) {
    insights.push('尽管价值持续兑现，仍处于续费窗口，建议主动触达而非被动等待到期')
  }
  if (types.has('触达未回复') && (types.has('询盘异常') || types.has('运营停滞'))) {
    insights.push('客户触达未获回复且业务信号仍在恶化，风险应优先于单一信号场景，建议升级处理方式')
  }
  if (types.has('优化未见效') && types.has('流量下滑')) {
    insights.push('已执行优化但流量仍未恢复，说明问题可能不在页面内容本身，需要重新排查流量来源')
  }

  return insights
}

export interface CustomerView {
  customer: CustomerRecord
  signals: SignalEvent[]
  health: ReturnType<typeof computeHealth>
  churnProbability: number
  crossInsights: string[]
}

export function buildCustomerView(customer: CustomerRecord, allActions: ActionRecord[]): CustomerView {
  const signals = [...buildMetricSignals(customer), ...buildFollowupSignals(customer, allActions)]
  const actionScore = getActionScore(customer.id, allActions)
  const health = computeHealth(customer, actionScore)
  const churnProbability = computeChurnProbability(customer, health, signals)
  const crossInsights = buildCrossInsights(signals)
  return { customer, signals, health, churnProbability, crossInsights }
}

export interface SentimentTrend {
  latest: number
  latestIntent: string
  trend: 'improving' | 'worsening' | 'flat' | 'insufficient'
  count: number
}

/** 情感趋势：不止看单次回复的意图分类，还看最近几次回复的情感分是在恶化还是转好 */
export function computeSentimentTrend(customerId: string, actions: ActionRecord[]): SentimentTrend | null {
  const replies = actions
    .filter((a) => a.customerId === customerId && a.customerReply)
    .map((a) => a.customerReply!)
    .sort((a, b) => a.at.localeCompare(b.at))

  if (replies.length === 0) return null

  const latest = replies[replies.length - 1]
  let trend: SentimentTrend['trend'] = 'insufficient'
  if (replies.length >= 2) {
    const diff = replies[replies.length - 1].sentiment - replies[replies.length - 2].sentiment
    trend = diff > 0.15 ? 'improving' : diff < -0.15 ? 'worsening' : 'flat'
  }

  return { latest: latest.sentiment, latestIntent: latest.intent, trend, count: replies.length }
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
