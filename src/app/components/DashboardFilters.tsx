'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Calendar, Filter, X } from 'lucide-react'

interface Props {
  departments: string[]
}

const PERIODS = [
  { value: 'current_month', label: 'Current Month' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'ytd', label: 'Year to Date' },
  { value: 'all', label: 'All Time' },
]

const EMPLOYMENT_TYPES = [
  'All Types',
  'Full-time',
  'Part-time',
  'Contractor',
  'Intern',
]

export default function DashboardFilters({ departments }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentPeriod = searchParams.get('period') || 'current_month'
  const currentDept = searchParams.get('department') || 'All Departments'
  const currentType = searchParams.get('employment_type') || 'All Types'

  function updateFilter(key: string, val: string) {
    const nextParams = new URLSearchParams(searchParams.toString())
    if (val && val !== 'All Departments' && val !== 'All Types' && val !== 'current_month') {
      nextParams.set(key, val)
    } else {
      nextParams.delete(key)
    }
    const qs = nextParams.toString()
    router.push(qs ? `/?${qs}` : '/')
  }

  function clearAll() {
    router.push('/')
  }

  const hasActiveFilters = currentPeriod !== 'current_month' || currentDept !== 'All Departments' || currentType !== 'All Types'

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Period Selector */}
      <div className="relative">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
        <select
          value={currentPeriod}
          onChange={e => updateFilter('period', e.target.value)}
          className="pl-9 pr-4 py-2 rounded-xl border border-slate-700 bg-slate-900/60 text-xs font-semibold text-white outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all cursor-pointer"
        >
          {PERIODS.map(p => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>

      {/* Department Filter */}
      <div className="relative">
        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={13} />
        <select
          value={currentDept}
          onChange={e => updateFilter('department', e.target.value)}
          className="pl-9 pr-4 py-2 rounded-xl border border-slate-700 bg-slate-900/60 text-xs font-semibold text-white outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all cursor-pointer"
        >
          <option value="All Departments">All Departments</option>
          {departments.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {/* Employment Type */}
      <select
        value={currentType}
        onChange={e => updateFilter('employment_type', e.target.value)}
        className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-900/60 text-xs font-semibold text-white outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all cursor-pointer"
      >
        {EMPLOYMENT_TYPES.map(t => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>

      {hasActiveFilters && (
        <button
          onClick={clearAll}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-600 text-xs font-semibold text-slate-400 hover:text-white hover:border-slate-400 transition-all"
        >
          <X size={12} /> Reset Filters
        </button>
      )}
    </div>
  )
}
