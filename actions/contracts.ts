// actions/contracts.ts
'use server';

import { query, transaction } from '../lib/db';

import { v4 as uuidv4 } from 'uuid';
import { revalidatePath } from 'next/cache';


export async function createContract(data: any) {
  return await transaction(async (conn) => {
    // Business Rule: Ensure payroll processes only the contract applicable to the selected period[cite: 1].
    // If setting a new 'Active' contract, expire old ones for the same employee to prevent concurrent active records.
    if (data.status === 'Active') {
      await conn.execute(
        `UPDATE contracts SET status = 'Expired' WHERE employee_id = ? AND status = 'Active'`, 
        [data.employee_id]
      );
    }

    const id = uuidv4();
    await conn.execute(
      `INSERT INTO contracts (id, employee_id, wage, salary_structure_id, start_date, end_date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id, data.employee_id, data.wage, data.salary_structure_id, 
        data.start_date, data.end_date || null, data.status
      ]
    );

    revalidatePath('/contracts');
    return id;
  });
}



export interface ContractItem {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  department: string;
  wage: number;
  salary_structure_name: string;
  start_date: string;
  end_date: string | null;
  status: 'Draft' | 'Active' | 'Expired';
}




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
  return await query<ContractItem>(sql, employeeId ? [employeeId] : []);
}