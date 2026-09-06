'use client'

import { Download } from 'lucide-react'
import { generatePayslipPDF } from '../../../lib/pdf'

export default function DownloadPayslipButton({ payslip }: { payslip: any }) {
  return (
    <button
      onClick={() => generatePayslipPDF(payslip)}
      className="inline-flex items-center gap-1.5 rounded-lg border border-violet-400/40 px-2.5 py-1.5 text-xs font-bold text-violet-200 hover:bg-violet-500/10 transition-colors cursor-pointer"
      title="Download PDF Document"
    >
      <Download size={14} /> PDF
    </button>
  )
}
