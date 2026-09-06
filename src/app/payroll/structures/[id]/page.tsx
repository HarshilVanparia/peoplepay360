import { getStructureWithRules, deleteSalaryRule } from '../../../../../actions/salary-structures'
import { Calculator, ArrowLeft, ChevronRight, Hash, Percent, Trash2 } from 'lucide-react'
import Link from 'next/link'
import AddSalaryRuleModal from '../../../components/AddSalaryRuleModal'

export default async function SalaryStructureDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { structure, rules } = await getStructureWithRules(id)

  if (!structure) {
    return <div className="p-8 text-slate-400">Structure not found.</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 rounded-2xl border border-slate-700/60 bg-slate-900/40 p-6 backdrop-blur-sm shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <Link href="/payroll/structures" className="hover:text-violet-300 transition-colors">Salary Structures</Link>
            <ChevronRight size={12} />
            <span className="text-slate-300">{structure.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">{structure.name}</h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
              structure.is_active
                ? 'bg-emerald-900/30 text-emerald-400 border-emerald-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}>
              {structure.is_active ? 'Active Base' : 'Archived'}
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Rule execution sequence driving final net salary computation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <AddSalaryRuleModal structureId={id} />
          <Link
            href="/payroll/structures"
            className="p-2.5 rounded-xl border border-slate-700 bg-slate-800/60 text-slate-400 hover:text-white hover:border-slate-500 transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
        </div>
      </div>

      {/* Sequenced Rules Table */}
      <div className="rounded-2xl border border-slate-700/60 bg-slate-900/40 overflow-hidden backdrop-blur-sm shadow-xl">
        <div className="p-5 border-b border-slate-700/60 bg-slate-950/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Calculator size={18} className="text-violet-400" />
            <h2 className="font-semibold text-white">Computation Rules & Sequence</h2>
          </div>
          <span className="text-xs text-slate-500">Ordered by execution sequence</span>
        </div>

        <table className="w-full text-left border-collapse">
          <thead className="border-b border-slate-700/60 bg-slate-950/20">
            <tr>
              <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider w-16">Seq</th>
              <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Rule Name</th>
              <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Code</th>
              <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Category</th>
              <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Calculation</th>
              <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Value</th>
              <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {(rules as any[]).length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500 text-sm">
                  No computation rules defined for this structure. Click &quot;Add Salary Rule&quot; to configure.
                </td>
              </tr>
            ) : (
              (rules as any[]).map((rule: any) => (
                <tr key={rule.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 px-6 font-mono text-sm text-slate-400 font-bold">{rule.sequence}</td>
                  <td className="py-4 px-6 font-semibold text-white">{rule.name}</td>
                  <td className="py-4 px-6 font-mono text-sm text-violet-400">{rule.code}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                      rule.category === 'BASIC' ? 'bg-blue-900/30 text-blue-400 border-blue-500/30' :
                      rule.category === 'ALLOWANCE' ? 'bg-emerald-900/30 text-emerald-400 border-emerald-500/30' :
                      rule.category === 'DEDUCTION' ? 'bg-red-900/30 text-red-400 border-red-500/30' :
                      'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {rule.category}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-300">
                    <span className="inline-flex items-center gap-1.5">
                      {rule.calculation_type === 'FIXED' ? (
                        <Hash size={14} className="text-slate-400" />
                      ) : (
                        <Percent size={14} className="text-violet-400" />
                      )}
                      {rule.calculation_type}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-mono font-bold text-white text-right">
                    {rule.calculation_type === 'PERCENTAGE' ? `${Number(rule.amount_value).toFixed(2)}%` : `$${Number(rule.amount_value).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <form action={async () => {
                      'use server'
                      await deleteSalaryRule(String(rule.id), id)
                    }}>
                      <button
                        type="submit"
                        title="Delete rule"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/20 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </form>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
