// Extension for in-memory storage to support advanced features
// This will be merged with the main storage class

export interface StorageExtension {
  // Company Settings
  companySettings: Array<{
    id: number;
    companyName: string;
    companyEmail?: string;
    companyPhone?: string;
    companyAddress?: string;
    vatNumber?: string;
    registrationNumber?: string;
    logo?: string;
    primaryCurrency: string;
    secondaryCurrencies: string[];
    exchangeRates: Record<string, number>;
    invoicePrefix: string;
    estimatePrefix: string;
    paymentTerms?: string;
    emailReminderDays: number[];
    autoEmailReminders: boolean;
    fiscalYearStart: string;
    taxRate: string;
    createdAt: Date;
    updatedAt: Date;
  }>;

  // Inventory transactions
  inventoryTransactions: Array<{
    id: number;
    productId: number;
    transactionType: 'in' | 'out' | 'adjustment';
    quantity: number;
    unitCost?: string;
    totalCost?: string;
    reference?: string;
    notes?: string;
    userId: number;
    createdAt: Date;
  }>;

  // Email reminders
  emailReminders: Array<{
    id: number;
    invoiceId: number;
    reminderType: 'overdue' | 'payment_due';
    daysBefore: number;
    emailSent: boolean;
    sentAt?: Date;
    scheduledFor: Date;
    createdAt: Date;
  }>;

  // Currency rates
  currencyRates: Array<{
    id: number;
    fromCurrency: string;
    toCurrency: string;
    rate: string;
    validFrom: Date;
    validTo?: Date;
    source: string;
    createdAt: Date;
  }>;

  // Next IDs
  nextCompanySettingsId: number;
  nextInventoryTransactionId: number;
  nextEmailReminderId: number;
  nextCurrencyRateId: number;
}

// Default data for new features
export const defaultCompanySettings = {
  id: 1,
  companyName: "Think Mybiz Accounting",
  companyEmail: "info@thinkmybiz.com",
  companyPhone: "+27 11 123 4567",
  companyAddress: "123 Business Street\nSandton, Johannesburg\n2196\nSouth Africa",
  vatNumber: "4123456789",
  registrationNumber: "2023/123456/07",
  logo: "",
  primaryCurrency: "ZAR",
  secondaryCurrencies: ["USD", "EUR", "GBP"],
  exchangeRates: {
    "USD": 18.50,
    "EUR": 20.15,
    "GBP": 23.40
  },
  invoicePrefix: "INV",
  estimatePrefix: "EST",
  paymentTerms: "Payment is due within 30 days of invoice date. Late payments may incur interest charges.",
  emailReminderDays: [7, 3, 1],
  autoEmailReminders: true,
  fiscalYearStart: "2025-01-01",
  taxRate: "15.00",
  createdAt: new Date(),
  updatedAt: new Date()
};

// Sample data removed - system now uses only real business transactions

// Sample currency rates removed - system now uses real exchange rates