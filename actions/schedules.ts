'use server';

import { query } from '../lib/db';
import { revalidatePath } from 'next/cache';

export async function getSchedules() {
  return await query(`
    SELECT ws.*, 
    (SELECT COUNT(*) FROM employees WHERE schedule_id = ws.id) as assigned_employees,
    (SELECT GROUP_CONCAT(CONCAT(first_name, ' ', last_name) ORDER BY first_name SEPARATOR ', ') FROM employees WHERE schedule_id = ws.id) as assigned_employee_names
    FROM working_schedules ws
    ORDER BY ws.created_at DESC
  `);
}

export async function createSchedule(data: { name: string, days: number, hoursPerDay: number, scheduleType?: 'Fixed' | 'Flexible' | 'Full Flexible' }) {
  // Automatically calculates weekly hours based on pattern (Days * Hours)
  const weeklyHours = data.days * data.hoursPerDay; 
  
  await query(
    `INSERT INTO working_schedules (name, schedule_type, weekly_hours) VALUES (?, ?, ?)`,
    [data.name, data.scheduleType || 'Fixed', weeklyHours]
  );
  
  revalidatePath('/schedules');
}

export async function getLeavePolicies() {
  return query(`SELECT id, name FROM leave_policies WHERE is_active = TRUE ORDER BY name`);
}
