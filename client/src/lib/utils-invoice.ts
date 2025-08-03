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

export function calculateInvoiceTotal(items: Array<{
  quantity: string | number;
  unitPrice: string | number;
  vatRate?: string | number;
  vatTypeId?: number;
  vatAmount?: string | number;
}>): {
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

    // Calculate VAT based on vatTypeId (if provided) or fallback to vatRate
    if (item.vatTypeId) {
      // Use vatTypeId for precise VAT calculation following bulk capture logic
      switch (item.vatTypeId) {
        case 1: // VAT Exclusive (15%) - Add VAT to line amount
          const netAmount = lineAmount;
          const vatForLine = lineAmount * 0.15;
          subtotal += netAmount;
          vatAmount += vatForLine;
          total += netAmount + vatForLine;
          break;
        case 2: // VAT Inclusive (15%) - Extract VAT from inclusive amount
          // For inclusive: VAT = amount * (rate / (100 + rate))
          // Net = amount - VAT
          const inclusiveVAT = lineAmount * (15 / (100 + 15)); // 15/115 = 0.1304
          const netFromInclusive = lineAmount - inclusiveVAT;
          subtotal += netFromInclusive;
          vatAmount += inclusiveVAT;
          total += lineAmount; // Total stays the same as the inclusive amount
          break;
        case 3: // Zero-rated (0%)
        case 4: // Exempt (0%)
        case 5: // No VAT (0%)
          // No VAT applied - line amount is the net amount
          subtotal += lineAmount;
          vatAmount += 0;
          total += lineAmount;
          break;
        default:
          // Fallback to traditional calculation
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
    } else if (item.vatAmount) {
      // Use pre-calculated VAT amount if available
      const itemVatAmount = typeof item.vatAmount === 'string' ? parseFloat(item.vatAmount) : item.vatAmount;
      if (!isNaN(itemVatAmount)) {
        subtotal += lineAmount;
        vatAmount += itemVatAmount;
        total += lineAmount + itemVatAmount;
      }
    } else {
      // Fallback to traditional vatRate calculation
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

export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  // Handle NaN, null, undefined, or invalid values
  if (isNaN(num) || num == null) {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 2,
    }).format(0);
  }
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2,
  }).format(num);
}

export function formatDate(date: Date | string): string {
  let dateObj: Date;
  
  if (typeof date === 'string') {
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }
  
  // Check if the date is valid
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }
  
  return new Intl.DateTimeFormat('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(dateObj);
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'paid':
      return 'bg-green-100 text-green-800';
    case 'sent':
      return 'bg-blue-100 text-blue-800';
    case 'partially_paid':
      return 'bg-orange-100 text-orange-800';
    case 'overdue':
      return 'bg-red-100 text-red-800';
    case 'draft':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function getStatusDisplayName(status: string): string {
  switch (status.toLowerCase()) {
    case 'draft':
      return 'Draft';
    case 'sent':
      return 'Sent';
    case 'paid':
      return 'Paid';
    case 'overdue':
      return 'Overdue';
    case 'partially_paid':
      return 'Partially Paid';
    default:
      return status;
  }
}

export function generateInvoiceNumber(count: number): string {
  const year = new Date().getFullYear();
  return `INV-${year}-${String(count + 1).padStart(3, '0')}`;
}

export function generateEstimateNumber(count: number): string {
  const year = new Date().getFullYear();
  return `EST-${year}-${String(count + 1).padStart(3, '0')}`;
}


