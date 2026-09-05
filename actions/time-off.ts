'use server';

import { query, transaction } from '../lib/db';
import { revalidatePath } from 'next/cache';

export async function approveTimeOffRequest(requestId: string, employeeId: string, leaveTypeId: string, durationDays: number) {
  await transaction(async (conn) => {
    const [requests]: any = await conn.execute(`SELECT * FROM leave_requests WHERE id = ? AND status = 'Pending' FOR UPDATE`, [requestId]);
    if (!requests[0]) throw new Error('Leave request is no longer pending.');
    
    const [types] = await conn.execute(`SELECT requires_allocation FROM leave_types WHERE id = ?`, [leaveTypeId]) as any[];
    if (types[0]?.requires_allocation) {
      const allocation = (await conn.query(`SELECT id FROM leave_allocations WHERE employee_id = ? AND leave_type_id = ? AND status = 'Approved' AND valid_from <= CURDATE() AND valid_to >= CURDATE() AND remaining_days >= ? ORDER BY valid_to ASC LIMIT 1 FOR UPDATE`, [employeeId, leaveTypeId, durationDays]) as any)[0][0];
      if (!allocation) throw new Error('No approved leave balance can cover this request.');
      await conn.execute(`UPDATE leave_allocations SET taken_days = taken_days + ? WHERE id = ?`, [durationDays, allocation.id]);
      await conn.execute(`UPDATE leave_requests SET status = 'Approved', allocation_id = ?, approved_at = NOW() WHERE id = ?`, [allocation.id, requestId]);
    } else {
      await conn.execute(`UPDATE leave_requests SET status = 'Approved', approved_at = NOW() WHERE id = ?`, [requestId]);
    }
  });
  revalidatePath('/time-off/requests');
}

export async function createTimeOffRequest(data: any) {
  await query(
    `INSERT INTO leave_requests (employee_id, leave_type_id, start_date, end_date, duration_days, status) 
     VALUES (?, ?, ?, ?, ?, 'Pending')`,
    [data.employee_id, data.leave_type_id, data.start_date, data.end_date, data.duration_days]
  );
  revalidatePath('/time-off/requests');
}
