'use server';

import { query, transaction } from '../lib/db';
import { revalidatePath } from 'next/cache';

// 1. Wizard Step 2: Filters eligible staff for explicit user selection[cite: 2].
export async function getEligibleEmployees(periodStart: string, periodEnd: string, structureId: string) {
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

// 2. Wizard Final Step: Computes payslips for selected employees[cite: 2].
export async function generatePayrun(data: any, selectedEmployeeIds: string[]) {
  return await transaction(async (conn) => {
    const [payrunResult]: any = await conn.execute(
      `INSERT INTO payruns (name, salary_structure_id, period_start, period_end, status) 
       VALUES (?, ?, ?, ?, 'Computed')`,
      [data.name, data.structureId, data.periodStart, data.periodEnd]
    );
    const payrunId = payrunResult.insertId;

    const [rules] = await conn.execute(
      `SELECT * FROM salary_rules WHERE structure_id = ? ORDER BY sequence ASC`,
      [data.structureId]
    ) as any[];

    for (const empId of selectedEmployeeIds) {
      const [contracts] = await conn.execute(
        `SELECT id, wage FROM contracts WHERE employee_id = ? AND status = 'Active' AND start_date <= ? AND (end_date IS NULL OR end_date >= ?) ORDER BY start_date DESC LIMIT 1`,
        [empId, data.periodEnd, data.periodStart]
      ) as any[];
      
      const contract = contracts[0];
      if (!contract) continue;

      let basic = Number(contract.wage);
      let gross = basic;
      let deductions = 0;

      for (const rule of rules) {
        let amount = 0;
        if (rule.calculation_type === 'FIXED') {
          amount = Number(rule.amount_value);
        } else if (rule.calculation_type === 'PERCENTAGE') {
          amount = basic * (Number(rule.amount_value) / 100);
        }

        if (rule.category === 'ALLOWANCE') gross += amount;
        if (rule.category === 'DEDUCTION') deductions += amount;
      }

      const net = gross - deductions;
      const [payslipResult]: any = await conn.execute(
        `INSERT INTO payslips (payrun_id, employee_id, contract_id, basic_wage, gross_salary, deductions, net_salary, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, 'Computed')`,
        [payrunId, empId, contract.id, basic, gross, deductions, net]
      );
      for (const rule of rules) {
        const amount = rule.calculation_type === 'PERCENTAGE' ? basic * (Number(rule.amount_value) / 100) : Number(rule.amount_value);
        await conn.execute(`INSERT INTO payslip_line_items (payslip_id, rule_id, rule_name, rule_code, category, amount, sequence) VALUES (?, ?, ?, ?, ?, ?, ?)`, [payslipResult.insertId, rule.id, rule.name, rule.code, rule.category, amount, rule.sequence]);
      }
    }

    revalidatePath('/payroll/payruns');
    return payrunId;
  });
}

// 3. Batches View: Lists all payroll batches[cite: 2].
export async function getPayruns() {
  return await query(`
    SELECT p.*, s.name as structure_name, 
    (SELECT COUNT(*) FROM payslips WHERE payrun_id = p.id) as payslip_count
    FROM payruns p
    JOIN salary_structures s ON p.salary_structure_id = s.id
    ORDER BY p.created_at DESC
  `);
}

// 4. Batch Detail View: Fetches payrun context and individual payslips[cite: 2].
export async function getPayrunDetails(payrunId: string) {
  const [payrun] = await query(`
    SELECT p.*, s.name as structure_name 
    FROM payruns p JOIN salary_structures s ON p.salary_structure_id = s.id 
    WHERE p.id = ?`, [payrunId]);

  const payslips = await query(`
    SELECT ps.*, e.first_name, e.last_name, e.bank_account_no
    FROM payslips ps
    JOIN employees e ON ps.employee_id = e.id
    WHERE ps.payrun_id = ?
  `, [payrunId]);

  return { payrun, payslips };
}

// 5. Processing Actions: Validate and Mark Paid[cite: 2].
export async function updatePayrunStatus(payrunId: string, status: 'Validated' | 'Paid', selectedPayslipIds?: number[]) {
  const ids = (selectedPayslipIds || []).map(Number).filter(Number.isInteger);
  if (!ids.length) throw new Error('Select at least one payslip.');
  const placeholders = ids.map(() => '?').join(',');
  await query(`UPDATE payslips SET status = ? WHERE payrun_id = ? AND id IN (${placeholders})`, [status, payrunId, ...ids]);
  const [summary]: any = await query(`SELECT COUNT(*) AS total, SUM(status='Paid') AS paid, SUM(status='Validated') AS validated FROM payslips WHERE payrun_id=?`, [payrunId]);
  const batchStatus = Number(summary.paid) === Number(summary.total) ? 'Paid' : Number(summary.validated) > 0 || Number(summary.paid) > 0 ? 'Validated' : 'Computed';
  await query(`UPDATE payruns SET status = ? WHERE id = ?`, [batchStatus, payrunId]);
  revalidatePath(`/payroll/payruns/${payrunId}`);
}
