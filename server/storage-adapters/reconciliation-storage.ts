import type { DatabaseStorage } from '../storage';
import type { SaBankingRule, SaBankingFeePattern } from '@shared/schema';

// Minimal interface for SAReconciliationService storage needs
export interface ReconciliationStorage {
  getSaBankingRules(companyId: number): Promise<SaBankingRule[]>;
  getSaBankingFeePatterns(companyId: number): Promise<SaBankingFeePattern[]>;
}

// Adapter that wraps existing DatabaseStorage
export class ReconciliationStorageAdapter implements ReconciliationStorage {
  constructor(private storage: DatabaseStorage) {}

  async getSaBankingRules(companyId: number): Promise<SaBankingRule[]> {
    return this.storage.getSaBankingRules(companyId);
  }

  async getSaBankingFeePatterns(companyId: number): Promise<SaBankingFeePattern[]> {
    return this.storage.getSaBankingFeePatterns(companyId);
  }
}