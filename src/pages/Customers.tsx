import { useMemo, useState } from 'react'
import Topbar from '../components/Topbar'
import CustomerCard from '../components/CustomerCard'
import { useAppStore, customerSeed } from '../store/AppStore'
import { useRole } from '../store/RoleContext'
import { buildCustomerView, priorityRank } from '../engine/selectors'
import { RiskLevel } from '../types'

const filters: Array<RiskLevel | '全部'> = ['全部', '高风险', '预警', '稳定']

export default function Customers() {
  const { state } = useAppStore()
  const { ownerScope } = useRole()
  const [filter, setFilter] = useState<RiskLevel | '全部'>('全部')

  const views = useMemo(() => {
    const scoped = ownerScope ? customerSeed.filter((c) => c.owner === ownerScope) : customerSeed
    return priorityRank(scoped.map((c) => buildCustomerView(c, state.actions)))
  }, [state.actions, ownerScope])

  const visible = filter === '全部' ? views : views.filter((v) => v.health.level === filter)

  return (
    <>
      <Topbar title="客户" subtitle={`按优先级排序 · 共 ${views.length} 家`} />
      <main className="mx-auto max-w-7xl space-y-4 px-6 py-6">
        <div className="flex gap-1.5">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                filter === f ? 'bg-violet-600 text-white' : 'border border-slate-200 bg-white text-slate-500 hover:text-slate-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((v) => (
            <CustomerCard key={v.customer.id} view={v} />
          ))}
        </div>
      </main>
    </>
  )
}
