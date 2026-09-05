'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { getAttendanceRecord, saveAttendanceCorrection } from '../../../../actions/attendance';
import { getEmployees } from '../../../../actions/employees';
import { Clock, ArrowLeft, Save, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function AttendanceCorrectionForm({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const isNew = resolvedParams.id === 'new';
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    id: isNew ? '' : resolvedParams.id,
    employee_id: '',
    check_in: '',
    check_out: '',
    status: 'Normal'
  });

  useEffect(() => {
    async function loadData() {
      if (isNew) {
        const emps = await getEmployees();
        setEmployees(emps);
      } else {
        const record = await getAttendanceRecord(resolvedParams.id);
        if (record) {
          setFormData({
            id: record.id,
            employee_id: record.employee_id,
            // Format MySQL DATETIME to HTML datetime-local (YYYY-MM-DDTHH:MM)
            check_in: record.check_in ? record.check_in.replace(' ', 'T').slice(0, 16) : '',
            check_out: record.check_out ? record.check_out.replace(' ', 'T').slice(0, 16) : '',
            status: record.status
          });
        }
      }
      setLoading(false);
    }
    loadData();
  }, [resolvedParams.id, isNew]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await saveAttendanceCorrection(formData);
    router.push('/attendance');
  };

  if (loading) return <div className="p-8">Loading record...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/attendance" className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600"><ArrowLeft size={20} /></Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{isNew ? 'Log Manual Attendance' : 'Attendance Correction'}</h1>
            <p className="text-sm text-slate-500 mt-1">Provide detailed records and support manual corrections.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm space-y-8">
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-start gap-3 text-sm text-blue-800">
            <AlertCircle size={18} className="mt-0.5 text-blue-600" />
            <p>Manual edits overwrite terminal data. Calculated worked hours will update automatically upon saving.</p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Employee</label>
              {isNew ? (
                <select required className="w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={e => setFormData({...formData, employee_id: e.target.value})}>
                  <option value="">Select Employee...</option>
                  {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>)}
                </select>
              ) : (
                <input disabled type="text" className="w-full border border-slate-200 bg-slate-50 rounded-lg p-2.5 text-sm text-slate-500" value="Pre-selected from record" />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Check In Time</label>
              <input required type="datetime-local" className="w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" 
                value={formData.check_in} onChange={e => setFormData({...formData, check_in: e.target.value})} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Check Out Time</label>
              <input type="datetime-local" className="w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" 
                value={formData.check_out} onChange={e => setFormData({...formData, check_out: e.target.value})} />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Status Tag</label>
              <select required className="w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="Normal">Normal</option>
                <option value="Late">Late</option>
                <option value="Overtime">Overtime</option>
                <option value="Manual Correction">Manual Correction</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button type="submit" disabled={saving} className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-lg hover:bg-slate-800 transition font-medium">
              <Save size={18} /> {saving ? 'Saving...' : 'Save Correction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
