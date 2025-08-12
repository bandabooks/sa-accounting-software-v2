/**
 * Base class for AI service implementations
 * Consolidates common AI service functionality to eliminate code duplication
 */

import { DatabaseStorage } from '../storage';
import { Company, Invoice, Customer, Expense } from '../../shared/schema';

export interface AIAssistantQuery {
  query: string;
  type?: 'business' | 'compliance' | 'financial' | 'tax' | 'general';
  context?: {
    companyId?: number;
    userId?: number;
    conversationId?: number;
  };
}

export interface AIAssistantResponse {
  answer: string;
  confidence: number;
  sources: string[];
  recommendations: Array<{
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    category: string;
  }>;
  follow_up_questions: string[];
}

export interface FinancialMetrics {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  avgInvoiceValue: number;
  customerCount: number;
  revenuePerCustomer: number;
  outstandingAmount: number;
  activeCustomers: number;
}

export abstract class AIServiceBase {
  protected storage: DatabaseStorage;

  constructor(storage: DatabaseStorage) {
    this.storage = storage;
  }

  /**
   * Calculate common financial metrics from company data
   */
  protected async calculateFinancialMetrics(companyId: number): Promise<FinancialMetrics> {
    const [invoices, customers, expenses] = await Promise.all([
      this.storage.getAllInvoices(companyId),
      this.storage.getAllCustomers(companyId),
      this.storage.getAllExpenses(companyId)
    ]);

    // Calculate revenue metrics
    const paidInvoices = invoices.filter(inv => inv.status === 'paid');
    const totalRevenue = paidInvoices.reduce((sum, inv) => sum + parseFloat(inv.total || '0'), 0);
    const avgInvoiceValue = invoices.length > 0 ? totalRevenue / invoices.length : 0;

    // Calculate customer metrics
    const customerCount = customers.length;
    const revenuePerCustomer = customerCount > 0 ? totalRevenue / customerCount : 0;
    const activeCustomers = customers.filter(c => 
      invoices.some(inv => inv.customerId === c.id && inv.status === 'paid')
    ).length;

    // Calculate expense metrics
    const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || '0'), 0);
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    // Calculate outstanding amounts
    const outstandingInvoices = invoices.filter(inv => 
      inv.status === 'sent' || inv.status === 'overdue' || inv.status === 'partially_paid'
    );
    const outstandingAmount = outstandingInvoices.reduce((sum, inv) => 
      sum + parseFloat(inv.total || '0'), 0
    );

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      profitMargin,
      avgInvoiceValue,
      customerCount,
      revenuePerCustomer,
      outstandingAmount,
      activeCustomers
    };
  }

  /**
   * Generate standard fallback response when context is missing
   */
  protected generateFallbackResponse(query: AIAssistantQuery): AIAssistantResponse {
    return {
      answer: "I need more context to provide a specific answer. Please select a company or provide more details about your query.",
      confidence: 0.5,
      sources: [],
      recommendations: [],
      follow_up_questions: [
        'Which company would you like information about?',
        'Can you provide more specific details about your question?',
        'What time period are you interested in?'
      ]
    };
  }

  /**
   * Get VAT compliance guidance based on company status
   */
  protected async getVATComplianceGuidance(companyId?: number): Promise<{
    guidance: string;
    recommendations: Array<{
      title: string;
      description: string;
      priority: 'low' | 'medium' | 'high' | 'critical';
      category: string;
    }>;
  }> {
    let guidance = `For South African VAT compliance, you need to:
      
1. **VAT Registration**: If your annual turnover exceeds R1 million, VAT registration is mandatory.
2. **VAT Returns**: Submit VAT201 returns by the 25th of each month (for monthly filers) or bi-monthly.
3. **Record Keeping**: Maintain detailed records of all VAT transactions for 5 years.
4. **VAT Rates**: Standard rate is 15%, with some items zero-rated or exempt.

Based on your company profile, `;

    const recommendations: Array<{
      title: string;
      description: string;
      priority: 'low' | 'medium' | 'high' | 'critical';
      category: string;
    }> = [];

    if (companyId) {
      try {
        const company = await this.storage.getCompany(companyId);
        if (company?.isVatRegistered) {
          guidance += `you are VAT registered. Ensure you're submitting your VAT returns on time and keeping accurate records.`;
          recommendations.push({
            title: 'VAT Return Reminder',
            description: 'Set up automated reminders for VAT return submissions to avoid penalties.',
            priority: 'high',
            category: 'VAT Compliance'
          });
        } else {
          guidance += `you are not currently VAT registered. Monitor your turnover to determine when registration becomes necessary.`;
          recommendations.push({
            title: 'VAT Registration Check',
            description: 'Review your annual turnover to determine if VAT registration is required.',
            priority: 'medium',
            category: 'VAT Compliance'
          });
        }
      } catch (error) {
        guidance += `please verify your VAT registration status in your company settings.`;
      }
    }

    return { guidance, recommendations };
  }

  /**
   * Get POPI compliance guidance
   */
  protected getPOPIComplianceGuidance(): {
    guidance: string;
    recommendations: Array<{
      title: string;
      description: string;
      priority: 'low' | 'medium' | 'high' | 'critical';
      category: string;
    }>;
  } {
    const guidance = `POPI Act compliance requires:

1. **Lawful Processing**: Only collect personal information for specific, legitimate purposes.
2. **Consent**: Obtain clear consent before processing personal data.
3. **Data Security**: Implement appropriate security measures to protect personal information.
4. **Access Rights**: Allow data subjects to access and correct their information.
5. **Retention**: Don't keep personal data longer than necessary.

For your business:`;
    
    const recommendations = [
      {
        title: 'Implement Privacy Policy',
        description: 'Create and publish a comprehensive privacy policy on your website.',
        priority: 'high' as const,
        category: 'Privacy Compliance'
      },
      {
        title: 'Data Audit',
        description: 'Conduct a full audit of what personal data you collect and how it\'s processed.',
        priority: 'medium' as const,
        category: 'Data Management'
      }
    ];

    return { guidance, recommendations };
  }

  /**
   * Get standard tax optimization strategies
   */
  protected getTaxOptimizationStrategies(includeExpenseDetails: boolean = false): {
    optimization: string;
    recommendations: Array<{
      title: string;
      description: string;
      priority: 'low' | 'medium' | 'high' | 'critical';
      category: string;
    }>;
  } {
    let optimization = `**Tax Optimization Strategies for South African Businesses:**

**Immediate Opportunities:**
1. **Deductible Expenses**: Ensure all business expenses are properly recorded and claimed
2. **Allowances**: Claim capital allowances on business assets and equipment
3. **Small Business Exemptions**: If turnover < R1M, you may qualify for exemptions

**Advanced Strategies:**
4. **Timing**: Manage the timing of income and expenses across tax years
5. **Structure**: Consider optimal business structure (Pty Ltd vs CC vs Sole Proprietor)
6. **Retirement Contributions**: Maximize tax-deductible retirement fund contributions

**VAT Optimization:**
7. **Input VAT**: Ensure all input VAT is claimed on business purchases
8. **Zero-rated supplies**: Structure exports and qualifying supplies correctly
9. **Bad debt relief**: Claim VAT relief on irrecoverable debts

**Compliance Benefits:**
10. **Penalties avoidance**: Timely submissions save significant penalty costs
11. **Audit preparation**: Good records reduce audit risks and costs`;

    if (includeExpenseDetails) {
      optimization += `

**Commonly Missed Deductions:**
- Home office expenses (if working from home)
- Business vehicle expenses
- Professional development and training
- Business insurance premiums
- Bank charges and interest on business loans
- Marketing and advertising costs
- Professional fees (legal, accounting)
- Business entertainment (limited to R2,500 per year)`;
    }

    const recommendations = [
      {
        title: 'Expense Review',
        description: 'Conduct quarterly review to ensure all deductible expenses are captured.',
        priority: 'high' as const,
        category: 'Tax Optimization'
      },
      {
        title: 'Professional Consultation',
        description: 'Schedule annual tax planning session with a qualified tax practitioner.',
        priority: 'medium' as const,
        category: 'Tax Planning'
      },
      {
        title: 'Digital Records',
        description: 'Maintain digital records for easy access and SARS compliance.',
        priority: 'medium' as const,
        category: 'Compliance'
      }
    ];

    return { optimization, recommendations };
  }

  /**
   * Format currency value for display
   */
  protected formatCurrency(amount: number): string {
    return `R${amount.toLocaleString()}`;
  }

  /**
   * Generate recommendations based on financial metrics
   */
  protected generateFinancialRecommendations(metrics: FinancialMetrics): Array<{
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    category: string;
  }> {
    const recommendations = [];

    // Revenue recommendations
    if (metrics.avgInvoiceValue < 1000) {
      recommendations.push({
        title: 'Increase Average Invoice Value',
        description: 'Consider bundling services or upselling to increase your average transaction value.',
        priority: 'medium' as const,
        category: 'Revenue Growth'
      });
    }

    // Collections recommendations
    if (metrics.outstandingAmount > metrics.totalRevenue * 0.3) {
      recommendations.push({
        title: 'Improve Collections',
        description: 'Implement automated payment reminders and follow-up procedures for overdue invoices.',
        priority: 'high' as const,
        category: 'Cash Flow Management'
      });
    }

    // Profitability recommendations
    if (metrics.profitMargin < 10) {
      recommendations.push({
        title: 'Cost Reduction Review',
        description: 'Analyze expenses to identify areas for cost reduction and efficiency improvements.',
        priority: metrics.profitMargin < 0 ? 'critical' as const : 'high' as const,
        category: 'Financial Health'
      });
    }

    // Customer recommendations
    if (metrics.activeCustomers < metrics.customerCount * 0.5) {
      recommendations.push({
        title: 'Customer Reactivation',
        description: 'Launch targeted campaigns to re-engage inactive customers.',
        priority: 'medium' as const,
        category: 'Customer Management'
      });
    }

    return recommendations;
  }

  // Abstract methods to be implemented by derived classes
  abstract processQuery(query: AIAssistantQuery): Promise<AIAssistantResponse>;
}