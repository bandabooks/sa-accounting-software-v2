import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatCurrency, formatDate } from './utils-invoice';

export async function generateCustomerStatement(customer: any, invoices: any[]) {
  
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  // Enhanced Professional Header
  pdf.setFillColor(26, 54, 93);
  pdf.rect(0, 0, pageWidth, 40, 'F');
  
  // Company name
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(22);
  pdf.setFont('helvetica', 'bold');
  pdf.text('THINK MYBIZ ACCOUNTING', pageWidth / 2, 20, { align: 'center' });
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Professional Accounting & Business Solutions', pageWidth / 2, 28, { align: 'center' });
  
  // Statement title and details
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('CUSTOMER STATEMENT', pageWidth - 15, 15, { align: 'right' });
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  const statementNumber = `STMT-${customer.id}-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  pdf.text(`Statement #: ${statementNumber}`, pageWidth - 15, 23, { align: 'right' });
  pdf.text(`Generated: ${formatDate(new Date())}`, pageWidth - 15, 30, { align: 'right' });
  
  // Customer Information Section
  let currentY = 55;
  pdf.setTextColor(45, 55, 72);
  
  // Customer info card
  pdf.setFillColor(247, 250, 252);
  pdf.roundedRect(15, currentY, (pageWidth - 40) / 2, 45, 3, 3, 'F');
  pdf.setDrawColor(226, 232, 240);
  pdf.setLineWidth(0.5);
  pdf.roundedRect(15, currentY, (pageWidth - 40) / 2, 45, 3, 3, 'S');
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(26, 54, 93);
  pdf.text('BILL TO', 20, currentY + 8);
  
  pdf.setTextColor(45, 55, 72);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text(customer.name || 'N/A', 20, currentY + 18);
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  let infoY = currentY + 25;
  
  if (customer.email) {
    pdf.text(`${customer.email}`, 20, infoY);
    infoY += 4;
  }
  if (customer.phone) {
    pdf.text(`${customer.phone}`, 20, infoY);
    infoY += 4;
  }
  if (customer.address) {
    const addressLines = pdf.splitTextToSize(customer.address, 80);
    pdf.text(addressLines, 20, infoY);
    infoY += addressLines.length * 4;
  }
  if (customer.vatNumber) {
    pdf.text(`VAT: ${customer.vatNumber}`, 20, infoY);
  }
  
  // Account summary card
  const summaryX = 15 + (pageWidth - 40) / 2 + 10;
  pdf.setFillColor(247, 250, 252);
  pdf.roundedRect(summaryX, currentY, (pageWidth - 40) / 2, 45, 3, 3, 'F');
  pdf.setDrawColor(226, 232, 240);
  pdf.roundedRect(summaryX, currentY, (pageWidth - 40) / 2, 45, 3, 3, 'S');
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(26, 54, 93);
  pdf.text('ACCOUNT SUMMARY', summaryX + 5, currentY + 8);
  
  currentY += 55;
  
  // Summary metrics
  const totalInvoices = invoices.length;
  const totalAmount = invoices.reduce((sum, inv) => sum + parseFloat(inv.total || '0'), 0);
  const paidAmount = invoices.filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + parseFloat(inv.total || '0'), 0);
  const outstandingAmount = totalAmount - paidAmount;
  const overdueAmount = invoices.filter(inv => inv.status === 'overdue')
    .reduce((sum, inv) => sum + parseFloat(inv.total || '0'), 0);
  
  // Summary cards
  const cardWidth = (pageWidth - 50) / 4;
  const cardHeight = 22;
  const cardSpacing = 5;
  
  const summaryItems = [
    { label: 'Total Invoices', value: totalInvoices.toString(), r: 26, g: 54, b: 93 },
    { label: 'Total Amount', value: formatCurrency(totalAmount), r: 45, g: 55, b: 72 },
    { label: 'Outstanding', value: formatCurrency(outstandingAmount), r: outstandingAmount > 0 ? 214 : 56, g: outstandingAmount > 0 ? 158 : 161, b: outstandingAmount > 0 ? 46 : 105 },
    { label: 'Overdue', value: formatCurrency(overdueAmount), r: overdueAmount > 0 ? 229 : 56, g: overdueAmount > 0 ? 62 : 161, b: overdueAmount > 0 ? 62 : 105 }
  ];
  
  summaryItems.forEach((item, index) => {
    const x = 15 + index * (cardWidth + cardSpacing);
    
    pdf.setFillColor(item.r, item.g, item.b);
    pdf.roundedRect(x, currentY, cardWidth, cardHeight, 2, 2, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'normal');
    pdf.text(item.label, x + cardWidth/2, currentY + 6, { align: 'center' });
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text(item.value, x + cardWidth/2, currentY + 15, { align: 'center' });
  });
  
  currentY += cardHeight + 20;
  
  // Enhanced Invoice Table
  pdf.setTextColor(26, 54, 93);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('TRANSACTION DETAILS', 15, currentY);
  currentY += 15;
  
  // Prepare table data
  const tableData = invoices.map(invoice => [
    invoice.invoiceNumber || 'N/A',
    formatDate(invoice.issueDate),
    formatDate(invoice.dueDate),
    invoice.description || 'Invoice',
    formatCurrency(invoice.total || '0'),
    (invoice.status || 'pending').toUpperCase()
  ]);
  
  // Enhanced AutoTable
  (pdf as any).autoTable({
    startY: currentY,
    head: [['Invoice #', 'Issue Date', 'Due Date', 'Description', 'Amount', 'Status']],
    body: tableData,
    styles: {
      fontSize: 9,
      cellPadding: 3,
      textColor: [45, 55, 72],
      lineColor: [226, 232, 240],
      lineWidth: 0.1
    },
    headStyles: {
      fillColor: [26, 54, 93],
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      alternateRowStyles: {
        fillColor: [247, 250, 252]
      }
    },
    columnStyles: {
      0: { halign: 'left', cellWidth: 25 },
      1: { halign: 'center', cellWidth: 25 },
      2: { halign: 'center', cellWidth: 25 },
      3: { halign: 'left', cellWidth: 60 },
      4: { halign: 'right', cellWidth: 25 },
      5: { halign: 'center', cellWidth: 20 }
    },
    didParseCell: function(data: any) {
      if (data.column.index === 5) {
        const status = data.cell.raw;
        if (status === 'PAID') {
          data.cell.styles.textColor = [56, 161, 105];
          data.cell.styles.fontStyle = 'bold';
        } else if (status === 'OVERDUE') {
          data.cell.styles.textColor = [229, 62, 62];
          data.cell.styles.fontStyle = 'bold';
        } else if (status === 'PENDING') {
          data.cell.styles.textColor = [214, 158, 46];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
    margin: { left: 15, right: 15 }
  });
  
  // Footer
  const footerY = pageHeight - 25;
  pdf.setDrawColor(226, 232, 240);
  pdf.setLineWidth(0.5);
  pdf.line(15, footerY - 5, pageWidth - 15, footerY - 5);
  
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(113, 128, 150);
  
  const paymentTerms = customer.paymentTerms ? `Payment Terms: ${customer.paymentTerms} days` : 'Payment Terms: 30 days';
  pdf.text(paymentTerms, 15, footerY);
  pdf.text('For inquiries, contact us at accounts@thinkmybiz.com', 15, footerY + 5);
  
  const pageNum = (pdf as any).internal.getCurrentPageInfo().pageNumber;
  pdf.text(`Page ${pageNum}`, pageWidth - 15, footerY, { align: 'right' });
  
  pdf.setTextColor(26, 54, 93);
  pdf.setFont('helvetica', 'italic');
  pdf.text('Thank you for your continued business partnership', pageWidth / 2, footerY + 10, { align: 'center' });
    

  
  return pdf;
}