import { ActionStatus, RiskLevel } from '../types'

export const riskLevelStyle: Record<RiskLevel, { text: string; bg: string; dot: string }> = {
  高风险: { text: 'text-rose-600', bg: 'bg-rose-50', dot: 'bg-rose-500' },
  预警: { text: 'text-amber-600', bg: 'bg-amber-50', dot: 'bg-amber-500' },
  稳定: { text: 'text-emerald-600', bg: 'bg-emerald-50', dot: 'bg-emerald-500' },
}

export const actionStatusStyle: Record<ActionStatus, { text: string; bg: string }> = {
  待确认: { text: 'text-amber-700', bg: 'bg-amber-50' },
  已批准: { text: 'text-sky-700', bg: 'bg-sky-50' },
  执行中: { text: 'text-sky-700', bg: 'bg-sky-50' },
  等待客户结果: { text: 'text-violet-700', bg: 'bg-violet-50' },
  已收到结果: { text: 'text-violet-700', bg: 'bg-violet-50' },
  已复查: { text: 'text-slate-700', bg: 'bg-slate-100' },
  已完成: { text: 'text-emerald-700', bg: 'bg-emerald-50' },
  需升级: { text: 'text-rose-700', bg: 'bg-rose-50' },
  已取消: { text: 'text-slate-400', bg: 'bg-slate-100' },
}

export const confidenceStyle: Record<'高' | '中' | '低', string> = {
  高: 'text-emerald-600',
  中: 'text-amber-600',
  低: 'text-slate-400',
}
