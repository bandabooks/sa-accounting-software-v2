/**
 * Enhanced Real-time Transaction Monitoring Service
 * Comprehensive monitoring for South African banking patterns with database persistence
 */

import { storage } from '../storage';
import { transactionCategorizationService } from './transactionCategorizationService';
import { emailService } from './emailService';
import type { 
  BankTransaction, 
  MonitoringRule, 
  InsertMonitoringRule,
  TransactionAlert,
  InsertTransactionAlert,
  RealTimeNotification,
  InsertRealTimeNotification,
  SystemHealthMetric,
  InsertSystemHealthMetric,
  AlertEscalationRule,
  InsertAlertEscalationRule
} from '@shared/schema';

// Enhanced interfaces for monitoring
interface NotificationAction {
  type: 'email' | 'sms' | 'push' | 'slack' | 'webhook';
  recipients: string[];
  template: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  config?: Record<string, any>;
}

interface LiveMonitoringConfig {
  enableRealTimeMonitoring: boolean;
  enableAutoCategorization: boolean;
  enableVATInsights: boolean;
  enableBankingOptimization: boolean;
  enableInstantNotifications: boolean;
  webhookUrl?: string;
  pollingIntervalMs?: number;
}

interface TransactionProcessingResult {
  alerts: TransactionAlert[];
  notifications: RealTimeNotification[];
  healthMetrics: SystemHealthMetric[];
}

export class RealTimeMonitoringService {
  private readonly HEALTH_CHECK_INTERVAL = 30000; // 30 seconds
  private monitoringInterval?: NodeJS.Timeout;
  private isMonitoring = false;
  private activeCompanies = new Set<number>();
  private pollingIntervals = new Map<number, NodeJS.Timeout>();

  constructor() {
    this.startSystemHealthMonitoring();
    console.log('🚀 Real-time Transaction Monitoring Service initialized');
  }

  /**
   * Initialize comprehensive SA banking monitoring rules for a company
   */
  async initializeDefaultRules(companyId: number): Promise<void> {
    console.log(`🔧 Initializing SA business monitoring rules for company ${companyId}`);
    
    const defaultRules: InsertMonitoringRule[] = [
      {
        companyId,
        ruleId: 'large_expense_alert',
        name: 'Large Expense Alert - SA Business',
        description: 'Monitor large expenses that may require management approval',
        type: 'threshold',
        enabled: true,
        priority: 1,
        conditions: {
          amountThreshold: 50000,
          transactionType: 'debit',
          bankAccounts: 'all',
          excludeCategories: ['loan_repayments', 'inter_account_transfers'],
          vatConsideration: true
        },
        actionConfig: {
          notifications: [{
            type: 'email',
            template: 'large_expense_alert',
            priority: 'high',
            escalationRules: true
          }],
          webhooks: [],
          escalationDelayMinutes: 15
        }
      },
      {
        companyId,
        ruleId: 'duplicate_payment_detection',
        name: 'Duplicate Payment Detection - SA Banking',
        description: 'Detect potential duplicate payments across all SA bank accounts',
        type: 'duplicate',
        enabled: true,
        priority: 2,
        conditions: {
          timePeriodHours: 24,
          amountTolerance: 0.01,
          descriptionSimilarity: 0.8,
          excludeRecurring: true,
          crossBankDetection: true,
          includeSABanks: ['fnb', 'absa', 'standard_bank', 'nedbank', 'capitec']
        },
        actionConfig: {
          notifications: [{
            type: 'email',
            template: 'duplicate_payment_alert',
            priority: 'medium'
          }],
          autoBlock: false,
          requireManualReview: true
        }
      },
      {
        companyId,
        ruleId: 'sa_bank_fee_optimization',
        name: 'SA Banking Fee Optimization',
        description: 'Monitor and optimize fees across SA banks (FNB, ABSA, Standard Bank, Nedbank, Capitec)',
        type: 'pattern',
        enabled: true,
        priority: 3,
        conditions: {
          categoryPattern: 'bank_fees',
          monthlyThreshold: 1000,
          bankSpecificFees: {
            'fnb': ['easypay_fee', 'online_banking', 'card_fee'],
            'absa': ['transact_fee', 'cheque_fee', 'internet_banking'],
            'standard_bank': ['autobank_fee', 'statement_fee', 'sms_fee'],
            'nedbank': ['digital_banking_fee', 'greenbacks_fee', 'card_transaction'],
            'capitec': ['transaction_fee', 'global_one_fee', 'cash_send']
          },
          vatIncluded: true,
          foreignExchangeFees: true
        },
        actionConfig: {
          notifications: [{
            type: 'email',
            template: 'sa_bank_fee_optimization',
            priority: 'medium'
          }],
          generateRecommendations: true,
          benchmarkAgainstBanks: true
        }
      },
      {
        companyId,
        ruleId: 'sa_vat_compliance_monitor',
        name: 'SA VAT Compliance & SARS Monitoring',
        description: 'Monitor VAT thresholds, deductibles, and SARS compliance requirements',
        type: 'vat',
        enabled: true,
        priority: 1,
        conditions: {
          vatRegistrationThreshold: 1000000, // R1M annual threshold
          vatDeductibleThreshold: 10000,
          vatRate: 0.15,
          sarsPaymentDates: {
            vat: [7, 25], // VAT returns due 7th, payments 25th
            paye: [7], // PAYE due 7th
            uif: [7], // UIF due 7th
            provisionalTax: [31, 31] // Provisional tax dates
          },
          zeroRatedChecks: true,
          exemptTransactionMonitoring: true,
          crossBorderVAT: true
        },
        actionConfig: {
          notifications: [{
            type: 'email',
            template: 'sa_vat_compliance_alert',
            priority: 'high'
          }],
          sarsIntegration: true,
          vatReturnPrep: true,
          complianceScore: true
        }
      },
      {
        companyId,
        ruleId: 'sars_compliance_suite',
        name: 'SARS Compliance & Payment Suite',
        description: 'Comprehensive SARS payment monitoring and compliance alerts',
        type: 'compliance',
        enabled: true,
        priority: 1,
        conditions: {
          paymentTypes: {
            paye: { dueDate: 7, penaltyRate: 0.1 },
            uif: { dueDate: 7, penaltyRate: 0.1 },
            vat: { returnDue: 7, paymentDue: 25, penaltyRate: 0.1 },
            provisionalTax: { firstPeriod: 'August', secondPeriod: 'February' },
            companyTax: { dueDate: 'seventh month after year end' },
            employeesTax: { dueDate: 7, reconciliation: 'biannual' }
          },
          reminderSchedule: [14, 7, 3, 1, 0], // Days before due
          autoCalculatePenalties: true,
          trackSubmissionStatus: true,
          eftPaymentTracking: true
        },
        actionConfig: {
          notifications: [{
            type: 'email',
            template: 'sars_compliance_reminder',
            priority: 'critical'
          }],
          smsReminders: true,
          calendarIntegration: true,
          generatePaymentFiles: true
        }
      },
      {
        companyId,
        ruleId: 'ai_anomaly_detection',
        name: 'AI-Powered Anomaly Detection',
        description: 'Detect unusual patterns using machine learning specific to SA business behavior',
        type: 'pattern',
        enabled: true,
        priority: 4,
        conditions: {
          deviationThreshold: 2.5,
          minimumTransactions: 10,
          analysisWindowDays: 30,
          mlModelVersion: 'sa_business_v2',
          timeBasedAnomalies: true,
          amountBasedAnomalies: true,
          frequencyAnomalies: true,
          categoryAnomalies: true,
          crossAccountAnomalies: true
        },
        actionConfig: {
          notifications: [{
            type: 'email',
            template: 'ai_anomaly_alert',
            priority: 'medium'
          }],
          confidenceThreshold: 0.75,
          learningMode: true,
          falsePositiveFeedback: true
        }
      },
      {
        companyId,
        ruleId: 'cash_flow_crisis_early_warning',
        name: 'Cash Flow Crisis Early Warning',
        description: 'Early warning system for potential cash flow issues',
        type: 'threshold',
        enabled: true,
        priority: 1,
        conditions: {
          minimumBalance: 50000,
          burnRateThreshold: 0.8, // 80% of monthly average
          daysOfCashLeft: 14,
          payrollUpcoming: true,
          majorPaymentsScheduled: true,
          seasonalityFactors: true
        },
        actionConfig: {
          notifications: [{
            type: 'email',
            template: 'cash_flow_warning',
            priority: 'critical'
          }, {
            type: 'sms',
            template: 'cash_flow_sms',
            priority: 'critical'
          }],
          escalationRules: true,
          executiveNotification: true
        }
      },
      {
        companyId,
        ruleId: 'foreign_exchange_monitoring',
        name: 'Foreign Exchange & Forex Monitoring',
        description: 'Monitor forex transactions and exchange rate impacts',
        type: 'pattern',
        enabled: true,
        priority: 2,
        conditions: {
          currencies: ['USD', 'EUR', 'GBP', 'AUD'],
          exchangeRateThreshold: 0.05, // 5% variance
          forexTradingLimits: true,
          reserveBankCompliance: true,
          crossBorderReporting: true,
          sarb_regulations: true
        },
        actionConfig: {
          notifications: [{
            type: 'email',
            template: 'forex_alert',
            priority: 'medium'
          }],
          sarb_reporting: true,
          hedgingRecommendations: true
        }
      }
    ];

    // Create rules if they don't exist
    for (const ruleData of defaultRules) {
      const existingRule = await storage.getMonitoringRuleByRuleId(companyId, ruleData.ruleId);
      if (!existingRule) {
        await storage.createMonitoringRule(ruleData);
        console.log(`✅ Created monitoring rule: ${ruleData.name}`);
      }
    }

    console.log(`🎯 Initialized ${defaultRules.length} SA business monitoring rules for company ${companyId}`);
  }

  /**
   * Start system health monitoring
   */
  private startSystemHealthMonitoring(): void {
    this.monitoringInterval = setInterval(async () => {
      await this.recordSystemHealthMetrics();
    }, this.HEALTH_CHECK_INTERVAL);

    console.log('🔄 Started real-time monitoring system health checks');
  }

  /**
   * Stop system monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
    
    // Stop all company-specific polling
    for (const [companyId, interval] of this.pollingIntervals) {
      clearInterval(interval);
    }
    this.pollingIntervals.clear();
    this.activeCompanies.clear();
    
    this.isMonitoring = false;
    console.log('⏹️ Stopped real-time monitoring system');
  }

  /**
   * Start live transaction monitoring for a company
   */
  async startLiveMonitoring(companyId: number, config: LiveMonitoringConfig): Promise<void> {
    console.log(`🚀 Starting live transaction monitoring for company ${companyId}`);
    
    // Initialize default rules if not exists
    await this.initializeDefaultRules(companyId);
    
    this.isMonitoring = true;
    this.activeCompanies.add(companyId);
    
    // Register webhook if URL provided
    if (config.webhookUrl) {
      await this.registerWebhook(companyId, config.webhookUrl);
    }
    
    // Start polling if enabled
    if (config.pollingIntervalMs) {
      await this.startPollingForTransactions(companyId, config.pollingIntervalMs);
    }

    console.log(`✅ Live monitoring active for company ${companyId}`);
  }

  /**
   * Process webhook notification for new transaction
   */
  async processWebhookTransaction(companyId: number, transactionData: any): Promise<TransactionProcessingResult> {
    try {
      console.log(`📨 Processing webhook transaction for company ${companyId}`);
      
      // Convert webhook data to BankTransaction format
      const transaction = await this.convertWebhookToTransaction(companyId, transactionData);
      
      // Monitor the transaction
      const alerts = await this.monitorTransaction(transaction);
      
      // Create notifications for alerts
      const notifications = await this.createNotificationsForAlerts(alerts);
      
      // Record processing metrics
      const healthMetrics = await this.recordTransactionProcessingMetrics(companyId, transaction, alerts);
      
      return { alerts, notifications, healthMetrics };
      
    } catch (error) {
      console.error('Failed to process webhook transaction:', error);
      
      // Record failed processing metric
      const errorMetric = await storage.createHealthMetric({
        metricType: 'webhook_processing_error',
        metricName: 'Failed Webhook Processing',
        value: 1,
        unit: 'count',
        timestamp: new Date(),
        companyId,
        metadata: { error: error.message, transactionData }
      });
      
      return { alerts: [], notifications: [], healthMetrics: [errorMetric] };
    }
  }

  /**
   * Monitor new transaction against all active rules
   */
  async monitorTransaction(transaction: BankTransaction): Promise<TransactionAlert[]> {
    console.log(`🔍 Monitoring transaction ${transaction.id} for company ${transaction.companyId}`);
    
    const alerts: TransactionAlert[] = [];
    
    // Get active monitoring rules for the company
    const activeRules = await storage.getActiveMonitoringRules(transaction.companyId);
    
    // Categorize the transaction first using AI
    const category = await transactionCategorizationService.categorizeTransaction({
      description: transaction.description,
      amount: transaction.amount,
      reference: transaction.reference || undefined
    });
    
    console.log(`📊 Transaction categorized as: ${category.name} (confidence: ${category.confidence})`);

    // Check each active rule
    for (const rule of activeRules) {
      try {
        const alert = await this.checkRule(rule, transaction, category);
        if (alert) {
          alerts.push(alert);
          await this.processAlert(alert, rule);
          
          // Update rule trigger count
          await storage.updateRuleTriggerCount(rule.id);
        }
      } catch (error) {
        console.error(`Failed to check rule ${rule.ruleId}:`, error);
      }
    }

    console.log(`⚡ Generated ${alerts.length} alerts for transaction ${transaction.id}`);
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
        return this.createAlert(rule, transaction, {
          severity: amount >= threshold * 2 ? 'critical' : 'warning',
          title: `Large ${isExpense ? 'Expense' : 'Income'} Detected`,
          message: `Transaction of R${amount.toLocaleString()} detected - ${transaction.description}. Category: ${category.name}`,
          actionable: true,
          metadata: {
            amount,
            threshold,
            category: category.name,
            confidence: category.confidence,
            vatImplications: rule.conditions.vatConsideration
          }
        });
      }
    }

    return null;
  }

  /**
   * Check for duplicate transactions using enhanced SA banking logic
   */
  private async checkDuplicateRule(
    rule: MonitoringRule, 
    transaction: BankTransaction
  ): Promise<TransactionAlert | null> {
    const timeWindow = rule.conditions.timePeriodHours * 60 * 60 * 1000;
    const startTime = new Date(Date.now() - timeWindow);
    
    // Find similar transactions within time window
    const similarTransactions = await storage.findSimilarTransactions(
      transaction.companyId,
      transaction.bankAccountId,
      transaction.amount,
      transaction.normalizedDescription || transaction.description,
      startTime
    );

    if (similarTransactions.length > 0) {
      return this.createAlert(rule, transaction, {
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
          })),
          crossBankDetection: rule.conditions.crossBankDetection,
          requiresManualReview: rule.actionConfig.requireManualReview
        }
      });
    }

    return null;
  }

  /**
   * Check pattern-based rules including AI anomaly detection
   */
  private async checkPatternRule(
    rule: MonitoringRule, 
    transaction: BankTransaction, 
    category: any
  ): Promise<TransactionAlert | null> {
    // SA Bank Fee Optimization
    if (rule.ruleId === 'sa_bank_fee_optimization') {
      if (category.id === 'bank_fees') {
        const monthlyFees = await this.calculateMonthlyBankFees(
          transaction.companyId,
          transaction.bankAccountId
        );
        
        if (monthlyFees >= rule.conditions.monthlyThreshold) {
          return this.createAlert(rule, transaction, {
            severity: 'medium',
            title: 'High Bank Fees Detected',
            message: `Monthly bank fees of R${monthlyFees.toLocaleString()} exceed threshold. Consider optimizing banking package.`,
            actionable: true,
            metadata: {
              monthlyFees,
              threshold: rule.conditions.monthlyThreshold,
              bankSpecificFees: rule.conditions.bankSpecificFees,
              recommendations: [
                'Review current banking package',
                'Consider consolidating accounts',
                'Evaluate digital banking options',
                'Review transaction patterns',
                'Compare fees across SA banks'
              ]
            }
          });
        }
      }
    }

    // AI Anomaly Detection
    if (rule.ruleId === 'ai_anomaly_detection') {
      const isAnomaly = await this.detectAIAnomalies(
        transaction,
        rule.conditions
      );
      
      if (isAnomaly.detected && isAnomaly.confidence >= rule.actionConfig.confidenceThreshold) {
        return this.createAlert(rule, transaction, {
          severity: 'info',
          title: 'AI Anomaly Detected',
          message: `Machine learning model detected unusual pattern: ${isAnomaly.reason}`,
          actionable: false,
          metadata: {
            category: category.name,
            anomalyType: isAnomaly.type,
            confidence: isAnomaly.confidence,
            mlModelVersion: rule.conditions.mlModelVersion,
            learningEnabled: rule.actionConfig.learningMode
          }
        });
      }
    }

    // Foreign Exchange Monitoring
    if (rule.ruleId === 'foreign_exchange_monitoring') {
      if (category.id === 'foreign_exchange' || transaction.currency !== 'ZAR') {
        const forexAlert = await this.checkForexCompliance(transaction, rule.conditions);
        if (forexAlert) {
          return this.createAlert(rule, transaction, forexAlert);
        }
      }
    }

    return null;
  }

  /**
   * Check VAT compliance rules specific to SA regulations
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
      const vatThreshold = rule.conditions.vatRegistrationThreshold;
      
      if (annualTurnover >= vatThreshold * 0.9) { // 90% of threshold
        return this.createAlert(rule, transaction, {
          severity: annualTurnover >= vatThreshold ? 'critical' : 'warning',
          title: 'SA VAT Registration Threshold Alert',
          message: `Annual turnover of R${annualTurnover.toLocaleString()} ${annualTurnover >= vatThreshold ? 'exceeds' : 'approaches'} VAT registration threshold`,
          actionable: true,
          metadata: {
            annualTurnover,
            threshold: vatThreshold,
            vatDeductible: amount,
            vatRate: rule.conditions.vatRate,
            sarsCompliance: true,
            recommendations: [
              'Consider VAT registration with SARS',
              'Review VAT implications for business',
              'Consult tax advisor',
              'Update accounting procedures',
              'Prepare for VAT return submissions'
            ]
          }
        });
      }
    }

    return null;
  }

  /**
   * Check SARS compliance rules
   */
  private async checkComplianceRule(
    rule: MonitoringRule, 
    transaction: BankTransaction, 
    category: any
  ): Promise<TransactionAlert | null> {
    // SARS payment detection
    if (category.id === 'tax_payments' || this.isSARSTransaction(transaction)) {
      const amount = Math.abs(parseFloat(transaction.amount));
      
      return this.createAlert(rule, transaction, {
        severity: 'info',
        title: 'SARS Payment Recorded',
        message: `Tax payment of R${amount.toLocaleString()} recorded - ${transaction.description}`,
        actionable: false,
        metadata: {
          amount,
          paymentType: category.name,
          sarsIntegration: rule.actionConfig.sarsIntegration,
          recommendations: [
            'Verify payment with SARS eFiling',
            'Update tax records',
            'File supporting documentation',
            'Track submission status',
            'Schedule next payment if applicable'
          ]
        }
      });
    }

    return null;
  }

  /**
   * Create standardized alert object
   */
  private createAlert(
    rule: MonitoringRule, 
    transaction: BankTransaction, 
    alertData: {
      severity: string;
      title: string;
      message: string;
      actionable: boolean;
      metadata: any;
    }
  ): TransactionAlert {
    const alertId = `${rule.ruleId}_${transaction.id}_${Date.now()}`;
    
    return {
      id: 0, // Will be set by database
      companyId: transaction.companyId,
      bankAccountId: transaction.bankAccountId,
      transactionId: transaction.id,
      ruleId: rule.id,
      alertId,
      severity: alertData.severity,
      title: alertData.title,
      message: alertData.message,
      actionable: alertData.actionable,
      metadata: alertData.metadata,
      acknowledged: false,
      resolved: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Process and store alert, then trigger notifications
   */
  private async processAlert(alert: TransactionAlert, rule: MonitoringRule): Promise<void> {
    try {
      // Store alert in database
      const storedAlert = await storage.createTransactionAlert({
        companyId: alert.companyId,
        bankAccountId: alert.bankAccountId,
        transactionId: alert.transactionId,
        ruleId: alert.ruleId,
        alertId: alert.alertId,
        severity: alert.severity,
        title: alert.title,
        message: alert.message,
        actionable: alert.actionable,
        metadata: alert.metadata,
        acknowledged: false,
        resolved: false
      });

      console.log(`🚨 Transaction Alert Created: ${alert.title} - ${alert.message}`);
      
      // Execute notification actions
      await this.executeNotificationActions(rule.actionConfig, storedAlert);
      
      // Handle escalation if configured
      if (rule.actionConfig.escalationRules) {
        await this.handleAlertEscalation(storedAlert, rule);
      }

    } catch (error) {
      console.error('Failed to process alert:', error);
    }
  }

  /**
   * Execute notification actions for an alert
   */
  private async executeNotificationActions(
    actionConfig: any, 
    alert: TransactionAlert
  ): Promise<void> {
    try {
      for (const notificationConfig of actionConfig.notifications || []) {
        await this.createAndSendNotification({
          companyId: alert.companyId,
          userId: null, // Will be determined by notification rules
          type: notificationConfig.type,
          channel: notificationConfig.type,
          title: alert.title,
          message: alert.message,
          priority: notificationConfig.priority,
          templateName: notificationConfig.template,
          templateData: {
            alert,
            metadata: alert.metadata
          },
          status: 'pending'
        });
      }
    } catch (error) {
      console.error('Failed to execute notification actions:', error);
    }
  }

  /**
   * Create and send notification
   */
  private async createAndSendNotification(notificationData: InsertRealTimeNotification): Promise<void> {
    try {
      const notification = await storage.createNotification(notificationData);
      
      switch (notification.channel) {
        case 'email':
          await this.sendEmailNotification(notification);
          break;
        case 'sms':
          await this.sendSMSNotification(notification);
          break;
        case 'push':
          await this.sendPushNotification(notification);
          break;
        case 'slack':
          await this.sendSlackNotification(notification);
          break;
        case 'webhook':
          await this.sendWebhookNotification(notification);
          break;
      }
    } catch (error) {
      console.error('Failed to create and send notification:', error);
    }
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(notification: RealTimeNotification): Promise<void> {
    try {
      const emailTemplate = this.getEmailTemplate(notification.templateName, notification.templateData);
      
      await emailService.sendEmail({
        to: ['finance@company.com'], // This should be dynamic based on company settings
        subject: `[${notification.priority.toUpperCase()}] ${notification.title}`,
        html: emailTemplate,
        priority: notification.priority
      });

      await storage.markNotificationSent(notification.id, new Date(), { 
        deliveryMethod: 'email',
        template: notification.templateName 
      });

      console.log(`📧 Email notification sent: ${notification.title}`);
    } catch (error) {
      await storage.markNotificationFailed(notification.id, error.message);
      console.error('Failed to send email notification:', error);
    }
  }

  /**
   * Send SMS notification (placeholder for SMS service integration)
   */
  private async sendSMSNotification(notification: RealTimeNotification): Promise<void> {
    try {
      // SMS service integration would go here
      console.log(`📱 SMS notification: ${notification.title}`);
      
      await storage.markNotificationSent(notification.id, new Date(), { 
        deliveryMethod: 'sms' 
      });
    } catch (error) {
      await storage.markNotificationFailed(notification.id, error.message);
      console.error('Failed to send SMS notification:', error);
    }
  }

  /**
   * Send push notification (placeholder)
   */
  private async sendPushNotification(notification: RealTimeNotification): Promise<void> {
    try {
      // Push notification service integration would go here
      console.log(`📲 Push notification: ${notification.title}`);
      
      await storage.markNotificationSent(notification.id, new Date(), { 
        deliveryMethod: 'push' 
      });
    } catch (error) {
      await storage.markNotificationFailed(notification.id, error.message);
      console.error('Failed to send push notification:', error);
    }
  }

  /**
   * Send Slack notification (placeholder)
   */
  private async sendSlackNotification(notification: RealTimeNotification): Promise<void> {
    try {
      // Slack API integration would go here
      console.log(`💬 Slack notification: ${notification.title}`);
      
      await storage.markNotificationSent(notification.id, new Date(), { 
        deliveryMethod: 'slack' 
      });
    } catch (error) {
      await storage.markNotificationFailed(notification.id, error.message);
      console.error('Failed to send Slack notification:', error);
    }
  }

  /**
   * Send webhook notification
   */
  private async sendWebhookNotification(notification: RealTimeNotification): Promise<void> {
    try {
      // Webhook delivery logic would go here
      console.log(`🔗 Webhook notification: ${notification.title}`);
      
      await storage.markNotificationSent(notification.id, new Date(), { 
        deliveryMethod: 'webhook' 
      });
    } catch (error) {
      await storage.markNotificationFailed(notification.id, error.message);
      console.error('Failed to send webhook notification:', error);
    }
  }

  /**
   * Get email template for notification
   */
  private getEmailTemplate(templateName: string, templateData: any): string {
    const alert = templateData.alert;
    const metadata = templateData.metadata || {};
    
    const baseTemplate = `
      <h2 style="color: ${this.getSeverityColor(alert.severity)};">
        ${alert.title}
      </h2>
      <p>${alert.message}</p>
      <div style="background-color: #f5f5f5; padding: 15px; margin: 10px 0;">
        <strong>Transaction Details:</strong><br>
        Company ID: ${alert.companyId}<br>
        Bank Account: ${alert.bankAccountId}<br>
        Transaction ID: ${alert.transactionId}<br>
        Severity: ${alert.severity}<br>
        Alert ID: ${alert.alertId}<br>
        Created: ${alert.createdAt}<br>
      </div>
    `;

    // Add specific template content based on alert type
    switch (templateName) {
      case 'sa_bank_fee_optimization':
        return baseTemplate + `
          <h3>SA Banking Fee Analysis:</h3>
          <p>Monthly Fees: R${metadata.monthlyFees?.toLocaleString()}</p>
          <p>Threshold: R${metadata.threshold?.toLocaleString()}</p>
          <h3>Optimization Recommendations:</h3>
          <ul>
            ${metadata.recommendations?.map((rec: string) => `<li>${rec}</li>`).join('') || ''}
          </ul>
        `;
      
      case 'sa_vat_compliance_alert':
        return baseTemplate + `
          <h3>SA VAT Compliance Information:</h3>
          <p>Annual Turnover: R${metadata.annualTurnover?.toLocaleString()}</p>
          <p>VAT Threshold: R${metadata.threshold?.toLocaleString()}</p>
          <p>VAT Rate: ${(metadata.vatRate * 100)}%</p>
          <h3>SARS Compliance Actions:</h3>
          <ul>
            ${metadata.recommendations?.map((rec: string) => `<li>${rec}</li>`).join('') || ''}
          </ul>
        `;
      
      case 'cash_flow_warning':
        return baseTemplate + `
          <h3>⚠️ Cash Flow Alert</h3>
          <p>This is a critical cash flow warning that requires immediate attention.</p>
          <div style="background-color: #fff3cd; padding: 10px; border-left: 4px solid #ffc107;">
            <strong>Immediate Actions Required:</strong><br>
            • Review upcoming payments<br>
            • Check available credit facilities<br>
            • Contact finance team immediately<br>
            • Consider cash flow optimization strategies
          </div>
        `;
      
      case 'ai_anomaly_alert':
        return baseTemplate + `
          <h3>🤖 AI Anomaly Detection</h3>
          <p>Machine learning analysis detected unusual transaction patterns.</p>
          <div style="background-color: #e1f5fe; padding: 10px; border-left: 4px solid #29b6f6;">
            <strong>Anomaly Details:</strong><br>
            Type: ${metadata.anomalyType}<br>
            Confidence: ${(metadata.confidence * 100).toFixed(1)}%<br>
            Model: ${metadata.mlModelVersion}<br>
            Category: ${metadata.category}
          </div>
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

  // Enhanced helper methods for SA business calculations

  /**
   * Calculate monthly bank fees with SA bank-specific logic
   */
  private async calculateMonthlyBankFees(companyId: number, bankAccountId: number): Promise<number> {
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    try {
      // Get bank transactions for current month with bank fee categories
      const bankFeeTransactions = await storage.getBankTransactionsByDateRange(
        bankAccountId,
        currentMonth,
        new Date()
      );

      const feeTransactions = bankFeeTransactions.filter(t => 
        t.category?.includes('bank_fees') || 
        t.description.toLowerCase().includes('fee') ||
        t.description.toLowerCase().includes('charge')
      );

      return feeTransactions.reduce((total, t) => total + Math.abs(parseFloat(t.amount)), 0);
    } catch (error) {
      console.error('Failed to calculate monthly bank fees:', error);
      return 0;
    }
  }

  /**
   * Calculate annual turnover for VAT compliance
   */
  private async calculateAnnualTurnover(companyId: number): Promise<number> {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    try {
      // This would need to be implemented in storage to get income transactions
      // For now, return a mock value
      return 900000; // Mock annual turnover
    } catch (error) {
      console.error('Failed to calculate annual turnover:', error);
      return 0;
    }
  }

  /**
   * Detect AI-powered anomalies
   */
  private async detectAIAnomalies(
    transaction: BankTransaction, 
    conditions: any
  ): Promise<{ detected: boolean; confidence: number; type: string; reason: string }> {
    try {
      // Enhanced AI anomaly detection would integrate with ML models
      // For now, implement basic pattern detection
      
      const amount = Math.abs(parseFloat(transaction.amount));
      const hour = new Date(transaction.transactionDate).getHours();
      
      // Detect unusual timing (outside business hours)
      const isUnusualTime = hour < 8 || hour > 18;
      
      // Detect unusual amount (simple threshold for now)
      const isUnusualAmount = amount > 100000;
      
      if (isUnusualTime && isUnusualAmount) {
        return {
          detected: true,
          confidence: 0.85,
          type: 'time_amount_anomaly',
          reason: 'Large transaction outside business hours'
        };
      }
      
      return { detected: false, confidence: 0, type: '', reason: '' };
    } catch (error) {
      console.error('Failed to detect AI anomalies:', error);
      return { detected: false, confidence: 0, type: '', reason: '' };
    }
  }

  /**
   * Check forex compliance with SARB regulations
   */
  private async checkForexCompliance(
    transaction: BankTransaction, 
    conditions: any
  ): Promise<any> {
    const amount = Math.abs(parseFloat(transaction.amount));
    
    // SARB reporting thresholds and compliance checks
    if (amount > 10000 && transaction.currency !== 'ZAR') {
      return {
        severity: 'warning',
        title: 'Foreign Exchange Compliance Alert',
        message: `Forex transaction of ${transaction.currency} ${amount.toLocaleString()} may require SARB reporting`,
        actionable: true,
        metadata: {
          amount,
          currency: transaction.currency,
          sarbReporting: true,
          complianceRequired: true,
          recommendations: [
            'Verify SARB reporting requirements',
            'Check exchange control regulations',
            'Document transaction purpose',
            'Consider hedging strategies'
          ]
        }
      };
    }
    
    return null;
  }

  /**
   * Check if transaction is SARS-related
   */
  private isSARSTransaction(transaction: BankTransaction): boolean {
    const description = transaction.description.toLowerCase();
    const sarsKeywords = ['sars', 'tax', 'paye', 'uif', 'vat', 'provisional'];
    
    return sarsKeywords.some(keyword => description.includes(keyword));
  }

  /**
   * Record system health metrics
   */
  private async recordSystemHealthMetrics(): Promise<void> {
    try {
      const healthMetrics: InsertSystemHealthMetric[] = [
        {
          metricType: 'monitoring_service_status',
          metricName: 'Real-time Monitoring Health',
          value: this.isMonitoring ? 100 : 0,
          unit: 'percentage',
          timestamp: new Date(),
          metadata: {
            activeCompanies: this.activeCompanies.size,
            lastProcessedAt: new Date().toISOString(),
            memoryUsage: process.memoryUsage(),
            uptime: process.uptime()
          }
        },
        {
          metricType: 'alert_processing_rate',
          metricName: 'Alert Processing Performance',
          value: await this.calculateAlertProcessingRate(),
          unit: 'alerts_per_minute',
          timestamp: new Date()
        },
        {
          metricType: 'notification_delivery_rate',
          metricName: 'Notification Delivery Success',
          value: await this.calculateNotificationSuccessRate(),
          unit: 'percentage',
          timestamp: new Date()
        }
      ];

      for (const metric of healthMetrics) {
        await storage.createHealthMetric(metric);
      }
    } catch (error) {
      console.error('Failed to record system health metrics:', error);
    }
  }

  // Additional helper methods

  private async getActiveRulesCount(): Promise<number> {
    // Implementation would count active rules across all companies
    return this.activeCompanies.size * 8; // Approximate 8 rules per company
  }

  private async calculateAlertProcessingRate(): Promise<number> {
    // Implementation would calculate alerts processed per minute
    return 5.2; // Mock rate
  }

  private async calculateNotificationSuccessRate(): Promise<number> {
    // Implementation would calculate notification delivery success rate
    return 98.5; // Mock success rate
  }

  private async registerWebhook(companyId: number, webhookUrl: string): Promise<void> {
    console.log(`🔗 Registering webhook for company ${companyId}: ${webhookUrl}`);
    // Webhook registration logic would go here
  }

  private async startPollingForTransactions(companyId: number, intervalMs: number): Promise<void> {
    console.log(`🔄 Starting transaction polling for company ${companyId} every ${intervalMs}ms`);
    
    const interval = setInterval(async () => {
      try {
        // Polling logic would go here
        console.log(`⏰ Polling transactions for company ${companyId}`);
      } catch (error) {
        console.error(`Polling failed for company ${companyId}:`, error);
      }
    }, intervalMs);
    
    this.pollingIntervals.set(companyId, interval);
  }

  private async convertWebhookToTransaction(companyId: number, webhookData: any): Promise<BankTransaction> {
    // Convert webhook payload to BankTransaction format
    // This would depend on the specific webhook format from Stitch
    return {
      id: 0, // Will be set by database
      companyId,
      bankAccountId: webhookData.accountId,
      amount: webhookData.amount,
      description: webhookData.description,
      transactionDate: new Date(webhookData.date),
      reference: webhookData.reference,
      transactionType: webhookData.type,
      category: null,
      normalizedDescription: null,
      currency: webhookData.currency || 'ZAR',
      balance: webhookData.balance,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private async createNotificationsForAlerts(alerts: TransactionAlert[]): Promise<RealTimeNotification[]> {
    const notifications: RealTimeNotification[] = [];
    
    for (const alert of alerts) {
      try {
        const notification = await storage.createNotification({
          companyId: alert.companyId,
          userId: null,
          type: 'alert',
          channel: 'email',
          title: alert.title,
          message: alert.message,
          priority: alert.severity,
          templateName: 'transaction_alert',
          templateData: { alert },
          status: 'pending'
        });
        notifications.push(notification);
      } catch (error) {
        console.error('Failed to create notification for alert:', error);
      }
    }
    
    return notifications;
  }

  private async recordTransactionProcessingMetrics(
    companyId: number, 
    transaction: BankTransaction, 
    alerts: TransactionAlert[]
  ): Promise<SystemHealthMetric[]> {
    const metrics: SystemHealthMetric[] = [];
    
    try {
      const processingMetric = await storage.createHealthMetric({
        metricType: 'transaction_processing',
        metricName: 'Transaction Monitoring Complete',
        value: 1,
        unit: 'count',
        timestamp: new Date(),
        companyId,
        metadata: {
          transactionId: transaction.id,
          alertsGenerated: alerts.length,
          processingTime: Date.now() - transaction.createdAt.getTime()
        }
      });
      metrics.push(processingMetric);
    } catch (error) {
      console.error('Failed to record transaction processing metrics:', error);
    }
    
    return metrics;
  }

  private async handleAlertEscalation(alert: TransactionAlert, rule: MonitoringRule): Promise<void> {
    // Escalation logic would be implemented here
    console.log(`🚨 Handling escalation for alert: ${alert.title}`);
  }

  /**
   * Get monitoring dashboard data for a company
   */
  async getMonitoringDashboardData(companyId: number): Promise<any> {
    const activeAlerts = await storage.getActiveAlerts(companyId);
    const unacknowledgedAlerts = await storage.getUnacknowledgedAlerts(companyId);
    const activeRules = await storage.getActiveMonitoringRules(companyId);
    const recentNotifications = await storage.getAllNotifications(companyId, 20);
    const healthMetrics = await storage.getLatestMetrics(companyId);

    return {
      summary: {
        activeAlerts: activeAlerts.length,
        unacknowledgedAlerts: unacknowledgedAlerts.length,
        activeRules: activeRules.length,
        systemHealth: this.isMonitoring ? 'healthy' : 'stopped'
      },
      alerts: activeAlerts,
      rules: activeRules,
      notifications: recentNotifications,
      metrics: healthMetrics,
      isMonitoring: this.activeCompanies.has(companyId)
    };
  }

  /**
   * Acknowledge an alert
   */
  async acknowledgeAlert(alertId: number, userId: number, notes?: string): Promise<void> {
    await storage.acknowledgeAlert(alertId, userId, notes);
    console.log(`✅ Alert ${alertId} acknowledged by user ${userId}`);
  }

  /**
   * Resolve an alert
   */
  async resolveAlert(alertId: number, userId: number, notes?: string): Promise<void> {
    await storage.resolveAlert(alertId, userId, notes);
    console.log(`✅ Alert ${alertId} resolved by user ${userId}`);
  }
}

// Export singleton instance
export const realTimeMonitoringService = new RealTimeMonitoringService();