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

export type RecommendationBlock =
  | { kind: 'list'; heading: string; items: string[] }
  | { kind: 'faq'; heading: string; items: { q: string; a: string }[] }

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
  recommendationBlocks: RecommendationBlock[]
  expectedImpact: string
  reviewDate: string
}

const SEVERITY_BY_CONFIDENCE: Record<SignalEvent['confidence'], DiagnosisItem['severity']> = {
  高: 'high',
  中: 'medium',
  低: 'low',
}

/**
 * 个性化生成的硬性前提：每一条具体断言都必须能对应客户自己的真实字段值。
 * 客户没有的认证/案例，绝不能写成"已具备"；字段不满足条件时只给如实措辞或直接不生成这条。
 */

function certificationBlock(customer: CustomerRecord, peer: (typeof peerBenchmarks)[number]): RecommendationBlock {
  const held = customer.metrics.certifications
  const missing = peer.certifications.filter((c) => !held.includes(c))
  const items: string[] = []
  if (missing.length > 0) {
    items.push(`建议补充获取并展示以下认证：${missing.join('、')}（同行对标已具备，当前网站未展示）`)
  } else {
    items.push('认证展示已与同行持平，无需补充')
  }
  const gap = peer.caseStudyCount - customer.metrics.caseStudyCount
  if (gap > 0) {
    items.push(
      `建议新增 ${gap} 个案例研究（本方 ${customer.metrics.caseStudyCount} 个 vs 同行 ${peer.caseStudyCount} 个），优先选择近 6 个月完成的代表性订单，建议包含：行业背景（可脱敏）、技术选型要点、交付周期、客户反馈摘要`,
    )
  }
  return { kind: 'list', heading: '认证与案例补充建议', items }
}

function faqBlock(customer: CustomerRecord): RecommendationBlock {
  const held = customer.metrics.certifications
  const certAnswer =
    held.length > 0
      ? `目前已具备 ${held.join('、')} 认证，如需查看认证文件原件可另行提供。`
      : '认证信息暂未在网站展示，建议补充实际持有的资质文件后再上线本条回答。'

  const caseCount = customer.metrics.caseStudyCount
  const caseAnswer =
    caseCount > 0
      ? `已有 ${caseCount} 个相关行业案例，可结合具体应用场景进一步提供参考资料。`
      : '案例展示暂不充分，建议内部先补充 2-3 个代表性案例后再对外提供本条回答。'

  return {
    kind: 'faq',
    heading: '建议新增 FAQ 模块',
    items: [
      { q: '贵司是否具备相关行业认证？', a: certAnswer },
      { q: '是否有相关行业案例可供参考？', a: caseAnswer },
      { q: '是否支持定制化方案？', a: '可根据具体工况/需求提供定制化选型建议，建议客户提供技术需求信息以便进一步沟通确认。' },
    ],
  }
}

function keywordBlock(customer: CustomerRecord): RecommendationBlock {
  return {
    kind: 'list',
    heading: '内容关键词方向建议',
    items: [
      `${customer.industry} + 定制方案`,
      `${customer.industry} + 案例参考`,
      `${customer.industry} + 认证资质`,
    ],
  }
}

/** 内容更新清单：仅在“运营停滞”信号下给出，且只列版块方向，不编造客户没有的具体产品型号 */
function stagnantContentBlock(): RecommendationBlock {
  return {
    kind: 'list',
    heading: '建议优先更新的页面板块',
    items: ['产品参数/型号信息更新为最新版本', '首页展示内容替换为近期案例或动态', '联系方式与询盘入口核对是否为最新'],
  }
}

function buildRecommendationBlocks(customer: CustomerRecord, signals: SignalEvent[]): RecommendationBlock[] {
  const types = new Set(signals.map((s) => s.type))
  const blocks: RecommendationBlock[] = []
  const peer = peerBenchmarks.find((p) => p.industry === customer.industry)

  if (types.has('同行落后') && peer) blocks.push(certificationBlock(customer, peer))
  if (types.has('询盘异常') || types.has('运营停滞')) blocks.push(faqBlock(customer))
  if (types.has('流量下滑')) blocks.push(keywordBlock(customer))
  if (types.has('运营停滞')) blocks.push(stagnantContentBlock())

  return blocks
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

  const recommendationBlocks = buildRecommendationBlocks(customer, signals)

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
    recommendationBlocks: recommendationBlocks.length
      ? recommendationBlocks
      : [{ kind: 'list', heading: action.purpose, items: [action.content] }],
    expectedImpact: action.expectedMetric,
    reviewDate: new Date(action.reviewAt).toLocaleDateString('zh-CN'),
  }
}
