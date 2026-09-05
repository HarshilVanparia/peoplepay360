'use server';

import { query } from '../lib/db';

export async function getAttendance(employeeId?: string) {
  const sql = employeeId 
    ? `SELECT a.*, e.first_name, e.last_name FROM attendance a JOIN employees e ON a.employee_id = e.id WHERE a.employee_id = ? ORDER BY a.check_in DESC`
    : `SELECT a.*, e.first_name, e.last_name FROM attendance a JOIN employees e ON a.employee_id = e.id ORDER BY a.check_in DESC`;
    
  return await query(sql, employeeId ? [employeeId] : []);
}   