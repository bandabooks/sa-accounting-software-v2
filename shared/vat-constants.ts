// Unified VAT Types System for South African Compliance
export const UNIFIED_VAT_TYPES = [
  {
    id: 'vat_inclusive',
    code: 'STD',
    name: 'VAT Inclusive (Standard)',
    rate: 15.00,
    description: 'Standard VAT rate of 15% (amount includes VAT)',
    category: 'standard',
    isActive: true,
    isSystemType: true
  },

  {
    id: 'zero_rated',
    code: 'ZER',
    name: 'Zero Rated',
    rate: 0.00,
    description: 'Zero-rated supplies (exports, basic foodstuffs)',
    category: 'zero_rated',
    isActive: true,
    isSystemType: true
  },
  {
    id: 'exempt',
    code: 'EXE',
    name: 'Exempt',
    rate: 0.00,
    description: 'VAT-exempt supplies (financial services, residential rent)',
    category: 'exempt',
    isActive: true,
    isSystemType: true
  },
  {
    id: 'no_vat',
    code: 'OUT',
    name: 'No VAT',
    rate: 0.00,
    description: 'Out of scope transactions (wages, dividends)',
    category: 'out_of_scope',
    isActive: true,
    isSystemType: true
  }
] as const;

// Helper functions for VAT calculations
export const calculateVATAmount = (amount: number, vatType: string): number => {
  const vatTypeConfig = UNIFIED_VAT_TYPES.find(v => v.id === vatType);
  if (!vatTypeConfig || vatTypeConfig.rate === 0) return 0;

  if (vatType === 'vat_inclusive') {
    // VAT = Amount * (Rate / (100 + Rate))
    return Number((amount * (vatTypeConfig.rate / (100 + vatTypeConfig.rate))).toFixed(2));
  }
  
  return 0;
};

export const calculateNetAmount = (amount: number, vatType: string): number => {
  const vatAmount = calculateVATAmount(amount, vatType);
  
  if (vatType === 'vat_inclusive') {
    return Number((amount - vatAmount).toFixed(2));
  }
  return Number(amount.toFixed(2));
};

export const getVATTypeConfig = (vatTypeId: string) => {
  return UNIFIED_VAT_TYPES.find(v => v.id === vatTypeId);
};

// Export for backward compatibility
export const VAT_TYPES = UNIFIED_VAT_TYPES;