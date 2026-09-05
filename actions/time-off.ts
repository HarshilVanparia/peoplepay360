'use server';

import { query, transaction } from '../lib/db';
import { revalidatePath } from 'next/cache';

export async function approveTimeOffRequest(requestId: string, employeeId: string, leaveTypeId: string, durationDays: number) {
  // Executes within an atomic transaction to prevent orphaned deductions
  return await transaction(async (conn) => {
    // 1. Verify sufficient allocation balance exists
    const [allocation] = await conn.execute(
      `SELECT id, remaining_days FROM leave_allocations 
       WHERE employee_id = ? AND leave_type_id = ? AND status = 'Approved' 
       AND remaining_days >= ? AND valid_to >= CURRENT_DATE
       FOR UPDATE`, 
      [employeeId, leaveTypeId, durationDays]
    ) as any[];

    if (!allocation.length) {
      throw new Error('Insufficient leave allocation balance.');
    }

    // 2. Deduct the approved days from the balance
    await conn.execute(
      `UPDATE leave_allocations SET remaining_days = remaining_days - ? WHERE id = ?`,
      [durationDays, allocation[0].id]
    );

    // 3. Mark request as Approved
    await conn.execute(
      `UPDATE leave_requests SET status = 'Approved' WHERE id = ?`,
      [requestId]
    );

    revalidatePath('/time-off/requests');
    return true;
  });
}