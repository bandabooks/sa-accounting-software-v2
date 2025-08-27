import { jsPDF } from "jspdf";

const formatCurrency = (amount: string | number) => {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR'
  }).format(value);
};

const formatDate = (dateStr: string | Date) => {
  return new Date(dateStr).toLocaleDateString('en-ZA');
};

export async function generateVATSummaryPDF(reportData: any): Promise<jsPDF> {
  return new Promise((resolve) => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Header Section with Company Branding
    pdf.setFillColor(79, 70, 229); // Primary blue gradient
    pdf.rect(0, 0, pageWidth, 35, 'F');
    
    // Company Name/Logo Area
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('TAXNIFY', 20, 20);
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Business & Compliance', 20, 27);

    // Document Title
    pdf.setTextColor(79, 70, 229);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('VAT Summary Report', 20, 55);

    // Report Period
    pdf.setTextColor(100, 100, 100);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    const period = reportData.period;
    pdf.text(`Report Period: ${formatDate(period.startDate)} to ${formatDate(period.endDate)}`, 20, 67);
    pdf.text(`Generated: ${formatDate(new Date())}`, 20, 77);

    // VAT Summary Section
    let yPosition = 95;
    
    // Section Header
    pdf.setTextColor(79, 70, 229);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('VAT SUMMARY', 20, yPosition);
    
    // Underline
    pdf.setDrawColor(79, 70, 229);
    pdf.setLineWidth(0.5);
    pdf.line(20, yPosition + 2, 80, yPosition + 2);
    
    yPosition += 15;

    // Summary Data
    const summary = reportData.summary;
    
    // Output VAT (Sales)
    pdf.setTextColor(34, 197, 94); // Green
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('OUTPUT VAT (Sales)', 20, yPosition);
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'normal');
    pdf.text(formatCurrency(summary.outputVat), pageWidth - 50, yPosition, { align: 'right' });
    
    yPosition += 10;
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Total Sales (Inc VAT): ${formatCurrency(summary.totalSalesIncVat)}`, 25, yPosition);
    yPosition += 8;
    pdf.text(`Total Sales (Exc VAT): ${formatCurrency(summary.totalSalesExcVat)}`, 25, yPosition);
    
    yPosition += 20;

    // Input VAT (Purchases)
    pdf.setTextColor(59, 130, 246); // Blue
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('INPUT VAT (Purchases)', 20, yPosition);
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'normal');
    pdf.text(formatCurrency(summary.inputVat), pageWidth - 50, yPosition, { align: 'right' });
    
    yPosition += 10;
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Total Purchases (Inc VAT): ${formatCurrency(summary.totalPurchasesIncVat)}`, 25, yPosition);
    yPosition += 8;
    pdf.text(`Total Purchases (Exc VAT): ${formatCurrency(summary.totalPurchasesExcVat)}`, 25, yPosition);
    
    yPosition += 25;

    // Net VAT Section with border
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(1);
    pdf.rect(20, yPosition - 10, pageWidth - 40, 25);
    
    pdf.setTextColor(147, 51, 234); // Purple
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('NET VAT PAYABLE', 25, yPosition);
    
    const netVat = parseFloat(summary.netVatPayable) > 0 ? summary.netVatPayable : summary.netVatRefund;
    const netLabel = parseFloat(summary.netVatPayable) > 0 ? 'PAYABLE' : 'REFUND';
    
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(18);
    pdf.text(formatCurrency(netVat), pageWidth - 25, yPosition, { align: 'right' });
    
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Amount ${netLabel} to SARS`, 25, yPosition + 8);

    yPosition += 35;

    // Transaction Summary
    if (reportData.transactions) {
      pdf.setTextColor(79, 70, 229);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('TRANSACTION SUMMARY', 20, yPosition);
      
      yPosition += 15;
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Total Invoices: ${reportData.transactions.invoiceCount}`, 25, yPosition);
      yPosition += 10;
      pdf.text(`Total Expenses: ${reportData.transactions.expenseCount}`, 25, yPosition);
    }

    // Footer
    const footerY = pageHeight - 20;
    pdf.setDrawColor(200, 200, 200);
    pdf.line(20, footerY - 5, pageWidth - 20, footerY - 5);
    
    pdf.setTextColor(100, 100, 100);
    pdf.setFontSize(8);
    pdf.text('This report was generated by Taxnify Business Management Platform', 20, footerY);
    pdf.text(`Page 1 of 1`, pageWidth - 20, footerY, { align: 'right' });

    resolve(pdf);
  });
}

export async function generateVATTransactionPDF(reportData: any): Promise<jsPDF> {
  return new Promise((resolve) => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Header Section
    pdf.setFillColor(79, 70, 229);
    pdf.rect(0, 0, pageWidth, 35, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('TAXNIFY', 20, 20);
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Business & Compliance', 20, 27);

    // Document Title
    pdf.setTextColor(79, 70, 229);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('VAT Transaction Analysis', 20, 55);

    // Report Period
    pdf.setTextColor(100, 100, 100);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    const period = reportData.period;
    pdf.text(`Period: ${formatDate(period.startDate)} to ${formatDate(period.endDate)}`, 20, 67);
    pdf.text(`Generated: ${formatDate(new Date())}`, 20, 77);

    let yPosition = 95;

    // Transaction Summary
    if (reportData.summary) {
      pdf.setTextColor(79, 70, 229);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('TRANSACTION SUMMARY', 20, yPosition);
      
      yPosition += 15;
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Total Transactions: ${reportData.summary.totalTransactions}`, 25, yPosition);
      yPosition += 8;
      pdf.text(`Sales Transactions: ${reportData.summary.salesTransactions}`, 25, yPosition);
      yPosition += 8;
      pdf.text(`Purchase Transactions: ${reportData.summary.purchaseTransactions}`, 25, yPosition);
      
      yPosition += 20;
    }

    // Transaction Table Header
    pdf.setTextColor(79, 70, 229);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('TRANSACTION DETAILS', 20, yPosition);
    
    yPosition += 15;

    // Table headers
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    
    const headers = ['Date', 'Type', 'Reference', 'Net', 'VAT', 'Gross'];
    const colWidths = [25, 20, 40, 25, 25, 25];
    let xPos = 20;
    
    headers.forEach((header, i) => {
      pdf.text(header, xPos, yPosition);
      xPos += colWidths[i];
    });
    
    // Table header line
    pdf.setDrawColor(200, 200, 200);
    pdf.line(20, yPosition + 2, pageWidth - 20, yPosition + 2);
    
    yPosition += 10;

    // Transaction rows (first 20 transactions)
    if (reportData.transactions && Array.isArray(reportData.transactions)) {
      const transactions = reportData.transactions.slice(0, 20); // First 20 transactions
      
      transactions.forEach((transaction: any) => {
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = 30;
        }

        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        
        xPos = 20;
        const values = [
          formatDate(transaction.date),
          transaction.type,
          transaction.reference.substring(0, 15) + (transaction.reference.length > 15 ? '...' : ''),
          formatCurrency(transaction.netAmount),
          formatCurrency(transaction.vatAmount),
          formatCurrency(transaction.grossAmount)
        ];
        
        values.forEach((value, i) => {
          pdf.text(value, xPos, yPosition);
          xPos += colWidths[i];
        });
        
        yPosition += 8;
      });

      // Show count if more transactions exist
      if (reportData.transactions.length > 20) {
        yPosition += 5;
        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Showing first 20 of ${reportData.transactions.length} transactions`, 20, yPosition);
      }
    }

    // Footer
    const footerY = pageHeight - 20;
    pdf.setDrawColor(200, 200, 200);
    pdf.line(20, footerY - 5, pageWidth - 20, footerY - 5);
    
    pdf.setTextColor(100, 100, 100);
    pdf.setFontSize(8);
    pdf.text('This report was generated by Taxnify Business Management Platform', 20, footerY);
    pdf.text(`Page 1 of 1`, pageWidth - 20, footerY, { align: 'right' });

    resolve(pdf);
  });
}

export async function generateVATReconciliationPDF(reportData: any): Promise<jsPDF> {
  return new Promise((resolve) => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Header Section
    pdf.setFillColor(79, 70, 229);
    pdf.rect(0, 0, pageWidth, 35, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('TAXNIFY', 20, 20);
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Business & Compliance', 20, 27);

    // Document Title
    pdf.setTextColor(79, 70, 229);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('VAT Reconciliation Report', 20, 55);

    // Report Period
    pdf.setTextColor(100, 100, 100);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Generated: ${formatDate(new Date())}`, 20, 67);

    let yPosition = 85;

    // Reconciliation Status
    pdf.setTextColor(79, 70, 229);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('RECONCILIATION STATUS', 20, yPosition);
    
    yPosition += 20;

    // Status details
    const reconciliation = reportData.reconciliation || {};
    
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Status: ${reconciliation.reportStatus || 'Pending'}`, 25, yPosition);
    yPosition += 12;
    pdf.text(`Output VAT: ${formatCurrency(reconciliation.outputVat || '0.00')}`, 25, yPosition);
    yPosition += 12;
    pdf.text(`Input VAT: ${formatCurrency(reconciliation.inputVat || '0.00')}`, 25, yPosition);
    yPosition += 12;
    pdf.text(`Net VAT: ${formatCurrency(reconciliation.netVat || '0.00')}`, 25, yPosition);

    yPosition += 30;

    // SARS Submission Details (if available)
    pdf.setTextColor(79, 70, 229);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('SARS SUBMISSION DETAILS', 20, yPosition);
    
    yPosition += 15;
    
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Submission Status: Not yet submitted', 25, yPosition);
    yPosition += 12;
    pdf.text('Next Return Due: Check VAT201 calendar', 25, yPosition);

    // Footer
    const footerY = pageHeight - 20;
    pdf.setDrawColor(200, 200, 200);
    pdf.line(20, footerY - 5, pageWidth - 20, footerY - 5);
    
    pdf.setTextColor(100, 100, 100);
    pdf.setFontSize(8);
    pdf.text('This report was generated by Taxnify Business Management Platform', 20, footerY);
    pdf.text(`Page 1 of 1`, pageWidth - 20, footerY, { align: 'right' });

    resolve(pdf);
  });
}