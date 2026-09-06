import { getPayrunDetails, updatePayrunStatus, recomputePayrun } from '../../../../../actions/payroll'
import DownloadPayslipButton from '../../../components/DownloadPayslipButton'
import PrintPayslipButton from '../../../components/PrintPayslipButton'
import SendPayslipsButton from '../../../components/SendPayslipsButton'
import Link from 'next/link'
import { ChevronRight, Calculator, CheckCircle2, Banknote, AlertTriangle, FileText } from 'lucide-react'

const STATUS_BADGE: Record<string, string> = {
  Draft: 'bg-slate-800/60 text-slate-400 border-slate-600/40',
  Computed: 'bg-violet-900/30 text-violet-400 border-violet-500/30',
  Validated: 'bg-blue-900/30 text-blue-400 border-blue-500/30',
  Paid: 'bg-emerald-900/30 text-emerald-400 border-emerald-500/30',
  Cancelled: 'bg-red-900/30 text-red-400 border-red-500/30',
}

const PAYSLIP_STATUS: Record<string, string> = {
  Draft: 'bg-slate-800/60 text-slate-400 border-slate-600/40',
  Computed: 'bg-violet-900/30 text-violet-400 border-violet-500/30',
  Validated: 'bg-blue-900/30 text-blue-400 border-blue-500/30',
  Paid: 'bg-emerald-900/30 text-emerald-400 border-emerald-500/30',
}

export default async function PayrunDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { payrun, payslips } = await getPayrunDetails(id)
  if (!payrun) return <div className="p-8 text-slate-400">Payroll batch not found.</div>

  const missingBank = (payslips as any[]).filter(p => !p.bank_account_no)
  const totalGross = (payslips as any[]).reduce((s, p) => s + Number(p.gross_salary), 0)
  const totalNet = (payslips as any[]).reduce((s, p) => s + Number(p.net_salary), 0)

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Breadcrumb + Header */}
      <div className="rounded-2xl border border-slate-700/60 bg-slate-900/40 p-6">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
          <Link href="/payroll/payruns" className="hover:text-violet-300 transition-colors">Payruns</Link>
          <ChevronRight size={12} />
          <span className="text-slate-300">{payrun.name}</span>
        </div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs tracking-[.2em] text-violet-300 mb-1">PAYROLL BATCH</p>
            <h1 className="text-2xl font-bold text-white">{payrun.name}</h1>
            <p className="text-sm text-slate-400 mt-1">{payrun.structure_name} | {payrun.period_start} to {payrun.period_end}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${STATUS_BADGE[payrun.status] || STATUS_BADGE.Draft}`}>
              {payrun.status}
            </span>

            {/* Compute/Recompute */}
            {['Draft', 'Computed'].includes(payrun.status) && (
              <form action={async () => {
                'use server'
                await recomputePayrun(String(id))
              }}>
                <button className="inline-flex items-center gap-2 rounded-xl border border-violet-500/40 bg-violet-900/10 px-4 py-2.5 text-sm font-bold text-violet-300 hover:bg-violet-900/30 transition-all cursor-pointer">
                  <Calculator size={15} /> {payrun.status === 'Draft' ? 'Compute' : 'Recompute'}
                </button>
              </form>
            )}

            {/* Validate all */}
            {payrun.status === 'Computed' && (
              <form action={async () => {
                'use server'
                await updatePayrunStatus(String(id), 'Validated', (payslips as any[]).map(p => p.id))
              }}>
                <button className="inline-flex items-center gap-2 rounded-xl border border-blue-500/40 bg-blue-900/10 px-4 py-2.5 text-sm font-bold text-blue-300 hover:bg-blue-900/30 transition-all cursor-pointer">
                  <CheckCircle2 size={15} /> Validate All
                </button>
              </form>
            )}

            {/* Mark all paid */}
            {payrun.status === 'Validated' && (
              <form action={async () => {
                'use server'
                await updatePayrunStatus(String(id), 'Paid', (payslips as any[]).map(p => p.id))
              }}>
                <button className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/30 cursor-pointer">
                  <Banknote size={15} /> Mark Paid
                </button>
              </form>
            )}

            {/* Bulk Send Payslips */}
            <SendPayslipsButton payrunId={String(id)} />
          </div>
        </div>
      </div>

      {/* Warnings */}
      {missingBank.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-900/10 px-5 py-3 text-sm text-amber-300">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <span><strong>{missingBank.length} payslip(s)</strong> are missing bank account details: {missingBank.map((p: any) => `${p.first_name} ${p.last_name}`).join(', ')}.</span>
        </div>
      )}

      {/* Totals */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-700/60 bg-slate-900/40 p-5 text-center">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">Payslips</p>
          <p className="mt-2 text-3xl font-bold text-white font-mono">{(payslips as any[]).length}</p>
        </div>
        <div className="rounded-xl border border-slate-700/60 bg-slate-900/40 p-5 text-center">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">Total Gross</p>
          <p className="mt-2 text-2xl font-bold text-white font-mono">${totalGross.toFixed(2)}</p>
        </div>
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-900/10 p-5 text-center">
          <p className="text-[10px] text-emerald-500 uppercase tracking-widest">Total Net Pay</p>
          <p className="mt-2 text-2xl font-bold text-emerald-400 font-mono">${totalNet.toFixed(2)}</p>
        </div>
      </div>

      {/* Payslips table */}
      <div className="rounded-2xl border border-slate-700/60 bg-slate-900/40 overflow-hidden">
        <div className="border-b border-slate-700/60 px-6 py-4 flex items-center gap-3">
          <FileText size={17} className="text-violet-400" />
          <h2 className="font-semibold text-white">Payslips</h2>
        </div>
        <table className="w-full text-left">
          <thead className="border-b border-slate-700/60">
            <tr>
              <th className="py-3.5 px-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Employee</th>
              <th className="py-3.5 px-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Gross</th>
              <th className="py-3.5 px-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Deductions</th>
              <th className="py-3.5 px-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Net Pay</th>
              <th className="py-3.5 px-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
              <th className="py-3.5 px-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/40">
            {(payslips as any[]).map(p => (
              <tr key={p.id} className="hover:bg-violet-900/10 transition-colors">
                <td className="py-3.5 px-5">
                  <Link href={`/payroll/payslips/${p.id}`} className="font-semibold text-white hover:text-violet-300 transition-colors text-sm">
                    {p.first_name} {p.last_name}
                  </Link>
                  {!p.bank_account_no && (
                    <span className="ml-2 text-[10px] text-amber-400 font-semibold">No bank</span>
                  )}
                </td>
                <td className="py-3.5 px-5 font-mono text-sm text-slate-300">${Number(p.gross_salary).toFixed(2)}</td>
                <td className="py-3.5 px-5 font-mono text-sm text-red-400">-${Number(p.deductions).toFixed(2)}</td>
                <td className="py-3.5 px-5 font-mono font-bold text-emerald-400 text-sm">${Number(p.net_salary).toFixed(2)}</td>
                <td className="py-3.5 px-5">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${PAYSLIP_STATUS[p.status] || PAYSLIP_STATUS.Draft}`}>
                    {p.status}
                  </span>
                </td>
                <td className="py-3.5 px-5">
                  <div className="flex justify-end items-center gap-2">
                    <PrintPayslipButton payslip={p} />
                    <DownloadPayslipButton payslip={p} />
                    {p.status === 'Computed' && (
                      <form action={async () => {
                        'use server'
                        await updatePayrunStatus(String(id), 'Validated', [p.id])
                      }}>
                        <button className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-violet-500 transition-all cursor-pointer">Validate</button>
                      </form>
                    )}
                    {p.status === 'Validated' && (
                      <form action={async () => {
                        'use server'
                        await updatePayrunStatus(String(id), 'Paid', [p.id])
                      }}>
                        <button className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 transition-all cursor-pointer">Mark Paid</button>
                      </form>
                    )}
                    {p.status === 'Paid' && (
                      <span className="text-xs text-emerald-400 font-semibold">Complete</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
