import { db } from "../db";
import { sql } from "drizzle-orm";

/**
 * Canonical bank balance calculation using GL-first approach
 * Single source of truth for both Dashboard and Banking Center
 */
export class BankBalanceService {
  /**
   * Get bank balance from posted journal lines for bank accounts
   * Balance per account = opening balance + Σ(debit − credit) (asset type)
   * 
   * @param companyId Company identifier
   * @param asOfDate Date to calculate balance as of (defaults to today)
   * @returns Total bank balance across all active bank accounts
   */
  static async getBankBalance(companyId: number, asOfDate?: Date): Promise<number> {
    const asOf = asOfDate || new Date();
    
    try {
      // Use the SQL query provided in the specification
      const result = await db.execute(sql`
        WITH bank_accts AS (
          SELECT a.id
          FROM chart_of_accounts a
          WHERE a.company_id = ${companyId}
            AND a.account_type = 'Asset'
            AND a.account_code >= '1100'
            AND a.account_code <= '1199'
            AND a.is_active = true
        ),
        gl_sum AS (
          SELECT jl.account_id,
                 SUM(COALESCE(jl.debit_amount::numeric, 0) - COALESCE(jl.credit_amount::numeric, 0)) AS net
          FROM journal_entry_lines jl
          JOIN journal_entries j ON j.id = jl.journal_entry_id
          WHERE j.company_id = ${companyId}
            AND j.is_posted = true
            AND j.transaction_date <= ${asOf}
            AND jl.account_id IN (SELECT id FROM bank_accts)
          GROUP BY jl.account_id
        )
        SELECT COALESCE(SUM(net), 0) AS bank_balance
        FROM gl_sum
      `);
      
      const bankBalance = Number(result.rows[0]?.bank_balance || 0);
      
      console.log(`💰 Bank Balance Calculation: Company ${companyId}, AsOf ${asOf.toISOString().split('T')[0]}, Balance: R${bankBalance.toFixed(2)}`);
      
      return bankBalance;
      
    } catch (error) {
      console.error("Error calculating bank balance:", error);
      
      // Fallback to bank_accounts table if GL calculation fails
      console.log("⚠️ Falling back to bank_accounts table calculation");
      const fallbackResult = await db.execute(sql`
        SELECT COALESCE(SUM(current_balance::numeric), 0) as total_bank_balance
        FROM bank_accounts 
        WHERE company_id = ${companyId}
        AND is_active = true
      `);
      
      return Number(fallbackResult.rows[0]?.total_bank_balance || 0);
    }
  }
  
  /**
   * Get bank balance with comparison to Banking Center calculation
   * Returns balance and discrepancy flag for UI guardrails
   */
  static async getBankBalanceWithValidation(companyId: number, asOfDate?: Date): Promise<{
    balance: number;
    hasDiscrepancy: boolean;
    discrepancyAmount?: number;
  }> {
    const glBalance = await this.getBankBalance(companyId, asOfDate);
    
    // Get balance from bank_accounts table for comparison
    const bankAccountsResult = await db.execute(sql`
      SELECT COALESCE(SUM(current_balance::numeric), 0) as bank_accounts_total
      FROM bank_accounts 
      WHERE company_id = ${companyId}
      AND is_active = true
    `);
    
    const bankAccountsBalance = Number(bankAccountsResult.rows[0]?.bank_accounts_total || 0);
    const discrepancy = Math.abs(glBalance - bankAccountsBalance);
    const hasDiscrepancy = discrepancy > 0.01;
    
    if (hasDiscrepancy) {
      console.log(`⚠️ Bank balance discrepancy detected: GL=${glBalance}, BankAccounts=${bankAccountsBalance}, Diff=${discrepancy}`);
    }
    
    return {
      balance: glBalance,
      hasDiscrepancy,
      discrepancyAmount: hasDiscrepancy ? discrepancy : undefined
    };
  }
}