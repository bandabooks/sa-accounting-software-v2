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

    // EXACT MATCH TO REACT LAYOUT - Header Section
    // Company logo area with gradient background (matches Building2 icon + gradient)
    pdf.setFillColor(59, 130, 246); // Blue-600 to match gradient start
    pdf.rect(20, 20, 10, 10, 'F');
    
    // White building icon representation
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(8);
    pdf.text("⬛", 22, 27);
    
    // Company name exactly as in React - "Think Mybiz Accounting" with blue-700 color
    pdf.setFontSize(16);
    pdf.setTextColor(29, 78, 216); // Blue-700 to match text-blue-700
    pdf.text("Think Mybiz Accounting", 35, 25);
    
    // Subtitle exactly as in React - "Professional Invoice Management" 
    pdf.setFontSize(8);
    pdf.setTextColor(107, 114, 128); // Gray-500 to match text-gray-500
    pdf.text("Professional Invoice Management", 35, 29);
    
    // Company contact details matching React layout spacing
    pdf.setFontSize(7);
    pdf.setTextColor(75, 85, 99); // Gray-600 to match text-gray-600
    pdf.text("info@thinkmybiz.com | +27 12 345 6789", 20, 35);
    pdf.text("PO Box 1234, Midrand, 1685", 20, 38);
    pdf.text("VAT #: 4455667788 | Reg: 2019/123456/07", 20, 41);

    // Right side - "TAX INVOICE" title matching React layout
    pdf.setFontSize(20);
    pdf.setTextColor(55, 65, 81); // Gray-700 to match text-gray-800
    pdf.text("TAX INVOICE", pageWidth - 65, 25);
    
    // Invoice details exactly as in React component
    pdf.setFontSize(8);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Invoice #: ${invoice.invoiceNumber}`, pageWidth - 65, 32);
    pdf.text(`Date: ${formatDate(invoice.createdAt || invoice.issueDate)}`, pageWidth - 65, 36);
    pdf.text(`Due: ${formatDate(invoice.dueDate)}`, pageWidth - 65, 40);
    
    // Status with exact color matching from React
    let statusColor = [107, 114, 128]; // Default gray
    const status = invoice.status.toUpperCase();
    if (status === 'PAID') statusColor = [34, 197, 94]; // Green-500
    else if (status === 'SENT') statusColor = [59, 130, 246]; // Blue-500  
    else if (status === 'OVERDUE') statusColor = [239, 68, 68]; // Red-500
    else if (status === 'DRAFT') statusColor = [107, 114, 128]; // Gray-500
    
    pdf.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
    pdf.text(`Status: ${status}`, pageWidth - 65, 44);

    // EXACT MATCH - Addresses Section (grid-cols-2 gap-8)
    const addressY = 55;
    
    // Bill To section with underline border exactly as React
    pdf.setFontSize(9);
    pdf.setTextColor(55, 65, 81); // Gray-700 for headers
    pdf.text("Bill To:", 20, addressY);
    // Draw underline to match border-b border-gray-200
    pdf.setDrawColor(229, 231, 235); // Gray-200
    pdf.line(20, addressY + 1, 60, addressY + 1);
    
    // From section with underline
    pdf.text("From:", pageWidth/2, addressY);
    pdf.line(pageWidth/2, addressY + 1, pageWidth/2 + 40, addressY + 1);
    
    // Bill To details exactly as React layout
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    pdf.text(invoice.customer.name, 20, addressY + 8); // font-bold text-lg
    
    pdf.setFontSize(8);
    if (invoice.customer.email) {
      pdf.text(invoice.customer.email, 20, addressY + 13);
    }
    if (invoice.customer.phone) {
      pdf.text(invoice.customer.phone, 20, addressY + 17);
    }
    if (invoice.customer.address) {
      let addressLine = invoice.customer.address;
      if (invoice.customer.city) addressLine += `, ${invoice.customer.city}`;
      if (invoice.customer.postalCode) addressLine += `, ${invoice.customer.postalCode}`;
      pdf.text(addressLine, 20, addressY + 21);
    }
    if (invoice.customer.vatNumber) {
      pdf.setTextColor(107, 114, 128); // Gray-500 for VAT number
      pdf.text(`VAT #: ${invoice.customer.vatNumber}`, 20, addressY + 26);
    }

    // From details (company) exactly as React
    pdf.setFontSize(9);
    pdf.setTextColor(0, 0, 0);
    pdf.text("Think Mybiz Accounting", pageWidth/2, addressY + 8);
    
    pdf.setFontSize(8);
    pdf.text("info@thinkmybiz.com", pageWidth/2, addressY + 13);
    pdf.text("+27 12 345 6789", pageWidth/2, addressY + 17);
    pdf.text("PO Box 1234, Midrand, 1685", pageWidth/2, addressY + 21);
    pdf.setTextColor(107, 114, 128); // Gray-500
    pdf.text("VAT #: 4455667788", pageWidth/2, addressY + 26);

    // EXACTLY MATCH REACT TABLE - Items Table with blue-700 header
    const tableStartY = 90;
    
    // Table header background - matching bg-blue-700
    pdf.setFillColor(29, 78, 216); // Blue-700 exactly
    pdf.rect(20, tableStartY, pageWidth - 40, 8, 'F');
    
    // Table headers exactly as React with proper alignment
    pdf.setFontSize(8);
    pdf.setTextColor(255, 255, 255); // White text
    pdf.text("#", 23, tableStartY + 5);
    pdf.text("Description", 30, tableStartY + 5);
    pdf.text("Qty", 105, tableStartY + 5);
    pdf.text("Unit Price", 125, tableStartY + 5);
    pdf.text("VAT Rate", 155, tableStartY + 5);
    pdf.text("Line VAT", 175, tableStartY + 5);
    pdf.text("Total", pageWidth - 30, tableStartY + 5);

    // Table rows exactly matching React layout
    pdf.setTextColor(0, 0, 0);
    let currentY = tableStartY + 15;
    
    const items = (invoice as any).items || [];
    items.forEach((item: any, index: number) => {
      // Hover background for alternate rows (matching hover:bg-blue-50)
      if (index % 2 === 1) {
        pdf.setFillColor(239, 246, 255); // Blue-50
        pdf.rect(20, currentY - 3, pageWidth - 40, 8, 'F');
      }
      
      // Row border bottom (matching border-b border-gray-100)
      pdf.setDrawColor(243, 244, 246); // Gray-100
      pdf.line(20, currentY + 5, pageWidth - 20, currentY + 5);
      
      pdf.setFontSize(8);
      pdf.setTextColor(75, 85, 99); // Gray-600 for line numbers
      pdf.text((index + 1).toString(), 23, currentY);
      
      // Description with font-medium styling
      pdf.setTextColor(0, 0, 0);
      let description = item.description || "N/A";
      if (description.length > 30) {
        description = description.substring(0, 27) + "...";
      }
      pdf.text(description, 30, currentY);
      
      // Center-aligned quantity
      pdf.text(item.quantity?.toString() || "1", 107, currentY);
      
      // Right-aligned unit price
      pdf.text(formatCurrency(item.unitPrice || 0), 145, currentY);
      
      // Center-aligned VAT rate
      pdf.text(`${item.vatRate || 15}%`, 160, currentY);
      
      // Right-aligned line VAT
      pdf.text(formatCurrency(item.vatAmount || 0), 185, currentY);
      
      // Right-aligned total with font-medium
      pdf.text(formatCurrency(item.total || 0), pageWidth - 25, currentY);
      
      currentY += 10;
    });

    // EXACTLY MATCH REACT SUMMARY SECTION
    const summaryY = currentY + 15;
    const summaryX = pageWidth - 85; // Right-aligned like React (max-w-sm)
    
    // Subtotal
    pdf.setFontSize(9);
    pdf.setTextColor(0, 0, 0);
    pdf.text("Subtotal:", summaryX, summaryY);
    pdf.text(formatCurrency(invoice.subtotal || 0), pageWidth - 25, summaryY);
    
    // VAT
    pdf.text("VAT (15%):", summaryX, summaryY + 6);
    pdf.text(formatCurrency(invoice.vatAmount || 0), pageWidth - 25, summaryY + 6);
    
    // Border line matching React (border-t border-gray-300)
    pdf.setDrawColor(209, 213, 219); // Gray-300
    pdf.line(summaryX, summaryY + 10, pageWidth - 20, summaryY + 10);
    
    // TOTAL with exact styling (font-bold text-lg and text-xl text-blue-700)
    pdf.setFontSize(11);
    pdf.setTextColor(0, 0, 0);
    pdf.text("TOTAL:", summaryX, summaryY + 16);
    
    pdf.setFontSize(13);
    pdf.setTextColor(29, 78, 216); // Blue-700 for total amount
    pdf.text(formatCurrency(invoice.total || 0), pageWidth - 25, summaryY + 16);

    // EXACT MATCH - Payment Status Box (matching PaymentStatusSummary component)
    const paymentStatusY = summaryY + 25;
    const paymentStatusX = summaryX - 10; // Align with summary section
    const paymentStatusWidth = 75;
    const paymentStatusHeight = 35;
    
    // Payment Status Card background and border
    pdf.setFillColor(255, 255, 255); // White background
    pdf.setDrawColor(229, 231, 235); // Gray-200 border
    pdf.setLineWidth(0.5);
    pdf.rect(paymentStatusX, paymentStatusY, paymentStatusWidth, paymentStatusHeight, 'FD');
    
    // Payment Status Header with AlertCircle icon
    pdf.setFontSize(9);
    pdf.setTextColor(220, 38, 38); // Red-600 for AlertCircle
    pdf.text("○", paymentStatusX + 3, paymentStatusY + 7); // Circle representing AlertCircle icon
    
    pdf.setTextColor(0, 0, 0);
    pdf.text("Payment Status", paymentStatusX + 8, paymentStatusY + 7);
    
    // Status badge and message
    pdf.setFontSize(7);
    pdf.setTextColor(107, 114, 128); // Gray-500
    const statusMessage = invoice.status === 'paid' ? 'Invoice is fully paid' : 
                         invoice.status === 'sent' ? 'Invoice is sent' : 'No payments received';
    pdf.text(`${invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}    ${statusMessage}`, paymentStatusX + 3, paymentStatusY + 12);
    
    // Payment breakdown background (matching bg-gray-50)
    pdf.setFillColor(249, 250, 251); // Gray-50
    pdf.rect(paymentStatusX + 2, paymentStatusY + 15, paymentStatusWidth - 4, 17, 'F');
    
    // Invoice Total
    pdf.setFontSize(7);
    pdf.setTextColor(0, 0, 0);
    pdf.text("Invoice Total:", paymentStatusX + 4, paymentStatusY + 20);
    pdf.text(formatCurrency(invoice.total || 0), paymentStatusX + paymentStatusWidth - 5, paymentStatusY + 20);
    
    // Outstanding Balance (assuming no payments for now)
    const totalAmount = parseFloat(invoice.total || '0');
    pdf.text("Outstanding Balance:", paymentStatusX + 4, paymentStatusY + 28);
    pdf.setTextColor(185, 28, 28); // Red-700 for outstanding amount
    pdf.setFontSize(8);
    pdf.text(formatCurrency(totalAmount.toFixed(2)), paymentStatusX + paymentStatusWidth - 5, paymentStatusY + 28);

    // EXACT MATCH - Payment Instructions Section (bg-gray-100 rounded-lg)
    const paymentY = paymentStatusY + paymentStatusHeight + 10;
    pdf.setFillColor(243, 244, 246); // Gray-100 background
    pdf.rect(20, paymentY, pageWidth - 40, 20, 'F');
    
    pdf.setFontSize(9);
    pdf.setTextColor(55, 65, 81); // Gray-700 for header
    pdf.text("Payment Details:", 25, paymentY + 6);
    
    pdf.setFontSize(8);
    pdf.setTextColor(0, 0, 0);
    pdf.text("Bank: ABSA Bank | Account: 123456789 | Branch: 632005", 25, paymentY + 11);
    pdf.text(`Reference: ${invoice.invoiceNumber}`, 25, paymentY + 15);
    
    pdf.setFontSize(7);
    pdf.setTextColor(75, 85, 99); // Gray-600
    pdf.text("Please use the invoice number as your payment reference for quick allocation.", 25, paymentY + 19);

    // EXACT MATCH - Notes Section (if present) - bg-amber-50 border-amber-200
    let notesY = paymentY + 25;
    if (invoice.notes && invoice.notes.trim()) {
      pdf.setFillColor(255, 251, 235); // Amber-50
      pdf.setDrawColor(251, 191, 36); // Amber-200 for border
      pdf.rect(20, notesY, pageWidth - 40, 15, 'FD');
      
      pdf.setFontSize(9);
      pdf.setTextColor(55, 65, 81); // Gray-700
      pdf.text("Additional Notes:", 25, notesY + 6);
      
      pdf.setFontSize(8);
      pdf.setTextColor(55, 65, 81); // Gray-700
      pdf.text(invoice.notes, 25, notesY + 11);
      notesY += 20;
    }

    // EXACT MATCH - Footer (text-xs text-gray-400 border-t)
    const footerY = Math.max(notesY + 10, pageHeight - 30);
    
    // Border top line
    pdf.setDrawColor(229, 231, 235); // Gray-200
    pdf.line(20, footerY - 3, pageWidth - 20, footerY - 3);
    
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