import { CustomerRecord, OutreachChannel, OutreachScenario } from '../types'

export const OUTREACH_CHANNELS: OutreachChannel[] = ['企业微信', '电话', '邮件']
export const VARIANTS_PER_CHANNEL = 2

/** 每个渠道×每个场景×每个版本都是真实写好的完整文案，不是同一句话拼标签 */
type Builder = (c: CustomerRecord, variant: number) => string

const stagnant: Record<OutreachChannel, Builder> = {
  企业微信: (c, v) =>
    v === 0
      ? `您好，注意到贵司网站已有一段时间未更新产品信息（后台 ${c.metrics.loginDaysAgo} 天无登录）。我们发现更新 1-2 个核心产品页即可较快恢复搜索曝光，是否需要我们协助整理一版更新草稿？`
      : `您好，最近检查账户时发现后台已经有一阵子没登录了，产品页内容也停在之前的版本。如果近期比较忙，我们可以先帮您梳理一份需要更新的清单，方便的话回复确认一下就行，不用您自己动手写。`,
  电话: (c, v) =>
    v === 0
      ? `① 开场：您好，我是负责贵司账户的客户成功专员，占用您两分钟时间。\n② 说明：系统显示贵司网站已经 ${c.metrics.loginDaysAgo} 天没有登录更新了，产品页内容比较久了。\n③ 价值点：更新 1-2 个核心产品页通常能比较快恢复搜索曝光。\n④ 询问：最近是否有新产品或案例可以补充？\n⑤ 收尾：方便的话我们先帮您整理一版草稿，您确认后再发布。`
      : `① 开场：您好，打扰两分钟，我是贵司账户的客户成功负责人。\n② 关心式提问：是不是最近团队比较忙，还是网站这块暂时没人对接？\n③ 建议：如果需要，我们这边可以先垫一版内容出来，您审核一下就行。\n④ 约定：方便的话我们本周内再跟进一次，确认是否需要协助。`,
  邮件: (c) =>
    `主题：贵司网站已有一段时间未更新，建议尽快补充内容\n\n您好，\n\n我们注意到贵司网站近期后台操作和内容更新较少（已 ${c.metrics.loginDaysAgo} 天无登录），产品信息可能不是最新版本。建议近期更新 1-2 个核心产品页，通常有助于恢复搜索曝光和询盘转化。\n\n如需要，我们可以先协助整理一版更新草稿供您确认，无需占用您太多时间。\n\n此致`,
}

const renewal: Record<OutreachChannel, Builder> = {
  企业微信: (c, v) =>
    v === 0
      ? `您好，即将进入续费周期。过去一个周期内网站为贵司带来 ${c.metrics.inquiryCount} 条询盘，我们也识别到${c.metrics.trafficTrendPct < 0 ? '访问量有所下降，正在着手优化' : '表现保持稳定'}。附上本周期价值总结，希望继续为贵司提供支持。`
      : `您好，合同快到期了，想跟您同步一下这个周期的情况：网站询盘 ${c.metrics.inquiryCount} 条，${c.metrics.trafficTrendPct < 0 ? '访问量环比下降了一些' : '访问量保持稳定'}。如果有续费或调整的想法，方便的话我们找时间聊一下。`,
  电话: (c) =>
    `① 开场：您好，占用您几分钟，想跟您同步一下合同续费的事。\n② 复盘：这个周期网站带来 ${c.metrics.inquiryCount} 条询盘，${c.metrics.trafficTrendPct < 0 ? '访问量有所下降，我们已经在着手排查' : '整体表现比较稳定'}。\n③ 询问：想了解一下贵司这边对续费的初步想法。\n④ 收尾：如果需要更详细的数据材料，我们可以再发一份书面复盘给您参考。`,
  邮件: (c) =>
    `主题：续费周期临近，附上本周期服务价值复盘\n\n您好，\n\n贵司合同即将进入续费周期。本周期内，网站共产生 ${c.metrics.inquiryCount} 条询盘，${c.metrics.trafficTrendPct < 0 ? '访问量环比下降，我们正在排查原因并已生成优化建议' : '访问量保持稳定增长'}。\n\n附上本周期的服务价值复盘材料，希望能继续为贵司提供支持，期待与您进一步沟通续费事宜。\n\n此致`,
}

const value: Record<OutreachChannel, Builder> = {
  企业微信: (c, v) =>
    v === 0
      ? `您好，本周期贵司网站访问量增长 ${c.metrics.trafficTrendPct}%，询盘增长 ${c.metrics.inquiryTrendPct}%。附上 ${c.industry} 行业的下一步优化建议，帮助进一步扩大询盘转化。`
      : `您好，跟您同步一个好消息：这个周期网站访问量涨了 ${c.metrics.trafficTrendPct}%，询盘也涨了 ${c.metrics.inquiryTrendPct}%。我们整理了几条 ${c.industry} 行业的延伸建议，方便的话可以聊聊怎么把这个势头继续扩大。`,
  电话: (c) =>
    `① 开场：您好，跟您分享一个好消息，占用几分钟时间。\n② 数据：本周期网站访问量增长 ${c.metrics.trafficTrendPct}%，询盘增长 ${c.metrics.inquiryTrendPct}%，表现不错。\n③ 延伸建议：我们准备了 ${c.industry} 行业的下一步优化方向，可以帮助进一步扩大转化。\n④ 收尾：看您方便的话我们可以约个时间详细聊聊。`,
  邮件: (c) =>
    `主题：本周期网站表现价值总结\n\n您好，\n\n很高兴与您同步：本周期贵司网站访问量增长 ${c.metrics.trafficTrendPct}%，询盘增长 ${c.metrics.inquiryTrendPct}%。\n\n附上 ${c.industry} 行业的下一步优化建议，希望帮助贵司进一步扩大询盘转化，欢迎随时与我们沟通。\n\n此致`,
}

const BUILDERS: Record<OutreachScenario, Record<OutreachChannel, Builder>> = { stagnant, renewal, value }

export function buildOutreachContent(scenario: OutreachScenario, channel: OutreachChannel, variant: number, customer: CustomerRecord): string {
  const builder = BUILDERS[scenario][channel]
  return builder(customer, variant % VARIANTS_PER_CHANNEL)
}
