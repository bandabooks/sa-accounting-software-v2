import type { Express } from "express";
import { authenticate, type AuthenticatedRequest } from "../auth";
import { emailService } from "../services/emailService";
import { smsService } from "../services/smsService";
import { twoFactorService } from "../services/twoFactorService";
import { oauthService } from "../services/oauthService";
import { aiService } from "../services/aiService";
import { workflowService } from "../services/workflowService";
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
  app.post("/api/2fa/setup", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.id;
      const userEmail = req.user.email;
      
      const setup = await twoFactorService.generateSecret(userId, userEmail);
      res.json(setup);
    } catch (error) {
      console.error("Error setting up 2FA:", error);
      res.status(500).json({ error: "Failed to setup 2FA" });
    }
  });

  app.post("/api/2fa/enable", authenticate, strictRateLimit, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.id;
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

  app.post("/api/2fa/disable", authenticate, strictRateLimit, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.id;
      const { token, backupCode } = req.body;
      
      const success = await twoFactorService.disable2FA(userId, token, backupCode);
      
      if (success) {
        res.json({ success: true, message: "2FA disabled successfully" });
      } else {
        res.status(400).json({ error: "Invalid verification token or backup code" });
      }
    } catch (error) {
      console.error("Error disabling 2FA:", error);
      res.status(500).json({ error: "Failed to disable 2FA" });
    }
  });

  app.post("/api/2fa/verify", moderateRateLimit, async (req, res) => {
    try {
      const { userId, token } = req.body;
      
      const isValid = await twoFactorService.verifyLogin2FA(userId, token);
      
      if (isValid) {
        res.json({ success: true });
      } else {
        res.status(400).json({ error: "Invalid 2FA token" });
      }
    } catch (error) {
      console.error("Error verifying 2FA:", error);
      res.status(500).json({ error: "Failed to verify 2FA token" });
    }
  });

  app.post("/api/2fa/backup-codes/regenerate", authenticate, strictRateLimit, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.id;
      const { token } = req.body;
      
      const result = await twoFactorService.regenerateBackupCodes(userId, token);
      
      if (result.success) {
        res.json({ 
          success: true, 
          backupCodes: result.backupCodes,
          message: "Backup codes regenerated successfully" 
        });
      } else {
        res.status(400).json({ error: "Invalid verification token" });
      }
    } catch (error) {
      console.error("Error regenerating backup codes:", error);
      res.status(500).json({ error: "Failed to regenerate backup codes" });
    }
  });

  app.get("/api/2fa/status", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.id;
      const status = await twoFactorService.get2FAStatus(userId);
      res.json(status);
    } catch (error) {
      console.error("Error getting 2FA status:", error);
      res.status(500).json({ error: "Failed to get 2FA status" });
    }
  });

  // OAuth Routes
  app.get("/api/auth/google", 
    passport.authenticate("google", { scope: ["profile", "email"] })
  );

  app.get("/api/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/login?error=oauth_failed" }),
    (req, res) => {
      res.redirect("/dashboard");
    }
  );

  app.get("/api/auth/microsoft",
    passport.authenticate("microsoft", { scope: ["user.read"] })
  );

  app.get("/api/auth/microsoft/callback",
    passport.authenticate("microsoft", { failureRedirect: "/login?error=oauth_failed" }),
    (req, res) => {
      res.redirect("/dashboard");
    }
  );

  app.get("/api/auth/oauth/accounts", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.id;
      const accounts = await oauthService.getUserOAuthAccounts(userId);
      res.json(accounts);
    } catch (error) {
      console.error("Error getting OAuth accounts:", error);
      res.status(500).json({ error: "Failed to get OAuth accounts" });
    }
  });

  app.post("/api/auth/oauth/unlink", authenticate, strictRateLimit, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.id;
      const { provider } = req.body;
      
      await oauthService.unlinkOAuthAccount(userId, provider);
      res.json({ success: true, message: `${provider} account unlinked successfully` });
    } catch (error) {
      console.error("Error unlinking OAuth account:", error);
      res.status(500).json({ error: "Failed to unlink OAuth account" });
    }
  });

  // AI Assistant Routes
  app.get("/api/ai/conversations", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.id;
      const companyId = req.user.companyId || 1;
      
      const conversations = await aiService.getUserConversations(userId, companyId);
      res.json(conversations);
    } catch (error) {
      console.error("Error getting AI conversations:", error);
      res.status(500).json({ error: "Failed to get conversations" });
    }
  });

  app.post("/api/ai/conversations", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.id;
      const companyId = req.user.companyId || 1;
      const { title, context, contextId } = req.body;
      
      const conversation = await aiService.createConversation({
        userId,
        companyId,
        context,
        contextId,
      }, title);
      
      res.json(conversation);
    } catch (error) {
      console.error("Error creating AI conversation:", error);
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  app.post("/api/ai/chat", authenticate, moderateRateLimit, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.id;
      const companyId = req.user.companyId || 1;
      const { conversationId, message, context, contextId } = req.body;
      
      const result = await aiService.chat(conversationId, message, {
        userId,
        companyId,
        context,
        contextId,
      });
      
      res.json(result);
    } catch (error) {
      console.error("Error in AI chat:", error);
      res.status(500).json({ error: "Failed to get AI response" });
    }
  });

  app.get("/api/ai/conversations/:id/history", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const history = await aiService.getConversationHistory(conversationId);
      res.json(history);
    } catch (error) {
      console.error("Error getting conversation history:", error);
      res.status(500).json({ error: "Failed to get conversation history" });
    }
  });

  app.delete("/api/ai/conversations/:id", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const userId = req.user.id;
      
      await aiService.archiveConversation(conversationId, userId);
      res.json({ success: true, message: "Conversation archived" });
    } catch (error) {
      console.error("Error archiving conversation:", error);
      res.status(500).json({ error: "Failed to archive conversation" });
    }
  });

  // Quick AI Analysis Routes
  app.post("/api/ai/analyze/invoice", authenticate, moderateRateLimit, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.id;
      const companyId = req.user.companyId || 1;
      const { invoiceId } = req.body;
      
      const analysis = await aiService.analyzeInvoice(invoiceId, userId, companyId);
      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing invoice:", error);
      res.status(500).json({ error: "Failed to analyze invoice" });
    }
  });

  app.post("/api/ai/suggest/chart-of-accounts", authenticate, moderateRateLimit, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.id;
      const companyId = req.user.companyId || 1;
      const { industry } = req.body;
      
      const suggestions = await aiService.suggestChartOfAccounts(companyId, userId, industry);
      res.json(suggestions);
    } catch (error) {
      console.error("Error getting chart of accounts suggestions:", error);
      res.status(500).json({ error: "Failed to get suggestions" });
    }
  });

  app.get("/api/ai/status", authenticate, async (req: AuthenticatedRequest, res) => {
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

  // Workflow Automation Routes
  app.get("/api/workflows/rules", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = req.user.companyId || 1;
      const rules = await workflowService.getWorkflowRules(companyId);
      res.json(rules);
    } catch (error) {
      console.error("Error getting workflow rules:", error);
      res.status(500).json({ error: "Failed to get workflow rules" });
    }
  });

  app.post("/api/workflows/rules", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = req.user.companyId || 1;
      const userId = req.user.id;
      
      const ruleData = {
        ...req.body,
        companyId,
        createdBy: userId,
      };
      
      const rule = await workflowService.createWorkflowRule(ruleData);
      res.json(rule);
    } catch (error) {
      console.error("Error creating workflow rule:", error);
      res.status(500).json({ error: "Failed to create workflow rule" });
    }
  });

  app.put("/api/workflows/rules/:id", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const ruleId = parseInt(req.params.id);
      const rule = await workflowService.updateWorkflowRule(ruleId, req.body);
      res.json(rule);
    } catch (error) {
      console.error("Error updating workflow rule:", error);
      res.status(500).json({ error: "Failed to update workflow rule" });
    }
  });

  app.delete("/api/workflows/rules/:id", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const ruleId = parseInt(req.params.id);
      await workflowService.deleteWorkflowRule(ruleId);
      res.json({ success: true, message: "Workflow rule deleted" });
    } catch (error) {
      console.error("Error deleting workflow rule:", error);
      res.status(500).json({ error: "Failed to delete workflow rule" });
    }
  });

  app.get("/api/workflows/executions", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = req.user.companyId || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      
      const executions = await workflowService.getWorkflowExecutions(companyId, limit);
      res.json(executions);
    } catch (error) {
      console.error("Error getting workflow executions:", error);
      res.status(500).json({ error: "Failed to get workflow executions" });
    }
  });

  // Email and SMS Routes
  app.get("/api/notifications/email/queue", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      // Implementation to get email queue status
      res.json({ message: "Email queue endpoint" });
    } catch (error) {
      console.error("Error getting email queue:", error);
      res.status(500).json({ error: "Failed to get email queue" });
    }
  });

  app.get("/api/notifications/sms/queue", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      // Implementation to get SMS queue status
      res.json({ message: "SMS queue endpoint" });
    } catch (error) {
      console.error("Error getting SMS queue:", error);
      res.status(500).json({ error: "Failed to get SMS queue" });
    }
  });

  // System Configuration Routes
  app.get("/api/system/configuration", authenticate, async (req: AuthenticatedRequest, res) => {
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

  // Additional endpoints for enterprise settings components
  app.get("/api/notifications/settings", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const notificationSettings = {
        email: {
          enabled: true,
          invoiceReminders: true,
          paymentAlerts: true,
          securityAlerts: true,
          systemUpdates: true,  // Changed to true for default active state
        },
        sms: {
          enabled: false,
          criticalAlerts: false,
          paymentReminders: false,
        },
      };
      res.json(notificationSettings);
    } catch (error) {
      console.error("Error getting notification settings:", error);
      res.status(500).json({ error: "Failed to get notification settings" });
    }
  });

  app.put("/api/notifications/settings", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      // For now, just acknowledge the update
      // In production, this would save to database
      console.log("Updating notification settings:", req.body);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating notification settings:", error);
      res.status(500).json({ error: "Failed to update notification settings" });
    }
  });

  app.get("/api/oauth/status", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const oauthStatus = {
        google: {
          connected: false,
          email: null,
          connectedAt: null,
        },
        microsoft: {
          connected: false,
          email: null,
          connectedAt: null,
        },
      };
      res.json(oauthStatus);
    } catch (error) {
      console.error("Error getting OAuth status:", error);
      res.status(500).json({ error: "Failed to get OAuth status" });
    }
  });

  app.get("/api/audit-logs/enterprise", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      // Mock audit logs data for now
      const auditLogs = [
        {
          id: 1,
          action: "LOGIN",
          resource: "users",
          userId: 1,
          userName: "Production Administrator",
          timestamp: new Date().toISOString(),
          details: { ip: "127.0.0.1", userAgent: "Mozilla/5.0" },
          ipAddress: "127.0.0.1",
          userAgent: "Mozilla/5.0 (Enterprise)",
        },
        {
          id: 2,
          action: "CREATE",
          resource: "invoices",
          userId: 1,
          userName: "Production Administrator",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          details: { invoiceId: 123, amount: 1500.00 },
          ipAddress: "127.0.0.1",
          userAgent: "Mozilla/5.0 (Enterprise)",
        },
      ];
      res.json(auditLogs);
    } catch (error) {
      console.error("Error getting enterprise audit logs:", error);
      res.status(500).json({ error: "Failed to get enterprise audit logs" });
    }
  });
}