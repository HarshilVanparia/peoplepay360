// actions/contracts.ts
'use server';

import { query } from '../lib/db';

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