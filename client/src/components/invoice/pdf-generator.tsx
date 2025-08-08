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

// Fetch payment data for an invoice
async function fetchPaymentData(invoiceId: number) {
  try {
    const response = await fetch(`/api/invoices/${invoiceId}/payments`);
    if (!response.ok) return [];
    const payments = await response.json();
    return payments || [];
  } catch (error) {
    console.error('Error fetching payment data for PDF:', error);
    return [];
  }
}

export async function generateInvoicePDF(invoice: InvoiceWithCustomer): Promise<jsPDF> {
  // Fetch real payment data
  const payments = await fetchPaymentData(invoice.id);
  const totalPaid = payments
    .filter((p: any) => p.status === 'completed')
    .reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0);
  
  const invoiceTotal = parseFloat(invoice.total || '0');
  const outstandingBalance = Math.max(0, invoiceTotal - totalPaid);
  const isFullyPaid = totalPaid >= invoiceTotal;
  const isPartiallyPaid = totalPaid > 0 && totalPaid < invoiceTotal;
  
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

    // Right side - "TAX INVOICE" title matching React layout (right-aligned)
    pdf.setFontSize(20);
    pdf.setTextColor(55, 65, 81); // Gray-700 to match text-gray-800
    pdf.text("TAX INVOICE", pageWidth - 20, 25, { align: 'right' });
    
    // Invoice details exactly as in React component (right-aligned)
    pdf.setFontSize(8);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Invoice #: ${invoice.invoiceNumber}`, pageWidth - 20, 32, { align: 'right' });
    pdf.text(`Date: ${formatDate(invoice.createdAt || invoice.issueDate)}`, pageWidth - 20, 36, { align: 'right' });
    pdf.text(`Due: ${formatDate(invoice.dueDate)}`, pageWidth - 20, 40, { align: 'right' });
    
    // Status with exact color matching from React (right-aligned)
    let statusColor = [107, 114, 128]; // Default gray
    const status = invoice.status.toUpperCase();
    if (status === 'PAID') statusColor = [34, 197, 94]; // Green-500
    else if (status === 'SENT') statusColor = [59, 130, 246]; // Blue-500  
    else if (status === 'OVERDUE') statusColor = [239, 68, 68]; // Red-500
    else if (status === 'DRAFT') statusColor = [107, 114, 128]; // Gray-500
    
    pdf.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
    pdf.text(`Status: ${status}`, pageWidth - 20, 44, { align: 'right' });

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
    
    // Table header background - matching bg-blue-700 extending to payment box edge
    pdf.setFillColor(29, 78, 216); // Blue-700 exactly
    pdf.rect(20, tableStartY, pageWidth - 40, 10, 'F'); // Full width to match payment box alignment
    
    // Crystal white bold headers matching React component exactly
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "bold"); // Bold font for headers
    pdf.setTextColor(255, 255, 255); // Crystal white text
    pdf.text("#", 25, tableStartY + 6);
    pdf.text("Description", 35, tableStartY + 6);
    pdf.text("Qty", 85, tableStartY + 6, { align: 'right' });
    pdf.text("Unit Price", 120, tableStartY + 6, { align: 'right' });
    pdf.text("VAT Rate", 145, tableStartY + 6, { align: 'right' });
    pdf.text("Line VAT", 170, tableStartY + 6, { align: 'right' });
    pdf.text("Total", pageWidth - 25, tableStartY + 6, { align: 'right' }); // Adjusted to prevent cutoff

    // Table rows with improved spacing and alignment
    pdf.setTextColor(0, 0, 0);
    let currentY = tableStartY + 18; // More space after header
    
    const items = (invoice as any).items || [];
    items.forEach((item: any, index: number) => {
      // Hover background for alternate rows (matching hover:bg-blue-50)
      if (index % 2 === 1) {
        pdf.setFillColor(239, 246, 255); // Blue-50
        pdf.rect(20, currentY - 4, pageWidth - 40, 12, 'F'); // Better height
      }
      
      // Row border bottom (matching border-b border-gray-100) extending full width
      pdf.setDrawColor(243, 244, 246); // Gray-100
      pdf.line(20, currentY + 6, pageWidth - 20, currentY + 6); // Full width to match header
      
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal"); // Reset to normal font for data
      pdf.setTextColor(75, 85, 99); // Gray-600 for line numbers
      pdf.text((index + 1).toString(), 25, currentY);
      
      // Description with font-medium styling - show full text
      pdf.setTextColor(0, 0, 0);
      let description = item.description || "N/A";
      
      // Calculate available width for description (from position 35 to column 85)
      const maxDescriptionWidth = 45; // Available space in PDF units
      const currentFont = pdf.getFontList();
      
      // If description is too long, wrap it to multiple lines
      if (pdf.getTextWidth(description) > maxDescriptionWidth) {
        // Split text to fit in available width
        const words = description.split(' ');
        let line1 = '';
        let line2 = '';
        
        // Build first line
        for (let i = 0; i < words.length; i++) {
          const testLine = line1 + (line1 ? ' ' : '') + words[i];
          if (pdf.getTextWidth(testLine) > maxDescriptionWidth && line1) {
            // Start second line with remaining words
            line2 = words.slice(i).join(' ');
            break;
          } else {
            line1 = testLine;
          }
        }
        
        // Display first line
        pdf.text(line1, 35, currentY);
        
        // Display second line if it exists (with smaller font)
        if (line2) {
          pdf.setFontSize(7); // Smaller font for second line
          pdf.setTextColor(75, 85, 99); // Gray-600 for continuation
          pdf.text(line2.length > 35 ? line2.substring(0, 32) + '...' : line2, 35, currentY + 4);
          pdf.setFontSize(8); // Reset font size
          pdf.setTextColor(0, 0, 0); // Reset color
        }
      } else {
        // Description fits in one line
        pdf.text(description, 35, currentY);
      }
      
      // Professional data alignment matching optimized headers
      const qtyText = (item.quantity?.toString() || "1");
      pdf.text(qtyText, 85, currentY, { align: 'right' });
      
      const unitPriceText = formatCurrency(item.unitPrice || 0);
      pdf.text(unitPriceText, 120, currentY, { align: 'right' });
      
      const vatRateText = `${item.vatRate || 15}%`;
      pdf.text(vatRateText, 145, currentY, { align: 'right' });
      
      const lineVatText = formatCurrency(item.vatAmount || 0);
      pdf.text(lineVatText, 170, currentY, { align: 'right' });
      
      // Total aligned with subtotal for perfect visual flow
      const totalText = formatCurrency(item.total || 0);
      pdf.text(totalText, pageWidth - 20, currentY, { align: 'right' });
      
      currentY += 12; // Better row spacing
    });

    // EXACTLY MATCH REACT SUMMARY SECTION
    const summaryY = currentY + 20; // More space after table
    const summaryX = pageWidth - 90; // Better positioning
    const summaryWidth = 70; // Fixed width for alignment
    
    // Subtotal with proper alignment
    pdf.setFontSize(9);
    pdf.setTextColor(0, 0, 0);
    pdf.text("Subtotal:", summaryX, summaryY);
    const subtotalText = formatCurrency(invoice.subtotal || 0);
    const subtotalWidth = pdf.getTextWidth(subtotalText);
    pdf.text(subtotalText, summaryX + summaryWidth - subtotalWidth, summaryY);
    
    // VAT with proper alignment
    pdf.text("VAT (15%):", summaryX, summaryY + 8);
    const vatText = formatCurrency(invoice.vatAmount || 0);
    const vatWidth = pdf.getTextWidth(vatText);
    pdf.text(vatText, summaryX + summaryWidth - vatWidth, summaryY + 8);
    
    // Border line matching React (border-t border-gray-300)
    pdf.setDrawColor(209, 213, 219); // Gray-300
    pdf.setLineWidth(0.5);
    pdf.line(summaryX, summaryY + 12, summaryX + summaryWidth, summaryY + 12);
    
    // TOTAL with exact styling (font-bold text-lg and text-xl text-blue-700)
    pdf.setFontSize(11);
    pdf.setTextColor(0, 0, 0);
    pdf.text("TOTAL:", summaryX, summaryY + 20);
    
    pdf.setFontSize(13);
    pdf.setTextColor(29, 78, 216); // Blue-700 for total amount
    const totalText = formatCurrency(invoice.total || 0);
    const totalWidth = pdf.getTextWidth(totalText);
    pdf.text(totalText, summaryX + summaryWidth - totalWidth, summaryY + 20);

    // Payment Status Box - aligned with Total column for professional layout
    const paymentStatusY = summaryY + 30; // More space after summary
    const paymentStatusX = pageWidth - 85; // Align with Total amount column
    const paymentStatusWidth = 65; // Reduced width for better alignment
    const paymentStatusHeight = 35;
    
    // Payment Status Card background and border
    pdf.setFillColor(255, 255, 255); // White background
    pdf.setDrawColor(229, 231, 235); // Gray-200 border
    pdf.setLineWidth(0.5);
    pdf.rect(paymentStatusX, paymentStatusY, paymentStatusWidth, paymentStatusHeight, 'FD');
    
    // Payment Status Header with clean icon
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold"); // Bold font for header
    pdf.setTextColor(220, 38, 38); // Red-600 for icon
    pdf.text("●", paymentStatusX + 3, paymentStatusY + 7); // Clean bullet point icon
    
    pdf.setTextColor(0, 0, 0);
    pdf.text("Payment Status", paymentStatusX + 8, paymentStatusY + 7);
    
    // Status badge and message with real payment data
    pdf.setFontSize(7);
    pdf.setTextColor(107, 114, 128); // Gray-500
    const statusMessage = isFullyPaid ? 'Invoice is fully paid' : 
                         isPartiallyPaid ? 'Invoice is partially paid' : 'No payments received';
    pdf.text(`${invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}    ${statusMessage}`, paymentStatusX + 3, paymentStatusY + 12);
    
    // Payment breakdown background (matching bg-gray-50) - increased height for paid amount line
    const backgroundHeight = totalPaid > 0 ? 25 : 17;
    pdf.setFillColor(249, 250, 251); // Gray-50
    pdf.rect(paymentStatusX + 2, paymentStatusY + 15, paymentStatusWidth - 4, backgroundHeight, 'F');
    
    let currentPaymentY = paymentStatusY + 20;
    
    // Invoice Total
    pdf.setFontSize(7);
    pdf.setTextColor(0, 0, 0);
    pdf.text("Invoice Total:", paymentStatusX + 4, currentPaymentY);
    // Right-align the currency value
    const invoiceTotalText = formatCurrency(invoice.total || 0);
    const invoiceTotalWidth = pdf.getTextWidth(invoiceTotalText);
    pdf.text(invoiceTotalText, paymentStatusX + paymentStatusWidth - 4 - invoiceTotalWidth, currentPaymentY);
    
    currentPaymentY += 6;
    
    // Add "Amount Paid" line if there are payments
    if (totalPaid > 0) {
      pdf.setTextColor(0, 0, 0);
      pdf.text("Amount Paid:", paymentStatusX + 4, currentPaymentY);
      
      // Add background for better visibility of green paid amount
      const paidText = formatCurrency(totalPaid.toFixed(2));
      const paidWidth = pdf.getTextWidth(paidText);
      const paidX = paymentStatusX + paymentStatusWidth - 4 - paidWidth;
      
      // Light green background for paid amount
      pdf.setFillColor(220, 252, 231); // Green-100 background
      pdf.rect(paidX - 2, currentPaymentY - 4, paidWidth + 4, 6, 'F');
      
      // Green border for emphasis
      pdf.setDrawColor(34, 197, 94); // Green-500 border
      pdf.setLineWidth(0.5);
      pdf.rect(paidX - 2, currentPaymentY - 4, paidWidth + 4, 6, 'S');
      
      // Green text on background
      pdf.setTextColor(21, 128, 61); // Green-700 for better contrast on light background
      pdf.text(paidText, paidX, currentPaymentY);
      currentPaymentY += 6;
      
      // Add separator line before outstanding balance
      pdf.setDrawColor(209, 213, 219); // Gray-300
      pdf.setLineWidth(0.3);
      pdf.line(paymentStatusX + 4, currentPaymentY - 2, paymentStatusX + paymentStatusWidth - 4, currentPaymentY - 2);
      currentPaymentY += 2;
    }
    
    // Outstanding Balance with real calculation
    pdf.setTextColor(0, 0, 0);
    pdf.text("Outstanding Balance:", paymentStatusX + 4, currentPaymentY);
    
    // Color coding for outstanding balance
    if (isFullyPaid) {
      pdf.setTextColor(34, 197, 94); // Green-500 when fully paid
    } else {
      pdf.setTextColor(185, 28, 28); // Red-700 for outstanding amount
    }
    
    pdf.setFontSize(8);
    // Right-align the outstanding balance amount
    const outstandingText = formatCurrency(outstandingBalance.toFixed(2));
    const outstandingWidth = pdf.getTextWidth(outstandingText);
    pdf.text(outstandingText, paymentStatusX + paymentStatusWidth - 4 - outstandingWidth, currentPaymentY);

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

    // Terms & Conditions Section
    const termsY = notesY + 10;
    pdf.setFontSize(8);
    pdf.setTextColor(75, 85, 99); // Gray-600
    pdf.text("Payment due within 30 days. Late payments may incur interest.", 20, termsY);
    
    // Professional Signature Line
    const signatureY = termsY + 15;
    pdf.setFontSize(8);
    pdf.setTextColor(0, 0, 0);
    pdf.text("_____________________________", 20, signatureY);
    pdf.setFontSize(7);
    pdf.setTextColor(75, 85, 99); // Gray-600
    pdf.text("Authorized Signature", 20, signatureY + 6);
    
    // EXACT MATCH - Footer (text-xs text-gray-400 border-t)
    const footerY = Math.max(signatureY + 20, pageHeight - 30);
    
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