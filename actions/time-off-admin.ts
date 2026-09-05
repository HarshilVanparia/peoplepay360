'use server';

import { query } from '../lib/db';
import { revalidatePath } from 'next/cache';

export async function getLeaveTypes() {
  return await query(`
    SELECT t.*, 
    (SELECT COUNT(*) FROM leave_allocations WHERE leave_type_id = t.id AND status = 'Approved') as active_allocations
    FROM leave_types t 
    ORDER BY t.name ASC
  `);
}

export async function getAllocations() {
  return await query(`
    SELECT a.*, e.first_name, e.last_name, t.name as type_name
    FROM leave_allocations a
    JOIN employees e ON a.employee_id = e.id
    JOIN leave_types t ON a.leave_type_id = t.id
    ORDER BY a.valid_from DESC, a.status ASC
  `);
}

export async function approveAllocation(allocationId: string) {
  // Allocations must be approved before they become available to the employee.
  await query(`UPDATE leave_allocations SET status = 'Approved' WHERE id = ?`, [allocationId]);
  revalidatePath('/time-off/allocations');
}

export async function refuseAllocation(allocationId: string) {
  await query(`UPDATE leave_allocations SET status = 'Refused' WHERE id = ?`, [allocationId]);
  revalidatePath('/time-off/allocations');
}

export async function updateLeaveType(id: string, values: { name: string; requires_allocation: boolean; is_paid: boolean; payroll_treatment: string }) {
  await query(`UPDATE leave_types SET name=?,requires_allocation=?,is_paid=?,payroll_treatment=? WHERE id=?`, [values.name,values.requires_allocation,values.is_paid,values.payroll_treatment,id]);
  revalidatePath('/time-off/types');
}

export async function createLeaveType(values: { name: string; code: string; requires_allocation: boolean; is_paid: boolean; payroll_treatment: string }) {
  await query(`INSERT INTO leave_types (name,code,requires_allocation,requires_approval,is_paid,payroll_treatment) VALUES (?,?,?,TRUE,?,?)`, [values.name,values.code,values.requires_allocation,values.is_paid,values.payroll_treatment]);
  revalidatePath('/time-off/types');
}
