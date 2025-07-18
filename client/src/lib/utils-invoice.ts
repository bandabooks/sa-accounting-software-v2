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

    const itemSubtotal = qty * price;
    const itemVat = itemSubtotal * (vatRate / 100);

    subtotal += itemSubtotal;
    vatAmount += itemVat;
  });

  return {
    subtotal,
    vatAmount,
    total: subtotal + vatAmount
  };
}

export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2,
  }).format(num);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'paid':
      return 'bg-green-100 text-green-800';
    case 'sent':
      return 'bg-blue-100 text-blue-800';
    case 'overdue':
      return 'bg-red-100 text-red-800';
    case 'draft':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
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


