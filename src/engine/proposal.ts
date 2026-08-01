import { ActionRecord, CustomerRecord, SignalEvent } from '../types'

export interface ProposalDoc {
  customerName: string
  domain: string
  industry: string
  preparedDate: string
  preparedBy: string
  scopeTitle: string
  diagnosis: { issue: string; evidence: string }[]
  recommendationTitle: string
  recommendationDetail: string
  expectedImpact: string
  reviewDate: string
}

export function buildProposalDoc(action: ActionRecord, customer: CustomerRecord, signals: SignalEvent[]): ProposalDoc {
  return {
    customerName: customer.name,
    domain: customer.domain,
    industry: customer.industry,
    preparedDate: new Date().toLocaleDateString('zh-CN'),
    preparedBy: action.owner,
    scopeTitle: `${customer.name} · 网站运营诊断与改进方案`,
    diagnosis: signals.length
      ? signals.map((s) => ({ issue: s.text, evidence: s.evidence }))
      : [{ issue: '当前未发现明显异常信号', evidence: '基于最近一次数据同步结果' }],
    recommendationTitle: action.purpose,
    recommendationDetail: action.content,
    expectedImpact: action.expectedMetric,
    reviewDate: new Date(action.reviewAt).toLocaleDateString('zh-CN'),
  }
}
