/**
 * South African Banking Optimization Engine
 * Analyzes transaction patterns to identify fee optimization and compliance opportunities
 */

import { DatabaseStorage } from '../storage';
import { transactionCategorizationService } from './transactionCategorizationService';
import type { BankTransaction, BankAccount } from '@shared/schema';

interface BankingInsight {
  id: string;
  type: 'fee_optimization' | 'cash_flow' | 'vat_compliance' | 'tax_planning' | 'business_intelligence';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  potentialSavings?: number;
  actionable: boolean;
  recommendations: string[];
  metadata: Record<string, any>;
  createdAt: Date;
}

interface BankFeeAnalysis {
  totalMonthlyFees: number;
  feeBreakdown: Record<string, number>;
  optimization: {
    potentialSavings: number;
    recommendations: string[];
  };
}

interface CashFlowAnalysis {
  averageBalance: number;
  balanceVolatility: number;
  cashFlowPatterns: {
    inflow: { average: number; frequency: string };
    outflow: { average: number; frequency: string };
  };
  recommendations: string[];
}

interface VATComplianceAnalysis {
  vatDeductibleAmount: number;
  vatLiability: number;
  complianceScore: number;
  issues: string[];
  recommendations: string[];
}

interface TransactionPattern {
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'irregular';
  averageAmount: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  seasonality?: {
    pattern: string;
    strength: number;
  };
}

export class SABankingOptimizationEngine {
  private storage: DatabaseStorage;

  // South African banking fee structures (major banks)
  private readonly bankFeeStructures = {
    'fnb': {
      monthlyMaintenance: { standard: 75, gold: 155, platinum: 295 },
      transactionFees: { electronic: 6.5, cash: 12.5, debitOrder: 5.5 },
      cashWithdrawal: { own_atm: 8, other_atm: 21 }
    },
    'standardbank': {
      monthlyMaintenance: { standard: 85, platinum: 165, private: 345 },
      transactionFees: { electronic: 7.0, cash: 13.0, debitOrder: 6.0 },
      cashWithdrawal: { own_atm: 9, other_atm: 22 }
    },
    'absa': {
      monthlyMaintenance: { standard: 78, gold: 158, premier: 278 },
      transactionFees: { electronic: 6.8, cash: 12.8, debitOrder: 5.8 },
      cashWithdrawal: { own_atm: 8.5, other_atm: 20.5 }
    },
    'nedbank': {
      monthlyMaintenance: { standard: 80, gold: 160, private: 320 },
      transactionFees: { electronic: 7.2, cash: 13.2, debitOrder: 6.2 },
      cashWithdrawal: { own_atm: 9.5, other_atm: 23 }
    },
    'capitec': {
      monthlyMaintenance: { standard: 5.50, global: 29 },
      transactionFees: { electronic: 4.5, cash: 9, debitOrder: 3.5 },
      cashWithdrawal: { own_atm: 8, other_atm: 15 }
    }
  };

  constructor(storage: DatabaseStorage) {
    this.storage = storage;
  }

  /**
   * Analyze banking patterns and generate comprehensive insights
   */
  async analyzeAccountOptimization(
    companyId: number, 
    bankAccountId: number, 
    analysisMonths = 12
  ): Promise<{
    insights: BankingInsight[];
    feeAnalysis: BankFeeAnalysis;
    cashFlowAnalysis: CashFlowAnalysis;
    vatAnalysis: VATComplianceAnalysis;
    patterns: TransactionPattern[];
    overallScore: number;
  }> {
    // Get transaction data for analysis period
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - analysisMonths);

    const transactions = await this.getTransactionsForPeriod(
      companyId, 
      bankAccountId, 
      startDate, 
      endDate
    );

    const bankAccount = await this.storage.getBankAccount(bankAccountId);
    if (!bankAccount) {
      throw new Error('Bank account not found');
    }

    // Perform various analyses
    const [
      feeAnalysis,
      cashFlowAnalysis,
      vatAnalysis,
      patterns
    ] = await Promise.all([
      this.analyzeBankFees(transactions, bankAccount),
      this.analyzeCashFlow(transactions),
      this.analyzeVATCompliance(transactions, companyId),
      this.identifyTransactionPatterns(transactions)
    ]);

    // Generate insights
    const insights = await this.generateInsights(
      transactions,
      feeAnalysis,
      cashFlowAnalysis,
      vatAnalysis,
      patterns,
      bankAccount
    );

    // Calculate overall optimization score
    const overallScore = this.calculateOptimizationScore(insights, feeAnalysis, vatAnalysis);

    return {
      insights,
      feeAnalysis,
      cashFlowAnalysis,
      vatAnalysis,
      patterns,
      overallScore
    };
  }

  /**
   * Analyze bank fees and identify optimization opportunities
   */
  private async analyzeBankFees(
    transactions: BankTransaction[], 
    bankAccount: BankAccount
  ): Promise<BankFeeAnalysis> {
    const bankFees = transactions.filter(t => 
      t.description.toLowerCase().includes('service fee') ||
      t.description.toLowerCase().includes('bank charges') ||
      t.description.toLowerCase().includes('transaction fee') ||
      t.description.toLowerCase().includes('maintenance fee')
    );

    const feeBreakdown: Record<string, number> = {};
    let totalMonthlyFees = 0;

    bankFees.forEach(fee => {
      const amount = Math.abs(parseFloat(fee.amount));
      totalMonthlyFees += amount;

      if (fee.description.includes('service') || fee.description.includes('maintenance')) {
        feeBreakdown['Monthly Maintenance'] = (feeBreakdown['Monthly Maintenance'] || 0) + amount;
      } else if (fee.description.includes('transaction')) {
        feeBreakdown['Transaction Fees'] = (feeBreakdown['Transaction Fees'] || 0) + amount;
      } else if (fee.description.includes('cash') || fee.description.includes('atm')) {
        feeBreakdown['Cash Withdrawal'] = (feeBreakdown['Cash Withdrawal'] || 0) + amount;
      } else {
        feeBreakdown['Other Fees'] = (feeBreakdown['Other Fees'] || 0) + amount;
      }
    });

    // Calculate monthly average
    totalMonthlyFees = totalMonthlyFees / 12; // Assuming 12 months of data

    // Generate optimization recommendations
    const bankName = this.identifyBank(bankAccount.bankName);
    const currentStructure = this.bankFeeStructures[bankName] || this.bankFeeStructures['fnb'];
    
    const recommendations: string[] = [];
    let potentialSavings = 0;

    // Compare with other banks
    const competitiveAnalysis = this.compareWithCompetitors(totalMonthlyFees, transactions.length);
    if (competitiveAnalysis.savings > 0) {
      recommendations.push(`Switch to ${competitiveAnalysis.bank} for potential savings of R${competitiveAnalysis.savings.toFixed(2)} per month`);
      potentialSavings += competitiveAnalysis.savings * 12;
    }

    // Transaction pattern optimization
    const electronicTransactions = transactions.filter(t => 
      !t.description.toLowerCase().includes('cash') &&
      !t.description.toLowerCase().includes('atm')
    ).length;
    
    if (electronicTransactions / transactions.length > 0.8) {
      recommendations.push('Consider digital-only banking package for better rates');
      potentialSavings += 200; // Estimated annual saving
    }

    return {
      totalMonthlyFees,
      feeBreakdown,
      optimization: {
        potentialSavings,
        recommendations
      }
    };
  }

  /**
   * Analyze cash flow patterns
   */
  private async analyzeCashFlow(transactions: BankTransaction[]): Promise<CashFlowAnalysis> {
    const balances = transactions
      .filter(t => t.balance !== null)
      .map(t => parseFloat(t.balance!));

    const averageBalance = balances.reduce((sum, bal) => sum + bal, 0) / balances.length;
    
    // Calculate balance volatility (standard deviation)
    const variance = balances.reduce((sum, bal) => sum + Math.pow(bal - averageBalance, 2), 0) / balances.length;
    const balanceVolatility = Math.sqrt(variance);

    // Analyze inflows and outflows
    const inflows = transactions.filter(t => parseFloat(t.amount) > 0);
    const outflows = transactions.filter(t => parseFloat(t.amount) < 0);

    const averageInflow = inflows.reduce((sum, t) => sum + parseFloat(t.amount), 0) / inflows.length;
    const averageOutflow = Math.abs(outflows.reduce((sum, t) => sum + parseFloat(t.amount), 0) / outflows.length);

    // Determine frequency patterns
    const inflowFrequency = this.determineFrequency(inflows.map(t => new Date(t.transactionDate)));
    const outflowFrequency = this.determineFrequency(outflows.map(t => new Date(t.transactionDate)));

    const recommendations: string[] = [];

    if (balanceVolatility > averageBalance * 0.5) {
      recommendations.push('High balance volatility detected - consider cash flow smoothing strategies');
    }

    if (averageBalance > 100000) {
      recommendations.push('High average balance - consider investment opportunities or interest-bearing accounts');
    }

    if (averageBalance < 10000) {
      recommendations.push('Low average balance - monitor for potential overdraft risks');
    }

    return {
      averageBalance,
      balanceVolatility,
      cashFlowPatterns: {
        inflow: { average: averageInflow, frequency: inflowFrequency },
        outflow: { average: averageOutflow, frequency: outflowFrequency }
      },
      recommendations
    };
  }

  /**
   * Analyze VAT compliance
   */
  private async analyzeVATCompliance(
    transactions: BankTransaction[], 
    companyId: number
  ): Promise<VATComplianceAnalysis> {
    let vatDeductibleAmount = 0;
    let vatLiability = 0;
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Analyze each transaction for VAT implications
    for (const transaction of transactions) {
      const category = await transactionCategorizationService.categorizeTransaction({
        description: transaction.description,
        amount: transaction.amount,
        reference: transaction.reference || undefined
      });

      const amount = Math.abs(parseFloat(transaction.amount));

      if (category.vatApplicable) {
        if (category.type === 'expense') {
          vatDeductibleAmount += amount * 0.15; // 15% VAT
        } else if (category.type === 'income') {
          vatLiability += amount * 0.15;
        }
      }
    }

    // Calculate compliance score based on various factors
    let complianceScore = 100;

    // Check for annual turnover threshold
    const annualTurnover = transactions
      .filter(t => parseFloat(t.amount) > 0)
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    if (annualTurnover > 1000000) {
      if (transactions.some(t => t.description.toLowerCase().includes('vat'))) {
        complianceScore += 10; // Bonus for active VAT management
      } else {
        issues.push('Annual turnover exceeds R1M but no VAT registration detected');
        complianceScore -= 20;
        recommendations.push('Consider VAT registration - mandatory for turnover > R1M');
      }
    }

    // Check for VAT-deductible expense documentation
    const expenseTransactions = transactions.filter(t => parseFloat(t.amount) < 0);
    const undocumentedExpenses = expenseTransactions.filter(t => !t.reference && Math.abs(parseFloat(t.amount)) > 100);
    
    if (undocumentedExpenses.length > expenseTransactions.length * 0.1) {
      issues.push(`${undocumentedExpenses.length} expense transactions lack proper reference/documentation`);
      complianceScore -= 15;
      recommendations.push('Ensure all VAT-deductible expenses have proper documentation and references');
    }

    // Check for regular VAT payments
    const vatPayments = transactions.filter(t => 
      t.description.toLowerCase().includes('vat') && 
      parseFloat(t.amount) < 0
    );

    if (vatLiability > 10000 && vatPayments.length === 0) {
      issues.push('High VAT liability but no VAT payments detected');
      complianceScore -= 25;
      recommendations.push('Ensure regular VAT payments to SARS to avoid penalties');
    }

    return {
      vatDeductibleAmount,
      vatLiability,
      complianceScore: Math.max(0, complianceScore),
      issues,
      recommendations
    };
  }

  /**
   * Identify transaction patterns
   */
  private async identifyTransactionPatterns(transactions: BankTransaction[]): Promise<TransactionPattern[]> {
    const patterns: TransactionPattern[] = [];
    const categorizedTransactions = new Map<string, BankTransaction[]>();

    // Group transactions by category
    for (const transaction of transactions) {
      const category = await transactionCategorizationService.categorizeTransaction({
        description: transaction.description,
        amount: transaction.amount,
        reference: transaction.reference || undefined
      });

      if (!categorizedTransactions.has(category.name)) {
        categorizedTransactions.set(category.name, []);
      }
      categorizedTransactions.get(category.name)!.push(transaction);
    }

    // Analyze each category
    for (const [categoryName, categoryTransactions] of categorizedTransactions) {
      if (categoryTransactions.length < 3) continue; // Skip categories with too few transactions

      const amounts = categoryTransactions.map(t => Math.abs(parseFloat(t.amount)));
      const averageAmount = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;

      // Determine frequency
      const dates = categoryTransactions.map(t => new Date(t.transactionDate)).sort((a, b) => a.getTime() - b.getTime());
      const frequency = this.determineFrequency(dates);

      // Determine trend
      const firstHalf = amounts.slice(0, Math.floor(amounts.length / 2));
      const secondHalf = amounts.slice(Math.floor(amounts.length / 2));
      const firstAvg = firstHalf.reduce((sum, amt) => sum + amt, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, amt) => sum + amt, 0) / secondHalf.length;
      
      let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
      if (secondAvg > firstAvg * 1.1) trend = 'increasing';
      else if (secondAvg < firstAvg * 0.9) trend = 'decreasing';

      patterns.push({
        category: categoryName,
        frequency,
        averageAmount,
        trend
      });
    }

    return patterns.sort((a, b) => b.averageAmount - a.averageAmount);
  }

  /**
   * Generate actionable insights
   */
  private async generateInsights(
    transactions: BankTransaction[],
    feeAnalysis: BankFeeAnalysis,
    cashFlowAnalysis: CashFlowAnalysis,
    vatAnalysis: VATComplianceAnalysis,
    patterns: TransactionPattern[],
    bankAccount: BankAccount
  ): Promise<BankingInsight[]> {
    const insights: BankingInsight[] = [];

    // Fee optimization insights
    if (feeAnalysis.optimization.potentialSavings > 1000) {
      insights.push({
        id: 'fee_optimization_high',
        type: 'fee_optimization',
        priority: 'high',
        title: 'Significant Banking Fee Savings Available',
        description: `You could save approximately R${feeAnalysis.optimization.potentialSavings.toFixed(2)} annually by optimizing your banking arrangements.`,
        potentialSavings: feeAnalysis.optimization.potentialSavings,
        actionable: true,
        recommendations: feeAnalysis.optimization.recommendations,
        metadata: {
          currentMonthlyFees: feeAnalysis.totalMonthlyFees,
          feeBreakdown: feeAnalysis.feeBreakdown
        },
        createdAt: new Date()
      });
    }

    // Cash flow insights
    if (cashFlowAnalysis.balanceVolatility > cashFlowAnalysis.averageBalance * 0.3) {
      insights.push({
        id: 'cash_flow_volatility',
        type: 'cash_flow',
        priority: 'medium',
        title: 'High Cash Flow Volatility Detected',
        description: 'Your account shows high balance fluctuations which may indicate cash flow management opportunities.',
        actionable: true,
        recommendations: [
          'Consider establishing a cash flow buffer',
          'Review payment terms with customers and suppliers',
          'Implement cash flow forecasting',
          'Consider overdraft facility for smoothing'
        ],
        metadata: {
          volatility: cashFlowAnalysis.balanceVolatility,
          averageBalance: cashFlowAnalysis.averageBalance
        },
        createdAt: new Date()
      });
    }

    // VAT compliance insights
    if (vatAnalysis.complianceScore < 80) {
      insights.push({
        id: 'vat_compliance_issues',
        type: 'vat_compliance',
        priority: vatAnalysis.complianceScore < 60 ? 'critical' : 'high',
        title: 'VAT Compliance Issues Detected',
        description: `Your VAT compliance score is ${vatAnalysis.complianceScore}%. Several issues need attention.`,
        actionable: true,
        recommendations: vatAnalysis.recommendations,
        metadata: {
          complianceScore: vatAnalysis.complianceScore,
          issues: vatAnalysis.issues,
          vatDeductible: vatAnalysis.vatDeductibleAmount,
          vatLiability: vatAnalysis.vatLiability
        },
        createdAt: new Date()
      });
    }

    // Pattern-based insights
    const increasingCosts = patterns.filter(p => p.trend === 'increasing' && p.category.includes('expense'));
    if (increasingCosts.length > 0) {
      insights.push({
        id: 'increasing_cost_patterns',
        type: 'business_intelligence',
        priority: 'medium',
        title: 'Rising Cost Categories Identified',
        description: `${increasingCosts.length} expense categories show increasing trends.`,
        actionable: true,
        recommendations: [
          'Review contracts and supplier agreements',
          'Negotiate better rates with frequently used vendors',
          'Consider bulk purchasing or alternative suppliers',
          'Implement cost control measures'
        ],
        metadata: {
          increasingCategories: increasingCosts.map(c => ({
            category: c.category,
            averageAmount: c.averageAmount,
            frequency: c.frequency
          }))
        },
        createdAt: new Date()
      });
    }

    return insights.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  // Helper methods
  private async getTransactionsForPeriod(
    companyId: number,
    bankAccountId: number,
    startDate: Date,
    endDate: Date
  ): Promise<BankTransaction[]> {
    // This would be implemented using the storage layer
    return []; // Mock implementation
  }

  private identifyBank(bankName: string): keyof typeof this.bankFeeStructures {
    const name = bankName.toLowerCase();
    if (name.includes('fnb') || name.includes('first national')) return 'fnb';
    if (name.includes('standard')) return 'standardbank';
    if (name.includes('absa')) return 'absa';
    if (name.includes('nedbank')) return 'nedbank';
    if (name.includes('capitec')) return 'capitec';
    return 'fnb'; // Default
  }

  private compareWithCompetitors(monthlyFees: number, transactionCount: number): { bank: string; savings: number } {
    // Compare current fees with competitors
    let bestOption = { bank: '', savings: 0 };
    
    Object.entries(this.bankFeeStructures).forEach(([bankName, structure]) => {
      const estimatedFees = structure.monthlyMaintenance.standard + 
                           (transactionCount * structure.transactionFees.electronic);
      
      if (monthlyFees - estimatedFees > bestOption.savings) {
        bestOption = { bank: bankName, savings: monthlyFees - estimatedFees };
      }
    });

    return bestOption;
  }

  private determineFrequency(dates: Date[]): 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'irregular' {
    if (dates.length < 2) return 'irregular';
    
    const intervals = [];
    for (let i = 1; i < dates.length; i++) {
      intervals.push(dates[i].getTime() - dates[i-1].getTime());
    }
    
    const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    const dayMs = 24 * 60 * 60 * 1000;
    
    if (avgInterval <= dayMs * 3) return 'daily';
    if (avgInterval <= dayMs * 10) return 'weekly';
    if (avgInterval <= dayMs * 40) return 'monthly';
    if (avgInterval <= dayMs * 120) return 'quarterly';
    return 'irregular';
  }

  private calculateOptimizationScore(
    insights: BankingInsight[],
    feeAnalysis: BankFeeAnalysis,
    vatAnalysis: VATComplianceAnalysis
  ): number {
    let score = 100;
    
    // Deduct points for issues
    insights.forEach(insight => {
      switch (insight.priority) {
        case 'critical': score -= 20; break;
        case 'high': score -= 15; break;
        case 'medium': score -= 10; break;
        case 'low': score -= 5; break;
      }
    });

    // Factor in VAT compliance
    score = (score + vatAnalysis.complianceScore) / 2;

    return Math.max(0, Math.min(100, score));
  }
}

export const saBankingOptimizationEngine = new SABankingOptimizationEngine(new DatabaseStorage());