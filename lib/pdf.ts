import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

function buildPayslipDoc(payslip: any) {
  const doc = new jsPDF()

  // Header bar
  doc.setFillColor(15, 23, 42)
  doc.rect(0, 0, 210, 40, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('PeoplePay360', 14, 18)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(148, 163, 184)
  doc.text('Official Payslip', 14, 27)
  doc.text(`Period: ${payslip.period_start} to ${payslip.period_end}`, 14, 34)

  // Status badge
  const statusColor: [number, number, number] = payslip.status === 'Paid' ? [16, 185, 129] : [99, 102, 241]
  doc.setFillColor(...statusColor)
  doc.roundedRect(155, 12, 42, 16, 3, 3, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text(String(payslip.status || 'DRAFT').toUpperCase(), 176, 22.5, { align: 'center' })

  // Employee info
  doc.setTextColor(15, 23, 42)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(`${payslip.first_name} ${payslip.last_name}`, 14, 56)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 116, 139)
  doc.text(`Department: ${payslip.department || 'N/A'}`, 14, 64)
  doc.text(`Position: ${payslip.job_position || 'N/A'}`, 14, 71)
  if (payslip.bank_account_no) {
    doc.text(`Bank Account: ${payslip.bank_account_no}`, 14, 78)
  }

  // Earnings / Deductions table
  autoTable(doc, {
    startY: 90,
    head: [['Component', 'Category', 'Amount']],
    body: [
      ['Basic Salary', 'BASIC', `$${Number(payslip.basic_wage).toFixed(2)}`],
      ['Total Allowances', 'ALLOWANCE', `+$${(Number(payslip.gross_salary) - Number(payslip.basic_wage)).toFixed(2)}`],
      ['Gross Salary', 'GROSS', `$${Number(payslip.gross_salary).toFixed(2)}`],
      ['Total Deductions', 'DEDUCTION', `-$${Number(payslip.deductions).toFixed(2)}`],
    ],
    foot: [['NET PAY', '', `$${Number(payslip.net_salary).toFixed(2)}`]],
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
    footStyles: { fillColor: [99, 102, 241], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 11 },
    columnStyles: { 2: { halign: 'right', fontStyle: 'bold' } },
    styles: { fontSize: 10 },
  })

  const finalY = (doc as any).lastAutoTable.finalY + 15
  doc.setFontSize(8)
  doc.setTextColor(148, 163, 184)
  doc.text('This is a computer-generated document. No signature required.', 14, finalY)
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, finalY + 6)

  return doc
}

export function generatePayslipPDF(payslip: any) {
  const doc = buildPayslipDoc(payslip)
  doc.save(`Payslip_${payslip.first_name}_${payslip.last_name}_${payslip.period_start}.pdf`)
}

export function printPayslipPDF(payslip: any) {
  const doc = buildPayslipDoc(payslip)
  doc.autoPrint()
  const blobUrl = doc.output('bloburl')
  window.open(blobUrl, '_blank')
}

export function generateAttendancePDF(records: any[], title = 'Attendance Report') {
  const doc = new jsPDF({ orientation: 'landscape' })

  // Header
  doc.setFillColor(15, 23, 42)
  doc.rect(0, 0, 297, 36, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('PeoplePay360', 14, 16)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(148, 163, 184)
  doc.text(title, 14, 26)
  doc.text(`Exported: ${new Date().toLocaleString()}`, 200, 26)

  autoTable(doc, {
    startY: 46,
    head: [['Employee', 'Check In', 'Check Out', 'Worked Hours', 'Status', 'Schedule']],
    body: records.map(r => [
      `${r.first_name} ${r.last_name}`,
      r.check_in ? new Date(r.check_in).toLocaleString() : '-',
      r.check_out ? new Date(r.check_out).toLocaleString() : 'Missing',
      `${Number(r.worked_hours).toFixed(2)}h`,
      r.status,
      r.schedule_name || '-',
    ]),
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    styles: { fontSize: 9 },
    columnStyles: { 3: { halign: 'center' }, 4: { halign: 'center' } },
  })

  const filename = `Attendance_${title.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`
  doc.save(filename)
}