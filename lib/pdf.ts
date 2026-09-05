import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function generatePayslipPDF(payslip: any) {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text('PeoplePay360 - Official Payslip', 14, 22);
  
  doc.setFontSize(11);
  doc.text(`Employee: ${payslip.first_name} ${payslip.last_name}`, 14, 32);
  doc.text(`Department: ${payslip.department}`, 14, 38);
  doc.text(`Period: ${payslip.period_start} to ${payslip.period_end}`, 14, 44);
  doc.text(`Status: ${payslip.status}`, 14, 50);

  autoTable(doc, {
    startY: 60,
    head: [['Category', 'Amount (USD)']],
    body: [
      ['Basic Wage', `$${Number(payslip.basic_wage).toFixed(2)}`],
      ['Gross Salary', `$${Number(payslip.gross_salary).toFixed(2)}`],
      ['Total Deductions', `-$${Number(payslip.deductions).toFixed(2)}`],
      ['Net Salary', `$${Number(payslip.net_salary).toFixed(2)}`]
    ],
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42] },
    foot: [['NET PAY', `$${Number(payslip.net_salary).toFixed(2)}`]],
    footStyles: { fillColor: [15, 23, 42], fontStyle: 'bold' }
  });

  doc.save(`Payslip_${payslip.first_name}_${payslip.last_name}_${payslip.period_start}.pdf`);
}