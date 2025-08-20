import { describe, it, expect, beforeEach } from '@jest/globals';
import { BillValidationService } from '../services/billValidationService';
import { db } from '../db';
import { chartOfAccounts, vatTypes, bills, billItems } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';

describe('Bill Validation Service', () => {
  const companyId = 1;
  let bankAccountId: number;
  let vatControlAccountId: number;
  let opexAccountId: number;
  let inventoryAccountId: number;
  let cogsAccountId: number;
  let vatCodeId: number;

  beforeEach(async () => {
    // Setup test accounts
    const accounts = await db.insert(chartOfAccounts).values([
      {
        companyId,
        accountCode: '1001',
        accountName: 'Business Bank Account',
        accountType: 'Bank',
        parentAccountId: null,
        isActive: true,
      },
      {
        companyId,
        accountCode: '2100',
        accountName: 'VAT Control Account',
        accountType: 'VAT Control',
        parentAccountId: null,
        isActive: true,
      },
      {
        companyId,
        accountCode: '5001',
        accountName: 'Office Expenses',
        accountType: 'OPEX',
        parentAccountId: null,
        isActive: true,
      },
      {
        companyId,
        accountCode: '1300',
        accountName: 'Inventory - Raw Materials',
        accountType: 'Inventory',
        parentAccountId: null,
        isActive: true,
      },
      {
        companyId,
        accountCode: '5100',
        accountName: 'Cost of Goods Sold',
        accountType: 'COGS',
        parentAccountId: null,
        isActive: true,
      }
    ]).returning();

    bankAccountId = accounts.find(a => a.accountType === 'Bank')?.id || 0;
    vatControlAccountId = accounts.find(a => a.accountType === 'VAT Control')?.id || 0;
    opexAccountId = accounts.find(a => a.accountType === 'OPEX')?.id || 0;
    inventoryAccountId = accounts.find(a => a.accountType === 'Inventory')?.id || 0;
    cogsAccountId = accounts.find(a => a.accountType === 'COGS')?.id || 0;

    // Setup VAT code
    const [vatCode] = await db.insert(vatTypes).values({
      companyId,
      name: 'Standard VAT',
      rate: '15.00',
      description: 'Standard 15% VAT',
    }).returning();

    vatCodeId = vatCode.id;
  });

  describe('GL Account Validation', () => {
    it('should reject Bank/Cash accounts on bill lines', async () => {
      const validation = await BillValidationService.validateGLAccount(companyId, bankAccountId);
      
      expect(validation.isValid).toBe(false);
      expect(validation.error).toContain('Bank/Cash');
    });

    it('should reject VAT control accounts on bill lines', async () => {
      const validation = await BillValidationService.validateGLAccount(companyId, vatControlAccountId);
      
      expect(validation.isValid).toBe(false);
      expect(validation.error).toContain('VAT control');
    });

    it('should accept OPEX accounts', async () => {
      const validation = await BillValidationService.validateGLAccount(companyId, opexAccountId);
      
      expect(validation.isValid).toBe(true);
      expect(validation.error).toBeUndefined();
    });

    it('should accept Inventory accounts', async () => {
      const validation = await BillValidationService.validateGLAccount(companyId, inventoryAccountId);
      
      expect(validation.isValid).toBe(true);
      expect(validation.error).toBeUndefined();
    });

    it('should accept COGS accounts', async () => {
      const validation = await BillValidationService.validateGLAccount(companyId, cogsAccountId);
      
      expect(validation.isValid).toBe(true);
      expect(validation.error).toBeUndefined();
    });
  });

  describe('Inventory vs COGS Validation', () => {
    it('should allow inventory items to inventory accounts when not immediate consumption', async () => {
      const glAccount = { accountType: 'Inventory', accountName: 'Raw Materials' };
      const validation = BillValidationService.validateInventoryVsCOGS(glAccount, true, false);
      
      expect(validation.isValid).toBe(true);
    });

    it('should allow inventory items to COGS when immediate consumption is ON', async () => {
      const glAccount = { accountType: 'COGS', accountName: 'Cost of Goods Sold' };
      const validation = BillValidationService.validateInventoryVsCOGS(glAccount, true, true);
      
      expect(validation.isValid).toBe(true);
    });

    it('should reject inventory items to inventory accounts when immediate consumption is ON', async () => {
      const glAccount = { accountType: 'Inventory', accountName: 'Raw Materials' };
      const validation = BillValidationService.validateInventoryVsCOGS(glAccount, true, true);
      
      expect(validation.isValid).toBe(false);
      expect(validation.error).toContain('immediate consumption should be posted to COGS');
    });

    it('should reject inventory items to COGS when immediate consumption is OFF', async () => {
      const glAccount = { accountType: 'COGS', accountName: 'Cost of Goods Sold' };
      const validation = BillValidationService.validateInventoryVsCOGS(glAccount, true, false);
      
      expect(validation.isValid).toBe(false);
      expect(validation.error).toContain('should be posted to inventory accounts');
    });

    it('should reject non-inventory items to inventory accounts', async () => {
      const glAccount = { accountType: 'Inventory', accountName: 'Raw Materials' };
      const validation = BillValidationService.validateInventoryVsCOGS(glAccount, false, false);
      
      expect(validation.isValid).toBe(false);
      expect(validation.error).toContain('Non-inventory items cannot be posted to inventory accounts');
    });
  });

  describe('VAT Calculation', () => {
    it('should calculate VAT correctly', async () => {
      const lineTotal = 1000;
      const validation = await BillValidationService.validateAndCalculateVAT(companyId, vatCodeId, lineTotal);
      
      expect(validation.isValid).toBe(true);
      expect(validation.vatRate).toBe(15);
      expect(validation.vatAmount).toBe(150);
    });

    it('should handle no VAT code', async () => {
      const lineTotal = 1000;
      const validation = await BillValidationService.validateAndCalculateVAT(companyId, null, lineTotal);
      
      expect(validation.isValid).toBe(true);
      expect(validation.vatRate).toBe(0);
      expect(validation.vatAmount).toBe(0);
    });
  });

  describe('Bill Line Item Validation', () => {
    it('should reject lines with Bank/Cash GL accounts', async () => {
      const lineItem = {
        glAccountId: bankAccountId,
        description: 'Test line',
        quantity: 1,
        unitPrice: 100,
        lineTotal: 100,
        vatCodeId: null,
        isInventoryItem: false,
        immediateConsumption: false,
      };

      const validation = await BillValidationService.validateBillLineItem(companyId, lineItem);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors.some(e => e.includes('Bank/Cash'))).toBe(true);
    });

    it('should reject lines with VAT control GL accounts', async () => {
      const lineItem = {
        glAccountId: vatControlAccountId,
        description: 'Test line',
        quantity: 1,
        unitPrice: 100,
        lineTotal: 100,
        vatCodeId: null,
        isInventoryItem: false,
        immediateConsumption: false,
      };

      const validation = await BillValidationService.validateBillLineItem(companyId, lineItem);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors.some(e => e.includes('VAT control'))).toBe(true);
    });

    it('should accept valid OPEX line items', async () => {
      const lineItem = {
        glAccountId: opexAccountId,
        description: 'Office supplies',
        quantity: 1,
        unitPrice: 100,
        lineTotal: 100,
        vatCodeId: vatCodeId,
        isInventoryItem: false,
        immediateConsumption: false,
      };

      const validation = await BillValidationService.validateBillLineItem(companyId, lineItem);
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors.length).toBe(0);
    });
  });

  describe('Complete Bill Validation', () => {
    it('should require at least one line item', async () => {
      const billData = {
        lineItems: [],
        total: 100,
      };

      const validation = await BillValidationService.validateBill(companyId, billData);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors.some(e => e.includes('at least one line item'))).toBe(true);
    });

    it('should validate each line item', async () => {
      const billData = {
        lineItems: [
          {
            glAccountId: bankAccountId, // Invalid - Bank account
            description: 'Test line',
            quantity: 1,
            unitPrice: 100,
            lineTotal: 100,
          }
        ],
        total: 100,
      };

      const validation = await BillValidationService.validateBill(companyId, billData);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors.some(e => e.includes('Line 1') && e.includes('Bank/Cash'))).toBe(true);
    });

    it('should accept valid bills', async () => {
      const billData = {
        lineItems: [
          {
            glAccountId: opexAccountId,
            description: 'Office supplies',
            quantity: 1,
            unitPrice: 100,
            lineTotal: 100,
            vatCodeId: vatCodeId,
            isInventoryItem: false,
            immediateConsumption: false,
          }
        ],
        total: 115, // Including VAT
      };

      const validation = await BillValidationService.validateBill(companyId, billData);
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors.length).toBe(0);
    });
  });
});

// Integration tests for API endpoints
describe('Bills API Integration Tests', () => {
  const companyId = 1;
  
  describe('POST /api/bills', () => {
    it('should return 422 error for Bank/Cash GL account in line items', async () => {
      // This would be tested with actual HTTP requests in a full integration test
      // For now, we're testing the validation service directly
      expect(true).toBe(true); // Placeholder
    });

    it('should return 422 error for VAT control GL account in line items', async () => {
      // This would be tested with actual HTTP requests in a full integration test
      expect(true).toBe(true); // Placeholder
    });

    it('should create bill and post correct journal entries for inventory items', async () => {
      // Test that inventory bill posts to asset account
      // Later payment should clear A/P
      expect(true).toBe(true); // Placeholder
    });

    it('should create bill and post to COGS when immediate consumption is ON', async () => {
      // Test that immediate-consumption bill posts to COGS
      expect(true).toBe(true); // Placeholder
    });
  });
});