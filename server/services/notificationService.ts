/**
 * Multi-channel Notification Service for Real-time Transaction Monitoring
 * Supports Email, SMS, Slack, and Webhook notifications with proper queuing
 */

import { emailService } from './emailService';
import { smsService } from './smsService';
import { DatabaseStorage } from '../storage';
import { eq, and } from 'drizzle-orm';
import fetch from 'node-fetch';

interface NotificationChannel {
  type: 'email' | 'sms' | 'slack' | 'webhook';
  enabled: boolean;
  config: Record<string, any>;
  priority: number;
}

interface NotificationTemplate {
  id: string;
  name: string;
  channels: NotificationChannel[];
  triggers: string[];
  subject?: string;
  body: string;
  variables?: Record<string, any>;
}

interface SlackConfig {
  webhookUrl: string;
  channel?: string;
  username?: string;
  iconEmoji?: string;
}

interface WebhookConfig {
  url: string;
  method: 'POST' | 'PUT';
  headers?: Record<string, string>;
  auth?: {
    type: 'bearer' | 'basic' | 'apikey';
    token?: string;
    username?: string;
    password?: string;
    apikey?: string;
    headerName?: string;
  };
  retryCount?: number;
  timeoutMs?: number;
}

interface NotificationRequest {
  companyId: number;
  alertId?: string;
  ruleId?: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  metadata?: Record<string, any>;
  channels?: ('email' | 'sms' | 'slack' | 'webhook')[];
  recipients?: {
    emails?: string[];
    phones?: string[];
    slackChannels?: string[];
    webhookUrls?: string[];
  };
  templateId?: string;
  variables?: Record<string, any>;
  priority?: number;
}

export class NotificationService {
  private storage: DatabaseStorage;
  private templates: Map<string, NotificationTemplate> = new Map();

  constructor(storage: DatabaseStorage) {
    this.storage = storage;
    this.initializeDefaultTemplates();
  }

  private initializeDefaultTemplates() {
    // Critical Transaction Alert Template
    this.templates.set('critical_transaction_alert', {
      id: 'critical_transaction_alert',
      name: 'Critical Transaction Alert',
      channels: [
        {
          type: 'email',
          enabled: true,
          config: { priority: 1 },
          priority: 1
        },
        {
          type: 'sms',
          enabled: true,
          config: { priority: 1 },
          priority: 1
        },
        {
          type: 'slack',
          enabled: true,
          config: { priority: 2 },
          priority: 2
        }
      ],
      triggers: ['transaction.large_amount', 'transaction.unusual_pattern', 'compliance.vat_issue'],
      subject: '🚨 Critical Alert: {{alertTitle}}',
      body: `
🚨 **CRITICAL ALERT** 🚨

**Alert:** {{alertTitle}}
**Description:** {{alertDescription}}
**Company:** {{companyName}}
**Account:** {{accountName}}
**Amount:** {{transactionAmount}}
**Time:** {{alertTime}}

**Action Required:** {{actionRequired}}

**Details:**
{{alertDetails}}

---
Taxnify Real-time Monitoring System
{{timestamp}}
      `,
      variables: {
        alertTitle: 'Transaction Alert',
        alertDescription: 'Critical transaction detected',
        companyName: 'Unknown Company',
        accountName: 'Unknown Account',
        transactionAmount: 'Unknown',
        alertTime: new Date().toISOString(),
        actionRequired: 'Please review immediately',
        alertDetails: 'Review transaction details in the monitoring dashboard',
        timestamp: new Date().toISOString()
      }
    });

    // VAT Compliance Alert Template
    this.templates.set('vat_compliance_alert', {
      id: 'vat_compliance_alert',
      name: 'VAT Compliance Alert',
      channels: [
        {
          type: 'email',
          enabled: true,
          config: { priority: 2 },
          priority: 1
        },
        {
          type: 'slack',
          enabled: true,
          config: { priority: 3 },
          priority: 2
        }
      ],
      triggers: ['compliance.vat_deadline', 'compliance.vat_threshold', 'compliance.missing_vat'],
      subject: '📋 VAT Compliance Alert: {{alertTitle}}',
      body: `
📋 **VAT COMPLIANCE ALERT**

**Alert:** {{alertTitle}}
**Description:** {{alertDescription}}
**Company:** {{companyName}}
**Due Date:** {{dueDate}}
**Amount:** {{vatAmount}}

**Compliance Issue:** {{complianceIssue}}
**Recommended Action:** {{recommendedAction}}

**Next Steps:**
{{nextSteps}}

---
SARS Compliance Monitoring
{{timestamp}}
      `
    });

    // Banking Optimization Alert Template
    this.templates.set('banking_optimization_alert', {
      id: 'banking_optimization_alert',
      name: 'Banking Optimization Alert',
      channels: [
        {
          type: 'email',
          enabled: true,
          config: { priority: 3 },
          priority: 1
        }
      ],
      triggers: ['banking.fee_optimization', 'banking.account_suggestion', 'banking.rate_alert'],
      subject: '💡 Banking Optimization: {{alertTitle}}',
      body: `
💡 **BANKING OPTIMIZATION**

**Opportunity:** {{alertTitle}}
**Description:** {{alertDescription}}
**Company:** {{companyName}}
**Potential Savings:** {{potentialSavings}}

**Recommendation:** {{recommendation}}
**Implementation:** {{implementation}}

**Benefits:**
{{benefits}}

---
SA Banking Optimization Engine
{{timestamp}}
      `
    });

    // System Health Alert Template
    this.templates.set('system_health_alert', {
      id: 'system_health_alert',
      name: 'System Health Alert',
      channels: [
        {
          type: 'email',
          enabled: true,
          config: { priority: 1 },
          priority: 1
        },
        {
          type: 'slack',
          enabled: true,
          config: { priority: 1 },
          priority: 1
        },
        {
          type: 'webhook',
          enabled: true,
          config: { priority: 1 },
          priority: 1
        }
      ],
      triggers: ['system.health_critical', 'system.performance_degraded', 'system.service_down'],
      subject: '⚠️ System Health Alert: {{alertTitle}}',
      body: `
⚠️ **SYSTEM HEALTH ALERT**

**Service:** {{serviceName}}
**Status:** {{serviceStatus}}
**Issue:** {{alertDescription}}
**Started:** {{alertTime}}

**Impact:** {{impact}}
**Affected Components:** {{affectedComponents}}

**Metrics:**
{{healthMetrics}}

---
System Monitoring
{{timestamp}}
      `
    });
  }

  /**
   * Send notification through multiple channels
   */
  async sendNotification(request: NotificationRequest): Promise<{
    success: boolean;
    results: Record<string, { success: boolean; messageId?: string; error?: string }>;
  }> {
    const results: Record<string, { success: boolean; messageId?: string; error?: string }> = {};
    
    try {
      console.log(`📢 Sending notification: ${request.title} (${request.severity})`);

      // Get template if specified
      let template: NotificationTemplate | undefined;
      if (request.templateId) {
        template = this.templates.get(request.templateId);
      }

      // Determine channels to use
      const channels = request.channels || template?.channels.map(c => c.type) || ['email'];
      
      // Get notification preferences for company
      const preferences = await this.getCompanyNotificationPreferences(request.companyId);

      // Send to each channel
      const promises = channels.map(async (channel) => {
        try {
          switch (channel) {
            case 'email':
              if (preferences.email?.enabled !== false) {
                const result = await this.sendEmailNotification(request, template);
                results.email = result;
              } else {
                results.email = { success: false, error: 'Email notifications disabled' };
              }
              break;

            case 'sms':
              if (preferences.sms?.enabled !== false) {
                const result = await this.sendSMSNotification(request, template);
                results.sms = result;
              } else {
                results.sms = { success: false, error: 'SMS notifications disabled' };
              }
              break;

            case 'slack':
              if (preferences.slack?.enabled !== false) {
                const result = await this.sendSlackNotification(request, template);
                results.slack = result;
              } else {
                results.slack = { success: false, error: 'Slack notifications disabled' };
              }
              break;

            case 'webhook':
              if (preferences.webhook?.enabled !== false) {
                const result = await this.sendWebhookNotification(request, template);
                results.webhook = result;
              } else {
                results.webhook = { success: false, error: 'Webhook notifications disabled' };
              }
              break;
          }
        } catch (error) {
          results[channel] = { 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          };
        }
      });

      await Promise.all(promises);

      // Log notification to database
      await this.logNotification(request, results);

      const overallSuccess = Object.values(results).some(r => r.success);
      console.log(`📢 Notification sent. Success: ${overallSuccess}, Results:`, results);

      return { success: overallSuccess, results };

    } catch (error) {
      console.error('❌ Failed to send notification:', error);
      return { 
        success: false, 
        results: { error: { success: false, error: error instanceof Error ? error.message : 'Unknown error' } } 
      };
    }
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(
    request: NotificationRequest, 
    template?: NotificationTemplate
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const preferences = await this.getCompanyNotificationPreferences(request.companyId);
      const emailConfig = preferences.email;

      // Get recipients
      const recipients = request.recipients?.emails || emailConfig?.recipients || [];
      if (recipients.length === 0) {
        return { success: false, error: 'No email recipients configured' };
      }

      // Prepare email content
      const subject = this.replaceVariables(
        template?.subject || request.title,
        { ...template?.variables, ...request.variables, ...request.metadata }
      );

      const bodyText = this.replaceVariables(
        template?.body || request.message,
        { ...template?.variables, ...request.variables, ...request.metadata }
      );

      const bodyHtml = this.convertToHtml(bodyText);

      // Send to each recipient
      const results = await Promise.all(recipients.map(async (email: string) => {
        try {
          return await emailService.sendEmail({
            to: email,
            subject,
            bodyHtml,
            bodyText,
            companyId: request.companyId,
            priority: request.priority || (request.severity === 'critical' ? 1 : 5)
          });
        } catch (error) {
          console.error(`Failed to send email to ${email}:`, error);
          throw error;
        }
      }));

      const successCount = results.filter(r => r.success).length;
      if (successCount > 0) {
        return { 
          success: true, 
          messageId: `sent_to_${successCount}_recipients`,
        };
      } else {
        return { success: false, error: 'Failed to send to any recipients' };
      }

    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Email send failed' 
      };
    }
  }

  /**
   * Send SMS notification
   */
  private async sendSMSNotification(
    request: NotificationRequest,
    template?: NotificationTemplate
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const preferences = await this.getCompanyNotificationPreferences(request.companyId);
      const smsConfig = preferences.sms;

      // Get recipients
      const recipients = request.recipients?.phones || smsConfig?.recipients || [];
      if (recipients.length === 0) {
        return { success: false, error: 'No SMS recipients configured' };
      }

      // Prepare SMS content (limit to 160 characters)
      const message = this.replaceVariables(
        template?.body || request.message,
        { ...template?.variables, ...request.variables, ...request.metadata }
      );

      const smsMessage = this.formatForSMS(message, request.title);

      // Send to each recipient
      const results = await Promise.all(recipients.map(async (phone: string) => {
        try {
          return await smsService.queueSMS({
            companyId: request.companyId,
            phoneNumber: phone,
            message: smsMessage,
            smsType: 'alert',
            priority: request.priority || (request.severity === 'critical' ? 1 : 5)
          });
        } catch (error) {
          console.error(`Failed to queue SMS to ${phone}:`, error);
          throw error;
        }
      }));

      return { 
        success: true, 
        messageId: `queued_to_${results.length}_recipients` 
      };

    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'SMS send failed' 
      };
    }
  }

  /**
   * Send Slack notification
   */
  private async sendSlackNotification(
    request: NotificationRequest,
    template?: NotificationTemplate
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const preferences = await this.getCompanyNotificationPreferences(request.companyId);
      const slackConfig = preferences.slack as SlackConfig;

      if (!slackConfig?.webhookUrl) {
        return { success: false, error: 'Slack webhook URL not configured' };
      }

      // Prepare Slack message
      const title = this.replaceVariables(
        template?.subject || request.title,
        { ...template?.variables, ...request.variables, ...request.metadata }
      );

      const text = this.replaceVariables(
        template?.body || request.message,
        { ...template?.variables, ...request.variables, ...request.metadata }
      );

      // Format for Slack
      const slackMessage = {
        channel: request.recipients?.slackChannels?.[0] || slackConfig.channel,
        username: slackConfig.username || 'Taxnify Monitoring',
        icon_emoji: slackConfig.iconEmoji || ':warning:',
        attachments: [
          {
            color: this.getSeverityColor(request.severity),
            title: title,
            text: text,
            fields: [
              {
                title: 'Severity',
                value: request.severity.toUpperCase(),
                short: true
              },
              {
                title: 'Company',
                value: `Company ${request.companyId}`,
                short: true
              },
              {
                title: 'Time',
                value: new Date().toISOString(),
                short: true
              }
            ],
            footer: 'Taxnify Real-time Monitoring',
            ts: Math.floor(Date.now() / 1000)
          }
        ]
      };

      // Send to Slack
      const response = await fetch(slackConfig.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(slackMessage),
      });

      if (response.ok) {
        return { success: true, messageId: 'slack_sent' };
      } else {
        const errorText = await response.text();
        return { success: false, error: `Slack API error: ${errorText}` };
      }

    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Slack send failed' 
      };
    }
  }

  /**
   * Send webhook notification
   */
  private async sendWebhookNotification(
    request: NotificationRequest,
    template?: NotificationTemplate
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const preferences = await this.getCompanyNotificationPreferences(request.companyId);
      const webhookConfig = preferences.webhook as WebhookConfig;

      if (!webhookConfig?.url) {
        return { success: false, error: 'Webhook URL not configured' };
      }

      // Prepare webhook payload
      const payload = {
        timestamp: new Date().toISOString(),
        companyId: request.companyId,
        alertId: request.alertId,
        ruleId: request.ruleId,
        severity: request.severity,
        title: this.replaceVariables(
          template?.subject || request.title,
          { ...template?.variables, ...request.variables, ...request.metadata }
        ),
        message: this.replaceVariables(
          template?.body || request.message,
          { ...template?.variables, ...request.variables, ...request.metadata }
        ),
        metadata: request.metadata,
        source: 'taxnify_monitoring'
      };

      // Prepare headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'User-Agent': 'Taxnify-Monitoring/1.0',
        ...webhookConfig.headers
      };

      // Add authentication
      if (webhookConfig.auth) {
        switch (webhookConfig.auth.type) {
          case 'bearer':
            headers.Authorization = `Bearer ${webhookConfig.auth.token}`;
            break;
          case 'basic':
            const credentials = Buffer.from(`${webhookConfig.auth.username}:${webhookConfig.auth.password}`).toString('base64');
            headers.Authorization = `Basic ${credentials}`;
            break;
          case 'apikey':
            const headerName = webhookConfig.auth.headerName || 'X-API-Key';
            headers[headerName] = webhookConfig.auth.apikey || '';
            break;
        }
      }

      // Send webhook with retry logic
      const maxRetries = webhookConfig.retryCount || 3;
      const timeout = webhookConfig.timeoutMs || 10000;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), timeout);

          const response = await fetch(webhookConfig.url, {
            method: webhookConfig.method || 'POST',
            headers,
            body: JSON.stringify(payload),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            return { 
              success: true, 
              messageId: `webhook_sent_attempt_${attempt}` 
            };
          } else if (attempt === maxRetries) {
            const errorText = await response.text();
            return { 
              success: false, 
              error: `Webhook failed after ${maxRetries} attempts: ${response.status} ${errorText}` 
            };
          }
          // Continue to next attempt if not the last one
        } catch (error) {
          if (attempt === maxRetries) {
            return { 
              success: false, 
              error: error instanceof Error ? error.message : 'Webhook send failed' 
            };
          }
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }

      return { success: false, error: 'Webhook send failed after all retries' };

    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Webhook send failed' 
      };
    }
  }

  /**
   * Get company notification preferences
   */
  private async getCompanyNotificationPreferences(companyId: number): Promise<Record<string, any>> {
    try {
      // Try to get from database first
      const preferences = await this.storage.getNotificationPreferences(companyId);
      
      if (preferences) {
        return preferences;
      }

      // Return default preferences
      return {
        email: {
          enabled: true,
          recipients: [], // Will be set by admin
        },
        sms: {
          enabled: false,
          recipients: [],
        },
        slack: {
          enabled: false,
          webhookUrl: process.env.SLACK_WEBHOOK_URL,
          channel: '#alerts',
          username: 'Taxnify Monitoring',
          iconEmoji: ':warning:',
        },
        webhook: {
          enabled: false,
          url: process.env.WEBHOOK_URL,
          method: 'POST' as const,
          headers: {},
          retryCount: 3,
          timeoutMs: 10000,
        },
      };
    } catch (error) {
      console.error('Failed to get notification preferences:', error);
      return {
        email: { enabled: true, recipients: [] },
        sms: { enabled: false, recipients: [] },
        slack: { enabled: false },
        webhook: { enabled: false },
      };
    }
  }

  /**
   * Replace variables in template strings
   */
  private replaceVariables(template: string, variables: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] || match;
    });
  }

  /**
   * Convert plain text to HTML
   */
  private convertToHtml(text: string): string {
    return text
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.*?)__/g, '<em>$1</em>')
      .replace(/🚨/g, '<span style="color: red; font-size: 18px;">🚨</span>')
      .replace(/📋/g, '<span style="color: blue; font-size: 18px;">📋</span>')
      .replace(/💡/g, '<span style="color: green; font-size: 18px;">💡</span>');
  }

  /**
   * Format message for SMS (160 character limit)
   */
  private formatForSMS(message: string, title: string): string {
    const prefix = `ALERT: ${title}\n`;
    const maxContentLength = 160 - prefix.length - 10; // Reserve space for "..."
    
    let content = message.replace(/\*\*/g, '').replace(/\n+/g, ' ').trim();
    
    if (content.length > maxContentLength) {
      content = content.substring(0, maxContentLength - 3) + '...';
    }
    
    return prefix + content;
  }

  /**
   * Get color for Slack attachments based on severity
   */
  private getSeverityColor(severity: string): string {
    switch (severity) {
      case 'critical': return 'danger';
      case 'error': return 'danger';
      case 'warning': return 'warning';
      case 'info': return 'good';
      default: return '#808080';
    }
  }

  /**
   * Log notification to database for audit trail
   */
  private async logNotification(
    request: NotificationRequest,
    results: Record<string, { success: boolean; messageId?: string; error?: string }>
  ): Promise<void> {
    try {
      await this.storage.createNotificationLog({
        companyId: request.companyId,
        message: request.message,
        type: request.severity,
        metadata: {
          ...request.metadata,
          alertId: request.alertId,
          ruleId: request.ruleId,
          title: request.title,
          channels: Object.keys(results),
          results: results,
        }
      });
    } catch (error) {
      console.error('Failed to log notification:', error);
    }
  }

  /**
   * Get available notification templates
   */
  getAvailableTemplates(): NotificationTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Add or update a notification template
   */
  setTemplate(template: NotificationTemplate): void {
    this.templates.set(template.id, template);
  }

  /**
   * Test notification configuration
   */
  async testNotificationConfig(
    companyId: number,
    channel: 'email' | 'sms' | 'slack' | 'webhook',
    testRecipient?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const testRequest: NotificationRequest = {
        companyId,
        severity: 'info',
        title: 'Test Notification',
        message: 'This is a test notification to verify your configuration.',
        channels: [channel],
        recipients: testRecipient ? {
          emails: channel === 'email' ? [testRecipient] : undefined,
          phones: channel === 'sms' ? [testRecipient] : undefined,
        } : undefined,
        priority: 5,
      };

      const result = await this.sendNotification(testRequest);
      
      if (result.success) {
        return { 
          success: true, 
          message: `Test notification sent successfully via ${channel}` 
        };
      } else {
        return { 
          success: false, 
          message: `Test notification failed: ${JSON.stringify(result.results)}` 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Test failed' 
      };
    }
  }
}

export const notificationService = new NotificationService(new DatabaseStorage());

// Export notification types and templates for use in monitoring service
export { NotificationRequest, NotificationTemplate, NotificationChannel };