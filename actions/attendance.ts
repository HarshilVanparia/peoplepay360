'use server';

import { query } from '../lib/db';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '../src/app/api/auth/[...nextauth]/route';

export async function getAttendance(employeeId?: string) {
  const session = await getServerSession(authOptions);
  const isEmployee = (session?.user as any)?.role === 'Employee';
  const effectiveEmployeeId = isEmployee ? String((session?.user as any)?.id) : employeeId;
  const sql = `
    SELECT
      a.*,
      e.first_name,
      e.last_name,
      ws.name AS schedule_name,
      wsd.start_time AS scheduled_start,
      wsd.end_time AS scheduled_end
    FROM attendance a
    JOIN employees e ON a.employee_id = e.id
    LEFT JOIN working_schedules ws ON ws.id = e.schedule_id
    LEFT JOIN working_schedule_days wsd
      ON wsd.schedule_id = e.schedule_id
      AND wsd.weekday = DAYOFWEEK(DATE(a.check_in)) - 1
      AND wsd.weekday BETWEEN 1 AND 7
    ${effectiveEmployeeId ? 'WHERE a.employee_id = ?' : ''}
    ORDER BY a.check_in DESC
  `;
  return await query(sql, effectiveEmployeeId ? [effectiveEmployeeId] : []);
}

export async function getAttendanceRecord(id: string) {
  const [record] = await query(`
    SELECT a.*, e.first_name, e.last_name
    FROM attendance a JOIN employees e ON a.employee_id = e.id
    WHERE a.id = ?
  `, [id]) as any[];
  return record;
}

export async function getMyAttendanceStatus() {
  const session = await getServerSession(authOptions);
  const employeeId = Number((session?.user as any)?.id);
  if (!employeeId) return { isClockedIn: false, lastRecord: null };
  const rows: any[] = await query(
    `SELECT * FROM attendance WHERE employee_id = ? ORDER BY check_in DESC LIMIT 1`,
    [employeeId]
  );
  const last = rows[0] || null;
  const isClockedIn = !!last && last.check_out === null;
  return { isClockedIn, lastRecord: last };
}

export async function saveAttendanceCorrection(data: any) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role === 'Employee') {
    data.employee_id = String((session?.user as any)?.id);
    if (data.id) throw new Error('Employees cannot edit existing attendance records.');
  }
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

export async function clockMyAttendance(action: 'in' | 'out') {
  const session = await getServerSession(authOptions);
  const employeeId = Number((session?.user as any)?.id);
  if (!employeeId) throw new Error('You must be signed in.');
  if (action === 'in') {
    const existing: any[] = await query(
      `SELECT id FROM attendance WHERE employee_id=? AND check_out IS NULL ORDER BY check_in DESC LIMIT 1`,
      [employeeId]
    );
    if (existing[0]) throw new Error('Already clocked in. Please check out first.');
    const [schedule]: any = await query(
      `SELECT d.start_time FROM employees e JOIN working_schedules s ON s.id=e.schedule_id LEFT JOIN working_schedule_days d ON d.schedule_id=s.id AND d.weekday=WEEKDAY(CURDATE())+1 WHERE e.id=?`,
      [employeeId]
    );
    const status = schedule?.start_time && String(schedule.start_time).slice(0, 5) < new Date().toTimeString().slice(0, 5) ? 'Late' : 'Normal';
    await query(`INSERT INTO attendance (employee_id,check_in,check_in_status,status) VALUES (?,NOW(),'Available',?)`, [employeeId, status]);
  } else {
    const rows: any[] = await query(`SELECT id,check_in FROM attendance WHERE employee_id=? AND check_out IS NULL ORDER BY check_in DESC LIMIT 1`, [employeeId]);
    if (!rows[0]) throw new Error('No open check-in found.');
    await query(`UPDATE attendance SET check_out=NOW(),check_out_status='Offline',worked_hours=ROUND(TIMESTAMPDIFF(MINUTE,check_in,NOW())/60,2) WHERE id=?`, [rows[0].id]);
  }
  revalidatePath('/attendance');
}
