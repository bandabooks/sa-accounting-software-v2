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
    
    // Clean, Professional Design - Simple and Well-Aligned
    
    // Company Header (Left Side)
    pdf.setFontSize(22);
    pdf.setTextColor(59, 130, 246); // Clean blue
    pdf.setFont('helvetica', 'bold');
    pdf.text("Think Mybiz Accounting", 20, 25);
    
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.setFont('helvetica', 'normal');
    pdf.text("Professional Invoice Management", 20, 32);

    // Invoice Title (Right Side)
    pdf.setFontSize(24);
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'bold');
    pdf.text("INVOICE", pageWidth - 60, 25);

    // Clean separator line
    pdf.setDrawColor(220, 220, 220);
    pdf.setLineWidth(1);
    pdf.line(20, 40, pageWidth - 20, 40);

    // Invoice Details Box (Right Side) - Clean and Aligned
    const detailsStartY = 50;
    pdf.setFontSize(9);
    pdf.setTextColor(60, 60, 60);
    pdf.setFont('helvetica', 'bold');
    
    pdf.text("Invoice Number:", pageWidth - 80, detailsStartY);
    pdf.setFont('helvetica', 'normal');
    pdf.text(invoice.invoiceNumber, pageWidth - 80, detailsStartY + 7);
    
    pdf.setFont('helvetica', 'bold');
    pdf.text("Issue Date:", pageWidth - 80, detailsStartY + 17);
    pdf.setFont('helvetica', 'normal');
    pdf.text(formatDate(invoice.issueDate), pageWidth - 80, detailsStartY + 24);
    
    pdf.setFont('helvetica', 'bold');
    pdf.text("Due Date:", pageWidth - 80, detailsStartY + 34);
    pdf.setFont('helvetica', 'normal');
    pdf.text(formatDate(invoice.dueDate), pageWidth - 80, detailsStartY + 41);
    
    pdf.setFont('helvetica', 'bold');
    pdf.text("Status:", pageWidth - 80, detailsStartY + 51);
    pdf.setFont('helvetica', 'normal');
    pdf.text(invoice.status.toUpperCase(), pageWidth - 80, detailsStartY + 58);

    // Bill To Section - Clean Layout
    const billToY = 60;
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'bold');
    pdf.text("Bill To:", 20, billToY);
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text(invoice.customer.name, 20, billToY + 12);
    
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(60, 60, 60);
    let customerY = billToY + 20;
    
    if (invoice.customer.email) {
      pdf.text(invoice.customer.email, 20, customerY);
      customerY += 8;
    }
    if (invoice.customer.phone) {
      pdf.text(invoice.customer.phone, 20, customerY);
      customerY += 8;
    }
    if (invoice.customer.address) {
      pdf.text(invoice.customer.address, 20, customerY);
      customerY += 6;
      if (invoice.customer.city) {
        pdf.text(`${invoice.customer.city}${invoice.customer.postalCode ? ', ' + invoice.customer.postalCode : ''}`, 20, customerY);
        customerY += 8;
      }
    }
    if (invoice.customer.vatNumber) {
      pdf.text(`VAT: ${invoice.customer.vatNumber}`, 20, customerY);
    }

    // Items Table - Clean and Well-Aligned
    const tableStartY = 130;
    
    // Table Header - Simple and Professional
    pdf.setFillColor(59, 130, 246);
    pdf.rect(20, tableStartY, pageWidth - 40, 10, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    
    // Properly aligned columns
    pdf.text("Description", 25, tableStartY + 7);
    pdf.text("Qty", 110, tableStartY + 7);
    pdf.text("Unit Price", 130, tableStartY + 7);
    pdf.text("VAT%", 160, tableStartY + 7);
    pdf.text("Total", pageWidth - 35, tableStartY + 7);

    // Table Items - Clean rows with proper alignment
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'normal');
    let itemY = tableStartY + 18;
    
    (invoice as any).items?.forEach((item: any, index: number) => {
      pdf.setFontSize(9);
      
      // Description (left-aligned)
      pdf.text(item.description, 25, itemY);
      
      // Quantity (center-aligned)
      const qtyText = item.quantity.toString();
      const qtyWidth = pdf.getStringUnitWidth(qtyText) * 9 / pdf.internal.scaleFactor;
      pdf.text(qtyText, 115 - qtyWidth/2, itemY);
      
      // Unit Price (right-aligned)
      const unitPriceText = formatCurrency(item.unitPrice);
      const unitPriceWidth = pdf.getStringUnitWidth(unitPriceText) * 9 / pdf.internal.scaleFactor;
      pdf.text(unitPriceText, 155 - unitPriceWidth, itemY);
      
      // VAT Rate (center-aligned)
      const vatText = `${item.vatRate}%`;
      const vatWidth = pdf.getStringUnitWidth(vatText) * 9 / pdf.internal.scaleFactor;
      pdf.text(vatText, 165 - vatWidth/2, itemY);
      
      // Total (right-aligned)
      const totalText = formatCurrency(item.total);
      const totalWidth = pdf.getStringUnitWidth(totalText) * 9 / pdf.internal.scaleFactor;
      pdf.text(totalText, pageWidth - 25 - totalWidth, itemY);
      
      itemY += 12;
    });

    // Totals Section - Clean and Right-Aligned
    const totalsStartY = itemY + 15;
    const rightAlign = pageWidth - 25;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(60, 60, 60);
    
    // Subtotal
    pdf.text("Subtotal:", rightAlign - 50, totalsStartY);
    const subtotalText = formatCurrency(invoice.subtotal);
    const subtotalWidth = pdf.getStringUnitWidth(subtotalText) * 10 / pdf.internal.scaleFactor;
    pdf.text(subtotalText, rightAlign - subtotalWidth, totalsStartY);
    
    // VAT
    pdf.text("VAT:", rightAlign - 50, totalsStartY + 10);
    const vatText = formatCurrency(invoice.vatAmount);
    const vatAmountWidth = pdf.getStringUnitWidth(vatText) * 10 / pdf.internal.scaleFactor;
    pdf.text(vatText, rightAlign - vatAmountWidth, totalsStartY + 10);
    
    // Total line separator
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.5);
    pdf.line(rightAlign - 80, totalsStartY + 15, rightAlign, totalsStartY + 15);
    
    // Total Amount
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0, 0, 0);
    pdf.text("TOTAL:", rightAlign - 50, totalsStartY + 25);
    const finalTotalText = formatCurrency(invoice.total);
    const finalTotalWidth = pdf.getStringUnitWidth(finalTotalText) * 12 / pdf.internal.scaleFactor;
    pdf.text(finalTotalText, rightAlign - finalTotalWidth, totalsStartY + 25);

    // Notes Section (if exists) - Clean formatting
    if (invoice.notes) {
      const notesY = totalsStartY + 45;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text("Notes:", 20, notesY);
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(60, 60, 60);
      const noteLines = pdf.splitTextToSize(invoice.notes, pageWidth - 40);
      pdf.text(noteLines, 20, notesY + 10);
    }

    // Footer - Simple and Professional
    const footerY = pageHeight - 25;
    pdf.setDrawColor(220, 220, 220);
    pdf.setLineWidth(0.5);
    pdf.line(20, footerY - 10, pageWidth - 20, footerY - 10);
    
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.setFont('helvetica', 'normal');
    pdf.text("Thank you for your business!", 20, footerY);
    pdf.text("Think Mybiz Accounting - Professional Invoice Management", 20, footerY + 6);

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