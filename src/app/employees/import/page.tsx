'use client';

import Link from 'next/link';
import { ChangeEvent, useState } from 'react';
import { ArrowLeft, FileSpreadsheet, Upload, Users } from 'lucide-react';
import { createEmployeesBulk } from '../../../../actions/employees';

const template = `first_name,last_name,email,password,system_role,department,job_position,employment_type,schedule_id,alloted_leves
Anika,Patel,anika@example.com,demo123,Employee,Engineering,Developer,Full-Time,1,24
Vikram,Singh,vikram@example.com,demo123,Employee,Sales,Account Executive,Full-Time,2,24`;

function parseCsv(source: string) {
  const rows = source.trim().split(/\r?\n/).filter(Boolean).map(line => line.split(',').map(value => value.trim()));
  if (rows.length < 2) throw new Error('Add a header and at least one employee row.');
  const headers = rows[0].map(header => header.toLowerCase());
  return rows.slice(1).map(row => Object.fromEntries(headers.map((header, index) => [header, row[index] || ''])));
}

export default function ImportEmployeesPage() {
  const [source, setSource] = useState(template);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const readFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setSource(String(reader.result || ''));
    reader.readAsText(file);
  };
  const upload = async () => {
    try {
      setLoading(true); setMessage('');
      const count = await createEmployeesBulk(parseCsv(source));
      setMessage(`${count} employees created successfully.`);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Import failed.'); }
    finally { setLoading(false); }
  };
  return <div className="space-y-7">
    <div className="flex items-center gap-4"><Link href="/employees" className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-white"><ArrowLeft size={18} /></Link><div><p className="text-xs font-bold tracking-[.2em] text-violet-300">BULK ONBOARDING</p><h1 className="text-3xl font-bold text-slate-900">Import up to 100 employees</h1></div></div>
    <div className="grid lg:grid-cols-[.8fr_1.2fr] gap-6">
      <section className="rounded-2xl border border-slate-200 p-7 space-y-5"><div className="w-11 h-11 rounded-xl bg-violet-500/15 text-violet-300 grid place-items-center"><Users size={21}/></div><h2 className="text-xl font-bold">Fast and controlled</h2><p className="text-sm leading-6 text-slate-400">Paste CSV content or upload a CSV exported from Excel. Required fields are name email department and job position. One upload creates a maximum of 100 employees.</p><label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-violet-400/40 px-4 py-2.5 text-sm text-violet-200 hover:bg-violet-500/10"><Upload size={16}/> Choose CSV<input type="file" accept=".csv,text/csv" className="hidden" onChange={readFile}/></label><p className="text-xs text-slate-500">Excel works by saving the sheet as CSV UTF-8.</p></section>
      <section className="rounded-2xl border border-slate-200 p-6 space-y-4"><div className="flex items-center gap-2"><FileSpreadsheet size={19} className="text-violet-300"/><h2 className="font-bold">Employee data</h2></div><textarea value={source} onChange={e => setSource(e.target.value)} className="min-h-80 w-full rounded-xl border p-4 font-mono text-xs leading-6 outline-none" spellCheck={false}/>{message && <p className={message.includes('successfully') ? 'text-emerald-300 text-sm' : 'text-red-300 text-sm'}>{message}</p>}<button disabled={loading} onClick={upload} className="w-full rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white hover:bg-violet-500 disabled:opacity-60">{loading ? 'Creating employees...' : 'Create employee accounts'}</button></section>
    </div>
  </div>;
}
