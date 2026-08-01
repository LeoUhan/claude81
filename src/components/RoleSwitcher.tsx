import { useState } from 'react'
import { ChevronDown, UserCircle2 } from 'lucide-react'
import { roles, useRole } from '../store/RoleContext'

export default function RoleSwitcher() {
  const [open, setOpen] = useState(false)
  const { role, setRole } = useRole()

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm text-slate-700 shadow-sm transition hover:border-violet-200 hover:shadow"
      >
        <UserCircle2 size={18} className="text-violet-500" />
        <span className="font-medium">{role}</span>
        <ChevronDown size={16} className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-lg">
          {roles.map((r) => (
            <button
              key={r}
              onClick={() => {
                setRole(r)
                setOpen(false)
              }}
              className={`block w-full px-4 py-2.5 text-left text-sm hover:bg-violet-50 ${
                r === role ? 'font-medium text-violet-600' : 'text-slate-600'
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
