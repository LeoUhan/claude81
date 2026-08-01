import Topbar from '../components/Topbar'
import { useAppStore } from '../store/AppStore'
import { HEALTH_WEIGHTS, RULE_VERSION } from '../engine/health'

const DIM_LABEL: Record<string, string> = {
  usage: '使用与运营活跃度',
  website: '网站表现',
  inquiry: '询盘与转化',
  contract: '合同与续费阶段',
  action: '动作与结果反馈',
}

const connectors = [
  { name: '建站平台后台', status: '已连接（模拟数据）' },
  { name: '网站统计埋点', status: '已连接（模拟数据）' },
  { name: '询盘 / 表单系统', status: '已连接（模拟数据）' },
  { name: '合同与订单系统', status: '已连接（模拟数据）' },
  { name: '企业微信 / 邮件触达', status: '已连接（模拟发送）' },
  { name: '网站内容发布系统', status: '已连接（模拟发布）' },
]

export default function Settings() {
  const { state } = useAppStore()
  const recentAudit = [...state.events].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 20)

  return (
    <>
      <Topbar title="规则与设置" subtitle="健康度权重、连接器状态与审计日志" />
      <main className="mx-auto max-w-5xl space-y-6 px-6 py-6">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">健康度权重配置</h2>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-500">{RULE_VERSION}</span>
          </div>
          <table className="mt-3 w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
                <th className="py-1.5 font-medium">维度</th>
                <th className="py-1.5 font-medium">权重</th>
              </tr>
            </thead>
            <tbody>
              {(Object.keys(HEALTH_WEIGHTS) as Array<keyof typeof HEALTH_WEIGHTS>).map((k) => (
                <tr key={k} className="border-b border-slate-50">
                  <td className="py-1.5 text-slate-600">{DIM_LABEL[k]}</td>
                  <td className="py-1.5 font-medium text-slate-800">{Math.round(HEALTH_WEIGHTS[k] * 100)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-[11px] text-slate-400">权重变更需保留生效时间与版本，避免历史结论在无记录情况下被重新解释。</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-800">连接器状态</h2>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {connectors.map((c) => (
              <div key={c.name} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                <span className="text-slate-600">{c.name}</span>
                <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-800">审计日志（最近 20 条）</h2>
          <ul className="mt-3 space-y-1.5">
            {recentAudit.map((e) => (
              <li key={e.id} className="text-xs text-slate-500">
                <span className="text-slate-400">{new Date(e.at).toLocaleString()}</span> · {e.kind} · {e.detail}
              </li>
            ))}
          </ul>
        </div>
      </main>
    </>
  )
}
