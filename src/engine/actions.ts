import { ActionRecord, ActionStatus, ActionType, CustomerRecord, SignalEvent } from '../types'

let counter = 0
function aid(customerId: string) {
  counter += 1
  return `act-${customerId}-${counter}`
}

const TERMINAL: ActionStatus[] = ['已完成', '已取消']

function hasActive(actions: ActionRecord[], customerId: string, type: ActionType) {
  return actions.some((a) => a.customerId === customerId && a.type === type && !TERMINAL.includes(a.status))
}

function inDays(n: number) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString()
}

function base(customerId: string, patch: Partial<ActionRecord> & Pick<ActionRecord, 'type' | 'purpose' | 'triggerReason' | 'target' | 'channel' | 'content' | 'owner' | 'needsApproval' | 'deadline' | 'completionCriteria' | 'reviewAt' | 'expectedMetric' | 'risk'>): ActionRecord {
  return {
    id: aid(customerId),
    customerId,
    status: '待确认',
    createdAt: new Date().toISOString(),
    history: [{ at: new Date().toISOString(), note: 'Agent 生成动作建议' }],
    ...patch,
  }
}

/** 根据客户当前信号生成尚不存在的动作草稿，避免重复创建（PRD 5.6 / 9.1） */
export function generateActionsForCustomer(
  c: CustomerRecord,
  signals: SignalEvent[],
  existing: ActionRecord[],
): ActionRecord[] {
  const drafts: ActionRecord[] = []
  const types = new Set(signals.map((s) => s.type))

  // 询盘异常优先于续费挽留（场景 C：先修转化链路，再谈续费）
  if (types.has('询盘异常') && !hasActive(existing, c.id, '询盘修复')) {
    drafts.push(
      base(c.id, {
        type: '询盘修复',
        purpose: '排查并修复询盘转化链路问题，避免流量流失为无效访问',
        triggerReason: `检测到询盘异常：${signals.find((s) => s.type === '询盘异常')?.text}`,
        target: `${c.domain} 询盘表单 / 联系方式入口`,
        channel: '内部工单',
        content: `建议排查顺序：1）确认表单提交是否成功写入 2）核对联系电话/邮箱是否为最新 3）检查落地页跳转与关键词匹配 4）近 4 周询盘为 ${c.metrics.inquiryCount} 条，若排查后仍为 0 需升级人工介入。`,
        owner: c.owner,
        needsApproval: false,
        deadline: inDays(3),
        completionCriteria: '表单可正常提交，且联系方式核实无误',
        reviewAt: inDays(7),
        expectedMetric: '询盘量恢复至历史周期均值附近',
        risk: '若询盘入口本身无问题，需重新评估是否为流量或内容问题',
      }),
    )
  }

  if (types.has('运营停滞') && !hasActive(existing, c.id, '客户触达')) {
    drafts.push(
      base(c.id, {
        type: '客户触达',
        purpose: '低门槛激活客户，恢复基础运营',
        triggerReason: `检测到运营停滞：${signals.find((s) => s.type === '运营停滞')?.text}`,
        target: `${c.name} 网站管理员`,
        channel: '企业微信',
        content: `您好，注意到贵司网站已有一段时间未更新产品信息。我们发现更新 1-2 个核心产品页即可较快恢复搜索曝光，是否需要我们协助整理一版更新草稿？`,
        owner: c.owner,
        needsApproval: true,
        deadline: inDays(2),
        completionCriteria: '客户确认收到并同意/拒绝协助',
        reviewAt: inDays(7),
        expectedMetric: '7 天内完成至少 1 次内容更新或客户回复',
        risk: '客户可能长期无人对接，需确认联系人是否仍然有效',
      }),
    )
  }

  if (types.has('流量下滑') && !hasActive(existing, c.id, '页面优化')) {
    drafts.push(
      base(c.id, {
        type: '页面优化',
        purpose: '优化重点页面结构与关键词，恢复访问表现',
        triggerReason: `检测到流量下滑：${signals.find((s) => s.type === '流量下滑')?.text}`,
        target: `${c.domain} 产品/案例页`,
        channel: '内容发布系统',
        content: `建议：补充 ${c.industry} 行业采购关键词、更新近 6 个月内的案例和认证信息、检查移动端加载速度。草稿需授权人员确认后发布。`,
        owner: c.owner,
        needsApproval: true,
        deadline: inDays(5),
        completionCriteria: '页面内容已发布，且关键词覆盖完整',
        reviewAt: inDays(7),
        expectedMetric: '重点页面访问量止跌或回升',
        risk: '下滑也可能来自季节性或渠道变化，需结合下一周期数据确认',
      }),
    )
  }

  if (types.has('续费窗口临近')) {
    if (!hasActive(existing, c.id, '续费复盘')) {
      drafts.push(
        base(c.id, {
          type: '续费复盘',
          purpose: '汇总周期表现，准备续费沟通材料',
          triggerReason: `距到期 ${c.daysToRenewal} 天，需提前准备续费复盘`,
          target: `${c.name} 决策人`,
          channel: '内部材料',
          content: `周期内表现：访问趋势 ${c.metrics.trafficTrendPct}%，询盘 ${c.metrics.inquiryCount} 条（趋势 ${c.metrics.inquiryTrendPct}%）。已完成动作与未解决问题以复查记录为准，尚不构成已确认的续费结果。`,
          owner: c.owner,
          needsApproval: false,
          deadline: inDays(5),
          completionCriteria: '复盘材料整理完成，销售/CSM 已过目',
          reviewAt: inDays(7),
          expectedMetric: '销售获得可用于续费沟通的具体依据',
          risk: '不得将样例数据表述为已确认的商业结果',
        }),
      )
    }
    if (!hasActive(existing, c.id, '客户触达')) {
      drafts.push(
        base(c.id, {
          type: '客户触达',
          purpose: '续费前价值沟通与挽留',
          triggerReason: `续费窗口临近（${c.daysToRenewal} 天）且健康度存在风险`,
          target: `${c.name} 决策人`,
          channel: '企业微信 / 邮件',
          content: `您好，即将进入续费周期。过去一个周期内网站为贵司带来 ${c.metrics.inquiryCount} 条询盘，我们也识别到 ${c.metrics.trafficTrendPct < 0 ? '访问量有所下降，正在着手优化' : '表现保持稳定'}。附上本周期价值总结，希望继续为贵司提供支持。`,
          owner: c.owner,
          needsApproval: true,
          deadline: inDays(3),
          completionCriteria: '客户已收到沟通并给出态度反馈',
          reviewAt: inDays(7),
          expectedMetric: '客户回复积极意向或进入续费谈判',
          risk: '涉及续费承诺内容，发送前必须人工确认',
        }),
      )
    }
  }

  if (types.has('持续价值') && !hasActive(existing, c.id, '客户触达')) {
    drafts.push(
      base(c.id, {
        type: '客户触达',
        purpose: '持续价值证明，而非等到续费才谈效果',
        triggerReason: `检测到持续价值信号：${signals.find((s) => s.type === '持续价值')?.text}`,
        target: `${c.name} 决策人`,
        channel: '企业微信',
        content: `您好，本周期贵司网站访问量增长 ${c.metrics.trafficTrendPct}%，询盘增长 ${c.metrics.inquiryTrendPct}%。附上 ${c.industry} 行业的下一步优化建议，帮助进一步扩大询盘转化。`,
        owner: c.owner,
        needsApproval: true,
        deadline: inDays(4),
        completionCriteria: '客户已收到价值总结',
        reviewAt: inDays(7),
        expectedMetric: '客户认可当前价值，为续费打好基础',
        risk: '低风险，仍需人工确认对外措辞',
      }),
    )
  }

  return drafts
}

/** 客户回复后生成的下一步处理动作（场景 E） */
export function generateReplyFollowup(c: CustomerRecord, sourceAction: ActionRecord): ActionRecord {
  const intent = sourceAction.customerReply?.intent ?? '待判断'
  const contentByIntent: Record<string, string> = {
    积极意向: '客户表达积极意向，建议销售在 48 小时内跟进商务细节，并同步准备续费或增购材料。',
    观望: '客户态度观望，建议补充更具体的效果证据（如同行案例、近期询盘数据），降低决策顾虑。',
    异议: '客户提出异议，需先确认异议具体内容（价格/效果/服务），由负责人评估后再答复，不自动承诺。',
    投诉升级: '客户反馈涉及投诉或负面体验，禁止自动回复，需人工升级并在 24 小时内响应。',
    技术问题: '客户反馈技术或操作问题，转交运营/技术支持核实并回复。',
  }
  return base(c.id, {
    type: '回复处理',
    purpose: '理解客户回复意图并推进下一步',
    triggerReason: `客户对触达消息「${sourceAction.purpose}」进行了回复`,
    target: `${c.name} 决策人`,
    channel: sourceAction.channel,
    content: contentByIntent[intent] ?? '需人工判断客户回复意图后再决定下一步。',
    owner: c.owner,
    needsApproval: intent === '投诉升级' || intent === '异议',
    deadline: inDays(intent === '投诉升级' ? 1 : 3),
    completionCriteria: '已给出下一步处理方案并记录负责人',
    reviewAt: inDays(7),
    expectedMetric: '客户诉求得到响应，风险不再升级',
    risk: intent === '投诉升级' ? '涉及投诉，未经人工确认不得自动回复' : '一般风险',
  })
}
