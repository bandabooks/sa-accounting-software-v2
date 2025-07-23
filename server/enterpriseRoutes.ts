import type { Express } from "express";
import { authenticate } from "./auth";
import { emailService } from "./services/emailService";
import { smsService } from "./services/smsService";
import { twoFactorService } from "./services/twoFactorService";
import { oauthService } from "./services/oauthService";
import { aiService } from "./services/aiService";
import { workflowService } from "./services/workflowService";
import passport from 'passport';
import rateLimit from 'express-rate-limit';

// Rate limiting for sensitive endpoints
const strictRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: { error: "Too many requests, please try again later." }
});

const moderateRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per windowMs
  message: { error: "Too many requests, please try again later." }
});

export function registerEnterpriseRoutes(app: Express) {
  // Initialize OAuth service
  oauthService.initialize();

  // 2FA Routes
  app.post("/api/2fa/setup", authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const userEmail = (req as any).user.email;
      
      const setup = await twoFactorService.generateSecret(userId, userEmail);
      res.json(setup);
    } catch (error) {
      console.error("Error setting up 2FA:", error);
      res.status(500).json({ error: "Failed to setup 2FA" });
    }
  });

  app.post("/api/2fa/enable", authenticate, strictRateLimit, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { token } = req.body;
      
      const result = await twoFactorService.enable2FA(userId, token);
      
      if (result.success) {
        res.json({ 
          success: true, 
          backupCodes: result.backupCodes,
          message: "2FA enabled successfully" 
        });
      } else {
        res.status(400).json({ error: "Invalid verification token" });
      }
    } catch (error) {
      console.error("Error enabling 2FA:", error);
      res.status(500).json({ error: "Failed to enable 2FA" });
    }
  });

  app.get("/api/2fa/status", authenticate, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const status = await twoFactorService.get2FAStatus(userId);
      res.json(status);
    } catch (error) {
      console.error("Error getting 2FA status:", error);
      res.status(500).json({ error: "Failed to get 2FA status" });
    }
  });

  // AI Assistant Routes
  app.post("/api/ai/chat", authenticate, moderateRateLimit, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const companyId = (req as any).user.activeCompanyId || 1;
      const { conversationId, message, context, contextId } = req.body;
      
      // Create conversation if not provided
      let convId = conversationId;
      if (!convId) {
        const conversation = await aiService.createConversation({
          userId,
          companyId,
          context,
          contextId,
        });
        convId = conversation.id;
      }
      
      const result = await aiService.chat(convId, message, {
        userId,
        companyId,
        context,
        contextId,
      });
      
      res.json({ ...result, conversationId: convId });
    } catch (error) {
      console.error("Error in AI chat:", error);
      res.status(500).json({ error: "Failed to get AI response" });
    }
  });

  app.get("/api/ai/status", authenticate, async (req, res) => {
    try {
      res.json({
        available: aiService.isAvailable(),
        providers: aiService.getAvailableProviders(),
      });
    } catch (error) {
      console.error("Error getting AI status:", error);
      res.status(500).json({ error: "Failed to get AI status" });
    }
  });

  // System Configuration Routes
  app.get("/api/system/configuration", authenticate, async (req, res) => {
    try {
      res.json({
        features: {
          smtp: !!process.env.SMTP_HOST,
          sms: !!process.env.TWILIO_ACCOUNT_SID,
          googleOAuth: oauthService.isGoogleConfigured(),
          microsoftOAuth: oauthService.isMicrosoftConfigured(),
          ai: aiService.isAvailable(),
        },
        providers: {
          ai: aiService.getAvailableProviders(),
        },
      });
    } catch (error) {
      console.error("Error getting system configuration:", error);
      res.status(500).json({ error: "Failed to get system configuration" });
    }
  });
}