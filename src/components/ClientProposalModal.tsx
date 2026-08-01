import { createPortal } from 'react-dom'
import { AlertTriangle, CheckCircle2, Download, TrendingDown, TrendingUp, X } from 'lucide-react'
import { ProposalDoc } from '../engine/proposal'

const SEVERITY_STYLE: Record<'high' | 'medium' | 'low', { border: string; badgeBg: string; badgeText: string; label: string }> = {
  high: { border: 'border-l-rose-400', badgeBg: 'bg-rose-50', badgeText: 'text-rose-600', label: '高优先级' },
  medium: { border: 'border-l-amber-400', badgeBg: 'bg-amber-50', badgeText: 'text-amber-600', label: '中优先级' },
  low: { border: 'border-l-slate-300', badgeBg: 'bg-slate-100', badgeText: 'text-slate-500', label: '待观察' },
}

function healthColor(score: number) {
  if (score < 50) return '#f43f5e'
  if (score < 80) return '#f59e0b'
  return '#10b981'
}

function Gauge({ value }: { value: number }) {
  const size = 84
  const stroke = 8
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference
  const color = healthColor(value)
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(148,163,184,0.2)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold" style={{ color }}>
          {value}
        </span>
        <span className="text-[9px] text-slate-400">健康度</span>
      </div>
    </div>
  )
}

function CompareBar({ label, mine, peer, unit }: { label: string; mine: number; peer: number; unit: string }) {
  const max = Math.max(mine, peer, 1)
  return (
    <div>
      <div className="flex items-center justify-between text-[11px] text-slate-500">
        <span>{label}</span>
        <span>
          本方 <b className="text-slate-700">{mine}</b>
          {unit} · 同行 <b className="text-slate-700">{peer}</b>
          {unit}
        </span>
      </div>
      <div className="mt-1 space-y-1">
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-violet-500" style={{ width: `${(mine / max) * 100}%` }} />
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-slate-300" style={{ width: `${(peer / max) * 100}%` }} />
        </div>
      </div>
    </div>
  )
}

function TrendTile({ label, pct }: { label: string; pct: number }) {
  const positive = pct >= 0
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-2.5">
      <p className="text-[10px] text-slate-400">{label}</p>
      <p className={`mt-0.5 flex items-center gap-1 text-sm font-semibold ${positive ? 'text-emerald-600' : 'text-rose-600'}`}>
        {positive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
        {positive ? '+' : ''}
        {pct}%
      </p>
    </div>
  )
}

export default function ClientProposalModal({ doc, onClose }: { doc: ProposalDoc; onClose: () => void }) {
  const portalTarget = document.getElementById('root') ?? document.body
  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-slate-900/50 p-6 print:bg-white print:p-0">
      <div className="sticky top-0 z-10 mb-4 flex w-full max-w-[860px] items-center justify-end gap-2 print:hidden">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 rounded-full bg-violet-600 px-3.5 py-1.5 text-xs font-medium text-white shadow hover:bg-violet-700"
        >
          <Download size={13} />
          导出 PDF
        </button>
        <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-500 shadow hover:bg-slate-50">
          <X size={16} />
        </button>
      </div>

      <div
        id="proposal-print-area"
        className="w-full max-w-[860px] rounded-lg bg-white shadow-2xl print:rounded-none print:shadow-none"
      >
        <div className="flex items-center justify-between rounded-t-lg bg-gradient-to-r from-slate-900 to-slate-700 px-8 py-6 text-white print:rounded-none">
          <div>
            <p className="text-[10px] tracking-[0.2em] text-slate-300">VALUE-GUARD PROPOSAL</p>
            <h1 className="mt-1 text-xl font-bold">网站运营诊断与改进方案</h1>
            <p className="mt-1 text-xs text-slate-300">
              {doc.customerName} · {doc.industry} · {doc.domain}
            </p>
          </div>
          <div className="text-right text-[11px] text-slate-300">
            <p>日期：{doc.preparedDate}</p>
            <p>编制人：{doc.preparedBy}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 border-b border-slate-100 p-6 sm:grid-cols-[auto_1fr]">
          <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
            <Gauge value={doc.healthScore} />
            <div>
              <span
                className="inline-block rounded-full px-2 py-0.5 text-[11px] font-medium"
                style={{ background: `${healthColor(doc.healthScore)}1a`, color: healthColor(doc.healthScore) }}
              >
                {doc.riskLevel}
              </span>
              <p className="mt-1 text-[11px] text-slate-400">
                流失概率 <b className="text-slate-600">{doc.churnProbability}%</b>
              </p>
              <p className="text-[11px] text-slate-400">
                距续费 <b className="text-slate-600">{doc.daysToRenewal}</b> 天
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            <TrendTile label="网站访问量趋势" pct={doc.trafficTrendPct} />
            <TrendTile label="询盘量趋势" pct={doc.inquiryTrendPct} />
            <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-2.5">
              <p className="text-[10px] text-slate-400">复查安排</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-700">{doc.reviewDate}</p>
            </div>
          </div>
        </div>

        <section className="p-6 pt-5">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-900 text-[11px] text-white">1</span>
            现状诊断
          </h2>
          <div className="mt-3 space-y-2.5">
            {doc.diagnosis.map((d, i) => {
              const st = SEVERITY_STYLE[d.severity]
              return (
                <div key={i} className={`rounded-lg border-l-4 ${st.border} bg-slate-50/60 p-3`}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-slate-800">{d.issue}</p>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${st.badgeBg} ${st.badgeText}`}>{st.label}</span>
                  </div>
                  <p className="mt-1 text-[12px] text-slate-500">依据：{d.evidence}</p>
                </div>
              )
            })}
          </div>
        </section>

        {doc.peerComparison && (
          <section className="px-6 pb-1">
            <h2 className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
              <AlertTriangle size={15} className="text-amber-500" />
              同行业对标
            </h2>
            <p className="mt-1 text-[11px] text-slate-400">
              对标对象：{doc.peerComparison.peerName}（{doc.peerComparison.peerNote}）
            </p>
            <div className="mt-2.5 grid grid-cols-1 gap-3 rounded-lg border border-slate-100 bg-white p-3 sm:grid-cols-2">
              <CompareBar label="行业认证数量" mine={doc.peerComparison.certifications.mine} peer={doc.peerComparison.certifications.peer} unit="项" />
              <CompareBar label="案例展示数量" mine={doc.peerComparison.caseStudyCount.mine} peer={doc.peerComparison.caseStudyCount.peer} unit="个" />
            </div>
          </section>
        )}

        <section className="p-6 pt-5">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-900 text-[11px] text-white">2</span>
            改进建议
          </h2>
          <p className="mt-2 text-sm font-medium text-violet-700">{doc.recommendationTitle}</p>

          <div className="mt-3 space-y-4">
            {doc.recommendationBlocks.map((block, bi) => (
              <div key={bi}>
                <p className="text-xs font-semibold text-slate-500">{block.heading}</p>
                {block.kind === 'list' ? (
                  <ul className="mt-1.5 space-y-2">
                    {block.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5 rounded-lg bg-violet-50/50 p-2.5 text-sm text-slate-700">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-600 text-[10px] font-semibold text-white">
                          {i + 1}
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="mt-1.5 space-y-2">
                    {block.items.map((qa, i) => (
                      <div key={i} className="rounded-lg border border-slate-100 bg-white p-2.5 shadow-sm">
                        <p className="text-sm font-medium text-slate-800">Q{i + 1}：{qa.q}</p>
                        <p className="mt-1 text-[13px] text-slate-500">A{i + 1}：{qa.a}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="p-6 pt-1">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
            <CheckCircle2 size={15} className="text-emerald-500" />
            预期效果与复查安排
          </h2>
          <div className="mt-2.5 rounded-lg border border-emerald-100 bg-emerald-50/50 p-3 text-sm text-slate-700">
            预期观察指标：{doc.expectedImpact}
            <br />
            复查时间：{doc.reviewDate}，届时将重新评估相关数据并同步结果。
          </div>
        </section>

        <div className="border-t border-slate-100 px-6 py-4 text-[11px] text-slate-400">
          本方案基于当前可获得的运营数据分析生成，具体实施效果受多种外部因素影响，仅供参考。
        </div>
      </div>
    </div>,
    portalTarget,
  )
}
