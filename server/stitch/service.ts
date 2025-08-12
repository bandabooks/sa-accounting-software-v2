/**
 * Stitch Service
 * Business logic for Stitch bank feed integration
 */

import { stitchClient, type StitchAccount, type StitchTransaction, type StitchLinkSuccess } from './client';
import { DatabaseStorage } from '../storage';
import { 
  type BankAccount, 
  type InsertBankAccount, 
  type BankTransaction, 
  type InsertBankTransaction,
  type BankFeedCursor,
  type InsertBankFeedCursor 
} from '@shared/schema';

interface CreateLinkTokenOptions {
  companyId: number;
  userId: number;
}

interface ExchangeLinkOptions {
  userId: string;
  accounts: StitchAccount[];
  companyId: number;
}

interface SyncAccountsOptions {
  bankAccountId: number;
  companyId: number;
}

interface SyncTransactionsOptions {
  bankAccountId: number;
  companyId: number;
  forceFullSync?: boolean;
}

export class StitchService {
  private storage: DatabaseStorage;

  constructor(storage: DatabaseStorage) {
    this.storage = storage;
  }

  /**
   * Create a client token for Stitch Link
   */
  async createLinkToken(options: CreateLinkTokenOptions): Promise<string> {
    try {
      const clientToken = await stitchClient.createClientToken({
        userId: `${options.companyId}-${options.userId}`,
        permissions: ['accounts', 'transactions'],
        redirectUri: `${process.env.APP_BASE_URL || 'http://localhost:5000'}/api/stitch/callback`,
      });

      console.log(`Created Stitch Link token for company ${options.companyId}, user ${options.userId}`);
      return clientToken;
    } catch (error) {
      console.error('Failed to create Stitch Link token:', error);
      throw new Error('Failed to create bank link session. Please try again.');
    }
  }

  /**
   * Exchange Link success for account connections
   */
  async exchangeLinkSuccess(options: ExchangeLinkOptions): Promise<BankAccount[]> {
    try {
      const createdAccounts: BankAccount[] = [];

      for (const stitchAccount of options.accounts) {
        // Check if account already exists
        const existingAccount = await this.storage.getBankAccountByProvider(
          options.companyId,
          'stitch',
          stitchAccount.id
        );

        if (existingAccount) {
          console.log(`Account ${stitchAccount.id} already linked, skipping`);
          continue;
        }

        // Create new bank account
        const bankAccountData: InsertBankAccount = {
          companyId: options.companyId,
          accountName: stitchAccount.name || stitchAccount.officialName,
          bankName: stitchAccount.institution.name,
          accountNumber: this.maskAccountNumber(stitchAccount.accountNumber),
          branchCode: null,
          accountType: this.mapAccountType(stitchAccount.accountType),
          currency: stitchAccount.currency,
          currentBalance: stitchAccount.balance.quantity,
          externalProvider: 'stitch',
          providerAccountId: stitchAccount.id,
          institutionName: stitchAccount.institution.name,
          lastSyncAt: new Date(),
        };

        const createdAccount = await this.storage.createBankAccount(bankAccountData);

        // Create bank feed cursor
        const cursorData: InsertBankFeedCursor = {
          companyId: options.companyId,
          bankAccountId: createdAccount.id,
          provider: 'stitch',
          externalAccountId: stitchAccount.id,
          txnCursor: null,
          lastSyncAt: new Date(),
        };

        await this.storage.createBankFeedCursor(cursorData);

        createdAccounts.push(createdAccount);
        console.log(`Created bank account ${createdAccount.id} for Stitch account ${stitchAccount.id}`);
      }

      return createdAccounts;
    } catch (error) {
      console.error('Failed to exchange Link success:', error);
      throw new Error('Failed to connect bank accounts. Please try again.');
    }
  }

  /**
   * Sync account metadata from Stitch
   */
  async syncAccounts(options: SyncAccountsOptions): Promise<void> {
    try {
      const bankAccount = await this.storage.getBankAccount(options.bankAccountId);
      if (!bankAccount || bankAccount.companyId !== options.companyId) {
        throw new Error('Bank account not found');
      }

      if (bankAccount.externalProvider !== 'stitch' || !bankAccount.providerAccountId) {
        throw new Error('Account is not linked to Stitch');
      }

      // Fetch latest account data from Stitch
      const stitchAccount = await stitchClient.getAccount(bankAccount.providerAccountId);

      // Update local account data
      await this.storage.updateBankAccount(options.bankAccountId, {
        accountName: stitchAccount.name || stitchAccount.officialName,
        bankName: stitchAccount.institution.name,
        currentBalance: stitchAccount.balance.quantity,
        institutionName: stitchAccount.institution.name,
        lastSyncAt: new Date(),
      });

      console.log(`Synced account metadata for bank account ${options.bankAccountId}`);
    } catch (error) {
      console.error('Failed to sync account metadata:', error);
      throw new Error('Failed to sync account information');
    }
  }

  /**
   * Sync transactions from Stitch
   */
  async syncTransactions(options: SyncTransactionsOptions): Promise<{
    newTransactions: number;
    duplicatesSkipped: number;
  }> {
    try {
      const bankAccount = await this.storage.getBankAccount(options.bankAccountId);
      if (!bankAccount || bankAccount.companyId !== options.companyId) {
        throw new Error('Bank account not found');
      }

      if (bankAccount.externalProvider !== 'stitch' || !bankAccount.providerAccountId) {
        throw new Error('Account is not linked to Stitch');
      }

      // Get sync cursor
      let cursor = await this.storage.getBankFeedCursor(
        options.companyId,
        options.bankAccountId,
        'stitch',
        bankAccount.providerAccountId
      );

      if (!cursor) {
        // Create cursor if it doesn't exist
        const cursorData: InsertBankFeedCursor = {
          companyId: options.companyId,
          bankAccountId: options.bankAccountId,
          provider: 'stitch',
          externalAccountId: bankAccount.providerAccountId,
          txnCursor: null,
          lastSyncAt: new Date(),
        };
        cursor = await this.storage.createBankFeedCursor(cursorData);
      }

      let newTransactions = 0;
      let duplicatesSkipped = 0;
      let hasMorePages = true;
      let currentCursor = options.forceFullSync ? null : cursor.txnCursor;

      // Sync transactions in pages
      while (hasMorePages) {
        const result = await stitchClient.getTransactions(bankAccount.providerAccountId, {
          cursor: currentCursor,
          limit: 100,
        });

        for (const stitchTxn of result.transactions) {
          const isDuplicate = await this.checkTransactionDuplicate(
            options.companyId,
            options.bankAccountId,
            stitchTxn
          );

          if (isDuplicate) {
            duplicatesSkipped++;
            continue;
          }

          // Map Stitch transaction to our format
          const transactionData: InsertBankTransaction = {
            companyId: options.companyId,
            bankAccountId: options.bankAccountId,
            transactionDate: new Date(stitchTxn.date),
            postingDate: stitchTxn.date,
            description: stitchTxn.description,
            normalizedDescription: this.normalizeDescription(stitchTxn.description),
            reference: stitchTxn.reference || null,
            externalId: stitchTxn.id,
            transactionType: parseFloat(stitchTxn.amount.quantity) >= 0 ? 'credit' : 'debit',
            debitAmount: parseFloat(stitchTxn.amount.quantity) < 0 ? Math.abs(parseFloat(stitchTxn.amount.quantity)).toString() : '0.00',
            creditAmount: parseFloat(stitchTxn.amount.quantity) >= 0 ? stitchTxn.amount.quantity : '0.00',
            amount: stitchTxn.amount.quantity,
            balance: stitchTxn.runningBalance?.quantity || null,
            status: this.mapTransactionStatus(stitchTxn.status),
            source: 'feed',
            isDuplicate: false,
            reconciled: false,
          };

          await this.storage.createBankTransaction(transactionData);
          newTransactions++;
        }

        // Update cursor and check for more pages
        if (result.pageInfo.hasNextPage && result.pageInfo.endCursor) {
          currentCursor = result.pageInfo.endCursor;
        } else {
          hasMorePages = false;
        }
      }

      // Update sync cursor
      await this.storage.updateBankFeedCursor(cursor.id, {
        txnCursor: currentCursor,
        lastSyncAt: new Date(),
      });

      // Update bank account last sync time
      await this.storage.updateBankAccount(options.bankAccountId, {
        lastSyncAt: new Date(),
      });

      console.log(`Synced ${newTransactions} new transactions for bank account ${options.bankAccountId}, skipped ${duplicatesSkipped} duplicates`);

      return {
        newTransactions,
        duplicatesSkipped,
      };
    } catch (error) {
      console.error('Failed to sync transactions:', error);
      throw new Error('Failed to sync bank transactions');
    }
  }

  /**
   * Check if a transaction is a duplicate
   */
  private async checkTransactionDuplicate(
    companyId: number,
    bankAccountId: number,
    stitchTransaction: StitchTransaction
  ): Promise<boolean> {
    // First check by external ID (most reliable)
    if (stitchTransaction.id) {
      const existingByExternalId = await this.storage.getBankTransactionByExternalId(
        companyId,
        bankAccountId,
        stitchTransaction.id
      );
      if (existingByExternalId) {
        return true;
      }
    }

    // Fallback to ±3 day window matching
    const postingDate = new Date(stitchTransaction.date);
    const fromDate = new Date(postingDate);
    fromDate.setDate(fromDate.getDate() - 3);
    const toDate = new Date(postingDate);
    toDate.setDate(toDate.getDate() + 3);

    const normalizedDescription = this.normalizeDescription(stitchTransaction.description);

    const duplicates = await this.storage.findDuplicateBankTransactions(
      companyId,
      bankAccountId,
      fromDate.toISOString().split('T')[0],
      toDate.toISOString().split('T')[0],
      stitchTransaction.amount.quantity,
      normalizedDescription
    );

    return duplicates.length > 0;
  }

  /**
   * Normalize transaction description for duplicate detection
   */
  private normalizeDescription(description: string): string {
    return description
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s]/g, ''); // Remove special characters
  }

  /**
   * Map Stitch account type to our account type
   */
  private mapAccountType(stitchAccountType: string): string {
    const typeMap: Record<string, string> = {
      'current': 'current',
      'savings': 'savings',
      'credit': 'credit',
      'loan': 'loan',
      'checking': 'current',
    };

    return typeMap[stitchAccountType.toLowerCase()] || 'current';
  }

  /**
   * Map Stitch transaction status to our status
   */
  private mapTransactionStatus(stitchStatus: string): string {
    const statusMap: Record<string, string> = {
      'posted': 'cleared',
      'pending': 'pending',
      'settled': 'cleared',
    };

    return statusMap[stitchStatus.toLowerCase()] || 'pending';
  }

  /**
   * Mask account number for security (show last 4 digits)
   */
  private maskAccountNumber(accountNumber: string): string {
    if (accountNumber.length <= 4) {
      return accountNumber;
    }
    return `****${accountNumber.slice(-4)}`;
  }

  /**
   * Get linked accounts for a company
   */
  async getLinkedAccounts(companyId: number): Promise<BankAccount[]> {
    return await this.storage.getLinkedBankAccounts(companyId, 'stitch');
  }

  /**
   * Get sync status for all linked accounts
   */
  async getSyncStatus(companyId: number): Promise<Array<{
    bankAccount: BankAccount;
    cursor: BankFeedCursor;
    lastSyncDuration?: number;
  }>> {
    const linkedAccounts = await this.getLinkedAccounts(companyId);
    const results = [];

    for (const account of linkedAccounts) {
      const cursor = await this.storage.getBankFeedCursor(
        companyId,
        account.id,
        'stitch',
        account.providerAccountId!
      );

      if (cursor) {
        results.push({
          bankAccount: account,
          cursor,
        });
      }
    }

    return results;
  }
}

export const stitchService = new StitchService(new DatabaseStorage());