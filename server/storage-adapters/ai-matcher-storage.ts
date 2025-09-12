import type { DatabaseStorage } from '../storage';
import type { 
  AiMatchingCorrection, 
  InsertAiMatchingCorrection,
  AiTransactionPattern,
  InsertAiTransactionPattern 
} from '@shared/schema';

// Minimal interface for AITransactionMatcher storage needs
export interface AiMatcherStorage {
  createAiMatchingCorrection(data: InsertAiMatchingCorrection): Promise<AiMatchingCorrection>;
  getMatchingPatterns(companyId: number, description: string, transactionType: string, limit?: number): Promise<AiTransactionPattern[]>;
  updateAiTransactionPattern(id: number, data: Partial<InsertAiTransactionPattern>): Promise<AiTransactionPattern | undefined>;
  createAiTransactionPattern(data: InsertAiTransactionPattern): Promise<AiTransactionPattern>;
  getAiTransactionPatterns(companyId: number): Promise<AiTransactionPattern[]>;
  getAiMatchingCorrections(companyId: number, limit: number): Promise<AiMatchingCorrection[]>;
}

// Adapter that wraps existing DatabaseStorage
export class AiMatcherStorageAdapter implements AiMatcherStorage {
  constructor(private storage: DatabaseStorage) {}

  async createAiMatchingCorrection(data: InsertAiMatchingCorrection): Promise<AiMatchingCorrection> {
    return this.storage.createAiMatchingCorrection(data);
  }

  async getMatchingPatterns(companyId: number, description: string, transactionType: string, limit?: number): Promise<AiTransactionPattern[]> {
    return this.storage.getMatchingPatterns(companyId, description, transactionType, limit);
  }

  async updateAiTransactionPattern(id: number, data: Partial<InsertAiTransactionPattern>): Promise<AiTransactionPattern | undefined> {
    return this.storage.updateAiTransactionPattern(id, data);
  }

  async createAiTransactionPattern(data: InsertAiTransactionPattern): Promise<AiTransactionPattern> {
    return this.storage.createAiTransactionPattern(data);
  }

  async getAiTransactionPatterns(companyId: number): Promise<AiTransactionPattern[]> {
    return this.storage.getAiTransactionPatterns(companyId);
  }

  async getAiMatchingCorrections(companyId: number, limit: number): Promise<AiMatchingCorrection[]> {
    return this.storage.getAiMatchingCorrections(companyId, limit);
  }
}