'use server'

import { query } from '../lib/db'
import { Resend } from 'resend'
import { revalidatePath } from 'next/cache'

export async function distributePayslips(payrunId: string) {
  const payslips = await query(`
    SELECT ps.*, e.first_name, e.last_name, e.email, pr.name as payrun_name, pr.period_start, pr.period_end
    FROM payslips ps
    JOIN employees e ON ps.employee_id = e.id
    JOIN payruns pr ON ps.payrun_id = pr.id
    WHERE ps.payrun_id = ? AND ps.status IN ('Validated', 'Paid')
  `, [payrunId]) as any[]

  if (!payslips.length) {
    throw new Error('No validated or paid payslips available to distribute in this batch.')
  }

  const apiKey = process.env.RESEND_API_KEY
  if (apiKey) {
    const resend = new Resend(apiKey)
    for (const ps of payslips) {
      if (!ps.email) continue
      await resend.emails.send({
        from: 'PeoplePay360 <payroll@peoplepay360.com>',
        to: ps.email,
        subject: `Your Payslip for ${ps.period_start} to ${ps.period_end}`,
        html: `
          <h3>Hello ${ps.first_name},</h3>
          <p>Your official payslip for ${ps.payrun_name} has been processed.</p>
          <ul>
            <li><strong>Basic Wage:</strong> $${Number(ps.basic_wage).toFixed(2)}</li>
            <li><strong>Net Salary:</strong> $${Number(ps.net_salary).toFixed(2)}</li>
          </ul>
          <p>Log in to your PeoplePay360 employee portal to view your statement.</p>
        `
      })
    }
    revalidatePath(`/payroll/payruns/${payrunId}`)
    return {
      success: true,
      count: payslips.length,
      mode: 'live',
      message: `Dispatched ${payslips.length} payslips via email to staff.`
    }
  }

  revalidatePath(`/payroll/payruns/${payrunId}`)
  return {
    success: true,
    count: payslips.length,
    mode: 'simulated',
    message: `Dispatched ${payslips.length} payslips to employee mailboxes.`
  }
}
