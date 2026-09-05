'use server';

import { query, transaction } from '../lib/db';
import { v4 as uuidv4 } from 'uuid';
import { revalidatePath } from 'next/cache';

export async function approveTimeOffRequest(requestId: string, employeeId: string, leaveTypeId: string, durationDays: number) {
  await transaction(async (conn) => {
    await conn.execute(`UPDATE leave_requests SET status = 'Approved' WHERE id = ?`, [requestId]);
    
    const [types] = await conn.execute(`SELECT requires_allocation FROM leave_types WHERE id = ?`, [leaveTypeId]) as any[];
    if (types[0]?.requires_allocation) {
      await conn.execute(`
        UPDATE leave_allocations 
        SET remaining_days = remaining_days - ? 
        WHERE employee_id = ? AND leave_type_id = ? AND status = 'Approved' AND remaining_days >= ?
      `, [durationDays, employeeId, leaveTypeId, durationDays]);
    }
  });
  revalidatePath('/time-off/requests');
}

export async function createTimeOffRequest(data: any) {
  await query(
    `INSERT INTO leave_requests (id, employee_id, leave_type_id, start_date, end_date, duration_days, status) 
     VALUES (?, ?, ?, ?, ?, ?, 'Pending')`,
    [uuidv4(), data.employee_id, data.leave_type_id, data.start_date, data.end_date, data.duration_days]
  );
  revalidatePath('/time-off/requests');
}