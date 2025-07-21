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
}>): {
  subtotal: number;
  vatAmount: number;
  total: number;
} {
  let subtotal = 0;
  let vatAmount = 0;

  items.forEach(item => {
    const qty = typeof item.quantity === 'string' ? parseFloat(item.quantity) : item.quantity;
    const price = typeof item.unitPrice === 'string' ? parseFloat(item.unitPrice) : item.unitPrice;
    const vatRate = typeof item.vatRate === 'string' ? parseFloat(item.vatRate) : (item.vatRate || 15);

    // Handle NaN values to prevent RNaN display
    if (isNaN(qty) || isNaN(price) || isNaN(vatRate)) {
      return; // Skip invalid items
    }

    const itemSubtotal = qty * price;
    const itemVat = itemSubtotal * (vatRate / 100);

    subtotal += itemSubtotal;
    vatAmount += itemVat;
  });

  return {
    subtotal: isNaN(subtotal) ? 0 : subtotal,
    vatAmount: isNaN(vatAmount) ? 0 : vatAmount,
    total: isNaN(subtotal + vatAmount) ? 0 : subtotal + vatAmount
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


