import { ActionRecord } from '../types'
import { CustomerView } from './selectors'

export interface HeroEvent {
  id: string
  text: string
  color: string
  at: string
}

export function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return '刚刚'
  if (mins < 60) return `${mins} 分钟前`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} 小时前`
  return `${Math.floor(hours / 24)} 天前`
}

/** 工作台 Hero 区的"实时信号流"：只用真实字段（信号文本、动作历史时间戳），不编造具体分钟数 */
export function buildHeroEvents(views: CustomerView[], actions: ActionRecord[]): HeroEvent[] {
  const nameOf = (id: string) => views.find((v) => v.customer.id === id)?.customer.name ?? id
  const events: HeroEvent[] = []

  const atRisk = views.filter((v) => v.health.level !== '稳定').sort((a, b) => b.churnProbability - a.churnProbability)
  if (atRisk[0]) {
    events.push({
      id: `risk-${atRisk[0].customer.id}`,
      text: `刚检测到 ${atRisk[0].customer.name} 流失概率跃升至 ${atRisk[0].churnProbability}%`,
      color: '#f43f5e',
      at: new Date().toISOString(),
    })
  }

  const peerGap = views.find((v) => v.signals.some((s) => s.type === '同行落后'))
  if (peerGap) {
    const signal = peerGap.signals.find((s) => s.type === '同行落后')!
    events.push({ id: `peer-${peerGap.customer.id}`, text: `${peerGap.customer.name} ${signal.text}`, color: '#a78bfa', at: signal.detectedAt })
  }

  const positive = views.find((v) => v.signals.some((s) => s.type === '持续价值'))
  if (positive) {
    const signal = positive.signals.find((s) => s.type === '持续价值')!
    events.push({ id: `value-${positive.customer.id}`, text: `${positive.customer.name} ${signal.text}`, color: '#4ade80', at: signal.detectedAt })
  }

  const recentHistory = actions
    .flatMap((a) => a.history.map((h) => ({ ...h, customerId: a.customerId })))
    .sort((a, b) => b.at.localeCompare(a.at))
  if (recentHistory[0]) {
    events.push({
      id: `hist-${recentHistory[0].customerId}-${recentHistory[0].at}`,
      text: `${nameOf(recentHistory[0].customerId)}：${recentHistory[0].note}`,
      color: '#f59e0b',
      at: recentHistory[0].at,
    })
  }

  return events.sort((a, b) => b.at.localeCompare(a.at)).slice(0, 4)
}
