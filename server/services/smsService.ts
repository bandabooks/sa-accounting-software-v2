import twilio from 'twilio';
import { db } from '../db';
import { smsQueue } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

export class SMSService {
  private client: any | null = null;
  private fromNumber: string | null = null;

  constructor() {
    this.initializeTwilio();
  }

  private initializeTwilio() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (accountSid && authToken && fromNumber) {
      this.client = twilio(accountSid, authToken);
      this.fromNumber = fromNumber;
    }
  }

  async sendSMS(phoneNumber: string, message: string) {
    if (!this.client || !this.fromNumber) {
      throw new Error('SMS service not configured. Please set Twilio environment variables.');
    }

    try {
      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: phoneNumber,
      });

      console.log('SMS sent:', result.sid);
      return { success: true, messageId: result.sid };
    } catch (error) {
      console.error('Failed to send SMS:', error);
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
    if (!this.client) {
      console.log('SMS service not configured, skipping queue processing');
      return;
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

        await this.sendSMS(sms.phoneNumber, sms.message);

        await db.update(smsQueue)
          .set({ 
            status: 'sent', 
            sentAt: new Date(),
          })
          .where(eq(smsQueue.id, sms.id));

      } catch (error) {
        const attempts = sms.attempts + 1;
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