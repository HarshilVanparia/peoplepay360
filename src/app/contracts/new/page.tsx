'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createContract, getContract } from '../../../../actions/contracts';
import { getEmployees } from '../../../../actions/employees';
import { getSalaryStructures } from '../../../../actions/salary-structures';
import { getSchedules, getLeavePolicies } from '../../../../actions/schedules';
import { FileSignature, ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function NewContractForm() {
  const router = useRouter();
  const editId = useSearchParams().get('edit');
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [structures, setStructures] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [leavePolicies, setLeavePolicies] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    employee_id: '', department: '', job_position: '', employment_type: 'Full-Time', schedule_id: '', leave_policy_id: '', wage: '', wage_period: 'Monthly', salary_structure_id: '',
    start_date: '', end_date: '', status: 'Active'
  });

  useEffect(() => {
    getEmployees().then(setEmployees);
    getSalaryStructures().then(setStructures);
    getSchedules().then(setSchedules);
    getLeavePolicies().then(setLeavePolicies);
    if (editId) getContract(editId).then(c => { if (c) setFormData({ employee_id:String(c.employee_id), department:c.department, job_position:c.job_position, employment_type:c.employment_type, schedule_id:String(c.schedule_id || ''), leave_policy_id:String(c.leave_policy_id || ''), wage:String(c.wage), wage_period:c.wage_period, salary_structure_id:String(c.salary_structure_id), start_date:String(c.start_date).slice(0,10), end_date:c.end_date ? String(c.end_date).slice(0,10) : '', status:c.status }); });
  }, [editId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await createContract({ ...formData, id: editId });
    router.push('/contracts');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/contracts" className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600"><ArrowLeft size={20} /></Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{editId ? 'Edit Contract' : 'Draft New Contract'}</h1>
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
                <select required disabled={Boolean(editId)} value={formData.employee_id} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={e => { const employee = employees.find(emp => String(emp.id) === e.target.value); setFormData({...formData, employee_id: e.target.value, department: employee?.department || '', job_position: employee?.job_position || '', employment_type: employee?.employment_type || 'Full-Time', schedule_id: String(employee?.schedule_id || '')}); }}>
                  <option value="">Select Employee...</option>
                  {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name} - {emp.department}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Department at contract start</label>
                <input required value={formData.department} onChange={e => setFormData({...formData, department:e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Position at contract start</label>
                <input required value={formData.job_position} onChange={e => setFormData({...formData, job_position:e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Working schedule</label>
                <select value={formData.schedule_id} onChange={e => setFormData({...formData,schedule_id:e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"><option value="">No schedule</option>{schedules.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Leave policy</label>
                <select value={formData.leave_policy_id} onChange={e => setFormData({...formData,leave_policy_id:e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"><option value="">No policy</option>{leavePolicies.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Base Wage (USD)</label>
                <input required type="number" step="0.01" className="w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 font-mono" 
                  value={formData.wage} onChange={e => setFormData({...formData, wage: e.target.value})} placeholder="5000.00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Wage period</label>
                <select value={formData.wage_period} onChange={e => setFormData({...formData,wage_period:e.target.value})} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm"><option>Monthly</option><option>Weekly</option><option>Daily</option><option>Hourly</option></select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Salary Structure</label>
                <select required value={formData.salary_structure_id} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={e => setFormData({...formData, salary_structure_id: e.target.value})}>
                  <option value="">Select Structure...</option>
                  {structures.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                <input required type="date" value={formData.start_date} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" 
                  onChange={e => setFormData({...formData, start_date: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">End Date (Optional)</label>
                <input type="date" value={formData.end_date} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" 
                  onChange={e => setFormData({...formData, end_date: e.target.value})} />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button type="submit" disabled={loading} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium">
              <Save size={18} /> {loading ? 'Processing...' : editId ? 'Save Contract' : 'Activate Contract'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
