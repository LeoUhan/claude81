import { useMemo, useState } from 'react'
import Topbar from '../components/Topbar'
import ActionCard from '../components/ActionCard'
import { useAppStore, customerSeed } from '../store/AppStore'
import { useRole } from '../store/RoleContext'
import { ActionStatus } from '../types'

const statusGroups: Array<ActionStatus | '全部'> = [
  '全部',
  '待确认',
  '已批准',
  '等待客户结果',
  '已收到结果',
  '需升级',
  '已完成',
  '已取消',
]

export default function Actions() {
  const { state } = useAppStore()
  const { ownerScope } = useRole()
  const [filter, setFilter] = useState<ActionStatus | '全部'>('全部')

  const customerById = useMemo(() => new Map(customerSeed.map((c) => [c.id, c])), [])

  const scoped = useMemo(() => {
    let list = state.actions
    if (ownerScope) list = list.filter((a) => customerById.get(a.customerId)?.owner === ownerScope)
    if (filter !== '全部') list = list.filter((a) => a.status === filter)
    return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [state.actions, ownerScope, filter, customerById])

  const counts = statusGroups.map((s) => ({
    status: s,
    n: s === '全部' ? state.actions.length : state.actions.filter((a) => a.status === s).length,
  }))

  return (
    <>
      <Topbar title="动作中心" subtitle="跨客户的动作队列，覆盖生成→确认→执行→复查全生命周期" />
      <main className="mx-auto max-w-6xl space-y-4 px-6 py-6">
        <div className="flex flex-wrap gap-1.5">
          {counts.map(({ status, n }) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                filter === status ? 'bg-violet-600 text-white' : 'border border-slate-200 bg-white text-slate-500 hover:text-slate-700'
              }`}
            >
              {status} <span className="text-[10px] opacity-70">({n})</span>
            </button>
          ))}
        </div>

        {scoped.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">
            当前筛选条件下暂无动作
          </div>
        ) : (
          <div className="space-y-3">
            {scoped.map((a) => (
              <ActionCard key={a.id} action={a} customerName={customerById.get(a.customerId)?.name} />
            ))}
          </div>
        )}
      </main>
    </>
  )
}
