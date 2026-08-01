export type RiskLevel = '高风险' | '预警' | '稳定'

export interface RawMetrics {
  loginDaysAgo: number
  contentUpdateDaysAgo: number
  trafficTrendPct: number // 相比上一周期的访问量变化 %
  inquiryCount: number // 最近周期询盘数
  inquiryTrendPct: number // 相比上一周期的询盘变化 %
  inquiryValid: boolean // 表单/询盘入口是否正常
  renewalHistory: '首次合作' | '已续费' | '曾降级'
  certifications: string[] // 网站已展示的认证
  caseStudyCount: number // 网站已展示的案例数
}

export interface CustomerRecord {
  id: string
  name: string
  industry: string
  region: string
  owner: string
  domain: string
  plan: string
  daysToRenewal: number
  agentEnabledDaysAgo: number // 距 Agent 接管天数，用于效能 Before/After 对比
  metrics: RawMetrics
}

export interface SubScores {
  usage: number | null
  website: number | null
  inquiry: number | null
  contract: number | null
  action: number | null
}

export interface HealthResult {
  score: number
  level: RiskLevel
  subScores: SubScores
  missing: string[]
  factors: string[]
}

export type SignalType =
  | '运营停滞'
  | '流量下滑'
  | '询盘异常'
  | '续费窗口临近'
  | '触达未回复'
  | '持续价值'
  | '优化未见效'
  | '同行落后'

export interface SignalEvent {
  id: string
  customerId: string
  type: SignalType
  text: string
  evidence: string
  baseline: string
  confidence: '高' | '中' | '低'
  detectedAt: string
}

export type ActionType =
  | '客户触达'
  | '页面优化'
  | '询盘修复'
  | '续费复盘'
  | '回复处理'
  | '复查'

export type ActionStatus =
  | '待确认'
  | '已批准'
  | '执行中'
  | '等待客户结果'
  | '已收到结果'
  | '已复查'
  | '已完成'
  | '需升级'
  | '已取消'

export type OutreachScenario = 'stagnant' | 'renewal' | 'value'
export type OutreachChannel = '企业微信' | '电话' | '邮件'

export interface ActionRecord {
  id: string
  customerId: string
  type: ActionType
  purpose: string
  triggerReason: string
  target: string
  channel: string
  content: string
  outreachScenario?: OutreachScenario
  variantIndex?: number
  owner: string
  needsApproval: boolean
  status: ActionStatus
  createdAt: string
  deadline: string
  completionCriteria: string
  reviewAt: string
  expectedMetric: string
  risk: string
  history: { at: string; note: string }[]
  customerReply?: { at: string; text: string; intent: string; sentiment: number }
  reviewOutcome?: 'improved' | 'no-change' | 'escalate'
}

export interface EventLogItem {
  id: string
  at: string
  customerId?: string
  actionId?: string
  kind: string
  detail: string
}
