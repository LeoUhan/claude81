import { useState } from 'react'
import { RefreshCw, Search } from 'lucide-react'
import RoleSwitcher from './RoleSwitcher'
import { useAppStore } from '../store/AppStore'

export default function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  const { dispatch, state } = useAppStore()
  const [scanning, setScanning] = useState(false)

  function runScan() {
    setScanning(true)
    dispatch({ kind: 'SCAN' })
    setTimeout(() => setScanning(false), 500)
  }

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur">
      <div>
        <h1 className="text-lg font-semibold text-slate-800">{title}</h1>
        {subtitle && <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-400 md:flex">
          <Search size={15} />
          <input
            placeholder="搜索客户 / 动作"
            className="w-40 bg-transparent text-slate-600 outline-none placeholder:text-slate-300"
          />
        </div>
        <button
          onClick={runScan}
          className="flex items-center gap-1.5 rounded-full bg-slate-900 px-3.5 py-1.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-60"
          disabled={scanning}
        >
          <RefreshCw size={14} className={scanning ? 'animate-spin' : ''} />
          运行本轮扫描
        </button>
        <RoleSwitcher />
      </div>
      {state.lastScanAt && (
        <span className="sr-only">上次扫描：{new Date(state.lastScanAt).toLocaleString()}</span>
      )}
    </header>
  )
}
