import { ActionStatus, ActionType, RiskLevel } from '../types'

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

export const actionTypeStyle: Record<ActionType, { badgeBg: string; badgeText: string; accent: string }> = {
  客户触达: { badgeBg: 'bg-blue-100', badgeText: 'text-blue-700', accent: '#2563eb' },
  页面优化: { badgeBg: 'bg-violet-100', badgeText: 'text-violet-700', accent: '#7c3aed' },
  询盘修复: { badgeBg: 'bg-rose-100', badgeText: 'text-rose-700', accent: '#dc2626' },
  续费复盘: { badgeBg: 'bg-amber-100', badgeText: 'text-amber-800', accent: '#b45309' },
  回复处理: { badgeBg: 'bg-slate-100', badgeText: 'text-slate-600', accent: '#475569' },
  复查: { badgeBg: 'bg-slate-100', badgeText: 'text-slate-600', accent: '#475569' },
}
