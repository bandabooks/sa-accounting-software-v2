import { Router } from "express";
import { db } from "../db";
import { emailTemplates, smsTemplates, emailQueue, smsQueue } from "../../shared/schema";
import { authenticate, requirePermission } from "../auth";
import { DEFAULT_EMAIL_TEMPLATES } from "../services/emailTemplates";
import { DEFAULT_SMS_TEMPLATES } from "../services/smsTemplates";
import { eq, and, or, desc } from "drizzle-orm";
import { z } from "zod";

const router = Router();

// Validation schemas
const emailTemplateSchema = z.object({
  templateId: z.string(),
  name: z.string(),
  subject: z.string(),
  category: z.string(),
  bodyHtml: z.string(),
  bodyText: z.string(),
  variables: z.array(z.string()),
  isActive: z.boolean().optional(),
});

const smsTemplateSchema = z.object({
  templateId: z.string(),
  name: z.string(),
  category: z.string(),
  message: z.string(),
  variables: z.array(z.string()),
  maxLength: z.number().optional(),
  isActive: z.boolean().optional(),
});

// Initialize default templates
export async function initializeDefaultTemplates(companyId?: number) {
  try {
    // Check if templates already exist
    const existingEmailTemplates = await db
      .select()
      .from(emailTemplates)
      .where(eq(emailTemplates.isSystemTemplate, true))
      .limit(1);

    if (existingEmailTemplates.length === 0) {
      // Insert default email templates as system templates
      for (const template of DEFAULT_EMAIL_TEMPLATES) {
        await db.insert(emailTemplates).values({
          companyId: null, // System templates don't belong to a specific company
          templateId: template.id,
          name: template.name,
          subject: template.subject,
          category: template.category,
          bodyHtml: template.bodyHtml,
          bodyText: template.bodyText,
          variables: template.variables,
          isSystemTemplate: true,
          isActive: template.isActive,
        });
      }
      console.log("✅ Default email templates initialized");
    }

    const existingSmsTemplates = await db
      .select()
      .from(smsTemplates)
      .where(eq(smsTemplates.isSystemTemplate, true))
      .limit(1);

    if (existingSmsTemplates.length === 0) {
      // Insert default SMS templates as system templates
      for (const template of DEFAULT_SMS_TEMPLATES) {
        await db.insert(smsTemplates).values({
          companyId: null, // System templates don't belong to a specific company
          templateId: template.id,
          name: template.name,
          category: template.category,
          message: template.message,
          variables: template.variables,
          maxLength: template.maxLength,
          isSystemTemplate: true,
          isActive: template.isActive,
        });
      }
      console.log("✅ Default SMS templates initialized");
    }
  } catch (error) {
    console.error("Error initializing default templates:", error);
  }
}

// Get all email templates (system + company)
router.get("/api/email-templates", authenticate, async (req: any, res) => {
  try {
    const companyId = req.user.companyId;
    
    // Get both system templates and company-specific templates
    const templates = await db
      .select()
      .from(emailTemplates)
      .where(
        or(
          eq(emailTemplates.isSystemTemplate, true),
          eq(emailTemplates.companyId, companyId)
        )
      )
      .orderBy(desc(emailTemplates.createdAt));

    // Group templates by category
    const categorizedTemplates = templates.reduce((acc: any, template) => {
      const category = template.category || "Uncategorized";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(template);
      return acc;
    }, {});

    res.json({ templates, categorized: categorizedTemplates });
  } catch (error) {
    console.error("Error fetching email templates:", error);
    res.status(500).json({ error: "Failed to fetch email templates" });
  }
});

// Get all SMS templates (system + company)
router.get("/api/sms-templates", authenticate, async (req: any, res) => {
  try {
    const companyId = req.user.companyId;
    
    // Get both system templates and company-specific templates
    const templates = await db
      .select()
      .from(smsTemplates)
      .where(
        or(
          eq(smsTemplates.isSystemTemplate, true),
          eq(smsTemplates.companyId, companyId)
        )
      )
      .orderBy(desc(smsTemplates.createdAt));

    // Group templates by category
    const categorizedTemplates = templates.reduce((acc: any, template) => {
      const category = template.category || "Uncategorized";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(template);
      return acc;
    }, {});

    res.json({ templates, categorized: categorizedTemplates });
  } catch (error) {
    console.error("Error fetching SMS templates:", error);
    res.status(500).json({ error: "Failed to fetch SMS templates" });
  }
});

// Get single email template
router.get("/api/email-templates/:id", authenticate, async (req: any, res) => {
  try {
    const templateId = parseInt(req.params.id);
    const companyId = req.user.companyId;
    
    const template = await db
      .select()
      .from(emailTemplates)
      .where(
        and(
          eq(emailTemplates.id, templateId),
          or(
            eq(emailTemplates.isSystemTemplate, true),
            eq(emailTemplates.companyId, companyId)
          )
        )
      )
      .limit(1);

    if (template.length === 0) {
      return res.status(404).json({ error: "Template not found" });
    }

    res.json(template[0]);
  } catch (error) {
    console.error("Error fetching email template:", error);
    res.status(500).json({ error: "Failed to fetch email template" });
  }
});

// Get single SMS template
router.get("/api/sms-templates/:id", authenticate, async (req: any, res) => {
  try {
    const templateId = parseInt(req.params.id);
    const companyId = req.user.companyId;
    
    const template = await db
      .select()
      .from(smsTemplates)
      .where(
        and(
          eq(smsTemplates.id, templateId),
          or(
            eq(smsTemplates.isSystemTemplate, true),
            eq(smsTemplates.companyId, companyId)
          )
        )
      )
      .limit(1);

    if (template.length === 0) {
      return res.status(404).json({ error: "Template not found" });
    }

    res.json(template[0]);
  } catch (error) {
    console.error("Error fetching SMS template:", error);
    res.status(500).json({ error: "Failed to fetch SMS template" });
  }
});

// Create custom email template
router.post("/api/email-templates", authenticate, requirePermission("settings:update"), async (req: any, res) => {
  try {
    const companyId = req.user.companyId;
    const userId = req.user.id;
    const templateData = emailTemplateSchema.parse(req.body);
    
    // Check if template ID already exists for this company
    const existing = await db
      .select()
      .from(emailTemplates)
      .where(
        and(
          eq(emailTemplates.companyId, companyId),
          eq(emailTemplates.templateId, templateData.templateId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return res.status(400).json({ error: "Template ID already exists" });
    }

    const newTemplate = await db.insert(emailTemplates).values({
      companyId,
      templateId: templateData.templateId,
      name: templateData.name,
      subject: templateData.subject,
      category: templateData.category,
      bodyHtml: templateData.bodyHtml,
      bodyText: templateData.bodyText,
      variables: templateData.variables,
      isSystemTemplate: false,
      isActive: templateData.isActive ?? true,
      createdBy: userId,
    }).returning();

    res.json(newTemplate[0]);
  } catch (error) {
    console.error("Error creating email template:", error);
    res.status(500).json({ error: "Failed to create email template" });
  }
});

// Create custom SMS template
router.post("/api/sms-templates", authenticate, requirePermission("settings:update"), async (req: any, res) => {
  try {
    const companyId = req.user.companyId;
    const userId = req.user.id;
    const templateData = smsTemplateSchema.parse(req.body);
    
    // Check if template ID already exists for this company
    const existing = await db
      .select()
      .from(smsTemplates)
      .where(
        and(
          eq(smsTemplates.companyId, companyId),
          eq(smsTemplates.templateId, templateData.templateId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return res.status(400).json({ error: "Template ID already exists" });
    }

    const newTemplate = await db.insert(smsTemplates).values({
      companyId,
      templateId: templateData.templateId,
      name: templateData.name,
      category: templateData.category,
      message: templateData.message,
      variables: templateData.variables,
      maxLength: templateData.maxLength ?? 160,
      isSystemTemplate: false,
      isActive: templateData.isActive ?? true,
      createdBy: userId,
    }).returning();

    res.json(newTemplate[0]);
  } catch (error) {
    console.error("Error creating SMS template:", error);
    res.status(500).json({ error: "Failed to create SMS template" });
  }
});

// Update email template
router.put("/api/email-templates/:id", authenticate, requirePermission("settings:update"), async (req: any, res) => {
  try {
    const templateId = parseInt(req.params.id);
    const companyId = req.user.companyId;
    const templateData = emailTemplateSchema.partial().parse(req.body);
    
    // Can only update company-specific templates
    const template = await db
      .select()
      .from(emailTemplates)
      .where(
        and(
          eq(emailTemplates.id, templateId),
          eq(emailTemplates.companyId, companyId),
          eq(emailTemplates.isSystemTemplate, false)
        )
      )
      .limit(1);

    if (template.length === 0) {
      return res.status(404).json({ error: "Template not found or cannot be edited" });
    }

    const updated = await db
      .update(emailTemplates)
      .set({
        ...templateData,
        updatedAt: new Date(),
      })
      .where(eq(emailTemplates.id, templateId))
      .returning();

    res.json(updated[0]);
  } catch (error) {
    console.error("Error updating email template:", error);
    res.status(500).json({ error: "Failed to update email template" });
  }
});

// Update SMS template
router.put("/api/sms-templates/:id", authenticate, requirePermission("settings:update"), async (req: any, res) => {
  try {
    const templateId = parseInt(req.params.id);
    const companyId = req.user.companyId;
    const templateData = smsTemplateSchema.partial().parse(req.body);
    
    // Can only update company-specific templates
    const template = await db
      .select()
      .from(smsTemplates)
      .where(
        and(
          eq(smsTemplates.id, templateId),
          eq(smsTemplates.companyId, companyId),
          eq(smsTemplates.isSystemTemplate, false)
        )
      )
      .limit(1);

    if (template.length === 0) {
      return res.status(404).json({ error: "Template not found or cannot be edited" });
    }

    const updated = await db
      .update(smsTemplates)
      .set({
        ...templateData,
        updatedAt: new Date(),
      })
      .where(eq(smsTemplates.id, templateId))
      .returning();

    res.json(updated[0]);
  } catch (error) {
    console.error("Error updating SMS template:", error);
    res.status(500).json({ error: "Failed to update SMS template" });
  }
});

// Delete email template
router.delete("/api/email-templates/:id", authenticate, requirePermission("settings:update"), async (req: any, res) => {
  try {
    const templateId = parseInt(req.params.id);
    const companyId = req.user.companyId;
    
    // Can only delete company-specific templates
    const template = await db
      .select()
      .from(emailTemplates)
      .where(
        and(
          eq(emailTemplates.id, templateId),
          eq(emailTemplates.companyId, companyId),
          eq(emailTemplates.isSystemTemplate, false)
        )
      )
      .limit(1);

    if (template.length === 0) {
      return res.status(404).json({ error: "Template not found or cannot be deleted" });
    }

    await db.delete(emailTemplates).where(eq(emailTemplates.id, templateId));

    res.json({ message: "Template deleted successfully" });
  } catch (error) {
    console.error("Error deleting email template:", error);
    res.status(500).json({ error: "Failed to delete email template" });
  }
});

// Delete SMS template
router.delete("/api/sms-templates/:id", authenticate, requirePermission("settings:update"), async (req: any, res) => {
  try {
    const templateId = parseInt(req.params.id);
    const companyId = req.user.companyId;
    
    // Can only delete company-specific templates
    const template = await db
      .select()
      .from(smsTemplates)
      .where(
        and(
          eq(smsTemplates.id, templateId),
          eq(smsTemplates.companyId, companyId),
          eq(smsTemplates.isSystemTemplate, false)
        )
      )
      .limit(1);

    if (template.length === 0) {
      return res.status(404).json({ error: "Template not found or cannot be deleted" });
    }

    await db.delete(smsTemplates).where(eq(smsTemplates.id, templateId));

    res.json({ message: "Template deleted successfully" });
  } catch (error) {
    console.error("Error deleting SMS template:", error);
    res.status(500).json({ error: "Failed to delete SMS template" });
  }
});

// Get email queue
router.get("/api/email-queue", authenticate, requirePermission("settings:view"), async (req: any, res) => {
  try {
    const companyId = req.user.companyId;
    const status = req.query.status as string;
    
    let query = db
      .select()
      .from(emailQueue)
      .where(eq(emailQueue.companyId, companyId))
      .orderBy(desc(emailQueue.createdAt))
      .limit(100);

    if (status) {
      query = db
        .select()
        .from(emailQueue)
        .where(
          and(
            eq(emailQueue.companyId, companyId),
            eq(emailQueue.status, status)
          )
        )
        .orderBy(desc(emailQueue.createdAt))
        .limit(100);
    }

    const emails = await query;
    res.json(emails);
  } catch (error) {
    console.error("Error fetching email queue:", error);
    res.status(500).json({ error: "Failed to fetch email queue" });
  }
});

// Get SMS queue
router.get("/api/sms-queue", authenticate, requirePermission("settings:view"), async (req: any, res) => {
  try {
    const companyId = req.user.companyId;
    const status = req.query.status as string;
    
    let query = db
      .select()
      .from(smsQueue)
      .where(eq(smsQueue.companyId, companyId))
      .orderBy(desc(smsQueue.createdAt))
      .limit(100);

    if (status) {
      query = db
        .select()
        .from(smsQueue)
        .where(
          and(
            eq(smsQueue.companyId, companyId),
            eq(smsQueue.status, status)
          )
        )
        .orderBy(desc(smsQueue.createdAt))
        .limit(100);
    }

    const messages = await query;
    res.json(messages);
  } catch (error) {
    console.error("Error fetching SMS queue:", error);
    res.status(500).json({ error: "Failed to fetch SMS queue" });
  }
});

export default router;