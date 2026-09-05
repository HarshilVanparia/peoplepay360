'use client';

import { useState } from 'react';
import { getEligibleEmployees, generatePayrun } from '../../../../../actions/payroll';
import { useRouter } from 'next/navigation';

export default function NewPayrunWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', periodStart: '', periodEnd: '', structureId: '' });
  const [eligibleStaff, setEligibleStaff] = useState<any[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);

  const handleScopeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Step 2: Fetch only staff with active contracts for this period[cite: 2]
    const staff = await getEligibleEmployees(formData.periodStart, formData.periodEnd, formData.structureId);
    setEligibleStaff(staff);
    setSelectedStaff(staff.map(s => s.id)); // Auto-select all by default
    setStep(2);
    setLoading(false);
  };

  const handleFinalize = async () => {
    setLoading(true);
    await generatePayrun(formData, selectedStaff);
    router.push('/payroll/payruns');
  };

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Generate Payrun</h1>
      
      <div className="bg-white border rounded-lg p-6">
        {step === 1 ? (
          <form onSubmit={handleScopeSubmit} className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Step 1: Define Period & Scope</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Payrun Name</label>
                <input required type="text" className="w-full border rounded p-2" 
                  onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Structure ID (Mock)</label>
                <input required type="text" className="w-full border rounded p-2" 
                  onChange={e => setFormData({...formData, structureId: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <input required type="date" className="w-full border rounded p-2" 
                  onChange={e => setFormData({...formData, periodStart: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Date</label>
                <input required type="date" className="w-full border rounded p-2" 
                  onChange={e => setFormData({...formData, periodEnd: e.target.value})} />
              </div>
            </div>
            <button type="submit" disabled={loading} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">
              {loading ? 'Validating...' : 'Continue to Employee Selection'}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Step 2: Select Employees</h2>
            <div className="border rounded divide-y max-h-64 overflow-y-auto">
              {eligibleStaff.map(emp => (
                <label key={emp.id} className="flex items-center p-3 hover:bg-gray-50 cursor-pointer">
                  <input type="checkbox" checked={selectedStaff.includes(emp.id)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedStaff([...selectedStaff, emp.id]);
                      else setSelectedStaff(selectedStaff.filter(id => id !== emp.id));
                    }} 
                    className="mr-3 h-4 w-4" 
                  />
                  <div>
                    <p className="font-medium">{emp.first_name} {emp.last_name}</p>
                    <p className="text-xs text-gray-500">Contract Base: ${emp.wage}</p>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex justify-between pt-4">
              <button onClick={() => setStep(1)} className="text-gray-600 px-4 py-2 border rounded">Back</button>
              <button onClick={handleFinalize} disabled={loading} className="bg-green-600 text-white px-4 py-2 rounded">
                {loading ? 'Computing Payslips...' : 'Generate Payroll Batch'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}