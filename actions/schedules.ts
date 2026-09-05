'use server';

import { query } from '../lib/db';
import { v4 as uuidv4 } from 'uuid';
import { revalidatePath } from 'next/cache';

export async function getSchedules() {
  return await query(`
    SELECT ws.*, 
    (SELECT COUNT(*) FROM employees WHERE schedule_id = ws.id) as assigned_employees
    FROM working_schedules ws
    ORDER BY ws.created_at DESC
  `);
}

export async function createSchedule(data: { name: string, days: number, hoursPerDay: number }) {
  const id = uuidv4();
  // Automatically calculates weekly hours based on pattern (Days * Hours)
  const weeklyHours = data.days * data.hoursPerDay; 
  
  await query(
    `INSERT INTO working_schedules (id, name, weekly_hours) VALUES (?, ?, ?)`,
    [id, data.name, weeklyHours]
  );
  
  revalidatePath('/schedules');
}