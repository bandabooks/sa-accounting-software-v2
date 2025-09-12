/**
 * South African Banking Enhanced Reconciliation Service
 * 
 * Handles SA banking complexities including:
 * - Bank-specific settlement delays and processing windows
 * - Reference format variations across major SA banks
 * - Cross-bank transfer timing analysis
 * - SA-specific fee pattern recognition
 * - EFT vs immediate payment processing differences
 */

import type { ReconciliationStorage } from '../storage-adapters/reconciliation-storage';
import { duplicateDetectionService, type DuplicateMatch, type TransactionForDuplicateCheck } from './duplicateDetectionService';
import type { 
  ReconciliationSession, 
  TransactionMatch as EnhancedTransactionMatch, 
  SaBankingRule,
  CrossBankTransactionMap,
  SaBankingFeePattern,
  ReconciliationReviewQueue
} from '../../shared/schema';

export interface SABankingTransactionDetails {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: 'credit' | 'debit';
  bankName: string;
  accountNumber: string;
  reference?: string;
  rawData: any; // Original bank statement data
}

export interface SAReconciliationContext {
  companyId: number;
  bankAccounts: Array<{
    id: number;
    bankName: string;
    accountNumber: string;
    accountType: string;
  }>;
  reconciliationPeriod: {
    from: string;
    to: string;
  };
  preferences: {
    considerBankDelays: boolean;
    crossBankMatching: boolean;
    confidenceThreshold: number;
    autoApproveThreshold: number;
  };
}

export interface SAMatchingResult {
  transactionId: string;
  matchedTransactionId?: string;
  confidence: number;
  matchType: 'exact' | 'fuzzy' | 'cross_bank' | 'delayed' | 'fee_pattern' | 'partial';
  saSpecificFactors: {
    bankDelayConsidered: boolean;
    referenceFormatMatched: boolean;
    crossBankTransfer: boolean;
    immediatePayment: boolean;
    withinEftWindow: boolean;
    feePatternMatch: boolean;
  };
  timeline: {
    expectedSettlementTime: Date;
    actualSettlementTime?: Date;
    delayReason?: string;
    withinNormalWindow: boolean;
  };
  reasoning: string;
  alternativeMatches: Array<{
    transactionId: string;
    confidence: number;
    reason: string;
  }>;
}

export interface SABankConfig {
  bankName: string;
  eftProcessingWindow: {
    start: string; // "08:00"
    end: string;   // "16:30"
    timezone: string;
    excludeWeekends: boolean;
    excludeHolidays: boolean;
  };
  settlementDelays: {
    sameBank: number; // hours
    crossBank: number; // hours
    immediate: number; // hours
  };
  referencePatterns: {
    internalTransfer: RegExp[];
    externalTransfer: RegExp[];
    payment: RegExp[];
    fee: RegExp[];
  };
  feePatterns: Array<{
    type: string;
    pattern: RegExp;
    expectedAmount?: number;
    frequency: 'monthly' | 'per_transaction' | 'daily';
  }>;
}

export class SAReconciliationService {
  private storage: ReconciliationStorage;
  private bankConfigurations: Map<string, SABankConfig>;

  constructor(storage: ReconciliationStorage) {
    this.storage = storage;
    this.bankConfigurations = new Map();
    this.initializeBankConfigurations();
  }

  /**
   * Initialize bank-specific configurations for major SA banks
   */
  private initializeBankConfigurations(): void {
    // FNB Configuration
    this.bankConfigurations.set('FNB', {
      bankName: 'FNB',
      eftProcessingWindow: {
        start: '08:00',
        end: '16:30',
        timezone: 'Africa/Johannesburg',
        excludeWeekends: true,
        excludeHolidays: true
      },
      settlementDelays: {
        sameBank: 1,    // 1 hour for FNB to FNB
        crossBank: 24,  // 24 hours for FNB to other banks
        immediate: 0    // Instant payments
      },
      referencePatterns: {
        internalTransfer: [/FNB.?ONLINE/i, /CELLPHONE.?BANKING/i],
        externalTransfer: [/EFT.?OUT/i, /PAYMENT.?TO/i],
        payment: [/CARD.?PAYMENT/i, /POS/i],
        fee: [/MONTHLY.?FEE/i, /TRANSACTION.?FEE/i, /EFT.?FEE/i]
      },
      feePatterns: [
        { type: 'monthly_admin', pattern: /MONTHLY.?ADMIN.?FEE/i, expectedAmount: 69, frequency: 'monthly' },
        { type: 'eft_fee', pattern: /EFT.?FEE/i, expectedAmount: 7.5, frequency: 'per_transaction' },
        { type: 'card_fee', pattern: /CARD.?FEE/i, frequency: 'per_transaction' }
      ]
    });

    // ABSA Configuration
    this.bankConfigurations.set('ABSA', {
      bankName: 'ABSA',
      eftProcessingWindow: {
        start: '08:30',
        end: '16:00',
        timezone: 'Africa/Johannesburg',
        excludeWeekends: true,
        excludeHolidays: true
      },
      settlementDelays: {
        sameBank: 2,    // 2 hours for ABSA to ABSA
        crossBank: 48,  // 48 hours for ABSA to other banks
        immediate: 0
      },
      referencePatterns: {
        internalTransfer: [/ABSA.?ONLINE/i, /INTERNET.?BANKING/i],
        externalTransfer: [/ELECTRONIC.?TRANSFER/i, /EXT.?PAYMENT/i],
        payment: [/DEBIT.?ORDER/i, /CARD.?PURCHASE/i],
        fee: [/ADMIN.?FEE/i, /TRANSACTION.?CHARGE/i]
      },
      feePatterns: [
        { type: 'monthly_admin', pattern: /MONTHLY.?ADMIN/i, expectedAmount: 75, frequency: 'monthly' },
        { type: 'transaction_fee', pattern: /TRANSACTION.?FEE/i, frequency: 'per_transaction' }
      ]
    });

    // Standard Bank Configuration  
    this.bankConfigurations.set('Standard Bank', {
      bankName: 'Standard Bank',
      eftProcessingWindow: {
        start: '08:00',
        end: '17:00',
        timezone: 'Africa/Johannesburg',
        excludeWeekends: true,
        excludeHolidays: true
      },
      settlementDelays: {
        sameBank: 1,
        crossBank: 24,
        immediate: 0
      },
      referencePatterns: {
        internalTransfer: [/STD.?BANK/i, /ONLINE.?BANKING/i],
        externalTransfer: [/PAYMENT.?ORDER/i, /BENEFICIARY.?PAYMENT/i],
        payment: [/CARD.?PAYMENT/i, /DEBIT.?CARD/i],
        fee: [/BANK.?CHARGES/i, /SERVICE.?FEE/i]
      },
      feePatterns: [
        { type: 'monthly_fee', pattern: /MONTHLY.?BANK.?FEE/i, expectedAmount: 65, frequency: 'monthly' },
        { type: 'eft_charge', pattern: /EFT.?CHARGE/i, frequency: 'per_transaction' }
      ]
    });

    // Nedbank Configuration
    this.bankConfigurations.set('Nedbank', {
      bankName: 'Nedbank',
      eftProcessingWindow: {
        start: '08:15',
        end: '16:45',
        timezone: 'Africa/Johannesburg',
        excludeWeekends: true,
        excludeHolidays: true
      },
      settlementDelays: {
        sameBank: 2,
        crossBank: 36,
        immediate: 0
      },
      referencePatterns: {
        internalTransfer: [/NEDBANK.?ONLINE/i, /MONEY.?TRANSFER/i],
        externalTransfer: [/EXTERNAL.?PAYMENT/i, /INTER.?BANK/i],
        payment: [/CARD.?TRANSACTION/i, /PAYMENT/i],
        fee: [/ACCOUNT.?FEE/i, /TRANSACTION.?COST/i]
      },
      feePatterns: [
        { type: 'account_fee', pattern: /ACCOUNT.?MAINTENANCE/i, expectedAmount: 70, frequency: 'monthly' },
        { type: 'transfer_fee', pattern: /TRANSFER.?FEE/i, frequency: 'per_transaction' }
      ]
    });

    // Capitec Configuration
    this.bankConfigurations.set('Capitec', {
      bankName: 'Capitec',
      eftProcessingWindow: {
        start: '08:00',
        end: '18:00',
        timezone: 'Africa/Johannesburg',
        excludeWeekends: true,
        excludeHolidays: true
      },
      settlementDelays: {
        sameBank: 0.5,  // 30 minutes for Capitec to Capitec
        crossBank: 24,
        immediate: 0
      },
      referencePatterns: {
        internalTransfer: [/CAPITEC.?ONLINE/i, /LIVE.?BETTER/i],
        externalTransfer: [/PAYMENT.?TO/i, /TRANSFER.?OUT/i],
        payment: [/CARD.?SWIPE/i, /POS.?PURCHASE/i],
        fee: [/MONTHLY.?FEE/i, /TRANSACT.?FEE/i]
      },
      feePatterns: [
        { type: 'monthly_fee', pattern: /MONTHLY.?FEE/i, expectedAmount: 5.5, frequency: 'monthly' },
        { type: 'transact_fee', pattern: /TRANSACT.?FEE/i, frequency: 'per_transaction' }
      ]
    });

    console.log(`🏦 Initialized ${this.bankConfigurations.size} SA bank configurations`);
  }

  /**
   * Enhanced reconciliation with SA banking intelligence
   */
  async performSAReconciliation(
    transactions: SABankingTransactionDetails[],
    context: SAReconciliationContext
  ): Promise<{
    matches: SAMatchingResult[];
    reviewQueue: Array<{
      transaction: SABankingTransactionDetails;
      reason: string;
      complexity: number;
      suggestedAction: string;
    }>;
    crossBankMaps: CrossBankTransactionMap[];
    feeAnalysis: {
      identifiedFees: Array<{
        transactionId: string;
        feeType: string;
        confidence: number;
        expectedAmount?: number;
      }>;
      unusualFees: Array<{
        transactionId: string;
        reason: string;
      }>;
    };
    statistics: {
      totalProcessed: number;
      autoMatched: number;
      requiresReview: number;
      highConfidence: number;
      crossBankTransfers: number;
      feesIdentified: number;
    };
  }> {
    console.log(`🚀 Starting SA Banking reconciliation for ${transactions.length} transactions`);

    // Step 1: Load SA banking rules and fee patterns for this company
    const saBankingRules = await this.loadSABankingRules(context.companyId);
    const feePatterns = await this.loadSAFeePatterns(context.companyId);

    // Step 2: Analyze transaction timing and banking windows
    const timingAnalysis = await this.analyzeTransactionTiming(transactions, context);

    // Step 3: Perform enhanced duplicate detection with SA-specific patterns
    const duplicateResults = await this.performSADuplicateDetection(transactions);

    // Step 4: Cross-bank transaction mapping
    const crossBankMaps = await this.mapCrossBankTransactions(transactions, context);

    // Step 5: Fee pattern recognition and analysis
    const feeAnalysis = await this.analyzeFeePatterns(transactions, feePatterns);

    // Step 6: Enhanced matching with SA banking intelligence
    const matches = await this.performEnhancedMatching(
      transactions, 
      context, 
      timingAnalysis, 
      duplicateResults,
      saBankingRules
    );

    // Step 7: Build review queue for complex cases
    const reviewQueue = await this.buildReviewQueue(transactions, matches, context);

    // Step 8: Generate statistics
    const statistics = this.generateReconciliationStatistics(matches, reviewQueue, crossBankMaps, feeAnalysis);

    console.log(`✅ SA Banking reconciliation completed: ${statistics.autoMatched}/${statistics.totalProcessed} auto-matched`);

    return {
      matches,
      reviewQueue,
      crossBankMaps,
      feeAnalysis,
      statistics
    };
  }

  /**
   * Analyze transaction timing against SA banking windows
   */
  private async analyzeTransactionTiming(
    transactions: SABankingTransactionDetails[],
    context: SAReconciliationContext
  ): Promise<Map<string, {
    withinEftWindow: boolean;
    expectedDelay: number;
    isImmediate: boolean;
    businessDay: boolean;
  }>> {
    const timingMap = new Map();

    for (const transaction of transactions) {
      const bankConfig = this.bankConfigurations.get(transaction.bankName);
      
      if (!bankConfig) {
        console.warn(`⚠️ No configuration found for bank: ${transaction.bankName}`);
        continue;
      }

      const transactionTime = new Date(transaction.date);
      const analysis = {
        withinEftWindow: this.isWithinEftWindow(transactionTime, bankConfig),
        expectedDelay: this.calculateExpectedDelay(transaction, bankConfig),
        isImmediate: this.isImmediatePayment(transaction, bankConfig),
        businessDay: this.isBusinessDay(transactionTime)
      };

      timingMap.set(transaction.id, analysis);
    }

    return timingMap;
  }

  /**
   * Check if transaction is within EFT processing window
   */
  private isWithinEftWindow(transactionTime: Date, bankConfig: SABankConfig): boolean {
    const hour = transactionTime.getHours();
    const minute = transactionTime.getMinutes();
    const timeInMinutes = hour * 60 + minute;

    const [startHour, startMinute] = bankConfig.eftProcessingWindow.start.split(':').map(Number);
    const [endHour, endMinute] = bankConfig.eftProcessingWindow.end.split(':').map(Number);
    
    const windowStart = startHour * 60 + startMinute;
    const windowEnd = endHour * 60 + endMinute;

    if (bankConfig.eftProcessingWindow.excludeWeekends) {
      const dayOfWeek = transactionTime.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) return false; // Sunday or Saturday
    }

    return timeInMinutes >= windowStart && timeInMinutes <= windowEnd;
  }

  /**
   * Calculate expected settlement delay
   */
  private calculateExpectedDelay(transaction: SABankingTransactionDetails, bankConfig: SABankConfig): number {
    if (this.isImmediatePayment(transaction, bankConfig)) {
      return bankConfig.settlementDelays.immediate;
    }

    // Check if it's a cross-bank transaction
    if (this.isCrossBankTransaction(transaction)) {
      return bankConfig.settlementDelays.crossBank;
    }

    return bankConfig.settlementDelays.sameBank;
  }

  /**
   * Detect immediate payment methods
   */
  private isImmediatePayment(transaction: SABankingTransactionDetails, bankConfig: SABankConfig): boolean {
    const immediatePatterns = [
      /INSTANT.?PAY/i,
      /REAL.?TIME/i,
      /IMMEDIATE/i,
      /CASH.?SEND/i,
      /ZAPPER/i,
      /SNAPSCAN/i,
      /PAYFAST/i
    ];

    return immediatePatterns.some(pattern => pattern.test(transaction.description));
  }

  /**
   * Detect cross-bank transactions
   */
  private isCrossBankTransaction(transaction: SABankingTransactionDetails): boolean {
    const crossBankPatterns = [
      /EFT.?OUT/i,
      /EXTERNAL.?PAYMENT/i,
      /INTER.?BANK/i,
      /PAYMENT.?TO/i,
      /BENEFICIARY/i
    ];

    return crossBankPatterns.some(pattern => pattern.test(transaction.description));
  }

  /**
   * Check if date is a business day
   */
  private isBusinessDay(date: Date): boolean {
    const dayOfWeek = date.getDay();
    return dayOfWeek >= 1 && dayOfWeek <= 5; // Monday to Friday
  }

  /**
   * Enhanced duplicate detection with SA banking patterns
   */
  private async performSADuplicateDetection(
    transactions: SABankingTransactionDetails[]
  ): Promise<DuplicateMatch[]> {
    // Convert to format expected by duplicate detection service
    const transactionsForCheck: TransactionForDuplicateCheck[] = transactions.map(t => ({
      id: t.id,
      description: t.description,
      amount: Math.abs(t.amount),
      date: t.date,
      type: t.type,
      reference: t.reference,
      companyId: 0 // Will be set by context
    }));

    // Use enhanced options for SA banking
    const saOptions = {
      descriptionThreshold: 0.75, // Slightly lower due to SA bank format variations
      amountTolerancePercent: 1,  // Tighter tolerance for SA banks
      dateRangeDays: 5,           // Account for SA banking delays
      highConfidenceThreshold: 0.9,
      mediumConfidenceThreshold: 0.7,
      enableFuzzyMatching: true,
      enablePatternMatching: true,
      enableAmountDateMatching: true,
      maxComparisons: 15000
    };

    return await duplicateDetectionService.findDuplicates(transactionsForCheck, [], saOptions);
  }

  /**
   * Map cross-bank transactions for comprehensive reconciliation
   */
  private async mapCrossBankTransactions(
    transactions: SABankingTransactionDetails[],
    context: SAReconciliationContext
  ): Promise<CrossBankTransactionMap[]> {
    const crossBankMaps: CrossBankTransactionMap[] = [];
    const outgoingTransactions = transactions.filter(t => t.type === 'debit' && this.isCrossBankTransaction(t));
    const incomingTransactions = transactions.filter(t => t.type === 'credit');

    for (const outgoing of outgoingTransactions) {
      const sourceBank = outgoing.bankName;
      const sourceConfig = this.bankConfigurations.get(sourceBank);
      
      if (!sourceConfig) continue;

      // Look for matching incoming transactions within expected timeframe
      const expectedDelay = sourceConfig.settlementDelays.crossBank;
      const outgoingTime = new Date(outgoing.date);
      const maxSettlementTime = new Date(outgoingTime.getTime() + expectedDelay * 60 * 60 * 1000);

      const potentialMatches = incomingTransactions.filter(incoming => {
        const incomingTime = new Date(incoming.date);
        return (
          Math.abs(incoming.amount) === Math.abs(outgoing.amount) &&
          incomingTime >= outgoingTime &&
          incomingTime <= maxSettlementTime &&
          incoming.bankName !== outgoing.bankName
        );
      });

      for (const match of potentialMatches) {
        const actualDelay = (new Date(match.date).getTime() - outgoingTime.getTime()) / (1000 * 60 * 60);
        
        crossBankMaps.push({
          id: 0, // Will be set by database
          companyId: context.companyId,
          primaryTransactionId: outgoing.id,
          primaryBankAccountId: null, // Will be resolved from context
          primaryBankName: outgoing.bankName,
          secondaryTransactionId: match.id,
          secondaryBankAccountId: null, // Will be resolved from context
          secondaryBankName: match.bankName,
          transferType: 'external_transfer',
          transferAmount: outgoing.amount.toString(),
          transferReference: outgoing.reference || '',
          expectedDelayHours: expectedDelay,
          actualDelayHours: Math.round(actualDelay),
          withinExpectedWindow: actualDelay <= expectedDelay,
          mappingStatus: actualDelay <= expectedDelay ? 'mapped' : 'failed',
          confidenceScore: this.calculateCrossBankConfidence(outgoing, match, actualDelay, expectedDelay),
          mappingMethod: 'amount_timing',
          primaryTransactionDate: outgoingTime,
          secondaryTransactionDate: new Date(match.date),
          mappedAt: new Date(),
          mappedBy: null, // Automated mapping
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }

    return crossBankMaps;
  }

  /**
   * Calculate confidence score for cross-bank mapping
   */
  private calculateCrossBankConfidence(
    outgoing: SABankingTransactionDetails,
    incoming: SABankingTransactionDetails,
    actualDelay: number,
    expectedDelay: number
  ): string {
    let confidence = 0.7; // Base confidence

    // Perfect amount match
    if (Math.abs(outgoing.amount) === Math.abs(incoming.amount)) {
      confidence += 0.2;
    }

    // Timing within expected window
    if (actualDelay <= expectedDelay) {
      confidence += 0.1;
    }

    // Reference matching
    if (outgoing.reference && incoming.reference && 
        this.referencesMatch(outgoing.reference, incoming.reference)) {
      confidence += 0.1;
    }

    return Math.min(0.99, confidence).toFixed(2);
  }

  /**
   * Check if references match with SA banking variations
   */
  private referencesMatch(ref1: string, ref2: string): boolean {
    if (!ref1 || !ref2) return false;
    
    // Clean references for comparison
    const clean1 = ref1.replace(/[^A-Za-z0-9]/g, '').toLowerCase();
    const clean2 = ref2.replace(/[^A-Za-z0-9]/g, '').toLowerCase();
    
    return clean1.includes(clean2) || clean2.includes(clean1);
  }

  /**
   * Analyze fee patterns using SA banking intelligence
   */
  private async analyzeFeePatterns(
    transactions: SABankingTransactionDetails[],
    feePatterns: SaBankingFeePattern[]
  ): Promise<{
    identifiedFees: Array<{
      transactionId: string;
      feeType: string;
      confidence: number;
      expectedAmount?: number;
    }>;
    unusualFees: Array<{
      transactionId: string;
      reason: string;
    }>;
  }> {
    const identifiedFees = [];
    const unusualFees = [];

    for (const transaction of transactions) {
      const bankConfig = this.bankConfigurations.get(transaction.bankName);
      
      if (!bankConfig || transaction.type !== 'debit') continue;

      // Check against bank-specific fee patterns
      for (const feePattern of bankConfig.feePatterns) {
        if (feePattern.pattern.test(transaction.description)) {
          const confidence = feePattern.expectedAmount 
            ? Math.max(0, 1 - Math.abs(Math.abs(transaction.amount) - feePattern.expectedAmount) / feePattern.expectedAmount)
            : 0.7;

          identifiedFees.push({
            transactionId: transaction.id,
            feeType: feePattern.type,
            confidence,
            expectedAmount: feePattern.expectedAmount
          });

          // Check for unusual fee amounts
          if (feePattern.expectedAmount && 
              Math.abs(Math.abs(transaction.amount) - feePattern.expectedAmount) > feePattern.expectedAmount * 0.2) {
            unusualFees.push({
              transactionId: transaction.id,
              reason: `Fee amount (R${Math.abs(transaction.amount)}) differs significantly from expected (R${feePattern.expectedAmount})`
            });
          }
        }
      }
    }

    return { identifiedFees, unusualFees };
  }

  /**
   * Perform enhanced matching with SA banking intelligence
   */
  private async performEnhancedMatching(
    transactions: SABankingTransactionDetails[],
    context: SAReconciliationContext,
    timingAnalysis: Map<string, any>,
    duplicateResults: DuplicateMatch[],
    saBankingRules: SaBankingRule[]
  ): Promise<SAMatchingResult[]> {
    const matches: SAMatchingResult[] = [];

    for (const transaction of transactions) {
      const timing = timingAnalysis.get(transaction.id);
      const duplicateMatch = duplicateResults.find(d => 
        d.transactionId === transaction.id || d.matchedTransactionId === transaction.id
      );

      // Build SA-specific matching result
      const match: SAMatchingResult = {
        transactionId: transaction.id,
        matchedTransactionId: duplicateMatch?.matchedTransactionId,
        confidence: duplicateMatch?.confidence || 0,
        matchType: this.determineSAMatchType(transaction, duplicateMatch, timing),
        saSpecificFactors: {
          bankDelayConsidered: timing?.expectedDelay > 0,
          referenceFormatMatched: this.checkReferenceFormat(transaction),
          crossBankTransfer: this.isCrossBankTransaction(transaction),
          immediatePayment: timing?.isImmediate || false,
          withinEftWindow: timing?.withinEftWindow || false,
          feePatternMatch: this.isFeeTransaction(transaction)
        },
        timeline: {
          expectedSettlementTime: this.calculateExpectedSettlementTime(transaction, timing),
          withinNormalWindow: timing?.businessDay && timing?.withinEftWindow
        },
        reasoning: this.generateSAMatchingReasoning(transaction, duplicateMatch, timing),
        alternativeMatches: []
      };

      matches.push(match);
    }

    return matches;
  }

  /**
   * Determine SA-specific match type
   */
  private determineSAMatchType(
    transaction: SABankingTransactionDetails,
    duplicateMatch?: DuplicateMatch,
    timing?: any
  ): SAMatchingResult['matchType'] {
    if (duplicateMatch?.confidence >= 0.95) return 'exact';
    if (this.isFeeTransaction(transaction)) return 'fee_pattern';
    if (this.isCrossBankTransaction(transaction)) return 'cross_bank';
    if (timing?.expectedDelay > 24) return 'delayed';
    if (duplicateMatch?.confidence >= 0.7) return 'fuzzy';
    return 'partial';
  }

  /**
   * Generate SA-specific matching reasoning
   */
  private generateSAMatchingReasoning(
    transaction: SABankingTransactionDetails,
    duplicateMatch?: DuplicateMatch,
    timing?: any
  ): string {
    const reasons = [];

    if (duplicateMatch) {
      reasons.push(`${duplicateMatch.reason} (${(duplicateMatch.confidence * 100).toFixed(1)}% confidence)`);
    }

    if (timing?.isImmediate) {
      reasons.push('Immediate payment detected');
    } else if (timing?.expectedDelay > 0) {
      reasons.push(`Expected ${timing.expectedDelay}h settlement delay for ${transaction.bankName}`);
    }

    if (!timing?.withinEftWindow && !timing?.isImmediate) {
      reasons.push('Transaction outside normal EFT processing hours');
    }

    if (this.isCrossBankTransaction(transaction)) {
      reasons.push('Cross-bank transfer with extended settlement window');
    }

    return reasons.length > 0 ? reasons.join('; ') : 'Standard transaction processing';
  }

  /**
   * Check if transaction matches SA bank reference formats
   */
  private checkReferenceFormat(transaction: SABankingTransactionDetails): boolean {
    const bankConfig = this.bankConfigurations.get(transaction.bankName);
    if (!bankConfig || !transaction.reference) return false;

    return Object.values(bankConfig.referencePatterns)
      .flat()
      .some(pattern => pattern.test(transaction.description));
  }

  /**
   * Check if transaction is a fee
   */
  private isFeeTransaction(transaction: SABankingTransactionDetails): boolean {
    const bankConfig = this.bankConfigurations.get(transaction.bankName);
    if (!bankConfig) return false;

    return bankConfig.feePatterns.some(pattern => 
      pattern.pattern.test(transaction.description)
    );
  }

  /**
   * Calculate expected settlement time
   */
  private calculateExpectedSettlementTime(
    transaction: SABankingTransactionDetails,
    timing?: any
  ): Date {
    const transactionTime = new Date(transaction.date);
    const delayHours = timing?.expectedDelay || 0;
    
    return new Date(transactionTime.getTime() + delayHours * 60 * 60 * 1000);
  }

  /**
   * Build review queue for complex reconciliation cases
   */
  private async buildReviewQueue(
    transactions: SABankingTransactionDetails[],
    matches: SAMatchingResult[],
    context: SAReconciliationContext
  ): Promise<Array<{
    transaction: SABankingTransactionDetails;
    reason: string;
    complexity: number;
    suggestedAction: string;
  }>> {
    const reviewQueue = [];

    for (const transaction of transactions) {
      const match = matches.find(m => m.transactionId === transaction.id);
      
      if (!match) continue;

      let needsReview = false;
      let reviewReason = '';
      let complexity = 0;
      let suggestedAction = 'approve';

      // Low confidence matches
      if (match.confidence < context.preferences.confidenceThreshold) {
        needsReview = true;
        reviewReason = `Low confidence match (${(match.confidence * 100).toFixed(1)}%)`;
        complexity += 0.3;
        suggestedAction = 'manual_match';
      }

      // Cross-bank transfers outside normal window
      if (match.saSpecificFactors.crossBankTransfer && !match.timeline.withinNormalWindow) {
        needsReview = true;
        reviewReason += reviewReason ? '; ' : '';
        reviewReason += 'Cross-bank transfer outside normal processing window';
        complexity += 0.4;
      }

      // Large amounts
      if (Math.abs(transaction.amount) > 10000) {
        needsReview = true;
        reviewReason += reviewReason ? '; ' : '';
        reviewReason += 'Large transaction amount requires verification';
        complexity += 0.2;
      }

      // Unusual fee patterns
      if (match.matchType === 'fee_pattern' && match.confidence < 0.8) {
        needsReview = true;
        reviewReason += reviewReason ? '; ' : '';
        reviewReason += 'Unusual fee pattern detected';
        complexity += 0.3;
        suggestedAction = 'reject';
      }

      if (needsReview) {
        reviewQueue.push({
          transaction,
          reason: reviewReason,
          complexity,
          suggestedAction
        });
      }
    }

    // Sort by complexity (highest first)
    return reviewQueue.sort((a, b) => b.complexity - a.complexity);
  }

  /**
   * Generate comprehensive reconciliation statistics
   */
  private generateReconciliationStatistics(
    matches: SAMatchingResult[],
    reviewQueue: any[],
    crossBankMaps: CrossBankTransactionMap[],
    feeAnalysis: any
  ) {
    const autoMatched = matches.filter(m => m.confidence >= 0.9).length;
    const highConfidence = matches.filter(m => m.confidence >= 0.8).length;
    const crossBankTransfers = matches.filter(m => m.saSpecificFactors.crossBankTransfer).length;

    return {
      totalProcessed: matches.length,
      autoMatched,
      requiresReview: reviewQueue.length,
      highConfidence,
      crossBankTransfers,
      feesIdentified: feeAnalysis.identifiedFees.length
    };
  }

  /**
   * Load SA banking rules for a company
   */
  private async loadSABankingRules(companyId: number): Promise<SaBankingRule[]> {
    try {
      return await this.storage.getSaBankingRules(companyId);
    } catch (error) {
      console.warn('Failed to load SA banking rules:', error);
      return [];
    }
  }

  /**
   * Load SA fee patterns for a company
   */
  private async loadSAFeePatterns(companyId: number): Promise<SaBankingFeePattern[]> {
    try {
      return await this.storage.getSaBankingFeePatterns(companyId);
    } catch (error) {
      console.warn('Failed to load SA fee patterns:', error);
      return [];
    }
  }
}

export const saReconciliationService = new SAReconciliationService(
  {} as IStorage // Will be injected when used
);