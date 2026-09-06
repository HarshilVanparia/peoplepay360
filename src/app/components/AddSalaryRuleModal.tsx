'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Plus, X, Calculator } from 'lucide-react'
import { createSalaryRule } from '../../../actions/salary-structures'

interface Props {
  structureId: string
}

export default function AddSalaryRuleModal({ structureId }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const [form, setForm] = useState({
    name: '',
    code: '',
    category: 'ALLOWANCE',
    calculation_type: 'PERCENTAGE',
    amount_value: '',
    sequence: '10',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      setLoading(true)
      setError(null)
      await createSalaryRule({
        structure_id: structureId,
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        category: form.category,
        calculation_type: form.calculation_type,
        amount_value: form.amount_value,
        sequence: form.sequence || '10',
      })
      setIsOpen(false)
      setForm({
        name: '',
        code: '',
        category: 'ALLOWANCE',
        calculation_type: 'PERCENTAGE',
        amount_value: '',
        sequence: '10',
      })
    } catch (err: any) {
      setError(err?.message || 'Failed to create salary rule')
    } finally {
      setLoading(false)
    }
  }

  const modalContent = isOpen ? (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-700/80 bg-slate-900 p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-600/20 text-violet-400">
              <Calculator size={18} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Add Computation Rule</h3>
              <p className="text-xs text-slate-400">Define salary component calculation and execution sequence</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-950/40 p-3 text-xs text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Rule Name
              </label>
              <input
                required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Housing Allowance"
                className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Rule Code
              </label>
              <input
                required
                value={form.code}
                onChange={e => setForm({ ...form, code: e.target.value })}
                placeholder="e.g. HRA"
                className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3.5 py-2.5 text-sm text-white font-mono placeholder-slate-500 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Category
              </label>
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3.5 py-2.5 text-sm text-white outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all cursor-pointer"
              >
                <option value="ALLOWANCE">ALLOWANCE</option>
                <option value="DEDUCTION">DEDUCTION</option>
                <option value="BASIC">BASIC</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Calculation Type
              </label>
              <select
                value={form.calculation_type}
                onChange={e => setForm({ ...form, calculation_type: e.target.value })}
                className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3.5 py-2.5 text-sm text-white outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all cursor-pointer"
              >
                <option value="PERCENTAGE">PERCENTAGE (% of Base)</option>
                <option value="FIXED">FIXED (Fixed Amount)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                {form.calculation_type === 'PERCENTAGE' ? 'Percentage Value (%)' : 'Fixed Amount ($)'}
              </label>
              <input
                required
                type="number"
                step="0.01"
                min="0"
                value={form.amount_value}
                onChange={e => setForm({ ...form, amount_value: e.target.value })}
                placeholder={form.calculation_type === 'PERCENTAGE' ? 'e.g. 20' : 'e.g. 500'}
                className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3.5 py-2.5 text-sm text-white font-mono placeholder-slate-500 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Sequence Order
              </label>
              <input
                required
                type="number"
                min="1"
                value={form.sequence}
                onChange={e => setForm({ ...form, sequence: e.target.value })}
                placeholder="10"
                className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3.5 py-2.5 text-sm text-white font-mono placeholder-slate-500 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-violet-500 disabled:opacity-50 transition-all shadow-lg shadow-violet-900/30 cursor-pointer"
            >
              {loading ? 'Saving...' : 'Save Rule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  ) : null

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-violet-500 transition-all shadow-lg shadow-violet-900/30 cursor-pointer"
      >
        <Plus size={16} /> Add Salary Rule
      </button>

      {mounted && modalContent && createPortal(modalContent, document.body)}
    </>
  )
}
