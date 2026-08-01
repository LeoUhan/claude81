import { ActionRecord, CustomerRecord, EventLogItem } from '../types'
import { customerSeed } from '../data/seed'
import { buildCustomerView, priorityRank } from './selectors'
import { generateActionsForCustomer } from './actions'
import { computeEfficiency } from './efficiency'

export interface ChatAnswer {
  text: string
  customerId?: string
  existingActionId?: string
  draftAction?: ActionRecord
  suggestions: string[]
}

const DEFAULT_SUGGESTIONS = ['当前最该处理的客户有哪些？', '哪些客户临近续费？', '本周期效能怎么样？', '帮我看看 A 客户']

function findCustomer(text: string): CustomerRecord | undefined {
  const t = text.replace(/\s/g, '')
  for (const c of customerSeed) {
    const shortName = c.name.replace(/^\S+\s*/, '')
    if (
      text.includes(c.name) ||
      text.includes(shortName) ||
      t.includes(`${c.id}客户`) ||
      t.includes(`客户${c.id}`) ||
      (shortName.length >= 3 && text.includes(shortName.slice(0, Math.min(4, shortName.length))))
    ) {
      return c
    }
  }
  return undefined
}

const ACTIVE_STATUSES = new Set(['待确认', '已批准', '等待客户结果', '已收到结果'])

export function answerQuery(text: string, actions: ActionRecord[], events: EventLogItem[], ownerScope: string | null = null): ChatAnswer {
  const scopedCustomers = ownerScope ? customerSeed.filter((c) => c.owner === ownerScope) : customerSeed
  const customer = findCustomer(text)

  if (customer) {
    if (ownerScope && customer.owner !== ownerScope) {
      return { text: `${customer.name} 不在你当前的负责范围内，暂无法查看详情。`, suggestions: DEFAULT_SUGGESTIONS }
    }
    return answerAboutCustomer(customer, actions)
  }

  if (/风险|优先|该处理|需要关注|关注/.test(text)) {
    const views = priorityRank(scopedCustomers.map((c) => buildCustomerView(c, actions))).filter((v) => v.health.level !== '稳定')
    const top = views.slice(0, 4)
    const lines = top
      .map((v, i) => `${i + 1}. ${v.customer.name}（健康度 ${v.health.score}，${v.health.level}）— ${v.health.factors[0]}`)
      .join('\n')
    return {
      text: top.length
        ? `当前最需要处理的客户共 ${views.length} 家，优先级最高的：\n${lines}\n\n你可以直接告诉我处理哪一个，我来生成对应的动作。`
        : '目前没有客户处于高风险或预警状态。',
      suggestions: top.map((v) => `帮我看看 ${v.customer.name.replace(/^\S+\s*/, '')}`).slice(0, 3),
    }
  }

  if (/续费|到期|窗口/.test(text)) {
    const near = scopedCustomers.filter((c) => c.daysToRenewal <= 90).sort((a, b) => a.daysToRenewal - b.daysToRenewal)
    const lines = near.map((c) => `${c.name} — 距到期 ${c.daysToRenewal} 天`).join('\n')
    return {
      text: near.length ? `未来 90 天内需要续费的客户：\n${lines}` : '未来 90 天内暂无客户进入续费窗口。',
      suggestions: near.slice(0, 3).map((c) => `帮我看看 ${c.name.replace(/^\S+\s*/, '')}`),
    }
  }

  if (/效能|效果|数据表现|提升|复盘/.test(text)) {
    const scopedIds = new Set(scopedCustomers.map((c) => c.id))
    const scopedActions = actions.filter((a) => scopedIds.has(a.customerId))
    const scopedEvents = events.filter((e) => !e.customerId || scopedIds.has(e.customerId))
    const m = computeEfficiency(scopedActions, scopedEvents, scopedCustomers)
    return {
      text: `本周期效能：风险发现提前量平均 ${m.leadDays} 天，首次动作响应 ${m.avgResponseMinutes} 分钟；动作完成率 ${m.completionRate}%，客户回复率 ${m.replyRate}%，风险转好率 ${m.improveRate}%。详细拆解可以去「效能复盘」页看。`,
      suggestions: DEFAULT_SUGGESTIONS,
    }
  }

  return {
    text: '我可以帮你看客户风险、生成动作、或者汇总效能数据。你可以直接说客户名字，或者试试下面的问题：',
    suggestions: DEFAULT_SUGGESTIONS,
  }
}

function answerAboutCustomer(customer: CustomerRecord, actions: ActionRecord[]): ChatAnswer {
  const view = buildCustomerView(customer, actions)
  const mine = actions.filter((a) => a.customerId === customer.id)
  const active = mine.find((a) => ACTIVE_STATUSES.has(a.status))

  const factLines = view.signals.length
    ? view.signals.map((s) => `- ${s.text}（${s.evidence}）`).join('\n')
    : '- 未发现明显异常信号'

  const header = `${customer.name}：健康度 ${view.health.score} 分（${view.health.level}），距合同到期 ${customer.daysToRenewal} 天。`

  if (active) {
    return {
      text: `${header}\n\n已有进行中的动作「${active.purpose}」，当前状态：${active.status}。你可以在下方卡片里直接操作。`,
      customerId: customer.id,
      existingActionId: active.id,
      suggestions: DEFAULT_SUGGESTIONS,
    }
  }

  if (view.signals.length === 0) {
    return {
      text: `${header}\n\n各项指标表现稳定，未发现需要处理的问题，暂不需要生成新动作。`,
      customerId: customer.id,
      suggestions: DEFAULT_SUGGESTIONS,
    }
  }

  const drafts = generateActionsForCustomer(customer, view.signals, actions)
  const draft = drafts[0]

  return {
    text: `${header}\n\n识别到以下信号：\n${factLines}\n\n${
      draft ? `建议动作：${draft.purpose}。我已经生成了文案草稿，你可以直接确认执行、重新生成或编辑。` : '暂无需要新生成的动作。'
    }`,
    customerId: customer.id,
    draftAction: draft,
    suggestions: DEFAULT_SUGGESTIONS,
  }
}
