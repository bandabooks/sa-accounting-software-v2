import jsPDF from 'jspdf';
import { formatCurrency, formatDate } from './utils-invoice';

export async function generateCustomerStatement(customer: any, invoices: any[]) {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  
  // Company Header - Simple and Clean
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text('THINK MYBIZ ACCOUNTING', pageWidth / 2, 20, { align: 'center' });
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Customer Statement', pageWidth / 2, 30, { align: 'center' });
  
  // Statement Date - Top Right
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Statement Date:', pageWidth - 70, 20);
  pdf.setFont('helvetica', 'normal');
  pdf.text(formatDate(new Date()), pageWidth - 20, 20, { align: 'right' });
  
  let yPos = 50;
  
  // Customer Information Section Header
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Customer Information', margin, yPos);
  
  // Simple underline
  pdf.line(margin, yPos + 2, margin + 50, yPos + 2);
  yPos += 15;
  
  // Customer Details - Compact Layout
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Name: ${customer.name}`, margin, yPos);
  pdf.text(`Statement Date: ${formatDate(new Date())}`, pageWidth - 80, yPos);
  
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
  
  if (customer.vatNumber) {
    yPos += 10;
    pdf.text(`VAT Number: ${customer.vatNumber}`, margin, yPos);
  }
  
  // Account Details Section
  yPos += 20;
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Account Details', margin, yPos);
  pdf.line(margin, yPos + 2, margin + 40, yPos + 2);
  yPos += 15;
  
  // Account Details in Two Columns
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Credit Limit: ${formatCurrency(customer.creditLimit || '0')}`, margin, yPos);
  pdf.text(`Payment Terms: ${customer.paymentTerms || 30} days`, margin + 100, yPos);
  
  yPos += 10;
  pdf.text(`Category: ${customer.category?.charAt(0).toUpperCase() + customer.category?.slice(1) || 'Standard'}`, margin, yPos);
  
  // Calculate invoice summary
  const totalInvoices = invoices.length;
  const totalAmount = invoices.reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);
  const paidAmount = invoices.filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);
  const outstandingAmount = totalAmount - paidAmount;
  
  // Account Summary Section
  yPos += 20;
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Account Summary', margin, yPos);
  pdf.line(margin, yPos + 2, margin + 40, yPos + 2);
  yPos += 15;
  
  // Summary in Two Columns
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Total Invoices: ${totalInvoices}`, margin, yPos);
  pdf.text(`Total Amount: ${formatCurrency(totalAmount)}`, margin + 100, yPos);
  
  yPos += 10;
  pdf.text(`Paid Amount: ${formatCurrency(paidAmount)}`, margin, yPos);
  pdf.text(`Outstanding: ${formatCurrency(outstandingAmount)}`, margin + 100, yPos);
  
  // Invoice Details Section
  yPos += 20;
  
  // Check if we need a new page
  if (yPos > pageHeight - 80) {
    pdf.addPage();
    yPos = 30;
  }
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Invoice Details', margin, yPos);
  pdf.line(margin, yPos + 2, margin + 35, yPos + 2);
  yPos += 15;
  
  // Table headers - Simple and clean
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Invoice #', margin, yPos);
  pdf.text('Date', margin + 45, yPos);
  pdf.text('Due Date', margin + 80, yPos);
  pdf.text('Amount', margin + 115, yPos);
  pdf.text('Status', margin + 150, yPos);
  
  // Header underline
  pdf.line(margin, yPos + 2, pageWidth - margin, yPos + 2);
  yPos += 10;
  
  if (invoices.length > 0) {
    // Invoice rows - Clean table format
    pdf.setFont('helvetica', 'normal');
    invoices.forEach((invoice) => {
      // Check if we need a new page
      if (yPos > pageHeight - 30) {
        pdf.addPage();
        yPos = 30;
      }
      
      pdf.setFontSize(9);
      pdf.text(invoice.invoiceNumber || `INV-${invoice.id}`, margin, yPos);
      pdf.text(formatDate(invoice.issueDate || invoice.createdAt), margin + 45, yPos);
      pdf.text(formatDate(invoice.dueDate), margin + 80, yPos);
      pdf.text(formatCurrency(invoice.total || 0), margin + 115, yPos);
      pdf.text((invoice.status || 'draft').toUpperCase(), margin + 150, yPos);
      
      yPos += 10;
    });
    
    // Total line
    yPos += 5;
    pdf.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;
    
  } else {
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'italic');
    pdf.text('No invoices found for this customer.', margin, yPos);
    yPos += 15;
  }
  
  // Total Outstanding - Right aligned
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text('TOTAL OUTSTANDING:', pageWidth - 80, yPos);
  pdf.text(formatCurrency(outstandingAmount), pageWidth - 20, yPos, { align: 'right' });
  
  // Simple Footer
  const footerY = pageHeight - 20;
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Thank you for your business!', pageWidth / 2, footerY, { align: 'center' });
  
  return pdf;
}