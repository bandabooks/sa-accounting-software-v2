import jsPDF from 'jspdf';
import { formatCurrency, formatDate } from './utils-invoice';

export async function generateCustomerStatement(customer: any, invoices: any[]) {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  
  // Company Header
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('THINK MYBIZ ACCOUNTING', pageWidth / 2, 25, { align: 'center' });
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Customer Statement', pageWidth / 2, 35, { align: 'center' });
  
  // Statement Date - Top Right
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Statement Date: ${formatDate(new Date())}`, pageWidth - 20, 25, { align: 'right' });
  
  let yPos = 55;
  
  // Customer Information
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Customer Information', margin, yPos);
  yPos += 15;
  
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Name: ${customer.name}`, margin, yPos);
  pdf.text(`Statement Date: ${formatDate(new Date())}`, pageWidth - 20, yPos, { align: 'right' });
  
  if (customer.email) {
    yPos += 10;
    pdf.text(`Email: ${customer.email}`, margin, yPos);
  }
  
  if (customer.phone) {
    yPos += 10;
    pdf.text(`Phone: ${customer.phone}`, margin, yPos);
  }
  
  if (customer.address) {
    yPos += 10;
    let addressText = customer.address;
    if (customer.city) addressText += `, ${customer.city}`;
    if (customer.postalCode) addressText += ` ${customer.postalCode}`;
    pdf.text(`Address: ${addressText}`, margin, yPos);
  }
  
  // Account Details
  yPos += 25;
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Account Details', margin, yPos);
  yPos += 15;
  
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Credit Limit: ${formatCurrency(customer.creditLimit || '0')}`, margin, yPos);
  pdf.text(`Payment Terms: ${customer.paymentTerms || 30} days`, margin + 120, yPos);
  
  yPos += 10;
  pdf.text(`Category: ${customer.category?.charAt(0).toUpperCase() + customer.category?.slice(1) || 'Standard'}`, margin, yPos);
  
  // Account Summary
  yPos += 25;
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Account Summary', margin, yPos);
  yPos += 15;
  
  // Calculate invoice summary
  const totalInvoices = invoices.length;
  const totalAmount = invoices.reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);
  const paidAmount = invoices.filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);
  const outstandingAmount = totalAmount - paidAmount;
  
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Total Invoices: ${totalInvoices}`, margin, yPos);
  pdf.text(`Total Amount: ${formatCurrency(totalAmount)}`, margin + 120, yPos);
  
  yPos += 10;
  pdf.text(`Paid Amount: ${formatCurrency(paidAmount)}`, margin, yPos);
  pdf.text(`Outstanding: ${formatCurrency(outstandingAmount)}`, margin + 120, yPos);
  
  // Invoice Details
  yPos += 25;
  
  // Check if we need a new page
  if (yPos > pageHeight - 60) {
    pdf.addPage();
    yPos = 30;
  }
  
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Invoice Details', margin, yPos);
  yPos += 15;
  
  // Table headers
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Invoice #', margin, yPos);
  pdf.text('Date', margin + 50, yPos);
  pdf.text('Due Date', margin + 100, yPos);
  pdf.text('Amount', margin + 150, yPos);
  pdf.text('Status', pageWidth - 40, yPos);
  
  // Draw header line
  pdf.line(margin, yPos + 2, pageWidth - margin, yPos + 2);
  yPos += 10;
  
  // Invoice rows
  pdf.setFont('helvetica', 'normal');
  if (invoices.length > 0) {
    invoices.forEach((invoice) => {
      // Check if we need a new page
      if (yPos > pageHeight - 30) {
        pdf.addPage();
        yPos = 30;
      }
      
      pdf.text(invoice.invoiceNumber || `INV-${invoice.id}`, margin, yPos);
      pdf.text(formatDate(invoice.issueDate || invoice.createdAt), margin + 50, yPos);
      pdf.text(formatDate(invoice.dueDate), margin + 100, yPos);
      pdf.text(formatCurrency(invoice.total || 0), margin + 150, yPos);
      pdf.text((invoice.status || 'draft').toUpperCase(), pageWidth - 40, yPos);
      
      yPos += 12;
    });
  } else {
    yPos += 10;
    pdf.setFont('helvetica', 'italic');
    pdf.text('No invoices found for this customer.', margin, yPos);
  }
  
  // Summary totals at bottom
  yPos += 10;
  pdf.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 15;
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('TOTAL OUTSTANDING:', pageWidth - 80, yPos);
  pdf.text(formatCurrency(outstandingAmount), pageWidth - 20, yPos, { align: 'right' });
  
  // Footer
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Thank you for your business!', pageWidth / 2, pageHeight - 20, { align: 'center' });
  
  return pdf;
}