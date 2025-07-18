import jsPDF from 'jspdf';
import { formatCurrency, formatDate } from './utils-invoice';

export async function generateCustomerStatement(customer: any, invoices: any[]) {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  // Company Header
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('THINK MYBIZ ACCOUNTING', pageWidth / 2, 25, { align: 'center' });
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Customer Statement', pageWidth / 2, 35, { align: 'center' });
  
  // Customer Information
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Customer Information', 20, 55);
  
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Name: ${customer.name}`, 20, 70);
  if (customer.email) {
    pdf.text(`Email: ${customer.email}`, 20, 80);
  }
  if (customer.phone) {
    pdf.text(`Phone: ${customer.phone}`, 20, 90);
  }
  if (customer.address) {
    let addressText = customer.address;
    if (customer.city) addressText += `, ${customer.city}`;
    if (customer.postalCode) addressText += ` ${customer.postalCode}`;
    pdf.text(`Address: ${addressText}`, 20, 100);
  }
  if (customer.vatNumber) {
    pdf.text(`VAT Number: ${customer.vatNumber}`, 20, 110);
  }
  
  // Account Details
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Account Details', 20, 130);
  
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Credit Limit: ${formatCurrency(customer.creditLimit || '0')}`, 20, 145);
  pdf.text(`Payment Terms: ${customer.paymentTerms || 30} days`, 20, 155);
  pdf.text(`Category: ${customer.category?.charAt(0).toUpperCase() + customer.category?.slice(1)}`, 20, 165);
  
  // Statement Date
  pdf.text(`Statement Date: ${formatDate(new Date())}`, pageWidth - 20, 70, { align: 'right' });
  
  // Invoice Summary
  const totalInvoices = invoices.length;
  const totalAmount = invoices.reduce((sum, inv) => sum + parseFloat(inv.total), 0);
  const paidAmount = invoices.filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + parseFloat(inv.total), 0);
  const outstandingAmount = totalAmount - paidAmount;
  
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Account Summary', 20, 185);
  
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Total Invoices: ${totalInvoices}`, 20, 200);
  pdf.text(`Total Amount: ${formatCurrency(totalAmount)}`, 20, 210);
  pdf.text(`Paid Amount: ${formatCurrency(paidAmount)}`, 20, 220);
  pdf.text(`Outstanding: ${formatCurrency(outstandingAmount)}`, 20, 230);
  
  // Invoice Details Table
  let yPosition = 250;
  
  // Check if we need a new page
  if (yPosition > pageHeight - 60) {
    pdf.addPage();
    yPosition = 30;
  }
  
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Invoice Details', 20, yPosition);
  yPosition += 15;
  
  // Table headers
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Invoice #', 20, yPosition);
  pdf.text('Date', 70, yPosition);
  pdf.text('Due Date', 120, yPosition);
  pdf.text('Amount', 170, yPosition);
  pdf.text('Status', 200, yPosition);
  
  // Draw header line
  pdf.line(20, yPosition + 2, pageWidth - 20, yPosition + 2);
  yPosition += 10;
  
  // Invoice rows
  pdf.setFont('helvetica', 'normal');
  invoices.forEach((invoice) => {
    // Check if we need a new page
    if (yPosition > pageHeight - 30) {
      pdf.addPage();
      yPosition = 30;
    }
    
    pdf.text(invoice.invoiceNumber, 20, yPosition);
    pdf.text(formatDate(invoice.issueDate), 70, yPosition);
    pdf.text(formatDate(invoice.dueDate), 120, yPosition);
    pdf.text(formatCurrency(invoice.total), 170, yPosition);
    pdf.text(invoice.status.toUpperCase(), 200, yPosition);
    
    yPosition += 12;
  });
  
  // Summary totals at bottom
  yPosition += 10;
  pdf.line(20, yPosition, pageWidth - 20, yPosition);
  yPosition += 15;
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('TOTAL OUTSTANDING:', 120, yPosition);
  pdf.text(formatCurrency(outstandingAmount), 200, yPosition);
  
  // Footer
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Thank you for your business!', pageWidth / 2, pageHeight - 20, { align: 'center' });
  
  return pdf;
}