'use server';

import { query } from '../lib/db';
import { revalidatePath } from 'next/cache';

export async function getAttendance(employeeId?: string) {
  const sql = `
    SELECT a.*, e.first_name, e.last_name 
    FROM attendance a
    JOIN employees e ON a.employee_id = e.id
    ${employeeId ? 'WHERE a.employee_id = ?' : ''}
    ORDER BY a.check_in DESC
  `;
  return await query(sql, employeeId ? [employeeId] : []);
}

export async function getAttendanceRecord(id: string) {
  const [record] = await query(`
    SELECT a.*, e.first_name, e.last_name 
    FROM attendance a JOIN employees e ON a.employee_id = e.id 
    WHERE a.id = ?
  `, [id]) as any[];
  return record;
}

export async function saveAttendanceCorrection(data: any) {
  let workedHours = 0;
  if (data.check_in && data.check_out) {
    const diff = new Date(data.check_out).getTime() - new Date(data.check_in).getTime();
    workedHours = Math.max(0, diff / (1000 * 60 * 60));
  }
  const formatForDb = (isoString: string) => isoString ? isoString.replace('T', ' ') + ':00' : null;

  if (data.id) {
    await query(
      `UPDATE attendance SET check_in = ?, check_out = ?, worked_hours = ?, status = ? WHERE id = ?`,
      [formatForDb(data.check_in), formatForDb(data.check_out), workedHours.toFixed(2), data.status, data.id]
    );
  } else {
    await query(
      `INSERT INTO attendance (employee_id, check_in, check_out, check_out_status, worked_hours, status) VALUES (?, ?, ?, IF(? IS NULL, NULL, 'Offline'), ?, ?)`,
      [data.employee_id, formatForDb(data.check_in), formatForDb(data.check_out), formatForDb(data.check_out), workedHours.toFixed(2), data.status]
    );
  }
  revalidatePath('/attendance');
}
