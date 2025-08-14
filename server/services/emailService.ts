import sgMail from '@sendgrid/mail';
import nodemailer from 'nodemailer';
import { db } from '../db';
import { emailQueue, emailTemplates } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

export interface EmailConfig {
  provider: 'sendgrid' | 'smtp';
  sendgrid?: {
    apiKey: string;
    fromEmail: string;
    fromName: string;
  };
  smtp?: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
}

export interface EmailHealthStatus {
  ok: boolean;
  provider: 'sendgrid' | 'smtp' | 'none';
  hasKey: boolean;
  hasFrom: boolean;
  verifiedSender: boolean;
  details?: {
    fromEmail?: string;
    provider?: string;
    errorHint?: string;
  };
}

export interface EmailError {
  code: number;
  message: string;
  providerError?: string;
  hint?: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private config: EmailConfig | null = null;
  private verifiedSenders: Set<string> = new Set();

  constructor() {
    this.initializeService();
  }

  private initializeService() {
    // Try SendGrid first (preferred for production)
    if (process.env.SENDGRID_API_KEY) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      this.config = {
        provider: 'sendgrid',
        sendgrid: {
          apiKey: process.env.SENDGRID_API_KEY,
          fromEmail: process.env.SENDGRID_FROM_EMAIL || 'noreply@taxnify.co.za',
          fromName: process.env.SENDGRID_FROM_NAME || 'Taxnify',
        },
      };
      // Add verified sender
      if (process.env.SENDGRID_FROM_EMAIL) {
        this.verifiedSenders.add(process.env.SENDGRID_FROM_EMAIL);
      }
      this.verifiedSenders.add('noreply@taxnify.co.za'); // Always verified
    } 
    // Fallback to SMTP if SendGrid not configured
    else if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      const smtpConfig = {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      };

      this.config = {
        provider: 'smtp',
        smtp: smtpConfig,
      };
      this.transporter = nodemailer.createTransport(smtpConfig);
      // SMTP sender is usually the auth user
      if (process.env.SMTP_USER) {
        this.verifiedSenders.add(process.env.SMTP_USER);
      }
    }
  }

  private parseProviderError(error: any): EmailError {
    let code = 500;
    let message = 'Failed to send email';
    let providerError = '';
    let hint = '';

    if (error.code === 403 || error.response?.status === 403) {
      code = 403;
      message = 'Email service authorization failed';
      
      if (this.config?.provider === 'sendgrid') {
        // Extract SendGrid specific error
        const errorBody = error.response?.body;
        if (errorBody?.errors?.[0]) {
          providerError = errorBody.errors[0].message || '';
          // Limit to 300 chars as requested
          if (providerError.length > 300) {
            providerError = providerError.substring(0, 297) + '...';
          }
        }
        
        if (providerError.includes('The from address does not match a verified Sender Identity')) {
          hint = 'Please verify your sender email address in SendGrid. Current sender: ' + 
                 (this.config.sendgrid?.fromEmail || 'not configured');
        } else if (providerError.includes('Invalid API key')) {
          hint = 'SendGrid API key is invalid. Please check your SENDGRID_API_KEY environment variable.';
        } else {
          hint = 'Check SendGrid API key permissions and sender verification.';
        }
      }
    } else if (error.code === 401 || error.response?.status === 401) {
      code = 401;
      message = 'Email service authentication failed';
      hint = 'Check your API key or SMTP credentials.';
    } else if (error.code === 'EAUTH') {
      code = 401;
      message = 'SMTP authentication failed';
      hint = 'Check your SMTP username and password.';
    } else if (error.code === 'ECONNREFUSED') {
      code = 503;
      message = 'Could not connect to email server';
      hint = 'Check SMTP host and port settings.';
    } else {
      // Generic error
      if (error.message) {
        providerError = error.message.substring(0, 300);
      }
      hint = 'Check email service configuration and try again.';
    }

    return { code, message, providerError, hint };
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
    fromEmail?: string; // Allow override but validate
  }) {
    if (!this.config) {
      throw new Error('Email service not configured. Please set SENDGRID_API_KEY or SMTP environment variables.');
    }

    // Validate sender
    let fromEmail = emailData.fromEmail;
    if (this.config.provider === 'sendgrid') {
      fromEmail = fromEmail || this.config.sendgrid?.fromEmail || 'noreply@taxnify.co.za';
      
      // Check if sender is verified
      if (!this.verifiedSenders.has(fromEmail)) {
        const error: EmailError = {
          code: 400,
          message: 'Unverified sender email',
          hint: `The sender email "${fromEmail}" is not verified. Please use a verified sender or configure SENDGRID_FROM_EMAIL.`
        };
        throw error;
      }
    }

    try {
      if (this.config.provider === 'sendgrid' && this.config.sendgrid) {
        // Ensure API key is set
        if (!process.env.SENDGRID_API_KEY) {
          throw {
            code: 500,
            message: 'SendGrid API key not configured',
            hint: 'Set SENDGRID_API_KEY environment variable'
          };
        }

        // Use SendGrid
        const msg = {
          to: emailData.to,
          cc: emailData.cc,
          bcc: emailData.bcc,
          from: {
            email: fromEmail || this.config.sendgrid.fromEmail,
            name: this.config.sendgrid.fromName,
          },
          subject: emailData.subject,
          html: emailData.bodyHtml,
          text: emailData.bodyText,
        };

        const [response] = await sgMail.send(msg);
        console.log('Email sent via SendGrid:', response.statusCode);
        return { success: true, messageId: response.headers['x-message-id'] };
      } 
      else if (this.config.provider === 'smtp' && this.transporter) {
        // Use SMTP
        const info = await this.transporter.sendMail({
          from: fromEmail || this.config.smtp?.auth.user,
          to: emailData.to,
          cc: emailData.cc,
          bcc: emailData.bcc,
          subject: emailData.subject,
          html: emailData.bodyHtml,
          text: emailData.bodyText,
        });

        console.log('Email sent via SMTP:', info.messageId);
        return { success: true, messageId: info.messageId };
      } else {
        throw new Error('Email service configuration error');
      }
    } catch (error: any) {
      // Parse and enhance error
      const emailError = this.parseProviderError(error);
      console.error('Email send error:', {
        code: emailError.code,
        message: emailError.message,
        hint: emailError.hint,
        // Don't log sensitive details in production
        ...(process.env.NODE_ENV === 'development' && { providerError: emailError.providerError })
      });
      
      // Throw structured error
      const enhancedError: any = new Error(emailError.message);
      enhancedError.code = emailError.code;
      enhancedError.providerError = emailError.providerError;
      enhancedError.hint = emailError.hint;
      throw enhancedError;
    }
  }

  async checkHealth(): Promise<EmailHealthStatus> {
    const status: EmailHealthStatus = {
      ok: false,
      provider: 'none',
      hasKey: false,
      hasFrom: false,
      verifiedSender: false,
      details: {}
    };

    if (!this.config) {
      status.details!.errorHint = 'No email service configured. Set SENDGRID_API_KEY or SMTP credentials.';
      return status;
    }

    status.provider = this.config.provider;

    if (this.config.provider === 'sendgrid' && this.config.sendgrid) {
      status.hasKey = !!process.env.SENDGRID_API_KEY;
      status.hasFrom = !!this.config.sendgrid.fromEmail;
      status.verifiedSender = this.verifiedSenders.has(this.config.sendgrid.fromEmail);
      status.details!.fromEmail = this.config.sendgrid.fromEmail;
      status.details!.provider = 'SendGrid';

      if (!status.hasKey) {
        status.details!.errorHint = 'Missing SENDGRID_API_KEY environment variable';
      } else if (!status.verifiedSender) {
        status.details!.errorHint = `Sender "${this.config.sendgrid.fromEmail}" needs verification in SendGrid`;
      } else {
        status.ok = true;
      }
    } else if (this.config.provider === 'smtp') {
      status.hasKey = !!(process.env.SMTP_USER && process.env.SMTP_PASS);
      status.hasFrom = !!process.env.SMTP_USER;
      status.verifiedSender = true; // SMTP doesn't require sender verification
      status.details!.fromEmail = process.env.SMTP_USER;
      status.details!.provider = 'SMTP';

      if (!status.hasKey) {
        status.details!.errorHint = 'Missing SMTP_USER or SMTP_PASS environment variables';
      } else {
        status.ok = true;
      }
    }

    return status;
  }

  async queueEmail(emailData: {
    companyId: number;
    to: string;
    recipientName?: string;
    subject: string;
    bodyHtml: string;
    bodyText: string;
    templateId?: number;
    priority?: number;
    scheduledFor?: Date;
    createdBy?: number;
  }) {
    const [queuedEmail] = await db.insert(emailQueue).values({
      companyId: emailData.companyId,
      recipientEmail: emailData.to,
      recipientName: emailData.recipientName,
      subject: emailData.subject,
      bodyHtml: emailData.bodyHtml,
      bodyText: emailData.bodyText,
      templateId: emailData.templateId,
      priority: emailData.priority || 5,
      scheduledFor: emailData.scheduledFor,
      createdBy: emailData.createdBy,
      variables: {},
      attachments: [],
    }).returning();

    return queuedEmail;
  }

  async processEmailQueue() {
    if (!this.config) {
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
          .set({ status: 'processing' })
          .where(eq(emailQueue.id, email.id));

        await this.sendEmail({
          to: email.recipientEmail,
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
        const retryCount = (email.retryCount || 0) + 1;
        const maxRetries = email.maxRetries || 3;
        
        if (retryCount >= maxRetries) {
          await db.update(emailQueue)
            .set({ 
              status: 'failed',
              retryCount,
              failedAt: new Date(),
              errorMessage: error instanceof Error ? error.message : 'Unknown error',
            })
            .where(eq(emailQueue.id, email.id));
        } else {
          await db.update(emailQueue)
            .set({ 
              status: 'pending',
              retryCount,
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

  // Helper method to send trial welcome email
  async sendTrialWelcomeEmail(userEmail: string, userName: string, companyName: string, trialExpiresAt: Date) {
    const trialDays = Math.ceil((trialExpiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    
    const subject = `Welcome to Taxnify! Your ${trialDays}-day free trial has started`;
    const bodyHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">Welcome to Taxnify!</h1>
          <p style="color: #6b7280; font-size: 18px;">Unified Business, Accounting, Compliance Platform</p>
        </div>
        
        <h2 style="color: #1f2937;">Hi ${userName},</h2>
        
        <p style="color: #4b5563; line-height: 1.6;">
          Thank you for starting your free trial with Taxnify! We're excited to help <strong>${companyName}</strong> 
          streamline your accounting, compliance, and business management processes.
        </p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1f2937; margin: 0 0 10px 0;">Your Trial Details:</h3>
          <ul style="color: #4b5563; margin: 0; padding-left: 20px;">
            <li><strong>Trial Duration:</strong> ${trialDays} days remaining</li>
            <li><strong>Expires:</strong> ${trialExpiresAt.toLocaleDateString()}</li>
            <li><strong>Full Access:</strong> All professional features included</li>
          </ul>
        </div>
        
        <h3 style="color: #1f2937;">What's Next?</h3>
        <ol style="color: #4b5563; line-height: 1.6;">
          <li>Complete your company setup and onboarding</li>
          <li>Import your existing customer and supplier data</li>
          <li>Create your first invoice or estimate</li>
          <li>Explore our South African VAT compliance features</li>
        </ol>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://your-domain.repl.co/onboarding?trial=true" 
             style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Complete Setup →
          </a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
          Need help? Reply to this email or contact our support team.<br>
          <strong>Taxnify Team</strong><br>
          Unified Business, Accounting, Compliance Platform
        </p>
      </div>
    `;
    
    const bodyText = `
      Welcome to Taxnify, ${userName}!
      
      Thank you for starting your free trial! We're excited to help ${companyName} streamline your business processes.
      
      Your Trial Details:
      - Trial Duration: ${trialDays} days remaining
      - Expires: ${trialExpiresAt.toLocaleDateString()}
      - Full Access: All professional features included
      
      What's Next?
      1. Complete your company setup and onboarding
      2. Import your existing customer and supplier data  
      3. Create your first invoice or estimate
      4. Explore our South African VAT compliance features
      
      Visit your dashboard to get started: https://your-domain.repl.co/onboarding?trial=true
      
      Need help? Contact our support team.
      
      Taxnify Team
      Unified Business, Accounting, Compliance Platform
    `;

    return this.queueEmail({
      to: userEmail,
      subject,
      bodyHtml,
      bodyText,
      priority: 1, // High priority for welcome emails
    });
  }

  // Helper method to check service status
  getServiceStatus(): { configured: boolean; provider: string | null; details: string } {
    if (!this.config) {
      return {
        configured: false,
        provider: null,
        details: 'No email service configured. Set SENDGRID_API_KEY or SMTP credentials.'
      };
    }

    return {
      configured: true,
      provider: this.config.provider,
      details: this.config.provider === 'sendgrid' 
        ? `SendGrid configured with from: ${this.config.sendgrid?.fromEmail}`
        : `SMTP configured with host: ${this.config.smtp?.host}`
    };
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