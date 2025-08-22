import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatCurrency, formatDate } from './utils-invoice';

interface StatementData {
  customer: any;
  company?: any;
  invoices: any[];
  periodStart?: string;
  periodEnd?: string;
  includePayments?: boolean;
  includePendingInvoices?: boolean;
}

export async function generateCustomerStatement(statementData: StatementData) {
  const { customer, company, invoices, periodStart, periodEnd } = statementData;
  
  const pdf = new jsPDF('portrait', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  // Helper functions for consistent spacing and styling
  const addHeader = () => {
    // Company branding header with modern design
    pdf.setFillColor(26, 54, 93); // Deep blue
    pdf.rect(0, 0, pageWidth, 45, 'F');
    
    // Company logo area (placeholder for future logo implementation)
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(15, 8, 12, 12, 2, 2, 'F');
    
    // Company name and details
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text(company?.displayName || 'THINK MYBIZ ACCOUNTING', 32, 18);
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Professional Accounting & Business Solutions', 32, 25);
    
    // Contact information in header
    if (company?.email || company?.phone) {
      pdf.setFontSize(9);
      let contactInfo = '';
      if (company?.email) contactInfo += `Email: ${company.email}`;
      if (company?.phone) contactInfo += (contactInfo ? ' | ' : '') + `Phone: ${company.phone}`;
      pdf.text(contactInfo, 32, 32);
    }
    
    // Statement title and number
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('CUSTOMER STATEMENT', pageWidth - 15, 18, { align: 'right' });
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const statementNumber = `STMT-${customer.id}-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    pdf.text(`Statement #: ${statementNumber}`, pageWidth - 15, 26, { align: 'right' });
    pdf.text(`Generated: ${formatDate(new Date())}`, pageWidth - 15, 33, { align: 'right' });
  };
  
  const addCustomerInfoSection = (startY: number) => {
    pdf.setTextColor(45, 55, 72); // Dark gray
    
    // Customer information card with modern styling
    pdf.setFillColor(247, 250, 252); // Light gray
    pdf.roundedRect(15, startY, (pageWidth - 40) / 2, 45, 3, 3, 'F');
    
    pdf.setDrawColor(226, 232, 240); // Border gray
    pdf.setLineWidth(0.5);
    pdf.roundedRect(15, startY, (pageWidth - 40) / 2, 45, 3, 3, 'S');
    
    // Customer info header
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(26, 54, 93); // Deep blue
    pdf.text('BILL TO', 20, startY + 8);
    
    pdf.setTextColor(45, 55, 72); // Dark gray
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text(customer.name || 'N/A', 20, startY + 16);
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    let currentY = startY + 22;
    
    if (customer.email) {
      pdf.text(`${customer.email}`, 20, currentY);
      currentY += 4;
    }
    
    if (customer.phone) {
      pdf.text(`${customer.phone}`, 20, currentY);
      currentY += 4;
    }
    
    if (customer.address) {
      const maxWidth = 80;
      const addressLines = pdf.splitTextToSize(customer.address, maxWidth);
      pdf.text(addressLines, 20, currentY);
      currentY += addressLines.length * 4;
    }
    
    if (customer.vatNumber) {
      pdf.text(`VAT: ${customer.vatNumber}`, 20, currentY);
    }
    
    // Account summary card
    const summaryX = 15 + (pageWidth - 40) / 2 + 10;
    pdf.setFillColor(247, 250, 252); // Light gray
    pdf.roundedRect(summaryX, startY, (pageWidth - 40) / 2, 45, 3, 3, 'F');
    
    pdf.setDrawColor(226, 232, 240); // Border gray
    pdf.roundedRect(summaryX, startY, (pageWidth - 40) / 2, 45, 3, 3, 'S');
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(26, 54, 93); // Deep blue
    pdf.text('ACCOUNT SUMMARY', summaryX + 5, startY + 8);
    
    return startY + 50;
  };
  
  const addAccountSummaryDetails = (startY: number) => {
    const totalInvoices = invoices.length;
    const totalAmount = invoices.reduce((sum, inv) => sum + parseFloat(inv.total || '0'), 0);
    const paidAmount = invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + parseFloat(inv.total || '0'), 0);
    const outstandingAmount = totalAmount - paidAmount;
    const overdueAmount = invoices
      .filter(inv => inv.status === 'overdue')
      .reduce((sum, inv) => sum + parseFloat(inv.total || '0'), 0);
    
    // Summary metrics with modern card design
    const cardWidth = (pageWidth - 50) / 4;
    const cardHeight = 25;
    const cardSpacing = 5;
    
    const summaryItems = [
      { label: 'Total Invoices', value: totalInvoices.toString(), r: 26, g: 54, b: 93 },
      { label: 'Total Amount', value: formatCurrency(totalAmount), r: 45, g: 55, b: 72 },
      { label: 'Outstanding', value: formatCurrency(outstandingAmount), r: outstandingAmount > 0 ? 214 : 56, g: outstandingAmount > 0 ? 158 : 161, b: outstandingAmount > 0 ? 46 : 105 },
      { label: 'Overdue', value: formatCurrency(overdueAmount), r: overdueAmount > 0 ? 229 : 56, g: overdueAmount > 0 ? 62 : 161, b: overdueAmount > 0 ? 62 : 105 }
    ];
    
    summaryItems.forEach((item, index) => {
      const x = 15 + index * (cardWidth + cardSpacing);
      
      // Card background
      pdf.setFillColor(item.r, item.g, item.b);
      pdf.roundedRect(x, startY, cardWidth, cardHeight, 2, 2, 'F');
      
      // Card content
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text(item.label, x + cardWidth/2, startY + 7, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(item.value, x + cardWidth/2, startY + 17, { align: 'center' });
    });
    
    return startY + cardHeight + 15;
  };
  
  const addInvoiceTable = (startY: number) => {
    pdf.setTextColor(45, 55, 72); // Dark gray
    
    // Section header
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(26, 54, 93); // Deep blue
    pdf.text('TRANSACTION DETAILS', 15, startY);
    
    if (periodStart && periodEnd) {
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(113, 128, 150); // Muted gray
      pdf.text(`Period: ${formatDate(periodStart)} to ${formatDate(periodEnd)}`, 15, startY + 7);
    }
    
    startY += 15;
    
    // Prepare table data
    const tableData = invoices.map(invoice => [
      invoice.invoiceNumber || 'N/A',
      formatDate(invoice.issueDate),
      formatDate(invoice.dueDate),
      invoice.description || '-',
      formatCurrency(invoice.total || '0'),
      getStatusDisplay(invoice.status),
      calculateDaysOverdue(invoice.dueDate, invoice.status)
    ]);
    
    // Add aging summary if there are overdue invoices
    const currentDate = new Date();
    const aging = {
      current: 0,
      thirtyDays: 0,
      sixtyDays: 0,
      ninetyDays: 0,
      overNinety: 0
    };
    
    invoices.forEach(invoice => {
      if (invoice.status !== 'paid') {
        const daysOverdue = Math.floor((currentDate.getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24));
        const amount = parseFloat(invoice.total || '0');
        
        if (daysOverdue <= 0) aging.current += amount;
        else if (daysOverdue <= 30) aging.thirtyDays += amount;
        else if (daysOverdue <= 60) aging.sixtyDays += amount;
        else if (daysOverdue <= 90) aging.ninetyDays += amount;
        else aging.overNinety += amount;
      }
    });
    
    // Enhanced table with professional styling
    (pdf as any).autoTable({
      startY: startY,
      head: [['Invoice #', 'Issue Date', 'Due Date', 'Description', 'Amount', 'Status', 'Days Overdue']],
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
        1: { halign: 'center', cellWidth: 22 },
        2: { halign: 'center', cellWidth: 22 },
        3: { halign: 'left', cellWidth: 45 },
        4: { halign: 'right', cellWidth: 25 },
        5: { halign: 'center', cellWidth: 20 },
        6: { halign: 'center', cellWidth: 20 }
      },
      didParseCell: function(data: any) {
        // Color-code status cells
        if (data.column.index === 5) {
          const status = data.cell.raw;
          if (status === 'PAID') {
            data.cell.styles.textColor = [56, 161, 105]; // Green
            data.cell.styles.fontStyle = 'bold';
          } else if (status === 'OVERDUE') {
            data.cell.styles.textColor = [229, 62, 62]; // Red
            data.cell.styles.fontStyle = 'bold';
          } else if (status === 'PENDING') {
            data.cell.styles.textColor = [214, 158, 46]; // Amber
            data.cell.styles.fontStyle = 'bold';
          }
        }
        
        // Highlight overdue days
        if (data.column.index === 6 && parseInt(data.cell.raw) > 0) {
          data.cell.styles.textColor = [229, 62, 62]; // Red
          data.cell.styles.fontStyle = 'bold';
        }
      },
      margin: { left: 15, right: 15 },
      tableWidth: 'auto'
    });
    
    return (pdf as any).lastAutoTable.finalY + 10;
  };
  
  const addAgingAnalysis = (startY: number) => {
    const currentDate = new Date();
    const aging = { current: 0, thirtyDays: 0, sixtyDays: 0, ninetyDays: 0, overNinety: 0 };
    
    invoices.forEach(invoice => {
      if (invoice.status !== 'paid') {
        const daysOverdue = Math.floor((currentDate.getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24));
        const amount = parseFloat(invoice.total || '0');
        
        if (daysOverdue <= 0) aging.current += amount;
        else if (daysOverdue <= 30) aging.thirtyDays += amount;
        else if (daysOverdue <= 60) aging.sixtyDays += amount;
        else if (daysOverdue <= 90) aging.ninetyDays += amount;
        else aging.overNinety += amount;
      }
    });
    
    const totalOutstanding = Object.values(aging).reduce((sum, amount) => sum + amount, 0);
    
    if (totalOutstanding > 0) {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(26, 54, 93); // Deep blue
      pdf.text('AGING ANALYSIS', 15, startY);
      
      const agingData = [
        ['Current (0 days)', formatCurrency(aging.current)],
        ['1-30 days', formatCurrency(aging.thirtyDays)],
        ['31-60 days', formatCurrency(aging.sixtyDays)],
        ['61-90 days', formatCurrency(aging.ninetyDays)],
        ['Over 90 days', formatCurrency(aging.overNinety)]
      ];
      
      (pdf as any).autoTable({
        startY: startY + 5,
        head: [['Age Range', 'Amount Outstanding']],
        body: agingData,
        styles: {
          fontSize: 9,
          cellPadding: 3,
          textColor: [45, 55, 72]
        },
        headStyles: {
          fillColor: [45, 55, 72],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        columnStyles: {
          0: { halign: 'left', cellWidth: 50 },
          1: { halign: 'right', cellWidth: 40 }
        },
        margin: { left: 15, right: 15 },
        tableWidth: 90
      });
      
      return (pdf as any).lastAutoTable.finalY + 10;
    }
    
    return startY;
  };
  
  const addFooter = () => {
    const footerY = pageHeight - 25;
    
    // Footer separator line
    pdf.setDrawColor(226, 232, 240); // Border gray
    pdf.setLineWidth(0.5);
    pdf.line(15, footerY - 5, pageWidth - 15, footerY - 5);
    
    // Payment terms and contact information
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(113, 128, 150); // Muted gray
    
    const paymentTerms = customer.paymentTerms ? `Payment Terms: ${customer.paymentTerms} days` : 'Payment Terms: 30 days';
    pdf.text(paymentTerms, 15, footerY);
    
    pdf.text('For inquiries, please contact us at the above details.', 15, footerY + 5);
    
    // Page numbering
    const pageNum = (pdf as any).internal.getCurrentPageInfo().pageNumber;
    pdf.text(`Page ${pageNum}`, pageWidth - 15, footerY, { align: 'right' });
    
    // Professional closing
    pdf.setTextColor(26, 54, 93); // Deep blue
    pdf.setFont('helvetica', 'italic');
    pdf.text('Thank you for your continued business partnership', pageWidth / 2, footerY + 10, { align: 'center' });
  };
  
  // Helper functions
  const getStatusDisplay = (status: string): string => {
    switch (status?.toLowerCase()) {
      case 'paid': return 'PAID';
      case 'overdue': return 'OVERDUE';
      case 'pending': return 'PENDING';
      case 'draft': return 'DRAFT';
      default: return 'PENDING';
    }
  };
  
  const calculateDaysOverdue = (dueDate: string, status: string): string => {
    if (status === 'paid') return '0';
    
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays).toString();
  };
  
  // Generate the statement
  addHeader();
  
  let currentY = 55;
  currentY = addCustomerInfoSection(currentY);
  currentY = addAccountSummaryDetails(currentY);
  currentY = addInvoiceTable(currentY);
  currentY = addAgingAnalysis(currentY);
  
  addFooter();
  
  return pdf;
}