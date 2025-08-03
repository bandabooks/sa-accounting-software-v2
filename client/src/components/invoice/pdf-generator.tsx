import { jsPDF } from "jspdf";
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

export function generateInvoicePDF(invoice: InvoiceWithCustomer): Promise<jsPDF> {
  return new Promise((resolve, reject) => {
    try {
      console.log('Starting PDF generation for invoice:', invoice.invoiceNumber);
      
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      
      // Header Section
      pdf.setFillColor(59, 130, 246);
      pdf.rect(20, 15, 12, 12, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(10);
      pdf.text("C", 24.5, 23);
      
      pdf.setFontSize(18);
      pdf.setTextColor(59, 130, 246);
      pdf.text("Think Mybiz Accounting", 38, 22);
      
      pdf.setFontSize(9);
      pdf.setTextColor(107, 114, 128);
      pdf.text("Professional Invoice Management", 38, 28);
      
      // Company details
      pdf.setFontSize(8);
      pdf.setTextColor(75, 85, 99);
      pdf.text("info@thinkmybiz.com | +27 12 345 6789", 20, 35);
      pdf.text("PO Box 1234, Midrand, 1685", 20, 39);
      pdf.text("VAT #: 4455667788 | Reg: 2019/123456/07", 20, 43);

      // Invoice title
      pdf.setFontSize(22);
      pdf.setTextColor(55, 65, 81);
      pdf.text("TAX INVOICE", pageWidth - 85, 23);
      
      // Invoice details
      pdf.setFontSize(9);
      pdf.setTextColor(75, 85, 99);
      const rightColumnX = pageWidth - 85;
      pdf.text(`Invoice #: ${invoice.invoiceNumber || 'N/A'}`, rightColumnX, 33);
      
      const issueDate = invoice.createdAt || invoice.issueDate;
      pdf.text(`Date: ${issueDate ? formatDate(issueDate) : 'N/A'}`, rightColumnX, 37);
      
      const dueDate = invoice.dueDate;
      pdf.text(`Due: ${dueDate ? formatDate(dueDate) : 'N/A'}`, rightColumnX, 41);
      
      const status = (invoice.status || 'DRAFT').toUpperCase();
      pdf.setTextColor(59, 130, 246);
      pdf.text(`Status: ${status}`, rightColumnX, 45);

      // Bill To section
      pdf.setFontSize(11);
      pdf.setTextColor(0, 0, 0);
      pdf.text("Bill To:", 20, 60);
      pdf.text("From:", pageWidth/2 + 10, 60);
      
      pdf.setFontSize(9);
      let billToY = 70;
      const customerName = invoice.customer?.name || 'No Customer';
      pdf.text(customerName.toUpperCase(), 20, billToY);
      
      if (invoice.customer?.email) {
        billToY += 6;
        pdf.text(invoice.customer.email, 20, billToY);
      }

      // From section
      const fromX = pageWidth/2 + 10;
      let fromY = 70;
      pdf.text("Think Mybiz Accounting", fromX, fromY);
      fromY += 6;
      pdf.text("info@thinkmybiz.com", fromX, fromY);
      fromY += 6;
      pdf.text("+27 12 345 6789", fromX, fromY);

      // Items table
      const tableStartY = 115;
      pdf.setFillColor(59, 130, 246);
      pdf.rect(20, tableStartY, pageWidth - 40, 10, 'F');
      
      pdf.setFontSize(9);
      pdf.setTextColor(255, 255, 255);
      const headerY = tableStartY + 6;
      pdf.text("#", 25, headerY);
      pdf.text("Description", 40, headerY);
      pdf.text("Qty", 120, headerY);
      pdf.text("Unit Price", 135, headerY);
      pdf.text("Total", pageWidth - 30, headerY);

      // Items
      pdf.setTextColor(0, 0, 0);
      let currentY = tableStartY + 18;
      
      // Access items through type assertion since TypeScript doesn't recognize the items property
      const items = (invoice as any).items || [];
      console.log('Processing items:', items);
      
      items.forEach((item: any, index: number) => {
        pdf.text((index + 1).toString(), 25, currentY);
        pdf.text(item.description || item.name || "Item", 40, currentY);
        pdf.text((item.quantity || 1).toString(), 120, currentY);
        pdf.text(formatCurrency(item.unitPrice || 0), 135, currentY);
        pdf.text(formatCurrency(item.total || 0), pageWidth - 30, currentY);
        currentY += 12;
      });

      // Totals
      const totalsStartY = currentY + 12;
      pdf.setFontSize(10);
      pdf.text("Subtotal:", pageWidth - 80, totalsStartY);
      pdf.text(formatCurrency(invoice.subtotal || 0), pageWidth - 30, totalsStartY);
      
      pdf.text("VAT (15%):", pageWidth - 80, totalsStartY + 10);
      pdf.text(formatCurrency(invoice.vatAmount || 0), pageWidth - 30, totalsStartY + 10);
      
      pdf.setFontSize(12);
      pdf.setTextColor(59, 130, 246);
      pdf.text("TOTAL:", pageWidth - 80, totalsStartY + 22);
      pdf.text(formatCurrency(invoice.total || 0), pageWidth - 30, totalsStartY + 22);

      // Payment section
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
      pdf.text("Outstanding", 25, paymentY + 15);
      pdf.text(formatCurrency(invoice.total || 0), pageWidth - 50, paymentY + 21);

      // Bank details
      const bankDetailsY = paymentY + 30;
      pdf.setFillColor(243, 244, 246);
      pdf.rect(20, bankDetailsY, pageWidth - 40, 18, 'F');
      
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      pdf.text("Payment Details:", 25, bankDetailsY + 8);
      
      pdf.setFontSize(8);
      pdf.setTextColor(75, 85, 99);
      pdf.text("Bank: ABSA Bank | Account: 123456789", 25, bankDetailsY + 14);
      pdf.text(`Reference: ${invoice.invoiceNumber || 'INV-001'}`, 25, bankDetailsY + 18);

      // Footer
      const footerY = bankDetailsY + 35;
      pdf.setFontSize(7);
      pdf.setTextColor(156, 163, 175);
      pdf.text("Thank you for your business! Contact: info@thinkmybiz.com | +27 12 345 6789", 20, footerY);
      pdf.text("Company Reg: 2019/123456/07 | VAT: 4455667788", 20, footerY + 4);

      console.log('PDF generation completed successfully');
      resolve(pdf);
    } catch (error) {
      console.error('PDF Generation Error:', error);
      reject(error);
    }
  });
}

export const PDFGenerator = ({ invoice, onGenerate }: { invoice: InvoiceWithCustomer; onGenerate: (pdf: jsPDF) => void }) => {
  const handleGenerate = async () => {
    try {
      const pdf = await generateInvoicePDF(invoice);
      onGenerate(pdf);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
    }
  };

  return null;
};