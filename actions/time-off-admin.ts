'use server';

import { query } from '../lib/db';
import { v4 as uuidv4 } from 'uuid';
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