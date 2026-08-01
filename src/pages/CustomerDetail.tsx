import { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Sparkles } from 'lucide-react'
import Topbar from '../components/Topbar'
import HealthRing from '../components/HealthRing'
import ActionSummaryCard from '../components/ActionSummaryCard'
import TrendBars from '../components/TrendBars'
import { useAppStore, customerSeed } from '../store/AppStore'
import { useAgent } from '../store/AgentContext'
import { buildCustomerView, computeSentimentTrend } from '../engine/selectors'
import { riskLevelStyle } from '../ui/styles'
import { RULE_VERSION, HEALTH_WEIGHTS } from '../engine/health'
import { buildTrendSeries } from '../engine/trend'
import { SignalType } from '../types'

const DIM_LABEL: Record<string, string> = {
  usage: '使用与运营活跃度',
  website: '网站表现',
  inquiry: '询盘与转化',
  contract: '合同与续费阶段',
  action: '动作与结果反馈',
}

const SIGNAL_CATEGORY: Record<SignalType, { label: string; accent: string; icon: string }> = {
  运营停滞: { label: '账户信号', accent: '#7c3aed', icon: '◆' },
  流量下滑: { label: '网站状态', accent: '#2563eb', icon: '▲' },
  询盘异常: { label: '网站状态', accent: '#2563eb', icon: '▲' },
  同行落后: { label: '同行对标', accent: '#c026d3', icon: '●' },
  续费窗口临近: { label: '续费阶段', accent: '#c98500', icon: '■' },
  持续价值: { label: '价值信号', accent: '#059669', icon: '✦' },
  触达未回复: { label: '跟进状态', accent: '#64748b', icon: '○' },
  优化未见效: { label: '跟进状态', accent: '#64748b', icon: '○' },
}

function actionTag(type: SignalType, confidence: '高' | '中' | '低') {
  if (type === '持续价值') return { text: '价值确认', bg: '#eaf8f1', color: '#0f8c5f' }
  if (confidence === '高') return { text: '优先处理', bg: '#fdece9', color: '#d03b3b' }
  if (confidence === '中') return { text: '已识别', bg: '#fef3da', color: '#c98500' }
  return { text: '持续观察', bg: '#f1f0ee', color: '#898781' }
}

const SENTIMENT_LABEL: Record<string, { text: string; className: string }> = {
  improving: { text: '较上次好转', className: 'text-emerald-600' },
  worsening: { text: '较上次恶化', className: 'text-rose-600' },
  flat: { text: '基本持平', className: 'text-slate-500' },
  insufficient: { text: '样本不足，暂无趋势', className: 'text-slate-400' },
}

export default function CustomerDetail() {
  const { id } = useParams()
  const { state } = useAppStore()
  const { openDrawer } = useAgent()
  const customer = customerSeed.find((c) => c.id === id)

  const view = useMemo(() => (customer ? buildCustomerView(customer, state.actions) : null), [customer, state.actions])
  const actions = useMemo(() => state.actions.filter((a) => a.customerId === id), [state.actions, id])
  const events = useMemo(
    () => state.events.filter((e) => e.customerId === id).sort((a, b) => b.at.localeCompare(a.at)),
    [state.events, id],
  )
  const sentiment = useMemo(
    () => (customer ? computeSentimentTrend(customer.id, state.actions) : null),
    [customer, state.actions],
  )

  const trend = useMemo(() => {
    if (!customer || !view) return null
    const hasInquiryIssue = view.signals.some((s) => s.type === '询盘异常')
    const preferInquiry = hasInquiryIssue && !view.signals.some((s) => s.type === '流量下滑' || s.type === '持续价值')
    const pct = preferInquiry ? customer.metrics.inquiryTrendPct : customer.metrics.trafficTrendPct
    return {
      label: preferInquiry ? '询盘量' : '网站访问量',
      pct,
      series: buildTrendSeries(pct),
    }
  }, [customer, view])

  if (!customer || !view) {
    return (
      <>
        <Topbar title="客户不存在" />
        <main className="px-6 py-6">
          <Link to="/customers" className="text-sm text-violet-600 hover:underline">
            返回客户列表
          </Link>
        </main>
      </>
    )
  }

  const style = riskLevelStyle[view.health.level]
  const shortName = customer.name.replace(/^\S+\s*/, '')

  return (
    <>
      <Topbar title={customer.name} subtitle={`${customer.industry} · ${customer.region} · ${customer.owner}`} />
      <main className="mx-auto max-w-6xl space-y-6 px-6 py-6">
        <div className="flex items-center justify-between">
          <Link to="/customers" className="flex w-fit items-center gap-1 text-xs text-slate-400 hover:text-slate-600">
            <ArrowLeft size={13} />
            返回客户列表
          </Link>
          <button
            onClick={() => openDrawer(`帮我看看 ${shortName}`)}
            className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-3.5 py-1.5 text-xs font-medium text-white transition hover:opacity-90"
          >
            <Sparkles size={13} />
            与 Agent 处理
          </button>
        </div>

        {/* 概览 */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex flex-col gap-5 md:flex-row md:items-center">
            <div className="flex items-center gap-4 md:w-72 md:shrink-0 md:border-r md:border-slate-100 md:pr-5">
              <HealthRing value={view.health.score} size={72} stroke={7} />
              <div className="min-w-0">
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${style.bg} ${style.text}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                  {view.health.level}
                </span>
                <span className="ml-2 text-xs font-semibold text-rose-500">流失概率 {view.churnProbability}%</span>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
                  距合同到期 {customer.daysToRenewal} 天
                  <br />
                  {customer.plan} · {customer.domain}
                </p>
                {sentiment && (
                  <p className="mt-1.5 text-xs">
                    客户情感：「{sentiment.latestIntent}」（{sentiment.latest.toFixed(1)}）
                    <span className={`ml-1 font-medium ${SENTIMENT_LABEL[sentiment.trend].className}`}>
                      {SENTIMENT_LABEL[sentiment.trend].text}
                    </span>
                  </p>
                )}
              </div>
            </div>

            <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {(Object.keys(HEALTH_WEIGHTS) as Array<keyof typeof HEALTH_WEIGHTS>).map((k) => {
                const v = view.health.subScores[k]
                return (
                  <div key={k} className="flex flex-col items-center gap-2 rounded-xl bg-slate-50/70 py-4 text-center">
                    {v === null ? (
                      <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-slate-200 text-xs text-slate-300">
                        缺失
                      </div>
                    ) : (
                      <HealthRing value={v} size={56} stroke={6} />
                    )}
                    <div>
                      <p className="text-[11px] font-medium leading-tight text-slate-600">{DIM_LABEL[k]}</p>
                      <p className="text-[10px] text-slate-400">权重 {Math.round(HEALTH_WEIGHTS[k] * 100)}%</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Agent 证据画布 */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">Agent 证据画布</h2>
            <span className="text-[11px] text-slate-400">{view.signals.length} 类来源 · 规则版本 {RULE_VERSION}</span>
          </div>

          {view.signals.length === 0 ? (
            <p className="mt-3 text-sm text-slate-400">未发现需要关注的信号</p>
          ) : (
            <div className="mt-3 divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-100">
              {view.signals.map((s) => {
                const cat = SIGNAL_CATEGORY[s.type]
                const tag = actionTag(s.type, s.confidence)
                return (
                  <div key={s.id} className="flex items-start gap-3 px-4 py-3">
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm text-white"
                      style={{ background: cat.accent }}
                    >
                      {cat.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-400">{cat.label}</span>
                      <p className="text-sm">
                        <span className="font-semibold text-slate-800">{s.type}</span>
                        <span className="ml-2 text-slate-500">{s.text}</span>
                      </p>
                      <p className="mt-0.5 truncate font-mono text-[10px] text-slate-400" title={s.evidence}>
                        {s.evidence}
                      </p>
                    </div>
                    <span
                      className="mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium"
                      style={{ background: tag.bg, color: tag.color }}
                    >
                      {tag.text}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {trend && <TrendBars series={trend.series} label={trend.label} trendPct={trend.pct} />}

        {/* Agent 结论 */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-800">Agent 判断结论</h2>
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-violet-100 bg-violet-50/60 p-4">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-violet-600">◆ 推断</span>
              <ul className="mt-2 space-y-1 text-sm text-slate-700">
                {view.health.factors.map((f, i) => (
                  <li key={i}>· {f}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-fuchsia-100 bg-fuchsia-50/60 p-4">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-fuchsia-600">✕ 交叉推理</span>
              {view.crossInsights.length > 0 ? (
                <ul className="mt-2 space-y-1.5 text-sm leading-snug text-slate-700">
                  {view.crossInsights.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-slate-400">暂无信号叠加，未发现互相印证或冲突的情况</p>
              )}
              {view.health.missing.length > 0 && (
                <p className="mt-2 rounded-lg bg-amber-50 px-2.5 py-1.5 text-[11px] text-amber-700">
                  数据缺失：{view.health.missing.join('、')}，权重已按剩余维度重新分配
                </p>
              )}
            </div>

            <div className="flex flex-col rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">→ 建议动作</span>
              <p className="mt-2 flex-1 text-sm text-slate-700">
                {actions.length > 0 ? (
                  <>
                    已生成 <span className="text-xl font-bold text-emerald-700">{actions.length}</span> 项动作
                  </>
                ) : (
                  '当前无需生成新动作'
                )}
              </p>
              {actions.length > 0 && (
                <a
                  href="#actions-section"
                  className="mt-3 self-start rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-700"
                >
                  查看动作列表 →
                </a>
              )}
            </div>
          </div>
        </div>

        {/* 动作列表 */}
        <div id="actions-section">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">动作与执行</h2>
          {actions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
              暂无动作，点击顶部"运行本轮扫描"让 Agent 重新评估
            </div>
          ) : (
            <div className="space-y-3">
              {actions.map((a) => (
                <ActionSummaryCard key={a.id} action={a} />
              ))}
            </div>
          )}
        </div>

        {/* 时间线 */}
        {events.length > 0 && (
          <div>
            <h2 className="mb-3 text-sm font-semibold text-slate-700">事件时间线</h2>
            <ul className="space-y-1.5 border-l border-slate-200 pl-4">
              {events.map((e) => (
                <li key={e.id} className="text-xs text-slate-500">
                  <span className="text-slate-400">{new Date(e.at).toLocaleString()}</span> · {e.detail}
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </>
  )
}
