import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { ChevronDown, LayoutGrid, ListChecks, ShieldCheck, Sparkles, TrendingUp, Users, SlidersHorizontal, History } from 'lucide-react'
import { roles, useRole } from '../store/RoleContext'
import { useAppStore } from '../store/AppStore'

const ROLE_DEPT: Record<string, string> = {
  客户成功经理: '客户成功',
  销售人员: '销售',
  客户成功主管: '客户成功',
  系统管理员: '系统管理',
}

const ROLE_INITIALS: Record<string, string> = {
  客户成功经理: 'CS',
  销售人员: 'SA',
  客户成功主管: 'SM',
  系统管理员: 'OP',
}

const nav = [
  { to: '/agent', label: 'Agent 对话', icon: Sparkles, highlight: true, roles: null },
  { to: '/', label: '监测总览', icon: LayoutGrid, end: true, roles: null },
  { to: '/customers', label: '客户看板', icon: Users, roles: null },
  { to: '/actions', label: '执行中心', icon: ListChecks, roles: null },
  { to: '/retrospective', label: '复盘', icon: History, roles: null },
  { to: '/efficiency', label: '效能复盘', icon: TrendingUp, roles: ['客户成功主管', '系统管理员'] as const },
  { to: '/settings', label: '规则与设置', icon: SlidersHorizontal, roles: ['系统管理员'] as const },
]

export default function Sidebar() {
  const { role, setRole } = useRole()
  const { state } = useAppStore()
  const [open, setOpen] = useState(false)
  const visibleNav = nav.filter((item) => !item.roles || (item.roles as readonly string[]).includes(role))
  const syncTime = state.lastScanAt
    ? new Date(state.lastScanAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    : '尚未同步'
  return (
    <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col overflow-y-auto border-r border-slate-200 bg-white px-3 py-5 md:flex">
      <div className="mb-6 flex items-center gap-2 px-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white">
          <ShieldCheck size={17} />
        </div>
        <div>
          <div className="text-sm font-bold leading-none text-slate-800">Value-Guard</div>
          <div className="mt-0.5 text-[10px] leading-none text-slate-400">流失预测 · 价值守护 Agent</div>
        </div>
      </div>

      <nav className="flex flex-col gap-0.5">
        {visibleNav.map((item, i) => (
          <div key={item.to}>
            {i === 1 && <div className="my-1.5 border-t border-slate-100" />}
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? item.highlight
                      ? 'bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-sm'
                      : 'bg-violet-50 text-violet-700'
                    : item.highlight
                      ? 'text-violet-600 hover:bg-violet-50'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`
              }
            >
              <item.icon size={17} />
              {item.label}
            </NavLink>
          </div>
        ))}
      </nav>

      <div className="mt-auto space-y-2">
        <div className="rounded-xl bg-blue-50 p-3">
          <div className="flex items-center gap-1.5 text-[12px] font-medium text-blue-700">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            数据连接器已就绪
          </div>
          <div className="mt-0.5 text-[10.5px] text-blue-400">最近同步 · {syncTime}</div>
        </div>

        <div className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left transition hover:bg-slate-50"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-500 text-[11px] font-bold text-white">
              {ROLE_INITIALS[role]}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-slate-800">{role}</div>
              <div className="truncate text-[11px] text-slate-400">{ROLE_DEPT[role]}</div>
            </div>
            <ChevronDown size={15} className={`shrink-0 text-slate-300 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
          {open && (
            <div className="absolute bottom-full left-0 z-20 mb-1.5 w-full overflow-hidden rounded-xl border border-slate-100 bg-white shadow-lg">
              {roles.map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setRole(r)
                    setOpen(false)
                  }}
                  className={`block w-full px-3.5 py-2.5 text-left text-sm hover:bg-violet-50 ${
                    r === role ? 'font-medium text-violet-600' : 'text-slate-600'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
