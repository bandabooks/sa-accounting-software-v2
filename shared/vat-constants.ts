// South African VAT Constants - Using System VAT Types Only
// This file now serves as a reference for VAT rates and provides utility functions
// All VAT types are fetched from the database via /api/companies/{companyId}/vat-types

// Standard South African VAT Rate
export const SA_STANDARD_VAT_RATE = 15.00;

// Helper functions for VAT calculations using system VAT types
export const calculateVATFromRate = (amount: number, rate: number, isInclusive: boolean): number => {
  if (rate === 0) return 0;
  
  if (isInclusive) {
    // VAT Inclusive: VAT = Amount × (Rate ÷ (100 + Rate))
    return Number((amount * (rate / (100 + rate))).toFixed(2));
  } else {
    // VAT Exclusive: VAT = Amount × (Rate ÷ 100)
    return Number((amount * (rate / 100)).toFixed(2));
  }
};

export const calculateNetAmount = (amount: number, vatAmount: number, isInclusive: boolean): number => {
  if (isInclusive) {
    return Number((amount - vatAmount).toFixed(2));
  } else {
    return Number(amount.toFixed(2));
  }
};