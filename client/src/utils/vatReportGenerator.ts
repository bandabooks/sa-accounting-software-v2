/**
 * Clean and reusable Promise-based function for VAT report generation
 * Handles API calls, error handling, and blob generation
 */

export interface VatReportParams {
  startDate: string;
  endDate: string;
  format: 'pdf' | 'excel' | 'csv' | 'view';
}

/**
 * Generates VAT summary report from the backend API
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format  
 * @param format - Export format (pdf, excel, csv, view)
 * @returns Promise<Blob | null> - Returns Blob for downloads, null on failure
 */
export async function generateVatSummaryReport(
  startDate: string, 
  endDate: string, 
  format: 'pdf' | 'excel' | 'csv' | 'view' = 'pdf'
): Promise<Blob | null> {
  try {
    // Validate input parameters
    if (!startDate || !endDate) {
      console.error('Start date and end date are required');
      return null;
    }

    // Construct API endpoint with query parameters
    const params = new URLSearchParams({
      startDate,
      endDate,
      format
    });

    // Get authentication tokens like other API calls
    const token = localStorage.getItem('authToken');
    const sessionToken = localStorage.getItem('sessionToken');
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    if (sessionToken) {
      headers['X-Session-Token'] = sessionToken;
    }

    const response = await fetch(`/api/vat/reports/summary?${params}`, {
      method: 'GET',
      headers,
      credentials: 'include', // Include session cookies
    });

    // Handle HTTP errors
    if (!response.ok) {
      // Handle authentication errors specifically
      if (response.status === 401) {
        console.error('Authentication failed - redirecting to login');
        localStorage.removeItem('authToken');
        localStorage.removeItem('sessionToken');
        localStorage.removeItem('userData');
        window.location.href = '/login';
        return null;
      }
      
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || `HTTP ${response.status}: ${response.statusText}`;
      console.error('VAT report generation failed:', errorMessage);
      return null;
    }

    // Handle different response types based on format
    if (format === 'view') {
      // For view format, return JSON data as blob for consistency
      const jsonData = await response.json();
      return new Blob([JSON.stringify(jsonData, null, 2)], { 
        type: 'application/json' 
      });
    } else {
      // For file downloads (pdf, excel, csv), return blob directly
      const blob = await response.blob();
      return blob;
    }

  } catch (error) {
    console.error('Network error during VAT report generation:', error);
    return null;
  }
}

/**
 * Event handler for generating and downloading VAT reports
 * Opens PDF in new tab, downloads other formats
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 * @param format - Export format
 */
export async function handleGenerateReport(
  startDate: string,
  endDate: string, 
  format: 'pdf' | 'excel' | 'csv' | 'view' = 'pdf'
): Promise<void> {
  try {
    // Generate the report
    const reportBlob = await generateVatSummaryReport(startDate, endDate, format);
    
    if (!reportBlob) {
      alert('Failed to generate VAT report. Please check your connection and try again.');
      return;
    }

    // Handle different formats
    if (format === 'pdf') {
      // Open PDF in new browser tab
      const pdfUrl = URL.createObjectURL(reportBlob);
      window.open(pdfUrl, '_blank');
      
      // Clean up the blob URL after a delay
      setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);
      
    } else if (format === 'view') {
      // For view format, you could open a preview modal
      console.log('View format - implement preview modal logic here');
      
    } else {
      // Download excel/csv files
      const downloadUrl = URL.createObjectURL(reportBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `vat-summary-${startDate}-to-${endDate}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
    }

  } catch (error) {
    console.error('Error in handleGenerateReport:', error);
    alert('An unexpected error occurred while generating the report.');
  }
}

/**
 * Simple helper to validate date format
 * @param dateString - Date string to validate
 * @returns boolean - True if valid YYYY-MM-DD format
 */
export function isValidDate(dateString: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}