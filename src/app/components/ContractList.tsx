'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, FileText, CheckCircle2, AlertCircle, Pencil, X, Filter } from 'lucide-react'

const STATUSES = ['All Statuses', 'Active', 'Draft', 'Expired']

interface Props {
  contracts: any[]
}

export default function ContractList({ contracts }: Props) {
  const [term, setTerm] = useState('')
  const [status, setStatus] = useState('All Statuses')
  const [dept, setDept] = useState('All Departments')

  const departments = ['All Departments', ...Array.from(new Set(contracts.map(c => c.department).filter(Boolean))).sort()]

  const filtered = contracts.filter(c => {
    const fullName = `${c.first_name} ${c.last_name}`.toLowerCase()
    const searchTarget = `${fullName} ${c.department || ''} ${c.salary_structure_name || ''}`.toLowerCase()
    const matchTerm = !term || searchTarget.includes(term.toLowerCase())
    const matchStatus = status === 'All Statuses' || c.status === status
    const matchDept = dept === 'All Departments' || c.department === dept
    return matchTerm && matchStatus && matchDept
  })

  const hasFilters = term || status !== 'All Statuses' || dept !== 'All Departments'

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
          <input
            value={term}
            onChange={e => setTerm(e.target.value)}
            placeholder="Search employee, dept, structure..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/60 text-sm text-white placeholder-slate-500 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={13} />
          <select
            value={dept}
            onChange={e => setDept(e.target.value)}
            className="pl-9 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/60 text-sm text-white outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all appearance-none cursor-pointer"
          >
            {departments.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>

        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/60 text-sm text-white outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all appearance-none cursor-pointer"
        >
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>

        {hasFilters && (
          <button
            onClick={() => { setTerm(''); setStatus('All Statuses'); setDept('All Departments') }}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-600 text-xs font-semibold text-slate-400 hover:text-white hover:border-slate-400 transition-all"
          >
            <X size={12} /> Clear
          </button>
        )}

        <span className="ml-auto text-sm text-slate-500 font-medium">
          {filtered.length} of {contracts.length}
        </span>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-700/60 bg-slate-900/40 overflow-hidden backdrop-blur-sm shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead className="border-b border-slate-700/60 bg-slate-950/40">
            <tr>
              <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Employee</th>
              <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Department</th>
              <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Pay Rules</th>
              <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Period</th>
              <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Base Wage</th>
              <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
              <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Edit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500 text-sm">
                  <Search size={28} className="mx-auto mb-2 opacity-40" />
                  <p>No contracts match your search or filters.</p>
                </td>
              </tr>
            ) : (
              filtered.map(c => (
                <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 px-6">
                    <Link href={`/employees/${c.employee_id}`} className="font-semibold text-violet-400 hover:text-violet-300 transition-colors">
                      {c.first_name} {c.last_name}
                    </Link>
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-300">{c.department}</td>
                  <td className="py-4 px-6 text-sm text-slate-300">
                    <span className="inline-flex items-center gap-1.5 text-slate-400">
                      <FileText size={14} className="text-violet-400 shrink-0" />
                      {c.salary_structure_name}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-400">
                    {c.start_date} to {c.end_date ?? 'Indefinite'}
                  </td>
                  <td className="py-4 px-6 font-mono font-bold text-emerald-400">
                    ${Number(c.wage).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                      c.status === 'Active'
                        ? 'bg-emerald-900/30 text-emerald-400 border-emerald-500/30'
                        : c.status === 'Expired'
                        ? 'bg-slate-800/60 text-slate-400 border-slate-600/40'
                        : 'bg-amber-900/30 text-amber-400 border-amber-500/30'
                    }`}>
                      {c.status === 'Active' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                      {c.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <Link
                      href={`/contracts/new?edit=${c.id}`}
                      className="inline-flex p-2 rounded-lg text-violet-400 hover:bg-violet-500/10 transition-colors"
                      title="Edit contract"
                    >
                      <Pencil size={16} />
                    </Link>
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
