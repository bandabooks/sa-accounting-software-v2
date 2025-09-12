// DTO Mapping functions to handle property name mismatches between DB and API
import type { InvoiceWithCustomer, EstimateWithCustomer } from '@shared/schema';

/**
 * Normalize invoice data from database format to API DTO format
 * Maps issueDate -> invoiceDate, customer.name -> customerName, etc.
 */
export function normalizeInvoice(row: InvoiceWithCustomer): InvoiceWithCustomer & { 
  invoiceDate: Date; 
  customerName: string;
  paidAmount: string;
  totalAmount: string;
  date: Date;
} {
  return {
    ...row,
    // Map issueDate to invoiceDate for backward compatibility
    invoiceDate: row.issueDate,
    // Map customer name for convenience
    customerName: row.customer?.name || '',
    // Map payment amounts
    paidAmount: row.total || '0.00', // Simplified - actual logic may differ
    totalAmount: row.total || '0.00',
    // Generic date field
    date: row.issueDate
  };
}

/**
 * Normalize estimate data from database format to API DTO format
 */
export function normalizeEstimate(row: EstimateWithCustomer): EstimateWithCustomer & {
  customerName: string;
  estimateDate: Date;
} {
  return {
    ...row,
    // Map customer name for convenience  
    customerName: row.customer?.name || '',
    // Map issueDate to estimateDate for consistency
    estimateDate: row.issueDate
  };
}

/**
 * Normalize role data to include displayName fallback
 */
export function normalizeRole(role: { id: number; name: string; description?: string | null; isActive?: boolean | null; permissions?: string[] | null; createdAt?: Date | null; }) {
  return {
    ...role,
    displayName: role.name // Use name as displayName when displayName doesn't exist
  };
}

/**
 * Safe date parsing with null guards
 */
export function safeParseDate(dateValue: Date | string | null | undefined): Date {
  if (!dateValue) {
    return new Date();
  }
  
  if (dateValue instanceof Date) {
    return dateValue;
  }
  
  const parsed = new Date(dateValue);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

/**
 * Safe date comparison for nullable dates
 */
export function safeDateCompare(date1: Date | null, date2: Date | null): boolean {
  if (!date1 || !date2) return false;
  return date1.getTime() === date2.getTime();
}