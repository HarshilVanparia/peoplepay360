'use client';

import { useState } from 'react';
import { getEligibleEmployees, generatePayrun } from '../../../../../actions/payroll';
import { useRouter } from 'next/navigation';
import { CheckSquare, ArrowRight, UserCheck } from 'lucide-react';

export default function NewPayrunWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', periodStart: '', periodEnd: '', structureId: 'struct-standard' });
  const [eligibleStaff, setEligibleStaff] = useState<any[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);

  const handleScopeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const staff = await getEligibleEmployees(formData.periodStart, formData.periodEnd, formData.structureId);
    setEligibleStaff(staff);
    setSelectedStaff(staff.map(s => s.id));
    setStep(2);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Generate Payrun Batch</h1>
        
        <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
          {step === 1 ? (
            <form onSubmit={handleScopeSubmit} className="space-y-6">
              <div className="border-b border-slate-100 pb-4 mb-4">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span> 
                  Define Scope & Period
                </h2>
                <p className="text-sm text-slate-500 mt-1">Select the structure and date boundaries[cite: 2].</p>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Batch Name</label>
                  <input required type="text" className="w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" 
                    onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g., September 2026 Payroll" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                  <input required type="date" className="w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" 
                    onChange={e => setFormData({...formData, periodStart: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                  <input required type="date" className="w-full border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500" 
                    onChange={e => setFormData({...formData, periodEnd: e.target.value})} />
                </div>
              </div>
              <button type="submit" disabled={loading} className="mt-6 flex items-center justify-center gap-2 w-full bg-slate-900 text-white px-4 py-3 rounded-lg hover:bg-slate-800 transition font-medium">
                {loading ? 'Resolving Contracts...' : 'Continue to Employee Selection'} <ArrowRight size={16} />
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4 mb-4">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span> 
                  Select Eligible Staff
                </h2>
                <p className="text-sm text-slate-500 mt-1">Only employees with active contracts in this period are displayed[cite: 2].</p>
              </div>
              <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-80 overflow-y-auto">
                {eligibleStaff.length === 0 ? (
                  <p className="p-4 text-sm text-slate-500 text-center">No active contracts found for this period.</p>
                ) : eligibleStaff.map(emp => (
                  <label key={emp.id} className="flex items-center p-4 hover:bg-slate-50 cursor-pointer transition-colors">
                    <input type="checkbox" checked={selectedStaff.includes(emp.id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedStaff([...selectedStaff, emp.id]);
                        else setSelectedStaff(selectedStaff.filter(id => id !== emp.id));
                      }} 
                      className="mr-4 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" 
                    />
                    <div className="flex-1 flex justify-between items-center">
                      <div className="font-medium text-slate-900 flex items-center gap-2"><UserCheck size={16} className="text-slate-400"/> {emp.first_name} {emp.last_name}</div>
                      <div className="text-sm text-slate-500 font-mono">Base: ${emp.wage}</div>
                    </div>
                  </label>
                ))}
              </div>
              <div className="flex justify-between pt-2">
                <button onClick={() => setStep(1)} className="text-slate-600 px-5 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 font-medium">Back</button>
                <button onClick={async () => {
                    setLoading(true);
                    await generatePayrun(formData, selectedStaff);
                    router.push('/payroll/payruns');
                  }} disabled={loading || selectedStaff.length === 0} 
                  className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-2">
                  {loading ? 'Computing Rules...' : 'Generate Payslips'} <CheckSquare size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}