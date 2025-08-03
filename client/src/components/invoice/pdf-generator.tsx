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
    
    // Clean Professional Design - No Cards, Perfect Alignment
    
    // Company Header - Left Side
    pdf.setFontSize(26);
    pdf.setTextColor(37, 99, 235); // Professional blue
    pdf.setFont('helvetica', 'bold');
    pdf.text("Think Mybiz Accounting", 20, 25);
    
    pdf.setFontSize(11);
    pdf.setTextColor(75, 85, 99); // Medium gray
    pdf.setFont('helvetica', 'normal');
    pdf.text("Professional Financial Solutions", 20, 33);
    pdf.text("VAT Compliant • SARS Ready • Expert Support", 20, 40);

    // Invoice Title - Right Side
    pdf.setFontSize(36);
    pdf.setTextColor(17, 24, 39); // Dark text
    pdf.setFont('helvetica', 'bold');
    pdf.text("INVOICE", pageWidth - 75, 30);

    // Clean horizontal line separator
    pdf.setDrawColor(229, 231, 235);
    pdf.setLineWidth(1);
    pdf.line(20, 50, pageWidth - 20, 50);

    // Invoice Details - Right Column (No Box)
    const detailsX = pageWidth - 85;
    let detailsY = 60;
    
    pdf.setFontSize(10);
    pdf.setTextColor(75, 85, 99);
    pdf.setFont('helvetica', 'bold');
    
    pdf.text("Invoice Number:", detailsX, detailsY);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(17, 24, 39);
    pdf.text(invoice.invoiceNumber, detailsX, detailsY + 8);
    
    detailsY += 18;
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(75, 85, 99);
    pdf.text("Issue Date:", detailsX, detailsY);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(17, 24, 39);
    pdf.text(formatDate(invoice.issueDate), detailsX, detailsY + 8);
    
    detailsY += 18;
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(75, 85, 99);
    pdf.text("Due Date:", detailsX, detailsY);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(17, 24, 39);
    pdf.text(formatDate(invoice.dueDate), detailsX, detailsY + 8);
    
    detailsY += 18;
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(75, 85, 99);
    pdf.text("Status:", detailsX, detailsY);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(17, 24, 39);
    pdf.text(invoice.status.toUpperCase(), detailsX, detailsY + 8);

    // Bill To Section - Left Column (No Box)
    const billToY = 65;
    pdf.setFontSize(12);
    pdf.setTextColor(37, 99, 235);
    pdf.setFont('helvetica', 'bold');
    pdf.text("BILL TO", 20, billToY);
    
    pdf.setFontSize(12);
    pdf.setTextColor(17, 24, 39);
    pdf.setFont('helvetica', 'bold');
    pdf.text(invoice.customer.name, 20, billToY + 15);
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(75, 85, 99);
    let customerY = billToY + 25;
    
    if (invoice.customer.email) {
      pdf.text(`Email: ${invoice.customer.email}`, 20, customerY);
      customerY += 8;
    }
    if (invoice.customer.phone) {
      pdf.text(`Phone: ${invoice.customer.phone}`, 20, customerY);
      customerY += 8;
    }
    if (invoice.customer.address) {
      pdf.text(`Address: ${invoice.customer.address}`, 20, customerY);
      customerY += 6;
      if (invoice.customer.city) {
        pdf.text(`${invoice.customer.city}${invoice.customer.postalCode ? ', ' + invoice.customer.postalCode : ''}`, 20, customerY);
        customerY += 8;
      }
    }
    if (invoice.customer.vatNumber) {
      pdf.text(`VAT Number: ${invoice.customer.vatNumber}`, 20, customerY);
    }

    // Items Table - Clean Professional Design
    const tableStartY = 150;
    
    // Table Header
    pdf.setFillColor(17, 24, 39); // Dark professional header
    pdf.rect(20, tableStartY, pageWidth - 40, 12, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    
    // Column positions for perfect alignment
    const col1 = 25; // Description
    const col2 = 115; // Qty (center)
    const col3 = 145; // Unit Price (right)
    const col4 = 170; // VAT% (center)
    const col5 = pageWidth - 25; // Total (right)
    
    pdf.text("DESCRIPTION", col1, tableStartY + 8);
    
    // Center QTY
    const qtyWidth = pdf.getStringUnitWidth("QTY") * 10 / pdf.internal.scaleFactor;
    pdf.text("QTY", col2 - qtyWidth/2, tableStartY + 8);
    
    // Right-align UNIT PRICE
    const priceWidth = pdf.getStringUnitWidth("UNIT PRICE") * 10 / pdf.internal.scaleFactor;
    pdf.text("UNIT PRICE", col3 - priceWidth, tableStartY + 8);
    
    // Center VAT%
    const vatHdrWidth = pdf.getStringUnitWidth("VAT%") * 10 / pdf.internal.scaleFactor;
    pdf.text("VAT%", col4 - vatHdrWidth/2, tableStartY + 8);
    
    // Right-align TOTAL
    const totalHdrWidth = pdf.getStringUnitWidth("TOTAL") * 10 / pdf.internal.scaleFactor;
    pdf.text("TOTAL", col5 - totalHdrWidth, tableStartY + 8);

    // Table Items - Clean rows
    pdf.setTextColor(17, 24, 39);
    pdf.setFont('helvetica', 'normal');
    let itemY = tableStartY + 20;
    
    (invoice as any).items?.forEach((item: any, index: number) => {
      // Subtle alternating rows
      if (index % 2 === 0) {
        pdf.setFillColor(249, 250, 251);
        pdf.rect(20, itemY - 6, pageWidth - 40, 12, 'F');
      }
      
      pdf.setFontSize(10);
      
      // Description (left)
      pdf.text(item.description, col1, itemY);
      
      // Quantity (center)
      const qtyText = item.quantity.toString();
      const qtyItemWidth = pdf.getStringUnitWidth(qtyText) * 10 / pdf.internal.scaleFactor;
      pdf.text(qtyText, col2 - qtyItemWidth/2, itemY);
      
      // Unit Price (right)
      const unitPriceText = formatCurrency(item.unitPrice);
      const unitPriceItemWidth = pdf.getStringUnitWidth(unitPriceText) * 10 / pdf.internal.scaleFactor;
      pdf.text(unitPriceText, col3 - unitPriceItemWidth, itemY);
      
      // VAT Rate (center)
      const vatText = `${item.vatRate}%`;
      const vatItemWidth = pdf.getStringUnitWidth(vatText) * 10 / pdf.internal.scaleFactor;
      pdf.text(vatText, col4 - vatItemWidth/2, itemY);
      
      // Total (right)
      pdf.setFont('helvetica', 'bold');
      const totalText = formatCurrency(item.total);
      const totalItemWidth = pdf.getStringUnitWidth(totalText) * 10 / pdf.internal.scaleFactor;
      pdf.text(totalText, col5 - totalItemWidth, itemY);
      pdf.setFont('helvetica', 'normal');
      
      itemY += 12;
    });

    // Totals Section - Clean Right-Aligned (No Box)
    const totalsStartY = itemY + 20;
    const rightAlign = pageWidth - 25;
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(75, 85, 99);
    
    // Subtotal
    pdf.text("Subtotal:", rightAlign - 80, totalsStartY);
    const subtotalText = formatCurrency(invoice.subtotal);
    const subtotalWidth = pdf.getStringUnitWidth(subtotalText) * 11 / pdf.internal.scaleFactor;
    pdf.text(subtotalText, rightAlign - subtotalWidth, totalsStartY);
    
    // VAT
    pdf.text("VAT:", rightAlign - 80, totalsStartY + 12);
    const vatText = formatCurrency(invoice.vatAmount);
    const vatAmountWidth = pdf.getStringUnitWidth(vatText) * 11 / pdf.internal.scaleFactor;
    pdf.text(vatText, rightAlign - vatAmountWidth, totalsStartY + 12);
    
    // Total line
    pdf.setDrawColor(17, 24, 39);
    pdf.setLineWidth(1);
    pdf.line(rightAlign - 85, totalsStartY + 20, rightAlign, totalsStartY + 20);
    
    // Final Total
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(17, 24, 39);
    pdf.text("TOTAL:", rightAlign - 80, totalsStartY + 30);
    const finalTotalText = formatCurrency(invoice.total);
    const finalTotalWidth = pdf.getStringUnitWidth(finalTotalText) * 14 / pdf.internal.scaleFactor;
    pdf.text(finalTotalText, rightAlign - finalTotalWidth, totalsStartY + 30);

    // Notes Section (if exists) - Clean
    if (invoice.notes) {
      const notesY = totalsStartY + 50;
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(37, 99, 235);
      pdf.text("NOTES", 20, notesY);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(75, 85, 99);
      const noteLines = pdf.splitTextToSize(invoice.notes, pageWidth - 40);
      pdf.text(noteLines, 20, notesY + 12);
    }

    // Clean Footer
    const footerY = pageHeight - 30;
    
    pdf.setDrawColor(229, 231, 235);
    pdf.setLineWidth(0.5);
    pdf.line(20, footerY - 10, pageWidth - 20, footerY - 10);
    
    pdf.setFontSize(9);
    pdf.setTextColor(107, 114, 128);
    pdf.setFont('helvetica', 'normal');
    pdf.text("Thank you for choosing Think Mybiz Accounting for your financial needs.", 20, footerY);
    pdf.text("Professional Invoice Management • VAT Compliant • SARS Ready", 20, footerY + 8);
    
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