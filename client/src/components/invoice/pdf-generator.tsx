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
  return new Promise((resolve) => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Professional Header Section with Company Branding
    pdf.setFillColor(59, 130, 246); // Blue background for logo area
    pdf.rect(20, 15, 12, 12, 'F');
    
    // Company Logo Placeholder (Building icon equivalent)
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(12);
    pdf.text("⬛", 22, 24);
    
    // Company Name and Info
    pdf.setFontSize(18);
    pdf.setTextColor(37, 99, 235); // Blue-700
    pdf.text("Think Mybiz Accounting", 35, 22);
    
    pdf.setFontSize(9);
    pdf.setTextColor(107, 114, 128); // Gray-500
    pdf.text("Professional Invoice Management", 35, 27);
    
    // Company Contact Details
    pdf.setFontSize(8);
    pdf.setTextColor(75, 85, 99); // Gray-600
    pdf.text("info@thinkmybiz.com | +27 12 345 6789", 20, 35);
    pdf.text("PO Box 1234, Midrand, 1685", 20, 39);
    pdf.text("VAT #: 4455667788 | Reg: 2019/123456/07", 20, 43);

    // TAX INVOICE Title (Right Side)
    pdf.setFontSize(24);
    pdf.setTextColor(55, 65, 81); // Gray-700
    pdf.text("TAX INVOICE", pageWidth - 75, 25);
    
    // Invoice Details (Right Side)
    pdf.setFontSize(9);
    pdf.setTextColor(75, 85, 99);
    pdf.text(`Invoice #: ${invoice.invoiceNumber}`, pageWidth - 75, 35);
    pdf.text(`Date: ${formatDate(invoice.createdAt || invoice.issueDate)}`, pageWidth - 75, 40);
    pdf.text(`Due: ${formatDate(invoice.dueDate)}`, pageWidth - 75, 45);
    
    // Status with color
    let statusColor = [107, 114, 128]; // Default gray
    const status = invoice.status.toUpperCase();
    if (status === 'PAID') statusColor = [34, 197, 94]; // Green
    else if (status === 'SENT') statusColor = [59, 130, 246]; // Blue
    else if (status === 'OVERDUE') statusColor = [239, 68, 68]; // Red
    
    pdf.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
    pdf.text(`Status: ${status}`, pageWidth - 75, 50);

    // Bill To and From Section (Professional Layout)
    pdf.setFontSize(11);
    pdf.setTextColor(0, 0, 0);
    pdf.text("Bill To:", 20, 65);
    pdf.text("From:", pageWidth/2 + 10, 65);
    
    // Bill To Details
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    pdf.text(invoice.customer.name.toUpperCase(), 20, 75);
    pdf.text(invoice.customer.email || "N/A", 20, 82);
    pdf.text(invoice.customer.phone || "N/A", 20, 89);
    pdf.text(invoice.customer.address || "N/A", 20, 96);
    
    if (invoice.customer.vatNumber) {
      pdf.text(`VAT #: ${invoice.customer.vatNumber}`, 20, 103);
    }

    // From Details (Company)
    pdf.text("Think Mybiz Accounting", pageWidth/2 + 10, 75);
    pdf.text("info@thinkmybiz.com", pageWidth/2 + 10, 82);
    pdf.text("+27 12 345 6789", pageWidth/2 + 10, 89);
    pdf.text("PO Box 1234, Midrand, 1685", pageWidth/2 + 10, 96);
    pdf.text("VAT #: 4455667788", pageWidth/2 + 10, 103);

    // Professional Items Table with Blue Header
    const tableStartY = 120;
    pdf.setFillColor(59, 130, 246); // Blue header
    pdf.rect(20, tableStartY, pageWidth - 40, 10, 'F');
    
    // Table Headers
    pdf.setFontSize(9);
    pdf.setTextColor(255, 255, 255);
    pdf.text("#", 25, tableStartY + 6);
    pdf.text("Description", 35, tableStartY + 6);
    pdf.text("Qty", 120, tableStartY + 6);
    pdf.text("Unit Price", 140, tableStartY + 6);
    pdf.text("VAT Rate", 165, tableStartY + 6);
    pdf.text("Line VAT", 185, tableStartY + 6);
    pdf.text("Total", pageWidth - 25, tableStartY + 6);

    // Table Items
    pdf.setTextColor(0, 0, 0);
    let currentY = tableStartY + 18;
    let lineNumber = 1;
    
    const items = (invoice as any).items || [];
    items.forEach((item: any) => {
      // Alternate row backgrounds for better readability
      if (lineNumber % 2 === 0) {
        pdf.setFillColor(249, 250, 251); // Light gray
        pdf.rect(20, currentY - 4, pageWidth - 40, 8, 'F');
      }
      
      pdf.setFontSize(9);
      pdf.setTextColor(0, 0, 0);
      pdf.text(lineNumber.toString(), 25, currentY);
      
      // Truncate description if too long
      let description = item.description || item.name || "N/A";
      if (description.length > 25) {
        description = description.substring(0, 22) + "...";
      }
      pdf.text(description, 35, currentY);
      
      pdf.text((item.quantity || 1).toString(), 120, currentY);
      pdf.text(formatCurrency(item.unitPrice || 0), 140, currentY);
      pdf.text(`${item.vatRate || 15}%`, 165, currentY);
      pdf.text(formatCurrency(item.vatAmount || 0), 185, currentY);
      pdf.text(formatCurrency(item.total || 0), pageWidth - 25, currentY);
      
      currentY += 12;
      lineNumber++;
    });

    // Professional Totals Section
    const totalsStartY = currentY + 10;
    
    // Subtotal
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    pdf.text("Subtotal:", pageWidth - 80, totalsStartY);
    pdf.text(formatCurrency(invoice.subtotal || 0), pageWidth - 25, totalsStartY);
    
    // VAT
    pdf.text("VAT (15%):", pageWidth - 80, totalsStartY + 8);
    pdf.text(formatCurrency(invoice.vatAmount || 0), pageWidth - 25, totalsStartY + 8);
    
    // Total with emphasis
    pdf.setFillColor(59, 130, 246);
    pdf.rect(pageWidth - 85, totalsStartY + 15, 65, 10, 'F');
    pdf.setFontSize(12);
    pdf.setTextColor(255, 255, 255);
    pdf.text("TOTAL:", pageWidth - 80, totalsStartY + 21);
    pdf.text(formatCurrency(invoice.total || 0), pageWidth - 25, totalsStartY + 21);

    // Payment Status Section
    const paymentY = totalsStartY + 35;
    pdf.setFillColor(248, 250, 252); // Light blue background
    pdf.rect(20, paymentY, pageWidth - 40, 25, 'F');
    
    pdf.setFontSize(11);
    pdf.setTextColor(185, 28, 28); // Red color for status icon
    pdf.text("○ Payment Status", 25, paymentY + 8);
    
    pdf.setFontSize(9);
    pdf.setTextColor(75, 85, 99);
    pdf.text(`${invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}    No payments received`, 30, paymentY + 15);
    
    pdf.text(`Invoice Total:`, 30, paymentY + 20);
    pdf.text(formatCurrency(invoice.total || 0), 80, paymentY + 20);
    
    pdf.setTextColor(185, 28, 28);
    pdf.text(`Outstanding Balance:`, 120, paymentY + 20);
    pdf.text(formatCurrency(invoice.total || 0), 180, paymentY + 20);

    // Payment Details Section
    const bankDetailsY = paymentY + 35;
    pdf.setFillColor(243, 244, 246); // Gray background
    pdf.rect(20, bankDetailsY, pageWidth - 40, 20, 'F');
    
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    pdf.text("Payment Details:", 25, bankDetailsY + 8);
    
    pdf.setFontSize(8);
    pdf.setTextColor(75, 85, 99);
    pdf.text("Bank: ABSA Bank | Account: 123456789 | Branch: 632005", 25, bankDetailsY + 13);
    pdf.text(`Reference: ${invoice.invoiceNumber}`, 25, bankDetailsY + 17);
    pdf.text("Please use the invoice number as your payment reference for quick allocation.", 25, bankDetailsY + 21);

    // Notes Section (if present)
    let notesY = bankDetailsY + 30;
    if (invoice.notes) {
      pdf.setFillColor(254, 243, 199); // Amber background
      pdf.rect(20, notesY, pageWidth - 40, 15, 'F');
      
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      pdf.text("Additional Notes:", 25, notesY + 8);
      
      pdf.setFontSize(8);
      pdf.setTextColor(75, 85, 99);
      pdf.text(invoice.notes, 25, notesY + 13);
      notesY += 20;
    }

    // Professional Footer
    const footerY = Math.max(notesY + 10, pageHeight - 25);
    pdf.setFontSize(7);
    pdf.setTextColor(156, 163, 175); // Gray-400
    pdf.text("Thank you for your business! For queries, contact info@thinkmybiz.com or call +27 12 345 6789.", 20, footerY);
    pdf.text("Company Reg: 2019/123456/07 | VAT: 4455667788 | Tax Clearance: Valid", 20, footerY + 4);
    pdf.text("This is a computer-generated document. No signature required.", 20, footerY + 8);

    resolve(pdf);
  });
}

export default function PDFGenerator({ invoice, onGenerate }: PDFGeneratorProps) {
  const handleGeneratePDF = async () => {
    try {
      const pdf = await generateInvoicePDF(invoice);
      onGenerate(pdf);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  return { generatePDF: handleGeneratePDF };
}