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

const SIGNAL_CATEGORY: Record<SignalType, { label: string; accent: string; tint: string }> = {
  运营停滞: { label: '账户信号', accent: '#4a3aa7', tint: '#f2f0fb' },
  流量下滑: { label: '网站状态', accent: '#2a78d6', tint: '#eef4fc' },
  询盘异常: { label: '网站状态', accent: '#2a78d6', tint: '#eef4fc' },
  同行落后: { label: '同行对标', accent: '#c14fa0', tint: '#fbeef8' },
  续费窗口临近: { label: '续费阶段', accent: '#c98500', tint: '#fdf3e0' },
  持续价值: { label: '价值信号', accent: '#0f8c5f', tint: '#eaf8f1' },
  触达未回复: { label: '跟进状态', accent: '#898781', tint: '#f4f3f1' },
  优化未见效: { label: '跟进状态', accent: '#898781', tint: '#f4f3f1' },
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
        <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-5 md:grid-cols-[auto_1fr]">
          <div className="flex items-center gap-4">
            <HealthRing value={view.health.score} size={72} stroke={7} />
            <div>
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${style.bg} ${style.text}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                {view.health.level}
              </span>
              <span className="ml-2 text-xs font-semibold text-rose-500">流失概率 {view.churnProbability}%</span>
              <p className="mt-1 text-xs text-slate-400">距合同到期 {customer.daysToRenewal} 天 · {customer.plan} · {customer.domain}</p>
              {sentiment && (
                <p className="mt-1 text-xs">
                  客户情感：最近一次「{sentiment.latestIntent}」（{sentiment.latest.toFixed(1)}）
                  <span className={`ml-1 font-medium ${SENTIMENT_LABEL[sentiment.trend].className}`}>
                    {SENTIMENT_LABEL[sentiment.trend].text}
                  </span>
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {(Object.keys(HEALTH_WEIGHTS) as Array<keyof typeof HEALTH_WEIGHTS>).map((k) => {
              const v = view.health.subScores[k]
              return (
                <div key={k}>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>
                      {DIM_LABEL[k]} <span className="text-slate-300">({Math.round(HEALTH_WEIGHTS[k] * 100)}%)</span>
                    </span>
                    <span className="font-medium text-slate-600">{v === null ? '缺失数据' : v}</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-slate-100">
                    <div
                      className={`h-1.5 rounded-full ${v === null ? 'bg-slate-200' : v < 50 ? 'bg-rose-400' : v < 80 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                      style={{ width: `${v ?? 0}%` }}
                    />
                  </div>
                </div>
              )
            })}
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
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {view.signals.map((s) => {
                const cat = SIGNAL_CATEGORY[s.type]
                const tag = actionTag(s.type, s.confidence)
                return (
                  <div
                    key={s.id}
                    className="rounded-2xl border border-slate-100 p-4"
                    style={{ background: cat.tint }}
                  >
                    <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: cat.accent }}>
                      {cat.label}
                    </span>
                    <p className="mt-1.5 text-base font-semibold leading-snug text-slate-800">{s.type}</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{s.text}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">证据：{s.evidence}</span>
                    </div>
                    <span
                      className="mt-2 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium"
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
          <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <h3 className="text-xs font-medium text-slate-500">推断（Agent 结论）</h3>
              <ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-sm text-slate-600">
                {view.health.factors.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
            <div className="space-y-3">
              {view.crossInsights.length > 0 && (
                <div>
                  <h3 className="text-xs font-medium text-slate-500">交叉推理（多个信号如何互相印证）</h3>
                  <ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-sm text-violet-700">
                    {view.crossInsights.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
              {view.health.missing.length > 0 && (
                <div className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  数据缺失：{view.health.missing.join('、')}，相关权重已按剩余维度重新分配，未计为 0 分或满分。
                </div>
              )}
              <div>
                <h3 className="text-xs font-medium text-slate-500">建议动作</h3>
                <p className="mt-1 text-sm text-slate-600">
                  {actions.length > 0 ? `已生成 ${actions.length} 项动作，见下方动作列表` : '当前无需生成新动作'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 动作列表 */}
        <div>
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
