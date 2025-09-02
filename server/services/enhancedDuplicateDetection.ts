import { createHash } from 'crypto';
import { storage } from '../storage';
import type { 
  InsertTransactionFingerprint,
  TransactionFingerprint,
  TransactionStatus
} from '@shared/schema';

export interface TransactionData {
  transactionId: string;
  description: string;
  amount: number;
  transactionDate: Date;
  bankReference?: string;
}

export interface DuplicateDetectionResult {
  isDuplicate: boolean;
  duplicateCount: number;
  similarTransactions: TransactionFingerprint[];
  confidence: number;
  reasoning: string;
}

export interface BulkDuplicateResult {
  transaction: TransactionData;
  fingerprint: string;
  duplicateDetection: DuplicateDetectionResult;
}

/**
 * Enhanced Duplicate Detection Service
 * Prevents duplicate transaction imports across multiple bank statement uploads
 * Superior to QuickBooks with intelligent fingerprinting and cross-import validation
 */
export class EnhancedDuplicateDetectionService {
  
  /**
   * Generate a unique fingerprint for a transaction
   * Uses multiple data points to create a secure hash
   */
  generateTransactionFingerprint(transaction: TransactionData): string {
    // Normalize description by removing extra spaces, case differences, and common variations
    const normalizedDescription = this.normalizeDescription(transaction.description);
    
    // Format amount to 2 decimal places to handle minor formatting differences
    const normalizedAmount = Number(transaction.amount).toFixed(2);
    
    // Format date to YYYY-MM-DD to handle timezone differences
    const normalizedDate = transaction.transactionDate.toISOString().split('T')[0];
    
    // Create fingerprint string combining key identifying fields
    const fingerprintString = [
      normalizedDescription,
      normalizedAmount,
      normalizedDate,
      transaction.bankReference || ''
    ].join('|');
    
    // Return SHA-256 hash for security and uniqueness
    return createHash('sha256').update(fingerprintString, 'utf8').digest('hex');
  }

  /**
   * Normalize transaction description for more accurate matching
   */
  private normalizeDescription(description: string): string {
    return description
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ')              // Multiple spaces to single space
      .replace(/[^\w\s-]/g, '')         // Remove special characters except hyphens
      .replace(/\b(pmt|payment|transfer|txn)\b/g, 'payment')  // Standardize payment terms
      .replace(/\b(ref|reference|nr)\b/g, 'ref')              // Standardize reference terms
      .replace(/\s*-\s*/g, '-');        // Standardize hyphen spacing
  }

  /**
   * Check for duplicates of a single transaction
   */
  async detectDuplicate(
    transaction: TransactionData,
    companyId: number,
    excludeImportId?: number
  ): Promise<DuplicateDetectionResult> {
    const fingerprint = this.generateTransactionFingerprint(transaction);
    
    // Find existing transactions with the same fingerprint
    const duplicates = await storage.findDuplicatesByFingerprint(fingerprint, companyId);
    
    // Filter out the current import if specified
    const relevantDuplicates = excludeImportId 
      ? duplicates.filter(d => d.importId !== excludeImportId)
      : duplicates;

    const isDuplicate = relevantDuplicates.length > 0;
    const duplicateCount = relevantDuplicates.length;

    let confidence = 100; // Start with 100% confidence for exact fingerprint matches
    let reasoning = '';

    if (isDuplicate) {
      const mostRecent = relevantDuplicates[0];
      const daysDifference = Math.abs(
        (new Date().getTime() - mostRecent.transactionDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysDifference > 365) {
        // Reduce confidence for very old duplicates (might be recurring payments)
        confidence = Math.max(60, 100 - (daysDifference - 365) / 10);
        reasoning = `Potential duplicate found, but original transaction is ${Math.round(daysDifference)} days old. Could be recurring payment.`;
      } else {
        reasoning = `Exact duplicate detected. Same amount (R${transaction.amount}), description, and date found in ${duplicateCount} previous import(s).`;
      }
    } else {
      reasoning = 'No duplicates found. Transaction is unique.';
    }

    return {
      isDuplicate,
      duplicateCount,
      similarTransactions: relevantDuplicates,
      confidence,
      reasoning
    };
  }

  /**
   * Bulk duplicate detection for statement import processing
   */
  async bulkDetectDuplicates(
    transactions: TransactionData[],
    companyId: number,
    importId: number
  ): Promise<BulkDuplicateResult[]> {
    const results: BulkDuplicateResult[] = [];
    
    // Process each transaction
    for (const transaction of transactions) {
      const fingerprint = this.generateTransactionFingerprint(transaction);
      const duplicateDetection = await this.detectDuplicate(transaction, companyId, importId);
      
      results.push({
        transaction,
        fingerprint,
        duplicateDetection
      });
    }

    return results;
  }

  /**
   * Create fingerprints for a batch of transactions during import
   */
  async createTransactionFingerprints(
    transactions: TransactionData[],
    companyId: number,
    importId: number
  ): Promise<TransactionFingerprint[]> {
    const fingerprintData: InsertTransactionFingerprint[] = transactions.map(transaction => ({
      companyId,
      transactionId: transaction.transactionId,
      importId,
      fingerprint: this.generateTransactionFingerprint(transaction),
      description: transaction.description,
      amount: transaction.amount.toString(),
      transactionDate: transaction.transactionDate,
      bankReference: transaction.bankReference,
      isProcessed: false
    }));

    return await storage.batchCreateTransactionFingerprints(fingerprintData);
  }

  /**
   * Advanced similarity detection for potential duplicates that don't match exactly
   */
  async detectSimilarTransactions(
    transaction: TransactionData,
    companyId: number,
    similarityThreshold: number = 0.8
  ): Promise<{
    similarTransactions: TransactionFingerprint[];
    maxSimilarity: number;
  }> {
    // Get transactions from the same date range (±3 days) with similar amounts (±10%)
    const dateRange = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds
    const amountTolerance = transaction.amount * 0.1; // 10% tolerance
    
    const startDate = new Date(transaction.transactionDate.getTime() - dateRange);
    const endDate = new Date(transaction.transactionDate.getTime() + dateRange);
    
    const allFingerprints = await storage.getTransactionFingerprints(companyId);
    
    const similarTransactions: TransactionFingerprint[] = [];
    let maxSimilarity = 0;

    for (const fp of allFingerprints) {
      const fpDate = new Date(fp.transactionDate);
      const fpAmount = parseFloat(fp.amount);
      
      // Filter by date range and amount tolerance
      if (fpDate >= startDate && fpDate <= endDate) {
        const amountDiff = Math.abs(fpAmount - transaction.amount);
        if (amountDiff <= amountTolerance) {
          // Calculate text similarity using Levenshtein distance
          const similarity = this.calculateTextSimilarity(
            transaction.description,
            fp.description
          );
          
          if (similarity >= similarityThreshold) {
            similarTransactions.push(fp);
            maxSimilarity = Math.max(maxSimilarity, similarity);
          }
        }
      }
    }

    return { similarTransactions, maxSimilarity };
  }

  /**
   * Calculate text similarity using a simple Levenshtein distance algorithm
   */
  private calculateTextSimilarity(str1: string, str2: string): number {
    const normalized1 = this.normalizeDescription(str1);
    const normalized2 = this.normalizeDescription(str2);
    
    if (normalized1 === normalized2) return 1.0;
    
    const distance = this.levenshteinDistance(normalized1, normalized2);
    const maxLength = Math.max(normalized1.length, normalized2.length);
    
    return maxLength > 0 ? (maxLength - distance) / maxLength : 0;
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Get duplicate detection statistics for a company
   */
  async getDuplicateStatistics(companyId: number, fromDate?: Date, toDate?: Date): Promise<{
    totalFingerprints: number;
    duplicatesDetected: number;
    duplicateRate: number;
    topDuplicatePatterns: Array<{
      fingerprint: string;
      count: number;
      lastSeen: Date;
      description: string;
    }>;
  }> {
    const allFingerprints = await storage.getTransactionFingerprints(companyId);
    
    // Group by fingerprint to find duplicates
    const fingerprintGroups = new Map<string, TransactionFingerprint[]>();
    
    for (const fp of allFingerprints) {
      if (fromDate && fp.createdAt < fromDate) continue;
      if (toDate && fp.createdAt > toDate) continue;
      
      if (!fingerprintGroups.has(fp.fingerprint)) {
        fingerprintGroups.set(fp.fingerprint, []);
      }
      fingerprintGroups.get(fp.fingerprint)!.push(fp);
    }
    
    const duplicateGroups = Array.from(fingerprintGroups.entries())
      .filter(([_, transactions]) => transactions.length > 1)
      .map(([fingerprint, transactions]) => ({
        fingerprint,
        count: transactions.length,
        lastSeen: new Date(Math.max(...transactions.map(t => t.createdAt.getTime()))),
        description: transactions[0].description
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 duplicate patterns

    const totalFingerprints = fingerprintGroups.size;
    const duplicatesDetected = duplicateGroups.reduce((sum, group) => sum + (group.count - 1), 0);
    const duplicateRate = totalFingerprints > 0 ? (duplicatesDetected / allFingerprints.length) * 100 : 0;

    return {
      totalFingerprints,
      duplicatesDetected,
      duplicateRate: Math.round(duplicateRate * 100) / 100,
      topDuplicatePatterns: duplicateGroups
    };
  }
}

export const enhancedDuplicateDetection = new EnhancedDuplicateDetectionService();