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
    
    // Bank Charges - Enhanced patterns for FNB App transactions
    {
      patterns: ['bank charges', 'bank fees', 'transaction fee', 'service fee', 'fnb', 'absa', 'standard bank', 'nedbank', 'fnb app', 'app rct', 'receipt', 'rct pmt', 'pmt to'],
      accountName: 'Bank Charges',
      vatRate: 15,
      vatType: 'Standard Rate',
      confidence: 0.95,
      reasoning: 'Bank charges and app fees subject to 15% VAT'
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

    // Repairs and Maintenance
    {
      patterns: ['repairs', 'maintenance', 'repair', 'service', 'fix', 'servicing'],
      accountName: 'Repairs & Maintenance',
      vatRate: 15,
      vatType: 'Standard Rate',
      confidence: 0.90,
      reasoning: 'Repairs and maintenance subject to 15% VAT'
    },

    // General Fees
    {
      patterns: ['fees', 'fee', 'charge', 'charges', 'service fee', 'admin fee', 'processing fee'],
      accountName: 'Professional Fees',
      vatRate: 15,
      vatType: 'Standard Rate',
      confidence: 0.80,
      reasoning: 'General fees subject to 15% VAT'
    },

    // App/Software related
    {
      patterns: ['app', 'software', 'subscription', 'license', 'saas', 'technology'],
      accountName: 'Software & Technology',
      vatRate: 15,
      vatType: 'Standard Rate',
      confidence: 0.85,
      reasoning: 'Software and technology costs subject to 15% VAT'
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
    // Default Sales Revenue for ALL income transactions
    // This allows users to manually review and change accounts or remove internal transfers
    {
      patterns: ['payment', 'deposit', 'transfer', 'receipt', 'income', 'sale', 'revenue', 'cr', 'cash deposit', 'adt', 'mokopan', 'ikhokha', 'service', 'consulting', 'professional', 'fees', 'commission', 'interest', 'bank interest', 'investment', 'customer', 'invoice', 'received'],
      accountName: 'Sales Revenue',
      vatRate: 15,
      vatType: 'Standard Rate',
      confidence: 0.85,
      reasoning: 'All income defaults to Sales Revenue - user can review and adjust manually or remove if internal transfer'
    }
  ];

  /**
   * Match transactions using rule-based patterns
   */
  async matchTransactions(
    transactions: TransactionForMatching[],
    chartOfAccounts: Array<{id: number; accountName: string; accountType: string}>
  ): Promise<Array<{transaction: TransactionForMatching; match: ScriptMatchResult | null}>> {
    
    console.log(`Script Matcher: Processing ${transactions.length} transactions`);
    console.log(`Script Matcher: Available accounts: ${chartOfAccounts.length}`);
    
    // Log first few accounts for debugging
    if (chartOfAccounts.length > 0) {
      console.log('Sample accounts:', chartOfAccounts.slice(0, 5).map(a => `${a.accountName} (ID: ${a.id})`));
    }
    
    const results = transactions.map(transaction => {
      const match = this.findBestMatch(transaction, chartOfAccounts);
      if (match) {
        console.log(`Matched: "${transaction.description}" → ${match.accountName} (confidence: ${match.confidence})`);
      } else {
        console.log(`No match found for: "${transaction.description}"`);
      }
      return {
        transaction,
        match
      };
    });
    
    const matchedCount = results.filter(r => r.match !== null).length;
    console.log(`Script Matcher: Matched ${matchedCount} out of ${transactions.length} transactions`);
    
    return results;
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
    
    console.log(`\nMatching: "${transaction.description}" (${transaction.type}, amount: ${transaction.amount})`);
    
    // FIRST: Try direct keyword matching from description to account names
    const descWords = description.split(/[\s\-_,.:;]+/).filter(w => w.length > 2);
    for (const word of descWords) {
      const directMatch = chartOfAccounts.find(acc => 
        acc.accountName.toLowerCase().includes(word)
      );
      if (directMatch) {
        console.log(`  Direct match found: ${directMatch.accountName} (matched on "${word}")`); 
        return {
          accountId: directMatch.id,
          accountName: directMatch.accountName,
          vatRate: transaction.type === 'expense' ? 15 : 15,
          vatType: 'Standard Rate',
          confidence: 0.85,
          reasoning: `Direct keyword match on "${word}"`
        };
      }
    }
    
    // Enhanced pattern matching with word-level search and flexible matching
    let bestMatch: ScriptMatchResult | null = null;
    let highestConfidence = 0;
    
    for (const pattern of patterns) {
      // Try exact substring match first
      let matchFound = pattern.patterns.some(p => description.includes(p.toLowerCase()));
      
      // If no exact match, try word-by-word matching for more flexibility
      if (!matchFound) {
        const descWords = description.split(/\s+/).map(w => w.toLowerCase());
        matchFound = pattern.patterns.some(p => {
          const patternWords = p.toLowerCase().split(/\s+/);
          return patternWords.some(pw => 
            descWords.some(dw => dw.includes(pw) || pw.includes(dw))
          );
        });
      }
      
      if (matchFound) {
        console.log(`  Pattern matched: ${pattern.accountName}`);
        // Enhanced flexible account matching - try multiple approaches
        let account = this.findMatchingAccount(pattern.accountName, chartOfAccounts);
        
        if (account) {
          console.log(`  Found account: ${account.accountName} (ID: ${account.id})`);
          if (pattern.confidence > highestConfidence) {
            bestMatch = {
              accountId: account.id,
              accountName: account.accountName,
              vatRate: pattern.vatRate,
              vatType: pattern.vatType,
              confidence: pattern.confidence,
              reasoning: pattern.reasoning
            };
            highestConfidence = pattern.confidence;
            console.log(`  New best match with confidence: ${pattern.confidence}`);
          }
        } else {
          console.log(`  No account found for pattern: ${pattern.accountName}`);
        }
      }
    }
    
    if (bestMatch) {
      return bestMatch;
    }
    
    // Fallback to default accounts with special handling for income
    if (transaction.type === 'income') {
      // Try to find any income/revenue account
      const incomeAccount = chartOfAccounts.find(acc => {
        const name = acc.accountName.toLowerCase();
        return name.includes('revenue') || name.includes('income') || 
               name.includes('sales') || name.includes('fees received');
      });
      if (incomeAccount) {
        return {
          accountId: incomeAccount.id,
          accountName: incomeAccount.accountName,
          vatRate: 15,
          vatType: 'Standard Rate',
          confidence: 0.75,
          reasoning: 'Default income account - please review'
        };
      }
    }
    
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
   * Enhanced flexible account matching with multiple fallback strategies
   */
  private findMatchingAccount(
    patternAccountName: string,
    chartOfAccounts: Array<{id: number; accountName: string; accountType: string}>
  ) {
    const pattern = patternAccountName.toLowerCase();
    
    // First, check for exact match
    let account = chartOfAccounts.find(acc => 
      acc.accountName.toLowerCase() === pattern
    );
    if (account) return account;
    
    // Strategy 1: Exact partial match (either direction)
    account = chartOfAccounts.find(acc => 
      acc.accountName.toLowerCase().includes(pattern) ||
      pattern.includes(acc.accountName.toLowerCase())
    );
    if (account) return account;
    
    // Strategy 2: Word-by-word matching
    const patternWords = pattern.split(' ').filter(w => w.length > 2);
    account = chartOfAccounts.find(acc => {
      const accWords = acc.accountName.toLowerCase().split(' ');
      return patternWords.some(pw => accWords.some(aw => aw.includes(pw) || pw.includes(aw)));
    });
    if (account) return account;
    
    // Strategy 3: Look for any account containing key words from the pattern
    const patternKeywords = pattern.split(/[\s&-]+/).filter(w => w.length > 2);
    account = chartOfAccounts.find(acc => {
      const accLower = acc.accountName.toLowerCase();
      return patternKeywords.some(keyword => accLower.includes(keyword));
    });
    if (account) return account;
    
    // Strategy 4: Common synonyms and variations
    const synonymMap: {[key: string]: string[]} = {
      'employee costs': ['salaries', 'wages', 'payroll', 'staff', 'employee', 'salary', 'compensation'],
      'office supplies': ['stationery', 'supplies', 'office', 'consumables'],
      'rent expense': ['rent', 'rental', 'lease', 'premises'],
      'utilities': ['electricity', 'water', 'gas', 'municipal', 'power', 'utility'],
      'telephone & internet': ['phone', 'communication', 'internet', 'telephone', 'data', 'telecommunications'],
      'transport & travel': ['travel', 'fuel', 'vehicle', 'transport', 'transportation', 'petrol', 'diesel'],
      'bank charges': ['bank', 'fees', 'charges', 'fee', 'banking', 'financial'],
      'insurance': ['insurance', 'premium', 'cover', 'policy'],
      'professional fees': ['professional', 'consulting', 'legal', 'fees', 'fee', 'accountant', 'lawyer', 'consultant'],
      'marketing & advertising': ['advertising', 'promotion', 'marketing', 'ads', 'campaign'],
      'equipment & furniture': ['furniture', 'computer', 'assets', 'equipment', 'machinery', 'hardware'],
      'repairs & maintenance': ['maintenance', 'repairs', 'repair', 'fixing', 'service'],
      'software & technology': ['app', 'technology', 'subscription', 'software', 'saas', 'license', 'tech'],
      'sales revenue': ['sales', 'revenue', 'income', 'turnover'],
      'service income': ['service', 'fees', 'fee', 'consulting', 'professional'],
      'interest income': ['interest', 'investment', 'returns'],
      'general expenses': ['expense', 'cost', 'payment', 'expenditure'],
      'other income': ['income', 'receipt', 'received', 'miscellaneous']
    };
    
    // Check if pattern matches any synonym group
    for (const [canonical, synonyms] of Object.entries(synonymMap)) {
      const canonicalLower = canonical.toLowerCase();
      // Check if the pattern matches this synonym group
      if (pattern.includes(canonicalLower) || canonicalLower.includes(pattern) || 
          synonyms.some(syn => pattern.includes(syn))) {
        // Find an account that matches any of the synonyms
        account = chartOfAccounts.find(acc => {
          const accLower = acc.accountName.toLowerCase();
          return synonyms.some(syn => accLower.includes(syn)) ||
                 accLower.includes(canonicalLower.replace(' & ', ' ').replace(' ', '')) ||
                 canonicalLower.split(' ').some(word => accLower.includes(word));
        });
        if (account) return account;
      }
    }
    
    // Strategy 5: If still no match, try to find any account with overlapping words
    const words = pattern.split(/[\s&-]+/).filter(w => w.length > 3);
    if (words.length > 0) {
      account = chartOfAccounts.find(acc => {
        const accWords = acc.accountName.toLowerCase().split(/[\s&-]+/);
        return words.some(w => accWords.some(aw => aw.includes(w) || w.includes(aw)));
      });
      if (account) return account;
    }
    
    return null;
  }

  /**
   * Get default account for transaction type with enhanced fallback
   */
  private getDefaultAccount(
    type: 'income' | 'expense',
    chartOfAccounts: Array<{id: number; accountName: string; accountType: string}>
  ) {
    if (type === 'expense') {
      // Try multiple expense account variations
      return chartOfAccounts.find(acc => {
        const name = acc.accountName.toLowerCase();
        return name.includes('general expense') ||
               name.includes('other expense') ||
               name.includes('miscellaneous') ||
               name.includes('expense') ||
               acc.accountType.toLowerCase().includes('expense');
      });
    } else {
      // Try multiple income account variations
      return chartOfAccounts.find(acc => {
        const name = acc.accountName.toLowerCase();
        return name.includes('sales') ||
               name.includes('revenue') ||
               name.includes('income') ||
               name.includes('other income') ||
               acc.accountType.toLowerCase().includes('income') ||
               acc.accountType.toLowerCase().includes('revenue');
      });
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