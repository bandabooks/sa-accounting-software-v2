/**
 * User Correction Learning Service
 * 
 * This service captures user corrections to AI matching decisions and uses them
 * to improve future matching accuracy through machine learning techniques.
 * 
 * Features:
 * - Capture user feedback on AI suggestions
 * - Learn patterns from corrections
 * - Improve matching confidence scores
 * - Generate custom matching rules
 * - Track improvement metrics
 */

import type { IStorage } from '../storage';

export interface UserCorrection {
  id: string;
  companyId: number;
  userId: number;
  transactionId: string;
  originalSuggestion: {
    accountId: number;
    accountName: string;
    confidence: number;
    reasoning: string;
  };
  userCorrection: {
    accountId: number;
    accountName: string;
    reason?: string;
  };
  transactionData: {
    description: string;
    amount: number;
    date: string;
    type: 'credit' | 'debit';
    reference?: string;
  };
  correctionType: 'wrong_account' | 'wrong_category' | 'split_needed' | 'new_rule' | 'other';
  timestamp: Date;
  processed: boolean;
}

export interface LearningPattern {
  id: string;
  companyId: number;
  pattern: string;
  accountId: number;
  accountName: string;
  confidence: number;
  supportingCorrections: number;
  contradictingCorrections: number;
  accuracy: number;
  lastUpdated: Date;
  isActive: boolean;
}

export interface MatchingRule {
  id: string;
  companyId: number;
  ruleName: string;
  conditions: {
    descriptionContains?: string[];
    descriptionRegex?: string;
    amountRange?: { min: number; max: number };
    transactionType?: 'credit' | 'debit';
    dateRange?: { startDate: string; endDate: string };
    customConditions?: Record<string, any>;
  };
  action: {
    accountId: number;
    accountName: string;
    confidence: number;
  };
  priority: number;
  createdFrom: 'user_correction' | 'manual' | 'pattern_analysis';
  isActive: boolean;
  createdAt: Date;
  lastUsed?: Date;
  usageCount: number;
  accuracy: number;
}

export interface LearningMetrics {
  totalCorrections: number;
  improvementRate: number;
  accuracyTrend: Array<{ date: string; accuracy: number }>;
  topMistakes: Array<{ pattern: string; count: number }>;
  rulesGenerated: number;
  rulesAccuracy: number;
}

export class UserCorrectionLearningService {
  constructor(private storage: IStorage) {}

  /**
   * Capture a user correction
   */
  async captureUserCorrection(correction: Omit<UserCorrection, 'id' | 'timestamp' | 'processed'>): Promise<UserCorrection> {
    const userCorrection: UserCorrection = {
      ...correction,
      id: `correction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      processed: false
    };

    console.log(`📝 Capturing user correction: ${correction.transactionData.description} → ${correction.userCorrection.accountName}`);

    // Store the correction
    await this.storage.storeUserCorrection(userCorrection);
    
    // Process the correction immediately for real-time learning
    await this.processCorrection(userCorrection);

    // Update metrics
    await this.updateLearningMetrics(correction.companyId);

    return userCorrection;
  }

  /**
   * Process a user correction to extract learning patterns
   */
  async processCorrection(correction: UserCorrection): Promise<void> {
    console.log(`🧠 Processing correction for learning: ${correction.transactionData.description}`);

    try {
      // Extract patterns from the transaction description
      const patterns: string[] = this.extractPatterns(correction.transactionData.description);
      
      // Update existing patterns or create new ones
      for (const pattern of patterns) {
        await this.updateOrCreatePattern(correction, pattern);
      }

      // Generate matching rules if confidence is high enough
      if (await this.shouldGenerateRule(correction)) {
        await this.generateMatchingRule(correction);
      }

      // Mark correction as processed
      await this.storage.markCorrectionAsProcessed(correction.id);
      
      console.log(`✅ Successfully processed correction for transaction: ${correction.transactionData.description}`);

    } catch (error) {
      console.error('Error processing user correction:', error);
    }
  }

  /**
   * Extract meaningful patterns from transaction descriptions
   */
  private extractPatterns(description: string): string[] {
    const patterns = new Set<string>();
    const cleanDescription = description.toLowerCase().trim();

    // Extract key words (3+ characters, not common words)
    const words = cleanDescription
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => 
        word.length >= 3 && 
        !this.isCommonWord(word) &&
        !this.isNumericPattern(word)
      );

    // Single significant words
    words.forEach(word => {
      if (this.isSignificantWord(word)) {
        patterns.add(word);
      }
    });

    // Two-word combinations
    for (let i = 0; i < words.length - 1; i++) {
      const bigram = `${words[i]} ${words[i + 1]}`;
      if (this.isSignificantPattern(bigram)) {
        patterns.add(bigram);
      }
    }

    // Extract known business patterns
    const businessPatterns = this.extractBusinessPatterns(cleanDescription);
    businessPatterns.forEach(pattern => patterns.add(pattern));

    return Array.from(patterns).slice(0, 10); // Limit to top 10 patterns
  }

  /**
   * Check if a word is common and should be ignored
   */
  private isCommonWord(word: string): boolean {
    const commonWords = new Set([
      'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
      'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before',
      'after', 'above', 'below', 'between', 'among', 'payment', 'transfer',
      'deposit', 'withdrawal', 'transaction', 'txn', 'ref', 'reference',
      'app', 'online', 'mobile', 'web', 'service', 'fee', 'charge'
    ]);
    return commonWords.has(word);
  }

  /**
   * Check if a pattern is numeric
   */
  private isNumericPattern(word: string): boolean {
    return /^\d+$/.test(word) || /^[0-9]+[a-zA-Z]*$/.test(word);
  }

  /**
   * Check if a word is significant for pattern matching
   */
  private isSignificantWord(word: string): boolean {
    // Business-related terms are significant
    const significantPatterns = [
      /salary|wage|payroll/,
      /rent|rental|lease/,
      /insurance|medical|health/,
      /grocery|food|restaurant/,
      /fuel|petrol|gas/,
      /electricity|water|utilities/,
      /internet|phone|communication/,
      /subscription|membership/,
      /loan|mortgage|credit/,
      /tax|sars|revenue/,
      /supplier|vendor|contractor/,
      /bank|atm|pos/
    ];

    return significantPatterns.some(pattern => pattern.test(word));
  }

  /**
   * Check if a pattern combination is significant
   */
  private isSignificantPattern(pattern: string): boolean {
    return pattern.length > 6 && !this.isNumericPattern(pattern);
  }

  /**
   * Extract known business patterns
   */
  private extractBusinessPatterns(description: string): string[] {
    const patterns = [];
    
    // Common South African business patterns
    const saPatterns = [
      { regex: /fnb\s+app/i, pattern: 'fnb_app' },
      { regex: /standard\s+bank/i, pattern: 'standard_bank' },
      { regex: /absa\s+online/i, pattern: 'absa_online' },
      { regex: /capitec\s+app/i, pattern: 'capitec_app' },
      { regex: /eft\s+debit/i, pattern: 'eft_debit' },
      { regex: /pos\s+purchase/i, pattern: 'pos_purchase' },
      { regex: /atm\s+withdrawal/i, pattern: 'atm_withdrawal' },
      { regex: /debit\s+order/i, pattern: 'debit_order' },
      { regex: /salary\s+transfer/i, pattern: 'salary_transfer' },
      { regex: /medical\s+aid/i, pattern: 'medical_aid' }
    ];

    saPatterns.forEach(({ regex, pattern }) => {
      if (regex.test(description)) {
        patterns.push(pattern);
      }
    });

    return patterns;
  }

  /**
   * Update existing pattern or create new one
   */
  private async updateOrCreatePattern(correction: UserCorrection, pattern: string): Promise<void> {
    const existingPattern = await this.storage.findLearningPattern(
      correction.companyId, 
      pattern, 
      correction.userCorrection.accountId
    );

    if (existingPattern) {
      // Update existing pattern
      existingPattern.supportingCorrections++;
      existingPattern.accuracy = this.calculatePatternAccuracy(existingPattern);
      existingPattern.lastUpdated = new Date();
      
      await this.storage.updateLearningPattern(existingPattern);
    } else {
      // Create new pattern
      const newPattern: LearningPattern = {
        id: `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        companyId: correction.companyId,
        pattern,
        accountId: correction.userCorrection.accountId,
        accountName: correction.userCorrection.accountName,
        confidence: 0.7, // Start with moderate confidence
        supportingCorrections: 1,
        contradictingCorrections: 0,
        accuracy: 1.0,
        lastUpdated: new Date(),
        isActive: true
      };

      await this.storage.storeLearningPattern(newPattern);
    }
  }

  /**
   * Calculate accuracy for a pattern
   */
  private calculatePatternAccuracy(pattern: LearningPattern): number {
    const total = pattern.supportingCorrections + pattern.contradictingCorrections;
    return total > 0 ? pattern.supportingCorrections / total : 1.0;
  }

  /**
   * Determine if we should generate a matching rule
   */
  private async shouldGenerateRule(correction: UserCorrection): Promise<boolean> {
    // Check if there are enough supporting corrections for this pattern
    const patterns: string[] = this.extractPatterns(correction.transactionData.description);
    
    for (const pattern of patterns) {
      const existingPattern = await this.storage.findLearningPattern(
        correction.companyId,
        pattern,
        correction.userCorrection.accountId
      );

      if (existingPattern && 
          existingPattern.supportingCorrections >= 3 && 
          existingPattern.accuracy >= 0.8) {
        return true;
      }
    }

    return false;
  }

  /**
   * Generate a matching rule from user corrections
   */
  private async generateMatchingRule(correction: UserCorrection): Promise<void> {
    const patterns = this.extractPatterns(correction.transactionData.description);
    const primaryPattern = patterns[0]; // Use the first (most significant) pattern

    if (!primaryPattern) return;

    // Check if rule already exists
    const existingRule = await this.storage.findMatchingRuleByPattern(
      correction.companyId,
      primaryPattern
    );

    if (existingRule) return; // Don't create duplicate rules

    const rule: MatchingRule = {
      id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      companyId: correction.companyId,
      ruleName: `Auto-generated: ${primaryPattern}`,
      conditions: {
        descriptionContains: [primaryPattern],
        transactionType: correction.transactionData.type
      },
      action: {
        accountId: correction.userCorrection.accountId,
        accountName: correction.userCorrection.accountName,
        confidence: 0.85
      },
      priority: 100, // Medium priority
      createdFrom: 'user_correction',
      isActive: true,
      createdAt: new Date(),
      usageCount: 0,
      accuracy: 1.0
    };

    await this.storage.storeMatchingRule(rule);
    
    console.log(`🎯 Generated new matching rule: ${rule.ruleName} → ${rule.action.accountName}`);
  }

  /**
   * Apply learned patterns to improve matching
   */
  async applyLearning(
    companyId: number,
    transactionDescription: string,
    originalSuggestions: Array<{ accountId: number; accountName: string; confidence: number }>
  ): Promise<Array<{ accountId: number; accountName: string; confidence: number; reason: string }>> {
    const patterns = this.extractPatterns(transactionDescription);
    const enhancedSuggestions = [...originalSuggestions];

    // Check matching rules first
    const rules = await this.storage.getActiveMatchingRules(companyId);
    
    for (const rule of rules) {
      if (this.doesTransactionMatchRule(transactionDescription, rule)) {
        // Boost confidence for rule-matched accounts
        const existingIndex = enhancedSuggestions.findIndex(s => s.accountId === rule.action.accountId);
        
        if (existingIndex >= 0) {
          enhancedSuggestions[existingIndex].confidence = Math.min(
            1.0, 
            enhancedSuggestions[existingIndex].confidence + 0.2
          );
        } else {
          enhancedSuggestions.push({
            accountId: rule.action.accountId,
            accountName: rule.action.accountName,
            confidence: rule.action.confidence
          });
        }

        // Update rule usage
        await this.updateRuleUsage(rule.id);
      }
    }

    // Apply pattern-based learning
    for (const pattern of patterns) {
      const learningPatterns = await this.storage.findLearningPatternsByPattern(companyId, pattern);
      
      for (const learningPattern of learningPatterns) {
        if (learningPattern.accuracy >= 0.7 && learningPattern.isActive) {
          const existingIndex = enhancedSuggestions.findIndex(s => s.accountId === learningPattern.accountId);
          
          if (existingIndex >= 0) {
            // Boost existing suggestion
            enhancedSuggestions[existingIndex].confidence = Math.min(
              1.0,
              enhancedSuggestions[existingIndex].confidence + (learningPattern.accuracy * 0.15)
            );
          } else {
            // Add new suggestion based on learning
            enhancedSuggestions.push({
              accountId: learningPattern.accountId,
              accountName: learningPattern.accountName,
              confidence: learningPattern.confidence * learningPattern.accuracy
            });
          }
        }
      }
    }

    // Sort by confidence and add reasoning
    return enhancedSuggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5) // Top 5 suggestions
      .map(suggestion => ({
        ...suggestion,
        reason: this.generateReason(transactionDescription, suggestion, patterns)
      }));
  }

  /**
   * Check if transaction matches a rule
   */
  private doesTransactionMatchRule(description: string, rule: MatchingRule): boolean {
    const conditions = rule.conditions;
    const lowerDesc = description.toLowerCase();

    // Check description contains
    if (conditions.descriptionContains) {
      const matches = conditions.descriptionContains.some(term => 
        lowerDesc.includes(term.toLowerCase())
      );
      if (!matches) return false;
    }

    // Check regex pattern
    if (conditions.descriptionRegex) {
      const regex = new RegExp(conditions.descriptionRegex, 'i');
      if (!regex.test(description)) return false;
    }

    return true;
  }

  /**
   * Update rule usage statistics
   */
  private async updateRuleUsage(ruleId: string): Promise<void> {
    try {
      await this.storage.updateRuleUsage(ruleId);
    } catch (error) {
      console.error('Error updating rule usage:', error);
    }
  }

  /**
   * Generate reasoning for suggestions
   */
  private generateReason(
    description: string,
    suggestion: { accountId: number; accountName: string; confidence: number },
    patterns: string[]
  ): string {
    if (suggestion.confidence > 0.9) {
      return `High confidence match based on learned patterns: ${patterns.slice(0, 2).join(', ')}`;
    } else if (suggestion.confidence > 0.7) {
      return `Pattern-based suggestion from previous corrections`;
    } else {
      return `Suggested based on transaction analysis`;
    }
  }

  /**
   * Update learning metrics
   */
  private async updateLearningMetrics(companyId: number): Promise<void> {
    try {
      const corrections = await this.storage.getUserCorrections(companyId, { limit: 1000 });
      const patterns = await this.storage.getLearningPatterns(companyId);
      const rules = await this.storage.getMatchingRules(companyId);

      const metrics: LearningMetrics = {
        totalCorrections: corrections.length,
        improvementRate: this.calculateImprovementRate(corrections),
        accuracyTrend: this.calculateAccuracyTrend(corrections),
        topMistakes: this.calculateTopMistakes(corrections),
        rulesGenerated: rules.filter(r => r.createdFrom === 'user_correction').length,
        rulesAccuracy: this.calculateRulesAccuracy(rules)
      };

      await this.storage.storeLearningMetrics(companyId, metrics);
    } catch (error) {
      console.error('Error updating learning metrics:', error);
    }
  }

  /**
   * Calculate improvement rate over time
   */
  private calculateImprovementRate(corrections: UserCorrection[]): number {
    if (corrections.length < 10) return 0;

    const recentCorrections = corrections
      .filter(c => Date.now() - c.timestamp.getTime() < 30 * 24 * 60 * 60 * 1000) // Last 30 days
      .length;

    const olderCorrections = corrections.length - recentCorrections;
    
    return olderCorrections > 0 ? (olderCorrections - recentCorrections) / olderCorrections : 0;
  }

  /**
   * Calculate accuracy trend over time
   */
  private calculateAccuracyTrend(corrections: UserCorrection[]): Array<{ date: string; accuracy: number }> {
    // Group corrections by week and calculate accuracy trends
    const weeklyData = new Map<string, { total: number; accurate: number }>();
    
    corrections.forEach(correction => {
      const weekStart = new Date(correction.timestamp);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeklyData.has(weekKey)) {
        weeklyData.set(weekKey, { total: 0, accurate: 0 });
      }
      
      const week = weeklyData.get(weekKey)!;
      week.total++;
      
      // Assume corrections indicate inaccuracy (oversimplified for demo)
      if (correction.correctionType === 'wrong_account') {
        // This was a wrong prediction
      } else {
        week.accurate++;
      }
    });

    return Array.from(weeklyData.entries())
      .map(([date, data]) => ({
        date,
        accuracy: data.total > 0 ? data.accurate / data.total : 0
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-12); // Last 12 weeks
  }

  /**
   * Calculate top mistakes
   */
  private calculateTopMistakes(corrections: UserCorrection[]): Array<{ pattern: string; count: number }> {
    const mistakePatterns = new Map<string, number>();
    
    corrections
      .filter(c => c.correctionType === 'wrong_account')
      .forEach(correction => {
        const patterns = this.extractPatterns(correction.transactionData.description);
        patterns.forEach(pattern => {
          mistakePatterns.set(pattern, (mistakePatterns.get(pattern) || 0) + 1);
        });
      });

    return Array.from(mistakePatterns.entries())
      .map(([pattern, count]) => ({ pattern, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  /**
   * Calculate overall rules accuracy
   */
  private calculateRulesAccuracy(rules: MatchingRule[]): number {
    const totalRules = rules.length;
    if (totalRules === 0) return 0;

    const totalAccuracy = rules.reduce((sum, rule) => sum + rule.accuracy, 0);
    return totalAccuracy / totalRules;
  }

  /**
   * Get learning insights for a company
   */
  async getLearningInsights(companyId: number): Promise<{
    totalCorrections: number;
    activePatterns: number;
    generatedRules: number;
    improvementRate: number;
    topPatterns: Array<{ pattern: string; accuracy: number; usage: number }>;
    recentActivity: Array<{ date: string; corrections: number }>;
  }> {
    const corrections = await this.storage.getUserCorrections(companyId, { limit: 1000 });
    const patterns = await this.storage.getLearningPatterns(companyId);
    const rules = await this.storage.getMatchingRules(companyId);

    return {
      totalCorrections: corrections.length,
      activePatterns: patterns.filter(p => p.isActive && p.accuracy >= 0.7).length,
      generatedRules: rules.filter(r => r.createdFrom === 'user_correction' && r.isActive).length,
      improvementRate: this.calculateImprovementRate(corrections),
      topPatterns: patterns
        .filter(p => p.isActive)
        .sort((a, b) => b.accuracy - a.accuracy)
        .slice(0, 10)
        .map(p => ({
          pattern: p.pattern,
          accuracy: p.accuracy,
          usage: p.supportingCorrections
        })),
      recentActivity: this.calculateRecentActivity(corrections)
    };
  }

  /**
   * Calculate recent activity
   */
  private calculateRecentActivity(corrections: UserCorrection[]): Array<{ date: string; corrections: number }> {
    const dailyActivity = new Map<string, number>();
    
    corrections
      .filter(c => Date.now() - c.timestamp.getTime() < 30 * 24 * 60 * 60 * 1000) // Last 30 days
      .forEach(correction => {
        const date = correction.timestamp.toISOString().split('T')[0];
        dailyActivity.set(date, (dailyActivity.get(date) || 0) + 1);
      });

    return Array.from(dailyActivity.entries())
      .map(([date, corrections]) => ({ date, corrections }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}

// Export for dependency injection
export const createUserCorrectionLearningService = (storage: IStorage) => 
  new UserCorrectionLearningService(storage);