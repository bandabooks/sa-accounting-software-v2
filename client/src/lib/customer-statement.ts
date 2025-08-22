import jsPDF from 'jspdf';
import { formatCurrency, formatDate } from './utils-invoice';

export async function generateCustomerStatement(customer: any, invoices: any[]) {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  
  // Header Background with Blue Accent
  pdf.setFillColor(37, 99, 235); // Blue-600
  pdf.rect(0, 0, pageWidth, 45, 'F');
  
  // Company Header
  pdf.setTextColor(255, 255, 255); // White text
  pdf.setFontSize(22);
  pdf.setFont('helvetica', 'bold');
  pdf.text('THINK MYBIZ ACCOUNTING', pageWidth / 2, 22, { align: 'center' });
  
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'normal');
  pdf.text('CUSTOMER STATEMENT', pageWidth / 2, 35, { align: 'center' });
  
  // Reset text color to black
  pdf.setTextColor(0, 0, 0);
  
  // Statement Info Box (Top Right)
  const infoBoxX = pageWidth - 85;
  const infoBoxY = 55;
  pdf.setFillColor(248, 250, 252); // Gray-50
  pdf.setDrawColor(226, 232, 240); // Gray-300
  pdf.rect(infoBoxX, infoBoxY, 75, 35, 'FD');
  
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.text('STATEMENT DATE', infoBoxX + 5, infoBoxY + 8);
  pdf.setFont('helvetica', 'normal');
  pdf.text(formatDate(new Date()), infoBoxX + 5, infoBoxY + 16);
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('STATEMENT #', infoBoxX + 5, infoBoxY + 24);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`ST-${Date.now().toString().slice(-6)}`, infoBoxX + 5, infoBoxY + 32);
  
  // Customer Information Section
  let yPos = 65;
  
  // Section Header with Line
  pdf.setFillColor(37, 99, 235);
  pdf.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('CUSTOMER INFORMATION', margin + 5, yPos + 6);
  
  // Reset text color
  pdf.setTextColor(0, 0, 0);
  yPos += 18;
  
  // Customer Details in Two Columns
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Customer Name:', margin, yPos);
  pdf.setFont('helvetica', 'normal');
  pdf.text(customer.name, margin + 35, yPos);
  
  if (customer.email) {
    yPos += 10;
    pdf.setFont('helvetica', 'bold');
    pdf.text('Email Address:', margin, yPos);
    pdf.setFont('helvetica', 'normal');
    pdf.text(customer.email, margin + 35, yPos);
  }
  
  if (customer.phone) {
    yPos += 10;
    pdf.setFont('helvetica', 'bold');
    pdf.text('Phone Number:', margin, yPos);
    pdf.setFont('helvetica', 'normal');
    pdf.text(customer.phone, margin + 35, yPos);
  }
  
  if (customer.address) {
    yPos += 10;
    pdf.setFont('helvetica', 'bold');
    pdf.text('Address:', margin, yPos);
    pdf.setFont('helvetica', 'normal');
    let addressText = customer.address;
    if (customer.city) addressText += `, ${customer.city}`;
    if (customer.postalCode) addressText += ` ${customer.postalCode}`;
    pdf.text(addressText, margin + 35, yPos);
  }
  
  if (customer.vatNumber) {
    yPos += 10;
    pdf.setFont('helvetica', 'bold');
    pdf.text('VAT Number:', margin, yPos);
    pdf.setFont('helvetica', 'normal');
    pdf.text(customer.vatNumber, margin + 35, yPos);
  }
  
  // Account Details Section
  yPos += 25;
  
  // Section Header with Line
  pdf.setFillColor(37, 99, 235);
  pdf.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('ACCOUNT DETAILS', margin + 5, yPos + 6);
  
  // Reset text color
  pdf.setTextColor(0, 0, 0);
  yPos += 18;
  
  // Account Details in structured format
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Credit Limit:', margin, yPos);
  pdf.setFont('helvetica', 'normal');
  pdf.text(formatCurrency(customer.creditLimit || '0'), margin + 35, yPos);
  
  pdf.setFont('helvetica', 'bold');
  pdf.text('Payment Terms:', margin + 100, yPos);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`${customer.paymentTerms || 30} days`, margin + 150, yPos);
  
  yPos += 10;
  pdf.setFont('helvetica', 'bold');
  pdf.text('Category:', margin, yPos);
  pdf.setFont('helvetica', 'normal');
  pdf.text(customer.category?.charAt(0).toUpperCase() + customer.category?.slice(1) || 'Standard', margin + 35, yPos);
  
  // Calculate invoice summary
  const totalInvoices = invoices.length;
  const totalAmount = invoices.reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);
  const paidAmount = invoices.filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);
  const outstandingAmount = totalAmount - paidAmount;
  
  // Account Summary Section
  yPos += 25;
  
  // Section Header with Line
  pdf.setFillColor(37, 99, 235);
  pdf.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('ACCOUNT SUMMARY', margin + 5, yPos + 6);
  
  // Reset text color
  pdf.setTextColor(0, 0, 0);
  yPos += 18;
  
  // Summary in a neat table format
  const summaryData = [
    ['Total Invoices:', totalInvoices.toString()],
    ['Total Amount:', formatCurrency(totalAmount)],
    ['Paid Amount:', formatCurrency(paidAmount)],
    ['Outstanding:', formatCurrency(outstandingAmount)]
  ];
  
  summaryData.forEach(([label, value]) => {
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text(label, margin, yPos);
    pdf.setFont('helvetica', 'normal');
    pdf.text(value, margin + 70, yPos);
    yPos += 12;
  });
  
  // Invoice Details Section
  yPos += 15;
  
  // Check if we need a new page
  if (yPos > pageHeight - 100) {
    pdf.addPage();
    yPos = 30;
  }
  
  // Section Header with Line
  pdf.setFillColor(37, 99, 235);
  pdf.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('INVOICE DETAILS', margin + 5, yPos + 6);
  
  // Reset text color
  pdf.setTextColor(0, 0, 0);
  yPos += 18;
  
  if (invoices.length > 0) {
    // Table headers with background
    pdf.setFillColor(248, 250, 252); // Gray-50
    pdf.setDrawColor(226, 232, 240); // Gray-300
    pdf.rect(margin, yPos, pageWidth - 2 * margin, 12, 'FD');
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Invoice #', margin + 5, yPos + 8);
    pdf.text('Date', margin + 50, yPos + 8);
    pdf.text('Due Date', margin + 90, yPos + 8);
    pdf.text('Amount', margin + 130, yPos + 8, { align: 'right' });
    pdf.text('Status', margin + 150, yPos + 8);
    
    yPos += 12;
    
    // Invoice rows with alternating colors
    pdf.setFont('helvetica', 'normal');
    invoices.forEach((invoice, index) => {
      // Check if we need a new page
      if (yPos > pageHeight - 40) {
        pdf.addPage();
        yPos = 30;
      }
      
      // Alternating row colors
      if (index % 2 === 0) {
        pdf.setFillColor(255, 255, 255); // White
      } else {
        pdf.setFillColor(249, 250, 251); // Gray-50
      }
      pdf.rect(margin, yPos, pageWidth - 2 * margin, 10, 'F');
      
      // Row content
      pdf.setFontSize(9);
      pdf.text(invoice.invoiceNumber || `INV-${invoice.id}`, margin + 5, yPos + 7);
      pdf.text(formatDate(invoice.issueDate || invoice.createdAt), margin + 50, yPos + 7);
      pdf.text(formatDate(invoice.dueDate), margin + 90, yPos + 7);
      pdf.text(formatCurrency(invoice.total || 0), margin + 130, yPos + 7, { align: 'right' });
      
      // Status with color coding
      const status = (invoice.status || 'draft').toUpperCase();
      if (status === 'PAID') {
        pdf.setTextColor(34, 197, 94); // Green
      } else if (status === 'OVERDUE') {
        pdf.setTextColor(239, 68, 68); // Red
      } else {
        pdf.setTextColor(251, 146, 60); // Orange
      }
      pdf.text(status, margin + 150, yPos + 7);
      pdf.setTextColor(0, 0, 0); // Reset to black
      
      yPos += 10;
    });
  } else {
    // No invoices message
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'italic');
    pdf.setTextColor(107, 114, 128); // Gray-500
    pdf.text('No invoices found for this customer.', margin + 5, yPos + 10);
    pdf.setTextColor(0, 0, 0);
    yPos += 20;
  }
  
  // Outstanding Amount Highlight Box
  yPos += 15;
  pdf.setFillColor(254, 242, 242); // Red-50
  pdf.setDrawColor(252, 165, 165); // Red-300
  pdf.rect(margin + 80, yPos, 100, 20, 'FD');
  
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text('TOTAL OUTSTANDING:', margin + 85, yPos + 8);
  pdf.setFontSize(14);
  pdf.setTextColor(220, 38, 38); // Red-600
  pdf.text(formatCurrency(outstandingAmount), margin + 85, yPos + 16);
  pdf.setTextColor(0, 0, 0);
  
  // Professional Footer
  const footerY = pageHeight - 30;
  
  // Footer line
  pdf.setDrawColor(226, 232, 240);
  pdf.line(margin, footerY - 10, pageWidth - margin, footerY - 10);
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(107, 114, 128);
  pdf.text('Thank you for your business! For any queries, please contact us.', pageWidth / 2, footerY, { align: 'center' });
  
  // Company details in footer
  pdf.setFontSize(8);
  pdf.text('Think MyBiz Accounting | accounts@thinkmybiz.com | +27 66 210 5631', pageWidth / 2, footerY + 8, { align: 'center' });
  
  return pdf;
}