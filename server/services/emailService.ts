import nodemailer from 'nodemailer';
import { db } from '../db';
import { emailQueue, emailTemplates } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private config: EmailConfig | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const config: EmailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    };

    if (config.auth.user && config.auth.pass) {
      this.config = config;
      this.transporter = nodemailer.createTransporter(config);
    }
  }

  async sendEmail(emailData: {
    to: string;
    cc?: string;
    bcc?: string;
    subject: string;
    bodyHtml: string;
    bodyText: string;
    companyId?: number;
    userId?: number;
    templateId?: number;
    priority?: number;
  }) {
    if (!this.transporter) {
      throw new Error('Email service not configured. Please set SMTP environment variables.');
    }

    try {
      const info = await this.transporter.sendMail({
        from: this.config?.auth.user,
        to: emailData.to,
        cc: emailData.cc,
        bcc: emailData.bcc,
        subject: emailData.subject,
        html: emailData.bodyHtml,
        text: emailData.bodyText,
      });

      console.log('Email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  async queueEmail(emailData: {
    companyId?: number;
    userId?: number;
    to: string;
    cc?: string;
    bcc?: string;
    subject: string;
    bodyHtml: string;
    bodyText: string;
    templateId?: number;
    priority?: number;
    scheduledAt?: Date;
  }) {
    const [queuedEmail] = await db.insert(emailQueue).values({
      companyId: emailData.companyId,
      userId: emailData.userId,
      to: emailData.to,
      cc: emailData.cc,
      bcc: emailData.bcc,
      subject: emailData.subject,
      bodyHtml: emailData.bodyHtml,
      bodyText: emailData.bodyText,
      templateId: emailData.templateId,
      priority: emailData.priority || 5,
      scheduledAt: emailData.scheduledAt,
    }).returning();

    return queuedEmail;
  }

  async processEmailQueue() {
    if (!this.transporter) {
      console.log('Email service not configured, skipping queue processing');
      return;
    }

    const pendingEmails = await db.select()
      .from(emailQueue)
      .where(and(
        eq(emailQueue.status, 'pending'),
        // Only process emails that are scheduled for now or in the past
      ))
      .limit(10);

    for (const email of pendingEmails) {
      try {
        await db.update(emailQueue)
          .set({ status: 'sending' })
          .where(eq(emailQueue.id, email.id));

        await this.sendEmail({
          to: email.to,
          cc: email.cc || undefined,
          bcc: email.bcc || undefined,
          subject: email.subject,
          bodyHtml: email.bodyHtml,
          bodyText: email.bodyText,
        });

        await db.update(emailQueue)
          .set({ 
            status: 'sent', 
            sentAt: new Date(),
          })
          .where(eq(emailQueue.id, email.id));

      } catch (error) {
        const attempts = email.attempts + 1;
        const maxAttempts = 3;
        
        if (attempts >= maxAttempts) {
          await db.update(emailQueue)
            .set({ 
              status: 'failed',
              attempts,
              errorMessage: error instanceof Error ? error.message : 'Unknown error',
            })
            .where(eq(emailQueue.id, email.id));
        } else {
          await db.update(emailQueue)
            .set({ 
              status: 'pending',
              attempts,
              errorMessage: error instanceof Error ? error.message : 'Unknown error',
            })
            .where(eq(emailQueue.id, email.id));
        }
      }
    }
  }

  async getTemplate(templateId: number, companyId?: number) {
    const conditions = companyId 
      ? and(eq(emailTemplates.id, templateId), eq(emailTemplates.companyId, companyId))
      : eq(emailTemplates.id, templateId);

    const [template] = await db.select()
      .from(emailTemplates)
      .where(conditions);

    return template;
  }

  replaceTemplateVariables(template: string, variables: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] || match;
    });
  }

  async sendTemplateEmail(templateId: number, to: string, variables: Record<string, any>, options?: {
    companyId?: number;
    userId?: number;
    cc?: string;
    bcc?: string;
    priority?: number;
  }) {
    const template = await this.getTemplate(templateId, options?.companyId);
    if (!template) {
      throw new Error('Email template not found');
    }

    const subject = this.replaceTemplateVariables(template.subject, variables);
    const bodyHtml = this.replaceTemplateVariables(template.bodyHtml, variables);
    const bodyText = this.replaceTemplateVariables(template.bodyText, variables);

    return this.queueEmail({
      companyId: options?.companyId,
      userId: options?.userId,
      to,
      cc: options?.cc,
      bcc: options?.bcc,
      subject,
      bodyHtml,
      bodyText,
      templateId,
      priority: options?.priority,
    });
  }
}

export const emailService = new EmailService();

// Start email queue processor (run every 30 seconds)
setInterval(() => {
  emailService.processEmailQueue().catch(console.error);
}, 30000);

// Common email templates
export const EMAIL_TEMPLATES = {
  INVOICE_CREATED: 'invoice_created',
  PAYMENT_REMINDER: 'payment_reminder',
  PAYMENT_RECEIVED: 'payment_received',
  WELCOME: 'welcome',
  PASSWORD_RESET: 'password_reset',
  TWO_FACTOR_ENABLED: '2fa_enabled',
  SECURITY_ALERT: 'security_alert',
} as const;