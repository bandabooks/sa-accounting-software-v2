import { Router } from 'express';
import { getAIHealthStatus, callClaude, sanitizeForAI, getSafeExcerpt } from '../ai/index.js';
import { authenticate } from '../auth.js';
import { db } from '../db.js';
import { users } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';

const router = Router();

// Rate limiting map (in-memory for now, should use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // 10 requests per minute
const RATE_WINDOW = 60 * 1000; // 1 minute

// Rate limiting middleware for AI endpoints
function aiRateLimit(req: any, res: any, next: any) {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const now = Date.now();
  const userKey = `ai_${userId}`;
  const userLimit = rateLimitMap.get(userKey);

  if (!userLimit || now > userLimit.resetTime) {
    // Reset or initialize
    rateLimitMap.set(userKey, {
      count: 1,
      resetTime: now + RATE_WINDOW
    });
    return next();
  }

  if (userLimit.count >= RATE_LIMIT) {
    const retryAfter = Math.ceil((userLimit.resetTime - now) / 1000);
    return res.status(429).json({ 
      error: 'Rate limit exceeded',
      retryAfter
    });
  }

  // Increment count
  userLimit.count++;
  return next();
}

// Health check endpoint
router.get('/health', authenticate, async (req: any, res) => {
  try {
    const status = await getAIHealthStatus(req.query.force === 'true');
    
    // Log the health check request
    console.log(`[AI Health API] Health check requested by user ${req.user.id}`);
    
    res.json(status);
  } catch (error: any) {
    console.error('[AI Health API] Health check error:', error);
    res.status(500).json({
      ok: false,
      provider: process.env.AI_PROVIDER || 'unknown',
      error: 'Health check failed'
    });
  }
});

// VAT categorization endpoint
router.post('/categorize-vat', authenticate, aiRateLimit, async (req: any, res) => {
  try {
    const { description, amount, companyId } = req.body;

    if (!description || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Sanitize input
    const sanitized = sanitizeForAI({ description, amount });

    // Call Claude for categorization
    const result = await callClaude({
      system: 'You are a South African VAT expert. Categorize the transaction and determine the VAT treatment.',
      user: `Categorize this transaction for South African VAT purposes:
Description: ${sanitized.description}
Amount: R${sanitized.amount}

Respond with JSON:
{
  "category": "string (e.g., Office Supplies, Professional Services, etc.)",
  "vatRate": number (0, 15, or -1 for exempt),
  "vatType": "standard" | "zero-rated" | "exempt",
  "confidence": number (0-1)
}`,
      jsonSchema: {
        type: 'object',
        properties: {
          category: { type: 'string' },
          vatRate: { type: 'number' },
          vatType: { type: 'string', enum: ['standard', 'zero-rated', 'exempt'] },
          confidence: { type: 'number' }
        },
        required: ['category', 'vatRate', 'vatType', 'confidence']
      },
      maxTokens: 256
    });

    if (!result.success) {
      return res.status(503).json({ 
        error: 'AI service unavailable',
        fallback: {
          category: 'General Expense',
          vatRate: 15,
          vatType: 'standard',
          confidence: 0
        }
      });
    }

    // Log usage metrics (no PII)
    console.log(`[AI API] VAT categorization - user: ${req.user.id}, company: ${companyId}, tokens: ${result.usage?.inputTokens}/${result.usage?.outputTokens}`);

    res.json(JSON.parse(result.content || '{}'));
  } catch (error: any) {
    console.error('[AI API] VAT categorization error:', error);
    res.status(500).json({ 
      error: 'Failed to categorize',
      fallback: {
        category: 'General Expense',
        vatRate: 15,
        vatType: 'standard',
        confidence: 0
      }
    });
  }
});

// Receipt extraction endpoint
router.post('/extract-receipt', authenticate, aiRateLimit, async (req: any, res) => {
  try {
    const { ocrText, companyId } = req.body;

    if (!ocrText) {
      return res.status(400).json({ error: 'No text provided' });
    }

    // Sanitize OCR text
    const sanitized = sanitizeForAI({ text: ocrText });
    const excerpt = getSafeExcerpt(ocrText, 200);

    // Call Claude for extraction
    const result = await callClaude({
      system: 'You are an expert at extracting structured data from receipts. Extract vendor, date, total, VAT, and line items.',
      user: `Extract data from this receipt text:
${sanitized.text}

Respond with JSON:
{
  "vendor": "string",
  "date": "YYYY-MM-DD",
  "total": number,
  "vat": number,
  "items": [
    {
      "description": "string",
      "quantity": number,
      "unitPrice": number,
      "total": number
    }
  ]
}`,
      jsonSchema: {
        type: 'object',
        properties: {
          vendor: { type: 'string' },
          date: { type: 'string' },
          total: { type: 'number' },
          vat: { type: 'number' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                description: { type: 'string' },
                quantity: { type: 'number' },
                unitPrice: { type: 'number' },
                total: { type: 'number' }
              }
            }
          }
        }
      },
      maxTokens: 1024
    });

    if (!result.success) {
      return res.status(503).json({ 
        error: 'AI service unavailable',
        message: 'Please enter receipt details manually'
      });
    }

    // Log usage metrics
    console.log(`[AI API] Receipt extraction - user: ${req.user.id}, company: ${companyId}, excerpt: "${excerpt}", tokens: ${result.usage?.inputTokens}/${result.usage?.outputTokens}`);

    res.json(JSON.parse(result.content || '{}'));
  } catch (error: any) {
    console.error('[AI API] Receipt extraction error:', error);
    res.status(500).json({ 
      error: 'Failed to extract receipt data',
      message: 'Please enter receipt details manually'
    });
  }
});

// Auto-complete/suggest endpoint
router.post('/suggest', authenticate, aiRateLimit, async (req: any, res) => {
  try {
    const { context, field, currentValue } = req.body;

    if (!context || !field) {
      return res.status(400).json({ error: 'Missing context or field' });
    }

    // Sanitize input
    const sanitized = sanitizeForAI({ context, field, currentValue });

    // Call Claude for suggestions
    const result = await callClaude({
      system: 'You are an accounting assistant. Provide helpful suggestions for form fields.',
      user: `Suggest completions for this field:
Field: ${sanitized.field}
Current value: ${sanitized.currentValue || '(empty)'}
Context: ${JSON.stringify(sanitized.context)}

Respond with JSON:
{
  "suggestions": ["string", "string", "string"] (max 5 suggestions)
}`,
      jsonSchema: {
        type: 'object',
        properties: {
          suggestions: {
            type: 'array',
            items: { type: 'string' },
            maxItems: 5
          }
        },
        required: ['suggestions']
      },
      maxTokens: 256
    });

    if (!result.success) {
      return res.json({ suggestions: [] });
    }

    res.json(JSON.parse(result.content || '{"suggestions":[]}'));
  } catch (error: any) {
    console.error('[AI API] Suggestion error:', error);
    res.json({ suggestions: [] });
  }
});

// Admin-only endpoint to check AI status
router.get('/status', authenticate, async (req: any, res) => {
  try {
    // Check if user is super admin
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, req.user.id))
      .limit(1);

    if (!user || user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const status = await getAIHealthStatus();
    const config = {
      provider: process.env.AI_PROVIDER || 'not set',
      model: process.env.ANTHROPIC_MODEL || 'default',
      maxTokens: process.env.AI_MAX_TOKENS_PER_CALL || '4096',
      configured: !!process.env.ANTHROPIC_API_KEY
    };

    res.json({
      health: status,
      config,
      rateLimit: {
        limit: RATE_LIMIT,
        window: RATE_WINDOW / 1000 + ' seconds'
      }
    });
  } catch (error: any) {
    console.error('[AI API] Status check error:', error);
    res.status(500).json({ error: 'Failed to get AI status' });
  }
});

export default router;