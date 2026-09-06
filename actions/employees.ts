'use server'

import { query, transaction } from '../lib/db'
import { revalidatePath } from 'next/cache'

export async function syncEmployeeLeaveStatuses() {
  // Set Active employees to On Leave if they have an active approved leave request today
  await query(`
    UPDATE employees e
    SET status = 'On Leave'
    WHERE status = 'Active'
      AND EXISTS (
        SELECT 1 FROM leave_requests r
        WHERE r.employee_id = e.id
          AND r.status = 'Approved'
          AND CURDATE() BETWEEN r.start_date AND r.end_date
      )
  `)

  // Return employees to Active if their approved leave has ended
  await query(`
    UPDATE employees e
    SET status = 'Active'
    WHERE status = 'On Leave'
      AND NOT EXISTS (
        SELECT 1 FROM leave_requests r
        WHERE r.employee_id = e.id
          AND r.status = 'Approved'
          AND CURDATE() BETWEEN r.start_date AND r.end_date
      )
  `)
}

export async function getEmployees() {
  await syncEmployeeLeaveStatuses()
  return await query(`SELECT * FROM employees ORDER BY created_at DESC`)
}

export async function getEmployeeHubData(id: string | number) {
  await syncEmployeeLeaveStatuses()

  const [employee] = await query(
    `SELECT e.*, ws.name AS schedule_name, ws.weekly_hours, CONCAT(m.first_name, ' ', m.last_name) AS manager_name
     FROM employees e
     LEFT JOIN working_schedules ws ON ws.id=e.schedule_id
     LEFT JOIN employees m ON m.id=e.manager_id
     WHERE e.id = ?`,
    [id]
  ) as any[]

  const [stats] = await query(`
    SELECT 
      (SELECT COUNT(*) FROM contracts WHERE employee_id = ?) as contractCount,
      (SELECT COUNT(*) FROM attendance WHERE employee_id = ?) as attendanceCount,
      (SELECT COUNT(*) FROM leave_allocations WHERE employee_id = ?) as leaveCount
  `, [id, id, id]) as any[]

  const [pay] = await query(
    `SELECT wage, wage_period FROM contracts WHERE employee_id=? AND status='Active' ORDER BY start_date DESC LIMIT 1`,
    [id]
  ) as any[]

  // Ensure default approved allocations for the 3 fixed leave types exist for this employee
  const [existingAlloc]: any = await query(
    `SELECT COUNT(*) as count FROM leave_allocations WHERE employee_id = ?`,
    [id]
  )
  if (!existingAlloc || Number(existingAlloc.count) === 0) {
    const fixedTypes = await query(
      `SELECT id, code FROM leave_types WHERE code IN ('PAID', 'SICK', 'HOLIDAY')`
    ) as any[]
    for (const t of fixedTypes) {
      const days = t.code === 'PAID' ? 18 : t.code === 'SICK' ? 12 : 10
      await query(
        `INSERT INTO leave_allocations (employee_id, leave_type_id, total_days, taken_days, valid_from, valid_to, status)
         VALUES (?, ?, ?, 0, CONCAT(YEAR(CURDATE()), '-01-01'), CONCAT(YEAR(CURDATE()), '-12-31'), 'Approved')`,
        [id, t.id, days]
      )
    }
  }

  const balances = await query(
    `SELECT t.name, t.code, t.payroll_treatment, COALESCE(SUM(a.remaining_days), 0) AS remaining
     FROM leave_types t
     LEFT JOIN leave_allocations a ON a.leave_type_id = t.id AND a.employee_id = ? AND a.status = 'Approved'
     GROUP BY t.id, t.name, t.code, t.payroll_treatment
     ORDER BY t.name`,
    [id]
  )

  // Fetch all user-specific data for this particular employee
  const contracts = await query(
    `SELECT c.*, s.name as structure_name
     FROM contracts c
     LEFT JOIN salary_structures s ON s.id = c.salary_structure_id
     WHERE c.employee_id = ?
     ORDER BY c.status = 'Active' DESC, c.start_date DESC`,
    [id]
  ) as any[]

  const attendance = await query(
    `SELECT a.*, ws.name as schedule_name
     FROM attendance a
     LEFT JOIN employees e ON e.id = a.employee_id
     LEFT JOIN working_schedules ws ON ws.id = e.schedule_id
     WHERE a.employee_id = ?
     ORDER BY a.check_in DESC
     LIMIT 15`,
    [id]
  ) as any[]

  const leaveRequests = await query(
    `SELECT r.*, t.name as type_name
     FROM leave_requests r
     JOIN leave_types t ON t.id = r.leave_type_id
     WHERE r.employee_id = ?
     ORDER BY r.start_date DESC
     LIMIT 15`,
    [id]
  ) as any[]

  const allocations = await query(
    `SELECT a.*, t.name as type_name
     FROM leave_allocations a
     JOIN leave_types t ON t.id = a.leave_type_id
     WHERE a.employee_id = ?
     ORDER BY a.valid_from DESC`,
    [id]
  ) as any[]

  return { employee, stats, pay, balances, contracts, attendance, leaveRequests, allocations }
}

export async function createEmployee(data: any) {
  const result: any = await transaction(async (conn) => {
    const [empResult]: any = await conn.execute(
      `INSERT INTO employees (first_name, last_name, email, password, system_role, department, job_position, employment_type, status, schedule_id, manager_id, alloted_leves)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 40.00)`,
      [
        data.first_name, data.last_name, data.email, data.password || 'demo123', data.system_role, 
        data.department, data.job_position, data.employment_type, data.status, 
        data.schedule_id || null, data.manager_id || null
      ]
    )
    const newId = empResult.insertId

    // Automatically allocate the 3 fixed leave types (PAID: 18, SICK: 12, HOLIDAY: 10)
    const [fixedTypes] = await conn.execute(
      `SELECT id, code FROM leave_types WHERE code IN ('PAID', 'SICK', 'HOLIDAY')`
    ) as any[]

    for (const t of fixedTypes) {
      const days = t.code === 'PAID' ? 18 : t.code === 'SICK' ? 12 : 10
      await conn.execute(
        `INSERT INTO leave_allocations (employee_id, leave_type_id, total_days, taken_days, valid_from, valid_to, status)
         VALUES (?, ?, ?, 0, CONCAT(YEAR(CURDATE()), '-01-01'), CONCAT(YEAR(CURDATE()), '-12-31'), 'Approved')`,
        [newId, t.id, days]
      )
    }

    return newId
  })

  revalidatePath('/employees')
  return result
}

export async function updateEmployee(id: string | number, data: any) {
  await query(
    `UPDATE employees SET first_name=?,last_name=?,email=?,system_role=?,department=?,job_position=?,employment_type=?,status=?,schedule_id=?,manager_id=?,bank_name=?,bank_account_no=? WHERE id=?`,
    [data.first_name,data.last_name,data.email,data.system_role,data.department,data.job_position,data.employment_type,data.status,data.schedule_id||null,data.manager_id||null,data.bank_name||null,data.bank_account_no||null,id]
  )
  revalidatePath('/employees')
  revalidatePath(`/employees/${id}`)
}

export async function createEmployeesBulk(records: Array<Record<string, string>>) {
  if (!Array.isArray(records) || records.length === 0 || records.length > 100) {
    throw new Error('Upload 1 to 100 employees at a time.')
  }
  const allowedRoles = new Set(['Employee', 'HR Manager', 'HR Payroll User', 'HR Payroll Manager', 'Admin'])
  const emails = new Set<string>()
  for (const record of records) {
    const email = String(record.email || '').trim().toLowerCase()
    if (!record.first_name?.trim() || !record.last_name?.trim() || !email.includes('@') || !record.department?.trim() || !record.job_position?.trim()) {
      throw new Error('Every row needs first_name last_name email department and job_position.')
    }
    if (emails.has(email)) throw new Error(`Duplicate email in upload ${email}`)
    emails.add(email)
    if (record.system_role && !allowedRoles.has(record.system_role)) {
      throw new Error(`Invalid role for ${email}`)
    }
  }
  const created = await transaction(async (conn) => {
    let count = 0
    const [fixedTypes] = await conn.execute(
      `SELECT id, code FROM leave_types WHERE code IN ('PAID', 'SICK', 'HOLIDAY')`
    ) as any[]

    for (const record of records) {
      const [result]: any = await conn.execute(
        `INSERT INTO employees (first_name,last_name,email,password,system_role,department,job_position,employment_type,status,schedule_id,alloted_leves)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Active', ?, 40.00)`,
        [
          record.first_name.trim(), record.last_name.trim(), record.email.trim().toLowerCase(),
          record.password?.trim() || 'demo123', record.system_role || 'Employee',
          record.department.trim(), record.job_position.trim(), record.employment_type || 'Full-Time',
          record.schedule_id ? Number(record.schedule_id) : null
        ]
      )
      if (result.affectedRows) {
        count++
        const empId = result.insertId
        for (const t of fixedTypes) {
          const days = t.code === 'PAID' ? 18 : t.code === 'SICK' ? 12 : 10
          await conn.execute(
            `INSERT INTO leave_allocations (employee_id, leave_type_id, total_days, taken_days, valid_from, valid_to, status)
             VALUES (?, ?, ?, 0, CONCAT(YEAR(CURDATE()), '-01-01'), CONCAT(YEAR(CURDATE()), '-12-31'), 'Approved')`,
            [empId, t.id, days]
          )
        }
      }
    }
    return count
  })
  revalidatePath('/employees')
  return created
}
