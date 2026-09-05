import { getAllocations } from '../../../../actions/time-off-admin'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import TimeOffAllocationsTable from '../../components/TimeOffAllocationsTable'

const TAB_STYLE = 'px-4 py-2 rounded-lg text-sm font-semibold transition-all'
const ACTIVE_TAB = 'bg-violet-600 text-white shadow-lg shadow-violet-900/30'
const INACTIVE_TAB = 'text-slate-400 hover:text-white'

export default async function TimeOffAllocationsPage({
  searchParams,
}: {
  searchParams: Promise<{ employee?: string }>
}) {
  const params = await searchParams
  const allocations = await getAllocations(params.employee) as any[]

  return (
    <div className="space-y-6">
      {/* Sub-navigation */}
      <div className="flex gap-1 rounded-xl border border-slate-700/60 bg-slate-900/40 p-1 w-fit">
        <Link href="/time-off/requests" className={`${TAB_STYLE} ${INACTIVE_TAB}`}>Requests</Link>
        <Link href="/time-off/allocations" className={`${TAB_STYLE} ${ACTIVE_TAB}`}>Allocations</Link>
        <Link href="/time-off/types" className={`${TAB_STYLE} ${INACTIVE_TAB}`}>Leave Types</Link>
      </div>

      <div className="flex flex-wrap justify-between items-center rounded-2xl border border-slate-700/60 bg-slate-900/40 p-6 backdrop-blur-sm">
        <div>
          <h1 className="text-2xl font-bold text-white">Leave Allocations</h1>
          <p className="text-sm text-slate-400 mt-1">Manage employee balances, validity periods, and approval status.</p>
        </div>
        <Link
          href="/time-off/allocations/new"
          className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-violet-500 transition-all shadow-lg shadow-violet-900/30"
        >
          <Plus size={15} /> Assign Allocation
        </Link>
      </div>

      <TimeOffAllocationsTable allocations={allocations} />
    </div>
  )
}