import { getStructureWithRules, createSalaryRule } from '../../../../../actions/salary-structures';
import { Calculator, Plus, Hash, Percent } from 'lucide-react';
import Link from 'next/link';

export default async function SalaryStructureDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { structure, rules } = await getStructureWithRules(id);

  if (!structure) return <div className="p-8">Structure not found.</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{structure.name}</h1>
              <span className="bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded text-xs font-bold border border-emerald-200">Active Base</span>
            </div>
            <p className="text-sm text-slate-500 mt-1">Rule execution sequence driving the final net salary[cite: 2].</p>
          </div>
          <details className="relative"><summary className="cursor-pointer flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm shadow-sm"><Plus size={16} /> Add Salary Rule</summary><form action={async (formData)=>{'use server';await createSalaryRule({structure_id:id,name:String(formData.get('name')),code:String(formData.get('code')),category:String(formData.get('category')),calculation_type:String(formData.get('calculation_type')),amount_value:String(formData.get('amount_value')),sequence:String(formData.get('sequence'))})}} className="absolute right-0 z-10 mt-2 w-80 rounded-xl border border-slate-200 bg-slate-900 p-4 space-y-2"><input required name="name" placeholder="Rule name" className="w-full rounded p-2"/><input required name="code" placeholder="Code" className="w-full rounded p-2"/><div className="grid grid-cols-2 gap-2"><select name="category" className="rounded p-2"><option>BASIC</option><option>ALLOWANCE</option><option>DEDUCTION</option></select><select name="calculation_type" className="rounded p-2"><option>FIXED</option><option>PERCENTAGE</option></select></div><input required name="amount_value" type="number" step="0.01" placeholder="Amount" className="w-full rounded p-2"/><input required name="sequence" type="number" value="10" className="w-full rounded p-2"/><button className="w-full rounded bg-violet-600 p-2 font-bold">Save rule</button></form></details>
        </div>

        {/* Sequenced Rules Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
            <Calculator size={18} className="text-slate-500" />
            <h2 className="font-semibold text-slate-800">Computation Rules & Sequence</h2>
          </div>
          <table className="w-full text-left border-collapse">
            <thead className="bg-white border-b border-slate-200">
              <tr>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider w-16">Seq</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Rule Name</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Code</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Calculation</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rules.map((rule: any) => (
                <tr key={rule.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6 font-mono text-sm text-slate-500 font-bold">{rule.sequence}</td>
                  <td className="py-4 px-6 font-semibold text-slate-900">{rule.name}</td>
                  <td className="py-4 px-6 font-mono text-sm text-slate-500">{rule.code}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${
                      rule.category === 'BASIC' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      rule.category === 'ALLOWANCE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      rule.category === 'DEDUCTION' ? 'bg-red-50 text-red-700 border-red-200' :
                      'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {rule.category}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-600 flex items-center gap-1.5">
                    {rule.calculation_type === 'FIXED' ? <Hash size={14} className="text-slate-400"/> : <Percent size={14} className="text-slate-400"/>}
                    {rule.calculation_type}
                  </td>
                  <td className="py-4 px-6 text-right font-mono font-medium text-slate-800">
                    {rule.calculation_type === 'PERCENTAGE' ? `${rule.amount_value}%` : `$${rule.amount_value}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
