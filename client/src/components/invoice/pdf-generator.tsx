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

    // Company Header
    pdf.setFontSize(24);
    pdf.setTextColor(59, 130, 246); // Blue color
    pdf.text("Think Mybiz Accounting", 20, 25);
    
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text("Professional Invoice Management", 20, 32);
    
    // Invoice Title
    pdf.setFontSize(20);
    pdf.setTextColor(0, 0, 0);
    pdf.text("INVOICE", pageWidth - 60, 25);
    
    // Invoice Details
    pdf.setFontSize(10);
    pdf.text(`Invoice Number: ${invoice.invoiceNumber}`, pageWidth - 80, 35);
    pdf.text(`Issue Date: ${formatDate(invoice.issueDate)}`, pageWidth - 80, 42);
    pdf.text(`Due Date: ${formatDate(invoice.dueDate)}`, pageWidth - 80, 49);
    pdf.text(`Status: ${invoice.status.toUpperCase()}`, pageWidth - 80, 56);

    // Bill To Section
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    pdf.text("Bill To:", 20, 70);
    
    pdf.setFontSize(10);
    pdf.text(invoice.customer.name, 20, 80);
    pdf.text(invoice.customer.email || "", 20, 87);
    pdf.text(invoice.customer.phone || "", 20, 94);
    pdf.text(`${invoice.customer.address}`, 20, 101);
    pdf.text(`${invoice.customer.city}, ${invoice.customer.postalCode}`, 20, 108);
    
    if (invoice.customer.vatNumber) {
      pdf.text(`VAT Number: ${invoice.customer.vatNumber}`, 20, 115);
    }

    // Items Table Header
    const tableStartY = 130;
    pdf.setFontSize(10);
    pdf.setFillColor(59, 130, 246);
    pdf.setTextColor(255, 255, 255);
    pdf.rect(20, tableStartY, pageWidth - 40, 8, 'F');
    
    pdf.text("Description", 25, tableStartY + 5);
    pdf.text("Qty", pageWidth - 120, tableStartY + 5);
    pdf.text("Unit Price", pageWidth - 90, tableStartY + 5);
    pdf.text("VAT %", pageWidth - 60, tableStartY + 5);
    pdf.text("Total", pageWidth - 35, tableStartY + 5);

    // Items
    pdf.setTextColor(0, 0, 0);
    let currentY = tableStartY + 15;
    
    (invoice as any).items?.forEach((item: any, index: number) => {
      pdf.text(item.description, 25, currentY);
      pdf.text(item.quantity.toString(), pageWidth - 120, currentY);
      pdf.text(formatCurrency(item.unitPrice), pageWidth - 90, currentY);
      pdf.text(`${item.vatRate}%`, pageWidth - 60, currentY);
      pdf.text(formatCurrency(item.total), pageWidth - 35, currentY);
      currentY += 10;
    });

    // Totals
    const totalsY = currentY + 10;
    pdf.setFontSize(10);
    
    pdf.text("Subtotal:", pageWidth - 80, totalsY);
    pdf.text(formatCurrency(invoice.subtotal), pageWidth - 35, totalsY);
    
    pdf.text("VAT:", pageWidth - 80, totalsY + 8);
    pdf.text(formatCurrency(invoice.vatAmount), pageWidth - 35, totalsY + 8);
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text("Total:", pageWidth - 80, totalsY + 18);
    pdf.text(formatCurrency(invoice.total), pageWidth - 35, totalsY + 18);

    // Notes
    if (invoice.notes) {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text("Notes:", 20, totalsY + 30);
      pdf.text(invoice.notes, 20, totalsY + 40);
    }

    // Footer
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text("Thank you for your business!", 20, pageHeight - 20);
    pdf.text("Think Mybiz Accounting - Professional Invoice Management", 20, pageHeight - 15);

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