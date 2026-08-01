import { useMemo } from 'react'
import { AlarmClockCheck, ListChecks, ShieldAlert, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import Topbar from '../components/Topbar'
import StatTile from '../components/StatTile'
import AgentPanel from '../components/AgentPanel'
import CustomerCard from '../components/CustomerCard'
import { useAppStore, customerSeed } from '../store/AppStore'
import { useRole } from '../store/RoleContext'
import { buildCustomerView, priorityRank } from '../engine/selectors'

export default function Dashboard() {
  const { state } = useAppStore()
  const { ownerScope } = useRole()

  const views = useMemo(() => {
    const scoped = ownerScope ? customerSeed.filter((c) => c.owner === ownerScope) : customerSeed
    return priorityRank(scoped.map((c) => buildCustomerView(c, state.actions)))
  }, [state.actions, ownerScope])

  const visibleIds = new Set(views.map((v) => v.customer.id))
  const scopedActions = state.actions.filter((a) => visibleIds.has(a.customerId))

  const highRisk = views.filter((v) => v.health.level === '高风险').length
  const completed = scopedActions.filter((a) => a.status === '已完成').length
  const atRisk = views.filter((v) => v.health.level !== '稳定')
  const avgLead =
    atRisk.length > 0 ? Math.round(atRisk.reduce((s, v) => s + v.customer.daysToRenewal, 0) / atRisk.length) : 0

  return (
    <>
      <Topbar title="工作台" subtitle="客户价值总览与 Agent 实时分析" />
      <main className="mx-auto max-w-7xl space-y-6 px-6 py-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatTile icon={Users} label="纳入监测客户" value={`${views.length} 家`} sub="监测覆盖率 100%" accent="linear-gradient(135deg,#7c3aed,#a78bfa)" />
          <StatTile icon={ShieldAlert} label="待处理高风险" value={`${highRisk} 家`} sub="按优先级已排序" accent="linear-gradient(135deg,#f43f5e,#fb7185)" />
          <StatTile icon={ListChecks} label="本周期动作" value={`${scopedActions.length} 项`} sub={`${completed} 项已完成`} accent="linear-gradient(135deg,#0ea5e9,#38bdf8)" />
          <StatTile icon={AlarmClockCheck} label="风险客户平均续费窗口" value={`${avgLead} 天`} sub="早于人工逐家排查" accent="linear-gradient(135deg,#ec4899,#f472b6)" />
        </div>

        <AgentPanel views={views} />

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">最需要关注的客户</h2>
            <Link to="/customers" className="text-xs font-medium text-violet-600 hover:underline">
              查看全部客户 →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {views.slice(0, 8).map((v) => (
              <CustomerCard key={v.customer.id} view={v} />
            ))}
          </div>
        </div>
      </main>
    </>
  )
}
