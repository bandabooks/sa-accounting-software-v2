import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { InvoiceWithCustomer } from "@shared/schema";

// Helper functions
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

interface PDFGeneratorProps {
  invoice: InvoiceWithCustomer;
  onGenerate: (pdf: jsPDF) => void;
}

export function generateInvoicePDF(invoice: InvoiceWithCustomer): Promise<jsPDF> {
  return new Promise((resolve, reject) => {
    try {
      console.log('Starting PDF generation for invoice:', invoice.invoiceNumber);
      
      // Simple PDF test first
      const pdf = new jsPDF();
      
      // Test basic functionality first
      pdf.setFontSize(20);
      pdf.text("Invoice Test", 20, 20);
      
      console.log('Basic PDF operations successful, proceeding with full invoice...');
      
      const pageWidth = finalPdf.internal.pageSize.getWidth();
      const pageHeight = finalPdf.internal.pageSize.getHeight();

      // Professional Header Section
      finalPdf.setFillColor(59, 130, 246);
      finalPdf.rect(20, 15, 12, 12, 'F');
      
      finalPdf.setTextColor(255, 255, 255);
      finalPdf.setFontSize(10);
      finalPdf.text("C", 24.5, 23);
      
      finalPdf.setFontSize(18);
      finalPdf.setTextColor(59, 130, 246);
      finalPdf.text("Think Mybiz Accounting", 38, 22);
      
      pdf.setFontSize(9);
      pdf.setTextColor(107, 114, 128);
      pdf.text("Professional Invoice Management", 38, 28);
      
      pdf.setFontSize(8);
      pdf.setTextColor(75, 85, 99);
      pdf.text("info@thinkmybiz.com | +27 12 345 6789", 20, 35);
      pdf.text("PO Box 1234, Midrand, 1685", 20, 39);
      pdf.text("VAT #: 4455667788 | Reg: 2019/123456/07", 20, 43);

      // TAX INVOICE Title
      pdf.setFontSize(22);
      pdf.setTextColor(55, 65, 81);
      pdf.text("TAX INVOICE", pageWidth - 85, 23);
      
      // Invoice Details
      pdf.setFontSize(9);
      pdf.setTextColor(75, 85, 99);
      
      const rightColumnX = pageWidth - 85;
      pdf.text(`Invoice #: ${invoice.invoiceNumber || 'N/A'}`, rightColumnX, 33);
      
      const issueDate = invoice.createdAt || invoice.issueDate;
      pdf.text(`Date: ${issueDate ? formatDate(issueDate) : 'N/A'}`, rightColumnX, 37);
      
      const dueDate = invoice.dueDate;
      pdf.text(`Due: ${dueDate ? formatDate(dueDate) : 'N/A'}`, rightColumnX, 41);
      
      // Status
      const status = (invoice.status || 'DRAFT').toUpperCase();
      let statusColor = [107, 114, 128];
      if (status === 'PAID') statusColor = [34, 197, 94];
      else if (status === 'SENT') statusColor = [59, 130, 246];
      else if (status === 'OVERDUE') statusColor = [239, 68, 68];
      else if (status === 'DRAFT') statusColor = [251, 146, 60];
      
      pdf.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
      pdf.text(`Status: ${status}`, rightColumnX, 45);

      // Bill To and From Section
      pdf.setFontSize(11);
      pdf.setTextColor(0, 0, 0);
      pdf.text("Bill To:", 20, 60);
      pdf.text("From:", pageWidth/2 + 10, 60);
      
      // Bill To Details
      pdf.setFontSize(9);
      pdf.setTextColor(0, 0, 0);
      
      let billToY = 70;
      const customerName = invoice.customer?.name || 'No Customer';
      pdf.text(customerName.toUpperCase(), 20, billToY);
      
      if (invoice.customer?.email) {
        billToY += 6;
        pdf.text(invoice.customer.email, 20, billToY);
      }
      
      if (invoice.customer?.phone) {
        billToY += 6;
        pdf.text(invoice.customer.phone, 20, billToY);
      }
      
      if (invoice.customer?.address) {
        billToY += 6;
        pdf.text(invoice.customer.address, 20, billToY);
      }

      // From Details (Company)
      const fromX = pageWidth/2 + 10;
      let fromY = 70;
      
      pdf.text("Think Mybiz Accounting", fromX, fromY);
      fromY += 6;
      pdf.text("info@thinkmybiz.com", fromX, fromY);
      fromY += 6;
      pdf.text("+27 12 345 6789", fromX, fromY);
      fromY += 6;
      pdf.text("PO Box 1234, Midrand, 1685", fromX, fromY);
      fromY += 6;
      pdf.text("VAT #: 4455667788", fromX, fromY);

      // Items Table
      const tableStartY = 115;
      
      // Blue header row
      pdf.setFillColor(59, 130, 246);
      pdf.rect(20, tableStartY, pageWidth - 40, 10, 'F');
      
      // Table Headers
      pdf.setFontSize(9);
      pdf.setTextColor(255, 255, 255);
      
      const headerY = tableStartY + 6;
      pdf.text("#", 25, headerY);
      pdf.text("Description", 40, headerY);
      pdf.text("Qty", 120, headerY);
      pdf.text("Unit Price", 135, headerY);
      pdf.text("VAT Rate", 155, headerY);
      pdf.text("Line VAT", 175, headerY);
      pdf.text("Total", pageWidth - 30, headerY);

      // Table Items
      pdf.setTextColor(0, 0, 0);
      let currentY = tableStartY + 18;
      let lineNumber = 1;
      
      const items = invoice.items || [];
      console.log('Processing items:', items);
      
      items.forEach((item: any) => {
        pdf.setFontSize(9);
        
        pdf.text(lineNumber.toString(), 25, currentY);
        
        let description = item.description || item.name || "Item";
        if (description.length > 25) {
          description = description.substring(0, 22) + "...";
        }
        pdf.text(description, 40, currentY);
        
        const qty = (item.quantity || 1).toString();
        const unitPrice = formatCurrency(item.unitPrice || 0);
        const vatRate = `${(item.vatRate || 15).toFixed(1)}%`;
        const lineVat = formatCurrency(item.vatAmount || 0);
        const total = formatCurrency(item.total || 0);
        
        pdf.text(qty, 120, currentY);
        pdf.text(unitPrice, 135, currentY);
        pdf.text(vatRate, 155, currentY);
        pdf.text(lineVat, 175, currentY);
        pdf.text(total, pageWidth - 30, currentY);
        
        currentY += 12;
        lineNumber++;
      });

      // Totals Section
      const totalsStartY = currentY + 12;
      
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      
      const subtotalValue = formatCurrency(invoice.subtotal || 0);
      pdf.text("Subtotal:", pageWidth - 80, totalsStartY);
      pdf.text(subtotalValue, pageWidth - 30, totalsStartY);
      
      const vatValue = formatCurrency(invoice.vatAmount || 0);
      pdf.text("VAT (15%):", pageWidth - 80, totalsStartY + 10);
      pdf.text(vatValue, pageWidth - 30, totalsStartY + 10);
      
      // TOTAL with emphasis
      pdf.setFontSize(12);
      pdf.setTextColor(59, 130, 246);
      
      const totalValue = formatCurrency(invoice.total || 0);
      pdf.text("TOTAL:", pageWidth - 80, totalsStartY + 22);
      pdf.text(totalValue, pageWidth - 30, totalsStartY + 22);

      // Payment Status Section
      const paymentY = totalsStartY + 40;
      
      pdf.setFillColor(248, 250, 252);
      pdf.rect(20, paymentY, pageWidth - 40, 24, 'F');
      
      pdf.setFontSize(11);
      pdf.setTextColor(239, 68, 68);
      pdf.text("●", 25, paymentY + 8);
      
      pdf.setTextColor(0, 0, 0);
      pdf.text("Payment Status", 32, paymentY + 8);
      
      pdf.setFontSize(9);
      pdf.setTextColor(75, 85, 99);
      const statusText = (invoice.status || 'Draft').charAt(0).toUpperCase() + (invoice.status || 'draft').slice(1);
      pdf.text(statusText, 25, paymentY + 15);
      pdf.text("No payments received", 80, paymentY + 15);
      
      pdf.text("Invoice Total:", 25, paymentY + 21);
      pdf.text(formatCurrency(invoice.total || 0), 80, paymentY + 21);
      
      pdf.setTextColor(239, 68, 68);
      pdf.text("Outstanding Balance:", 130, paymentY + 21);
      pdf.text(formatCurrency(invoice.total || 0), pageWidth - 50, paymentY + 21);

      // Payment Details Section
      const bankDetailsY = paymentY + 30;
      pdf.setFillColor(243, 244, 246);
      pdf.rect(20, bankDetailsY, pageWidth - 40, 22, 'F');
      
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      pdf.text("Payment Details:", 25, bankDetailsY + 8);
      
      pdf.setFontSize(8);
      pdf.setTextColor(75, 85, 99);
      pdf.text("Bank: ABSA Bank | Account: 123456789 | Branch: 632005", 25, bankDetailsY + 14);
      pdf.text(`Reference: ${invoice.invoiceNumber || 'INV-001'}`, 25, bankDetailsY + 18);
      pdf.text("Please use the invoice number as your payment reference for quick allocation.", 25, bankDetailsY + 22);

      // Notes Section (if present)
      let notesY = bankDetailsY + 28;
      if (invoice.notes) {
        pdf.setFillColor(254, 243, 199);
        pdf.rect(20, notesY, pageWidth - 40, 16, 'F');
        
        pdf.setFontSize(9);
        pdf.setTextColor(0, 0, 0);
        pdf.text("Additional Notes:", 25, notesY + 8);
        
        pdf.setFontSize(8);
        pdf.setTextColor(75, 85, 99);
        pdf.text(invoice.notes, 25, notesY + 13);
        
        notesY += 20;
      }

      // Footer
      const footerY = Math.max(notesY + 10, pageHeight - 25);
      pdf.setFontSize(7);
      pdf.setTextColor(156, 163, 175);
      
      pdf.text("Thank you for your business! For queries, contact info@thinkmybiz.com or call +27 12 345 6789.", 20, footerY);
      pdf.text("Company Reg: 2019/123456/07 | VAT: 4455667788 | Tax Clearance: Valid", 20, footerY + 4);
      pdf.text("This is a computer-generated document. No signature required.", 20, footerY + 8);

      console.log('PDF generation completed successfully');
      resolve(pdf);
    } catch (error) {
      console.error('PDF Generation Error:', error);
      reject(error);
    }
  });
}

export const PDFGenerator = ({ invoice, onGenerate }: PDFGeneratorProps) => {
  const handleGenerate = async () => {
    try {
      const pdf = await generateInvoicePDF(invoice);
      onGenerate(pdf);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
    }
  };

  return null; // This is a utility component
};