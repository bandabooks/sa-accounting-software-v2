import { db } from '../db';
import { chartOfAccounts, billItems, vatTypes } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';

export class BillValidationService {
  /**
   * Validates GL account for bill line items according to business rules:
   * - Allowed: OPEX, COGS, Inventory, Prepaid/Accruals, Fixed Assets
   * - Disallowed: Bank/Cash, Accounts Payable/Receivable, VAT control
   */
  static async validateGLAccount(companyId: number, glAccountId: number): Promise<{ isValid: boolean; error?: string }> {
    try {
      const glAccount = await db
        .select()
        .from(chartOfAccounts)
        .where(and(
          eq(chartOfAccounts.id, glAccountId),
          eq(chartOfAccounts.companyId, companyId)
        ))
        .limit(1);

      if (!glAccount.length) {
        return { isValid: false, error: 'GL account not found' };
      }

      const account = glAccount[0];
      const accountType = account.accountType?.toLowerCase();
      const accountName = account.accountName?.toLowerCase() || '';

      // Disallowed account types
      const disallowedTypes = [
        'bank', 'cash', 'petty cash',
        'accounts payable', 'accounts receivable', 'creditors', 'debtors',
        'vat control', 'vat input', 'vat output', 'vat payable', 'vat receivable',
        'sales tax', 'input tax', 'output tax'
      ];

      // Check if account type or name matches disallowed patterns
      const isDisallowed = disallowedTypes.some(type => 
        accountType?.includes(type) || accountName.includes(type)
      );

      if (isDisallowed) {
        return { 
          isValid: false, 
          error: `GL account "${account.accountName}" (${accountType}) cannot be used in bill line items. Bank/Cash, A/P, A/R, and VAT control accounts are not allowed.` 
        };
      }

      // Allowed categories for bills
      const allowedCategories = [
        'opex', 'operating expense', 'expense',
        'cogs', 'cost of goods sold', 'cost of sales',
        'inventory', 'stock', 'raw materials', 'finished goods',
        'prepaid', 'accrual', 'prepayment', 'deferred',
        'fixed asset', 'asset', 'equipment', 'property', 'plant'
      ];

      const isAllowed = allowedCategories.some(category => 
        accountType?.includes(category) || accountName.includes(category)
      );

      if (!isAllowed) {
        return { 
          isValid: false, 
          error: `GL account "${account.accountName}" (${accountType}) is not valid for bill line items. Only OPEX, COGS, Inventory, Prepaid/Accruals, and Fixed Assets are allowed.` 
        };
      }

      return { isValid: true };
    } catch (error) {
      console.error('GL account validation error:', error);
      return { isValid: false, error: 'Failed to validate GL account' };
    }
  }

  /**
   * Validates inventory vs COGS selection based on business rules
   */
  static validateInventoryVsCOGS(glAccount: any, isInventoryItem: boolean, immediateConsumption: boolean): { isValid: boolean; error?: string } {
    const accountType = glAccount.accountType?.toLowerCase() || '';
    const accountName = glAccount.accountName?.toLowerCase() || '';

    const isInventoryAccount = accountType.includes('inventory') || accountName.includes('inventory') || accountName.includes('stock');
    const isCOGSAccount = accountType.includes('cogs') || accountType.includes('cost of goods sold') || accountName.includes('cogs');

    if (isInventoryAccount && isInventoryItem && !immediateConsumption) {
      // Correct: Inventory item going to inventory account
      return { isValid: true };
    }

    if (isCOGSAccount && isInventoryItem && immediateConsumption) {
      // Correct: Inventory item with immediate consumption going to COGS
      return { isValid: true };
    }

    if (isCOGSAccount && !isInventoryItem) {
      // Correct: Non-inventory expense going to COGS
      return { isValid: true };
    }

    if (!isInventoryAccount && !isCOGSAccount) {
      // Non-inventory/COGS account (e.g., OPEX, Fixed Assets) - always allowed
      return { isValid: true };
    }

    // Invalid combinations
    if (isInventoryAccount && !isInventoryItem) {
      return { 
        isValid: false, 
        error: 'Non-inventory items cannot be posted to inventory accounts. Use COGS or OPEX accounts instead.' 
      };
    }

    if (isInventoryAccount && isInventoryItem && immediateConsumption) {
      return { 
        isValid: false, 
        error: 'Inventory items with immediate consumption should be posted to COGS, not inventory accounts.' 
      };
    }

    if (isCOGSAccount && isInventoryItem && !immediateConsumption) {
      return { 
        isValid: false, 
        error: 'Inventory items should be posted to inventory accounts unless immediate consumption is enabled.' 
      };
    }

    return { isValid: true };
  }

  /**
   * Validates VAT code and calculates VAT amount
   */
  static async validateAndCalculateVAT(companyId: number, vatCodeId: number | null, lineTotal: number): Promise<{ 
    isValid: boolean; 
    vatRate: number; 
    vatAmount: number; 
    error?: string 
  }> {
    try {
      if (!vatCodeId) {
        return { isValid: true, vatRate: 0, vatAmount: 0 };
      }

      const vatCode = await db
        .select()
        .from(vatTypes)
        .where(and(
          eq(vatTypes.id, vatCodeId),
          eq(vatTypes.companyId, companyId)
        ))
        .limit(1);

      if (!vatCode.length) {
        return { isValid: false, vatRate: 0, vatAmount: 0, error: 'VAT code not found' };
      }

      const vat = vatCode[0];
      const vatRate = parseFloat(vat.rate || '0');
      const vatAmount = lineTotal * (vatRate / 100);

      return { 
        isValid: true, 
        vatRate, 
        vatAmount: parseFloat(vatAmount.toFixed(2)) 
      };
    } catch (error) {
      console.error('VAT validation error:', error);
      return { isValid: false, vatRate: 0, vatAmount: 0, error: 'Failed to validate VAT code' };
    }
  }

  /**
   * Validates that VAT control accounts are not used as line GL accounts
   */
  static isVATControlAccount(account: any): boolean {
    const accountType = account.accountType?.toLowerCase() || '';
    const accountName = account.accountName?.toLowerCase() || '';

    const vatControlPatterns = [
      'vat control', 'vat input', 'vat output', 'vat payable', 'vat receivable',
      'sales tax', 'input tax', 'output tax', 'tax control'
    ];

    return vatControlPatterns.some(pattern => 
      accountType.includes(pattern) || accountName.includes(pattern)
    );
  }

  /**
   * Validates complete bill line item
   */
  static async validateBillLineItem(companyId: number, lineItem: any): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      // 1. Validate GL account
      const glValidation = await this.validateGLAccount(companyId, lineItem.glAccountId);
      if (!glValidation.isValid) {
        errors.push(glValidation.error || 'Invalid GL account');
      }

      // 2. Get GL account details for further validation
      const glAccount = await db
        .select()
        .from(chartOfAccounts)
        .where(and(
          eq(chartOfAccounts.id, lineItem.glAccountId),
          eq(chartOfAccounts.companyId, companyId)
        ))
        .limit(1);

      if (glAccount.length) {
        const account = glAccount[0];

        // 3. Check for VAT control account usage
        if (this.isVATControlAccount(account)) {
          errors.push('VAT control accounts cannot be used as line GL accounts');
        }

        // 4. Validate inventory vs COGS selection
        const inventoryValidation = this.validateInventoryVsCOGS(
          account, 
          lineItem.isInventoryItem || false, 
          lineItem.immediateConsumption || false
        );
        if (!inventoryValidation.isValid) {
          errors.push(inventoryValidation.error || 'Invalid inventory/COGS selection');
        }
      }

      // 5. Validate VAT calculation
      const vatValidation = await this.validateAndCalculateVAT(
        companyId, 
        lineItem.vatCodeId, 
        parseFloat(lineItem.lineTotal || '0')
      );
      if (!vatValidation.isValid) {
        errors.push(vatValidation.error || 'Invalid VAT calculation');
      }

      // 6. Validate amounts
      if (parseFloat(lineItem.lineTotal || '0') <= 0) {
        errors.push('Line total must be greater than zero');
      }

      if (parseFloat(lineItem.quantity || '0') <= 0) {
        errors.push('Quantity must be greater than zero');
      }

      return { isValid: errors.length === 0, errors };
    } catch (error) {
      console.error('Bill line item validation error:', error);
      return { isValid: false, errors: ['Failed to validate bill line item'] };
    }
  }

  /**
   * Validates complete bill with all line items
   */
  static async validateBill(companyId: number, billData: any): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      // 1. Require at least one line item
      if (!billData.lineItems || !Array.isArray(billData.lineItems) || billData.lineItems.length === 0) {
        errors.push('Bills must have at least one line item');
      }

      // 2. Validate each line item
      if (billData.lineItems && Array.isArray(billData.lineItems)) {
        for (let i = 0; i < billData.lineItems.length; i++) {
          const lineItem = billData.lineItems[i];
          const lineValidation = await this.validateBillLineItem(companyId, lineItem);
          
          if (!lineValidation.isValid) {
            lineValidation.errors.forEach(error => {
              errors.push(`Line ${i + 1}: ${error}`);
            });
          }
        }
      }

      // 3. Validate bill totals
      if (parseFloat(billData.total || '0') <= 0) {
        errors.push('Bill total must be greater than zero');
      }

      return { isValid: errors.length === 0, errors };
    } catch (error) {
      console.error('Bill validation error:', error);
      return { isValid: false, errors: ['Failed to validate bill'] };
    }
  }
}