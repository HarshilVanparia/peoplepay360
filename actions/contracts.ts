'use server';

import { query, transaction } from '../lib/db';
import { revalidatePath } from 'next/cache';

export async function getContracts(employeeId?: string) {
  return query(`SELECT c.id,c.employee_id,c.wage,c.start_date,c.end_date,c.status,e.first_name,e.last_name,c.department,s.name AS salary_structure_name FROM contracts c JOIN employees e ON e.id=c.employee_id JOIN salary_structures s ON s.id=c.salary_structure_id ${employeeId ? 'WHERE c.employee_id=?' : ''} ORDER BY c.status='Active' DESC,c.start_date DESC`, employeeId ? [employeeId] : []);
}
export async function getContract(id: string | number) { const [contract] = await query(`SELECT * FROM contracts WHERE id=?`, [id]) as any[]; return contract; }
export async function createContract(data: any) {
  return transaction(async conn => {
    if (data.id) {
      await conn.execute(`UPDATE contracts SET department=?,job_position=?,employment_type=?,schedule_id=?,leave_policy_id=?,wage=?,wage_period=?,salary_structure_id=?,start_date=?,end_date=?,status=? WHERE id=?`, [data.department,data.job_position,data.employment_type,data.schedule_id||null,data.leave_policy_id||null,data.wage,data.wage_period,data.salary_structure_id,data.start_date,data.end_date||null,data.status,data.id]);
      revalidatePath('/contracts'); return Number(data.id);
    }
    if (data.status === 'Active') await conn.execute(`UPDATE contracts SET status='Expired' WHERE employee_id=? AND status='Active'`, [data.employee_id]);
    const [result]: any = await conn.execute(`INSERT INTO contracts (employee_id,contract_number,department,job_position,employment_type,schedule_id,salary_structure_id,leave_policy_id,wage,wage_period,start_date,end_date,status) VALUES (?,CONCAT('CTR-',?,'-',DATE_FORMAT(NOW(),'%Y%m%d%H%i%s')),?,?,?,?,?,?,?,?,?,?,?)`, [data.employee_id,data.employee_id,data.department,data.job_position,data.employment_type,data.schedule_id||null,data.salary_structure_id,data.leave_policy_id||null,data.wage,data.wage_period||'Monthly',data.start_date,data.end_date||null,data.status]);
    revalidatePath('/contracts'); return result.insertId;
  });
}
