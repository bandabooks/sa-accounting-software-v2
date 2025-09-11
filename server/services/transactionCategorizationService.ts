/**
 * Transaction Categorization Service
 * Advanced AI-powered categorization optimized for South African banking patterns
 */

interface TransactionCategory {
  id: string;
  name: string;
  type: 'income' | 'expense';
  confidence: number;
  vatApplicable: boolean;
  vatRate?: number;
  saSpecific: boolean;
}

interface CategoryRule {
  pattern: RegExp;
  category: TransactionCategory;
  priority: number;
}

export class TransactionCategorizationService {
  // South African specific banking patterns and categories
  private readonly saBankingRules: CategoryRule[] = [
    // Income patterns
    {
      pattern: /salary|wage|sal\s*pay|nett salary|gross salary|payroll/i,
      category: { id: 'salary', name: 'Salary & Wages', type: 'income', confidence: 0.95, vatApplicable: false, saSpecific: true },
      priority: 100
    },
    {
      pattern: /eft credit|electronic transfer|int credit|interest credit/i,
      category: { id: 'interest', name: 'Interest Income', type: 'income', confidence: 0.85, vatApplicable: false, saSpecific: true },
      priority: 90
    },
    {
      pattern: /sars refund|tax refund/i,
      category: { id: 'tax_refund', name: 'SARS Tax Refund', type: 'income', confidence: 0.98, vatApplicable: false, saSpecific: true },
      priority: 95
    },
    
    // Business expenses with VAT implications
    {
      pattern: /petrol|fuel|engen|bp|shell|sasol|total|caltex/i,
      category: { id: 'fuel', name: 'Fuel & Transport', type: 'expense', confidence: 0.90, vatApplicable: true, vatRate: 15, saSpecific: true },
      priority: 85
    },
    {
      pattern: /pick n pay|checkers|spar|woolworths|shoprite|makro/i,
      category: { id: 'groceries', name: 'Groceries & Supplies', type: 'expense', confidence: 0.88, vatApplicable: true, vatRate: 15, saSpecific: true },
      priority: 80
    },
    {
      pattern: /vodacom|mtn|cell c|telkom|rain|afrihost|webafrica/i,
      category: { id: 'communications', name: 'Telecommunications', type: 'expense', confidence: 0.92, vatApplicable: true, vatRate: 15, saSpecific: true },
      priority: 88
    },
    {
      pattern: /eskom|city power|municipal|electricity|water|refuse/i,
      category: { id: 'utilities', name: 'Utilities', type: 'expense', confidence: 0.94, vatApplicable: true, vatRate: 15, saSpecific: true },
      priority: 90
    },
    {
      pattern: /fnb|absa|standard bank|nedbank|capitec|bank charges|service fee/i,
      category: { id: 'bank_fees', name: 'Bank Fees', type: 'expense', confidence: 0.96, vatApplicable: true, vatRate: 15, saSpecific: true },
      priority: 92
    },
    
    // Tax and compliance
    {
      pattern: /sars|paye|uif|sdl|provisional tax|vat payment/i,
      category: { id: 'tax_payments', name: 'Tax Payments', type: 'expense', confidence: 0.98, vatApplicable: false, saSpecific: true },
      priority: 98
    },
    {
      pattern: /medical aid|discovery|momentum|bonitas|medshield/i,
      category: { id: 'medical', name: 'Medical & Healthcare', type: 'expense', confidence: 0.90, vatApplicable: false, saSpecific: true },
      priority: 85
    },
    
    // Insurance and professional services
    {
      pattern: /santam|outsurance|old mutual|sanlam|liberty|insurance/i,
      category: { id: 'insurance', name: 'Insurance', type: 'expense', confidence: 0.88, vatApplicable: true, vatRate: 15, saSpecific: true },
      priority: 85
    },
    {
      pattern: /audit|attorney|advocate|legal|professional service/i,
      category: { id: 'professional_fees', name: 'Professional Services', type: 'expense', confidence: 0.85, vatApplicable: true, vatRate: 15, saSpecific: true },
      priority: 80
    },
    
    // Generic patterns (lower priority)
    {
      pattern: /deposit|payment received|credit/i,
      category: { id: 'general_income', name: 'General Income', type: 'income', confidence: 0.60, vatApplicable: true, vatRate: 15, saSpecific: false },
      priority: 30
    },
    {
      pattern: /debit order|debit|payment|purchase/i,
      category: { id: 'general_expense', name: 'General Expense', type: 'expense', confidence: 0.50, vatApplicable: true, vatRate: 15, saSpecific: false },
      priority: 20
    }
  ];

  /**
   * Categorize a transaction using SA banking patterns
   */
  async categorizeTransaction(transaction: {
    description: string;
    amount: string;
    reference?: string;
  }): Promise<TransactionCategory> {
    const text = `${transaction.description} ${transaction.reference || ''}`.toLowerCase();
    const amount = parseFloat(transaction.amount);
    
    // Sort rules by priority (highest first)
    const sortedRules = this.saBankingRules.sort((a, b) => b.priority - a.priority);
    
    for (const rule of sortedRules) {
      if (rule.pattern.test(text)) {
        const category = { ...rule.category };
        
        // Adjust confidence based on amount patterns for SA context
        if (category.saSpecific) {
          category.confidence = this.adjustConfidenceForSAContext(category, amount, text);
        }
        
        return category;
      }
    }
    
    // Fallback categorization based on amount
    return amount >= 0 
      ? { id: 'uncategorized_income', name: 'Uncategorized Income', type: 'income', confidence: 0.30, vatApplicable: false, saSpecific: false }
      : { id: 'uncategorized_expense', name: 'Uncategorized Expense', type: 'expense', confidence: 0.30, vatApplicable: false, saSpecific: false };
  }

  /**
   * Adjust confidence based on South African context clues
   */
  private adjustConfidenceForSAContext(category: TransactionCategory, amount: number, text: string): number {
    let confidence = category.confidence;
    
    // Increase confidence for typical SA amounts
    if (category.id === 'fuel' && Math.abs(amount) > 300 && Math.abs(amount) < 2000) {
      confidence = Math.min(0.98, confidence + 0.08);
    }
    
    if (category.id === 'utilities' && Math.abs(amount) > 500 && Math.abs(amount) < 5000) {
      confidence = Math.min(0.97, confidence + 0.06);
    }
    
    if (category.id === 'salary' && Math.abs(amount) > 10000) {
      confidence = Math.min(0.99, confidence + 0.04);
    }
    
    // Increase confidence for ZAR currency indicators
    if (text.includes('zar') || text.includes('r ') || text.includes('rand')) {
      confidence = Math.min(0.95, confidence + 0.05);
    }
    
    return confidence;
  }

  /**
   * Get VAT-deductible categories for SA compliance
   */
  getVATDeductibleCategories(): TransactionCategory[] {
    return this.saBankingRules
      .map(rule => rule.category)
      .filter(category => category.vatApplicable && category.type === 'expense')
      .sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Analyze transaction patterns for insights
   */
  async analyzeTransactionPatterns(transactions: Array<{
    description: string;
    amount: string;
    transactionDate: string;
  }>): Promise<{
    categories: Record<string, { count: number; totalAmount: number; avgAmount: number }>;
    vatDeductible: number;
    topExpenseCategories: Array<{ category: string; amount: number; percentage: number }>;
    monthlyTrends: Record<string, number>;
  }> {
    const categories: Record<string, { count: number; totalAmount: number; avgAmount: number }> = {};
    let vatDeductibleAmount = 0;
    const monthlyTrends: Record<string, number> = {};

    for (const transaction of transactions) {
      const category = await this.categorizeTransaction(transaction);
      const amount = Math.abs(parseFloat(transaction.amount));
      const month = new Date(transaction.transactionDate).toISOString().slice(0, 7);

      // Track categories
      if (!categories[category.name]) {
        categories[category.name] = { count: 0, totalAmount: 0, avgAmount: 0 };
      }
      categories[category.name].count++;
      categories[category.name].totalAmount += amount;
      categories[category.name].avgAmount = categories[category.name].totalAmount / categories[category.name].count;

      // Track VAT deductible amounts
      if (category.vatApplicable && category.type === 'expense') {
        vatDeductibleAmount += amount;
      }

      // Track monthly trends
      monthlyTrends[month] = (monthlyTrends[month] || 0) + amount;
    }

    // Calculate top expense categories
    const expenseCategories = Object.entries(categories)
      .filter(([name]) => {
        const rule = this.saBankingRules.find(r => r.category.name === name);
        return rule?.category.type === 'expense';
      })
      .map(([name, data]) => ({ category: name, amount: data.totalAmount, percentage: 0 }))
      .sort((a, b) => b.amount - a.amount);

    const totalExpenses = expenseCategories.reduce((sum, cat) => sum + cat.amount, 0);
    expenseCategories.forEach(cat => {
      cat.percentage = totalExpenses > 0 ? (cat.amount / totalExpenses) * 100 : 0;
    });

    return {
      categories,
      vatDeductible: vatDeductibleAmount,
      topExpenseCategories: expenseCategories.slice(0, 10),
      monthlyTrends
    };
  }

  /**
   * Get category suggestions for manual override
   */
  getCategorySuggestions(type: 'income' | 'expense' | 'all' = 'all'): TransactionCategory[] {
    const categories = this.saBankingRules.map(rule => rule.category);
    const uniqueCategories = categories.reduce((acc, category) => {
      if (!acc.find(c => c.id === category.id)) {
        acc.push(category);
      }
      return acc;
    }, [] as TransactionCategory[]);

    return uniqueCategories
      .filter(category => type === 'all' || category.type === type)
      .sort((a, b) => {
        // SA-specific categories first, then by confidence
        if (a.saSpecific !== b.saSpecific) {
          return a.saSpecific ? -1 : 1;
        }
        return b.confidence - a.confidence;
      });
  }
}

export const transactionCategorizationService = new TransactionCategorizationService();