'use server';

import { query, transaction } from '../lib/db';
import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';

export async function getEligibleEmployees(periodStart: string, periodEnd: string, structureId: string) {
  // Enforces period-based contract resolution: only fetches employees with an active contract during the selected dates.
  return await query(`
    SELECT e.id, e.first_name, e.last_name, c.id as contract_id, c.wage 
    FROM employees e
    JOIN contracts c ON e.id = c.employee_id
    WHERE c.status = 'Active' 
      AND c.salary_structure_id = ?
      AND c.start_date <= ? 
      AND (c.end_date IS NULL OR c.end_date >= ?)
  `, [structureId, periodEnd, periodStart]);
}

export async function generatePayrun(data: any, selectedEmployeeIds: string[]) {
  return await transaction(async (conn) => {
    const payrunId = uuidv4();
    
    // 1. Initialize the batch
    await conn.execute(
      `INSERT INTO payruns (id, name, salary_structure_id, period_start, period_end, status) 
       VALUES (?, ?, ?, ?, ?, 'Draft')`,
      [payrunId, data.name, data.structureId, data.periodStart, data.periodEnd]
    );

    // 2. Fetch sequenced salary rules for the selected structure[cite: 2]
    const [rules] = await conn.execute(
      `SELECT * FROM salary_rules WHERE structure_id = ? ORDER BY sequence ASC`,
      [data.structureId]
    ) as any[];

    // 3. Process each employee using their active contract wage
    for (const empId of selectedEmployeeIds) {
      const [contracts] = await conn.execute(
        `SELECT id, wage FROM contracts WHERE employee_id = ? AND status = 'Active' LIMIT 1`,
        [empId]
      ) as any[];
      
      const contract = contracts[0];
      if (!contract) continue;

      let basic = Number(contract.wage);
      let gross = basic;
      let deductions = 0;

      // Execute ordered salary rules[cite: 2]
      for (const rule of rules) {
        let amount = 0;
        if (rule.calculation_type === 'FIXED') {
          amount = Number(rule.amount_value);
        } else if (rule.calculation_type === 'PERCENTAGE') {
          // Calculates percentage against the base wage[cite: 2]
          amount = basic * (Number(rule.amount_value) / 100);
        }

        if (rule.category === 'ALLOWANCE') gross += amount;
        if (rule.category === 'DEDUCTION') deductions += amount;
      }

      const net = gross - deductions;
      const payslipId = uuidv4();

      await conn.execute(
        `INSERT INTO payslips (id, payrun_id, employee_id, contract_id, basic_wage, gross_salary, deductions, net_salary) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [payslipId, payrunId, empId, contract.id, basic, gross, deductions, net]
      );
    }

    revalidatePath('/payroll/payruns');
    return payrunId;
  });
}