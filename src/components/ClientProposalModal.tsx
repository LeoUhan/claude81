import { createPortal } from 'react-dom'
import { Download, X } from 'lucide-react'
import { ProposalDoc } from '../engine/proposal'

export default function ClientProposalModal({ doc, onClose }: { doc: ProposalDoc; onClose: () => void }) {
  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-slate-900/40 p-6 print:bg-white print:p-0">
      <div className="sticky top-0 z-10 mb-4 flex w-full max-w-[820px] items-center justify-between print:hidden">
        <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-500 shadow">
          客户方案预览 · 这是给客户看的正式文档，不是内部工具
        </span>
        <div className="flex gap-2">
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
      </div>

      <div id="proposal-print-area" className="w-full max-w-[820px] rounded-sm bg-white p-12 shadow-2xl print:rounded-none print:p-16 print:shadow-none" style={{ fontFamily: '"Songti SC", "Noto Serif SC", serif' }}>
        <div className="flex items-center justify-between border-b-2 border-slate-800 pb-4">
          <div>
            <p className="text-[11px] tracking-widest text-slate-400">VALUE-GUARD PROPOSAL</p>
            <h1 className="mt-1 text-xl font-bold text-slate-900">网站运营诊断与改进方案</h1>
          </div>
          <div className="text-right text-xs text-slate-400">
            <p>日期：{doc.preparedDate}</p>
            <p>编制人：{doc.preparedBy}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-slate-600">
          <div>
            <span className="text-slate-400">客户：</span>
            {doc.customerName}
          </div>
          <div>
            <span className="text-slate-400">所属行业：</span>
            {doc.industry}
          </div>
          <div className="col-span-2">
            <span className="text-slate-400">网站：</span>
            {doc.domain}
          </div>
        </div>

        <section className="mt-8">
          <h2 className="border-l-4 border-slate-800 pl-3 text-base font-semibold text-slate-900">一、现状诊断</h2>
          <ol className="mt-3 space-y-3">
            {doc.diagnosis.map((d, i) => (
              <li key={i} className="text-sm leading-relaxed text-slate-700">
                <span className="font-medium text-slate-900">{i + 1}. {d.issue}</span>
                <p className="mt-0.5 pl-4 text-[13px] text-slate-500">依据：{d.evidence}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-8">
          <h2 className="border-l-4 border-slate-800 pl-3 text-base font-semibold text-slate-900">二、改进建议</h2>
          <div className="mt-3">
            <p className="text-sm font-medium text-slate-900">{doc.recommendationTitle}</p>
            <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-slate-700">{doc.recommendationDetail}</p>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="border-l-4 border-slate-800 pl-3 text-base font-semibold text-slate-900">三、预期效果与复查安排</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-700">
            预期观察指标：{doc.expectedImpact}
            <br />
            复查时间：{doc.reviewDate}，届时将重新评估相关数据并同步结果。
          </p>
        </section>

        <div className="mt-10 border-t border-slate-200 pt-4 text-[11px] text-slate-400">
          本方案基于当前可获得的运营数据分析生成，具体实施效果受多种外部因素影响，仅供参考。
        </div>
      </div>
    </div>,
    document.body,
  )
}
