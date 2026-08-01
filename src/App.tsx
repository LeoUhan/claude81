import { useMemo, useState } from 'react'
import { AlarmClockCheck, ListChecks, ShieldAlert, Users } from 'lucide-react'
import AgentPanel from './components/AgentPanel'
import StatTile from './components/StatTile'
import RoleSwitcher from './components/RoleSwitcher'
import CustomerCard from './components/CustomerCard'
import { customers, RiskLevel } from './data/customers'

const statusOrder: Record<RiskLevel, number> = { 高风险: 0, 预警: 1, 稳定: 2 }

const filters: Array<RiskLevel | '全部'> = ['全部', '高风险', '预警', '稳定']

function App() {
  const [filter, setFilter] = useState<RiskLevel | '全部'>('全部')

  const sorted = useMemo(
    () =>
      [...customers].sort((a, b) => {
        if (statusOrder[a.status] !== statusOrder[b.status]) return statusOrder[a.status] - statusOrder[b.status]
        if (a.daysToRenewal !== b.daysToRenewal) return a.daysToRenewal - b.daysToRenewal
        return a.health - b.health
      }),
    [],
  )

  const visible = filter === '全部' ? sorted : sorted.filter((c) => c.status === filter)

  const highRiskCount = customers.filter((c) => c.status === '高风险').length

  return (
    <div className="min-h-screen px-6 py-6 md:px-10 md:py-8">
      <header className="mx-auto mb-6 flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-sky-500 text-white shadow shadow-fuchsia-200">
            <ShieldAlert size={18} />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight text-slate-800">
              Value<span className="text-gradient">-Guard</span>
            </h1>
            <p className="text-[11px] leading-none text-slate-400">B2B 建站客户价值守护 Agent</p>
          </div>
        </div>
        <RoleSwitcher />
      </header>

      <main className="mx-auto max-w-7xl space-y-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatTile
            icon={Users}
            label="纳入监测客户"
            value="12 家"
            sub="监测覆盖率 100%"
            accent="linear-gradient(135deg,#7c3aed,#a78bfa)"
            delay={0}
          />
          <StatTile
            icon={ShieldAlert}
            label="待处理高风险"
            value={`${highRiskCount} 家`}
            sub="较上周期 +1"
            accent="linear-gradient(135deg,#f43f5e,#fb7185)"
            delay={0.05}
          />
          <StatTile
            icon={ListChecks}
            label="本周期动作"
            value="27 项"
            sub="18 项已完成"
            accent="linear-gradient(135deg,#0ea5e9,#38bdf8)"
            delay={0.1}
          />
          <StatTile
            icon={AlarmClockCheck}
            label="风险发现提前量"
            value="平均 41 天"
            sub="早于人工排查"
            accent="linear-gradient(135deg,#ec4899,#f472b6)"
            delay={0.15}
          />
        </div>

        <AgentPanel />

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">客户风险总览</h2>
            <div className="flex gap-1.5">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    filter === f
                      ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow shadow-fuchsia-200'
                      : 'glass text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visible.map((c, i) => (
              <CustomerCard key={c.id} c={c} delay={i * 0.03} />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
