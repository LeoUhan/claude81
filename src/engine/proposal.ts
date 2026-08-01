import { ActionRecord, CustomerRecord, HealthResult, SignalEvent } from '../types'
import { peerBenchmarks } from '../data/peers'

export interface DiagnosisItem {
  issue: string
  evidence: string
  severity: 'high' | 'medium' | 'low'
}

export interface PeerComparison {
  peerName: string
  peerNote: string
  certifications: { mine: number; peer: number }
  caseStudyCount: { mine: number; peer: number }
}

export interface ProposalDoc {
  customerName: string
  domain: string
  industry: string
  preparedDate: string
  preparedBy: string
  scopeTitle: string
  healthScore: number
  riskLevel: string
  churnProbability: number
  daysToRenewal: number
  trafficTrendPct: number
  inquiryTrendPct: number
  diagnosis: DiagnosisItem[]
  peerComparison: PeerComparison | null
  recommendationTitle: string
  recommendationSteps: string[]
  expectedImpact: string
  reviewDate: string
}

const SEVERITY_BY_CONFIDENCE: Record<SignalEvent['confidence'], DiagnosisItem['severity']> = {
  高: 'high',
  中: 'medium',
  低: 'low',
}

/** 把动作正文拆成可视化的行动步骤：优先按编号/换行拆分，没有结构就整段作为单步 */
const STEP_MARKER = /[0-9]+[).、）]/g

function splitSteps(content: string): string[] {
  const markers = [...content.matchAll(STEP_MARKER)]
  if (markers.length > 1) {
    const steps: string[] = []
    for (let i = 0; i < markers.length; i++) {
      const start = markers[i].index! + markers[i][0].length
      const end = i + 1 < markers.length ? markers[i + 1].index! : content.length
      const step = content.slice(start, end).trim()
      if (step) steps.push(step)
    }
    return steps
  }
  const lines = content.split('\n').map((l) => l.trim()).filter(Boolean)
  if (lines.length > 1) return lines.slice(0, 5)
  return [content.trim()]
}

export function buildProposalDoc(
  action: ActionRecord,
  customer: CustomerRecord,
  signals: SignalEvent[],
  health: HealthResult,
  churnProbability: number,
): ProposalDoc {
  const peer = peerBenchmarks.find((p) => p.industry === customer.industry)
  const peerComparison: PeerComparison | null =
    peer && signals.some((s) => s.type === '同行落后')
      ? {
          peerName: peer.peerName,
          peerNote: peer.note,
          certifications: { mine: customer.metrics.certifications.length, peer: peer.certifications.length },
          caseStudyCount: { mine: customer.metrics.caseStudyCount, peer: peer.caseStudyCount },
        }
      : null

  return {
    customerName: customer.name,
    domain: customer.domain,
    industry: customer.industry,
    preparedDate: new Date().toLocaleDateString('zh-CN'),
    preparedBy: action.owner,
    scopeTitle: `${customer.name} · 网站运营诊断与改进方案`,
    healthScore: health.score,
    riskLevel: health.level,
    churnProbability,
    daysToRenewal: customer.daysToRenewal,
    trafficTrendPct: customer.metrics.trafficTrendPct,
    inquiryTrendPct: customer.metrics.inquiryTrendPct,
    diagnosis: signals.length
      ? signals.map((s) => ({ issue: s.text, evidence: s.evidence, severity: SEVERITY_BY_CONFIDENCE[s.confidence] }))
      : [{ issue: '当前未发现明显异常信号', evidence: '基于最近一次数据同步结果', severity: 'low' }],
    peerComparison,
    recommendationTitle: action.purpose,
    recommendationSteps: splitSteps(action.content),
    expectedImpact: action.expectedMetric,
    reviewDate: new Date(action.reviewAt).toLocaleDateString('zh-CN'),
  }
}
