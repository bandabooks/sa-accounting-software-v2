import jsPDF from "jspdf";

const formatDate = (dateStr: string | Date) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric'
  });
};

const formatCurrency = (amount: string | number): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2,
  }).format(isNaN(numAmount) ? 0 : numAmount);
};

interface EstimateWithCustomer {
  id: number;
  estimateNumber: string;
  issueDate: string;
  expiryDate: string;
  status: string;
  subtotal: number;
  vatAmount: number;
  total: number;
  notes?: string;
  customer: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    vatNumber?: string;
  };
  items: Array<{
    id: number;
    description: string;
    quantity: number;
    unitPrice: number;
    vatRate: number;
    total: number;
  }>;
}

export function generateEstimatePDF(estimate: EstimateWithCustomer): Promise<jsPDF> {
  return new Promise((resolve) => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Header Section
    pdf.setFillColor(59, 130, 246); // Blue-600
    pdf.rect(20, 20, 10, 10, 'F');
    
    // White building icon representation
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(8);
    pdf.text("⬛", 22, 27);
    
    // Company name
    pdf.setFontSize(16);
    pdf.setTextColor(29, 78, 216); // Blue-700
    pdf.text("Think Mybiz Accounting", 35, 25);
    
    // Subtitle
    pdf.setFontSize(8);
    pdf.setTextColor(107, 114, 128); // Gray-500
    pdf.text("Professional Estimate Management", 35, 29);
    
    // Company contact details
    pdf.setFontSize(7);
    pdf.setTextColor(75, 85, 99); // Gray-600
    pdf.text("info@thinkmybiz.com | +27 12 345 6789", 20, 35);
    pdf.text("PO Box 1234, Midrand, 1685", 20, 38);
    pdf.text("VAT #: 4455667788 | Reg: 2019/123456/07", 20, 41);

    // Right side - "ESTIMATE" title
    pdf.setFontSize(20);
    pdf.setTextColor(55, 65, 81); // Gray-700
    pdf.text("ESTIMATE", pageWidth - 20, 25, { align: 'right' });
    
    // Estimate details
    pdf.setFontSize(8);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Estimate #: ${estimate.estimateNumber}`, pageWidth - 20, 32, { align: 'right' });
    pdf.text(`Date: ${formatDate(estimate.issueDate)}`, pageWidth - 20, 36, { align: 'right' });
    pdf.text(`Valid Until: ${formatDate(estimate.expiryDate)}`, pageWidth - 20, 40, { align: 'right' });
    
    // Status with color
    let statusColor = [107, 114, 128]; // Default gray
    const status = estimate.status.toUpperCase();
    if (status === 'ACCEPTED') statusColor = [34, 197, 94]; // Green-500
    else if (status === 'SENT') statusColor = [59, 130, 246]; // Blue-500  
    else if (status === 'REJECTED') statusColor = [239, 68, 68]; // Red-500
    else if (status === 'EXPIRED') statusColor = [239, 68, 68]; // Red-500
    else if (status === 'DRAFT') statusColor = [107, 114, 128]; // Gray-500
    
    pdf.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
    pdf.text(`Status: ${status}`, pageWidth - 20, 44, { align: 'right' });

    // Addresses Section
    const addressY = 55;
    
    // "Bill To" - Customer address (left side)
    pdf.setFontSize(9);
    pdf.setTextColor(0, 0, 0);
    pdf.text("Estimate For:", 20, addressY);
    
    pdf.setFontSize(8);
    pdf.setTextColor(75, 85, 99);
    let customerY = addressY + 6;
    
    // Customer name
    pdf.setTextColor(0, 0, 0);
    pdf.text(estimate.customer.name, 20, customerY);
    customerY += 4;
    
    // Customer contact details
    pdf.setTextColor(75, 85, 99);
    if (estimate.customer.email) {
      pdf.text(estimate.customer.email, 20, customerY);
      customerY += 4;
    }
    if (estimate.customer.phone) {
      pdf.text(estimate.customer.phone, 20, customerY);
      customerY += 4;
    }
    if (estimate.customer.address) {
      pdf.text(estimate.customer.address, 20, customerY);
      customerY += 4;
      if (estimate.customer.city || estimate.customer.postalCode) {
        const cityPostal = [estimate.customer.city, estimate.customer.postalCode].filter(Boolean).join(' ');
        pdf.text(cityPostal, 20, customerY);
        customerY += 4;
      }
    }
    if (estimate.customer.vatNumber) {
      pdf.text(`VAT: ${estimate.customer.vatNumber}`, 20, customerY);
    }

    // Items Table
    const tableY = Math.max(customerY + 15, 95);
    
    // Table headers
    pdf.setFontSize(8);
    pdf.setTextColor(0, 0, 0);
    pdf.setFillColor(248, 250, 252); // Gray-50 background
    pdf.rect(20, tableY, pageWidth - 40, 8, 'F');
    
    pdf.text("Description", 22, tableY + 5);
    pdf.text("Qty", pageWidth - 80, tableY + 5, { align: 'center' });
    pdf.text("Unit Price", pageWidth - 60, tableY + 5, { align: 'center' });
    pdf.text("VAT %", pageWidth - 40, tableY + 5, { align: 'center' });
    pdf.text("Total", pageWidth - 22, tableY + 5, { align: 'right' });
    
    // Table items
    let itemY = tableY + 12;
    pdf.setTextColor(75, 85, 99);
    
    estimate.items.forEach((item) => {
      if (itemY > pageHeight - 50) {
        pdf.addPage();
        itemY = 20;
      }
      
      // Description (with text wrapping for long descriptions)
      const description = item.description;
      if (description.length > 35) {
        const lines = pdf.splitTextToSize(description, 80);
        pdf.text(lines[0], 22, itemY);
        if (lines.length > 1) {
          pdf.setFontSize(7);
          pdf.text(lines[1], 22, itemY + 3);
          pdf.setFontSize(8);
        }
      } else {
        pdf.text(description, 22, itemY);
      }
      
      // Quantity (centered)
      pdf.text(item.quantity.toString(), pageWidth - 80, itemY, { align: 'center' });
      
      // Unit Price (centered)
      pdf.text(formatCurrency(item.unitPrice), pageWidth - 60, itemY, { align: 'center' });
      
      // VAT Rate (centered)
      pdf.text(`${item.vatRate}%`, pageWidth - 40, itemY, { align: 'center' });
      
      // Total (right-aligned)
      pdf.text(formatCurrency(item.total), pageWidth - 22, itemY, { align: 'right' });
      
      itemY += 8;
    });

    // Summary Section
    const summaryY = itemY + 10;
    const summaryX = pageWidth - 80;
    
    // Summary background
    pdf.setFillColor(248, 250, 252);
    pdf.rect(summaryX - 5, summaryY - 5, 85, 25, 'F');
    
    pdf.setFontSize(8);
    pdf.setTextColor(0, 0, 0);
    
    // Subtotal
    pdf.text("Subtotal:", summaryX, summaryY);
    pdf.text(formatCurrency(estimate.subtotal), pageWidth - 22, summaryY, { align: 'right' });
    
    // VAT
    pdf.text("VAT:", summaryX, summaryY + 5);
    pdf.text(formatCurrency(estimate.vatAmount), pageWidth - 22, summaryY + 5, { align: 'right' });
    
    // Line above total
    pdf.setLineWidth(0.5);
    pdf.line(summaryX, summaryY + 8, pageWidth - 22, summaryY + 8);
    
    // Total (bold)
    pdf.setFontSize(10);
    pdf.text("Total:", summaryX, summaryY + 13);
    pdf.text(formatCurrency(estimate.total), pageWidth - 22, summaryY + 13, { align: 'right' });

    // Notes section
    if (estimate.notes) {
      const notesY = summaryY + 25;
      pdf.setFontSize(9);
      pdf.setTextColor(0, 0, 0);
      pdf.text("Notes:", 20, notesY);
      
      pdf.setFontSize(8);
      pdf.setTextColor(75, 85, 99);
      const notesLines = pdf.splitTextToSize(estimate.notes, pageWidth - 40);
      pdf.text(notesLines, 20, notesY + 5);
    }

    // Footer
    const footerY = pageHeight - 25;
    pdf.setLineWidth(0.5);
    pdf.setDrawColor(229, 231, 235);
    pdf.line(20, footerY, pageWidth - 20, footerY);
    
    pdf.setFontSize(7);
    pdf.setTextColor(107, 114, 128);
    pdf.text("Thank you for your business!", 20, footerY + 5);
    pdf.text(`Estimate ${estimate.estimateNumber} | Generated on ${formatDate(new Date())}`, pageWidth - 20, footerY + 5, { align: 'right' });
    pdf.text("This is a computer-generated document. No signature required.", 20, footerY + 8);

    resolve(pdf);
  });
}