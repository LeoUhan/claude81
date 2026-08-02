import { useMemo, useState } from 'react'
import { CheckCircle2, XCircle, Eye, Users, Timer } from 'lucide-react'
import Topbar from '../components/Topbar'
import StatTile from '../components/StatTile'
import { useAppStore, customerSeed } from '../store/AppStore'
import { useRole } from '../store/RoleContext'
import { buildCustomerView } from '../engine/selectors'
import {
  buildCustomerOutcomes,
  buildCsmSummary,
  buildConversionStats,
  csmName,
  CustomerOutcome,
  ConversionStat,
} from '../engine/outcome'
import { actionTypeStyle } from '../ui/styles'
import { ActionRecord, SignalType } from '../types'

const OUTCOME_DOT: Record<CustomerOutcome['outcome'], string> = {
  已续费: 'bg-emerald-500',
  已流失: 'bg-rose-500',
  观察中: 'bg-slate-400',
}
const OUTCOME_PILL: Record<CustomerOutcome['outcome'], string> = {
  已续费: 'bg-emerald-50 text-emerald-700',
  已流失: 'bg-rose-50 text-rose-700',
  观察中: 'bg-slate-100 text-slate-500',
}

const CSM_OWNERS = ['CSM-001', 'CSM-002', 'CSM-003']

function Pager({ page, pageCount, onChange }: { page: number; pageCount: number; onChange: (p: number) => void }) {
  if (pageCount <= 1) return null
  return (
    <div className="mt-3 flex items-center justify-end gap-1.5 border-t border-slate-100 pt-3">
      <button
        onClick={() => onChange(Math.max(0, page - 1))}
        disabled={page === 0}
        className="rounded-md px-2 py-1 text-xs text-slate-400 hover:bg-slate-50 disabled:opacity-30"
      >
        ‹
      </button>
      {Array.from({ length: pageCount }, (_, i) => (
        <button
          key={i}
          onClick={() => onChange(i)}
          className={`h-6 w-6 rounded-md text-xs font-medium ${
            i === page ? 'bg-violet-600 text-white' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          {i + 1}
        </button>
      ))}
      <button
        onClick={() => onChange(Math.min(pageCount - 1, page + 1))}
        disabled={page === pageCount - 1}
        className="rounded-md px-2 py-1 text-xs text-slate-400 hover:bg-slate-50 disabled:opacity-30"
      >
        ›
      </button>
    </div>
  )
}

function Panel({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
        {note && <span className="text-[11px] text-slate-400">{note}</span>}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  )
}

function DumbbellRow({ outcome }: { outcome: CustomerOutcome }) {
  const { customer, beforeScore, afterScore, outcome: status } = outcome
  const lo = Math.min(beforeScore, afterScore)
  const hi = Math.max(beforeScore, afterScore)
  const lineColor = status === '已续费' ? '#a7f3d0' : status === '已流失' ? '#fecdd3' : '#e2e8f0'
  const afterDotColor = status === '已续费' ? '#059669' : status === '已流失' ? '#e11d48' : '#94a3b8'
  const resultClass = status === '已续费' ? 'text-emerald-600' : status === '已流失' ? 'text-rose-600' : 'text-slate-400'
  return (
    <div className="grid grid-cols-[1fr_2fr_90px] items-center gap-4 border-b border-slate-50 py-3.5 last:border-b-0">
      <div className="min-w-0">
        <div className="truncate text-sm font-medium text-slate-800">{customer.name}</div>
        <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-400">
          <span className={`h-1.5 w-1.5 rounded-full ${OUTCOME_DOT[status]}`} />
          {status}
        </div>
      </div>
      <div className="relative mx-2 h-1 rounded-full bg-slate-100">
        <div
          className="absolute top-0 h-1 rounded-full"
          style={{ left: `${Math.min(lo, hi)}%`, width: `${Math.max(2, hi - lo)}%`, background: lineColor }}
        />
        <div
          className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-white shadow"
          style={{ left: `${beforeScore}%`, background: '#cbd5e1' }}
        />
        <div
          className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-white shadow"
          style={{ left: `${afterScore}%`, background: afterDotColor }}
        />
      </div>
      <div className={`text-right text-xs font-semibold ${resultClass}`}>
        {beforeScore} → {afterScore}
      </div>
    </div>
  )
}

function SignalComposition({ signals }: { signals: SignalType[] }) {
  const counts = new Map<SignalType, number>()
  signals.forEach((s) => counts.set(s, (counts.get(s) ?? 0) + 1))
  const rows = [...counts.entries()].sort((a, b) => b[1] - a[1])
  const max = Math.max(1, ...rows.map((r) => r[1]))
  if (rows.length === 0) return <p className="text-xs text-slate-400">本周期暂无新增信号</p>
  return (
    <div className="space-y-2.5">
      {rows.map(([type, count]) => (
        <div key={type} className="flex items-center gap-3">
          <span className="w-20 shrink-0 text-xs text-slate-500">{type}</span>
          <div className="h-2 flex-1 rounded-full bg-slate-100">
            <div className="h-2 rounded-full bg-violet-400" style={{ width: `${(count / max) * 100}%` }} />
          </div>
          <span className="w-6 shrink-0 text-right text-xs font-semibold text-slate-700">{count}</span>
        </div>
      ))}
    </div>
  )
}

function ConversionList({ stats }: { stats: ConversionStat[] }) {
  if (stats.length === 0) return <p className="text-xs text-slate-400">本周期暂无可统计的动作</p>
  return (
    <div className="space-y-3">
      {stats.map((s) => {
        const style = actionTypeStyle[s.type]
        return (
          <div key={s.type} className="flex items-center gap-3">
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold ${style.badgeBg} ${style.badgeText}`}>
              {s.type.slice(0, 1)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between text-xs">
                <span className="font-medium text-slate-700">{s.type}</span>
                <span className="text-slate-400">
                  {s.converted}/{s.total}
                </span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-slate-100">
                <div className="h-1.5 rounded-full" style={{ width: `${s.rate}%`, background: style.accent }} />
              </div>
            </div>
            <span className="w-10 shrink-0 text-right text-base font-bold text-slate-800">{s.rate}%</span>
          </div>
        )
      })}
    </div>
  )
}

function ConversionColumns({ stats }: { stats: ConversionStat[] }) {
  if (stats.length === 0) return <p className="text-xs text-slate-400">本周期暂无可统计的动作</p>
  return (
    <div className="flex h-48 items-end gap-6 pl-8">
      <div className="relative flex h-full flex-1 items-end gap-6">
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between text-[10px] text-slate-300">
          {[100, 75, 50, 25, 0].map((v) => (
            <div key={v} className="flex items-center gap-1">
              <span className="-ml-7 w-6 text-right">{v}</span>
              <span className="h-px flex-1 bg-slate-100" />
            </div>
          ))}
        </div>
        {stats.map((s) => {
          const style = actionTypeStyle[s.type]
          return (
            <div key={s.type} className="relative z-10 flex flex-1 flex-col items-center justify-end gap-2">
              <span className="text-xs font-bold text-slate-700">{s.rate}%</span>
              <div
                className="w-8 rounded-t-md"
                style={{ height: `${Math.max(4, (s.rate / 100) * 140)}px`, background: style.accent }}
              />
              <span className="text-[11px] text-slate-500">{s.type}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function usePage(total: number, pageSize: number) {
  const [page, setPage] = useState(0)
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const clamped = Math.min(page, pageCount - 1)
  return { page: clamped, setPage, pageCount }
}

function PersonalView({ owner, actions }: { owner: string; actions: ActionRecord[] }) {
  const myCustomers = useMemo(() => customerSeed.filter((c) => c.owner === owner), [owner])
  const outcomes = useMemo(() => buildCustomerOutcomes(myCustomers, actions), [myCustomers, actions])
  const myActions = useMemo(() => actions.filter((a) => myCustomers.some((c) => c.id === a.customerId)), [myCustomers, actions])
  const conversion = useMemo(() => buildConversionStats(myActions), [myActions])
  const signals = useMemo(
    () => myCustomers.flatMap((c) => buildCustomerView(c, actions).signals.map((s) => s.type)),
    [myCustomers, actions],
  )

  const renewed = outcomes.filter((o) => o.outcome === '已续费').length
  const churned = outcomes.filter((o) => o.outcome === '已流失').length
  const observing = outcomes.length - renewed - churned
  const resolved = renewed + churned

  const reviewedActions = myActions.filter((a) => a.reviewOutcome)
  const avgHours =
    reviewedActions.length > 0
      ? Math.round(
          reviewedActions.reduce((sum, a) => {
            const done = a.history[a.history.length - 1]?.at ?? a.createdAt
            return sum + Math.max(0, (new Date(done).getTime() - new Date(a.createdAt).getTime()) / 3_600_000)
          }, 0) / reviewedActions.length,
        )
      : null

  const { page, setPage, pageCount } = usePage(outcomes.length, 7)
  const pageRows = outcomes.slice(page * 7, page * 7 + 7)

  const recentActions = useMemo(
    () => [...myActions].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 8),
    [myActions],
  )

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-6 py-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-violet-600">Personal Retrospective</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">我负责的 {myCustomers.length} 家客户，结果如何？</h1>
        <p className="mt-1.5 max-w-2xl text-[13px] text-slate-500">
          按客户真实终局状态（已续费 / 已流失 / 观察中）与本周期我执行的动作记录统计，不含团队其他成员数据。
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <StatTile icon={Users} label="我负责客户" value={String(myCustomers.length)} accent="linear-gradient(135deg,#7c3aed,#d946ef)" />
        <StatTile icon={CheckCircle2} label="已续费" value={String(renewed)} sub={resolved > 0 ? `续费率 ${Math.round((renewed / resolved) * 100)}%` : '暂无已确认结果'} accent="#059669" />
        <StatTile icon={XCircle} label="已流失" value={String(churned)} accent="#e11d48" />
        <StatTile icon={Eye} label="观察中" value={String(observing)} accent="#64748b" />
        <StatTile icon={Timer} label="平均复查时长" value={avgHours != null ? `${avgHours}h` : '—'} accent="#0ea5e9" />
      </div>

      <Panel title="客户健康度变化" note="动作介入前 → 当前">
        {pageRows.map((o) => (
          <DumbbellRow key={o.customer.id} outcome={o} />
        ))}
        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
          <span>共 {outcomes.length} 家客户</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-slate-300" />介入前</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-600" />当前（已续费）</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-600" />当前（已流失）</span>
          </div>
        </div>
        <Pager page={page} pageCount={pageCount} onChange={setPage} />
      </Panel>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel title="本周期信号构成" note="全部我负责客户当前信号">
          <SignalComposition signals={signals} />
        </Panel>
        <Panel title="各类动作转化率" note="转化 = 复查结论已改善 / 已完成">
          <ConversionList stats={conversion} />
        </Panel>
      </div>

      <Panel title="我处理过的动作" note="按时间倒序，最近 8 条">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-[11px] text-slate-400">
                <th className="pb-2 font-medium">类型</th>
                <th className="pb-2 font-medium">客户</th>
                <th className="pb-2 font-medium">动作</th>
                <th className="pb-2 font-medium">结果</th>
                <th className="pb-2 font-medium">时间</th>
              </tr>
            </thead>
            <tbody>
              {recentActions.map((a) => {
                const style = actionTypeStyle[a.type]
                const customer = customerSeed.find((c) => c.id === a.customerId)
                return (
                  <tr key={a.id} className="border-t border-slate-50">
                    <td className="py-2.5 pr-3">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${style.badgeBg} ${style.badgeText}`}>{a.type}</span>
                    </td>
                    <td className="py-2.5 pr-3 text-slate-600">{customer?.name ?? a.customerId}</td>
                    <td className="max-w-[220px] truncate py-2.5 pr-3 text-slate-600">{a.purpose}</td>
                    <td className="py-2.5 pr-3 text-slate-500">{a.status}</td>
                    <td className="py-2.5 text-[11px] text-slate-400">{new Date(a.createdAt).toLocaleDateString('zh-CN')}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </main>
  )
}

function TeamView({ actions }: { actions: ActionRecord[] }) {
  const outcomes = useMemo(() => buildCustomerOutcomes(customerSeed, actions), [actions])
  const csmStats = useMemo(
    () => [...CSM_OWNERS.map((o) => buildCsmSummary(o, customerSeed, actions))].sort((a, b) => b.renewalRate - a.renewalRate),
    [actions],
  )
  const conversion = useMemo(() => buildConversionStats(actions), [actions])
  const signals = useMemo(
    () => customerSeed.flatMap((c) => buildCustomerView(c, actions).signals.map((s) => s.type)),
    [actions],
  )

  const renewed = outcomes.filter((o) => o.outcome === '已续费').length
  const churned = outcomes.filter((o) => o.outcome === '已流失').length
  const observing = outcomes.length - renewed - churned
  const resolved = renewed + churned
  const overallRate = resolved > 0 ? Math.round((renewed / resolved) * 100) : null

  const { page, setPage, pageCount } = usePage(outcomes.length, 8)
  const pageRows = outcomes.slice(page * 8, page * 8 + 8)

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-6 py-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-violet-600">Team Retrospective</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">
          团队 {customerSeed.length} 家客户{overallRate != null ? `，整体续费率 ${overallRate}%` : '，本周期暂无已确认结果'}
        </h1>
        <p className="mt-1.5 max-w-2xl text-[13px] text-slate-500">不做个人过滤，按 CSM 分组对比结果与动作产出，用于团队复盘和资源调配判断。</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile icon={Users} label="团队客户总数" value={String(customerSeed.length)} accent="linear-gradient(135deg,#7c3aed,#d946ef)" />
        <StatTile icon={CheckCircle2} label="已续费" value={String(renewed)} sub={overallRate != null ? `续费率 ${overallRate}%` : '暂无已确认结果'} accent="#059669" />
        <StatTile icon={XCircle} label="已流失" value={String(churned)} accent="#e11d48" />
        <StatTile icon={Eye} label="观察中" value={String(observing)} accent="#64748b" />
      </div>

      <Panel title="按 CSM 对比" note="客户成功经理个人业绩，用于团队内横向比较">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-[11px] text-slate-400">
              <th className="pb-2 font-medium">负责人</th>
              <th className="pb-2 font-medium">客户数</th>
              <th className="pb-2 font-medium">已续费</th>
              <th className="pb-2 font-medium">已流失</th>
              <th className="pb-2 font-medium">动作完成率</th>
              <th className="pb-2 font-medium">续费率</th>
            </tr>
          </thead>
          <tbody>
            {csmStats.map((s) => (
              <tr key={s.owner} className="border-t border-slate-50">
                <td className="py-3 pr-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-500 text-[11px] font-bold text-white">
                      {s.name.slice(0, 1)}
                    </span>
                    <div>
                      <div className="text-sm font-semibold text-slate-800">{s.name}</div>
                      <div className="text-[11px] text-slate-400">{s.owner}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3 pr-3 font-semibold text-slate-700">{s.customerCount}</td>
                <td className="py-3 pr-3 font-semibold text-emerald-600">{s.renewed}</td>
                <td className="py-3 pr-3 font-semibold text-rose-600">{s.churned}</td>
                <td className="py-3 pr-3 text-slate-500">{s.completionRate}%</td>
                <td className="py-3 pr-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-1.5 w-28 rounded-full bg-slate-100">
                      <div className="h-1.5 rounded-full bg-violet-600" style={{ width: `${s.renewalRate}%` }} />
                    </div>
                    <span className="text-sm font-bold text-slate-800">{s.renewalRate}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      <Panel title="全部客户" note={`共 ${outcomes.length} 家客户`}>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-[11px] text-slate-400">
              <th className="pb-2 font-medium">客户</th>
              <th className="pb-2 font-medium">负责人</th>
              <th className="pb-2 font-medium">健康度</th>
              <th className="pb-2 font-medium">续费窗口</th>
              <th className="pb-2 font-medium">结果</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((o) => (
              <tr key={o.customer.id} className="border-t border-slate-50">
                <td className="max-w-[200px] truncate py-2.5 pr-3 text-slate-700">{o.customer.name}</td>
                <td className="py-2.5 pr-3 text-slate-500">{csmName(o.customer.owner)}</td>
                <td className="py-2.5 pr-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 rounded-full bg-slate-100">
                      <div className="h-1.5 rounded-full bg-violet-500" style={{ width: `${o.afterScore}%` }} />
                    </div>
                    <span className="text-xs text-slate-500">{o.afterScore}</span>
                  </div>
                </td>
                <td className="py-2.5 pr-3 text-slate-500">{o.customer.daysToRenewal} 天</td>
                <td className="py-2.5 pr-3">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${OUTCOME_PILL[o.outcome]}`}>{o.outcome}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pager page={page} pageCount={pageCount} onChange={setPage} />
      </Panel>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel title="团队信号构成" note="全部客户当前信号">
          <SignalComposition signals={signals} />
        </Panel>
        <Panel title="各类动作转化率" note="全团队口径">
          <ConversionColumns stats={conversion} />
        </Panel>
      </div>
    </main>
  )
}

export default function Retrospective() {
  const { state } = useAppStore()
  const { role, ownerScope } = useRole()

  return (
    <>
      <Topbar title="复盘" subtitle={ownerScope ? `${csmName(ownerScope)} · ${role}` : `${role} · 团队`} />
      {ownerScope ? <PersonalView owner={ownerScope} actions={state.actions} /> : <TeamView actions={state.actions} />}
    </>
  )
}
