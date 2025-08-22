import jsPDF from 'jspdf';
import { formatCurrency, formatDate } from './utils-invoice';

export async function generateCustomerStatement(customer: any, invoices: any[]) {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  
  // Professional Header - Compact and Clean
  pdf.setFillColor(250, 250, 250); // Light gray background
  pdf.rect(0, 0, pageWidth, 25, 'F');
  
  // Company Logo/Brand Area
  pdf.setFillColor(29, 78, 216); // Professional blue
  pdf.rect(margin, 8, 8, 8, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(6);
  pdf.text('TB', margin + 2, 13);
  
  // Company Header - Streamlined
  pdf.setTextColor(29, 78, 216);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('THINK MYBIZ ACCOUNTING', margin + 12, 13);
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  pdf.text('CUSTOMER STATEMENT', margin + 12, 20);
  
  // Statement Details - Compact Right Side
  const rightX = pageWidth - 60;
  pdf.setFontSize(8);
  pdf.setTextColor(75, 85, 99);
  pdf.text('Statement Date:', rightX, 10);
  pdf.text('Statement #:', rightX, 16);
  pdf.text('Page:', rightX, 22);
  
  pdf.setTextColor(0, 0, 0);
  pdf.text(formatDate(new Date()), rightX + 35, 10);
  pdf.text(`ST-${Date.now().toString().slice(-6)}`, rightX + 35, 16);
  pdf.text('1 of 1', rightX + 35, 22);
  
  // Horizontal line separator
  pdf.setDrawColor(226, 232, 240);
  pdf.line(margin, 28, pageWidth - margin, 28);
  
  let yPos = 35;
  
  // Customer & Account Information - Side by Side for Efficiency
  pdf.setFillColor(248, 250, 252);
  pdf.rect(margin, yPos, pageWidth - 2 * margin, 35, 'F');
  
  // Customer Info Column (Left)
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(55, 65, 81);
  pdf.text('BILL TO', margin + 5, yPos + 6);
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 0, 0);
  pdf.text(customer.name, margin + 5, yPos + 12);
  
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  if (customer.email) pdf.text(customer.email, margin + 5, yPos + 17);
  if (customer.phone) pdf.text(customer.phone, margin + 5, yPos + 21);
  
  let addressText = '';
  if (customer.address) {
    addressText = customer.address;
    if (customer.city) addressText += `, ${customer.city}`;
    if (customer.postalCode) addressText += ` ${customer.postalCode}`;
    pdf.text(addressText, margin + 5, yPos + 25);
  }
  if (customer.vatNumber) {
    pdf.setTextColor(107, 114, 128);
    pdf.text(`VAT: ${customer.vatNumber}`, margin + 5, yPos + 29);
  }
  
  // Account Details Column (Right)
  const midPoint = pageWidth / 2 + 10;
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(55, 65, 81);
  pdf.text('ACCOUNT DETAILS', midPoint, yPos + 6);
  
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  pdf.text(`Credit Limit: ${formatCurrency(customer.creditLimit || '0')}`, midPoint, yPos + 12);
  pdf.text(`Payment Terms: ${customer.paymentTerms || 30} days`, midPoint, yPos + 16);
  pdf.text(`Category: ${customer.category?.charAt(0).toUpperCase() + customer.category?.slice(1) || 'Standard'}`, midPoint, yPos + 20);
  
  // Calculate invoice summary
  const totalInvoices = invoices.length;
  const totalAmount = invoices.reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);
  const paidAmount = invoices.filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);
  const outstandingAmount = totalAmount - paidAmount;
  
  // Account Summary - Compact Grid Layout
  yPos += 42;
  
  // Summary Header
  pdf.setFillColor(29, 78, 216);
  pdf.rect(margin, yPos, pageWidth - 2 * margin, 6, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('ACCOUNT SUMMARY', margin + 5, yPos + 4);
  
  // Summary Grid - 4 Columns
  yPos += 8;
  pdf.setFillColor(255, 255, 255);
  pdf.rect(margin, yPos, pageWidth - 2 * margin, 16, 'F');
  pdf.setDrawColor(226, 232, 240);
  pdf.rect(margin, yPos, pageWidth - 2 * margin, 16, 'S');
  
  const colWidth = (pageWidth - 2 * margin) / 4;
  
  // Column headers
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(107, 114, 128);
  pdf.text('TOTAL INVOICES', margin + 5, yPos + 5);
  pdf.text('TOTAL AMOUNT', margin + colWidth + 5, yPos + 5);
  pdf.text('PAID AMOUNT', margin + 2 * colWidth + 5, yPos + 5);
  pdf.text('OUTSTANDING', margin + 3 * colWidth + 5, yPos + 5);
  
  // Values
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 0, 0);
  pdf.text(totalInvoices.toString(), margin + 5, yPos + 12);
  pdf.text(formatCurrency(totalAmount), margin + colWidth + 5, yPos + 12);
  
  pdf.setTextColor(34, 197, 94); // Green for paid
  pdf.text(formatCurrency(paidAmount), margin + 2 * colWidth + 5, yPos + 12);
  
  if (outstandingAmount > 0) {
    pdf.setTextColor(239, 68, 68); // Red if outstanding
  } else {
    pdf.setTextColor(34, 197, 94); // Green if zero
  }
  pdf.text(formatCurrency(outstandingAmount), margin + 3 * colWidth + 5, yPos + 12);
  
  // Vertical dividers
  pdf.setDrawColor(226, 232, 240);
  for (let i = 1; i < 4; i++) {
    pdf.line(margin + i * colWidth, yPos, margin + i * colWidth, yPos + 16);
  }
  
  // Invoice Details Section - Compact Table
  yPos += 24;
  
  // Invoice Details Header
  pdf.setFillColor(29, 78, 216);
  pdf.rect(margin, yPos, pageWidth - 2 * margin, 6, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('TRANSACTION HISTORY', margin + 5, yPos + 4);
  
  yPos += 8;
  
  if (invoices.length > 0) {
    // Compact Table Header
    pdf.setFillColor(248, 250, 252);
    pdf.setDrawColor(226, 232, 240);
    pdf.rect(margin, yPos, pageWidth - 2 * margin, 8, 'FD');
    
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text('Invoice #', margin + 3, yPos + 5);
    pdf.text('Date', margin + 40, yPos + 5);
    pdf.text('Due Date', margin + 70, yPos + 5);
    pdf.text('Amount', margin + 105, yPos + 5);
    pdf.text('Status', margin + 135, yPos + 5);
    pdf.text('Balance', pageWidth - 25, yPos + 5, { align: 'right' });
    
    yPos += 10;
    
    // Compact Invoice Rows
    pdf.setFont('helvetica', 'normal');
    const maxRowsPerPage = Math.floor((pageHeight - yPos - 60) / 8); // Calculate max rows that fit
    const displayInvoices = invoices.slice(0, maxRowsPerPage);
    
    displayInvoices.forEach((invoice, index) => {
      // Alternating row colors
      if (index % 2 === 1) {
        pdf.setFillColor(249, 250, 251);
        pdf.rect(margin, yPos - 1, pageWidth - 2 * margin, 8, 'F');
      }
      
      pdf.setFontSize(7);
      pdf.setTextColor(0, 0, 0);
      
      // Invoice details
      pdf.text(invoice.invoiceNumber || `INV-${invoice.id}`, margin + 3, yPos + 3);
      pdf.text(formatDate(invoice.issueDate || invoice.createdAt), margin + 40, yPos + 3);
      pdf.text(formatDate(invoice.dueDate), margin + 70, yPos + 3);
      pdf.text(formatCurrency(invoice.total || 0), margin + 105, yPos + 3);
      
      // Status badge
      const status = (invoice.status || 'draft').toUpperCase();
      if (status === 'PAID') {
        pdf.setTextColor(22, 163, 74); // Green
      } else if (status === 'OVERDUE') {
        pdf.setTextColor(220, 38, 38); // Red
      } else {
        pdf.setTextColor(202, 138, 4); // Yellow/Orange
      }
      pdf.text(status, margin + 135, yPos + 3);
      
      // Balance (for unpaid invoices)
      if (status === 'PAID') {
        pdf.setTextColor(22, 163, 74); // Green
      } else {
        pdf.setTextColor(220, 38, 38); // Red
      }
      const balance = status === 'PAID' ? 0 : (invoice.total || 0);
      pdf.text(formatCurrency(balance), pageWidth - 25, yPos + 3, { align: 'right' });
      
      pdf.setTextColor(0, 0, 0); // Reset color
      yPos += 8;
    });
    
    // Show remaining invoices count if truncated
    if (invoices.length > maxRowsPerPage) {
      pdf.setFontSize(7);
      pdf.setTextColor(107, 114, 128);
      pdf.text(`... and ${invoices.length - maxRowsPerPage} more invoices`, margin + 3, yPos + 3);
      yPos += 8;
    }
  } else {
    // No invoices message
    pdf.setFillColor(255, 255, 255);
    pdf.rect(margin, yPos, pageWidth - 2 * margin, 20, 'F');
    pdf.setDrawColor(226, 232, 240);
    pdf.rect(margin, yPos, pageWidth - 2 * margin, 20, 'S');
    
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'italic');
    pdf.setTextColor(107, 114, 128);
    pdf.text('No invoices found for this customer.', pageWidth / 2, yPos + 12, { align: 'center' });
    pdf.setTextColor(0, 0, 0);
    yPos += 22;
  }
  
  // Payment Summary & Outstanding Balance - Compact Side Panel
  yPos += 8;
  const summaryBoxWidth = 100;
  const summaryBoxX = pageWidth - summaryBoxWidth - margin;
  
  // Outstanding Amount Box
  if (outstandingAmount > 0) {
    pdf.setFillColor(254, 242, 242); // Light red background
    pdf.setDrawColor(239, 68, 68); // Red border
  } else {
    pdf.setFillColor(240, 253, 244); // Light green background
    pdf.setDrawColor(34, 197, 94); // Green border
  }
  pdf.rect(summaryBoxX, yPos, summaryBoxWidth, 18, 'FD');
  
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 0, 0);
  pdf.text('OUTSTANDING BALANCE', summaryBoxX + 5, yPos + 6);
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  if (outstandingAmount > 0) {
    pdf.setTextColor(220, 38, 38); // Red
  } else {
    pdf.setTextColor(22, 163, 74); // Green
  }
  pdf.text(formatCurrency(outstandingAmount), summaryBoxX + 5, yPos + 14);
  
  // Payment Instructions - Compact
  yPos += 25;
  pdf.setFillColor(249, 250, 251);
  pdf.rect(margin, yPos, pageWidth - 2 * margin, 15, 'F');
  pdf.setDrawColor(226, 232, 240);
  pdf.rect(margin, yPos, pageWidth - 2 * margin, 15, 'S');
  
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(55, 65, 81);
  pdf.text('PAYMENT DETAILS:', margin + 5, yPos + 5);
  
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(0, 0, 0);
  pdf.text('Bank: ABSA | Acc: 123456789 | Branch: 632005', margin + 5, yPos + 9);
  pdf.text(`Reference: ${customer.name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10)}`, margin + 5, yPos + 12);
  
  // Professional Footer - Compact
  const footerY = pageHeight - 15;
  
  pdf.setDrawColor(226, 232, 240);
  pdf.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
  
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(107, 114, 128);
  pdf.text('Think MyBiz Accounting | accounts@thinkmybiz.com | +27 66 210 5631', pageWidth / 2, footerY, { align: 'center' });
  
  pdf.setFontSize(6);
  pdf.text('Thank you for your business. For queries, please contact us during business hours.', pageWidth / 2, footerY + 5, { align: 'center' });
  
  return pdf;
}