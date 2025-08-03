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
    
    // Professional Color Scheme
    const primaryBlue = [37, 99, 235];  // Professional blue
    const darkGray = [55, 65, 81];     // Dark gray text
    const lightGray = [243, 244, 246]; // Light gray backgrounds
    const mediumGray = [107, 114, 128]; // Medium gray text
    const accentGold = [245, 158, 11];  // Professional gold accent
    
    // Professional Header Background
    pdf.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
    pdf.rect(0, 0, pageWidth, 55, 'F');
    
    // Company Logo Area with Professional Styling
    pdf.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    pdf.roundedRect(20, 12, 15, 15, 3, 3, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text("TB", 24.5, 23);
    
    // Company Information with Professional Typography
    pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text("Think Mybiz Accounting", 42, 22);
    
    pdf.setFontSize(11);
    pdf.setTextColor(mediumGray[0], mediumGray[1], mediumGray[2]);
    pdf.setFont('helvetica', 'normal');
    pdf.text("Professional Financial Solutions", 42, 29);
    pdf.text("VAT Compliant • SARS Ready • Expert Support", 42, 36);

    // Professional Invoice Title with Accent
    pdf.setFontSize(36);
    pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    pdf.setFont('helvetica', 'bold');
    pdf.text("INVOICE", pageWidth - 75, 30);
    
    // Professional accent line
    pdf.setFillColor(accentGold[0], accentGold[1], accentGold[2]);
    pdf.rect(pageWidth - 75, 35, 55, 2, 'F');

    // Professional Invoice Details Box
    const detailsX = pageWidth - 85;
    const detailsY = 65;
    pdf.setFillColor(255, 255, 255);
    pdf.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
    pdf.setLineWidth(1);
    pdf.roundedRect(detailsX, detailsY, 75, 65, 5, 5, 'FD');
    
    // Invoice details with professional formatting
    pdf.setFontSize(10);
    pdf.setTextColor(mediumGray[0], mediumGray[1], mediumGray[2]);
    pdf.setFont('helvetica', 'bold');
    
    pdf.text("INVOICE NUMBER", detailsX + 5, detailsY + 10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    pdf.text(invoice.invoiceNumber, detailsX + 5, detailsY + 18);
    
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(mediumGray[0], mediumGray[1], mediumGray[2]);
    pdf.text("ISSUE DATE", detailsX + 5, detailsY + 28);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    pdf.text(formatDate(invoice.issueDate), detailsX + 5, detailsY + 36);
    
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(mediumGray[0], mediumGray[1], mediumGray[2]);
    pdf.text("DUE DATE", detailsX + 5, detailsY + 46);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    pdf.text(formatDate(invoice.dueDate), detailsX + 5, detailsY + 54);
    
    // Professional Status Badge
    const statusColors = {
      'draft': [156, 163, 175],
      'sent': [59, 130, 246],
      'paid': [34, 197, 94],
      'overdue': [239, 68, 68]
    };
    const statusColor = statusColors[invoice.status as keyof typeof statusColors] || statusColors.draft;
    
    pdf.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
    pdf.roundedRect(detailsX + 45, detailsY + 45, 25, 12, 3, 3, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    const statusText = invoice.status.toUpperCase();
    const statusWidth = pdf.getStringUnitWidth(statusText) * 9 / pdf.internal.scaleFactor;
    pdf.text(statusText, detailsX + 57.5 - statusWidth/2, detailsY + 53);

    // Professional Bill To Section
    const billToY = 75;
    pdf.setFontSize(14);
    pdf.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    pdf.setFont('helvetica', 'bold');
    pdf.text("BILL TO", 20, billToY);
    
    // Customer information with professional styling
    pdf.setFillColor(255, 255, 255);
    pdf.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
    pdf.roundedRect(20, billToY + 5, 140, 70, 5, 5, 'FD');
    
    pdf.setFontSize(13);
    pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    pdf.setFont('helvetica', 'bold');
    pdf.text(invoice.customer.name, 25, billToY + 18);
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(mediumGray[0], mediumGray[1], mediumGray[2]);
    let customerY = billToY + 28;
    
    if (invoice.customer.email) {
      pdf.text(`Email: ${invoice.customer.email}`, 25, customerY);
      customerY += 8;
    }
    if (invoice.customer.phone) {
      pdf.text(`Phone: ${invoice.customer.phone}`, 25, customerY);
      customerY += 8;
    }
    if (invoice.customer.address) {
      pdf.text(`Address: ${invoice.customer.address}`, 25, customerY);
      customerY += 6;
      if (invoice.customer.city) {
        pdf.text(`${invoice.customer.city}${invoice.customer.postalCode ? ', ' + invoice.customer.postalCode : ''}`, 40, customerY);
        customerY += 8;
      }
    }
    if (invoice.customer.vatNumber) {
      pdf.text(`VAT Number: ${invoice.customer.vatNumber}`, 25, customerY);
    }

    // Professional Items Table
    const tableStartY = 160;
    
    // Table Header with Professional Gradient
    pdf.setFillColor(darkGray[0], darkGray[1], darkGray[2]);
    pdf.roundedRect(20, tableStartY, pageWidth - 40, 14, 3, 3, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    
    // Well-aligned table headers
    pdf.text("DESCRIPTION", 25, tableStartY + 9);
    
    // Center-aligned QTY header
    const qtyHeaderWidth = pdf.getStringUnitWidth("QTY") * 10 / pdf.internal.scaleFactor;
    pdf.text("QTY", 122 - qtyHeaderWidth/2, tableStartY + 9);
    
    // Right-aligned UNIT PRICE header
    const unitPriceHeaderWidth = pdf.getStringUnitWidth("UNIT PRICE") * 10 / pdf.internal.scaleFactor;
    pdf.text("UNIT PRICE", 170 - unitPriceHeaderWidth, tableStartY + 9);
    
    // Center-aligned VAT% header
    const vatHeaderWidth = pdf.getStringUnitWidth("VAT%") * 10 / pdf.internal.scaleFactor;
    pdf.text("VAT%", 182 - vatHeaderWidth/2, tableStartY + 9);
    
    // Right-aligned TOTAL header
    const totalHeaderWidth = pdf.getStringUnitWidth("TOTAL") * 10 / pdf.internal.scaleFactor;
    pdf.text("TOTAL", pageWidth - 25 - totalHeaderWidth, tableStartY + 9);

    // Table Items with Alternating Row Colors
    pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    pdf.setFont('helvetica', 'normal');
    let itemY = tableStartY + 22;
    
    (invoice as any).items?.forEach((item: any, index: number) => {
      // Alternating row background
      if (index % 2 === 0) {
        pdf.setFillColor(249, 250, 251);
        pdf.rect(20, itemY - 6, pageWidth - 40, 14, 'F');
      }
      
      pdf.setFontSize(10);
      
      // Description (left-aligned)
      pdf.text(item.description, 25, itemY);
      
      // Quantity (center-aligned)
      const qtyText = item.quantity.toString();
      const qtyWidth = pdf.getStringUnitWidth(qtyText) * 10 / pdf.internal.scaleFactor;
      pdf.text(qtyText, 122 - qtyWidth/2, itemY);
      
      // Unit Price (right-aligned)
      const unitPriceText = formatCurrency(item.unitPrice);
      const unitPriceWidth = pdf.getStringUnitWidth(unitPriceText) * 10 / pdf.internal.scaleFactor;
      pdf.text(unitPriceText, 170 - unitPriceWidth, itemY);
      
      // VAT Rate (center-aligned)
      const vatText = `${item.vatRate}%`;
      const vatWidth = pdf.getStringUnitWidth(vatText) * 10 / pdf.internal.scaleFactor;
      pdf.text(vatText, 182 - vatWidth/2, itemY);
      
      // Total (right-aligned)
      pdf.setFont('helvetica', 'bold');
      const totalText = formatCurrency(item.total);
      const totalWidth = pdf.getStringUnitWidth(totalText) * 10 / pdf.internal.scaleFactor;
      pdf.text(totalText, pageWidth - 25 - totalWidth, itemY);
      pdf.setFont('helvetica', 'normal');
      
      itemY += 14;
    });

    // Professional Totals Section
    const totalsStartY = itemY + 20;
    const totalsX = pageWidth - 95;
    
    // Totals background with professional styling
    pdf.setFillColor(249, 250, 251);
    pdf.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
    pdf.roundedRect(totalsX, totalsStartY - 5, 85, 55, 5, 5, 'FD');
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(mediumGray[0], mediumGray[1], mediumGray[2]);
    
    // Subtotal - properly aligned
    pdf.text("Subtotal:", totalsX + 5, totalsStartY + 8);
    const subtotalText = formatCurrency(invoice.subtotal);
    const subtotalWidth = pdf.getStringUnitWidth(subtotalText) * 11 / pdf.internal.scaleFactor;
    pdf.text(subtotalText, totalsX + 75 - subtotalWidth, totalsStartY + 8);
    
    // VAT - properly aligned
    pdf.text("VAT:", totalsX + 5, totalsStartY + 18);
    const vatText = formatCurrency(invoice.vatAmount);
    const vatAmountWidth = pdf.getStringUnitWidth(vatText) * 11 / pdf.internal.scaleFactor;
    pdf.text(vatText, totalsX + 75 - vatAmountWidth, totalsStartY + 18);
    
    // Professional total line with accent
    pdf.setFillColor(accentGold[0], accentGold[1], accentGold[2]);
    pdf.rect(totalsX + 5, totalsStartY + 25, 75, 1, 'F');
    
    // Total Amount with emphasis - properly aligned
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    pdf.text("TOTAL:", totalsX + 5, totalsStartY + 35);
    const finalTotalText = formatCurrency(invoice.total);
    const finalTotalWidth = pdf.getStringUnitWidth(finalTotalText) * 14 / pdf.internal.scaleFactor;
    pdf.text(finalTotalText, totalsX + 75 - finalTotalWidth, totalsStartY + 35);

    // Professional Notes Section
    if (invoice.notes) {
      const notesY = totalsStartY + 60;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
      pdf.text("NOTES", 20, notesY);
      
      pdf.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
      pdf.roundedRect(20, notesY + 5, pageWidth - 40, 25, 5, 5, 'F');
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      const noteLines = pdf.splitTextToSize(invoice.notes, pageWidth - 50);
      pdf.text(noteLines, 25, notesY + 15);
    }

    // Professional Footer
    const footerY = pageHeight - 35;
    
    // Footer accent line
    pdf.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    pdf.rect(20, footerY - 8, pageWidth - 40, 1, 'F');
    
    pdf.setFontSize(9);
    pdf.setTextColor(mediumGray[0], mediumGray[1], mediumGray[2]);
    pdf.setFont('helvetica', 'normal');
    pdf.text("Thank you for choosing Think Mybiz Accounting for your financial needs.", 20, footerY);
    pdf.text("Professional Invoice Management • VAT Compliant • SARS Ready", 20, footerY + 8);
    
    // Page information
    pdf.setFontSize(8);
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, footerY + 16);
    pdf.text("Page 1 of 1", pageWidth - 35, footerY + 16);

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