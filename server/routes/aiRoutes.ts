import express from 'express';
import { authenticate, requirePermission } from '../auth';
import { anthropicHealthService } from '../services/anthropicHealthService';
import { aiService } from '../services/aiService';
import type { AuthenticatedRequest } from '../auth';

const router = express.Router();

/**
 * Get AI health status
 */
router.get('/health', async (req, res) => {
  try {
    const healthStatus = await anthropicHealthService.performHealthCheck();
    res.json(healthStatus);
  } catch (error) {
    console.error('AI health check error:', error);
    res.status(500).json({
      status: 'down',
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get AI metrics
 */
router.get('/metrics', async (req, res) => {
  try {
    const metrics = anthropicHealthService.getMetrics();
    res.json(metrics);
  } catch (error) {
    console.error('AI metrics error:', error);
    res.status(500).json({
      message: 'Failed to get AI metrics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get comprehensive system status (admin only)
 */
router.get('/system-status', authenticate, requirePermission('settings:view'), async (req, res) => {
  try {
    const systemStatus = anthropicHealthService.getSystemStatus();
    res.json(systemStatus);
  } catch (error) {
    console.error('AI system status error:', error);
    res.status(500).json({
      message: 'Failed to get system status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Test specific AI function
 */
router.post('/test-function', authenticate, requirePermission('settings:update'), async (req, res) => {
  try {
    const { functionName, testPayload } = req.body;
    
    if (!functionName || !testPayload) {
      return res.status(400).json({
        message: 'functionName and testPayload are required'
      });
    }

    const result = await anthropicHealthService.testAIFunction(functionName, testPayload);
    
    res.json({
      functionName,
      ...result
    });
  } catch (error) {
    console.error('AI function test error:', error);
    res.status(500).json({
      message: 'Function test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Start health monitoring
 */
router.post('/monitoring/start', authenticate, requirePermission('settings:update'), async (req, res) => {
  try {
    const { intervalMinutes = 5 } = req.body;
    anthropicHealthService.startHealthMonitoring(intervalMinutes);
    
    res.json({
      message: 'Health monitoring started',
      interval: intervalMinutes
    });
  } catch (error) {
    console.error('Start monitoring error:', error);
    res.status(500).json({
      message: 'Failed to start monitoring',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Stop health monitoring
 */
router.post('/monitoring/stop', authenticate, requirePermission('settings:update'), async (req, res) => {
  try {
    anthropicHealthService.stopHealthMonitoring();
    
    res.json({
      message: 'Health monitoring stopped'
    });
  } catch (error) {
    console.error('Stop monitoring error:', error);
    res.status(500).json({
      message: 'Failed to stop monitoring',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Reset metrics (admin only)
 */
router.post('/metrics/reset', authenticate, requirePermission('settings:update'), async (req, res) => {
  try {
    anthropicHealthService.resetMetrics();
    
    res.json({
      message: 'Metrics reset successfully'
    });
  } catch (error) {
    console.error('Reset metrics error:', error);
    res.status(500).json({
      message: 'Failed to reset metrics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get AI conversations for the current user
 */
router.get('/conversations', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const conversations = await aiService.getUserConversations(req.user.id, req.user.companyId);
    res.json(conversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      message: 'Failed to get conversations',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Create a new AI conversation
 */
router.post('/conversations', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { title, context, contextId } = req.body;
    
    const conversation = await aiService.createConversation({
      userId: req.user.id,
      companyId: req.user.companyId,
      context,
      contextId
    }, title);

    res.json(conversation);
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({
      message: 'Failed to create conversation',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Send a chat message
 */
router.post('/chat', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { conversationId, message, context } = req.body;
    
    if (!conversationId || !message) {
      return res.status(400).json({
        message: 'conversationId and message are required'
      });
    }

    const chatContext = context ? {
      userId: req.user.id,
      companyId: req.user.companyId,
      ...context
    } : undefined;

    const result = await aiService.chat(conversationId, message, chatContext);
    res.json(result);
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      message: 'Failed to send chat message',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get conversation history
 */
router.get('/conversations/:id/messages', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const conversationId = parseInt(req.params.id);
    
    if (isNaN(conversationId)) {
      return res.status(400).json({ message: 'Invalid conversation ID' });
    }

    const messages = await aiService.getConversationHistory(conversationId);
    res.json(messages);
  } catch (error) {
    console.error('Get conversation history error:', error);
    res.status(500).json({
      message: 'Failed to get conversation history',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Archive a conversation
 */
router.post('/conversations/:id/archive', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const conversationId = parseInt(req.params.id);
    
    if (isNaN(conversationId)) {
      return res.status(400).json({ message: 'Invalid conversation ID' });
    }

    await aiService.archiveConversation(conversationId, req.user.id);
    
    res.json({
      message: 'Conversation archived successfully'
    });
  } catch (error) {
    console.error('Archive conversation error:', error);
    res.status(500).json({
      message: 'Failed to archive conversation',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Quick AI analysis endpoints
 */

// Analyze invoice
router.post('/analyze/invoice/:id', authenticate, requirePermission('invoices:view'), async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const invoiceId = parseInt(req.params.id);
    
    if (isNaN(invoiceId)) {
      return res.status(400).json({ message: 'Invalid invoice ID' });
    }

    const result = await aiService.analyzeInvoice(invoiceId, req.user.id, req.user.companyId);
    res.json(result);
  } catch (error) {
    console.error('Invoice analysis error:', error);
    res.status(500).json({
      message: 'Failed to analyze invoice',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Suggest chart of accounts
router.post('/suggest/chart-of-accounts', authenticate, requirePermission('settings:view'), async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { industry } = req.body;
    
    if (!industry) {
      return res.status(400).json({ message: 'Industry is required' });
    }

    const result = await aiService.suggestChartOfAccounts(req.user.companyId, req.user.id, industry);
    res.json(result);
  } catch (error) {
    console.error('Chart of accounts suggestion error:', error);
    res.status(500).json({
      message: 'Failed to suggest chart of accounts',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// VAT compliance help
router.post('/help/vat-compliance', authenticate, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const result = await aiService.explainVATCompliance(req.user.companyId, req.user.id);
    res.json(result);
  } catch (error) {
    console.error('VAT compliance help error:', error);
    res.status(500).json({
      message: 'Failed to get VAT compliance help',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * AI availability check (public endpoint)
 */
router.get('/available', async (req, res) => {
  try {
    const available = anthropicHealthService.isAvailable();
    const providers = aiService.getAvailableProviders();
    
    res.json({
      available,
      providers,
      status: anthropicHealthService.getCurrentHealth()?.status || 'unknown'
    });
  } catch (error) {
    console.error('AI availability check error:', error);
    res.status(500).json({
      message: 'Failed to check AI availability',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;