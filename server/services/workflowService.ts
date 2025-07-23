import { db } from '../db';
import { workflowRules, workflowExecutions, invoices, customers, payments } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { emailService } from './emailService';
import { smsService } from './smsService';

export interface WorkflowTrigger {
  type: string;
  data: any;
  companyId: number;
  userId?: number;
}

export interface WorkflowAction {
  type: 'send_email' | 'send_sms' | 'create_task' | 'update_status' | 'notify_user' | 'webhook';
  config: any;
}

export class WorkflowService {
  // Process a trigger and execute matching workflow rules
  async processTrigger(trigger: WorkflowTrigger) {
    try {
      // Find matching workflow rules
      const rules = await db.select()
        .from(workflowRules)
        .where(and(
          eq(workflowRules.companyId, trigger.companyId),
          eq(workflowRules.triggerType, trigger.type),
          eq(workflowRules.isActive, true)
        ));

      for (const rule of rules) {
        // Check if trigger conditions are met
        if (this.evaluateConditions(rule.triggerConditions as any, trigger.data)) {
          await this.executeWorkflow(rule.id, trigger);
        }
      }
    } catch (error) {
      console.error('Error processing workflow trigger:', error);
    }
  }

  // Execute a workflow rule
  async executeWorkflow(ruleId: number, trigger: WorkflowTrigger) {
    const [execution] = await db.insert(workflowExecutions).values({
      ruleId,
      triggerData: trigger.data,
      status: 'running',
    }).returning();

    try {
      const [rule] = await db.select()
        .from(workflowRules)
        .where(eq(workflowRules.id, ruleId));

      if (!rule) {
        throw new Error('Workflow rule not found');
      }

      const actions = rule.actions as WorkflowAction[];

      for (const action of actions) {
        await this.executeAction(action, trigger, rule.companyId);
      }

      await db.update(workflowExecutions)
        .set({
          status: 'completed',
          executedAt: new Date(),
        })
        .where(eq(workflowExecutions.id, execution.id));

    } catch (error) {
      await db.update(workflowExecutions)
        .set({
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          executedAt: new Date(),
        })
        .where(eq(workflowExecutions.id, execution.id));

      throw error;
    }
  }

  // Execute a specific action
  private async executeAction(action: WorkflowAction, trigger: WorkflowTrigger, companyId: number) {
    switch (action.type) {
      case 'send_email':
        await this.executeSendEmailAction(action.config, trigger, companyId);
        break;

      case 'send_sms':
        await this.executeSendSMSAction(action.config, trigger, companyId);
        break;

      case 'create_task':
        await this.executeCreateTaskAction(action.config, trigger, companyId);
        break;

      case 'update_status':
        await this.executeUpdateStatusAction(action.config, trigger, companyId);
        break;

      case 'notify_user':
        await this.executeNotifyUserAction(action.config, trigger, companyId);
        break;

      case 'webhook':
        await this.executeWebhookAction(action.config, trigger, companyId);
        break;

      default:
        console.warn(`Unknown workflow action type: ${action.type}`);
    }
  }

  private async executeSendEmailAction(config: any, trigger: WorkflowTrigger, companyId: number) {
    const emailData = {
      companyId,
      userId: trigger.userId,
      to: this.replacePlaceholders(config.to, trigger.data),
      subject: this.replacePlaceholders(config.subject, trigger.data),
      bodyHtml: this.replacePlaceholders(config.bodyHtml, trigger.data),
      bodyText: this.replacePlaceholders(config.bodyText, trigger.data),
      priority: config.priority || 5,
    };

    await emailService.queueEmail(emailData);
  }

  private async executeSendSMSAction(config: any, trigger: WorkflowTrigger, companyId: number) {
    const smsData = {
      companyId,
      userId: trigger.userId,
      phoneNumber: this.replacePlaceholders(config.phoneNumber, trigger.data),
      message: this.replacePlaceholders(config.message, trigger.data),
      smsType: config.smsType || 'alert',
      priority: config.priority || 5,
    };

    await smsService.queueSMS(smsData);
  }

  private async executeCreateTaskAction(config: any, trigger: WorkflowTrigger, companyId: number) {
    // Implementation would depend on task management system
    console.log('Create task action:', config, trigger);
  }

  private async executeUpdateStatusAction(config: any, trigger: WorkflowTrigger, companyId: number) {
    // Implementation would depend on the specific entity being updated
    console.log('Update status action:', config, trigger);
  }

  private async executeNotifyUserAction(config: any, trigger: WorkflowTrigger, companyId: number) {
    // Implementation would send in-app notifications
    console.log('Notify user action:', config, trigger);
  }

  private async executeWebhookAction(config: any, trigger: WorkflowTrigger, companyId: number) {
    try {
      const response = await fetch(config.url, {
        method: config.method || 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...config.headers,
        },
        body: JSON.stringify({
          trigger: trigger.type,
          data: trigger.data,
          companyId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Webhook execution failed:', error);
      throw error;
    }
  }

  // Evaluate trigger conditions
  private evaluateConditions(conditions: any, data: any): boolean {
    if (!conditions || Object.keys(conditions).length === 0) {
      return true; // No conditions means always trigger
    }

    // Simple condition evaluation (can be expanded)
    for (const [key, condition] of Object.entries(conditions)) {
      const value = this.getNestedValue(data, key);
      
      if (typeof condition === 'object' && condition !== null) {
        const conditionObj = condition as any;
        
        if (conditionObj.equals !== undefined && value !== conditionObj.equals) {
          return false;
        }
        
        if (conditionObj.greaterThan !== undefined && value <= conditionObj.greaterThan) {
          return false;
        }
        
        if (conditionObj.lessThan !== undefined && value >= conditionObj.lessThan) {
          return false;
        }
        
        if (conditionObj.contains !== undefined && !value?.toString().includes(conditionObj.contains)) {
          return false;
        }
      } else {
        if (value !== condition) {
          return false;
        }
      }
    }

    return true;
  }

  // Replace placeholders in text with actual values
  private replacePlaceholders(text: string, data: any): string {
    return text.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, path) => {
      const value = this.getNestedValue(data, path);
      return value !== undefined ? String(value) : match;
    });
  }

  // Get nested value from object using dot notation
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  // Predefined workflow triggers
  async triggerInvoiceCreated(invoiceId: number, companyId: number, userId: number) {
    const [invoice] = await db.select()
      .from(invoices)
      .leftJoin(customers, eq(invoices.customerId, customers.id))
      .where(eq(invoices.id, invoiceId));

    if (invoice) {
      await this.processTrigger({
        type: 'invoice_created',
        data: {
          invoice: invoice.invoices,
          customer: invoice.customers,
        },
        companyId,
        userId,
      });
    }
  }

  async triggerPaymentReceived(paymentId: number, companyId: number, userId: number) {
    const [payment] = await db.select()
      .from(payments)
      .leftJoin(invoices, eq(payments.invoiceId, invoices.id))
      .leftJoin(customers, eq(invoices.customerId, customers.id))
      .where(eq(payments.id, paymentId));

    if (payment) {
      await this.processTrigger({
        type: 'payment_received',
        data: {
          payment: payment.payments,
          invoice: payment.invoices,
          customer: payment.customers,
        },
        companyId,
        userId,
      });
    }
  }

  async triggerInvoiceOverdue(invoiceId: number, companyId: number) {
    const [invoice] = await db.select()
      .from(invoices)
      .leftJoin(customers, eq(invoices.customerId, customers.id))
      .where(eq(invoices.id, invoiceId));

    if (invoice) {
      await this.processTrigger({
        type: 'invoice_overdue',
        data: {
          invoice: invoice.invoices,
          customer: invoice.customers,
        },
        companyId,
      });
    }
  }

  // Get workflow rules for a company
  async getWorkflowRules(companyId: number) {
    return db.select()
      .from(workflowRules)
      .where(eq(workflowRules.companyId, companyId))
      .orderBy(workflowRules.createdAt);
  }

  // Create a new workflow rule
  async createWorkflowRule(ruleData: {
    companyId: number;
    name: string;
    description?: string;
    triggerType: string;
    triggerConditions: any;
    actions: WorkflowAction[];
    createdBy: number;
  }) {
    const [rule] = await db.insert(workflowRules).values(ruleData).returning();
    return rule;
  }

  // Update workflow rule
  async updateWorkflowRule(ruleId: number, updates: Partial<{
    name: string;
    description: string;
    triggerConditions: any;
    actions: WorkflowAction[];
    isActive: boolean;
  }>) {
    const [rule] = await db.update(workflowRules)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(workflowRules.id, ruleId))
      .returning();

    return rule;
  }

  // Delete workflow rule
  async deleteWorkflowRule(ruleId: number) {
    await db.delete(workflowRules)
      .where(eq(workflowRules.id, ruleId));

    return true;
  }

  // Get workflow execution history
  async getWorkflowExecutions(companyId: number, limit: number = 50) {
    return db.select({
      execution: workflowExecutions,
      rule: workflowRules,
    })
      .from(workflowExecutions)
      .leftJoin(workflowRules, eq(workflowExecutions.ruleId, workflowRules.id))
      .where(eq(workflowRules.companyId, companyId))
      .orderBy(workflowExecutions.createdAt)
      .limit(limit);
  }
}

export const workflowService = new WorkflowService();

// Common workflow trigger types
export const WORKFLOW_TRIGGERS = {
  INVOICE_CREATED: 'invoice_created',
  INVOICE_SENT: 'invoice_sent',
  INVOICE_VIEWED: 'invoice_viewed',
  INVOICE_OVERDUE: 'invoice_overdue',
  PAYMENT_RECEIVED: 'payment_received',
  PAYMENT_FAILED: 'payment_failed',
  CUSTOMER_CREATED: 'customer_created',
  ESTIMATE_ACCEPTED: 'estimate_accepted',
  ESTIMATE_REJECTED: 'estimate_rejected',
  EXPENSE_SUBMITTED: 'expense_submitted',
  PROJECT_COMPLETED: 'project_completed',
  TASK_OVERDUE: 'task_overdue',
} as const;