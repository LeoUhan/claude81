import { Sparkles, X } from 'lucide-react'
import { useAgent } from '../store/AgentContext'
import AgentThread from './AgentThread'

export default function AgentDrawer() {
  const { isDrawerOpen, closeDrawer } = useAgent()

  return (
    <>
      <div
        onClick={closeDrawer}
        className={`fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-[1px] transition-opacity ${
          isDrawerOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />
      <aside
        className={`fixed right-0 top-0 z-50 flex h-screen w-full max-w-md flex-col border-l border-slate-200 bg-slate-50 shadow-2xl transition-transform duration-300 ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white">
              <Sparkles size={16} />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-800">与 Agent 处理</div>
              <div className="text-[11px] text-slate-400">同一个对话，随时可以继续问</div>
            </div>
          </div>
          <button onClick={closeDrawer} className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X size={16} />
          </button>
        </div>
        <div className="min-h-0 flex-1">
          <AgentThread compact />
        </div>
      </aside>
    </>
  )
}
