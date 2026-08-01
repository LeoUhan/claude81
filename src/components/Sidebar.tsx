import { NavLink } from 'react-router-dom'
import { LayoutGrid, ListChecks, ShieldCheck, TrendingUp, Users, SlidersHorizontal } from 'lucide-react'

const nav = [
  { to: '/', label: '工作台', icon: LayoutGrid, end: true },
  { to: '/customers', label: '客户', icon: Users },
  { to: '/actions', label: '动作中心', icon: ListChecks },
  { to: '/efficiency', label: '效能复盘', icon: TrendingUp },
  { to: '/settings', label: '规则与设置', icon: SlidersHorizontal },
]

export default function Sidebar() {
  return (
    <aside className="hidden w-56 shrink-0 flex-col border-r border-slate-200 bg-white px-3 py-5 md:flex">
      <div className="mb-6 flex items-center gap-2 px-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white">
          <ShieldCheck size={17} />
        </div>
        <div>
          <div className="text-sm font-bold leading-none text-slate-800">Value-Guard</div>
          <div className="mt-0.5 text-[10px] leading-none text-slate-400">客户价值守护 Agent</div>
        </div>
      </div>

      <nav className="flex flex-col gap-0.5">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive ? 'bg-violet-50 text-violet-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`
            }
          >
            <item.icon size={17} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto rounded-xl bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-400">
        比赛原型 · 全部数据为构造样例，
        <br />
        正式产品需接入授权数据源。
      </div>
    </aside>
  )
}
