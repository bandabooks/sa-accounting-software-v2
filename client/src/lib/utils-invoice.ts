export function calculateItemTotal(quantity: number, unitPrice: number, vatRate: number = 15): {
  subtotal: number;
  vatAmount: number;
  total: number;
} {
  const subtotal = quantity * unitPrice;
  const vatAmount = subtotal * (vatRate / 100);
  const total = subtotal + vatAmount;

  return {
    subtotal,
    vatAmount,
    total
  };
}

export function calculateInvoiceTotal(
  items: Array<{
    quantity: string | number;
    unitPrice: string | number;
    vatRate?: string | number;
    vatTypeId?: number;
    vatAmount?: string | number;
  }>, 
  vatCalculationMethod: 'inclusive' | 'exclusive' = 'inclusive',
  vatTypes: Array<{id: number; rate: string}> = []
): {
  subtotal: number;
  vatAmount: number;
  total: number;
} {
  let subtotal = 0;
  let vatAmount = 0;
  let total = 0;

  items.forEach(item => {
    const qty = typeof item.quantity === 'string' ? parseFloat(item.quantity) : item.quantity;
    const price = typeof item.unitPrice === 'string' ? parseFloat(item.unitPrice) : item.unitPrice;

    // Handle NaN values to prevent RNaN display
    if (isNaN(qty) || isNaN(price)) {
      return; // Skip invalid items
    }

    const lineAmount = qty * price;

    if (item.vatTypeId && vatTypes.length > 0) {
      // Get VAT rate from database VAT types
      const vatType = vatTypes.find(type => type.id === item.vatTypeId);
      const vatRate = vatType ? parseFloat(vatType.rate) : 0;
      
      // CRITICAL: For zero-rated items, always use 0 VAT regardless of calculation method
      if (vatRate === 0) {
        subtotal += lineAmount;
        vatAmount += 0; // Zero VAT for zero-rated/exempt items
        total += lineAmount;
      } else {
        // Apply global VAT calculation method for standard VAT items
        if (vatCalculationMethod === 'inclusive') {
          // Inclusive: VAT is extracted from the line amount
          const extractedVAT = lineAmount * (vatRate / (100 + vatRate));
          const netAmount = lineAmount - extractedVAT;
          subtotal += netAmount;
          vatAmount += extractedVAT;
          total += lineAmount; // Total remains the inclusive amount
        } else {
          // Exclusive: VAT is added to the line amount
          const addedVAT = lineAmount * (vatRate / 100);
          subtotal += lineAmount;
          vatAmount += addedVAT;
          total += lineAmount + addedVAT;
        }
      }
    } else {
      // Fallback to traditional calculation using vatRate
      const vatRate = typeof item.vatRate === 'string' ? parseFloat(item.vatRate) : (item.vatRate || 0);
      if (!isNaN(vatRate)) {
        const fallbackVAT = lineAmount * (vatRate / 100);
        subtotal += lineAmount;
        vatAmount += fallbackVAT;
        total += lineAmount + fallbackVAT;
      } else {
        subtotal += lineAmount;
        total += lineAmount;
      }
    }
  });

  return {
    subtotal: isNaN(subtotal) ? 0 : subtotal,
    vatAmount: isNaN(vatAmount) ? 0 : vatAmount,
    total: isNaN(total) ? 0 : total
  };
}

// Re-export common formatting utilities from main utils
export { 
  formatCurrency, 
  formatDate, 
  formatPercentage, 
  formatNumber,
  getStatusColor,
  getStatusDisplayName 
} from './utils';

export function generateInvoiceNumber(count: number): string {
  const year = new Date().getFullYear();
  return `INV-${year}-${String(count + 1).padStart(3, '0')}`;
}

export function generateEstimateNumber(count: number): string {
  const year = new Date().getFullYear();
  return `EST-${year}-${String(count + 1).padStart(3, '0')}`;
}


