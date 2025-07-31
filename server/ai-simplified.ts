import { IStorage } from './storage';

export interface AIAssistantQuery {
  type: 'business_insights' | 'compliance_guidance' | 'financial_analysis' | 'tax_optimization' | 'general_help';
  query: string;
  context?: {
    companyId: number;
    userId: number;
    currentPage?: string;
    timeframe?: string;
  };
}

export interface AIAssistantResponse {
  answer: string;
  confidence: number;
  sources: string[];
  actionable_items?: string[];
  follow_up_questions?: string[];
  recommendations?: Array<{
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    category: string;
  }>;
}

export class AIAssistantService {
  constructor(private storage: IStorage) {}

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
      const invoices = await this.storage.getAllInvoices(context.companyId);
      const customers = await this.storage.getAllCustomers(context.companyId);

      // Calculate key metrics
      const totalRevenue = invoices
        .filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + parseFloat(inv.total || '0'), 0);

      const avgInvoiceValue = invoices.length > 0 ? totalRevenue / invoices.length : 0;
      const customerCount = customers.length;
      const revenuePerCustomer = customerCount > 0 ? totalRevenue / customerCount : 0;

      let insights = '';
      const recommendations: Array<{
        title: string;
        description: string;
        priority: 'low' | 'medium' | 'high' | 'critical';
        category: string;
      }> = [];

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
      } else {
        insights = `Here's an overview of your business performance: You have ${customerCount} customers, `;
        insights += `R${totalRevenue.toLocaleString()} in revenue from ${invoices.length} invoices. `;
        insights += `Your average invoice value is R${avgInvoiceValue.toLocaleString()}.`;
      }

      return {
        answer: insights,
        confidence: 0.9,
        sources: ['Invoice Data', 'Customer Database'],
        recommendations,
        follow_up_questions: [
          'How can I improve my profit margins?',
          'What are my top-performing customers?',
          'How does my revenue compare to last month?'
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
    const recommendations: Array<{
      title: string;
      description: string;
      priority: 'low' | 'medium' | 'high' | 'critical';
      category: string;
    }> = [];

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
5. **Retention**: Don't keep personal data longer than necessary.`;
      
      recommendations.push({
        title: 'Implement Privacy Policy',
        description: 'Create and publish a comprehensive privacy policy on your website.',
        priority: 'high',
        category: 'Privacy Compliance'
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
- Labour relations compliance`;
    }

    return {
      answer: guidance,
      confidence: 0.85,
      sources: ['SARS Guidelines', 'POPI Act', 'Companies Act'],
      recommendations,
      follow_up_questions: [
        'How do I register for VAT?',
        'What records do I need to keep for SARS?',
        'How do I ensure POPI compliance?'
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
      
      // Calculate financial metrics
      const totalRevenue = invoices
        .filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + parseFloat(inv.total || '0'), 0);

      // Outstanding invoices
      const outstandingInvoices = invoices.filter(inv => inv.status === 'sent' || inv.status === 'overdue');
      const outstandingAmount = outstandingInvoices.reduce((sum, inv) => sum + parseFloat(inv.total || '0'), 0);

      let analysis = `**Financial Health Overview:**

Key Metrics:
- Revenue: R${totalRevenue.toLocaleString()}
- Outstanding: R${outstandingAmount.toLocaleString()}

Your business is `;
        
      if (outstandingAmount < totalRevenue * 0.2) {
        analysis += `in good financial health with manageable receivables.`;
      } else {
        analysis += `showing opportunities for improvement in collections.`;
      }

      const recommendations: Array<{
        title: string;
        description: string;
        priority: 'low' | 'medium' | 'high' | 'critical';
        category: string;
      }> = [];

      if (outstandingAmount > totalRevenue * 0.3) {
        recommendations.push({
          title: 'Improve Collections',
          description: 'Implement automated payment reminders and follow-up procedures for overdue invoices.',
          priority: 'high',
          category: 'Cash Flow Management'
        });
      }

      return {
        answer: analysis,
        confidence: 0.95,
        sources: ['Invoice Records', 'Financial Statements'],
        recommendations,
        follow_up_questions: [
          'How can I improve my cash flow?',
          'What are my biggest expense categories?',
          'How do I compare to industry benchmarks?'
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
6. **Retirement Contributions**: Maximize tax-deductible retirement fund contributions`;

    const recommendations: Array<{
      title: string;
      description: string;
      priority: 'low' | 'medium' | 'high' | 'critical';
      category: string;
    }> = [
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
      }
    ];

    return {
      answer: optimization,
      confidence: 0.8,
      sources: ['Income Tax Act', 'VAT Act', 'SARS Practice Notes'],
      recommendations,
      follow_up_questions: [
        'What expenses can I deduct for my home office?',
        'How do I claim vehicle expenses?',
        'What are the small business tax benefits?'
      ]
    };
  }

  private async generateGeneralHelp(query: AIAssistantQuery): Promise<AIAssistantResponse> {
    const lowerQuery = query.query.toLowerCase();
    let response = '';
    const recommendations: Array<{
      title: string;
      description: string;
      priority: 'low' | 'medium' | 'high' | 'critical';
      category: string;
    }> = [];

    if (lowerQuery.includes('invoice') || lowerQuery.includes('billing')) {
      response = `**Invoice Management Help:**

To create professional invoices:
1. Go to Sales → Invoices → Create New
2. Select your customer or create a new one
3. Add products/services with proper descriptions
4. Include VAT if you're VAT registered
5. Set payment terms and due dates
6. Send directly via email or download PDF`;

      recommendations.push({
        title: 'Automate Invoice Reminders',
        description: 'Set up automated payment reminders to improve cash flow.',
        priority: 'medium',
        category: 'Process Improvement'
      });
    } else {
      response = `**Taxnify Platform Help:**

I'm here to help with:
- **Business Questions**: Revenue analysis, customer insights, financial health
- **Compliance Guidance**: VAT, POPI, SARS requirements
- **Tax Optimization**: Deductions, allowances, planning strategies
- **System Help**: How to use invoicing, reporting, and other features

What specific area would you like help with?`;
    }

    return {
      answer: response,
      confidence: 0.85,
      sources: ['Taxnify User Guide', 'Best Practices'],
      recommendations,
      follow_up_questions: [
        'How do I set up automated invoice reminders?',
        'What reports should I review monthly?',
        'How can I improve my cash flow?'
      ]
    };
  }

  private generateFallbackResponse(query: AIAssistantQuery): AIAssistantResponse {
    return {
      answer: `I understand you're asking about "${query.query}". I'm here to help with business insights, compliance guidance, financial analysis, tax optimization, and general platform assistance. 

Could you please rephrase your question or be more specific about what you'd like to know?`,
      confidence: 0.3,
      sources: [],
      follow_up_questions: [
        'How is my business performing?',
        'What compliance requirements do I need to meet?',
        'How can I optimize my taxes?'
      ]
    };
  }

  // AI-powered insights and recommendations
  async generateDashboardInsights(companyId: number): Promise<{
    insights: string[];
    alerts: string[];
    recommendations: Array<{
      title: string;
      description: string;
      priority: 'low' | 'medium' | 'high' | 'critical';
      category: string;
    }>;
  }> {
    try {
      const insights: string[] = [];
      const alerts: string[] = [];
      const recommendations: Array<{
        title: string;
        description: string;
        priority: 'low' | 'medium' | 'high' | 'critical';
        category: string;
      }> = [];

      // Get company data
      const invoices = await this.storage.getAllInvoices(companyId);
      const customers = await this.storage.getAllCustomers(companyId);

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

      return { insights, alerts, recommendations };
    } catch (error) {
      console.error('Error generating dashboard insights:', error);
      return { insights: [], alerts: [], recommendations: [] };
    }
  }
}