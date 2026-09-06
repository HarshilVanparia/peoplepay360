'use client'

import { Printer } from 'lucide-react'
import { printPayslipPDF } from '../../../lib/pdf'

export default function PrintPayslipButton({ payslip }: { payslip: any }) {
  return (
    <button
      onClick={() => printPayslipPDF(payslip)}
      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-600 bg-slate-800/60 px-2.5 py-1.5 text-xs font-bold text-slate-200 hover:border-slate-400 hover:text-white transition-colors cursor-pointer"
      title="Print Official Payslip"
    >
      <Printer size={14} /> Print
    </button>
  )
}
