// VAT Calculation Utilities for South African Tax Compliance

export interface VATCalculation {
  netAmount: number;
  vatAmount: number;
  grossAmount: number;
  vatRate: number;
  isInclusive: boolean;
}

/**
 * Calculate VAT amounts based on whether the price is VAT inclusive or exclusive
 * @param amount - The base amount (either inclusive or exclusive of VAT)
 * @param vatRate - VAT rate as a percentage (e.g., 15 for 15%)
 * @param isVATInclusive - Whether the amount includes VAT
 * @returns VATCalculation object with all calculated amounts
 */
export function calculateVAT(
  amount: number,
  vatRate: number,
  isVATInclusive: boolean = false
): VATCalculation {
  const rate = vatRate / 100; // Convert percentage to decimal
  
  if (isVATInclusive) {
    // Amount includes VAT - extract the VAT component
    const grossAmount = amount;
    const netAmount = grossAmount / (1 + rate);
    const vatAmount = grossAmount - netAmount;
    
    return {
      netAmount: Math.round(netAmount * 100) / 100,
      vatAmount: Math.round(vatAmount * 100) / 100,
      grossAmount: Math.round(grossAmount * 100) / 100,
      vatRate,
      isInclusive: true
    };
  } else {
    // Amount excludes VAT - add VAT on top
    const netAmount = amount;
    const vatAmount = netAmount * rate;
    const grossAmount = netAmount + vatAmount;
    
    return {
      netAmount: Math.round(netAmount * 100) / 100,
      vatAmount: Math.round(vatAmount * 100) / 100,
      grossAmount: Math.round(grossAmount * 100) / 100,
      vatRate,
      isInclusive: false
    };
  }
}

/**
 * Calculate VAT for line items (invoice items, estimate items, etc.)
 * @param quantity - Item quantity
 * @param unitPrice - Unit price (either inclusive or exclusive of VAT)
 * @param vatRate - VAT rate as a percentage
 * @param isVATInclusive - Whether the unit price includes VAT
 * @returns VATCalculation object for the line total
 */
export function calculateLineItemVAT(
  quantity: number,
  unitPrice: number,
  vatRate: number,
  isVATInclusive: boolean = false
): VATCalculation {
  const lineTotal = quantity * unitPrice;
  return calculateVAT(lineTotal, vatRate, isVATInclusive);
}

/**
 * South African VAT rates and types
 */
export const SA_VAT_RATES = {
  STANDARD: 15, // Standard VAT rate
  ZERO_RATED: 0, // Zero-rated goods (exports, basic foodstuffs)
  EXEMPT: 0, // VAT-exempt (financial services, residential rent)
  OUT_OF_SCOPE: 0 // Non-business activities
} as const;

/**
 * VAT type configurations for South African compliance
 */
export const SA_VAT_TYPES = [
  { code: 'STD', name: 'Standard Rate', rate: 15, description: 'Standard VAT rate of 15%' },
  { code: 'ZER', name: 'Zero Rated', rate: 0, description: 'Zero-rated supplies (exports, basic foods)' },
  { code: 'EXE', name: 'Exempt', rate: 0, description: 'VAT-exempt supplies (financial services)' },
  { code: 'OUT', name: 'Out of Scope', rate: 0, description: 'Non-business activities' }
] as const;

/**
 * Format currency amount for display
 * @param amount - Amount to format
 * @param currency - Currency code (default: ZAR)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: string = 'ZAR'): string {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Validate VAT rate for South African compliance
 * @param vatRate - VAT rate to validate
 * @returns Whether the VAT rate is valid
 */
export function isValidVATRate(vatRate: number): boolean {
  const validRates = [0, 15]; // South African valid VAT rates
  return validRates.includes(vatRate);
}

/**
 * Calculate VAT totals for multiple line items
 * @param items - Array of line items with VAT calculations
 * @returns Summary of VAT totals
 */
export function calculateVATTotals(items: VATCalculation[]): {
  totalNet: number;
  totalVAT: number;
  totalGross: number;
} {
  const totals = items.reduce(
    (acc, item) => ({
      totalNet: acc.totalNet + item.netAmount,
      totalVAT: acc.totalVAT + item.vatAmount,
      totalGross: acc.totalGross + item.grossAmount
    }),
    { totalNet: 0, totalVAT: 0, totalGross: 0 }
  );

  return {
    totalNet: Math.round(totals.totalNet * 100) / 100,
    totalVAT: Math.round(totals.totalVAT * 100) / 100,
    totalGross: Math.round(totals.totalGross * 100) / 100
  };
}

/**
 * Convert VAT inclusive price to exclusive price
 * @param inclusivePrice - Price including VAT
 * @param vatRate - VAT rate as percentage
 * @returns Price excluding VAT
 */
export function convertToExclusive(inclusivePrice: number, vatRate: number): number {
  const rate = vatRate / 100;
  return Math.round((inclusivePrice / (1 + rate)) * 100) / 100;
}

/**
 * Convert VAT exclusive price to inclusive price
 * @param exclusivePrice - Price excluding VAT
 * @param vatRate - VAT rate as percentage
 * @returns Price including VAT
 */
export function convertToInclusive(exclusivePrice: number, vatRate: number): number {
  const rate = vatRate / 100;
  return Math.round((exclusivePrice * (1 + rate)) * 100) / 100;
}