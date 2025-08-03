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
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Set default font
      pdf.setFont('helvetica', 'normal');

      // Professional Header Section - Enhanced Layout
      // Company Logo Box (Blue background) - slightly larger
      pdf.setFillColor(59, 130, 246); // Blue-500 for better visibility
      pdf.rect(20, 15, 12, 12, 'F');
      
      // Company Logo Text (White "C" for company)
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text("C", 24.5, 23);
      
      // Company Name - Enhanced styling
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(59, 130, 246); // Blue-500
      pdf.text("Think Mybiz Accounting", 38, 22);
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(107, 114, 128); // Gray-500
      pdf.text("Professional Invoice Management", 38, 28);
      
      // Company Contact Details - Better spacing
      pdf.setFontSize(8);
      pdf.setTextColor(75, 85, 99); // Gray-600
      pdf.text("info@thinkmybiz.com | +27 12 345 6789", 20, 35);
      pdf.text("PO Box 1234, Midrand, 1685", 20, 39);
      pdf.text("VAT #: 4455667788 | Reg: 2019/123456/07", 20, 43);

      // TAX INVOICE Title (Right Side) - Bold and properly aligned
      pdf.setFontSize(22);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(55, 65, 81); // Gray-700
      pdf.text("TAX INVOICE", pageWidth - 85, 23);
      
      // Invoice Details Box (Right Side) - Right-aligned properly
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(75, 85, 99);
      
      const rightColumnX = pageWidth - 85;
      pdf.text(`Invoice #: ${invoice.invoiceNumber}`, rightColumnX, 33);
      pdf.text(`Date: ${formatDate(invoice.createdAt || invoice.issueDate)}`, rightColumnX, 37);
      pdf.text(`Due: ${formatDate(invoice.dueDate)}`, rightColumnX, 41);
      
      // Status with proper color coding
      let statusColor = [107, 114, 128]; // Default gray
      const status = invoice.status.toUpperCase();
      if (status === 'PAID') statusColor = [34, 197, 94]; // Green
      else if (status === 'SENT') statusColor = [59, 130, 246]; // Blue
      else if (status === 'OVERDUE') statusColor = [239, 68, 68]; // Red
      else if (status === 'DRAFT') statusColor = [251, 146, 60]; // Orange
      
      pdf.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
      pdf.text(`Status: ${status}`, rightColumnX, 45);

      // Bill To and From Section - Enhanced Layout
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text("Bill To:", 20, 60);
      pdf.text("From:", pageWidth/2 + 10, 60);
      
      // Bill To Details - Properly formatted
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      
      let billToY = 70;
      pdf.setFont('helvetica', 'bold');
      pdf.text(invoice.customer.name.toUpperCase(), 20, billToY);
      
      pdf.setFont('helvetica', 'normal');
      if (invoice.customer.email) {
        billToY += 6;
        pdf.text(invoice.customer.email, 20, billToY);
      }
      
      if (invoice.customer.phone) {
        billToY += 6;
        pdf.text(invoice.customer.phone, 20, billToY);
      }
      
      if (invoice.customer.address) {
        billToY += 6;
        pdf.text(invoice.customer.address, 20, billToY);
      }
      
      if (invoice.customer.city || invoice.customer.postalCode) {
        billToY += 6;
        pdf.text(`${invoice.customer.city || ''}, ${invoice.customer.postalCode || ''}`, 20, billToY);
      }

      // From Details (Company) - Right side with proper alignment
      const fromX = pageWidth/2 + 10;
      let fromY = 70;
      
      pdf.setFont('helvetica', 'bold');
      pdf.text("Think Mybiz Accounting", fromX, fromY);
      
      pdf.setFont('helvetica', 'normal');
      fromY += 6;
      pdf.text("info@thinkmybiz.com", fromX, fromY);
      fromY += 6;
      pdf.text("+27 12 345 6789", fromX, fromY);
      fromY += 6;
      pdf.text("PO Box 1234, Midrand, 1685", fromX, fromY);
      fromY += 6;
      pdf.text("VAT #: 4455667788", fromX, fromY);

      // Professional Items Table - Enhanced Design
      const tableStartY = 115;
      
      // Blue header row - enhanced design
      pdf.setFillColor(59, 130, 246); // Blue-500
      pdf.rect(20, tableStartY, pageWidth - 40, 10, 'F');
      
      // Table Headers - better alignment and spacing
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(255, 255, 255);
      
      const headerY = tableStartY + 6;
      pdf.text("#", 25, headerY);
      pdf.text("Description", 40, headerY);
      pdf.text("Qty", 120, headerY);
      pdf.text("Unit Price", 135, headerY);
      pdf.text("VAT Rate", 155, headerY);
      pdf.text("Line VAT", 175, headerY);
      pdf.text("Total", pageWidth - 30, headerY);

      // Table Items - enhanced formatting
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      let currentY = tableStartY + 18;
      let lineNumber = 1;
      
      const items = (invoice as any).items || [];
      items.forEach((item: any) => {
        pdf.setFontSize(9);
        
        // Line number
        pdf.text(lineNumber.toString(), 25, currentY);
        
        // Description - better formatting
        let description = item.description || item.name || "";
        if (description.length > 25) {
          description = description.substring(0, 22) + "...";
        }
        pdf.text(description, 40, currentY);
        
        // Right-aligned numbers for better appearance
        const qty = (item.quantity || 1).toString();
        const unitPrice = formatCurrency(item.unitPrice || 0);
        const vatRate = `${(item.vatRate || 15).toFixed(2)}%`;
        const lineVat = formatCurrency(item.vatAmount || 0);
        const total = formatCurrency(item.total || 0);
        
        // Center-align quantity
        const qtyWidth = pdf.getTextWidth(qty);
        pdf.text(qty, 120 - qtyWidth/2, currentY);
        
        // Right-align monetary values
        pdf.text(unitPrice, 148 - pdf.getTextWidth(unitPrice), currentY);
        pdf.text(vatRate, 170 - pdf.getTextWidth(vatRate), currentY);
        pdf.text(lineVat, 190 - pdf.getTextWidth(lineVat), currentY);
        pdf.text(total, pageWidth - 25 - pdf.getTextWidth(total), currentY);
        
        currentY += 12;
        lineNumber++;
      });

      // Professional Totals Section - Enhanced right alignment
      const totalsStartY = currentY + 12;
      
      // Subtotal - properly right-aligned
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      
      const subtotalLabel = "Subtotal:";
      const subtotalValue = formatCurrency(invoice.subtotal || 0);
      pdf.text(subtotalLabel, pageWidth - 80, totalsStartY);
      pdf.text(subtotalValue, pageWidth - 25 - pdf.getTextWidth(subtotalValue), totalsStartY);
      
      // VAT line - properly aligned
      const vatLabel = "VAT (15%):";
      const vatValue = formatCurrency(invoice.vatAmount || 0);
      pdf.text(vatLabel, pageWidth - 80, totalsStartY + 10);
      pdf.text(vatValue, pageWidth - 25 - pdf.getTextWidth(vatValue), totalsStartY + 10);
      
      // TOTAL with blue emphasis - enhanced styling
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(59, 130, 246); // Blue-500 for emphasis
      
      const totalLabel = "TOTAL:";
      const totalValue = formatCurrency(invoice.total || 0);
      pdf.text(totalLabel, pageWidth - 80, totalsStartY + 22);
      pdf.text(totalValue, pageWidth - 25 - pdf.getTextWidth(totalValue), totalsStartY + 22);

      // Payment Status Section - Enhanced Design
      const paymentY = totalsStartY + 40;
      
      // Light background box for payment status - slightly rounded appearance
      pdf.setFillColor(248, 250, 252); // Light blue-gray background
      pdf.rect(20, paymentY, pageWidth - 40, 24, 'F');
      
      // Payment Status Icon and Title - enhanced styling
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(239, 68, 68); // Red color for status circle
      pdf.text("●", 25, paymentY + 8);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      pdf.text("Payment Status", 32, paymentY + 8);
      
      // Status details - better formatting
      pdf.setFontSize(9);
      pdf.setTextColor(75, 85, 99);
      const statusText = `${invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}`;
      pdf.text(statusText, 25, paymentY + 15);
      pdf.text("No payments received", 80, paymentY + 15);
      
      // Invoice Total and Outstanding Balance - better alignment
      pdf.setFontSize(9);
      pdf.setTextColor(75, 85, 99);
      pdf.text("Invoice Total:", 25, paymentY + 21);
      
      const invoiceTotal = formatCurrency(invoice.total || 0);
      pdf.text(invoiceTotal, 80, paymentY + 21);
      
      pdf.setTextColor(239, 68, 68); // Red for outstanding balance
      pdf.text("Outstanding Balance:", 130, paymentY + 21);
      
      const outstandingBalance = formatCurrency(invoice.total || 0);
      pdf.text(outstandingBalance, pageWidth - 25 - pdf.getTextWidth(outstandingBalance), paymentY + 21);

      // Payment Details Section - Enhanced design
      const bankDetailsY = paymentY + 30;
      pdf.setFillColor(243, 244, 246); // Light gray background
      pdf.rect(20, bankDetailsY, pageWidth - 40, 22, 'F');
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text("Payment Details:", 25, bankDetailsY + 8);
      
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(75, 85, 99);
      pdf.text("Bank: ABSA Bank | Account: 123456789 | Branch: 632005", 25, bankDetailsY + 14);
      pdf.text(`Reference: ${invoice.invoiceNumber}`, 25, bankDetailsY + 18);
      pdf.text("Please use the invoice number as your payment reference for quick allocation.", 25, bankDetailsY + 22);

      // Notes Section (if present) - enhanced amber styling
      let notesY = bankDetailsY + 28;
      if (invoice.notes) {
        pdf.setFillColor(254, 243, 199); // Amber-100 background
        pdf.rect(20, notesY, pageWidth - 40, 16, 'F');
        
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0, 0, 0);
        pdf.text("Additional Notes:", 25, notesY + 8);
        
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(75, 85, 99);
        
        // Handle long notes with word wrapping
        const maxWidth = pageWidth - 50;
        const words = invoice.notes.split(' ');
        let line = '';
        let lineY = notesY + 13;
        
        words.forEach(word => {
          const testLine = line + word + ' ';
          const testWidth = pdf.getTextWidth(testLine);
          
          if (testWidth > maxWidth && line.length > 0) {
            pdf.text(line.trim(), 25, lineY);
            line = word + ' ';
            lineY += 4;
          } else {
            line = testLine;
          }
        });
        
        if (line.length > 0) {
          pdf.text(line.trim(), 25, lineY);
        }
        
        notesY += 20;
      }

      // Professional Footer - enhanced design
      const footerY = Math.max(notesY + 10, pageHeight - 25);
      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(156, 163, 175); // Gray-400
      
      pdf.text("Thank you for your business! For queries, contact info@thinkmybiz.com or call +27 12 345 6789.", 20, footerY);
      pdf.text("Company Reg: 2019/123456/07 | VAT: 4455667788 | Tax Clearance: Valid", 20, footerY + 4);
      pdf.text("This is a computer-generated document. No signature required.", 20, footerY + 8);

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