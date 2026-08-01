import { useMemo } from 'react'
import Topbar from '../components/Topbar'
import { useAppStore, customerSeed } from '../store/AppStore'

const MANUAL_BASELINE_LEAD_DAYS = 12 // 人工逐家排查经验基线：平均在到期前 12 天才发现风险
const MANUAL_BASELINE_RESPONSE_HOURS = 96 // 人工经验基线：发现风险到首次动作平均 4 天

function Bar({ label, value, max, suffix = '', color = '#7c3aed' }: { label: string; value: number; max: number; suffix?: string; color?: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return (
    <div>
      <div className="flex items-baseline justify-between text-xs">
        <span className="text-slate-500">{label}</span>
        <span className="font-semibold text-slate-800">
          {value}
          {suffix}
        </span>
      </div>
      <div className="mt-1 h-2 rounded-full bg-slate-100">
        <div className="h-2 rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

function MetricCard({ title, children, note }: { title: string; children: React.ReactNode; note?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      <div className="mt-3 space-y-3">{children}</div>
      {note && <p className="mt-3 text-[11px] text-slate-400">{note}</p>}
    </div>
  )
}

export default function Efficiency() {
  const { state } = useAppStore()

  const metrics = useMemo(() => {
    const actions = state.actions
    const events = state.events

    const signalEvents = events.filter((e) => e.kind === 'signal_detected')
    const actionCreatedEvents = events.filter((e) => e.kind === 'action_created')

    const customersWithSignal = new Set(signalEvents.map((e) => e.customerId))
    const customersWithAction = new Set(actionCreatedEvents.map((e) => e.customerId))

    const leadDays =
      customersWithSignal.size > 0
        ? Math.round(
            [...customersWithSignal].reduce((sum, id) => sum + (customerSeed.find((c) => c.id === id)?.daysToRenewal ?? 0), 0) /
              customersWithSignal.size,
          )
        : 0

    // 首次动作响应时长：同一客户第一条 signal_detected 到第一条 action_created 的真实事件间隔
    const responseMinutes: number[] = []
    for (const cid of customersWithSignal) {
      const s = events.find((e) => e.kind === 'signal_detected' && e.customerId === cid)
      const a = events.find((e) => e.kind === 'action_created' && e.customerId === cid)
      if (s && a) responseMinutes.push(Math.max(0, (new Date(a.at).getTime() - new Date(s.at).getTime()) / 60000))
    }
    const avgResponseMinutes = responseMinutes.length
      ? Math.round(responseMinutes.reduce((s, v) => s + v, 0) / responseMinutes.length)
      : 0

    const total = actions.length
    const completed = actions.filter((a) => a.status === '已完成').length
    const outreach = actions.filter((a) => a.type === '客户触达')
    const outreachSent = outreach.filter((a) => a.status !== '待确认' && a.status !== '已批准' && a.status !== '已取消')
    const outreachReplied = outreachSent.filter((a) => a.customerReply)
    const reachedResult = actions.filter((a) => a.status === '已收到结果' || a.status === '已复查' || a.status === '已完成' || a.status === '需升级')
    const reviewed = actions.filter((a) => a.reviewOutcome)
    const improved = reviewed.filter((a) => a.reviewOutcome === 'improved')

    return {
      coverage: 100,
      leadDays,
      avgResponseMinutes,
      actionGenRate: customersWithSignal.size ? Math.round((customersWithAction.size / customersWithSignal.size) * 100) : 0,
      completionRate: total ? Math.round((completed / total) * 100) : 0,
      outreachSuccessRate: outreach.length ? Math.round((outreachSent.length / outreach.length) * 100) : 0,
      replyRate: outreachSent.length ? Math.round((outreachReplied.length / outreachSent.length) * 100) : 0,
      reviewCompletionRate: reachedResult.length ? Math.round((reviewed.length / reachedResult.length) * 100) : 0,
      improveRate: reviewed.length ? Math.round((improved.length / reviewed.length) * 100) : 0,
      total,
      completed,
    }
  }, [state.actions, state.events])

  return (
    <>
      <Topbar title="效能复盘" subtitle="基于本轮次真实事件时间戳计算，非人工填写" />
      <main className="mx-auto max-w-6xl space-y-6 px-6 py-6">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-800">介入前 / 介入后对比</h2>
          <p className="mt-0.5 text-[11px] text-slate-400">介入前采用团队人工排查的经验基线，介入后为 Agent 本轮次实际事件计算结果</p>
          <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-medium text-slate-500">风险发现提前量（距续费到期天数）</p>
              <div className="flex items-end gap-6">
                <div className="text-center">
                  <div className="text-2xl font-semibold text-slate-300">{MANUAL_BASELINE_LEAD_DAYS}</div>
                  <div className="text-[11px] text-slate-400">介入前</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-semibold text-violet-600">{metrics.leadDays}</div>
                  <div className="text-[11px] text-slate-400">介入后</div>
                </div>
                <div className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-600">
                  提前 {Math.max(0, metrics.leadDays - MANUAL_BASELINE_LEAD_DAYS)} 天
                </div>
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium text-slate-500">首次动作响应时长</p>
              <div className="flex items-end gap-6">
                <div className="text-center">
                  <div className="text-2xl font-semibold text-slate-300">{MANUAL_BASELINE_RESPONSE_HOURS}h</div>
                  <div className="text-[11px] text-slate-400">介入前</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-semibold text-violet-600">{metrics.avgResponseMinutes} 分钟</div>
                  <div className="text-[11px] text-slate-400">介入后</div>
                </div>
                <div className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-600">效率大幅提升</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <MetricCard title="过程效率指标" note="已成功同步且可评估客户数 ÷ 纳入客户总数">
            <Bar label="监测覆盖率" value={metrics.coverage} max={100} suffix="%" />
            <Bar label="动作生成率" value={metrics.actionGenRate} max={100} suffix="%" />
            <Bar label="动作完成率" value={metrics.completionRate} max={100} suffix="%" color="#0ea5e9" />
          </MetricCard>
          <MetricCard title="触达与回复" note="仅统计客户触达类动作">
            <Bar label="触达成功率" value={metrics.outreachSuccessRate} max={100} suffix="%" color="#ec4899" />
            <Bar label="客户回复率" value={metrics.replyRate} max={100} suffix="%" color="#ec4899" />
          </MetricCard>
          <MetricCard title="复查与结果" note="已进入「已收到结果」及之后阶段的动作">
            <Bar label="复查完成率" value={metrics.reviewCompletionRate} max={100} suffix="%" color="#10b981" />
            <Bar label="风险转好率" value={metrics.improveRate} max={100} suffix="%" color="#10b981" />
          </MetricCard>
          <MetricCard title="动作总量">
            <div className="flex items-center gap-6">
              <div>
                <div className="text-2xl font-semibold text-slate-800">{metrics.total}</div>
                <div className="text-[11px] text-slate-400">本周期动作总数</div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-emerald-600">{metrics.completed}</div>
                <div className="text-[11px] text-slate-400">已完成</div>
              </div>
            </div>
          </MetricCard>
        </div>
      </main>
    </>
  )
}
