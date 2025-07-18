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

export const sampleInventoryTransactions = [
  {
    id: 1,
    productId: 1,
    transactionType: 'in' as const,
    quantity: 100,
    unitCost: "25.00",
    totalCost: "2500.00",
    reference: "PO-2025-001",
    notes: "Initial stock purchase",
    userId: 1,
    createdAt: new Date("2025-01-01")
  },
  {
    id: 2,
    productId: 1,
    transactionType: 'out' as const,
    quantity: 15,
    unitCost: "25.00",
    totalCost: "375.00",
    reference: "INV-2025-001",
    notes: "Sale to customer",
    userId: 1,
    createdAt: new Date("2025-01-10")
  },
  {
    id: 3,
    productId: 2,
    transactionType: 'in' as const,
    quantity: 50,
    unitCost: "150.00",
    totalCost: "7500.00",
    reference: "PO-2025-002",
    notes: "Restocking premium items",
    userId: 1,
    createdAt: new Date("2025-01-15")
  }
];

export const sampleCurrencyRates = [
  {
    id: 1,
    fromCurrency: "ZAR",
    toCurrency: "USD",
    rate: "0.054",
    validFrom: new Date("2025-01-01"),
    validTo: undefined,
    source: "manual",
    createdAt: new Date("2025-01-01")
  },
  {
    id: 2,
    fromCurrency: "USD",
    toCurrency: "ZAR",
    rate: "18.50",
    validFrom: new Date("2025-01-01"),
    validTo: undefined,
    source: "manual",
    createdAt: new Date("2025-01-01")
  },
  {
    id: 3,
    fromCurrency: "ZAR",
    toCurrency: "EUR",
    rate: "0.050",
    validFrom: new Date("2025-01-01"),
    validTo: undefined,
    source: "manual",
    createdAt: new Date("2025-01-01")
  }
];