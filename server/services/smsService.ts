import twilio from 'twilio';
import { db } from '../db';
import { smsQueue } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

export class SMSService {
  private client: any | null = null;
  private fromNumber: string | null = null;
  private sandboxMode: boolean = false;
  private isConfigured: boolean = false;

  constructor() {
    this.initializeTwilio();
  }

  private initializeTwilio() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;
    const enableSandbox = process.env.SMS_SANDBOX_MODE === 'true' || process.env.NODE_ENV === 'development';

    if (accountSid && authToken && fromNumber) {
      this.client = twilio(accountSid, authToken);
      this.fromNumber = fromNumber;
      this.isConfigured = true;
      console.log('📱 SMS service configured with Twilio');
    } else if (enableSandbox) {
      this.sandboxMode = true;
      this.isConfigured = true;
      console.log('📱 SMS service running in sandbox mode - messages will be logged only');
    } else {
      console.log('📱 SMS service not configured - set Twilio environment variables to enable');
    }
  }

  async sendSMS(phoneNumber: string, message: string) {
    if (!this.isConfigured) {
      throw new Error('SMS service not configured. Please set Twilio environment variables or enable sandbox mode.');
    }

    if (this.sandboxMode) {
      // Sandbox mode - log SMS instead of sending
      const mockMessageId = `sandbox_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log('📱 [SANDBOX] SMS would be sent:', {
        to: phoneNumber,
        message: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
        messageId: mockMessageId,
        timestamp: new Date().toISOString()
      });
      return { success: true, messageId: mockMessageId, sandbox: true };
    }

    if (!this.client || !this.fromNumber) {
      throw new Error('SMS service not properly configured.');
    }

    try {
      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: phoneNumber,
      });

      console.log('📱 SMS sent successfully:', {
        messageId: result.sid,
        to: phoneNumber,
        status: result.status
      });
      return { success: true, messageId: result.sid };
    } catch (error) {
      console.error('📱 Failed to send SMS:', error);
      throw error;
    }
  }

  async queueSMS(smsData: {
    companyId?: number;
    userId?: number;
    phoneNumber: string;
    message: string;
    smsType: string;
    priority?: number;
    scheduledAt?: Date;
  }) {
    const [queuedSMS] = await db.insert(smsQueue).values({
      companyId: smsData.companyId,
      userId: smsData.userId,
      phoneNumber: smsData.phoneNumber,
      message: smsData.message,
      smsType: smsData.smsType,
      priority: smsData.priority || 5,
      scheduledAt: smsData.scheduledAt,
    }).returning();

    return queuedSMS;
  }

  async processSMSQueue() {
    if (!this.isConfigured) {
      console.log('📱 SMS service not configured, skipping queue processing');
      return;
    }

    if (this.sandboxMode) {
      console.log('📱 [SANDBOX] Processing SMS queue in sandbox mode');
    }

    const pendingSMS = await db.select()
      .from(smsQueue)
      .where(and(
        eq(smsQueue.status, 'pending'),
        // Only process SMS that are scheduled for now or in the past
      ))
      .limit(10);

    for (const sms of pendingSMS) {
      try {
        await db.update(smsQueue)
          .set({ status: 'sending' })
          .where(eq(smsQueue.id, sms.id));

        const result = await this.sendSMS(sms.phoneNumber, sms.message);

        await db.update(smsQueue)
          .set({ 
            status: 'sent', 
            sentAt: new Date(),
            messageId: result.messageId,
            metadata: result.sandbox ? { sandbox: true } : undefined
          })
          .where(eq(smsQueue.id, sms.id));

        console.log(`📱 SMS queue processed: ${sms.id} -> ${result.messageId}`);

      } catch (error) {
        const attempts = (sms.attempts || 0) + 1;
        const maxAttempts = 3;
        
        if (attempts >= maxAttempts) {
          await db.update(smsQueue)
            .set({ 
              status: 'failed',
              attempts,
              errorMessage: error instanceof Error ? error.message : 'Unknown error',
            })
            .where(eq(smsQueue.id, sms.id));
        } else {
          await db.update(smsQueue)
            .set({ 
              status: 'pending',
              attempts,
              errorMessage: error instanceof Error ? error.message : 'Unknown error',
            })
            .where(eq(smsQueue.id, sms.id));
        }
      }
    }
  }

  // Send security-related SMS
  async sendSecuritySMS(phoneNumber: string, message: string, companyId?: number, userId?: number) {
    return this.queueSMS({
      companyId,
      userId,
      phoneNumber,
      message,
      smsType: 'security',
      priority: 1, // High priority for security messages
    });
  }

  // Send 2FA verification code
  async send2FACode(phoneNumber: string, code: string, companyId?: number, userId?: number) {
    const message = `Your Think MyBiz verification code is: ${code}. This code expires in 5 minutes.`;
    return this.sendSecuritySMS(phoneNumber, message, companyId, userId);
  }

  // Send account lockout notification
  async sendLockoutNotification(phoneNumber: string, companyId?: number, userId?: number) {
    const message = `Security Alert: Your Think MyBiz account has been temporarily locked due to multiple failed login attempts. Contact support if this wasn't you.`;
    return this.sendSecuritySMS(phoneNumber, message, companyId, userId);
  }

  // Send payment reminder
  async sendPaymentReminder(phoneNumber: string, customerName: string, amount: string, dueDate: string, companyId?: number, userId?: number) {
    const message = `Payment Reminder: Hi ${customerName}, your invoice for ${amount} is due on ${dueDate}. Please make payment to avoid late fees.`;
    return this.queueSMS({
      companyId,
      userId,
      phoneNumber,
      message,
      smsType: 'reminder',
      priority: 5,
    });
  }
}

export const smsService = new SMSService();

// Start SMS queue processor (run every 30 seconds)
setInterval(() => {
  smsService.processSMSQueue().catch(console.error);
}, 30000);

// SMS Types
export const SMS_TYPES = {
  SECURITY: 'security',
  ALERT: 'alert',
  REMINDER: 'reminder',
  MARKETING: 'marketing',
  VERIFICATION: 'verification',
} as const;