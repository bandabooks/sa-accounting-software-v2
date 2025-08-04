import jsPDF from 'jspdf';

// Helper functions for formatting
function formatCurrency(amount: number): string {
  return `R ${amount.toFixed(2)}`;
}

function formatDate(date: string | Date): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: '2-digit',  
    day: '2-digit'
  });
}

export interface EstimateWithCustomer {
  id: number;
  estimateNumber: string;
  issueDate: string;
  expiryDate: string;
  status: string;
  subtotal: number;
  vatAmount: number;
  total: number;
  notes?: string;
  terms?: string;
  customer: {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  items: Array<{
    id: number;
    description: string;
    quantity: number;
    unitPrice: number;
    vatType: string;
    lineTotal: number;
  }>;
}

export function generateEstimatePDF(estimate: EstimateWithCustomer): Promise<jsPDF> {
  return new Promise((resolve) => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // HEADER SECTION - Company branding with emerald theme
    // Company logo area with emerald gradient background
    pdf.setFillColor(16, 185, 129); // Emerald-500 to match emerald theme
    pdf.rect(20, 20, 10, 10, 'F');
    
    // White building icon representation
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(8);
    pdf.text("⬛", 22, 27);
    
    // Company name with emerald-700 color for estimates
    pdf.setFontSize(16);
    pdf.setTextColor(4, 120, 87); // Emerald-700 to match emerald theme
    pdf.text("Think Mybiz Accounting", 35, 25);
    
    // Subtitle for estimates
    pdf.setFontSize(8);
    pdf.setTextColor(107, 114, 128); // Gray-500 
    pdf.text("Professional Estimate Management", 35, 29);
    
    // Company contact details
    pdf.setFontSize(7);
    pdf.setTextColor(75, 85, 99); // Gray-600
    pdf.text("info@thinkmybiz.com | +27 12 345 6789", 20, 35);
    pdf.text("PO Box 1234, Midrand, 1685", 20, 38);
    pdf.text("VAT #: 4455667788 | Reg: 2019/123456/07", 20, 41);

    // Right side - "ESTIMATE" title (right-aligned)
    pdf.setFontSize(20);
    pdf.setTextColor(55, 65, 81); // Gray-700
    pdf.text("ESTIMATE", pageWidth - 20, 25, { align: 'right' });
    
    // Estimate details (right-aligned)
    pdf.setFontSize(8);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Estimate #: ${estimate.estimateNumber}`, pageWidth - 20, 32, { align: 'right' });
    pdf.text(`Date: ${formatDate(estimate.issueDate)}`, pageWidth - 20, 36, { align: 'right' });
    pdf.text(`Valid Until: ${formatDate(estimate.expiryDate)}`, pageWidth - 20, 40, { align: 'right' });
    
    // Status with appropriate color matching
    let statusColor = [107, 114, 128]; // Default gray
    const status = estimate.status.toUpperCase();
    if (status === 'ACCEPTED') statusColor = [34, 197, 94]; // Green-500
    else if (status === 'SENT') statusColor = [16, 185, 129]; // Emerald-500
    else if (status === 'EXPIRED') statusColor = [239, 68, 68]; // Red-500
    else if (status === 'DRAFT') statusColor = [107, 114, 128]; // Gray-500
    
    pdf.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
    pdf.text(`Status: ${status}`, pageWidth - 20, 44, { align: 'right' });

    // ADDRESSES SECTION
    const addressY = 55;
    
    // Estimate For section with underline
    pdf.setFontSize(9);
    pdf.setTextColor(55, 65, 81); // Gray-700 for headers
    pdf.text("Estimate For:", 20, addressY);
    pdf.setDrawColor(229, 231, 235); // Gray-200
    pdf.line(20, addressY + 1, 70, addressY + 1);
    
    // From section with underline
    pdf.text("From:", pageWidth/2, addressY);
    pdf.line(pageWidth/2, addressY + 1, pageWidth/2 + 40, addressY + 1);
    
    // Customer details
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    let customerY = addressY + 8;
    
    pdf.setTextColor(17, 24, 39); // Gray-900 for customer name
    pdf.text(estimate.customer.name, 20, customerY);
    customerY += 5;
    
    if (estimate.customer.email) {
      pdf.setTextColor(75, 85, 99); // Gray-600 for details
      pdf.text(estimate.customer.email, 20, customerY);
      customerY += 4;
    }
    
    if (estimate.customer.phone) {
      pdf.text(estimate.customer.phone, 20, customerY);
      customerY += 4;
    }
    
    if (estimate.customer.address) {
      const addressLines = estimate.customer.address.split('\n');
      addressLines.forEach(line => {
        pdf.text(line, 20, customerY);
        customerY += 4;
      });
    }
    
    // Company details (From section)
    let companyY = addressY + 8;
    pdf.setTextColor(17, 24, 39); // Gray-900
    pdf.text("Think Mybiz Accounting", pageWidth/2, companyY);
    companyY += 5;
    
    pdf.setTextColor(75, 85, 99); // Gray-600
    pdf.text("info@thinkmybiz.com", pageWidth/2, companyY);
    companyY += 4;
    pdf.text("+27 12 345 6789", pageWidth/2, companyY);
    companyY += 4;
    pdf.text("PO Box 1234, Midrand, 1685", pageWidth/2, companyY);

    // ITEMS TABLE
    const tableStartY = Math.max(customerY, companyY) + 15;
    
    // Table header with emerald theme
    pdf.setFillColor(240, 253, 250); // Emerald-50 background
    pdf.rect(20, tableStartY, pageWidth - 40, 12, 'F');
    
    pdf.setFontSize(8);
    pdf.setTextColor(4, 120, 87); // Emerald-700 for headers
    
    // Header text
    pdf.text("#", 25, tableStartY + 8);
    pdf.text("Description", 35, tableStartY + 8);
    pdf.text("Qty", 110, tableStartY + 8);
    pdf.text("Unit Price", 130, tableStartY + 8);
    pdf.text("VAT Rate", 155, tableStartY + 8);
    pdf.text("Amount", pageWidth - 25, tableStartY + 8, { align: 'right' });
    
    // Table border
    pdf.setDrawColor(209, 213, 219); // Gray-300
    pdf.setLineWidth(0.3);
    pdf.rect(20, tableStartY, pageWidth - 40, 12);
    
    // Table content
    let currentY = tableStartY + 12;
    pdf.setTextColor(0, 0, 0);
    
    estimate.items.forEach((item, index) => {
      const rowHeight = 10;
      
      // Alternating row colors
      if (index % 2 === 1) {
        pdf.setFillColor(249, 250, 251); // Gray-50
        pdf.rect(20, currentY, pageWidth - 40, rowHeight, 'F');
      }
      
      pdf.setFontSize(7);
      
      // Item number
      pdf.text((index + 1).toString(), 25, currentY + 6);
      
      // Description (wrap if too long)
      const maxDescWidth = 70;
      const description = item.description;
      if (pdf.getTextWidth(description) > maxDescWidth) {
        const words = description.split(' ');
        let line = '';
        let lineY = currentY + 6;
        
        for (let i = 0; i < words.length; i++) {
          const testLine = line + words[i] + ' ';
          if (pdf.getTextWidth(testLine) > maxDescWidth && line !== '') {
            pdf.text(line, 35, lineY);
            line = words[i] + ' ';
            lineY += 3;
          } else {
            line = testLine;
          }
        }
        pdf.text(line, 35, lineY);
      } else {
        pdf.text(description, 35, currentY + 6);
      }
      
      // Quantity
      pdf.text(item.quantity.toString(), 115, currentY + 6, { align: 'right' });
      
      // Unit Price
      pdf.text(formatCurrency(item.unitPrice), 150, currentY + 6, { align: 'right' });
      
      // VAT Rate
      const vatRate = item.vatType === 'standard' ? '15%' : '0%';
      pdf.text(vatRate, 170, currentY + 6, { align: 'right' });
      
      // Line Total
      pdf.text(formatCurrency(item.lineTotal), pageWidth - 25, currentY + 6, { align: 'right' });
      
      // Row border
      pdf.setDrawColor(229, 231, 235); // Gray-200
      pdf.line(20, currentY + rowHeight, pageWidth - 20, currentY + rowHeight);
      
      currentY += rowHeight;
    });

    // SUMMARY SECTION with emerald theme
    const summaryY = currentY + 20;
    const summaryX = pageWidth - 90;
    const summaryWidth = 70;
    
    // Subtotal
    pdf.setFontSize(9);
    pdf.setTextColor(0, 0, 0);
    pdf.text("Subtotal:", summaryX, summaryY);
    const subtotalText = formatCurrency(estimate.subtotal || 0);
    const subtotalWidth = pdf.getTextWidth(subtotalText);
    pdf.text(subtotalText, summaryX + summaryWidth - subtotalWidth, summaryY);
    
    // VAT
    pdf.text("VAT (15%):", summaryX, summaryY + 8);
    const vatText = formatCurrency(estimate.vatAmount || 0);
    const vatWidth = pdf.getTextWidth(vatText);
    pdf.text(vatText, summaryX + summaryWidth - vatWidth, summaryY + 8);
    
    // Border line
    pdf.setDrawColor(209, 213, 219); // Gray-300
    pdf.setLineWidth(0.5);
    pdf.line(summaryX, summaryY + 12, summaryX + summaryWidth, summaryY + 12);
    
    // TOTAL with emerald color theme
    pdf.setFontSize(11);
    pdf.setTextColor(0, 0, 0);
    pdf.text("TOTAL:", summaryX, summaryY + 20);
    
    pdf.setFontSize(13);
    pdf.setTextColor(4, 120, 87); // Emerald-700 for total amount
    const totalText = formatCurrency(estimate.total || 0);
    const totalWidth = pdf.getTextWidth(totalText);
    pdf.text(totalText, summaryX + summaryWidth - totalWidth, summaryY + 20);

    // NOTES AND TERMS SECTION
    let footerY = summaryY + 40;
    
    if (estimate.notes) {
      pdf.setFontSize(8);
      pdf.setTextColor(55, 65, 81); // Gray-700
      pdf.text("Notes:", 20, footerY);
      footerY += 5;
      
      pdf.setTextColor(75, 85, 99); // Gray-600
      const noteLines = estimate.notes.split('\n');
      noteLines.forEach(line => {
        pdf.text(line, 20, footerY);
        footerY += 4;
      });
      footerY += 5;
    }
    
    if (estimate.terms) {
      pdf.setFontSize(8);
      pdf.setTextColor(55, 65, 81); // Gray-700
      pdf.text("Terms & Conditions:", 20, footerY);
      footerY += 5;
      
      pdf.setTextColor(75, 85, 99); // Gray-600
      const termLines = estimate.terms.split('\n');
      termLines.forEach(line => {
        pdf.text(line, 20, footerY);
        footerY += 4;
      });
    }

    // FOOTER
    const footerText = "This estimate is valid for 30 days from the date of issue.";
    pdf.setFontSize(7);
    pdf.setTextColor(107, 114, 128); // Gray-500
    pdf.text(footerText, pageWidth / 2, pageHeight - 20, { align: 'center' });
    
    resolve(pdf);
  });
}

interface PDFGeneratorProps {
  estimate: EstimateWithCustomer;
  onGenerate: (pdf: jsPDF) => void;
}

export default function PDFGenerator({ estimate, onGenerate }: PDFGeneratorProps) {
  const handleGeneratePDF = async () => {
    try {
      const pdf = await generateEstimatePDF(estimate);
      onGenerate(pdf);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  return { generatePDF: handleGeneratePDF };
}