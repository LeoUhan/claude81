import { CustomerRecord, HealthResult, SignalEvent } from '../types'

/**
 * 流失概率 = f(健康度, 续费紧迫性, 并发负面信号数量)。
 * 不是健康度简单取反：同样 58 分，距到期 10 天 和 距到期 120 天的紧迫性完全不同。
 * 上下限收在 1~97，不宣称绝对确定（0% 或 100%）。
 */
export function computeChurnProbability(customer: CustomerRecord, health: HealthResult, signals: SignalEvent[]): number {
  const base = 100 - health.score
  const urgency = customer.daysToRenewal <= 30 ? 1.25 : customer.daysToRenewal <= 90 ? 1.1 : 1.0
  const negativeSignals = signals.filter((s) => s.type !== '持续价值').length
  const compounding = 1 + Math.min(0.3, Math.max(0, negativeSignals - 1) * 0.06)
  const raw = base * urgency * compounding
  return Math.max(1, Math.min(97, Math.round(raw)))
}
