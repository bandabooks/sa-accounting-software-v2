// Professional SMS Templates for Accounting Services

export interface SMSTemplate {
  id: string;
  name: string;
  category: string;
  message: string;
  variables: string[];
  maxLength: number;
  isActive: boolean;
}

export const DEFAULT_SMS_TEMPLATES: SMSTemplate[] = [
  // Payment & Invoice SMS Templates
  {
    id: 'invoice-sent',
    name: 'Invoice Sent Notification',
    category: 'Invoicing',
    message: 'Hi {customerName}, Invoice #{invoiceNumber} for {currency}{amount} has been sent to your email. Due date: {dueDate}. Pay online: {paymentLink}',
    variables: ['customerName', 'invoiceNumber', 'currency', 'amount', 'dueDate', 'paymentLink'],
    maxLength: 160,
    isActive: true
  },
  
  {
    id: 'payment-reminder-sms',
    name: 'Payment Reminder SMS',
    category: 'Invoicing',
    message: 'Reminder: Invoice #{invoiceNumber} ({currency}{amount}) is due {dueDate}. Please arrange payment. {companyName}',
    variables: ['invoiceNumber', 'currency', 'amount', 'dueDate', 'companyName'],
    maxLength: 160,
    isActive: true
  },
  
  {
    id: 'payment-overdue',
    name: 'Payment Overdue Alert',
    category: 'Invoicing',
    message: 'URGENT: Invoice #{invoiceNumber} is {days} days overdue. Amount: {currency}{amount}. Please pay immediately to avoid late fees. {companyName}',
    variables: ['invoiceNumber', 'days', 'currency', 'amount', 'companyName'],
    maxLength: 160,
    isActive: true
  },
  
  {
    id: 'payment-received-sms',
    name: 'Payment Confirmation',
    category: 'Payments',
    message: 'Thank you! Payment of {currency}{amount} received for Invoice #{invoiceNumber}. Receipt sent to email. {companyName}',
    variables: ['currency', 'amount', 'invoiceNumber', 'companyName'],
    maxLength: 160,
    isActive: true
  },
  
  // Tax & Compliance SMS Templates
  {
    id: 'tax-deadline-reminder',
    name: 'Tax Deadline Reminder',
    category: 'Tax Services',
    message: 'Tax Reminder: Your {taxType} submission is due {dueDate}. Please ensure all documents are submitted. Contact us for assistance. {companyName}',
    variables: ['taxType', 'dueDate', 'companyName'],
    maxLength: 160,
    isActive: true
  },
  
  {
    id: 'tax-return-ready',
    name: 'Tax Return Ready',
    category: 'Tax Services',
    message: 'Good news! Your {year} tax return is ready for review. Estimated refund: {currency}{amount}. Check email for details. {companyName}',
    variables: ['year', 'currency', 'amount', 'companyName'],
    maxLength: 160,
    isActive: true
  },
  
  {
    id: 'vat-submission-due',
    name: 'VAT Submission Due',
    category: 'VAT Compliance',
    message: 'VAT Alert: Your VAT201 for {period} is due {dueDate}. Amount payable: {currency}{amount}. Submit via eFiling. {companyName}',
    variables: ['period', 'dueDate', 'currency', 'amount', 'companyName'],
    maxLength: 160,
    isActive: true
  },
  
  {
    id: 'vat-submitted',
    name: 'VAT Submission Confirmation',
    category: 'VAT Compliance',
    message: 'VAT201 for {period} submitted successfully. {status}: {currency}{amount}. Reference: {reference}. {companyName}',
    variables: ['period', 'status', 'currency', 'amount', 'reference', 'companyName'],
    maxLength: 160,
    isActive: true
  },
  
  // Document & Appointment SMS Templates
  {
    id: 'document-request-sms',
    name: 'Document Request',
    category: 'Document Management',
    message: 'Hi {clientName}, We need {documentType} by {deadline} to proceed with {service}. Upload: {uploadLink} or reply to email. {companyName}',
    variables: ['clientName', 'documentType', 'deadline', 'service', 'uploadLink', 'companyName'],
    maxLength: 160,
    isActive: true
  },
  
  {
    id: 'appointment-reminder',
    name: 'Appointment Reminder',
    category: 'Appointments',
    message: 'Reminder: Your appointment with {companyName} is on {date} at {time}. Location: {location}. Reply CONFIRM or CANCEL.',
    variables: ['companyName', 'date', 'time', 'location'],
    maxLength: 160,
    isActive: true
  },
  
  {
    id: 'appointment-confirmation',
    name: 'Appointment Confirmation',
    category: 'Appointments',
    message: 'Appointment confirmed for {date} at {time} with {staffName}. We\'ll discuss {topic}. See you then! {companyName}',
    variables: ['date', 'time', 'staffName', 'topic', 'companyName'],
    maxLength: 160,
    isActive: true
  },
  
  // Year-End & Deadlines SMS Templates
  {
    id: 'year-end-reminder',
    name: 'Year-End Preparation',
    category: 'Year-End',
    message: 'Year-end approaching ({yearEndDate}). Please schedule your year-end meeting. Book online: {bookingLink} {companyName}',
    variables: ['yearEndDate', 'bookingLink', 'companyName'],
    maxLength: 160,
    isActive: true
  },
  
  {
    id: 'provisional-tax-due',
    name: 'Provisional Tax Reminder',
    category: 'Tax Services',
    message: 'Provisional tax payment due {dueDate}. Estimated amount: {currency}{amount}. Ensure sufficient funds available. {companyName}',
    variables: ['dueDate', 'currency', 'amount', 'companyName'],
    maxLength: 160,
    isActive: true
  },
  
  // Account Status SMS Templates
  {
    id: 'account-suspended',
    name: 'Account Suspension Notice',
    category: 'Account Management',
    message: 'Account suspended due to overdue payment of {currency}{amount}. Please pay immediately to restore services. Call {phone}. {companyName}',
    variables: ['currency', 'amount', 'phone', 'companyName'],
    maxLength: 160,
    isActive: true
  },
  
  {
    id: 'credit-limit-warning',
    name: 'Credit Limit Warning',
    category: 'Account Management',
    message: 'Credit limit warning: Current balance {currency}{balance} approaching limit of {currency}{limit}. Please make payment. {companyName}',
    variables: ['currency', 'balance', 'limit', 'companyName'],
    maxLength: 160,
    isActive: true
  },
  
  // General Business SMS Templates
  {
    id: 'welcome-client',
    name: 'Welcome New Client',
    category: 'Client Onboarding',
    message: 'Welcome to {companyName}! Your account is active. Client portal: {portalLink} Support: {phone}',
    variables: ['companyName', 'portalLink', 'phone'],
    maxLength: 160,
    isActive: true
  },
  
  {
    id: 'otp-verification',
    name: 'OTP Verification',
    category: 'Security',
    message: 'Your {companyName} verification code is {otp}. Valid for {minutes} minutes. Do not share this code.',
    variables: ['companyName', 'otp', 'minutes'],
    maxLength: 160,
    isActive: true
  },
  
  {
    id: 'password-reset',
    name: 'Password Reset',
    category: 'Security',
    message: 'Password reset requested for {companyName}. Reset link: {resetLink} Valid for 1 hour. Ignore if not requested by you.',
    variables: ['companyName', 'resetLink'],
    maxLength: 160,
    isActive: true
  },
  
  {
    id: 'service-update',
    name: 'Service Update',
    category: 'General',
    message: '{updateType}: {message}. Affected period: {period}. More info: {infoLink} {companyName}',
    variables: ['updateType', 'message', 'period', 'infoLink', 'companyName'],
    maxLength: 160,
    isActive: true
  },
  
  {
    id: 'birthday-greeting',
    name: 'Birthday Greeting',
    category: 'Relationship',
    message: 'Happy Birthday {clientName}! Wishing you success and prosperity. Thank you for being a valued client. {companyName}',
    variables: ['clientName', 'companyName'],
    maxLength: 160,
    isActive: true
  },
  
  // Payroll SMS Templates
  {
    id: 'payslip-ready',
    name: 'Payslip Available',
    category: 'Payroll',
    message: 'Your {month} payslip is ready. Net pay: {currency}{amount} paid to your account. View details: {portalLink} {companyName}',
    variables: ['month', 'currency', 'amount', 'portalLink', 'companyName'],
    maxLength: 160,
    isActive: true
  },
  
  {
    id: 'leave-approved',
    name: 'Leave Approved',
    category: 'Payroll',
    message: 'Leave approved: {leaveType} from {startDate} to {endDate} ({days} days). Remaining balance: {balance} days. {companyName}',
    variables: ['leaveType', 'startDate', 'endDate', 'days', 'balance', 'companyName'],
    maxLength: 160,
    isActive: true
  },
  
  // Inventory & Stock SMS Templates
  {
    id: 'low-stock-alert',
    name: 'Low Stock Alert',
    category: 'Inventory',
    message: 'Low stock alert: {productName} has {quantity} units remaining. Reorder level: {reorderLevel}. Place order now. {companyName}',
    variables: ['productName', 'quantity', 'reorderLevel', 'companyName'],
    maxLength: 160,
    isActive: true
  },
  
  {
    id: 'order-shipped',
    name: 'Order Shipped',
    category: 'Sales',
    message: 'Order #{orderNumber} shipped via {carrier}. Tracking: {trackingNumber}. Delivery expected: {deliveryDate}. {companyName}',
    variables: ['orderNumber', 'carrier', 'trackingNumber', 'deliveryDate', 'companyName'],
    maxLength: 160,
    isActive: true
  }
];

// Function to get SMS template by ID
export function getSMSTemplate(templateId: string): SMSTemplate | undefined {
  return DEFAULT_SMS_TEMPLATES.find(t => t.id === templateId);
}

// Function to get SMS templates by category
export function getSMSTemplatesByCategory(category: string): SMSTemplate[] {
  return DEFAULT_SMS_TEMPLATES.filter(t => t.category === category);
}

// Function to populate SMS template with variables
export function populateSMSTemplate(template: SMSTemplate, variables: Record<string, any>): string {
  let message = template.message;
  
  // Replace variables in message
  Object.keys(variables).forEach(key => {
    const value = variables[key] || '';
    const regex = new RegExp(`{${key}}`, 'g');
    message = message.replace(regex, value);
  });
  
  // Truncate if exceeds max length
  if (message.length > template.maxLength) {
    message = message.substring(0, template.maxLength - 3) + '...';
  }
  
  return message;
}

// Function to validate SMS length
export function validateSMSLength(message: string, maxLength: number = 160): {
  isValid: boolean;
  length: number;
  segments: number;
} {
  const length = message.length;
  let segments = 1;
  
  if (length > 160) {
    // Multi-part SMS uses 153 chars per segment due to header overhead
    segments = Math.ceil(length / 153);
  }
  
  return {
    isValid: length <= maxLength * 5, // Allow up to 5 segments
    length,
    segments
  };
}

// Function to get all unique SMS categories
export function getSMSTemplateCategories(): string[] {
  const categories = new Set(DEFAULT_SMS_TEMPLATES.map(t => t.category));
  return Array.from(categories);
}

// Function to format phone number for SMS
export function formatPhoneForSMS(phone: string): string {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // Handle South African numbers
  if (cleaned.startsWith('0')) {
    cleaned = '27' + cleaned.substring(1);
  } else if (!cleaned.startsWith('27') && cleaned.length === 9) {
    cleaned = '27' + cleaned;
  }
  
  // Add + prefix for international format
  if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }
  
  return cleaned;
}