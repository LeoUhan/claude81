import { useMemo } from 'react'
import Topbar from '../components/Topbar'
import AgentHero from '../components/AgentHero'
import AgentPanel from '../components/AgentPanel'
import RiskQuadrant from '../components/RiskQuadrant'
import PriorityQueue from '../components/PriorityQueue'
import { useAppStore, customerSeed } from '../store/AppStore'
import { useRole } from '../store/RoleContext'
import { buildCustomerView, priorityRank } from '../engine/selectors'
import { buildPriorityQueue } from '../engine/priority'
import { buildHeroEvents } from '../engine/heroStream'

export default function Dashboard() {
  const { state } = useAppStore()
  const { ownerScope } = useRole()

  const views = useMemo(() => {
    const scoped = ownerScope ? customerSeed.filter((c) => c.owner === ownerScope) : customerSeed
    return priorityRank(scoped.map((c) => buildCustomerView(c, state.actions)))
  }, [state.actions, ownerScope])

  const priorityItems = useMemo(() => buildPriorityQueue(views), [views])

  const visibleIds = new Set(views.map((v) => v.customer.id))
  const scopedActions = state.actions.filter((a) => visibleIds.has(a.customerId))

  const highRisk = views.filter((v) => v.health.level === '高风险').length
  const atRisk = views.filter((v) => v.health.level !== '稳定')
  const avgLead =
    atRisk.length > 0 ? Math.round(atRisk.reduce((s, v) => s + v.customer.daysToRenewal, 0) / atRisk.length) : 0
  const peerGapCount = views.filter((v) => v.signals.some((s) => s.type === '同行落后')).length
  const heroEvents = useMemo(() => buildHeroEvents(views, scopedActions), [views, scopedActions])

  return (
    <>
      <Topbar title="工作台" subtitle="客户价值总览与 Agent 实时分析" />
      <main className="mx-auto max-w-7xl space-y-6 px-6 py-6">
        <AgentHero
          monitoredCount={views.length}
          highRisk={highRisk}
          actionCount={scopedActions.length}
          avgLead={avgLead}
          peerGapCount={peerGapCount}
          events={heroEvents}
        />

        <AgentPanel views={views} />

        <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[1.6fr_1fr]">
          <RiskQuadrant views={views} />
          <PriorityQueue items={priorityItems.slice(0, 4)} total={views.length} />
        </div>
      </main>
    </>
  )
}
