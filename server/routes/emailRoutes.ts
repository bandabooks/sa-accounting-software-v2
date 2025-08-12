import { Router, type Request, Response } from "express";
import { authenticate, type AuthenticatedRequest } from "../auth";
import { emailService } from "../services/emailService";
import { db } from "../db";
import { emailQueue, emailTemplates } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";

const router = Router();

// Schema for sending test email
const sendTestEmailSchema = z.object({
  to: z.string().email(),
  subject: z.string().optional(),
  message: z.string().optional(),
  testType: z.enum(["basic", "welcome", "invoice", "reminder"]).default("basic"),
});

// Schema for email template
const emailTemplateSchema = z.object({
  name: z.string(),
  subject: z.string(),
  bodyHtml: z.string(),
  bodyText: z.string(),
  templateType: z.string(),
  variables: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

// Get email service status
router.get("/status", authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const status = emailService.getServiceStatus();
    
    // Check if user has super admin permissions
    const isSuperAdmin = req.user.role === "super_admin";
    
    // Get email queue statistics
    const [pendingCount] = await db.select()
      .from(emailQueue)
      .where(eq(emailQueue.status, "pending"));
    
    const [sentTodayCount] = await db.select()
      .from(emailQueue)
      .where(and(
        eq(emailQueue.status, "sent"),
        // Check if sent today
      ));
    
    res.json({
      service: status,
      isSuperAdmin,
      statistics: {
        pendingEmails: pendingCount ? 1 : 0,
        sentToday: sentTodayCount ? 1 : 0,
      },
      canSendTestEmail: status.configured,
    });
  } catch (error) {
    console.error("Failed to get email status:", error);
    res.status(500).json({ message: "Failed to get email service status" });
  }
});

// Health check endpoint - performs dry-run validation
router.get("/health", authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const health = await emailService.checkHealth();
    
    res.json({
      ok: health.ok,
      driver: health.provider,
      hasKey: health.hasKey,
      hasFrom: health.hasFrom,
      provider: health.provider,
      verifiedSender: health.verifiedSender,
      details: health.details
    });
  } catch (error) {
    console.error("Failed to check email health:", error);
    res.status(500).json({ 
      ok: false,
      message: "Failed to check email health",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Send test email - available for super admin and company admins
router.post("/test", authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validatedData = sendTestEmailSchema.parse(req.body);
    
    // Check if user has permission to send test emails
    const canSendTest = req.user.role === "super_admin" || 
                       req.user.role === "admin" || 
                       req.user.permissions?.includes("send_test_emails");
    
    if (!canSendTest) {
      return res.status(403).json({ message: "You don't have permission to send test emails" });
    }
    
    let subject = validatedData.subject || "Test Email from Taxnify";
    let bodyHtml = "";
    let bodyText = "";
    
    switch (validatedData.testType) {
      case "welcome":
        subject = "Welcome to Taxnify - Test Email";
        bodyHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2563eb;">Welcome to Taxnify!</h1>
            <p>This is a test welcome email to verify your email configuration is working correctly.</p>
            <p>If you received this email, your email service is properly configured.</p>
            <hr style="margin: 20px 0;">
            <p style="color: #6b7280; font-size: 14px;">
              Sent from: ${req.user.name} (${req.user.email})<br>
              Company: ${req.user.companyName || "N/A"}<br>
              Time: ${new Date().toLocaleString()}
            </p>
          </div>
        `;
        bodyText = `Welcome to Taxnify!\n\nThis is a test welcome email.\n\nSent by: ${req.user.name}`;
        break;
        
      case "invoice":
        subject = "Invoice Notification - Test Email";
        bodyHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2563eb;">Invoice #TEST-001</h2>
            <p>This is a test invoice notification email.</p>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr>
                <td style="border: 1px solid #e5e7eb; padding: 10px;"><strong>Invoice Number:</strong></td>
                <td style="border: 1px solid #e5e7eb; padding: 10px;">TEST-001</td>
              </tr>
              <tr>
                <td style="border: 1px solid #e5e7eb; padding: 10px;"><strong>Amount:</strong></td>
                <td style="border: 1px solid #e5e7eb; padding: 10px;">R 1,000.00</td>
              </tr>
              <tr>
                <td style="border: 1px solid #e5e7eb; padding: 10px;"><strong>Due Date:</strong></td>
                <td style="border: 1px solid #e5e7eb; padding: 10px;">${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</td>
              </tr>
            </table>
            <p style="color: #6b7280; font-size: 14px;">This is a test email - no action required.</p>
          </div>
        `;
        bodyText = "Invoice TEST-001\n\nThis is a test invoice notification.";
        break;
        
      case "reminder":
        subject = "Payment Reminder - Test Email";
        bodyHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #ef4444;">Payment Reminder</h2>
            <p>This is a test payment reminder email.</p>
            <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #991b1b; margin: 0;">This is a test reminder - no payment is actually due.</p>
            </div>
            <p style="color: #6b7280; font-size: 14px;">Test email sent by ${req.user.name}</p>
          </div>
        `;
        bodyText = "Payment Reminder\n\nThis is a test payment reminder.";
        break;
        
      default:
        bodyHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2563eb;">Test Email from Taxnify</h2>
            <p>${validatedData.message || "This is a test email to verify your email configuration."}</p>
            <hr style="margin: 20px 0;">
            <p style="color: #6b7280; font-size: 14px;">
              Sent by: ${req.user.name} (${req.user.email})<br>
              Time: ${new Date().toLocaleString()}
            </p>
          </div>
        `;
        bodyText = validatedData.message || "This is a test email from Taxnify.";
    }
    
    // Send the email immediately (not queued for test emails)
    const result = await emailService.sendEmail({
      to: validatedData.to,
      subject,
      bodyHtml,
      bodyText,
      companyId: req.user.companyId,
      userId: req.user.id,
    });
    
    // Log the test email
    await db.insert(emailQueue).values({
      companyId: req.user.companyId,
      userId: req.user.id,
      to: validatedData.to,
      subject,
      bodyHtml,
      bodyText,
      status: "sent",
      sentAt: new Date(),
      priority: 1,
    });
    
    res.json({
      success: true,
      message: "Test email sent successfully",
      details: {
        to: validatedData.to,
        subject,
        type: validatedData.testType,
        sentBy: req.user.email,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Failed to send test email:", error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Invalid email data", 
        errors: error.errors 
      });
    }
    
    // Handle structured email errors
    const statusCode = error.code || 500;
    const errorMessage = error.message || "Failed to send test email";
    const providerError = error.providerError;
    const hint = error.hint;
    
    res.status(statusCode).json({ 
      message: errorMessage,
      error: providerError ? providerError.substring(0, 300) : undefined,
      hint: hint || (errorMessage.includes("not configured") 
        ? "Please configure email service with SENDGRID_API_KEY or SMTP credentials"
        : undefined)
    });
  }
});

// Get email queue
router.get("/queue", authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, limit = 50 } = req.query;
    
    let conditions = req.user.role === "super_admin" 
      ? {} 
      : { companyId: req.user.companyId };
    
    if (status) {
      conditions = { ...conditions, status: status as string };
    }
    
    const emails = await db.select()
      .from(emailQueue)
      .where(
        Object.keys(conditions).length > 0 
          ? and(...Object.entries(conditions).map(([key, value]) => 
              eq(emailQueue[key as keyof typeof emailQueue], value)
            ))
          : undefined
      )
      .orderBy(desc(emailQueue.createdAt))
      .limit(Number(limit));
    
    res.json(emails);
  } catch (error) {
    console.error("Failed to fetch email queue:", error);
    res.status(500).json({ message: "Failed to fetch email queue" });
  }
});

// Get email templates
router.get("/templates", authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const templates = await db.select()
      .from(emailTemplates)
      .where(
        req.user.role === "super_admin"
          ? undefined
          : eq(emailTemplates.companyId, req.user.companyId)
      )
      .orderBy(emailTemplates.name);
    
    res.json(templates);
  } catch (error) {
    console.error("Failed to fetch email templates:", error);
    res.status(500).json({ message: "Failed to fetch email templates" });
  }
});

// Create email template
router.post("/templates", authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validatedData = emailTemplateSchema.parse(req.body);
    
    // Check permission
    const canCreateTemplate = req.user.role === "super_admin" || 
                            req.user.role === "admin" ||
                            req.user.permissions?.includes("manage_email_templates");
    
    if (!canCreateTemplate) {
      return res.status(403).json({ message: "You don't have permission to create email templates" });
    }
    
    const [template] = await db.insert(emailTemplates).values({
      companyId: req.user.role === "super_admin" ? null : req.user.companyId,
      ...validatedData,
      variables: validatedData.variables || [],
    }).returning();
    
    res.status(201).json(template);
  } catch (error) {
    console.error("Failed to create email template:", error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Invalid template data", 
        errors: error.errors 
      });
    }
    
    res.status(500).json({ message: "Failed to create email template" });
  }
});

// Update email template
router.put("/templates/:id", authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const templateId = parseInt(req.params.id);
    const validatedData = emailTemplateSchema.partial().parse(req.body);
    
    // Check permission
    const canUpdateTemplate = req.user.role === "super_admin" || 
                            req.user.role === "admin" ||
                            req.user.permissions?.includes("manage_email_templates");
    
    if (!canUpdateTemplate) {
      return res.status(403).json({ message: "You don't have permission to update email templates" });
    }
    
    // Verify template exists and user has access
    const [existingTemplate] = await db.select()
      .from(emailTemplates)
      .where(eq(emailTemplates.id, templateId));
    
    if (!existingTemplate) {
      return res.status(404).json({ message: "Email template not found" });
    }
    
    if (req.user.role !== "super_admin" && 
        existingTemplate.companyId !== req.user.companyId) {
      return res.status(403).json({ message: "You don't have access to this template" });
    }
    
    const [updatedTemplate] = await db.update(emailTemplates)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(emailTemplates.id, templateId))
      .returning();
    
    res.json(updatedTemplate);
  } catch (error) {
    console.error("Failed to update email template:", error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Invalid template data", 
        errors: error.errors 
      });
    }
    
    res.status(500).json({ message: "Failed to update email template" });
  }
});

// Delete email template
router.delete("/templates/:id", authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const templateId = parseInt(req.params.id);
    
    // Check permission
    const canDeleteTemplate = req.user.role === "super_admin" || 
                            req.user.role === "admin";
    
    if (!canDeleteTemplate) {
      return res.status(403).json({ message: "You don't have permission to delete email templates" });
    }
    
    // Verify template exists and user has access
    const [existingTemplate] = await db.select()
      .from(emailTemplates)
      .where(eq(emailTemplates.id, templateId));
    
    if (!existingTemplate) {
      return res.status(404).json({ message: "Email template not found" });
    }
    
    if (req.user.role !== "super_admin" && 
        existingTemplate.companyId !== req.user.companyId) {
      return res.status(403).json({ message: "You don't have access to this template" });
    }
    
    await db.delete(emailTemplates)
      .where(eq(emailTemplates.id, templateId));
    
    res.status(204).send();
  } catch (error) {
    console.error("Failed to delete email template:", error);
    res.status(500).json({ message: "Failed to delete email template" });
  }
});

// Retry failed email
router.post("/queue/:id/retry", authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const emailId = parseInt(req.params.id);
    
    // Get the email from queue
    const [email] = await db.select()
      .from(emailQueue)
      .where(eq(emailQueue.id, emailId));
    
    if (!email) {
      return res.status(404).json({ message: "Email not found in queue" });
    }
    
    // Check permission
    if (req.user.role !== "super_admin" && email.companyId !== req.user.companyId) {
      return res.status(403).json({ message: "You don't have access to this email" });
    }
    
    // Reset status to pending for retry
    await db.update(emailQueue)
      .set({
        status: "pending",
        attempts: 0,
        errorMessage: null,
      })
      .where(eq(emailQueue.id, emailId));
    
    // Process immediately
    await emailService.processEmailQueue();
    
    res.json({ message: "Email queued for retry", emailId });
  } catch (error) {
    console.error("Failed to retry email:", error);
    res.status(500).json({ message: "Failed to retry email" });
  }
});

// Clear email queue (super admin only)
router.delete("/queue/clear", authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user.role !== "super_admin") {
      return res.status(403).json({ message: "Only super admins can clear the email queue" });
    }
    
    const { status } = req.query;
    
    if (status) {
      await db.delete(emailQueue)
        .where(eq(emailQueue.status, status as string));
    } else {
      // Clear all failed emails by default
      await db.delete(emailQueue)
        .where(eq(emailQueue.status, "failed"));
    }
    
    res.json({ message: "Email queue cleared successfully" });
  } catch (error) {
    console.error("Failed to clear email queue:", error);
    res.status(500).json({ message: "Failed to clear email queue" });
  }
});

export default router;