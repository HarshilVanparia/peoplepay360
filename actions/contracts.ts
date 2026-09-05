'use server';

import { query, transaction } from '../lib/db';
import { revalidatePath } from 'next/cache';

export async function getContracts(employeeId?: string) {
  const sql = `
    SELECT 
      c.id, c.employee_id, c.wage, c.start_date, c.end_date, c.status,
      e.first_name, e.last_name, e.department,
      s.name as salary_structure_name
    FROM contracts c
    JOIN employees e ON c.employee_id = e.id
    JOIN salary_structures s ON c.salary_structure_id = s.id
    ${employeeId ? 'WHERE c.employee_id = ?' : ''}
    ORDER BY c.status = 'Active' DESC, c.start_date DESC
  `;
  return await query(sql, employeeId ? [employeeId] : []);
}

export async function createContract(data: any) {
  return await transaction(async (conn) => {
    if (data.status === 'Active') {
      await conn.execute(
        `UPDATE contracts SET status = 'Expired' WHERE employee_id = ? AND status = 'Active'`, 
        [data.employee_id]
      );
    }
    const [result]: any = await conn.execute(
      `INSERT INTO contracts (employee_id, contract_number, department, job_position, employment_type, schedule_id, wage, salary_structure_id, start_date, end_date, status)
       SELECT ?, CONCAT('CTR-', ?, '-', DATE_FORMAT(?, '%Y%m%d')), department, job_position, employment_type, schedule_id, ?, ?, ?, ?, ? FROM employees WHERE id = ?`,
      [
        data.employee_id, data.employee_id, data.start_date, data.wage, data.salary_structure_id,
        data.start_date, data.end_date || null, data.status, data.employee_id
      ]
    );
    revalidatePath('/contracts');
    return result.insertId;
  });
}
