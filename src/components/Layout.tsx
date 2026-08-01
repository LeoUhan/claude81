import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import AgentDrawer from './AgentDrawer'

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
      <AgentDrawer />
    </div>
  )
}
