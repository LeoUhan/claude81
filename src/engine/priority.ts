import { CustomerView } from './selectors'
import { SignalType } from '../types'

export type PriorityCategory = '合同' | '网站' | '平台' | '正向' | '跟进'

const CATEGORY_BY_SIGNAL: Record<SignalType, PriorityCategory> = {
  续费窗口临近: '合同',
  触达未回复: '跟进',
  询盘异常: '网站',
  同行落后: '网站',
  流量下滑: '网站',
  运营停滞: '平台',
  优化未见效: '跟进',
  持续价值: '正向',
}

// 数字越小越优先展示在队列顶部
const SIGNAL_PRIORITY: SignalType[] = [
  '续费窗口临近',
  '触达未回复',
  '同行落后',
  '询盘异常',
  '运营停滞',
  '优化未见效',
  '流量下滑',
  '持续价值',
]

export interface PriorityItem {
  customerId: string
  customerName: string
  shortName: string
  category: PriorityCategory
  reason: string
  daysToRenewal: number
  churnProbability: number
  level: CustomerView['health']['level']
}

/** 挑出每个客户最值得展示的一条信号，作为优先队列的分类和理由 */
export function buildPriorityQueue(views: CustomerView[]): PriorityItem[] {
  const items: PriorityItem[] = []

  for (const v of views) {
    if (v.signals.length === 0) continue
    const dominant = [...v.signals].sort(
      (a, b) => SIGNAL_PRIORITY.indexOf(a.type) - SIGNAL_PRIORITY.indexOf(b.type),
    )[0]

    items.push({
      customerId: v.customer.id,
      customerName: v.customer.name,
      shortName: v.customer.name.replace(/^\S+\s*/, ''),
      category: CATEGORY_BY_SIGNAL[dominant.type],
      reason: dominant.text,
      daysToRenewal: v.customer.daysToRenewal,
      churnProbability: v.churnProbability,
      level: v.health.level,
    })
  }

  const order = { 高风险: 0, 预警: 1, 稳定: 2 } as const
  return items.sort((a, b) => {
    if (order[a.level] !== order[b.level]) return order[a.level] - order[b.level]
    if (a.daysToRenewal !== b.daysToRenewal) return a.daysToRenewal - b.daysToRenewal
    return b.churnProbability - a.churnProbability
  })
}
