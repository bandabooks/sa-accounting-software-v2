/**
 * Centralized VAT Service
 * 
 * This service provides a unified interface for VAT calculations
 * using VAT types fetched dynamically from the database VAT module.
 * 
 * This replaces all hardcoded VAT type mappings throughout the system.
 */

export interface VATType {
  id: number;
  code: string;
  name: string;
  rate: string;
  description: string;
}

export interface VATCalculationResult {
  vatAmount: number;
  netAmount: number;
  grossAmount: number;
  vatRate: number;
}

/**
 * Calculates VAT amount for a line item using database VAT types
 */
export function calculateVATFromType(
  lineAmount: number,
  vatType: VATType,
  isInclusive: boolean = true
): VATCalculationResult {
  const vatRate = parseFloat(vatType.rate);
  
  // Zero-rated, exempt, and out-of-scope items always have zero VAT
  if (vatRate === 0) {
    return {
      vatAmount: 0,
      netAmount: lineAmount,
      grossAmount: lineAmount,
      vatRate: 0
    };
  }
  
  let vatAmount: number;
  let netAmount: number;
  let grossAmount: number;
  
  if (isInclusive) {
    // VAT inclusive: extract VAT from the total amount
    grossAmount = lineAmount;
    vatAmount = lineAmount * (vatRate / (100 + vatRate));
    netAmount = lineAmount - vatAmount;
  } else {
    // VAT exclusive: add VAT to the net amount
    netAmount = lineAmount;
    vatAmount = lineAmount * (vatRate / 100);
    grossAmount = lineAmount + vatAmount;
  }
  
  return {
    vatAmount: Math.round(vatAmount * 100) / 100,
    netAmount: Math.round(netAmount * 100) / 100,
    grossAmount: Math.round(grossAmount * 100) / 100,
    vatRate
  };
}

/**
 * Finds VAT type by ID from the fetched VAT types
 */
export function getVATTypeById(vatTypes: VATType[], id: number): VATType | undefined {
  return vatTypes.find(type => type.id === id);
}

/**
 * Gets the standard VAT type (15% rate)
 */
export function getStandardVATType(vatTypes: VATType[]): VATType | undefined {
  return vatTypes.find(type => type.code === 'STD' || parseFloat(type.rate) === 15);
}

/**
 * Gets the zero-rated VAT type
 */
export function getZeroRatedVATType(vatTypes: VATType[]): VATType | undefined {
  return vatTypes.find(type => type.code === 'ZER' || (type.name.toLowerCase().includes('zero') && parseFloat(type.rate) === 0));
}

/**
 * Checks if a VAT type is zero-rated (0% VAT)
 */
export function isZeroRatedVATType(vatType: VATType): boolean {
  return parseFloat(vatType.rate) === 0;
}

/**
 * Legacy compatibility function for invoice totals calculation
 * This maintains compatibility with existing invoice calculation functions
 */
export function calculateInvoiceTotalWithVATTypes(
  items: Array<{
    quantity: string | number;
    unitPrice: string | number;
    vatTypeId?: number;
    vatRate?: string | number;
    vatAmount?: string | number;
  }>,
  vatTypes: VATType[],
  vatCalculationMethod: 'inclusive' | 'exclusive' = 'inclusive'
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

    if (isNaN(qty) || isNaN(price)) {
      return; // Skip invalid items
    }

    const lineAmount = qty * price;

    if (item.vatTypeId) {
      const vatType = getVATTypeById(vatTypes, item.vatTypeId);
      
      if (vatType) {
        const calculation = calculateVATFromType(
          lineAmount, 
          vatType, 
          vatCalculationMethod === 'inclusive'
        );
        
        if (vatCalculationMethod === 'inclusive') {
          subtotal += calculation.netAmount;
          vatAmount += calculation.vatAmount;
          total += calculation.grossAmount;
        } else {
          subtotal += calculation.netAmount;
          vatAmount += calculation.vatAmount;
          total += calculation.grossAmount;
        }
      } else {
        // Fallback if VAT type not found
        subtotal += lineAmount;
        total += lineAmount;
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