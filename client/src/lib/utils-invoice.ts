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


