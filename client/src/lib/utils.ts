import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a number or string as South African Rand currency
 * @param amount - The amount to format
 * @param options - Optional formatting options
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number | string | null | undefined,
  options: { 
    minimumFractionDigits?: number; 
    maximumFractionDigits?: number 
  } = {}
): string {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Handle NaN, null, undefined, or invalid values
  if (value == null || isNaN(value)) {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: options.minimumFractionDigits ?? 2,
      maximumFractionDigits: options.maximumFractionDigits ?? 2,
    }).format(0);
  }
  
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: options.minimumFractionDigits ?? 2,
    maximumFractionDigits: options.maximumFractionDigits ?? 2,
  }).format(value);
}

/**
 * Formats a date object or string in South African format
 * @param date - The date to format
 * @param format - The format type: 'short', 'long', or 'numeric'
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string | null | undefined,
  format: 'short' | 'long' | 'numeric' = 'short'
): string {
  if (!date) return 'Invalid Date';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Check if the date is valid
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }
  
  const formatOptions: Intl.DateTimeFormatOptions = 
    format === 'long' ? {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    } : format === 'numeric' ? {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    } : {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };
  
  return new Intl.DateTimeFormat('en-ZA', formatOptions).format(dateObj);
}

/**
 * Formats a number as a percentage
 * @param value - The value to format (0-100 scale)
 * @param decimals - Number of decimal places
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number | null | undefined, decimals: number = 1): string {
  if (value == null || isNaN(value)) return '0%';
  return `${value.toFixed(decimals)}%`;
}

/**
 * Formats a number with thousand separators
 * @param value - The number to format
 * @param decimals - Number of decimal places
 * @returns Formatted number string
 */
export function formatNumber(
  value: number | string | null | undefined,
  decimals: number = 0
): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (num == null || isNaN(num)) return '0';
  
  return new Intl.NumberFormat('en-ZA', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

/**
 * Gets the color class for a transaction status
 * @param status - The status string
 * @returns Tailwind color classes
 */
export function getStatusColor(status: string): string {
  const statusLower = status?.toLowerCase() || '';
  switch (statusLower) {
    case 'paid':
    case 'completed':
    case 'active':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    case 'sent':
    case 'pending':
    case 'processing':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    case 'partially_paid':
    case 'partial':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
    case 'overdue':
    case 'failed':
    case 'cancelled':
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    case 'draft':
    case 'inactive':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
  }
}

/**
 * Gets the display name for a status
 * @param status - The status string
 * @returns Human-readable status name
 */
export function getStatusDisplayName(status: string): string {
  const statusLower = status?.toLowerCase() || '';
  switch (statusLower) {
    case 'draft': return 'Draft';
    case 'sent': return 'Sent';
    case 'paid': return 'Paid';
    case 'overdue': return 'Overdue';
    case 'partially_paid': return 'Partially Paid';
    case 'pending': return 'Pending';
    case 'completed': return 'Completed';
    case 'cancelled': return 'Cancelled';
    case 'failed': return 'Failed';
    case 'active': return 'Active';
    case 'inactive': return 'Inactive';
    default: 
      // Capitalize first letter of each word
      return status.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ');
  }
}
