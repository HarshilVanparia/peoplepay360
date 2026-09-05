'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, CalendarDays } from 'lucide-react';
import { createAllocation } from '../../../../../actions/time-off-admin';
import { getLeaveTypes } from '../../../../../actions/time-off-admin';
import { getEmployees } from '../../../../../actions/employees';

export default function NewAllocationPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [employees, setEmployees] = useState<any[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
  const [form, setForm] = useState({
    employee_id: '', leave_type_id: '',
    total_days: '18', valid_from: new Date().getFullYear() + '-01-01',
    valid_to: new Date().getFullYear() + '-12-31',
  });

  useEffect(() => {
    Promise.all([getEmployees(), getLeaveTypes()]).then(([emps, types]) => {
      setEmployees(emps);
      setLeaveTypes(types);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await createAllocation(form);
      router.push('/time-off/allocations');
    } catch (err: any) {
      setError(err.message || 'Failed to create allocation.');
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="rounded-2xl border border-slate-700/60 bg-slate-900/40 p-6">
        <div className="flex items-center gap-4 mb-3">
          <Link href="/time-off/allocations" className="p-2 rounded-xl border border-slate-700 hover:border-slate-500 transition-colors">
            <ArrowLeft size={18} className="text-slate-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Assign Leave Allocation</h1>
            <p className="text-sm text-slate-400 mt-0.5">Create a leave balance for an employee. Must be approved before it becomes available.</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-900/20 px-4 py-3 text-sm text-red-300">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-700/60 bg-slate-900/40 p-7 space-y-6">
        <div className="grid md:grid-cols-2 gap-5">
          <div className="md:col-span-2 space-y-1.5">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Employee</label>
            <select
              required
              value={form.employee_id}
              onChange={e => setForm({ ...form, employee_id: e.target.value })}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
            >
              <option value="">Select employee...</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.first_name} {e.last_name} - {e.department}</option>)}
            </select>
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Leave Type</label>
            <select
              required
              value={form.leave_type_id}
              onChange={e => setForm({ ...form, leave_type_id: e.target.value })}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
            >
              <option value="">Select leave type...</option>
              {leaveTypes.map((t: any) => <option key={t.id} value={t.id}>{t.name} ({t.payroll_treatment})</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Days Allocated</label>
            <input
              required
              type="number"
              min="0"
              step="0.5"
              value={form.total_days}
              onChange={e => setForm({ ...form, total_days: e.target.value })}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm text-white font-mono outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Valid From</label>
            <input
              required
              type="date"
              value={form.valid_from}
              onChange={e => setForm({ ...form, valid_from: e.target.value })}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Valid To</label>
            <input
              required
              type="date"
              value={form.valid_to}
              onChange={e => setForm({ ...form, valid_to: e.target.value })}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm text-white outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
            />
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-900/10 px-4 py-3">
          <CalendarDays size={16} className="text-amber-400 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-300">Allocation will be created in <strong>Draft</strong> status. An HR Manager must approve it before the employee can use this balance.</p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold text-white hover:bg-violet-500 disabled:opacity-50 transition-all shadow-lg shadow-violet-900/30"
        >
          <Save size={15} /> {saving ? 'Creating...' : 'Create Allocation'}
        </button>
      </form>
    </div>
  );
}
