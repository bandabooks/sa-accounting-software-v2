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

    // Professional Header Section - Exact Match to Web Layout
    // Company Logo Box (Blue background)
    pdf.setFillColor(37, 99, 235); // Blue-600 to match web
    pdf.rect(20, 15, 10, 10, 'F');
    
    // Company Logo Icon (White building icon)
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(8);
    pdf.text("🏢", 22, 22);
    
    // Company Name - Exact styling match
    pdf.setFontSize(16);
    pdf.setTextColor(37, 99, 235); // Blue-600
    pdf.text("Think Mybiz Accounting", 35, 21);
    
    pdf.setFontSize(8);
    pdf.setTextColor(107, 114, 128); // Gray-500
    pdf.text("Professional Invoice Management", 35, 26);
    
    // Company Contact Details - Compact layout
    pdf.setFontSize(7);
    pdf.setTextColor(75, 85, 99); // Gray-600
    pdf.text("info@thinkmybiz.com | +27 12 345 6789", 20, 32);
    pdf.text("PO Box 1234, Midrand, 1685", 20, 36);
    pdf.text("VAT #: 4455667788 | Reg: 2019/123456/07", 20, 40);

    // TAX INVOICE Title (Right Side) - Bold and large
    pdf.setFontSize(20);
    pdf.setTextColor(55, 65, 81); // Gray-700
    pdf.text("TAX INVOICE", pageWidth - 65, 22);
    
    // Invoice Details Box (Right Side) - Clean alignment
    pdf.setFontSize(8);
    pdf.setTextColor(75, 85, 99);
    pdf.text(`Invoice #: ${invoice.invoiceNumber}`, pageWidth - 65, 32);
    pdf.text(`Date: ${formatDate(invoice.createdAt || invoice.issueDate)}`, pageWidth - 65, 36);
    pdf.text(`Due: ${formatDate(invoice.dueDate)}`, pageWidth - 65, 40);
    
    // Status with proper color coding
    let statusColor = [107, 114, 128]; // Default gray
    const status = invoice.status.toUpperCase();
    if (status === 'PAID') statusColor = [34, 197, 94]; // Green
    else if (status === 'SENT') statusColor = [59, 130, 246]; // Blue
    else if (status === 'OVERDUE') statusColor = [239, 68, 68]; // Red
    
    pdf.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
    pdf.text(`Status: ${status}`, pageWidth - 65, 44);

    // Bill To and From Section - Exact Web Layout Match
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    pdf.text("Bill To:", 20, 58);
    pdf.text("From:", pageWidth/2 + 5, 58);
    
    // Bill To Details - Clean formatting
    pdf.setFontSize(9);
    pdf.setTextColor(0, 0, 0);
    pdf.text(invoice.customer.name.toUpperCase(), 20, 68);
    pdf.text(invoice.customer.email || "", 20, 74);
    pdf.text(invoice.customer.phone || "", 20, 80);
    
    // Handle address formatting properly
    let addressY = 86;
    if (invoice.customer.address) {
      pdf.text(invoice.customer.address, 20, addressY);
      addressY += 6;
    }
    
    if (invoice.customer.vatNumber) {
      pdf.text(`+${invoice.customer.vatNumber}`, 20, addressY);
      addressY += 6;
    }
    
    // Additional customer details if available
    if (invoice.customer.city || invoice.customer.postalCode) {
      pdf.text(`${invoice.customer.city || ''}, ${invoice.customer.postalCode || ''}`, 20, addressY);
    }

    // From Details (Company) - Right side
    pdf.text("Think Mybiz Accounting", pageWidth/2 + 5, 68);
    pdf.text("info@thinkmybiz.com", pageWidth/2 + 5, 74);
    pdf.text("+27 12 345 6789", pageWidth/2 + 5, 80);
    pdf.text("PO Box 1234, Midrand, 1685", pageWidth/2 + 5, 86);
    pdf.text("VAT #: 4455667788", pageWidth/2 + 5, 92);

    // Professional Items Table - Exact Web Match
    const tableStartY = 108;
    
    // Blue header row - matching web design
    pdf.setFillColor(59, 130, 246); // Blue-600
    pdf.rect(20, tableStartY, pageWidth - 40, 8, 'F');
    
    // Table Headers - precise spacing to match web
    pdf.setFontSize(8);
    pdf.setTextColor(255, 255, 255);
    pdf.text("#", 25, tableStartY + 5);
    pdf.text("Description", 35, tableStartY + 5);
    pdf.text("Qty", 105, tableStartY + 5);
    pdf.text("Unit Price", 125, tableStartY + 5);
    pdf.text("VAT Rate", 150, tableStartY + 5);
    pdf.text("Line VAT", 170, tableStartY + 5);
    pdf.text("Total", pageWidth - 25, tableStartY + 5);

    // Table Items - clean rows
    pdf.setTextColor(0, 0, 0);
    let currentY = tableStartY + 16;
    let lineNumber = 1;
    
    const items = (invoice as any).items || [];
    items.forEach((item: any) => {
      pdf.setFontSize(8);
      pdf.setTextColor(0, 0, 0);
      
      // Line number
      pdf.text(lineNumber.toString(), 25, currentY);
      
      // Description - clean format
      let description = item.description || item.name || "";
      if (description.length > 30) {
        description = description.substring(0, 27) + "...";
      }
      pdf.text(description, 35, currentY);
      
      // Quantity, prices, and totals - right aligned
      pdf.text((item.quantity || 1).toString(), 105, currentY);
      pdf.text(formatCurrency(item.unitPrice || 0), 125, currentY);
      pdf.text(`${item.vatRate || 15}.00%`, 150, currentY);
      pdf.text(formatCurrency(item.vatAmount || 0), 170, currentY);
      pdf.text(formatCurrency(item.total || 0), pageWidth - 25, currentY);
      
      currentY += 10;
      lineNumber++;
    });

    // Professional Totals Section - Right aligned like web
    const totalsStartY = currentY + 8;
    
    // Subtotal - clean formatting
    pdf.setFontSize(9);
    pdf.setTextColor(0, 0, 0);
    pdf.text("Subtotal:", pageWidth - 70, totalsStartY);
    pdf.text(formatCurrency(invoice.subtotal || 0), pageWidth - 25, totalsStartY);
    
    // VAT line
    pdf.text("VAT (15%):", pageWidth - 70, totalsStartY + 8);
    pdf.text(formatCurrency(invoice.vatAmount || 0), pageWidth - 25, totalsStartY + 8);
    
    // TOTAL with blue emphasis - matching web design
    pdf.setFontSize(11);
    pdf.setTextColor(37, 99, 235); // Blue-600 to match web
    pdf.text("TOTAL:", pageWidth - 70, totalsStartY + 18);
    pdf.text(formatCurrency(invoice.total || 0), pageWidth - 25, totalsStartY + 18);

    // Payment Status Section - Exact Web Match
    const paymentY = totalsStartY + 30;
    
    // Light background box for payment status
    pdf.setFillColor(248, 250, 252); // Light blue-gray background
    pdf.rect(20, paymentY, pageWidth - 40, 20, 'F');
    
    // Payment Status Icon and Title
    pdf.setFontSize(10);
    pdf.setTextColor(239, 68, 68); // Red color for status circle
    pdf.text("○ Payment Status", 25, paymentY + 8);
    
    // Status details on same line
    pdf.setFontSize(8);
    pdf.setTextColor(75, 85, 99);
    pdf.text(`${invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}`, 25, paymentY + 14);
    pdf.text("No payments received", 60, paymentY + 14);
    
    // Invoice Total and Outstanding Balance - aligned
    pdf.text("Invoice Total:", 25, paymentY + 18);
    pdf.text(formatCurrency(invoice.total || 0), 80, paymentY + 18);
    
    pdf.setTextColor(239, 68, 68); // Red for outstanding balance
    pdf.text("Outstanding Balance:", 120, paymentY + 18);
    pdf.text(formatCurrency(invoice.total || 0), 180, paymentY + 18);

    // Payment Details Section - Clean gray box
    const bankDetailsY = paymentY + 25;
    pdf.setFillColor(243, 244, 246); // Light gray background
    pdf.rect(20, bankDetailsY, pageWidth - 40, 18, 'F');
    
    pdf.setFontSize(9);
    pdf.setTextColor(0, 0, 0);
    pdf.text("Payment Details:", 25, bankDetailsY + 7);
    
    pdf.setFontSize(7);
    pdf.setTextColor(75, 85, 99);
    pdf.text("Bank: ABSA Bank | Account: 123456789 | Branch: 632005", 25, bankDetailsY + 12);
    pdf.text(`Reference: ${invoice.invoiceNumber}`, 25, bankDetailsY + 16);
    pdf.text("Please use the invoice number as your payment reference for quick allocation.", 25, bankDetailsY + 20);

    // Notes Section (if present) - matching web amber styling
    let notesY = bankDetailsY + 25;
    if (invoice.notes) {
      pdf.setFillColor(254, 243, 199); // Amber-100 background
      pdf.rect(20, notesY, pageWidth - 40, 12, 'F');
      
      pdf.setFontSize(8);
      pdf.setTextColor(0, 0, 0);
      pdf.text("Additional Notes:", 25, notesY + 6);
      
      pdf.setFontSize(7);
      pdf.setTextColor(75, 85, 99);
      pdf.text(invoice.notes, 25, notesY + 10);
      notesY += 18;
    }

    // Professional Footer - exactly matching web design
    const footerY = Math.max(notesY + 8, pageHeight - 20);
    pdf.setFontSize(6);
    pdf.setTextColor(156, 163, 175); // Gray-400
    pdf.text("Thank you for your business! For queries, contact info@thinkmybiz.com or call +27 12 345 6789.", 20, footerY);
    pdf.text("Company Reg: 2019/123456/07 | VAT: 4455667788 | Tax Clearance: Valid", 20, footerY + 3);
    pdf.text("This is a computer-generated document. No signature required.", 20, footerY + 6);

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