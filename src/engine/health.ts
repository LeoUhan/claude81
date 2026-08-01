import { CustomerRecord, HealthResult, RiskLevel } from '../types'

export const HEALTH_WEIGHTS = {
  usage: 0.25,
  website: 0.25,
  inquiry: 0.25,
  contract: 0.15,
  action: 0.1,
} as const

export const RULE_VERSION = 'v1.0（初始建议权重，待历史数据校准）'

function clamp(n: number, min = 0, max = 100) {
  return Math.round(Math.max(min, Math.min(max, n)))
}

function usageScore(m: CustomerRecord['metrics']) {
  return clamp(100 - m.loginDaysAgo * 1.15 - Math.max(0, m.contentUpdateDaysAgo - 25) * 0.5)
}

function websiteScore(m: CustomerRecord['metrics']) {
  return clamp(62 + m.trafficTrendPct * 1.5)
}

function inquiryScore(m: CustomerRecord['metrics']) {
  let s = clamp(58 + m.inquiryTrendPct * 0.9)
  if (!m.inquiryValid) s = clamp(s - 35)
  return s
}

function contractScore(customer: CustomerRecord) {
  let s = customer.daysToRenewal < 30 ? 45 : customer.daysToRenewal < 90 ? 65 : 85
  if (customer.metrics.renewalHistory === '已续费') s += 8
  if (customer.metrics.renewalHistory === '曾降级') s -= 15
  return clamp(s)
}

/**
 * actionScore 为 null 表示尚无已完成的动作/复查数据，此时按 5.4/8.1 要求降权重算，
 * 不能把缺失维度当零分或满分处理。
 */
export function computeHealth(customer: CustomerRecord, actionScore: number | null): HealthResult {
  const usage = usageScore(customer.metrics)
  const website = websiteScore(customer.metrics)
  const inquiry = inquiryScore(customer.metrics)
  const contract = contractScore(customer)

  const dims: { key: keyof typeof HEALTH_WEIGHTS; value: number | null }[] = [
    { key: 'usage', value: usage },
    { key: 'website', value: website },
    { key: 'inquiry', value: inquiry },
    { key: 'contract', value: contract },
    { key: 'action', value: actionScore },
  ]

  const missing: string[] = []
  let weightedSum = 0
  let weightTotal = 0
  for (const d of dims) {
    if (d.value === null) {
      missing.push(labelOf(d.key))
      continue
    }
    weightedSum += d.value * HEALTH_WEIGHTS[d.key]
    weightTotal += HEALTH_WEIGHTS[d.key]
  }
  const score = Math.round(weightTotal > 0 ? weightedSum / weightTotal : 0)

  const level: RiskLevel = score >= 80 ? '稳定' : score >= 50 ? '预警' : '高风险'

  const factors: string[] = []
  if (usage < 55) factors.push('登录与内容运营活跃度偏低')
  if (website < 55) factors.push('网站访问表现走弱')
  if (inquiry < 55) factors.push('询盘量或转化质量下降')
  if (customer.daysToRenewal < 30) factors.push('合同即将到期，续费窗口紧迫')
  if (actionScore !== null && actionScore < 50) factors.push('已执行动作尚未看到明显改善')
  if (factors.length === 0) factors.push('各维度表现稳定，未发现显著风险因素')

  return {
    score,
    level,
    subScores: { usage, website, inquiry, contract, action: actionScore },
    missing,
    factors,
  }
}

function labelOf(key: keyof typeof HEALTH_WEIGHTS) {
  return { usage: '使用与运营活跃度', website: '网站表现', inquiry: '询盘与转化', contract: '合同与续费阶段', action: '动作与结果反馈' }[key]
}
