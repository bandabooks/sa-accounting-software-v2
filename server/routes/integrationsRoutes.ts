import { Router, Request, Response } from 'express';
import { authenticate, type AuthenticatedRequest } from '../auth.js';
import { body, validationResult } from 'express-validator';
import { db } from '../db.js';
import { companySettings } from '../../shared/schema.js';
import { eq, and } from 'drizzle-orm';
import { emailService } from '../services/emailService.js';
import { smsService } from '../services/smsService.js';

const router = Router();

// Get integration status
router.get('/status', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const integrations = [
      {
        id: 'twilio',
        name: 'Twilio SMS',
        status: process.env.TWILIO_ACCOUNT_SID ? 'connected' : 'disconnected',
        lastSync: null
      },
      {
        id: 'sendgrid',
        name: 'SendGrid Email',
        status: process.env.SENDGRID_API_KEY ? 'connected' : 'disconnected',
        lastSync: null
      }
    ];
    
    res.json(integrations);
  } catch (error) {
    console.error('Error fetching integration status:', error);
    res.status(500).json({ error: 'Failed to fetch integration status' });
  }
});

// Save Twilio credentials
router.post('/twilio/credentials', 
  authenticate,
  [
    body('accountSid').optional().isString(),
    body('authToken').optional().isString(),
    body('phoneNumber').optional().isString(),
    body('testMode').optional().isBoolean()
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { accountSid, authToken, phoneNumber, testMode } = req.body;
      const companyId = req.user!.companyId;

      // Store credentials in company settings
      if (accountSid) {
        await db.insert(companySettings).values({
          companyId,
          key: 'TWILIO_ACCOUNT_SID',
          value: accountSid
        }).onConflictDoUpdate({
          target: [companySettings.companyId, companySettings.key],
          set: { value: accountSid, updatedAt: new Date() }
        });
      }

      if (authToken) {
        await db.insert(companySettings).values({
          companyId,
          key: 'TWILIO_AUTH_TOKEN',
          value: authToken
        }).onConflictDoUpdate({
          target: [companySettings.companyId, companySettings.key],
          set: { value: authToken, updatedAt: new Date() }
        });
      }

      if (phoneNumber) {
        await db.insert(companySettings).values({
          companyId,
          key: 'TWILIO_PHONE_NUMBER',
          value: phoneNumber
        }).onConflictDoUpdate({
          target: [companySettings.companyId, companySettings.key],
          set: { value: phoneNumber, updatedAt: new Date() }
        });
      }

      if (testMode !== undefined) {
        await db.insert(companySettings).values({
          companyId,
          key: 'TWILIO_TEST_MODE',
          value: testMode.toString()
        }).onConflictDoUpdate({
          target: [companySettings.companyId, companySettings.key],
          set: { value: testMode.toString(), updatedAt: new Date() }
        });
      }

      // Update environment variables and reinitialize service
      if (accountSid) process.env.TWILIO_ACCOUNT_SID = accountSid;
      if (authToken) process.env.TWILIO_AUTH_TOKEN = authToken;
      if (phoneNumber) process.env.TWILIO_PHONE_NUMBER = phoneNumber;
      
      // Reinitialize SMS service with new credentials
      smsService.initializeTwilio();

      res.json({ success: true, message: 'Twilio credentials saved successfully' });
    } catch (error) {
      console.error('Error saving Twilio credentials:', error);
      res.status(500).json({ error: 'Failed to save Twilio credentials' });
    }
  }
);

// Save SendGrid credentials
router.post('/sendgrid/credentials',
  authenticate,
  [
    body('apiKey').optional().isString(),
    body('fromEmail').optional().isEmail(),
    body('fromName').optional().isString(),
    body('replyToEmail').optional().isEmail()
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { apiKey, fromEmail, fromName, replyToEmail } = req.body;
      const companyId = req.user!.companyId;

      // Store credentials in company settings
      if (apiKey) {
        await db.insert(companySettings).values({
          companyId,
          key: 'SENDGRID_API_KEY',
          value: apiKey
        }).onConflictDoUpdate({
          target: [companySettings.companyId, companySettings.key],
          set: { value: apiKey, updatedAt: new Date() }
        });
      }

      if (fromEmail) {
        await db.insert(companySettings).values({
          companyId,
          key: 'SENDGRID_FROM_EMAIL',
          value: fromEmail
        }).onConflictDoUpdate({
          target: [companySettings.companyId, companySettings.key],
          set: { value: fromEmail, updatedAt: new Date() }
        });
      }

      if (fromName) {
        await db.insert(companySettings).values({
          companyId,
          key: 'SENDGRID_FROM_NAME',
          value: fromName
        }).onConflictDoUpdate({
          target: [companySettings.companyId, companySettings.key],
          set: { value: fromName, updatedAt: new Date() }
        });
      }

      if (replyToEmail) {
        await db.insert(companySettings).values({
          companyId,
          key: 'SENDGRID_REPLY_TO_EMAIL',
          value: replyToEmail
        }).onConflictDoUpdate({
          target: [companySettings.companyId, companySettings.key],
          set: { value: replyToEmail, updatedAt: new Date() }
        });
      }

      // Update environment variables and reinitialize service
      if (apiKey) process.env.SENDGRID_API_KEY = apiKey;
      if (fromEmail) process.env.SENDGRID_FROM_EMAIL = fromEmail;
      if (fromName) process.env.SENDGRID_FROM_NAME = fromName;
      
      // Reinitialize email service with new credentials
      await emailService.initializeService();

      res.json({ success: true, message: 'SendGrid credentials saved successfully' });
    } catch (error) {
      console.error('Error saving SendGrid credentials:', error);
      res.status(500).json({ error: 'Failed to save SendGrid credentials' });
    }
  }
);

// Test Twilio connection
router.post('/twilio/test', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Check if credentials exist
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      return res.status(400).json({ 
        error: 'Twilio credentials not configured',
        message: 'Please configure your Twilio credentials first'
      });
    }

    // Try to send a test SMS (to the same number to avoid charges)
    const testResult = await smsService.sendSMS(
      process.env.TWILIO_PHONE_NUMBER || '',
      'Twilio test connection successful!'
    );

    if (testResult) {
      res.json({ 
        success: true, 
        message: 'Twilio connection test successful' 
      });
    } else {
      res.status(400).json({ 
        error: 'Connection test failed',
        message: 'Unable to send test SMS. Please check your credentials.'
      });
    }
  } catch (error) {
    console.error('Twilio test error:', error);
    res.status(500).json({ 
      error: 'Connection test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Test SendGrid connection
router.post('/sendgrid/test', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Check if credentials exist
    if (!process.env.SENDGRID_API_KEY) {
      return res.status(400).json({ 
        error: 'SendGrid credentials not configured',
        message: 'Please configure your SendGrid API key first'
      });
    }

    // Try to send a test email
    const testResult = await emailService.sendEmail({
      to: req.user!.email,
      subject: 'SendGrid Test Connection',
      html: '<p>SendGrid test connection successful!</p>',
      text: 'SendGrid test connection successful!'
    });

    if (testResult) {
      res.json({ 
        success: true, 
        message: 'SendGrid connection test successful. Check your email!' 
      });
    } else {
      res.status(400).json({ 
        error: 'Connection test failed',
        message: 'Unable to send test email. Please check your credentials.'
      });
    }
  } catch (error) {
    console.error('SendGrid test error:', error);
    res.status(500).json({ 
      error: 'Connection test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;