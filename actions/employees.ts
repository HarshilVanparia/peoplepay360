'use server';

import { query } from '../lib/db';
import { transaction } from '../lib/db';
import { revalidatePath } from 'next/cache';

export async function getEmployees() {
  return await query(`SELECT * FROM employees ORDER BY created_at DESC`);
}

export async function getEmployeeHubData(id: string | number) {
  const [employee] = await query(`SELECT e.*, ws.name AS schedule_name, CONCAT(m.first_name, ' ', m.last_name) AS manager_name FROM employees e LEFT JOIN working_schedules ws ON ws.id=e.schedule_id LEFT JOIN employees m ON m.id=e.manager_id WHERE e.id = ?`, [id]) as any[];
  const [stats] = await query(`
    SELECT 
      (SELECT COUNT(*) FROM contracts WHERE employee_id = ?) as contractCount,
      (SELECT COUNT(*) FROM attendance WHERE employee_id = ?) as attendanceCount,
      (SELECT COUNT(*) FROM leave_allocations WHERE employee_id = ?) as leaveCount
  `, [id, id, id]) as any[];
  const [pay] = await query(`SELECT wage,wage_period FROM contracts WHERE employee_id=? AND status='Active' ORDER BY start_date DESC LIMIT 1`, [id]) as any[];
  const balances = await query(`SELECT t.name,COALESCE(SUM(a.remaining_days),0) AS remaining FROM leave_types t LEFT JOIN leave_allocations a ON a.leave_type_id=t.id AND a.employee_id=? AND a.status='Approved' GROUP BY t.id,t.name ORDER BY t.name`, [id]);
  return { employee, stats, pay, balances };
}

export async function createEmployee(data: any) {
  const result: any = await query(
    `INSERT INTO employees (first_name, last_name, email, password, system_role, department, job_position, employment_type, status, schedule_id, manager_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.first_name, data.last_name, data.email, data.password || 'demo123', data.system_role, 
      data.department, data.job_position, data.employment_type, data.status, 
      data.schedule_id || null, data.manager_id || null
    ]
  );
  revalidatePath('/employees');
  return result.insertId;
}

export async function createEmployeesBulk(records: Array<Record<string, string>>) {
  if (!Array.isArray(records) || records.length === 0 || records.length > 100) throw new Error('Upload 1 to 100 employees at a time.');
  const allowedRoles = new Set(['Employee', 'HR Manager', 'HR Payroll User', 'HR Payroll Manager', 'Admin']);
  const emails = new Set<string>();
  for (const record of records) {
    const email = String(record.email || '').trim().toLowerCase();
    if (!record.first_name?.trim() || !record.last_name?.trim() || !email.includes('@') || !record.department?.trim() || !record.job_position?.trim()) throw new Error('Every row needs first_name last_name email department and job_position.');
    if (emails.has(email)) throw new Error(`Duplicate email in upload ${email}`);
    emails.add(email);
    if (record.system_role && !allowedRoles.has(record.system_role)) throw new Error(`Invalid role for ${email}`);
  }
  const created = await transaction(async (conn) => {
    let count = 0;
    for (const record of records) {
      const [result]: any = await conn.execute(
        `INSERT INTO employees (first_name,last_name,email,password,system_role,department,job_position,employment_type,status,schedule_id,alloted_leves)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Active', ?, ?)` ,
        [record.first_name.trim(), record.last_name.trim(), record.email.trim().toLowerCase(), record.password?.trim() || 'demo123', record.system_role || 'Employee', record.department.trim(), record.job_position.trim(), record.employment_type || 'Full-Time', record.schedule_id ? Number(record.schedule_id) : null, Number(record.alloted_leves || 0)]
      );
      if (result.affectedRows) count++;
    }
    return count;
  });
  revalidatePath('/employees');
  return created;
}
