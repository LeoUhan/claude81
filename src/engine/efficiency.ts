import { ActionRecord, EventLogItem } from '../types'
import { CustomerRecord } from '../types'

export const MANUAL_BASELINE_LEAD_DAYS = 12
export const MANUAL_BASELINE_RESPONSE_HOURS = 96

export function computeEfficiency(actions: ActionRecord[], events: EventLogItem[], customers: CustomerRecord[]) {
  const signalEvents = events.filter((e) => e.kind === 'signal_detected')
  const actionCreatedEvents = events.filter((e) => e.kind === 'action_created')

  const customersWithSignal = new Set(signalEvents.map((e) => e.customerId))
  const customersWithAction = new Set(actionCreatedEvents.map((e) => e.customerId))

  const leadDays =
    customersWithSignal.size > 0
      ? Math.round(
          [...customersWithSignal].reduce((sum, id) => sum + (customers.find((c) => c.id === id)?.daysToRenewal ?? 0), 0) /
            customersWithSignal.size,
        )
      : 0

  const responseMinutes: number[] = []
  for (const cid of customersWithSignal) {
    const s = events.find((e) => e.kind === 'signal_detected' && e.customerId === cid)
    const a = events.find((e) => e.kind === 'action_created' && e.customerId === cid)
    if (s && a) responseMinutes.push(Math.max(0, (new Date(a.at).getTime() - new Date(s.at).getTime()) / 60000))
  }
  const avgResponseMinutes = responseMinutes.length
    ? Math.round(responseMinutes.reduce((s, v) => s + v, 0) / responseMinutes.length)
    : 0

  const total = actions.length
  const completed = actions.filter((a) => a.status === '已完成').length
  const outreach = actions.filter((a) => a.type === '客户触达')
  const outreachSent = outreach.filter((a) => a.status !== '待确认' && a.status !== '已批准' && a.status !== '已取消')
  const outreachReplied = outreachSent.filter((a) => a.customerReply)
  const reachedResult = actions.filter(
    (a) => a.status === '已收到结果' || a.status === '已复查' || a.status === '已完成' || a.status === '需升级',
  )
  const reviewed = actions.filter((a) => a.reviewOutcome)
  const improved = reviewed.filter((a) => a.reviewOutcome === 'improved')

  return {
    coverage: 100,
    leadDays,
    avgResponseMinutes,
    actionGenRate: customersWithSignal.size ? Math.round((customersWithAction.size / customersWithSignal.size) * 100) : 0,
    completionRate: total ? Math.round((completed / total) * 100) : 0,
    outreachSuccessRate: outreach.length ? Math.round((outreachSent.length / outreach.length) * 100) : 0,
    replyRate: outreachSent.length ? Math.round((outreachReplied.length / outreachSent.length) * 100) : 0,
    reviewCompletionRate: reachedResult.length ? Math.round((reviewed.length / reachedResult.length) * 100) : 0,
    improveRate: reviewed.length ? Math.round((improved.length / reviewed.length) * 100) : 0,
    total,
    completed,
  }
}
