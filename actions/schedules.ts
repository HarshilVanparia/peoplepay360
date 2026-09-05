'use server';

import { query } from '../lib/db';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '../src/app/api/auth/[...nextauth]/route';

export async function getSchedules() {
  return await query(`
    SELECT ws.*,
    (SELECT COUNT(*) FROM employees WHERE schedule_id = ws.id) as assigned_employees,
    (SELECT GROUP_CONCAT(CONCAT(first_name, ' ', last_name) ORDER BY first_name SEPARATOR ', ') FROM employees WHERE schedule_id = ws.id) as assigned_employee_names
    FROM working_schedules ws
    ORDER BY ws.created_at DESC
  `);
}

export async function getScheduleWithDays(scheduleId: string) {
  const [schedule] = await query(`SELECT * FROM working_schedules WHERE id = ?`, [scheduleId]) as any[];
  const days = await query(`SELECT * FROM working_schedule_days WHERE schedule_id = ? ORDER BY weekday`, [scheduleId]);
  return { schedule, days };
}

export async function upsertScheduleDay(data: {
  schedule_id: string; weekday: number;
  start_time: string | null; end_time: string | null; break_minutes: number;
}) {
  await query(`
    INSERT INTO working_schedule_days (schedule_id, weekday, start_time, end_time, break_minutes)
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE start_time = VALUES(start_time), end_time = VALUES(end_time), break_minutes = VALUES(break_minutes)
  `, [data.schedule_id, data.weekday, data.start_time || null, data.end_time || null, data.break_minutes]);

  const days = await query(`SELECT start_time, end_time, break_minutes FROM working_schedule_days WHERE schedule_id = ? AND start_time IS NOT NULL`, [data.schedule_id]) as any[];
  const totalMinutes = days.reduce((acc: number, d: any) => {
    if (!d.start_time || !d.end_time) return acc;
    const [sh, sm] = String(d.start_time).split(':').map(Number);
    const [eh, em] = String(d.end_time).split(':').map(Number);
    return acc + (eh * 60 + em) - (sh * 60 + sm) - Number(d.break_minutes || 0);
  }, 0);
  await query(`UPDATE working_schedules SET weekly_hours = ? WHERE id = ?`, [(totalMinutes / 60).toFixed(2), data.schedule_id]);
  revalidatePath(`/schedules/${data.schedule_id}`);
  revalidatePath('/schedules');
}

export async function createSchedule(data: { name: string; days: number; hoursPerDay: number; scheduleType?: 'Fixed' | 'Flexible' | 'Full Flexible' }) {
  const weeklyHours = data.days * data.hoursPerDay;
  const { transaction } = await import('../lib/db');
  await transaction(async conn => {
    const [result]: any = await conn.execute(`INSERT INTO working_schedules (name, schedule_type, weekly_hours) VALUES (?, ?, ?)`, [data.name, data.scheduleType || 'Fixed', weeklyHours]);
    if ((data.scheduleType || 'Fixed') === 'Fixed') {
      for (let weekday = 1; weekday <= data.days; weekday++) {
        await conn.execute(
          `INSERT INTO working_schedule_days (schedule_id,weekday,start_time,end_time,break_minutes) VALUES (?,?,'09:00:00', ADDTIME('09:00:00', SEC_TO_TIME(? * 3600 + 3600)), 60)`,
          [result.insertId, weekday, data.hoursPerDay]
        );
      }
    }
  });
  revalidatePath('/schedules');
}

export async function getLeavePolicies() {
  return query(`SELECT id, name FROM leave_policies WHERE is_active = TRUE ORDER BY name`);
}
