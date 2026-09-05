'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createTimeOffRequest, getMyLeaveContext } from '../../../../../actions/time-off';
import { Calendar, ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function NewTimeOffRequest() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
  const [formData, setFormData] = useState({ leave_type_id: '', start_date: '', end_date: '', duration_days: 0 });

  useEffect(() => {
    getMyLeaveContext().then(setLeaveTypes);
  }, []);

  const calculateDuration = (start: string, end: string) => {
    if (!start || !end) return 0;
    const diff = new Date(end).getTime() - new Date(start).getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await createTimeOffRequest({ ...formData, duration_days: calculateDuration(formData.start_date, formData.end_date) });
    router.push('/time-off/requests');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/time-off/requests" className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"><ArrowLeft size={20} /></Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Submit Leave Request</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm space-y-6">
          <div className="grid grid-cols-1 gap-5">
            <div className="grid grid-cols-3 gap-3">{leaveTypes.map(t => <div key={t.id} className="rounded-lg border border-slate-200 p-3"><p className="text-xs text-slate-400">{t.name}</p><p className="mt-1 text-lg font-bold">{Number(t.remaining_days).toFixed(1)} days</p><p className="text-xs text-violet-300">{t.payroll_treatment}</p></div>)}</div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Leave Type</label>
              <select required className="w-full border border-slate-300 rounded-lg p-2.5 text-sm" onChange={e => setFormData({...formData, leave_type_id: e.target.value})}>
                <option value="">Select Type...</option>
                {leaveTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                <input required type="date" className="w-full border border-slate-300 rounded-lg p-2.5 text-sm" onChange={e => setFormData({...formData, start_date: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                <input required type="date" className="w-full border border-slate-300 rounded-lg p-2.5 text-sm" onChange={e => setFormData({...formData, end_date: e.target.value})} />
              </div>
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full flex justify-center items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium">
            <Save size={18} /> {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </div>
    </div>
  );
}
