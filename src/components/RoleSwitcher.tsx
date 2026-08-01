import { useState } from 'react'
import { ChevronDown, UserCircle2 } from 'lucide-react'

const roles = ['客户成功经理', '销售人员', '客户成功主管', '系统管理员']

export default function RoleSwitcher() {
  const [open, setOpen] = useState(false)
  const [role, setRole] = useState(roles[0])

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="glass gradient-border flex items-center gap-2 rounded-full px-3.5 py-2 text-sm text-slate-700 shadow-sm transition hover:shadow-md"
      >
        <UserCircle2 size={18} className="text-violet-500" />
        <span className="font-medium">{role}</span>
        <ChevronDown size={16} className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="glass-strong absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-xl shadow-lg">
          {roles.map((r) => (
            <button
              key={r}
              onClick={() => {
                setRole(r)
                setOpen(false)
              }}
              className={`block w-full px-4 py-2.5 text-left text-sm hover:bg-violet-50 ${
                r === role ? 'text-violet-600 font-medium' : 'text-slate-600'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
