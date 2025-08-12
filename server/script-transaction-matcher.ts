/**
 * Script-based transaction auto-matching system
 * Provides rule-based categorization without AI dependency
 */
export interface ScriptMatchResult {
  accountId: number;
  accountName: string;
  vatRate: number;
  vatType: string;
  confidence: number;
  reasoning: string;
}

export interface TransactionForMatching {
  id: number;
  description: string;
  amount: number;
  type: 'income' | 'expense';
}

export class ScriptTransactionMatcher {
  
  /**
   * Rule-based transaction matching patterns for South African businesses
   */
  private expensePatterns = [
    // Salary and Employee Costs
    {
      patterns: ['salary', 'salaries', 'wages', 'payroll', 'employee', 'staff', 'remuneration'],
      accountName: 'Employee Costs',
      vatRate: 0,
      vatType: 'Exempt',
      confidence: 0.95,
      reasoning: 'Employee costs are VAT exempt'
    },
    
    // Office Supplies and Stationery
    {
      patterns: ['office supplies', 'stationery', 'printing', 'paper', 'pens', 'takealot', 'office depot'],
      accountName: 'Office Supplies',
      vatRate: 15,
      vatType: 'Standard Rate',
      confidence: 0.90,
      reasoning: 'Office supplies typically subject to 15% VAT'
    },
    
    // Rent and Property
    {
      patterns: ['rent', 'rental', 'lease', 'property', 'premises', 'office rent', 'shop rent'],
      accountName: 'Rent Expense',
      vatRate: 15,
      vatType: 'Standard Rate',
      confidence: 0.95,
      reasoning: 'Commercial rent subject to 15% VAT'
    },
    
    // Utilities
    {
      patterns: ['electricity', 'water', 'gas', 'utilities', 'eskom', 'municipal', 'city power'],
      accountName: 'Utilities',
      vatRate: 15,
      vatType: 'Standard Rate',
      confidence: 0.90,
      reasoning: 'Utilities subject to 15% VAT'
    },
    
    // Telecommunications
    {
      patterns: ['telephone', 'internet', 'cell phone', 'mobile', 'telkom', 'mtn', 'vodacom', 'cell c'],
      accountName: 'Telephone & Internet',
      vatRate: 15,
      vatType: 'Standard Rate',
      confidence: 0.90,
      reasoning: 'Telecommunications services subject to 15% VAT'
    },
    
    // Transport and Fuel
    {
      patterns: ['fuel', 'petrol', 'diesel', 'transport', 'travel', 'uber', 'taxi', 'bolt', 'engen', 'shell', 'bp'],
      accountName: 'Transport & Travel',
      vatRate: 15,
      vatType: 'Standard Rate',
      confidence: 0.90,
      reasoning: 'Transport and fuel costs subject to 15% VAT'
    },
    
    // Bank Charges
    {
      patterns: ['bank charges', 'bank fees', 'transaction fee', 'service fee', 'fnb', 'absa', 'standard bank', 'nedbank'],
      accountName: 'Bank Charges',
      vatRate: 15,
      vatType: 'Standard Rate',
      confidence: 0.95,
      reasoning: 'Bank charges subject to 15% VAT'
    },
    
    // Insurance
    {
      patterns: ['insurance', 'premium', 'santam', 'outsurance', 'hollard', 'short term insurance'],
      accountName: 'Insurance',
      vatRate: 15,
      vatType: 'Standard Rate',
      confidence: 0.90,
      reasoning: 'Insurance premiums subject to 15% VAT'
    },
    
    // Professional Services
    {
      patterns: ['consulting', 'professional fees', 'legal', 'accounting', 'audit', 'attorney', 'lawyer'],
      accountName: 'Professional Fees',
      vatRate: 15,
      vatType: 'Standard Rate',
      confidence: 0.90,
      reasoning: 'Professional services subject to 15% VAT'
    },
    
    // Marketing and Advertising
    {
      patterns: ['advertising', 'marketing', 'promotion', 'facebook', 'google ads', 'social media'],
      accountName: 'Marketing & Advertising',
      vatRate: 15,
      vatType: 'Standard Rate',
      confidence: 0.90,
      reasoning: 'Marketing and advertising costs subject to 15% VAT'
    },
    
    // Equipment and Assets
    {
      patterns: ['equipment', 'computer', 'laptop', 'furniture', 'machinery', 'tools'],
      accountName: 'Equipment & Furniture',
      vatRate: 15,
      vatType: 'Standard Rate',
      confidence: 0.85,
      reasoning: 'Equipment purchases subject to 15% VAT'
    },

    // Generic expense fallback
    {
      patterns: ['expense', 'cost', 'payment', 'purchase'],
      accountName: 'General Expenses',
      vatRate: 15,
      vatType: 'Standard Rate',
      confidence: 0.60,
      reasoning: 'General expense classification with standard VAT'
    }
  ];

  private incomePatterns = [
    // Sales Revenue
    {
      patterns: ['sales', 'revenue', 'income', 'deposit', 'payment received', 'customer payment', 'invoice'],
      accountName: 'Sales Revenue',
      vatRate: 15,
      vatType: 'Standard Rate',
      confidence: 0.90,
      reasoning: 'Sales revenue subject to 15% VAT'
    },
    
    // Service Income
    {
      patterns: ['service', 'consulting', 'professional', 'fees', 'commission'],
      accountName: 'Service Income',
      vatRate: 15,
      vatType: 'Standard Rate',
      confidence: 0.85,
      reasoning: 'Service income subject to 15% VAT'
    },
    
    // Interest Income
    {
      patterns: ['interest', 'bank interest', 'investment'],
      accountName: 'Interest Income',
      vatRate: 0,
      vatType: 'Exempt',
      confidence: 0.95,
      reasoning: 'Interest income is VAT exempt'
    },
    
    // Generic income fallback
    {
      patterns: ['income', 'receipt', 'received'],
      accountName: 'Other Income',
      vatRate: 15,
      vatType: 'Standard Rate',
      confidence: 0.60,
      reasoning: 'General income classification'
    }
  ];

  /**
   * Match transactions using rule-based patterns
   */
  async matchTransactions(
    transactions: TransactionForMatching[],
    chartOfAccounts: Array<{id: number; accountName: string; accountType: string}>
  ): Promise<Array<{transaction: TransactionForMatching; match: ScriptMatchResult | null}>> {
    
    return transactions.map(transaction => {
      const match = this.findBestMatch(transaction, chartOfAccounts);
      return {
        transaction,
        match
      };
    });
  }

  /**
   * Find the best pattern match for a transaction
   */
  private findBestMatch(
    transaction: TransactionForMatching, 
    chartOfAccounts: Array<{id: number; accountName: string; accountType: string}>
  ): ScriptMatchResult | null {
    
    const description = transaction.description.toLowerCase();
    const patterns = transaction.type === 'expense' ? this.expensePatterns : this.incomePatterns;
    
    // Find matching patterns
    for (const pattern of patterns) {
      const matchFound = pattern.patterns.some(p => description.includes(p.toLowerCase()));
      
      if (matchFound) {
        // Find corresponding account in chart of accounts
        const account = chartOfAccounts.find(acc => 
          acc.accountName.toLowerCase().includes(pattern.accountName.toLowerCase()) ||
          pattern.accountName.toLowerCase().includes(acc.accountName.toLowerCase())
        );
        
        if (account) {
          return {
            accountId: account.id,
            accountName: account.accountName,
            vatRate: pattern.vatRate,
            vatType: pattern.vatType,
            confidence: pattern.confidence,
            reasoning: pattern.reasoning
          };
        }
      }
    }
    
    // Fallback to default accounts
    const defaultAccount = this.getDefaultAccount(transaction.type, chartOfAccounts);
    if (defaultAccount) {
      return {
        accountId: defaultAccount.id,
        accountName: defaultAccount.accountName,
        vatRate: transaction.type === 'expense' ? 15 : 15,
        vatType: 'Standard Rate',
        confidence: 0.50,
        reasoning: `Fallback to default ${transaction.type} account`
      };
    }
    
    return null;
  }

  /**
   * Get default account for transaction type
   */
  private getDefaultAccount(
    type: 'income' | 'expense',
    chartOfAccounts: Array<{id: number; accountName: string; accountType: string}>
  ) {
    if (type === 'expense') {
      return chartOfAccounts.find(acc => 
        acc.accountName.toLowerCase().includes('general expense') ||
        acc.accountName.toLowerCase().includes('other expense') ||
        acc.accountType.toLowerCase() === 'expense'
      );
    } else {
      return chartOfAccounts.find(acc => 
        acc.accountName.toLowerCase().includes('sales') ||
        acc.accountName.toLowerCase().includes('revenue') ||
        acc.accountName.toLowerCase().includes('income')
      );
    }
  }

  /**
   * Get pattern suggestions for learning
   */
  getPatternSuggestions(description: string): Array<{pattern: string; confidence: number}> {
    const desc = description.toLowerCase();
    const suggestions: Array<{pattern: string; confidence: number}> = [];
    
    // Check against all patterns
    [...this.expensePatterns, ...this.incomePatterns].forEach(pattern => {
      pattern.patterns.forEach(p => {
        if (desc.includes(p.toLowerCase())) {
          suggestions.push({
            pattern: p,
            confidence: pattern.confidence
          });
        }
      });
    });
    
    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }
}