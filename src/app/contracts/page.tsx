import { getContracts } from '../../../actions/contracts'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import ContractList from '../components/ContractList'

export default async function ContractsPage({ searchParams }: { searchParams: Promise<{ employee?: string }> }) {
  const params = await searchParams
  const contracts = await getContracts(params.employee)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center rounded-2xl border border-slate-700/60 bg-slate-900/40 p-6 backdrop-blur-sm">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Employment Contracts</h1>
          <p className="text-sm text-slate-400 mt-1">
            Historical agreements and active period wages used for payroll computation.
          </p>
        </div>
        <Link
          href="/contracts/new"
          className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-violet-500 transition-all shadow-lg shadow-violet-900/30"
        >
          <Plus size={16} /> New Contract
        </Link>
      </div>

      <ContractList contracts={contracts} />
    </div>
  )
}
