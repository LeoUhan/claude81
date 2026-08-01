import { createContext, useContext, useMemo, useState } from 'react'

export type Role = '客户成功经理' | '销售人员' | '客户成功主管' | '系统管理员'

export const roles: Role[] = ['客户成功经理', '销售人员', '客户成功主管', '系统管理员']

interface RoleCtx {
  role: Role
  setRole: (r: Role) => void
  /** 当前身份可见的客户负责人范围；null 表示不做负责人限制（主管/管理员可见全团队） */
  ownerScope: string | null
  canApprove: boolean
}

const Ctx = createContext<RoleCtx | null>(null)

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>('客户成功经理')

  const value = useMemo<RoleCtx>(() => {
    const ownerScope = role === '客户成功经理' || role === '销售人员' ? 'CSM-001' : null
    const canApprove = role !== '系统管理员'
    return { role, setRole, ownerScope, canApprove }
  }, [role])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useRole() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useRole 必须在 RoleProvider 内使用')
  return ctx
}
