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
    const primaryColor = [45, 55, 72]; // Dark blue-gray
    const accentColor = [59, 130, 246]; // Modern blue
    const lightGray = [248, 250, 252]; // Very light gray
    const mediumGray = [148, 163, 184]; // Medium gray
    const darkGray = [71, 85, 105]; // Dark gray
    
    // Header Background
    pdf.setFillColor(...lightGray);
    pdf.rect(0, 0, pageWidth, 50, 'F');
    
    // Company Logo Area (Left Side)
    pdf.setFillColor(...accentColor);
    pdf.roundedRect(20, 15, 12, 12, 2, 2, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text("TB", 23, 24);
    
    // Company Name and Tagline
    pdf.setTextColor(...primaryColor);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text("Think Mybiz Accounting", 40, 25);
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...mediumGray);
    pdf.text("Professional Invoice Management Solutions", 40, 32);
    
    // Invoice Title (Right Side)
    pdf.setTextColor(...primaryColor);
    pdf.setFontSize(32);
    pdf.setFont('helvetica', 'bold');
    pdf.text("INVOICE", pageWidth - 65, 30);
    
    // Professional Border Line
    pdf.setDrawColor(...accentColor);
    pdf.setLineWidth(2);
    pdf.line(20, 55, pageWidth - 20, 55);
    
    // Invoice Information Section (Right Side)
    const infoStartY = 70;
    pdf.setFillColor(...lightGray);
    pdf.roundedRect(pageWidth - 85, infoStartY, 65, 50, 3, 3, 'F');
    
    pdf.setTextColor(...darkGray);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.text("INVOICE NUMBER", pageWidth - 80, infoStartY + 8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(invoice.invoiceNumber, pageWidth - 80, infoStartY + 15);
    
    pdf.setFont('helvetica', 'bold');
    pdf.text("ISSUE DATE", pageWidth - 80, infoStartY + 23);
    pdf.setFont('helvetica', 'normal');
    pdf.text(formatDate(invoice.issueDate), pageWidth - 80, infoStartY + 30);
    
    pdf.setFont('helvetica', 'bold');
    pdf.text("DUE DATE", pageWidth - 80, infoStartY + 38);
    pdf.setFont('helvetica', 'normal');
    pdf.text(formatDate(invoice.dueDate), pageWidth - 80, infoStartY + 45);
    
    // Status Badge
    const statusY = infoStartY + 50;
    const statusColors = {
      'draft': [156, 163, 175],
      'sent': [59, 130, 246],
      'paid': [34, 197, 94],
      'overdue': [239, 68, 68]
    };
    const statusColor = statusColors[invoice.status as keyof typeof statusColors] || statusColors.draft;
    
    pdf.setFillColor(...statusColor);
    pdf.roundedRect(pageWidth - 85, statusY + 5, 65, 8, 2, 2, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    const statusText = invoice.status.toUpperCase();
    const statusWidth = pdf.getStringUnitWidth(statusText) * 8 / pdf.internal.scaleFactor;
    pdf.text(statusText, pageWidth - 52.5 - statusWidth/2, statusY + 10);

    // Bill To Section
    const billToStartY = 80;
    pdf.setTextColor(...primaryColor);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text("BILL TO", 20, billToStartY);
    
    // Bill To Background
    pdf.setFillColor(255, 255, 255);
    pdf.setDrawColor(...lightGray);
    pdf.roundedRect(20, billToStartY + 5, 120, 60, 3, 3, 'FD');
    
    pdf.setTextColor(...darkGray);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    let billToY = billToStartY + 18;
    pdf.text(invoice.customer.name, 25, billToY);
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...mediumGray);
    
    if (invoice.customer.email) {
      billToY += 10;
      pdf.text(`✉ ${invoice.customer.email}`, 25, billToY);
    }
    if (invoice.customer.phone) {
      billToY += 8;
      pdf.text(`☎ ${invoice.customer.phone}`, 25, billToY);
    }
    if (invoice.customer.address) {
      billToY += 8;
      pdf.text(`⌂ ${invoice.customer.address}`, 25, billToY);
      if (invoice.customer.city) {
        billToY += 6;
        pdf.text(`   ${invoice.customer.city}${invoice.customer.postalCode ? ', ' + invoice.customer.postalCode : ''}`, 25, billToY);
      }
    }
    if (invoice.customer.vatNumber) {
      billToY += 8;
      pdf.text(`VAT: ${invoice.customer.vatNumber}`, 25, billToY);
    }

    // Items Table
    const tableStartY = 160;
    
    // Table Header
    pdf.setFillColor(...primaryColor);
    pdf.roundedRect(20, tableStartY, pageWidth - 40, 12, 2, 2, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.text("DESCRIPTION", 25, tableStartY + 8);
    pdf.text("QTY", pageWidth - 140, tableStartY + 8);
    pdf.text("UNIT PRICE", pageWidth - 110, tableStartY + 8);
    pdf.text("VAT %", pageWidth - 75, tableStartY + 8);
    pdf.text("TOTAL", pageWidth - 45, tableStartY + 8);

    // Table Items
    pdf.setTextColor(...darkGray);
    pdf.setFont('helvetica', 'normal');
    let currentY = tableStartY + 20;
    
    (invoice as any).items?.forEach((item: any, index: number) => {
      // Alternating row colors
      if (index % 2 === 0) {
        pdf.setFillColor(...lightGray);
        pdf.rect(20, currentY - 6, pageWidth - 40, 12, 'F');
      }
      
      pdf.setFontSize(9);
      pdf.text(item.description, 25, currentY);
      pdf.text(item.quantity.toString(), pageWidth - 135, currentY);
      pdf.text(formatCurrency(item.unitPrice), pageWidth - 110, currentY);
      pdf.text(`${item.vatRate}%`, pageWidth - 75, currentY);
      pdf.setFont('helvetica', 'bold');
      pdf.text(formatCurrency(item.total), pageWidth - 45, currentY);
      pdf.setFont('helvetica', 'normal');
      currentY += 12;
    });

    // Totals Section
    const totalsStartY = currentY + 15;
    const totalsX = pageWidth - 85;
    
    // Totals Background
    pdf.setFillColor(255, 255, 255);
    pdf.setDrawColor(...lightGray);
    pdf.roundedRect(totalsX - 5, totalsStartY - 5, 70, 45, 3, 3, 'FD');
    
    pdf.setTextColor(...darkGray);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    // Subtotal
    pdf.text("Subtotal:", totalsX, totalsStartY + 5);
    pdf.text(formatCurrency(invoice.subtotal), pageWidth - 25, totalsStartY + 5);
    
    // VAT
    pdf.text("VAT:", totalsX, totalsStartY + 15);
    pdf.text(formatCurrency(invoice.vatAmount), pageWidth - 25, totalsStartY + 15);
    
    // Total Line
    pdf.setDrawColor(...accentColor);
    pdf.setLineWidth(1);
    pdf.line(totalsX, totalsStartY + 20, pageWidth - 20, totalsStartY + 20);
    
    // Total Amount
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...primaryColor);
    pdf.text("TOTAL:", totalsX, totalsStartY + 30);
    pdf.text(formatCurrency(invoice.total), pageWidth - 25, totalsStartY + 30);

    // Notes Section (if exists)
    if (invoice.notes) {
      const notesY = totalsStartY + 50;
      pdf.setTextColor(...darkGray);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text("NOTES", 20, notesY);
      
      pdf.setFillColor(...lightGray);
      pdf.roundedRect(20, notesY + 5, pageWidth - 40, 20, 3, 3, 'F');
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(...mediumGray);
      
      // Wrap text for notes
      const noteLines = pdf.splitTextToSize(invoice.notes, pageWidth - 50);
      pdf.text(noteLines, 25, notesY + 15);
    }

    // Professional Footer
    const footerY = pageHeight - 30;
    
    // Footer separator line
    pdf.setDrawColor(...lightGray);
    pdf.setLineWidth(1);
    pdf.line(20, footerY - 5, pageWidth - 20, footerY - 5);
    
    pdf.setTextColor(...mediumGray);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text("Thank you for choosing Think Mybiz Accounting!", 20, footerY + 5);
    pdf.text("Professional Invoice Management | VAT Compliant | SARS Ready", 20, footerY + 12);
    
    // Page number (if needed for multi-page invoices)
    pdf.text(`Page 1 of 1`, pageWidth - 30, footerY + 12);

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