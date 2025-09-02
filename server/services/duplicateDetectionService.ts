/**
 * Advanced Duplicate Detection Service with Fuzzy Matching
 * 
 * Features:
 * - Fuzzy string matching for descriptions
 * - Amount tolerance matching
 * - Date range matching
 * - Intelligent confidence scoring
 * - Multiple detection algorithms
 */

export interface DuplicateMatch {
  transactionId: string;
  matchedTransactionId: string;
  confidence: number;
  matchType: 'exact' | 'fuzzy_description' | 'amount_date' | 'pattern_based';
  similarities: {
    descriptionSimilarity: number;
    amountSimilarity: number;
    dateSimilarity: number;
    overallScore: number;
  };
  reason: string;
}

export interface DuplicateDetectionOptions {
  // String matching thresholds
  descriptionThreshold: number;      // 0-1, higher = more strict
  amountTolerancePercent: number;    // Percentage tolerance for amount differences
  dateRangeDays: number;             // Days range for date matching
  
  // Confidence thresholds
  highConfidenceThreshold: number;   // Above this = likely duplicate
  mediumConfidenceThreshold: number; // Above this = possible duplicate
  
  // Detection modes
  enableFuzzyMatching: boolean;
  enablePatternMatching: boolean;
  enableAmountDateMatching: boolean;
  
  // Performance settings
  maxComparisons: number;            // Limit comparisons for large datasets
}

export interface TransactionForDuplicateCheck {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: 'credit' | 'debit';
  reference?: string;
  companyId: number;
}

export class DuplicateDetectionService {
  private readonly defaultOptions: DuplicateDetectionOptions = {
    descriptionThreshold: 0.8,
    amountTolerancePercent: 2,
    dateRangeDays: 3,
    highConfidenceThreshold: 0.9,
    mediumConfidenceThreshold: 0.7,
    enableFuzzyMatching: true,
    enablePatternMatching: true,
    enableAmountDateMatching: true,
    maxComparisons: 10000
  };

  /**
   * Find potential duplicates in a set of transactions
   */
  async findDuplicates(
    transactions: TransactionForDuplicateCheck[],
    existingTransactions: TransactionForDuplicateCheck[] = [],
    options: Partial<DuplicateDetectionOptions> = {}
  ): Promise<DuplicateMatch[]> {
    const opts = { ...this.defaultOptions, ...options };
    const duplicates: DuplicateMatch[] = [];
    
    console.log(`🔍 Starting duplicate detection for ${transactions.length} new transactions against ${existingTransactions.length} existing transactions`);

    // Combine all transactions for comparison
    const allTransactions = [...existingTransactions, ...transactions];
    
    // Create comparison pairs
    const comparisons = this.createComparisonPairs(transactions, allTransactions, opts.maxComparisons);
    
    console.log(`📊 Created ${comparisons.length} comparison pairs`);

    // Process comparisons
    for (const { transaction, candidate } of comparisons) {
      if (transaction.id === candidate.id) continue;
      
      const match = this.compareTransactions(transaction, candidate, opts);
      
      if (match && match.confidence >= opts.mediumConfidenceThreshold) {
        duplicates.push(match);
      }
    }

    // Sort by confidence score (highest first)
    duplicates.sort((a, b) => b.confidence - a.confidence);
    
    // Remove duplicate matches (where transaction A matches B and B matches A)
    const uniqueDuplicates = this.deduplicateMatches(duplicates);

    console.log(`🎯 Found ${uniqueDuplicates.length} potential duplicates`);
    
    return uniqueDuplicates;
  }

  /**
   * Compare two transactions for similarity
   */
  private compareTransactions(
    transaction: TransactionForDuplicateCheck,
    candidate: TransactionForDuplicateCheck,
    options: DuplicateDetectionOptions
  ): DuplicateMatch | null {
    // Skip if different types (credit vs debit)
    if (transaction.type !== candidate.type) {
      return null;
    }

    // Calculate individual similarities
    const descriptionSimilarity = this.calculateDescriptionSimilarity(
      transaction.description, 
      candidate.description
    );
    
    const amountSimilarity = this.calculateAmountSimilarity(
      transaction.amount, 
      candidate.amount, 
      options.amountTolerancePercent
    );
    
    const dateSimilarity = this.calculateDateSimilarity(
      transaction.date, 
      candidate.date, 
      options.dateRangeDays
    );

    // Determine match type and calculate overall score
    let matchType: DuplicateMatch['matchType'] = 'exact';
    let overallScore = 0;
    let reason = '';

    // Exact match
    if (descriptionSimilarity === 1 && amountSimilarity === 1 && dateSimilarity >= 0.8) {
      matchType = 'exact';
      overallScore = 1.0;
      reason = 'Exact match on description and amount';
    }
    // Fuzzy description match
    else if (descriptionSimilarity >= options.descriptionThreshold && amountSimilarity >= 0.95) {
      matchType = 'fuzzy_description';
      overallScore = (descriptionSimilarity * 0.6) + (amountSimilarity * 0.3) + (dateSimilarity * 0.1);
      reason = `High description similarity (${(descriptionSimilarity * 100).toFixed(1)}%) with matching amount`;
    }
    // Amount and date match
    else if (amountSimilarity === 1 && dateSimilarity >= 0.8) {
      matchType = 'amount_date';
      overallScore = (amountSimilarity * 0.5) + (dateSimilarity * 0.3) + (descriptionSimilarity * 0.2);
      reason = 'Exact amount match with similar date';
    }
    // Pattern-based match
    else if (this.isPatternBasedMatch(transaction, candidate)) {
      matchType = 'pattern_based';
      overallScore = (descriptionSimilarity * 0.4) + (amountSimilarity * 0.4) + (dateSimilarity * 0.2);
      reason = 'Similar transaction pattern detected';
    }
    // No significant match
    else {
      return null;
    }

    // Apply minimum confidence threshold
    if (overallScore < options.mediumConfidenceThreshold) {
      return null;
    }

    return {
      transactionId: transaction.id,
      matchedTransactionId: candidate.id,
      confidence: overallScore,
      matchType,
      similarities: {
        descriptionSimilarity,
        amountSimilarity,
        dateSimilarity,
        overallScore
      },
      reason
    };
  }

  /**
   * Calculate description similarity using multiple algorithms
   */
  private calculateDescriptionSimilarity(desc1: string, desc2: string): number {
    if (!desc1 || !desc2) return 0;

    const cleaned1 = this.cleanDescription(desc1);
    const cleaned2 = this.cleanDescription(desc2);

    // Exact match after cleaning
    if (cleaned1 === cleaned2) return 1;

    // Calculate different similarity metrics
    const jaccardSim = this.jaccardSimilarity(cleaned1, cleaned2);
    const levenshteinSim = this.levenshteinSimilarity(cleaned1, cleaned2);
    const cosineSim = this.cosineSimilarity(cleaned1, cleaned2);
    
    // Weighted average of similarity metrics
    return (jaccardSim * 0.4) + (levenshteinSim * 0.3) + (cosineSim * 0.3);
  }

  /**
   * Calculate amount similarity with tolerance
   */
  private calculateAmountSimilarity(amount1: number, amount2: number, tolerancePercent: number): number {
    if (amount1 === amount2) return 1;
    
    const tolerance = Math.abs(amount1) * (tolerancePercent / 100);
    const difference = Math.abs(amount1 - amount2);
    
    if (difference <= tolerance) {
      // Linear similarity within tolerance
      return Math.max(0, 1 - (difference / tolerance));
    }
    
    return 0;
  }

  /**
   * Calculate date similarity
   */
  private calculateDateSimilarity(date1: string, date2: string, maxDaysDifference: number): number {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 0;
    
    const daysDifference = Math.abs((d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDifference === 0) return 1;
    if (daysDifference > maxDaysDifference) return 0;
    
    // Linear decay
    return Math.max(0, 1 - (daysDifference / maxDaysDifference));
  }

  /**
   * Clean transaction description for comparison
   */
  private cleanDescription(description: string): string {
    return description
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')  // Remove punctuation
      .replace(/\s+/g, ' ')      // Normalize whitespace
      .replace(/\b(payment|transfer|deposit|withdrawal|txn|transaction)\b/g, '') // Remove common words
      .replace(/\b\d{4,}\b/g, '') // Remove long numbers (reference numbers)
      .replace(/\b(to|from|ref|reference)\b/g, '') // Remove prepositions
      .trim();
  }

  /**
   * Jaccard similarity (set intersection / set union)
   */
  private jaccardSimilarity(str1: string, str2: string): number {
    const set1 = new Set(str1.split(' ').filter(w => w.length > 2));
    const set2 = new Set(str2.split(' ').filter(w => w.length > 2));
    
    const intersection = new Set(Array.from(set1).filter(x => set2.has(x)));
    const union = new Set([...Array.from(set1), ...Array.from(set2)]);
    
    return union.size === 0 ? 0 : intersection.size / union.size;
  }

  /**
   * Levenshtein similarity (edit distance)
   */
  private levenshteinSimilarity(str1: string, str2: string): number {
    const distance = this.levenshteinDistance(str1, str2);
    const maxLength = Math.max(str1.length, str2.length);
    
    return maxLength === 0 ? 1 : 1 - (distance / maxLength);
  }

  /**
   * Levenshtein distance calculation
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,        // deletion
          matrix[j - 1][i] + 1,        // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Cosine similarity using TF-IDF
   */
  private cosineSimilarity(str1: string, str2: string): number {
    const words1 = str1.split(' ').filter(w => w.length > 1);
    const words2 = str2.split(' ').filter(w => w.length > 1);
    
    const allWords = Array.from(new Set([...words1, ...words2]));
    
    if (allWords.length === 0) return 0;

    const vector1 = allWords.map(word => words1.filter(w => w === word).length);
    const vector2 = allWords.map(word => words2.filter(w => w === word).length);

    const dotProduct = vector1.reduce((sum, a, idx) => sum + a * vector2[idx], 0);
    const magnitude1 = Math.sqrt(vector1.reduce((sum, a) => sum + a * a, 0));
    const magnitude2 = Math.sqrt(vector2.reduce((sum, a) => sum + a * a, 0));

    return magnitude1 && magnitude2 ? dotProduct / (magnitude1 * magnitude2) : 0;
  }

  /**
   * Check for pattern-based matches (recurring transactions)
   */
  private isPatternBasedMatch(
    transaction: TransactionForDuplicateCheck,
    candidate: TransactionForDuplicateCheck
  ): boolean {
    // Check for recurring payment patterns
    const recurring_patterns = [
      /salary|payroll|wage/i,
      /rent|rental|lease/i,
      /insurance|premium/i,
      /subscription|membership/i,
      /utility|electricity|water|gas/i,
      /loan|mortgage|repayment/i
    ];

    const desc1 = transaction.description.toLowerCase();
    const desc2 = candidate.description.toLowerCase();

    return recurring_patterns.some(pattern => 
      pattern.test(desc1) && pattern.test(desc2)
    );
  }

  /**
   * Create efficient comparison pairs
   */
  private createComparisonPairs(
    newTransactions: TransactionForDuplicateCheck[],
    allTransactions: TransactionForDuplicateCheck[],
    maxComparisons: number
  ): Array<{ transaction: TransactionForDuplicateCheck; candidate: TransactionForDuplicateCheck }> {
    const pairs = [];
    
    for (const transaction of newTransactions) {
      // Sort candidates by potential similarity (amount proximity + date proximity)
      const candidates = allTransactions
        .filter(t => t.id !== transaction.id && t.type === transaction.type)
        .map(candidate => ({
          candidate,
          priority: this.calculateComparisonPriority(transaction, candidate)
        }))
        .sort((a, b) => b.priority - a.priority)
        .slice(0, Math.ceil(maxComparisons / newTransactions.length))
        .map(item => item.candidate);

      for (const candidate of candidates) {
        pairs.push({ transaction, candidate });
      }
    }

    return pairs.slice(0, maxComparisons);
  }

  /**
   * Calculate priority for comparison (performance optimization)
   */
  private calculateComparisonPriority(
    transaction: TransactionForDuplicateCheck,
    candidate: TransactionForDuplicateCheck
  ): number {
    // Prioritize by amount similarity and date proximity
    const amountDiff = Math.abs(transaction.amount - candidate.amount);
    const amountScore = Math.max(0, 1 - (amountDiff / Math.max(transaction.amount, candidate.amount)));
    
    const dateScore = this.calculateDateSimilarity(transaction.date, candidate.date, 30);
    
    return (amountScore * 0.6) + (dateScore * 0.4);
  }

  /**
   * Remove duplicate matches
   */
  private deduplicateMatches(matches: DuplicateMatch[]): DuplicateMatch[] {
    const seen = new Set<string>();
    const uniqueMatches = [];

    for (const match of matches) {
      // Create a consistent key regardless of order
      const key1 = `${match.transactionId}-${match.matchedTransactionId}`;
      const key2 = `${match.matchedTransactionId}-${match.transactionId}`;
      
      if (!seen.has(key1) && !seen.has(key2)) {
        seen.add(key1);
        seen.add(key2);
        uniqueMatches.push(match);
      }
    }

    return uniqueMatches;
  }

  /**
   * Batch duplicate detection for large datasets
   */
  async detectDuplicatesInBatches(
    transactions: TransactionForDuplicateCheck[],
    existingTransactions: TransactionForDuplicateCheck[] = [],
    batchSize: number = 100,
    options: Partial<DuplicateDetectionOptions> = {}
  ): Promise<DuplicateMatch[]> {
    const allMatches: DuplicateMatch[] = [];
    
    console.log(`🔄 Processing ${transactions.length} transactions in batches of ${batchSize}`);

    for (let i = 0; i < transactions.length; i += batchSize) {
      const batch = transactions.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(transactions.length / batchSize)}`);
      
      const batchMatches = await this.findDuplicates(batch, existingTransactions, options);
      allMatches.push(...batchMatches);
      
      // Small delay to prevent overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    return this.deduplicateMatches(allMatches);
  }

  /**
   * Get duplicate detection statistics
   */
  generateDetectionStats(matches: DuplicateMatch[], options: DuplicateDetectionOptions): {
    totalDuplicates: number;
    highConfidenceMatches: number;
    mediumConfidenceMatches: number;
    byMatchType: Record<string, number>;
    averageConfidence: number;
  } {
    const stats = {
      totalDuplicates: matches.length,
      highConfidenceMatches: matches.filter(m => m.confidence >= options.highConfidenceThreshold).length,
      mediumConfidenceMatches: matches.filter(m => 
        m.confidence >= options.mediumConfidenceThreshold && 
        m.confidence < options.highConfidenceThreshold
      ).length,
      byMatchType: {} as Record<string, number>,
      averageConfidence: matches.reduce((sum, m) => sum + m.confidence, 0) / (matches.length || 1)
    };

    // Count by match type
    for (const match of matches) {
      stats.byMatchType[match.matchType] = (stats.byMatchType[match.matchType] || 0) + 1;
    }

    return stats;
  }
}

// Export singleton instance
export const duplicateDetectionService = new DuplicateDetectionService();