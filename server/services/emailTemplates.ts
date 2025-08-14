// Professional Email Templates for Accounting Services

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  category: string;
  bodyHtml: string;
  bodyText: string;
  variables: string[];
  isActive: boolean;
}

export const DEFAULT_EMAIL_TEMPLATES: EmailTemplate[] = [
  // Invoice & Payment Templates
  {
    id: 'invoice-new',
    name: 'New Invoice',
    subject: 'Invoice #{invoiceNumber} from {companyName}',
    category: 'Invoicing',
    bodyHtml: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">{companyName}</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <p>Dear {customerName},</p>
          <p>Please find attached invoice <strong>#{invoiceNumber}</strong> for your recent purchase.</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Invoice Details:</h3>
            <p><strong>Invoice Number:</strong> #{invoiceNumber}</p>
            <p><strong>Date:</strong> {invoiceDate}</p>
            <p><strong>Due Date:</strong> {dueDate}</p>
            <p><strong>Total Amount:</strong> {currency} {totalAmount}</p>
          </div>
          
          <p>Payment can be made via EFT, credit card, or through our online payment portal.</p>
          <p>If you have any questions regarding this invoice, please don't hesitate to contact us.</p>
          
          <div style="margin-top: 30px;">
            <a href="{paymentLink}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Pay Now</a>
          </div>
          
          <p style="margin-top: 30px;">Thank you for your business!</p>
          <p>Best regards,<br>{senderName}<br>{companyName}</p>
        </div>
        <div style="padding: 20px; background: #f3f4f6; text-align: center; font-size: 12px; color: #6b7280;">
          <p>{companyAddress}</p>
          <p>Tel: {companyPhone} | Email: {companyEmail}</p>
        </div>
      </div>
    `,
    bodyText: `Dear {customerName},\n\nPlease find attached invoice #{invoiceNumber} for your recent purchase.\n\nInvoice Details:\nInvoice Number: #{invoiceNumber}\nDate: {invoiceDate}\nDue Date: {dueDate}\nTotal Amount: {currency} {totalAmount}\n\nPayment Link: {paymentLink}\n\nThank you for your business!\n\nBest regards,\n{senderName}\n{companyName}`,
    variables: ['customerName', 'invoiceNumber', 'invoiceDate', 'dueDate', 'totalAmount', 'currency', 'paymentLink', 'senderName', 'companyName', 'companyAddress', 'companyPhone', 'companyEmail'],
    isActive: true
  },
  
  {
    id: 'payment-reminder',
    name: 'Payment Reminder',
    subject: 'Payment Reminder - Invoice #{invoiceNumber}',
    category: 'Invoicing',
    bodyHtml: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #fbbf24; padding: 20px; text-align: center;">
          <h2 style="color: #92400e; margin: 0;">Payment Reminder</h2>
        </div>
        <div style="padding: 30px; background: #fffbeb;">
          <p>Dear {customerName},</p>
          <p>This is a friendly reminder that invoice <strong>#{invoiceNumber}</strong> dated {invoiceDate} is now <strong>{daysOverdue} days overdue</strong>.</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #fbbf24;">
            <p><strong>Outstanding Amount:</strong> {currency} {outstandingAmount}</p>
            <p><strong>Original Due Date:</strong> {dueDate}</p>
          </div>
          
          <p>Please arrange payment at your earliest convenience to avoid any late fees or service interruptions.</p>
          
          <div style="margin-top: 30px;">
            <a href="{paymentLink}" style="background: #fbbf24; color: #92400e; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Pay Now</a>
          </div>
          
          <p style="margin-top: 30px;">If you have already made this payment, please disregard this reminder and accept our thanks.</p>
          <p>For any queries, please contact our accounts department.</p>
          
          <p>Kind regards,<br>{companyName} Accounts Team</p>
        </div>
      </div>
    `,
    bodyText: `Dear {customerName},\n\nThis is a friendly reminder that invoice #{invoiceNumber} dated {invoiceDate} is now {daysOverdue} days overdue.\n\nOutstanding Amount: {currency} {outstandingAmount}\nOriginal Due Date: {dueDate}\n\nPayment Link: {paymentLink}\n\nPlease arrange payment at your earliest convenience.\n\nKind regards,\n{companyName} Accounts Team`,
    variables: ['customerName', 'invoiceNumber', 'invoiceDate', 'dueDate', 'daysOverdue', 'outstandingAmount', 'currency', 'paymentLink', 'companyName'],
    isActive: true
  },

  {
    id: 'payment-received',
    name: 'Payment Received',
    subject: 'Payment Received - Thank You!',
    category: 'Payments',
    bodyHtml: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Payment Received</h1>
        </div>
        <div style="padding: 30px; background: #f0fdf4;">
          <p>Dear {customerName},</p>
          <p>Thank you! We have received your payment of <strong>{currency} {paymentAmount}</strong> for invoice #{invoiceNumber}.</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Payment Details:</h3>
            <p><strong>Payment Date:</strong> {paymentDate}</p>
            <p><strong>Payment Method:</strong> {paymentMethod}</p>
            <p><strong>Reference Number:</strong> {referenceNumber}</p>
            <p><strong>Amount Received:</strong> {currency} {paymentAmount}</p>
          </div>
          
          <p>Your account has been updated accordingly. A payment receipt is attached for your records.</p>
          <p>We appreciate your prompt payment and look forward to continuing our business relationship.</p>
          
          <p style="margin-top: 30px;">Best regards,<br>{companyName}</p>
        </div>
      </div>
    `,
    bodyText: `Dear {customerName},\n\nThank you! We have received your payment of {currency} {paymentAmount} for invoice #{invoiceNumber}.\n\nPayment Details:\nPayment Date: {paymentDate}\nPayment Method: {paymentMethod}\nReference Number: {referenceNumber}\n\nYour account has been updated accordingly.\n\nBest regards,\n{companyName}`,
    variables: ['customerName', 'invoiceNumber', 'paymentAmount', 'currency', 'paymentDate', 'paymentMethod', 'referenceNumber', 'companyName'],
    isActive: true
  },

  // Professional Service Templates
  {
    id: 'tax-return-ready',
    name: 'Tax Return Ready for Review',
    subject: 'Your Tax Return is Ready for Review',
    category: 'Tax Services',
    bodyHtml: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Tax Return Ready</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <p>Dear {clientName},</p>
          <p>Good news! Your {taxYear} tax return has been completed and is ready for your review.</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Tax Return Summary:</h3>
            <p><strong>Tax Year:</strong> {taxYear}</p>
            <p><strong>Filing Status:</strong> {filingStatus}</p>
            <p><strong>Estimated Refund/Amount Due:</strong> {currency} {taxAmount}</p>
            <p><strong>Submission Deadline:</strong> {deadline}</p>
          </div>
          
          <p>Please review the attached documents carefully. Once you approve, we will proceed with the submission to SARS.</p>
          
          <h4>Next Steps:</h4>
          <ol>
            <li>Review all attached documents</li>
            <li>Sign the authorization forms</li>
            <li>Confirm your banking details for refund (if applicable)</li>
            <li>Reply to this email with your approval</li>
          </ol>
          
          <div style="margin-top: 30px;">
            <a href="{reviewLink}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Review Documents</a>
          </div>
          
          <p style="margin-top: 30px;">If you have any questions or need clarification, please don't hesitate to contact us.</p>
          <p>Best regards,<br>{accountantName}<br>{companyName}</p>
        </div>
      </div>
    `,
    bodyText: `Dear {clientName},\n\nYour {taxYear} tax return has been completed and is ready for your review.\n\nTax Return Summary:\nTax Year: {taxYear}\nFiling Status: {filingStatus}\nEstimated Refund/Amount Due: {currency} {taxAmount}\nSubmission Deadline: {deadline}\n\nPlease review the attached documents and reply with your approval.\n\nBest regards,\n{accountantName}\n{companyName}`,
    variables: ['clientName', 'taxYear', 'filingStatus', 'taxAmount', 'currency', 'deadline', 'reviewLink', 'accountantName', 'companyName'],
    isActive: true
  },

  {
    id: 'document-request',
    name: 'Document Request',
    subject: 'Documents Required - {documentType}',
    category: 'Document Management',
    bodyHtml: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #3b82f6; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Document Request</h1>
        </div>
        <div style="padding: 30px; background: #eff6ff;">
          <p>Dear {clientName},</p>
          <p>To proceed with {serviceType}, we require the following documents from you:</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Required Documents:</h3>
            <ul style="line-height: 1.8;">
              {documentList}
            </ul>
            <p style="color: #ef4444; font-weight: bold;">Deadline: {deadline}</p>
          </div>
          
          <p>You can upload these documents securely through our client portal or reply to this email with the attachments.</p>
          
          <div style="margin-top: 30px;">
            <a href="{uploadLink}" style="background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Upload Documents</a>
          </div>
          
          <p style="margin-top: 30px;">Please ensure all documents are clear and legible. If you have any questions about the required documents, please contact us.</p>
          
          <p>Thank you for your cooperation.</p>
          <p>Best regards,<br>{senderName}<br>{companyName}</p>
        </div>
      </div>
    `,
    bodyText: `Dear {clientName},\n\nTo proceed with {serviceType}, we require the following documents:\n\n{documentList}\n\nDeadline: {deadline}\n\nUpload Link: {uploadLink}\n\nPlease ensure all documents are clear and legible.\n\nBest regards,\n{senderName}\n{companyName}`,
    variables: ['clientName', 'serviceType', 'documentList', 'deadline', 'uploadLink', 'senderName', 'companyName', 'documentType'],
    isActive: true
  },

  {
    id: 'engagement-letter',
    name: 'Engagement Letter',
    subject: 'Engagement Letter - {serviceType}',
    category: 'Client Onboarding',
    bodyHtml: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Engagement Letter</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <p>Dear {clientName},</p>
          <p>Thank you for choosing {companyName} for your {serviceType} needs. Please find attached our engagement letter outlining the terms of our professional services.</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Service Details:</h3>
            <p><strong>Service Type:</strong> {serviceType}</p>
            <p><strong>Service Period:</strong> {servicePeriod}</p>
            <p><strong>Fee Structure:</strong> {feeStructure}</p>
            <p><strong>Estimated Fee:</strong> {currency} {estimatedFee}</p>
          </div>
          
          <h4>Scope of Services:</h4>
          <p>{serviceScope}</p>
          
          <h4>Next Steps:</h4>
          <ol>
            <li>Review the attached engagement letter carefully</li>
            <li>Sign and date where indicated</li>
            <li>Return the signed copy via email or upload to our portal</li>
            <li>Schedule an initial consultation if needed</li>
          </ol>
          
          <div style="margin-top: 30px;">
            <a href="{signatureLink}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Sign Digitally</a>
          </div>
          
          <p style="margin-top: 30px;">We look forward to working with you. If you have any questions about the engagement terms, please contact us.</p>
          
          <p>Best regards,<br>{partnerName}<br>{companyName}</p>
        </div>
      </div>
    `,
    bodyText: `Dear {clientName},\n\nThank you for choosing {companyName} for your {serviceType} needs.\n\nService Details:\nService Type: {serviceType}\nService Period: {servicePeriod}\nFee Structure: {feeStructure}\nEstimated Fee: {currency} {estimatedFee}\n\nPlease review and sign the attached engagement letter.\n\nBest regards,\n{partnerName}\n{companyName}`,
    variables: ['clientName', 'serviceType', 'servicePeriod', 'feeStructure', 'estimatedFee', 'currency', 'serviceScope', 'signatureLink', 'partnerName', 'companyName'],
    isActive: true
  },

  // Compliance & Regulatory Templates
  {
    id: 'vat-return-reminder',
    name: 'VAT Return Reminder',
    subject: 'VAT Return Due - {period}',
    category: 'VAT Compliance',
    bodyHtml: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #dc2626; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">VAT Return Reminder</h1>
        </div>
        <div style="padding: 30px; background: #fef2f2;">
          <p>Dear {clientName},</p>
          <p>This is an important reminder that your VAT return for <strong>{period}</strong> is due for submission.</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <h3 style="color: #333; margin-top: 0;">VAT Return Details:</h3>
            <p><strong>Period:</strong> {period}</p>
            <p><strong>Due Date:</strong> {dueDate}</p>
            <p><strong>Output VAT:</strong> {currency} {outputVat}</p>
            <p><strong>Input VAT:</strong> {currency} {inputVat}</p>
            <p><strong>Net VAT Payable/Refundable:</strong> {currency} {netVat}</p>
          </div>
          
          <p><strong>Action Required:</strong> Please review and approve the VAT return so we can submit it to SARS before the deadline.</p>
          
          <p>Late submission may result in penalties and interest charges.</p>
          
          <div style="margin-top: 30px;">
            <a href="{reviewLink}" style="background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Review VAT Return</a>
          </div>
          
          <p style="margin-top: 30px;">If you need assistance or have questions about your VAT return, please contact us immediately.</p>
          
          <p>Regards,<br>{companyName} VAT Team</p>
        </div>
      </div>
    `,
    bodyText: `Dear {clientName},\n\nYour VAT return for {period} is due for submission.\n\nVAT Return Details:\nPeriod: {period}\nDue Date: {dueDate}\nOutput VAT: {currency} {outputVat}\nInput VAT: {currency} {inputVat}\nNet VAT Payable/Refundable: {currency} {netVat}\n\nPlease review and approve the VAT return urgently.\n\nRegards,\n{companyName} VAT Team`,
    variables: ['clientName', 'period', 'dueDate', 'outputVat', 'inputVat', 'netVat', 'currency', 'reviewLink', 'companyName'],
    isActive: true
  },

  {
    id: 'year-end-preparation',
    name: 'Year-End Preparation',
    subject: 'Year-End Preparation - Action Required',
    category: 'Year-End',
    bodyHtml: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Year-End Preparation</h1>
        </div>
        <div style="padding: 30px; background: #fffbeb;">
          <p>Dear {clientName},</p>
          <p>As we approach the financial year-end on <strong>{yearEndDate}</strong>, it's time to prepare for year-end procedures and compliance requirements.</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Year-End Checklist:</h3>
            <ul style="line-height: 1.8;">
              <li>Reconcile all bank accounts</li>
              <li>Review and clear suspense accounts</li>
              <li>Confirm debtor and creditor balances</li>
              <li>Complete stock counts and valuations</li>
              <li>Review fixed asset register</li>
              <li>Prepare supporting documentation</li>
              <li>Review provisional tax payments</li>
              <li>Plan for audit requirements</li>
            </ul>
          </div>
          
          <p>We recommend scheduling a year-end planning meeting to ensure all requirements are met and to discuss tax planning opportunities.</p>
          
          <div style="margin-top: 30px;">
            <a href="{scheduleLink}" style="background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Schedule Meeting</a>
          </div>
          
          <p style="margin-top: 30px;">Early preparation ensures compliance and helps identify tax-saving opportunities.</p>
          
          <p>Best regards,<br>{accountantName}<br>{companyName}</p>
        </div>
      </div>
    `,
    bodyText: `Dear {clientName},\n\nAs we approach the financial year-end on {yearEndDate}, it's time to prepare for year-end procedures.\n\nPlease review the year-end checklist and schedule a planning meeting.\n\nSchedule Link: {scheduleLink}\n\nBest regards,\n{accountantName}\n{companyName}`,
    variables: ['clientName', 'yearEndDate', 'scheduleLink', 'accountantName', 'companyName'],
    isActive: true
  },

  // Customer Relationship Templates
  {
    id: 'welcome-new-client',
    name: 'Welcome New Client',
    subject: 'Welcome to {companyName}',
    category: 'Client Onboarding',
    bodyHtml: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
          <h1 style="color: white; margin: 0;">Welcome to {companyName}!</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <p>Dear {clientName},</p>
          <p>Welcome! We're excited to have you as our valued client and look forward to supporting your financial success.</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Your Account Details:</h3>
            <p><strong>Client ID:</strong> {clientId}</p>
            <p><strong>Assigned Team:</strong> {assignedTeam}</p>
            <p><strong>Primary Contact:</strong> {primaryContact}</p>
            <p><strong>Direct Line:</strong> {contactPhone}</p>
            <p><strong>Email:</strong> {contactEmail}</p>
          </div>
          
          <h4>What Happens Next:</h4>
          <ol style="line-height: 1.8;">
            <li>You'll receive login credentials for our client portal</li>
            <li>We'll schedule an onboarding call to understand your needs</li>
            <li>You'll receive a welcome pack with important information</li>
            <li>We'll set up your accounting systems and processes</li>
          </ol>
          
          <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Client Portal:</strong> Access your documents, invoices, and reports anytime at {portalUrl}</p>
          </div>
          
          <p>If you have any immediate questions, please don't hesitate to reach out to your assigned team.</p>
          
          <p style="margin-top: 30px;">We look forward to a successful partnership!</p>
          <p>Warm regards,<br>{companyName} Team</p>
        </div>
      </div>
    `,
    bodyText: `Dear {clientName},\n\nWelcome to {companyName}! We're excited to have you as our valued client.\n\nYour Account Details:\nClient ID: {clientId}\nAssigned Team: {assignedTeam}\nPrimary Contact: {primaryContact}\nDirect Line: {contactPhone}\n\nClient Portal: {portalUrl}\n\nWe look forward to a successful partnership!\n\nWarm regards,\n{companyName} Team`,
    variables: ['clientName', 'clientId', 'assignedTeam', 'primaryContact', 'contactPhone', 'contactEmail', 'portalUrl', 'companyName'],
    isActive: true
  },

  {
    id: 'statement-of-account',
    name: 'Statement of Account',
    subject: 'Statement of Account - {period}',
    category: 'Account Management',
    bodyHtml: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1f2937; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Statement of Account</h1>
        </div>
        <div style="padding: 30px; background: #f9fafb;">
          <p>Dear {clientName},</p>
          <p>Please find attached your statement of account for the period <strong>{period}</strong>.</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Account Summary:</h3>
            <p><strong>Opening Balance:</strong> {currency} {openingBalance}</p>
            <p><strong>Total Invoiced:</strong> {currency} {totalInvoiced}</p>
            <p><strong>Total Payments:</strong> {currency} {totalPayments}</p>
            <p><strong>Current Balance:</strong> {currency} {currentBalance}</p>
            
            {overdueAmount > 0 ? '<p style="color: #dc2626; font-weight: bold;">Overdue Amount: {currency} {overdueAmount}</p>' : ''}
          </div>
          
          <p>The detailed statement is attached to this email for your records.</p>
          
          {overdueAmount > 0 ? '<p><strong>Please note:</strong> There is an overdue amount on your account. We kindly request payment at your earliest convenience.</p>' : ''}
          
          <p>If you have any queries regarding your account, please contact our accounts department.</p>
          
          <p>Thank you for your continued business.</p>
          <p>Regards,<br>{companyName} Accounts Department</p>
        </div>
      </div>
    `,
    bodyText: `Dear {clientName},\n\nPlease find attached your statement of account for {period}.\n\nAccount Summary:\nOpening Balance: {currency} {openingBalance}\nTotal Invoiced: {currency} {totalInvoiced}\nTotal Payments: {currency} {totalPayments}\nCurrent Balance: {currency} {currentBalance}\n\nThank you for your continued business.\n\nRegards,\n{companyName} Accounts Department`,
    variables: ['clientName', 'period', 'openingBalance', 'totalInvoiced', 'totalPayments', 'currentBalance', 'overdueAmount', 'currency', 'companyName'],
    isActive: true
  }
];

// Function to get template by ID
export function getEmailTemplate(templateId: string): EmailTemplate | undefined {
  return DEFAULT_EMAIL_TEMPLATES.find(t => t.id === templateId);
}

// Function to get templates by category
export function getEmailTemplatesByCategory(category: string): EmailTemplate[] {
  return DEFAULT_EMAIL_TEMPLATES.filter(t => t.category === category);
}

// Function to populate template with variables
export function populateEmailTemplate(template: EmailTemplate, variables: Record<string, any>): {
  subject: string;
  bodyHtml: string;
  bodyText: string;
} {
  let subject = template.subject;
  let bodyHtml = template.bodyHtml;
  let bodyText = template.bodyText;
  
  // Replace variables in subject and body
  Object.keys(variables).forEach(key => {
    const value = variables[key] || '';
    const regex = new RegExp(`{${key}}`, 'g');
    subject = subject.replace(regex, value);
    bodyHtml = bodyHtml.replace(regex, value);
    bodyText = bodyText.replace(regex, value);
  });
  
  return { subject, bodyHtml, bodyText };
}

// Function to get all unique categories
export function getEmailTemplateCategories(): string[] {
  const categories = new Set(DEFAULT_EMAIL_TEMPLATES.map(t => t.category));
  return Array.from(categories);
}