'use server';

import { query } from '../lib/db';
import { v4 as uuidv4 } from 'uuid';
import { revalidatePath } from 'next/cache';

export async function getEmployees() {
  return await query(`SELECT * FROM employees ORDER BY created_at DESC`);
}

export async function getEmployeeHubData(id: string) {
  const [employee] = await query(`SELECT * FROM employees WHERE id = ?`, [id]) as any[];
  const [stats] = await query(`
    SELECT 
      (SELECT COUNT(*) FROM contracts WHERE employee_id = ?) as contractCount,
      (SELECT COUNT(*) FROM attendance WHERE employee_id = ?) as attendanceCount,
      (SELECT COUNT(*) FROM leave_allocations WHERE employee_id = ?) as leaveCount
  `, [id, id, id]) as any[];
  return { employee, stats };
}

export async function createEmployee(data: any) {
  const id = uuidv4();
  await query(
    `INSERT INTO employees (id, first_name, last_name, email, system_role, department, job_position, employment_type, status, schedule_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, data.first_name, data.last_name, data.email, data.system_role, 
      data.department, data.job_position, data.employment_type, data.status, 
      data.schedule_id || null
    ]
  );
  revalidatePath('/employees');
  return id;
}