import { Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { chartOfAccounts } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';
import { authenticate } from '../auth';

// Industry templates with account structures
const industryTemplates = {
  general: {
    id: 'general',
    name: 'General Business',
    description: 'Suitable for most business types with standard accounting needs',
    totalAccounts: 53,
    accountBreakdown: {
      'Asset': 29,
      'Liability': 14,
      'Equity': 5,
      'Revenue': 8,
      'Expense': 49,
      'Cost of Goods Sold': 9
    },
    accounts: [
      // Assets
      { code: "1100", name: "Bank Account - Current", type: "Asset", category: "Current Assets" },
      { code: "1200", name: "Accounts Receivable", type: "Asset", category: "Current Assets" },
      { code: "1300", name: "Inventory", type: "Asset", category: "Current Assets" },
      { code: "1400", name: "Prepaid Expenses", type: "Asset", category: "Current Assets" },
      { code: "1500", name: "Equipment", type: "Asset", category: "Fixed Assets" },
      // Add more accounts as needed
    ]
  },
  retail: {
    id: 'retail',
    name: 'Retail & Trading',
    description: 'Optimized for retail businesses with inventory management focus',
    totalAccounts: 65,
    accountBreakdown: {
      'Asset': 32,
      'Liability': 15,
      'Equity': 5,
      'Revenue': 10,
      'Expense': 45,
      'Cost of Goods Sold': 12
    },
    accounts: [
      // Retail-specific accounts
      { code: "1350", name: "Retail Inventory", type: "Asset", category: "Current Assets" },
      { code: "4150", name: "Retail Sales", type: "Revenue", category: "Operating Revenue" },
      { code: "5150", name: "Cost of Goods Sold - Retail", type: "Cost of Goods Sold", category: "Direct Materials" },
      { code: "6150", name: "Store Rent", type: "Expense", category: "Office & General" },
      { code: "6160", name: "Point of Sale Fees", type: "Expense", category: "Administrative Expenses" },
    ]
  },
  services: {
    id: 'services',
    name: 'Professional Services',
    description: 'Perfect for consulting, accounting, legal, and other service providers',
    totalAccounts: 48,
    accountBreakdown: {
      'Asset': 25,
      'Liability': 12,
      'Equity': 5,
      'Revenue': 12,
      'Expense': 52,
      'Cost of Goods Sold': 3
    },
    accounts: [
      // Service-specific accounts
      { code: "4250", name: "Consulting Revenue", type: "Revenue", category: "Operating Revenue" },
      { code: "4260", name: "Professional Fees", type: "Revenue", category: "Operating Revenue" },
      { code: "6250", name: "Professional Development", type: "Expense", category: "Professional Services" },
      { code: "6260", name: "Client Entertainment", type: "Expense", category: "Travel & Entertainment" },
    ]
  },
  manufacturing: {
    id: 'manufacturing',
    name: 'Manufacturing & Production',
    description: 'Designed for manufacturing businesses with production cost tracking',
    totalAccounts: 78,
    accountBreakdown: {
      'Asset': 35,
      'Liability': 18,
      'Equity': 6,
      'Revenue': 8,
      'Expense': 45,
      'Cost of Goods Sold': 18
    },
    accounts: [
      // Manufacturing-specific accounts
      { code: "1320", name: "Raw Materials Inventory", type: "Asset", category: "Current Assets" },
      { code: "1330", name: "Work in Progress", type: "Asset", category: "Current Assets" },
      { code: "1340", name: "Finished Goods", type: "Asset", category: "Current Assets" },
      { code: "5200", name: "Direct Labor", type: "Cost of Goods Sold", category: "Direct Labor" },
      { code: "5300", name: "Manufacturing Overhead", type: "Cost of Goods Sold", category: "Manufacturing Overhead" },
    ]
  }
};

export function registerChartManagementRoutes(app: any) {
  // Get available industry templates
  app.get('/api/chart-of-accounts/templates', authenticate, async (req: Request, res: Response) => {
    try {
      const templates = Object.values(industryTemplates).map(template => ({
        id: template.id,
        name: template.name,
        description: template.description,
        totalAccounts: template.totalAccounts,
        accountBreakdown: template.accountBreakdown
      }));
      
      res.json(templates);
    } catch (error) {
      console.error('Error fetching templates:', error);
      res.status(500).json({ error: 'Failed to fetch templates' });
    }
  });

  // Apply industry template
  app.post('/api/chart-of-accounts/apply-template', authenticate, async (req: any, res: Response) => {
    try {
      const { templateId } = req.body;
      const companyId = req.user.companyId;

      if (!templateId || !industryTemplates[templateId as keyof typeof industryTemplates]) {
        return res.status(400).json({ error: 'Invalid template ID' });
      }

      const template = industryTemplates[templateId as keyof typeof industryTemplates];

      // Get existing accounts to avoid duplicates
      const existingAccounts = await db
        .select()
        .from(chartOfAccounts)
        .where(eq(chartOfAccounts.companyId, companyId));

      const existingCodes = new Set(existingAccounts.map(acc => acc.accountCode));

      // Add new accounts from template
      const newAccounts = template.accounts.filter(acc => !existingCodes.has(acc.code));

      if (newAccounts.length > 0) {
        const accountsToInsert = newAccounts.map(account => ({
          companyId,
          accountCode: account.code,
          accountName: account.name,
          accountType: account.type,
          category: account.category,
          isActive: true,
          balance: 0,
          currentBalance: 0,
          openingBalance: 0,
          normalBalance: account.type === 'Asset' || account.type === 'Expense' || account.type === 'Cost of Goods Sold' ? 'debit' : 'credit',
          level: 1,
          isSystemAccount: false,
        }));

        await db.insert(chartOfAccounts).values(accountsToInsert);
      }

      res.json({ 
        message: 'Template applied successfully',
        accountsAdded: newAccounts.length 
      });
    } catch (error) {
      console.error('Error applying template:', error);
      res.status(500).json({ error: 'Failed to apply template' });
    }
  });

  // Toggle account active status
  app.patch('/api/chart-of-accounts/:id/toggle', authenticate, async (req: any, res: Response) => {
    try {
      const accountId = parseInt(req.params.id);
      const { isActive } = req.body;
      const companyId = req.user.companyId;

      if (typeof isActive !== 'boolean') {
        return res.status(400).json({ error: 'isActive must be a boolean' });
      }

      const result = await db
        .update(chartOfAccounts)
        .set({ 
          isActive,
          updatedAt: new Date()
        })
        .where(
          and(
            eq(chartOfAccounts.id, accountId),
            eq(chartOfAccounts.companyId, companyId)
          )
        )
        .returning();

      if (result.length === 0) {
        return res.status(404).json({ error: 'Account not found' });
      }

      res.json(result[0]);
    } catch (error) {
      console.error('Error toggling account:', error);
      res.status(500).json({ error: 'Failed to toggle account status' });
    }
  });

  // Get chart of accounts summary
  app.get('/api/chart-of-accounts/summary', authenticate, async (req: any, res: Response) => {
    try {
      const companyId = req.user.companyId;

      const accounts = await db
        .select()
        .from(chartOfAccounts)
        .where(eq(chartOfAccounts.companyId, companyId));

      const summary = {
        total: accounts.length,
        active: accounts.filter(acc => acc.isActive).length,
        byType: accounts.reduce((acc, account) => {
          acc[account.accountType] = (acc[account.accountType] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        byCategory: accounts.reduce((acc, account) => {
          const category = account.category || 'Uncategorized';
          acc[category] = (acc[category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      };

      res.json(summary);
    } catch (error) {
      console.error('Error fetching chart summary:', error);
      res.status(500).json({ error: 'Failed to fetch chart summary' });
    }
  });
}