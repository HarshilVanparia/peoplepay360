'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createEmployee } from '../../../../actions/employees';
import { getSchedules } from '../../../../actions/schedules';
import { UserPlus, ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function NewEmployeeForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', email: '',
    system_role: 'Employee', department: 'Engineering',
    job_position: '', employment_type: 'Full-Time',
    status: 'Active', schedule_id: ''
  });

  useEffect(() => {
    getSchedules().then(setSchedules);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const newId = await createEmployee(formData);
    router.push(`/employees/${newId}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/employees" className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600"><ArrowLeft size={20} /></Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Onboard New Employee</h1>
            <p className="text-sm text-slate-500 mt-1">Create a new identity record and assign an operational role.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm space-y-8">
          {/* Personal Identity */}
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2 mb-4">
              <UserPlus size={18} className="text-blue-600" /> Identity Details
            </h2>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                <input required type="text" className="w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" 
                  onChange={e => setFormData({...formData, first_name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                <input required type="text" className="w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" 
                  onChange={e => setFormData({...formData, last_name: e.target.value})} />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Corporate Email</label>
                <input required type="email" className="w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" 
                  onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
            </div>
          </div>

          {/* Operational Context */}
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2 mb-4">
              Operational Assignment
            </h2>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                <select className="w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={e => setFormData({...formData, department: e.target.value})}>
                  {['Engineering', 'Finance', 'Sales', 'HR', 'Operations'].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Job Position</label>
                <input required type="text" className="w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" 
                  onChange={e => setFormData({...formData, job_position: e.target.value})} placeholder="e.g. Senior Developer" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">System Role</label>
                <select className="w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={e => setFormData({...formData, system_role: e.target.value})}>
                  {['Employee', 'HR Manager', 'HR Payroll User', 'HR Payroll Manager', 'Admin'].map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Working Schedule</label>
                <select required className="w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={e => setFormData({...formData, schedule_id: e.target.value})}>
                  <option value="">Select Schedule...</option>
                  {schedules.map(s => <option key={s.id} value={s.id}>{s.name} ({s.weekly_hours}h)</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button type="submit" disabled={loading} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium">
              <Save size={18} /> {loading ? 'Saving...' : 'Save Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}