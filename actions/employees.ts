'use server';

import { query } from '../lib/db';
import { revalidatePath } from 'next/cache';

import { v4 as uuidv4 } from 'uuid';

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

export interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  system_role: string;
  department: string;
  job_position: string;
  employment_type: string;
  status: string;
}

export async function getEmployees() {
  return await query<Employee>(
    `SELECT * FROM employees ORDER BY created_at DESC`
  );
}

export async function getEmployeeHubData(employeeId: string) {
  // Fetches employee details alongside counts for smart-button navigation
  const [employee] = await query<Employee>(
    `SELECT * FROM employees WHERE id = ?`,
    [employeeId]
  );
  
  if (!employee) throw new Error('Employee not found');

  const stats = await query(
    `SELECT 
      (SELECT COUNT(*) FROM contracts WHERE employee_id = ?) as contractCount,
      (SELECT COUNT(*) FROM attendance WHERE employee_id = ?) as attendanceCount,
      (SELECT COUNT(*) FROM leave_requests WHERE employee_id = ?) as leaveCount`,
    [employeeId, employeeId, employeeId]
  );

  return { employee, stats: stats[0] };
}