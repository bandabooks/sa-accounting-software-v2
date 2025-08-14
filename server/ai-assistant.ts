import { IStorage } from './storage';
import { AIServiceBase, AIAssistantQuery as BaseQuery, AIAssistantResponse as BaseResponse } from './services/aiServiceBase';

// Extend base types with additional fields
export interface AIAssistantQuery extends BaseQuery {
  type: 'business_insights' | 'compliance_guidance' | 'financial_analysis' | 'tax_optimization' | 'general_help';
  context?: BaseQuery['context'] & {
    currentPage?: string;
    timeframe?: string;
  };
}

export interface AIAssistantResponse extends BaseResponse {
  actionable_items?: string[];
  charts_data?: any;
}

export class AIAssistantService extends AIServiceBase {
  constructor(storage: IStorage) {
    super(storage as any);
  }

  async processQuery(query: AIAssistantQuery): Promise<AIAssistantResponse> {
    console.log('Processing AI Assistant query:', query);

    switch (query.type) {
      case 'business_insights':
        return await this.generateBusinessInsights(query);
      case 'compliance_guidance':
        return await this.generateComplianceGuidance(query);
      case 'financial_analysis':
        return await this.generateFinancialAnalysis(query);
      case 'tax_optimization':
        return await this.generateTaxOptimization(query);
      case 'general_help':
        return await this.generateGeneralHelp(query);
      default:
        return this.generateFallbackResponse(query);
    }
  }

  private async generateBusinessInsights(query: AIAssistantQuery): Promise<AIAssistantResponse> {
    const { context } = query;
    if (!context?.companyId) {
      return this.generateFallbackResponse(query);
    }

    try {
      // Get company data for insights
      const company = await this.storage.getCompany(context.companyId);
      const invoices = await this.storage.getAllInvoices(context.companyId);
      const customers = await this.storage.getAllCustomers(context.companyId);
      const expenses = await this.storage.getAllExpenses(context.companyId);

      // Calculate key metrics
      const totalRevenue = invoices
        .filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + parseFloat(inv.total || '0'), 0);

      const avgInvoiceValue = invoices.length > 0 ? totalRevenue / invoices.length : 0;
      const customerCount = customers.length;
      const revenuePerCustomer = customerCount > 0 ? totalRevenue / customerCount : 0;

      const monthlyExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || '0'), 0);
      const profitMargin = totalRevenue > 0 ? ((totalRevenue - monthlyExpenses) / totalRevenue) * 100 : 0;

      let insights = '';
      const recommendations: any[] = [];

      if (query.query.toLowerCase().includes('revenue') || query.query.toLowerCase().includes('sales')) {
        insights = `Your business has generated R${totalRevenue.toLocaleString()} in total revenue from ${invoices.length} invoices. `;
        insights += `The average invoice value is R${avgInvoiceValue.toLocaleString()}. `;
        
        if (avgInvoiceValue < 1000) {
          recommendations.push({
            title: 'Increase Average Invoice Value',
            description: 'Consider bundling services or upselling to increase your average transaction value.',
            priority: 'medium',
            category: 'Revenue Growth'
          });
        }

        insights += `With ${customerCount} customers, your revenue per customer is R${revenuePerCustomer.toLocaleString()}.`;
      } else if (query.query.toLowerCase().includes('customer') || query.query.toLowerCase().includes('client')) {
        insights = `You currently have ${customerCount} customers in your database. `;
        
        const activeCustomers = customers.filter(c => {
          return invoices.some(inv => inv.customerId === c.id && inv.status === 'paid');
        }).length;

        insights += `Of these, ${activeCustomers} are active customers who have made purchases. `;
        insights += `Your customer retention rate appears to be ${((activeCustomers / customerCount) * 100).toFixed(1)}%.`;

        if (activeCustomers < customerCount * 0.7) {
          recommendations.push({
            title: 'Improve Customer Retention',
            description: 'Focus on re-engaging inactive customers through targeted marketing campaigns.',
            priority: 'high',
            category: 'Customer Retention'
          });
        }
      } else if (query.query.toLowerCase().includes('profit') || query.query.toLowerCase().includes('margin')) {
        insights = `Your current profit margin is ${profitMargin.toFixed(1)}%. `;
        insights += `With R${totalRevenue.toLocaleString()} in revenue and R${monthlyExpenses.toLocaleString()} in expenses, `;
        insights += `your net profit is R${(totalRevenue - monthlyExpenses).toLocaleString()}.`;

        if (profitMargin < 20) {
          recommendations.push({
            title: 'Optimize Profit Margins',
            description: 'Review pricing strategy and reduce unnecessary expenses to improve profitability.',
            priority: 'high',
            category: 'Financial Health'
          });
        }
      } else {
        insights = `Here's an overview of your business performance: You have ${customerCount} customers, `;
        insights += `R${totalRevenue.toLocaleString()} in revenue from ${invoices.length} invoices, `;
        insights += `and a profit margin of ${profitMargin.toFixed(1)}%. `;
        insights += `Your average invoice value is R${avgInvoiceValue.toLocaleString()}.`;
      }

      return {
        answer: insights,
        confidence: 0.9,
        sources: ['Invoice Data', 'Customer Database', 'Expense Records'],
        recommendations,
        follow_up_questions: [
          'How can I improve my profit margins?',
          'What are my top-performing customers?',
          'How does my revenue compare to last month?',
          'What expenses can I optimize?'
        ]
      };
    } catch (error) {
      console.error('Error generating business insights:', error);
      return this.generateFallbackResponse(query);
    }
  }

  private async generateComplianceGuidance(query: AIAssistantQuery): Promise<AIAssistantResponse> {
    const { context } = query;
    let guidance = '';
    const recommendations: any[] = [];

    if (query.query.toLowerCase().includes('vat') || query.query.toLowerCase().includes('tax')) {
      guidance = `For South African VAT compliance, you need to:
      
1. **VAT Registration**: If your annual turnover exceeds R1 million, VAT registration is mandatory.
2. **VAT Returns**: Submit VAT201 returns by the 25th of each month (for monthly filers) or bi-monthly.
3. **Record Keeping**: Maintain detailed records of all VAT transactions for 5 years.
4. **VAT Rates**: Standard rate is 15%, with some items zero-rated or exempt.

Based on your company profile, `;

      if (context?.companyId) {
        try {
          const company = await this.storage.getCompany(context.companyId);
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
          }
        } catch (error) {
          guidance += `please verify your VAT registration status in your company settings.`;
        }
      }
    } else if (query.query.toLowerCase().includes('popi') || query.query.toLowerCase().includes('privacy')) {
      guidance = `POPI Act compliance requires:

1. **Lawful Processing**: Only collect personal information for specific, legitimate purposes.
2. **Consent**: Obtain clear consent before processing personal data.
3. **Data Security**: Implement appropriate security measures to protect personal information.
4. **Access Rights**: Allow data subjects to access and correct their information.
5. **Retention**: Don't keep personal data longer than necessary.

For your business:`;
      
      recommendations.push({
        title: 'Implement Privacy Policy',
        description: 'Create and publish a comprehensive privacy policy on your website.',
        priority: 'high',
        category: 'Privacy Compliance'
      }, {
        title: 'Data Audit',
        description: 'Conduct a full audit of what personal data you collect and how it\'s processed.',
        priority: 'medium',
        category: 'Privacy Compliance'
      });
    } else if (query.query.toLowerCase().includes('bbbee') || query.query.toLowerCase().includes('equity')) {
      guidance = `B-BBEE compliance can provide significant business advantages:

1. **Scorecard**: Understand your current B-BBEE level and areas for improvement.
2. **Procurement**: Many large companies prefer B-BBEE compliant suppliers.
3. **Ownership**: Consider ownership structures that enhance your B-BBEE status.
4. **Skills Development**: Invest in employee training and development programs.

For small businesses, focus on supplier development and skills development to improve your score.`;

      recommendations.push({
        title: 'B-BBEE Assessment',
        description: 'Get a professional B-BBEE assessment to understand your current level.',
        priority: 'medium',
        category: 'B-BBEE Compliance'
      });
    } else {
      guidance = `South African businesses must comply with various regulations:

**Tax Compliance:**
- Income Tax returns (annually)
- VAT returns (if registered)
- PAYE for employees
- Skills Development Levy

**Regulatory Compliance:**
- CIPC annual returns
- UIF and Workers' Compensation
- POPI Act for data protection
- Labour relations compliance

**Financial Reporting:**
- Proper bookkeeping records
- Annual Financial Statements
- Audit requirements (if applicable)

I can provide specific guidance on any of these areas.`;
    }

    return {
      answer: guidance,
      confidence: 0.85,
      sources: ['SARS Guidelines', 'POPI Act', 'Companies Act', 'Labour Relations Act'],
      recommendations,
      follow_up_questions: [
        'How do I register for VAT?',
        'What records do I need to keep for SARS?',
        'How do I ensure POPI compliance?',
        'What are the B-BBEE requirements for my industry?'
      ]
    };
  }

  private async generateFinancialAnalysis(query: AIAssistantQuery): Promise<AIAssistantResponse> {
    const { context } = query;
    if (!context?.companyId) {
      return this.generateFallbackResponse(query);
    }

    try {
      const invoices = await this.storage.getAllInvoices(context.companyId);
      const expenses = await this.storage.getAllExpenses(context.companyId);
      
      // Calculate financial metrics
      const totalRevenue = invoices
        .filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + parseFloat(inv.total || '0'), 0);
      
      const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || '0'), 0);
      const netProfit = totalRevenue - totalExpenses;
      const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

      // Outstanding invoices
      const outstandingInvoices = invoices.filter(inv => inv.status === 'sent' || inv.status === 'overdue');
      const outstandingAmount = outstandingInvoices.reduce((sum, inv) => sum + parseFloat(inv.total || '0'), 0);

      let analysis = '';
      const recommendations: any[] = [];

      if (query.query.toLowerCase().includes('cash flow')) {
        analysis = `**Cash Flow Analysis:**

Current Position:
- Revenue: R${totalRevenue.toLocaleString()}
- Expenses: R${totalExpenses.toLocaleString()}
- Net Cash Flow: R${netProfit.toLocaleString()}
- Outstanding Receivables: R${outstandingAmount.toLocaleString()}

Your cash flow shows `;
        
        if (netProfit > 0) {
          analysis += `a positive position with ${profitMargin.toFixed(1)}% profit margin. `;
          if (outstandingAmount > totalRevenue * 0.3) {
            analysis += `However, you have significant outstanding receivables that could impact liquidity.`;
            recommendations.push({
              title: 'Improve Collections',
              description: 'Implement automated payment reminders and follow-up procedures for overdue invoices.',
              priority: 'high',
              category: 'Cash Flow Management'
            });
          }
        } else {
          analysis += `challenges with negative cash flow. Review expenses and pricing strategy.`;
          recommendations.push({
            title: 'Cost Reduction Review',
            description: 'Analyze expenses to identify areas for cost reduction and efficiency improvements.',
            priority: 'critical',
            category: 'Financial Health'
          });
        }
      } else if (query.query.toLowerCase().includes('profitability')) {
        analysis = `**Profitability Analysis:**

Your business shows:
- Gross Revenue: R${totalRevenue.toLocaleString()}
- Total Expenses: R${totalExpenses.toLocaleString()}
- Net Profit: R${netProfit.toLocaleString()}
- Profit Margin: ${profitMargin.toFixed(1)}%

`;
        if (profitMargin > 20) {
          analysis += `Excellent profitability! Your margin is above industry average.`;
        } else if (profitMargin > 10) {
          analysis += `Good profitability, but there's room for improvement.`;
          recommendations.push({
            title: 'Margin Optimization',
            description: 'Explore pricing adjustments and operational efficiencies to boost margins.',
            priority: 'medium',
            category: 'Profitability'
          });
        } else {
          analysis += `Low profitability requires immediate attention.`;
          recommendations.push({
            title: 'Urgent Profit Review',
            description: 'Conduct comprehensive review of pricing, costs, and business model.',
            priority: 'critical',
            category: 'Financial Health'
          });
        }
      } else {
        analysis = `**Financial Health Overview:**

Key Metrics:
- Revenue: R${totalRevenue.toLocaleString()}
- Expenses: R${totalExpenses.toLocaleString()}
- Profit Margin: ${profitMargin.toFixed(1)}%
- Outstanding: R${outstandingAmount.toLocaleString()}

Your business is `;
        
        if (profitMargin > 15 && outstandingAmount < totalRevenue * 0.2) {
          analysis += `in good financial health with strong profitability and manageable receivables.`;
        } else if (profitMargin > 5) {
          analysis += `showing moderate financial health with opportunities for improvement.`;
        } else {
          analysis += `facing financial challenges that require immediate attention.`;
        }
      }

      return {
        answer: analysis,
        confidence: 0.95,
        sources: ['Invoice Records', 'Expense Data', 'Financial Statements'],
        recommendations,
        follow_up_questions: [
          'How can I improve my cash flow?',
          'What are my biggest expense categories?',
          'How do I compare to industry benchmarks?',
          'What financial ratios should I monitor?'
        ]
      };
    } catch (error) {
      console.error('Error generating financial analysis:', error);
      return this.generateFallbackResponse(query);
    }
  }

  private async generateTaxOptimization(query: AIAssistantQuery): Promise<AIAssistantResponse> {
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

    const recommendations = [
      {
        title: 'Expense Review',
        description: 'Conduct quarterly review to ensure all deductible expenses are captured.',
        priority: 'high',
        category: 'Tax Optimization'
      },
      {
        title: 'Professional Consultation',
        description: 'Schedule annual tax planning session with a qualified tax practitioner.',
        priority: 'medium',
        category: 'Tax Planning'
      },
      {
        title: 'Digital Records',
        description: 'Maintain digital records for easy access and SARS compliance.',
        priority: 'medium',
        category: 'Compliance'
      }
    ];

    if (query.query.toLowerCase().includes('expense') || query.query.toLowerCase().includes('deduction')) {
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

    return {
      answer: optimization,
      confidence: 0.8,
      sources: ['Income Tax Act', 'VAT Act', 'SARS Practice Notes'],
      recommendations,
      follow_up_questions: [
        'What expenses can I deduct for my home office?',
        'How do I claim vehicle expenses?',
        'What are the small business tax benefits?',
        'How should I structure my business for tax efficiency?'
      ]
    };
  }

  private async generateGeneralHelp(query: AIAssistantQuery): Promise<AIAssistantResponse> {
    const lowerQuery = query.query.toLowerCase();
    let response = '';
    const recommendations: any[] = [];

    if (lowerQuery.includes('invoice') || lowerQuery.includes('billing')) {
      response = `**Invoice Management Help:**

To create professional invoices:
1. Go to Sales → Invoices → Create New
2. Select your customer or create a new one
3. Add products/services with proper descriptions
4. Include VAT if you're VAT registered
5. Set payment terms and due dates
6. Send directly via email or download PDF

**Best Practices:**
- Use sequential invoice numbers
- Include clear payment terms
- Add your business registration details
- Send invoices promptly upon delivery
- Follow up on overdue payments`;

      recommendations.push({
        title: 'Automate Invoice Reminders',
        description: 'Set up automated payment reminders to improve cash flow.',
        priority: 'medium',
        category: 'Process Improvement'
      });
    } else if (lowerQuery.includes('customer') || lowerQuery.includes('client')) {
      response = `**Customer Management Tips:**

Effective customer management includes:
1. **Complete Profiles**: Store contact details, payment terms, and preferences
2. **Communication History**: Track all interactions and communications
3. **Payment History**: Monitor payment patterns and creditworthiness
4. **Segmentation**: Group customers by value, industry, or other criteria

**Growing Your Customer Base:**
- Ask for referrals from satisfied customers
- Maintain excellent customer service
- Develop loyalty programs
- Regular follow-up communications`;
    } else if (lowerQuery.includes('expense') || lowerQuery.includes('cost')) {
      response = `**Expense Management Guide:**

Track expenses effectively:
1. **Categorize**: Use consistent expense categories
2. **Receipt Management**: Keep digital copies of all receipts
3. **Regular Entry**: Record expenses weekly or daily
4. **VAT Tracking**: Separate VAT and net amounts
5. **Business vs Personal**: Keep strict separation

**Common Business Expenses:**
- Office supplies and equipment
- Travel and accommodation
- Professional services
- Marketing and advertising
- Insurance premiums
- Utilities and rent`;
    } else if (lowerQuery.includes('report') || lowerQuery.includes('analysis')) {
      response = `**Financial Reporting Help:**

Key reports to review regularly:
1. **Profit & Loss**: Monthly review of income vs expenses
2. **Cash Flow**: Track money in and out of business
3. **Balance Sheet**: Snapshot of assets, liabilities, and equity
4. **Aged Debtors**: Monitor outstanding customer payments
5. **Expense Analysis**: Identify cost reduction opportunities

Access reports via: Reports → Financial Reports`;
    } else if (lowerQuery.includes('payment') || lowerQuery.includes('payfast')) {
      response = `**Payment Processing Help:**

Your PayFast integration allows:
1. **Online Payments**: Customers can pay invoices online
2. **Multiple Methods**: Credit cards, debit cards, instant EFT
3. **Automatic Updates**: Payment status updates automatically
4. **Security**: PCI-compliant payment processing

To enable online payments:
- Go to Settings → Payment Settings
- Configure PayFast credentials
- Add payment links to invoices`;
    } else {
      response = `**Taxnify Platform Help:**

I'm here to help with:
- **Business Questions**: Revenue analysis, customer insights, financial health
- **Compliance Guidance**: VAT, POPI, SARS requirements
- **Tax Optimization**: Deductions, allowances, planning strategies
- **System Help**: How to use invoicing, reporting, and other features

**Quick Navigation:**
- Dashboard: Overview of your business
- Sales: Invoices, estimates, customers
- Purchases: Suppliers, purchase orders, expenses
- Reports: Financial analysis and insights
- Settings: Company and system configuration

What specific area would you like help with?`;
    }

    return {
      answer: response,
      confidence: 0.85,
      sources: ['Taxnify User Guide', 'Best Practices', 'Industry Standards'],
      recommendations,
      follow_up_questions: [
        'How do I set up automated invoice reminders?',
        'What reports should I review monthly?',
        'How can I improve my cash flow?',
        'What are the most important business metrics to track?'
      ]
    };
  }

  private generateFallbackResponse(query: AIAssistantQuery): AIAssistantResponse {
    return {
      answer: `I understand you're asking about "${query.query}". I'm here to help with business insights, compliance guidance, financial analysis, tax optimization, and general platform assistance. 

Could you please rephrase your question or be more specific about what you'd like to know? For example:
- "How is my business performing this month?"
- "What VAT compliance steps do I need to take?"
- "How can I improve my profit margins?"
- "What expenses can I deduct for tax purposes?"`,
      confidence: 0.3,
      sources: [],
      follow_up_questions: [
        'How is my business performing?',
        'What compliance requirements do I need to meet?',
        'How can I optimize my taxes?',
        'What financial reports should I review?'
      ]
    };
  }

  // AI-powered insights and recommendations
  async generateDashboardInsights(companyId: number): Promise<{
    insights: string[];
    alerts: string[];
    recommendations: any[];
  }> {
    try {
      const insights: string[] = [];
      const alerts: string[] = [];
      const recommendations: any[] = [];

      // Get company data
      const invoices = await this.storage.getAllInvoices(companyId);
      const customers = await this.storage.getAllCustomers(companyId);
      const expenses = await this.storage.getAllExpenses(companyId);

      // Revenue insights
      const paidInvoices = invoices.filter(inv => inv.status === 'paid');
      const totalRevenue = paidInvoices.reduce((sum, inv) => sum + parseFloat(inv.total || '0'), 0);
      
      if (paidInvoices.length > 0) {
        insights.push(`You've generated R${totalRevenue.toLocaleString()} from ${paidInvoices.length} paid invoices`);
      }

      // Outstanding payments alert
      const overdueInvoices = invoices.filter(inv => 
        inv.status === 'overdue' || (inv.status === 'sent' && new Date(inv.dueDate || '') < new Date())
      );
      
      if (overdueInvoices.length > 0) {
        const overdueAmount = overdueInvoices.reduce((sum, inv) => sum + parseFloat(inv.total || '0'), 0);
        alerts.push(`${overdueInvoices.length} overdue invoices worth R${overdueAmount.toLocaleString()}`);
        recommendations.push({
          title: 'Follow up on overdue payments',
          description: 'Send payment reminders to improve cash flow',
          priority: 'high',
          category: 'Cash Flow'
        });
      }

      // Customer insights
      if (customers.length > 0) {
        const activeCustomers = customers.filter(c => 
          invoices.some(inv => inv.customerId === c.id && inv.status === 'paid')
        ).length;
        insights.push(`${activeCustomers} of ${customers.length} customers have made purchases`);
      }

      // Expense insights
      if (expenses.length > 0) {
        const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || '0'), 0);
        const profitMargin = totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue) * 100 : 0;
        insights.push(`Current profit margin: ${profitMargin.toFixed(1)}%`);
        
        if (profitMargin < 10) {
          recommendations.push({
            title: 'Review expense management',
            description: 'Low profit margin - consider cost optimization',
            priority: 'medium',
            category: 'Financial Health'
          });
        }
      }

      return { insights, alerts, recommendations };
    } catch (error) {
      console.error('Error generating dashboard insights:', error);
      return { insights: [], alerts: [], recommendations: [] };
    }
  }
}