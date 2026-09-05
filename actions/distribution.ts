'use server';

import { query } from '../lib/db';
import { Resend } from 'resend';
import { revalidatePath } from 'next/cache';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function distributePayslips(payrunId: string) {
  // Fetch all validated/paid payslips with employee emails
  const payslips = await query(`
    SELECT ps.*, e.first_name, e.last_name, e.email, pr.period_start, pr.period_end
    FROM payslips ps
    JOIN employees e ON ps.employee_id = e.id
    JOIN payruns pr ON ps.payrun_id = pr.id
    WHERE ps.payrun_id = ? AND ps.status IN ('Validated', 'Paid')
  `, [payrunId]) as any[];

  if (!payslips.length) throw new Error('No valid payslips found for distribution.');

  // Process bulk email delivery via Resend API
  for (const ps of payslips) {
    if (!ps.email) continue;
    
    await resend.emails.send({
      from: 'Payroll <payroll@peoplepay360.com>',
      to: ps.email,
      subject: `Your Payslip for ${ps.period_start} to ${ps.period_end}`,
      html: `
        <h3>Hello ${ps.first_name},</h3>
        <p>Your payslip for the recent payroll period has been processed.</p>
        <ul>
          <li><strong>Basic Wage:</strong> $${Number(ps.basic_wage).toFixed(2)}</li>
          <li><strong>Net Salary:</strong> $${Number(ps.net_salary).toFixed(2)}</li>
        </ul>
        <p>Please log in to your PeoplePay360 dashboard to download the official PDF.</p>
      `
    });
  }

  return { success: true, count: payslips.length };
}