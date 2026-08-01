import { ActionRecord, CustomerRecord, SignalEvent } from '../types'

let counter = 0
function sid(customerId: string) {
  counter += 1
  return `sig-${customerId}-${counter}`
}

const now = () => new Date().toISOString()

/** 基于原始指标推导的信号，PRD 5.3 / 8.3 的典型触发条件 */
export function buildMetricSignals(c: CustomerRecord): SignalEvent[] {
  const m = c.metrics
  const signals: SignalEvent[] = []

  if (m.loginDaysAgo >= 35 && m.contentUpdateDaysAgo >= 55) {
    signals.push({
      id: sid(c.id),
      customerId: c.id,
      type: '运营停滞',
      text: `连续 ${m.loginDaysAgo} 天无后台登录，产品内容 ${m.contentUpdateDaysAgo} 天未更新`,
      evidence: `login_last_seen = ${m.loginDaysAgo} 天前；content_last_update = ${m.contentUpdateDaysAgo} 天前`,
      baseline: '团队基线：45 天无登录且内容停滞即判定运营停滞',
      confidence: '高',
      detectedAt: now(),
    })
  }

  if (m.trafficTrendPct <= -12) {
    signals.push({
      id: sid(c.id),
      customerId: c.id,
      type: '流量下滑',
      text: `网站访问量相比上一周期下降 ${Math.abs(m.trafficTrendPct)}%`,
      evidence: `traffic_trend_pct = ${m.trafficTrendPct}%`,
      baseline: '基线：上一统计周期访问量',
      confidence: m.trafficTrendPct <= -20 ? '高' : '中',
      detectedAt: now(),
    })
  }

  if (m.inquiryTrendPct <= -20 || !m.inquiryValid) {
    signals.push({
      id: sid(c.id),
      customerId: c.id,
      type: '询盘异常',
      text: !m.inquiryValid
        ? '询盘表单或联系入口疑似异常，近周期有效询盘数为 0'
        : `询盘量相比上一周期下降 ${Math.abs(m.inquiryTrendPct)}%`,
      evidence: `inquiry_count = ${m.inquiryCount}；inquiry_trend_pct = ${m.inquiryTrendPct}%；form_ok = ${m.inquiryValid}`,
      baseline: '基线：上一统计周期询盘量与表单可用性',
      confidence: !m.inquiryValid ? '高' : '中',
      detectedAt: now(),
    })
  }

  if (c.daysToRenewal <= 30) {
    signals.push({
      id: sid(c.id),
      customerId: c.id,
      type: '续费窗口临近',
      text: `距合同到期仅 ${c.daysToRenewal} 天`,
      evidence: `days_to_renewal = ${c.daysToRenewal}`,
      baseline: '基线：续费窗口阈值 30 天',
      confidence: '高',
      detectedAt: now(),
    })
  }

  if (m.trafficTrendPct >= 5 && m.inquiryTrendPct >= 5 && m.loginDaysAgo <= 7) {
    signals.push({
      id: sid(c.id),
      customerId: c.id,
      type: '持续价值',
      text: '登录活跃、访问量和询盘量同步保持增长',
      evidence: `login_last_seen = ${m.loginDaysAgo} 天前；traffic_trend_pct = ${m.trafficTrendPct}%；inquiry_trend_pct = ${m.inquiryTrendPct}%`,
      baseline: '基线：三项指标同期对比',
      confidence: '高',
      detectedAt: now(),
    })
  }

  return signals
}

/** 依赖动作历史才能判断的信号：触达未回复、优化未见效 */
export function buildFollowupSignals(c: CustomerRecord, actions: ActionRecord[]): SignalEvent[] {
  const signals: SignalEvent[] = []
  const mine = actions.filter((a) => a.customerId === c.id)

  const waitingReply = mine.find(
    (a) => a.type === '客户触达' && a.status === '等待客户结果' && !a.customerReply,
  )
  if (waitingReply) {
    const days = Math.round((Date.now() - new Date(waitingReply.createdAt).getTime()) / 86400000)
    if (days >= 7) {
      signals.push({
        id: sid(c.id),
        customerId: c.id,
        type: '触达未回复',
        text: `触达消息已发送 ${days} 天，客户尚未回复`,
        evidence: `action_id = ${waitingReply.id}；message_sent_at = ${waitingReply.createdAt}`,
        baseline: '基线：触达后 7 天未回复视为无响应',
        confidence: '高',
        detectedAt: now(),
      })
    }
  }

  const noImprove = mine.find(
    (a) => a.type === '页面优化' && a.reviewOutcome === 'no-change',
  )
  if (noImprove) {
    signals.push({
      id: sid(c.id),
      customerId: c.id,
      type: '优化未见效',
      text: '已提交页面优化，复查后指标未见改善',
      evidence: `action_id = ${noImprove.id}`,
      baseline: '基线：优化提交前的访问/询盘指标',
      confidence: '中',
      detectedAt: now(),
    })
  }

  return signals
}
