'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { createSchedule } from '../../../../actions/schedules';

export default function NewSchedulePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', scheduleType: 'Fixed' as 'Fixed' | 'Flexible' | 'Full Flexible', days: 5, hoursPerDay: 8 });
  const save = async (event: React.FormEvent) => { event.preventDefault(); setSaving(true); await createSchedule(form); router.push('/schedules'); };
  return <div className="max-w-3xl space-y-6"><div className="flex items-center gap-4"><Link href="/schedules" className="p-2 rounded-lg border border-slate-200"><ArrowLeft size={18}/></Link><div><h1 className="text-3xl font-bold">Create working schedule</h1><p className="text-sm text-slate-400">Use fixed for defined hours flexible for a weekly target and full flexible for no required hours.</p></div></div><form onSubmit={save} className="rounded-2xl border border-slate-200 p-7 space-y-6"><div><label className="block text-sm mb-2">Schedule name</label><input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="w-full rounded-lg border p-3" placeholder="Example 8 AM to 5 PM"/></div><div className="grid md:grid-cols-3 gap-5"><div><label className="block text-sm mb-2">Type</label><select value={form.scheduleType} onChange={e=>setForm({...form,scheduleType:e.target.value as any})} className="w-full rounded-lg border p-3"><option>Fixed</option><option>Flexible</option><option>Full Flexible</option></select></div><div><label className="block text-sm mb-2">Days per week</label><input min="0" max="7" type="number" value={form.days} onChange={e=>setForm({...form,days:Number(e.target.value)})} className="w-full rounded-lg border p-3"/></div><div><label className="block text-sm mb-2">Hours per day</label><input min="0" max="24" step="0.25" type="number" value={form.hoursPerDay} onChange={e=>setForm({...form,hoursPerDay:Number(e.target.value)})} className="w-full rounded-lg border p-3"/></div></div><div className="rounded-xl bg-violet-500/10 p-4 text-sm text-violet-200">Weekly expected hours {form.scheduleType === 'Full Flexible' ? '0.00' : (form.days * form.hoursPerDay).toFixed(2)}</div><button disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-3 font-semibold text-white"><Save size={17}/>{saving ? 'Saving...' : 'Create schedule'}</button></form></div>;
}
