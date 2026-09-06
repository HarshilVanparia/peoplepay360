'use client'

import { useState } from 'react'
import { Send, CheckCircle2, AlertCircle } from 'lucide-react'
import { distributePayslips } from '../../../actions/distribution'

interface Props {
  payrunId: string
}

export default function SendPayslipsButton({ payrunId }: Props) {
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  async function handleSend() {
    try {
      setLoading(true)
      setFeedback(null)
      const res = await distributePayslips(payrunId)
      setFeedback({ type: 'success', text: res.message })
    } catch (err: any) {
      setFeedback({ type: 'error', text: err?.message || 'Failed to distribute payslips' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={handleSend}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-600 bg-slate-800/80 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:border-slate-400 hover:text-white disabled:opacity-50 transition-all cursor-pointer"
        title="Distribute payslips to all employees via email"
      >
        <Send size={14} className={loading ? 'animate-pulse' : ''} />
        {loading ? 'Dispatching...' : 'Send Payslips'}
      </button>

      {feedback && (
        <div className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold ${
          feedback.type === 'success'
            ? 'border border-emerald-500/30 bg-emerald-950/60 text-emerald-300'
            : 'border border-red-500/30 bg-red-950/60 text-red-300'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
          <span>{feedback.text}</span>
        </div>
      )}
    </div>
  )
}
