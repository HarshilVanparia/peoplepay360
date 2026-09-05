'use server';

import { query } from '../lib/db';
import { revalidatePath } from 'next/cache';

export async function getSalaryStructures() {
  return await query(`
    SELECT s.*,
    (SELECT COUNT(*) FROM salary_rules WHERE structure_id = s.id) as rule_count,
    (SELECT COUNT(*) FROM contracts WHERE salary_structure_id = s.id AND status = 'Active') as active_employees
    FROM salary_structures s
    ORDER BY s.created_at DESC
  `);
}

export async function getStructureWithRules(structureId: string) {
  const [structure] = await query(`SELECT * FROM salary_structures WHERE id = ?`, [structureId]) as any[];
  const rules = await query(`SELECT * FROM salary_rules WHERE structure_id = ? ORDER BY sequence ASC`, [structureId]);
  return { structure, rules };
}

export async function createSalaryStructure(data: { name: string }) {
  await query(`INSERT INTO salary_structures (name, is_active) VALUES (?, TRUE)`, [data.name.trim()]);
  revalidatePath('/payroll/structures');
}

export async function toggleSalaryStructure(id: string, is_active: boolean) {
  await query(`UPDATE salary_structures SET is_active = ? WHERE id = ?`, [is_active, id]);
  revalidatePath('/payroll/structures');
}

export async function createSalaryRule(data: {
  structure_id: string; name: string; code: string;
  category: string; calculation_type: string; amount_value: string; sequence: string;
}) {
  await query(
    `INSERT INTO salary_rules (structure_id,name,code,category,calculation_type,amount_value,sequence) VALUES (?,?,?,?,?,?,?)`,
    [data.structure_id, data.name, data.code, data.category, data.calculation_type, data.amount_value, data.sequence]
  );
  revalidatePath(`/payroll/structures/${data.structure_id}`);
}

export async function deleteSalaryRule(ruleId: string, structureId: string) {
  await query(`DELETE FROM salary_rules WHERE id = ?`, [ruleId]);
  revalidatePath(`/payroll/structures/${structureId}`);
}

export async function getPayslipDetail(payslipId: string) {
  const [payslip] = await query(`
    SELECT ps.*, e.first_name, e.last_name, e.department, e.job_position, e.bank_account_no,
           pr.name AS payrun_name, pr.period_start, pr.period_end, pr.status AS payrun_status,
           ss.name AS structure_name, c.wage AS contract_wage, c.wage_period
    FROM payslips ps
    JOIN employees e ON e.id = ps.employee_id
    JOIN payruns pr ON pr.id = ps.payrun_id
    JOIN salary_structures ss ON ss.id = pr.salary_structure_id
    JOIN contracts c ON c.id = ps.contract_id
    WHERE ps.id = ?
  `, [payslipId]) as any[];
  const lines = await query(`SELECT * FROM payslip_line_items WHERE payslip_id = ? ORDER BY sequence`, [payslipId]);
  return { payslip, lines };
}

export async function getPayslips(filters?: { payrunId?: string; employeeId?: string }) {
  const conds: string[] = [];
  const vals: any[] = [];
  if (filters?.payrunId) { conds.push('ps.payrun_id = ?'); vals.push(filters.payrunId); }
  if (filters?.employeeId) { conds.push('ps.employee_id = ?'); vals.push(filters.employeeId); }
  const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
  return query(`
    SELECT ps.*, e.first_name, e.last_name, pr.name AS payrun_name, pr.period_start, pr.period_end
    FROM payslips ps
    JOIN employees e ON e.id = ps.employee_id
    JOIN payruns pr ON pr.id = ps.payrun_id
    ${where}
    ORDER BY pr.period_start DESC, e.last_name
  `, vals);
}
