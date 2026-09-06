import { getPayslipDetail } from '../../../../../actions/salary-structures'
import { updatePayrunStatus } from '../../../../../actions/payroll'
import DownloadPayslipButton from '../../../components/DownloadPayslipButton'
import PrintPayslipButton from '../../../components/PrintPayslipButton'
import Link from 'next/link'
import { ChevronRight, Banknote, AlertTriangle, CheckCircle2, FileText } from 'lucide-react'

const CATEGORY_COLORS: Record<string, string> = {
  BASIC: 'bg-blue-900/30 text-blue-400 border-blue-500/30',
  ALLOWANCE: 'bg-emerald-900/30 text-emerald-400 border-emerald-500/30',
  GROSS: 'bg-violet-900/30 text-violet-400 border-violet-500/30',
  DEDUCTION: 'bg-red-900/30 text-red-400 border-red-500/30',
  NET: 'bg-amber-900/30 text-amber-400 border-amber-500/30',
}

const STATUS_COLORS: Record<string, string> = {
  Paid: 'bg-emerald-900/30 text-emerald-400 border-emerald-500/30',
  Validated: 'bg-blue-900/30 text-blue-400 border-blue-500/30',
  Computed: 'bg-violet-900/30 text-violet-400 border-violet-500/30',
  Draft: 'bg-slate-800/60 text-slate-400 border-slate-600/40',
}

export default async function PayslipDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { payslip, lines } = await getPayslipDetail(id)

  if (!payslip) return <div className="p-8 text-slate-400">Payslip not found.</div>

  const earnings = (lines as any[]).filter(l => ['BASIC', 'ALLOWANCE', 'GROSS'].includes(l.category))
  const deductions = (lines as any[]).filter(l => l.category === 'DEDUCTION')

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb + header */}
      <div className="rounded-2xl border border-slate-700/60 bg-slate-900/40 p-6">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
          <Link href="/payroll/payruns" className="hover:text-violet-300 transition-colors">Payruns</Link>
          <ChevronRight size={12} />
          <Link href={`/payroll/payruns/${payslip.payrun_id}`} className="hover:text-violet-300 transition-colors">{payslip.payrun_name}</Link>
          <ChevronRight size={12} />
          <span className="text-slate-300">{payslip.first_name} {payslip.last_name}</span>
        </div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs tracking-[.2em] text-violet-300 mb-1">PAYSLIP</p>
            <h1 className="text-2xl font-bold text-white">{payslip.first_name} {payslip.last_name}</h1>
            <p className="text-sm text-slate-400 mt-1">{payslip.department} | {payslip.job_position}</p>
          </div>
          <div className="flex items-center gap-2.5">
            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${STATUS_COLORS[payslip.status] || STATUS_COLORS.Draft}`}>
              {payslip.status}
            </span>
            <PrintPayslipButton payslip={payslip} />
            <DownloadPayslipButton payslip={payslip} />
          </div>
        </div>
      </div>

      {/* Key details grid */}
      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: 'Pay Run', value: payslip.payrun_name },
          { label: 'Period', value: `${payslip.period_start} to ${payslip.period_end}` },
          { label: 'Structure', value: payslip.structure_name },
          { label: 'Contract Wage', value: `$${Number(payslip.contract_wage).toLocaleString()} / ${payslip.wage_period}` },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-slate-700/60 bg-slate-900/40 p-4">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">{label}</p>
            <p className="mt-1.5 text-sm font-semibold text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* Warnings */}
      {payslip.has_warning && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-900/15 px-4 py-3 text-sm text-amber-300">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          {payslip.warning_reason || 'This payslip has a warning that requires review.'}
        </div>
      )}
      {!payslip.bank_account_no && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-900/15 px-4 py-3 text-sm text-red-300">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          Bank account details are missing. Payment cannot be released until updated.
        </div>
      )}

      {/* Salary computation breakdown */}
      <div className="rounded-2xl border border-slate-700/60 bg-slate-900/40 overflow-hidden">
        <div className="border-b border-slate-700/60 px-6 py-4 flex items-center gap-3">
          <Banknote size={17} className="text-violet-400" />
          <h2 className="font-semibold text-white">Salary Computation</h2>
          <span className="text-xs text-slate-500 ml-auto">{payslip.structure_name}</span>
        </div>

        {(lines as any[]).length === 0 ? (
          <div className="px-6 py-10 text-center text-slate-500">
            <FileText size={24} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">No computation lines recorded. Payslip may have been created manually.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-700/40">
            {earnings.length > 0 && (
              <div className="p-6">
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-3">Earnings & Allowances</p>
                <div className="space-y-2">
                  {earnings.map((l: any) => (
                    <div key={l.id} className="flex items-center justify-between text-sm py-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-slate-500">{l.rule_code}</span>
                        <span className="text-slate-300">{l.rule_name}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${CATEGORY_COLORS[l.category]}`}>{l.category}</span>
                      </div>
                      <span className="font-mono font-semibold text-white">+${Number(l.amount).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {deductions.length > 0 && (
              <div className="p-6">
                <p className="text-xs font-bold uppercase tracking-widest text-red-400 mb-3">Deductions & Withholdings</p>
                <div className="space-y-2">
                  {deductions.map((l: any) => (
                    <div key={l.id} className="flex items-center justify-between text-sm py-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-slate-500">{l.rule_code}</span>
                        <span className="text-slate-300">{l.rule_name}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${CATEGORY_COLORS[l.category]}`}>{l.category}</span>
                      </div>
                      <span className="font-mono font-semibold text-red-400">-${Number(l.amount).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Summary footer */}
        <div className="border-t border-slate-700/60 px-6 py-4 grid grid-cols-3 gap-4 bg-slate-950/20">
          <div className="text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Gross Salary</p>
            <p className="mt-1 text-lg font-bold text-white font-mono">${Number(payslip.gross_salary).toFixed(2)}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Deductions</p>
            <p className="mt-1 text-lg font-bold text-red-400 font-mono">-${Number(payslip.deductions).toFixed(2)}</p>
          </div>
          <div className="text-center rounded-xl bg-emerald-900/20 border border-emerald-500/20 py-2">
            <p className="text-[10px] text-emerald-500 uppercase tracking-widest">Net Pay</p>
            <p className="mt-1 text-xl font-bold text-emerald-400 font-mono">${Number(payslip.net_salary).toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      {payslip.status === 'Computed' && (
        <form action={async () => {
          'use server'
          await updatePayrunStatus(String(payslip.payrun_id), 'Validated', [payslip.id])
        }} className="flex justify-end">
          <button className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-violet-500 transition-all cursor-pointer">
            <CheckCircle2 size={15} /> Validate Payslip
          </button>
        </form>
      )}
      {payslip.status === 'Validated' && (
        <form action={async () => {
          'use server'
          await updatePayrunStatus(String(payslip.payrun_id), 'Paid', [payslip.id])
        }} className="flex justify-end">
          <button className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-500 transition-all cursor-pointer">
            <CheckCircle2 size={15} /> Mark as Paid
          </button>
        </form>
      )}
    </div>
  )
}
