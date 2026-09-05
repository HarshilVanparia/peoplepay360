'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createContract } from '../../../../actions/contracts';
import { getEmployees } from '../../../../actions/employees';
import { getSalaryStructures } from '../../../../actions/salary-structures';
import { FileSignature, ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function NewContractForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [structures, setStructures] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    employee_id: '', wage: '', salary_structure_id: '',
    start_date: '', end_date: '', status: 'Active'
  });

  useEffect(() => {
    getEmployees().then(setEmployees);
    getSalaryStructures().then(setStructures);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await createContract(formData);
    router.push('/contracts');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/contracts" className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600"><ArrowLeft size={20} /></Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Draft New Contract</h1>
            <p className="text-sm text-slate-500 mt-1">Define base wages and computation structures for the payroll engine[cite: 1].</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm space-y-8">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2 mb-4">
              <FileSignature size={18} className="text-blue-600" /> Agreement Terms
            </h2>
            <div className="grid grid-cols-2 gap-5">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Employee</label>
                <select required className="w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={e => setFormData({...formData, employee_id: e.target.value})}>
                  <option value="">Select Employee...</option>
                  {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name} - {emp.department}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Base Wage (USD)</label>
                <input required type="number" step="0.01" className="w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 font-mono" 
                  onChange={e => setFormData({...formData, wage: e.target.value})} placeholder="5000.00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Salary Structure</label>
                <select required className="w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={e => setFormData({...formData, salary_structure_id: e.target.value})}>
                  <option value="">Select Structure...</option>
                  {structures.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                <input required type="date" className="w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" 
                  onChange={e => setFormData({...formData, start_date: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">End Date (Optional)</label>
                <input type="date" className="w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" 
                  onChange={e => setFormData({...formData, end_date: e.target.value})} />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button type="submit" disabled={loading} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium">
              <Save size={18} /> {loading ? 'Processing...' : 'Activate Contract'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}