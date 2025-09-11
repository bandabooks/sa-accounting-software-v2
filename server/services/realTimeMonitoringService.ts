/**
 * Real-time Transaction Monitoring Service
 * Monitors bank transactions for South African banking patterns and triggers notifications
 */

import { DatabaseStorage } from '../storage';
import { transactionCategorizationService } from './transactionCategorizationService';
import { emailService } from './emailService';
import type { BankTransaction } from '@shared/schema';

interface MonitoringRule {
  id: string;
  name: string;
  type: 'threshold' | 'pattern' | 'duplicate' | 'vat' | 'compliance';
  enabled: boolean;
  conditions: Record<string, any>;
  actions: NotificationAction[];
}

interface NotificationAction {
  type: 'email' | 'sms' | 'push' | 'slack';
  recipients: string[];
  template: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface TransactionAlert {
  id: string;
  companyId: number;
  bankAccountId: number;
  transactionId: number;
  ruleId: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  actionable: boolean;
  metadata: Record<string, any>;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
}

export class RealTimeMonitoringService {
  private storage: DatabaseStorage;
  private monitoringRules: MonitoringRule[];

  constructor(storage: DatabaseStorage) {
    this.storage = storage;
    this.initializeDefaultRules();
  }

  /**
   * Initialize default SA banking monitoring rules
   */
  private initializeDefaultRules(): void {
    this.monitoringRules = [
      {
        id: 'large_expense_alert',
        name: 'Large Expense Alert',
        type: 'threshold',
        enabled: true,
        conditions: {
          amountThreshold: 50000,
          transactionType: 'debit'
        },
        actions: [{
          type: 'email',
          recipients: ['finance@company.com'],
          template: 'large_expense_alert',
          priority: 'high'
        }]
      },
      {
        id: 'duplicate_payment_detection',
        name: 'Duplicate Payment Detection',
        type: 'duplicate',
        enabled: true,
        conditions: {
          timePeriodHours: 24,
          amountTolerance: 0.01,
          descriptionSimilarity: 0.8
        },
        actions: [{
          type: 'email',
          recipients: ['finance@company.com'],
          template: 'duplicate_payment_alert',
          priority: 'medium'
        }]
      },
      {
        id: 'bank_fee_optimization',
        name: 'Bank Fee Optimization Alert',
        type: 'pattern',
        enabled: true,
        conditions: {
          categoryPattern: 'bank_fees',
          monthlyThreshold: 1000,
          feeTypes: ['service_fee', 'transaction_fee', 'maintenance_fee']
        },
        actions: [{
          type: 'email',
          recipients: ['finance@company.com'],
          template: 'bank_fee_optimization',
          priority: 'medium'
        }]
      },
      {
        id: 'vat_compliance_check',
        name: 'VAT Compliance Check',
        type: 'vat',
        enabled: true,
        conditions: {
          vatThreshold: 1000000, // Annual VAT registration threshold
          vatDeductibleThreshold: 10000 // Monthly deductible threshold
        },
        actions: [{
          type: 'email',
          recipients: ['finance@company.com'],
          template: 'vat_compliance_alert',
          priority: 'high'
        }]
      },
      {
        id: 'sars_payment_reminder',
        name: 'SARS Payment Reminder',
        type: 'compliance',
        enabled: true,
        conditions: {
          paymentTypes: ['paye', 'uif', 'vat', 'provisional_tax'],
          reminderDays: [7, 3, 1] // Days before due date
        },
        actions: [{
          type: 'email',
          recipients: ['finance@company.com'],
          template: 'sars_payment_reminder',
          priority: 'critical'
        }]
      },
      {
        id: 'unusual_transaction_pattern',
        name: 'Unusual Transaction Pattern',
        type: 'pattern',
        enabled: true,
        conditions: {
          deviationThreshold: 3, // Standard deviations from normal
          minimumTransactions: 10,
          analysisWindowDays: 30
        },
        actions: [{
          type: 'email',
          recipients: ['finance@company.com'],
          template: 'unusual_pattern_alert',
          priority: 'medium'
        }]
      }
    ];
  }

  /**
   * Monitor new transaction against all active rules
   */
  async monitorTransaction(transaction: BankTransaction): Promise<TransactionAlert[]> {
    const alerts: TransactionAlert[] = [];
    
    // Categorize the transaction first
    const category = await transactionCategorizationService.categorizeTransaction({
      description: transaction.description,
      amount: transaction.amount,
      reference: transaction.reference || undefined
    });

    for (const rule of this.monitoringRules.filter(r => r.enabled)) {
      const alert = await this.checkRule(rule, transaction, category);
      if (alert) {
        alerts.push(alert);
        await this.processAlert(alert);
      }
    }

    return alerts;
  }

  /**
   * Check a specific monitoring rule against a transaction
   */
  private async checkRule(
    rule: MonitoringRule, 
    transaction: BankTransaction, 
    category: any
  ): Promise<TransactionAlert | null> {
    switch (rule.type) {
      case 'threshold':
        return this.checkThresholdRule(rule, transaction, category);
      
      case 'duplicate':
        return await this.checkDuplicateRule(rule, transaction);
      
      case 'pattern':
        return await this.checkPatternRule(rule, transaction, category);
      
      case 'vat':
        return await this.checkVATRule(rule, transaction, category);
      
      case 'compliance':
        return await this.checkComplianceRule(rule, transaction, category);
      
      default:
        return null;
    }
  }

  /**
   * Check threshold-based rules (amount limits, etc.)
   */
  private checkThresholdRule(
    rule: MonitoringRule, 
    transaction: BankTransaction, 
    category: any
  ): TransactionAlert | null {
    const amount = Math.abs(parseFloat(transaction.amount));
    const threshold = rule.conditions.amountThreshold;

    if (amount >= threshold) {
      const isExpense = transaction.transactionType === 'debit' || parseFloat(transaction.amount) < 0;
      
      if (rule.conditions.transactionType === 'debit' && isExpense) {
        return {
          id: `${rule.id}_${transaction.id}`,
          companyId: transaction.companyId,
          bankAccountId: transaction.bankAccountId,
          transactionId: transaction.id,
          ruleId: rule.id,
          severity: amount >= threshold * 2 ? 'critical' : 'warning',
          title: `Large ${isExpense ? 'Expense' : 'Income'} Detected`,
          message: `Transaction of R${amount.toLocaleString()} detected - ${transaction.description}. Category: ${category.name}`,
          actionable: true,
          metadata: {
            amount,
            threshold,
            category: category.name,
            confidence: category.confidence
          }
        };
      }
    }

    return null;
  }

  /**
   * Check for duplicate transactions
   */
  private async checkDuplicateRule(
    rule: MonitoringRule, 
    transaction: BankTransaction
  ): Promise<TransactionAlert | null> {
    const timeWindow = rule.conditions.timePeriodHours * 60 * 60 * 1000;
    const startTime = new Date(Date.now() - timeWindow);
    
    // Find similar transactions within time window
    const similarTransactions = await this.storage.findSimilarTransactions(
      transaction.companyId,
      transaction.bankAccountId,
      transaction.amount,
      transaction.normalizedDescription || transaction.description,
      startTime
    );

    if (similarTransactions.length > 0) {
      return {
        id: `${rule.id}_${transaction.id}`,
        companyId: transaction.companyId,
        bankAccountId: transaction.bankAccountId,
        transactionId: transaction.id,
        ruleId: rule.id,
        severity: 'warning',
        title: 'Potential Duplicate Transaction',
        message: `Possible duplicate of transaction on ${similarTransactions[0].transactionDate} for R${Math.abs(parseFloat(transaction.amount))}`,
        actionable: true,
        metadata: {
          similarTransactions: similarTransactions.map(t => ({
            id: t.id,
            date: t.transactionDate,
            amount: t.amount,
            description: t.description
          }))
        }
      };
    }

    return null;
  }

  /**
   * Check pattern-based rules
   */
  private async checkPatternRule(
    rule: MonitoringRule, 
    transaction: BankTransaction, 
    category: any
  ): Promise<TransactionAlert | null> {
    if (rule.id === 'bank_fee_optimization') {
      if (category.id === 'bank_fees') {
        // Check monthly bank fees
        const monthlyFees = await this.calculateMonthlyBankFees(
          transaction.companyId,
          transaction.bankAccountId
        );
        
        if (monthlyFees >= rule.conditions.monthlyThreshold) {
          return {
            id: `${rule.id}_${transaction.id}`,
            companyId: transaction.companyId,
            bankAccountId: transaction.bankAccountId,
            transactionId: transaction.id,
            ruleId: rule.id,
            severity: 'medium',
            title: 'High Bank Fees Detected',
            message: `Monthly bank fees of R${monthlyFees.toLocaleString()} exceed threshold. Consider optimizing banking package.`,
            actionable: true,
            metadata: {
              monthlyFees,
              threshold: rule.conditions.monthlyThreshold,
              recommendations: [
                'Review current banking package',
                'Consider consolidating accounts',
                'Evaluate digital banking options',
                'Review transaction patterns'
              ]
            }
          };
        }
      }
    }

    if (rule.id === 'unusual_transaction_pattern') {
      const isUnusual = await this.detectUnusualPattern(
        transaction,
        rule.conditions.deviationThreshold,
        rule.conditions.analysisWindowDays
      );
      
      if (isUnusual) {
        return {
          id: `${rule.id}_${transaction.id}`,
          companyId: transaction.companyId,
          bankAccountId: transaction.bankAccountId,
          transactionId: transaction.id,
          ruleId: rule.id,
          severity: 'info',
          title: 'Unusual Transaction Pattern',
          message: `Transaction amount or timing deviates significantly from normal patterns`,
          actionable: false,
          metadata: {
            category: category.name,
            analysisWindow: rule.conditions.analysisWindowDays
          }
        };
      }
    }

    return null;
  }

  /**
   * Check VAT compliance rules
   */
  private async checkVATRule(
    rule: MonitoringRule, 
    transaction: BankTransaction, 
    category: any
  ): Promise<TransactionAlert | null> {
    if (category.vatApplicable) {
      const amount = Math.abs(parseFloat(transaction.amount));
      
      // Check if approaching VAT registration threshold
      const annualTurnover = await this.calculateAnnualTurnover(transaction.companyId);
      const vatThreshold = rule.conditions.vatThreshold;
      
      if (annualTurnover >= vatThreshold * 0.9) { // 90% of threshold
        return {
          id: `${rule.id}_${transaction.id}`,
          companyId: transaction.companyId,
          bankAccountId: transaction.bankAccountId,
          transactionId: transaction.id,
          ruleId: rule.id,
          severity: annualTurnover >= vatThreshold ? 'critical' : 'warning',
          title: 'VAT Registration Threshold Alert',
          message: `Annual turnover of R${annualTurnover.toLocaleString()} ${annualTurnover >= vatThreshold ? 'exceeds' : 'approaches'} VAT registration threshold`,
          actionable: true,
          metadata: {
            annualTurnover,
            threshold: vatThreshold,
            vatDeductible: amount,
            recommendations: [
              'Consider VAT registration',
              'Review VAT implications',
              'Consult tax advisor',
              'Update accounting procedures'
            ]
          }
        };
      }
    }

    return null;
  }

  /**
   * Check compliance rules (SARS payments, etc.)
   */
  private async checkComplianceRule(
    rule: MonitoringRule, 
    transaction: BankTransaction, 
    category: any
  ): Promise<TransactionAlert | null> {
    // This would integrate with SARS payment schedule
    // For now, detect SARS-related transactions
    if (category.id === 'tax_payments') {
      const amount = Math.abs(parseFloat(transaction.amount));
      
      return {
        id: `${rule.id}_${transaction.id}`,
        companyId: transaction.companyId,
        bankAccountId: transaction.bankAccountId,
        transactionId: transaction.id,
        ruleId: rule.id,
        severity: 'info',
        title: 'Tax Payment Recorded',
        message: `Tax payment of R${amount.toLocaleString()} recorded - ${transaction.description}`,
        actionable: false,
        metadata: {
          amount,
          paymentType: category.name,
          recommendations: [
            'Verify payment with SARS',
            'Update tax records',
            'File supporting documentation'
          ]
        }
      };
    }

    return null;
  }

  /**
   * Process and dispatch alert
   */
  private async processAlert(alert: TransactionAlert): Promise<void> {
    // Store alert in database (would need to create alerts table)
    console.log(`🚨 Transaction Alert: ${alert.title} - ${alert.message}`);
    
    // Find the rule and execute actions
    const rule = this.monitoringRules.find(r => r.id === alert.ruleId);
    if (rule) {
      for (const action of rule.actions) {
        await this.executeNotificationAction(action, alert);
      }
    }
  }

  /**
   * Execute notification action
   */
  private async executeNotificationAction(
    action: NotificationAction, 
    alert: TransactionAlert
  ): Promise<void> {
    try {
      switch (action.type) {
        case 'email':
          await this.sendEmailNotification(action, alert);
          break;
        case 'sms':
          // Would integrate with SMS provider
          console.log(`📱 SMS notification: ${alert.title}`);
          break;
        case 'push':
          // Would integrate with push notification service
          console.log(`📲 Push notification: ${alert.title}`);
          break;
        case 'slack':
          // Would integrate with Slack API
          console.log(`💬 Slack notification: ${alert.title}`);
          break;
      }
    } catch (error) {
      console.error(`Failed to send ${action.type} notification:`, error);
    }
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(
    action: NotificationAction, 
    alert: TransactionAlert
  ): Promise<void> {
    const emailTemplate = this.getEmailTemplate(action.template, alert);
    
    try {
      await emailService.sendEmail({
        to: action.recipients,
        subject: `[${alert.severity.toUpperCase()}] ${alert.title}`,
        html: emailTemplate,
        priority: action.priority
      });
    } catch (error) {
      console.error('Failed to send email notification:', error);
    }
  }

  /**
   * Get email template for alert
   */
  private getEmailTemplate(templateName: string, alert: TransactionAlert): string {
    const baseTemplate = `
      <h2 style="color: ${this.getSeverityColor(alert.severity)};">
        ${alert.title}
      </h2>
      <p>${alert.message}</p>
      <div style="background-color: #f5f5f5; padding: 15px; margin: 10px 0;">
        <strong>Details:</strong><br>
        Company ID: ${alert.companyId}<br>
        Bank Account: ${alert.bankAccountId}<br>
        Transaction ID: ${alert.transactionId}<br>
        Severity: ${alert.severity}<br>
      </div>
    `;

    // Add specific template content based on alert type
    switch (templateName) {
      case 'bank_fee_optimization':
        return baseTemplate + `
          <h3>Recommendations:</h3>
          <ul>
            ${alert.metadata.recommendations?.map((rec: string) => `<li>${rec}</li>`).join('') || ''}
          </ul>
        `;
      
      case 'vat_compliance_alert':
        return baseTemplate + `
          <h3>VAT Compliance Information:</h3>
          <p>Annual Turnover: R${alert.metadata.annualTurnover?.toLocaleString()}</p>
          <p>Threshold: R${alert.metadata.threshold?.toLocaleString()}</p>
          <h3>Recommended Actions:</h3>
          <ul>
            ${alert.metadata.recommendations?.map((rec: string) => `<li>${rec}</li>`).join('') || ''}
          </ul>
        `;
      
      default:
        return baseTemplate;
    }
  }

  /**
   * Get color for alert severity
   */
  private getSeverityColor(severity: string): string {
    switch (severity) {
      case 'critical': return '#dc3545';
      case 'error': return '#e74c3c';
      case 'warning': return '#f39c12';
      case 'info': return '#17a2b8';
      default: return '#6c757d';
    }
  }

  // Helper methods for calculations
  private async calculateMonthlyBankFees(companyId: number, bankAccountId: number): Promise<number> {
    // Implementation would query bank transactions for current month with bank fee categories
    return 850; // Mock value
  }

  private async calculateAnnualTurnover(companyId: number): Promise<number> {
    // Implementation would calculate annual turnover from income transactions
    return 900000; // Mock value
  }

  private async detectUnusualPattern(
    transaction: BankTransaction, 
    deviationThreshold: number, 
    windowDays: number
  ): Promise<boolean> {
    // Implementation would analyze historical patterns using statistical methods
    return false; // Mock implementation
  }

  /**
   * Get monitoring rules for a company
   */
  getMonitoringRules(): MonitoringRule[] {
    return this.monitoringRules;
  }

  /**
   * Update monitoring rule
   */
  updateMonitoringRule(ruleId: string, updates: Partial<MonitoringRule>): void {
    const ruleIndex = this.monitoringRules.findIndex(r => r.id === ruleId);
    if (ruleIndex >= 0) {
      this.monitoringRules[ruleIndex] = { ...this.monitoringRules[ruleIndex], ...updates };
    }
  }
}

export const realTimeMonitoringService = new RealTimeMonitoringService(new DatabaseStorage());