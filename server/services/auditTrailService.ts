/**
 * Comprehensive Audit Trail Service for Bank Statement Processing
 * Tracks all activities related to bank statement imports, transaction review, and processing
 * Superior to QuickBooks with detailed activity logging and reporting capabilities
 */

import { storage } from '../storage';

export enum AuditEventType {
  STATEMENT_IMPORTED = 'statement_imported',
  STATEMENT_PARSED = 'statement_parsed',
  STATEMENT_VALIDATED = 'statement_validated',
  STATEMENT_PROCESSED = 'statement_processed',
  TRANSACTION_CREATED = 'transaction_created',
  TRANSACTION_UPDATED = 'transaction_updated',
  TRANSACTION_REVIEWED = 'transaction_reviewed',
  TRANSACTION_APPROVED = 'transaction_approved',
  TRANSACTION_REJECTED = 'transaction_rejected',
  TRANSACTION_MATCHED = 'transaction_matched',
  DUPLICATE_DETECTED = 'duplicate_detected',
  DUPLICATE_RESOLVED = 'duplicate_resolved',
  BULK_UPDATE_PERFORMED = 'bulk_update_performed',
  AI_MATCH_EXECUTED = 'ai_match_executed',
  MANUAL_OVERRIDE = 'manual_override',
  REVIEW_STATUS_CHANGED = 'review_status_changed',
  ACCOUNT_ASSIGNED = 'account_assigned',
  VAT_APPLIED = 'vat_applied',
  IMPORT_FAILED = 'import_failed',
  SYSTEM_ERROR = 'system_error'
}

export interface AuditEventData {
  eventType: AuditEventType;
  companyId: number;
  userId: number;
  entityType: 'bank_statement_import' | 'transaction' | 'transaction_status' | 'journal_entry';
  entityId: number | string;
  details: {
    description: string;
    metadata?: Record<string, any>;
    previousValues?: Record<string, any>;
    newValues?: Record<string, any>;
    errorDetails?: {
      message: string;
      stack?: string;
      code?: string;
    };
    performanceMetrics?: {
      duration: number;
      recordsProcessed: number;
      successRate: number;
    };
  };
}

export interface AuditQuery {
  companyId: number;
  entityType?: string;
  entityId?: number | string;
  eventType?: AuditEventType | AuditEventType[];
  userId?: number;
  fromDate?: Date;
  toDate?: Date;
  limit?: number;
  offset?: number;
}

export class AuditTrailService {
  
  /**
   * Log a single audit event
   */
  async logEvent(eventData: AuditEventData): Promise<void> {
    try {
      const auditEntry = {
        companyId: eventData.companyId,
        userId: eventData.userId,
        eventType: eventData.eventType,
        entityType: eventData.entityType,
        entityId: eventData.entityId.toString(),
        eventData: JSON.stringify(eventData.details),
        createdAt: new Date()
      };

      await storage.createAuditEntry(auditEntry);
      
      // Log to console for real-time monitoring
      console.log(`[AUDIT] ${eventData.eventType} - User ${eventData.userId} - ${eventData.details.description}`);
    } catch (error) {
      console.error('Failed to log audit event:', error);
      // Don't throw error to avoid breaking the main flow
    }
  }

  /**
   * Log statement import events
   */
  async logStatementImport(
    companyId: number,
    userId: number,
    importId: number,
    fileName: string,
    bankName: string,
    status: 'started' | 'completed' | 'failed',
    metadata: {
      totalTransactions?: number;
      processedTransactions?: number;
      duplicatesFound?: number;
      errorMessage?: string;
      duration?: number;
    } = {}
  ): Promise<void> {
    let eventType: AuditEventType;
    let description: string;

    switch (status) {
      case 'started':
        eventType = AuditEventType.STATEMENT_IMPORTED;
        description = `Bank statement '${fileName}' from ${bankName} import started`;
        break;
      case 'completed':
        eventType = AuditEventType.STATEMENT_PROCESSED;
        description = `Bank statement '${fileName}' successfully processed - ${metadata.processedTransactions}/${metadata.totalTransactions} transactions`;
        break;
      case 'failed':
        eventType = AuditEventType.IMPORT_FAILED;
        description = `Bank statement '${fileName}' import failed: ${metadata.errorMessage}`;
        break;
    }

    await this.logEvent({
      eventType,
      companyId,
      userId,
      entityType: 'bank_statement_import',
      entityId: importId,
      details: {
        description,
        metadata: {
          fileName,
          bankName,
          status,
          ...metadata
        }
      }
    });
  }

  /**
   * Log transaction review events
   */
  async logTransactionReview(
    companyId: number,
    userId: number,
    transactionId: string,
    oldStatus: string,
    newStatus: string,
    changes: {
      assignedAccountName?: string;
      vatRate?: number;
      vatType?: string;
      notes?: string;
      reasonCode?: string;
    } = {}
  ): Promise<void> {
    await this.logEvent({
      eventType: AuditEventType.TRANSACTION_REVIEWED,
      companyId,
      userId,
      entityType: 'transaction',
      entityId: transactionId,
      details: {
        description: `Transaction status changed from '${oldStatus}' to '${newStatus}'`,
        previousValues: { status: oldStatus },
        newValues: { status: newStatus, ...changes },
        metadata: {
          reviewType: this.getReviewType(oldStatus, newStatus),
          hasAccountChange: !!changes.assignedAccountName,
          hasVATChange: !!(changes.vatRate || changes.vatType),
          hasNotes: !!changes.notes
        }
      }
    });
  }

  /**
   * Log bulk operation events
   */
  async logBulkOperation(
    companyId: number,
    userId: number,
    operationType: 'update' | 'approve' | 'reject',
    transactionIds: string[],
    changes: Record<string, any>,
    results: {
      successful: number;
      failed: number;
      errors?: string[];
    }
  ): Promise<void> {
    const description = `Bulk ${operationType} performed on ${transactionIds.length} transactions - ${results.successful} successful, ${results.failed} failed`;

    await this.logEvent({
      eventType: AuditEventType.BULK_UPDATE_PERFORMED,
      companyId,
      userId,
      entityType: 'transaction',
      entityId: `bulk_${Date.now()}`,
      details: {
        description,
        metadata: {
          operationType,
          transactionCount: transactionIds.length,
          transactionIds,
          changes,
          results
        },
        performanceMetrics: {
          duration: 0, // To be measured by caller
          recordsProcessed: transactionIds.length,
          successRate: (results.successful / transactionIds.length) * 100
        }
      }
    });
  }

  /**
   * Log AI matching events
   */
  async logAIMatching(
    companyId: number,
    userId: number,
    sessionId: string,
    results: {
      totalTransactions: number;
      matched: number;
      unmatched: number;
      confidence: number;
      duration: number;
      model?: string;
    }
  ): Promise<void> {
    await this.logEvent({
      eventType: AuditEventType.AI_MATCH_EXECUTED,
      companyId,
      userId,
      entityType: 'transaction',
      entityId: sessionId,
      details: {
        description: `AI matching completed - ${results.matched}/${results.totalTransactions} transactions matched with ${results.confidence}% avg confidence`,
        metadata: {
          sessionId,
          model: results.model || 'claude-3.5-sonnet',
          results
        },
        performanceMetrics: {
          duration: results.duration,
          recordsProcessed: results.totalTransactions,
          successRate: (results.matched / results.totalTransactions) * 100
        }
      }
    });
  }

  /**
   * Log duplicate detection events
   */
  async logDuplicateDetection(
    companyId: number,
    userId: number,
    transactionId: string,
    duplicateInfo: {
      isDuplicate: boolean;
      duplicateCount: number;
      confidence: number;
      reasoning: string;
      action: 'flagged' | 'auto_resolved' | 'manual_review';
    }
  ): Promise<void> {
    const eventType = duplicateInfo.isDuplicate 
      ? AuditEventType.DUPLICATE_DETECTED 
      : AuditEventType.DUPLICATE_RESOLVED;

    await this.logEvent({
      eventType,
      companyId,
      userId,
      entityType: 'transaction',
      entityId: transactionId,
      details: {
        description: duplicateInfo.isDuplicate 
          ? `Duplicate transaction detected with ${duplicateInfo.confidence}% confidence - ${duplicateInfo.reasoning}`
          : `Transaction cleared of duplicate status - ${duplicateInfo.reasoning}`,
        metadata: duplicateInfo
      }
    });
  }

  /**
   * Get audit trail for specific criteria
   */
  async getAuditTrail(query: AuditQuery): Promise<{
    events: any[];
    totalCount: number;
    summary: {
      totalEvents: number;
      uniqueUsers: number;
      eventTypeBreakdown: Record<string, number>;
      timeRange: { from: Date; to: Date };
    };
  }> {
    const events = await storage.getAuditEntries({
      companyId: query.companyId,
      entityType: query.entityType,
      entityId: query.entityId?.toString(),
      eventType: Array.isArray(query.eventType) ? query.eventType : (query.eventType ? [query.eventType] : undefined),
      userId: query.userId,
      fromDate: query.fromDate,
      toDate: query.toDate,
      limit: query.limit || 50,
      offset: query.offset || 0
    });

    // Calculate summary statistics
    const uniqueUsers = new Set(events.map(e => e.userId)).size;
    const eventTypeBreakdown = events.reduce((acc, event) => {
      acc[event.eventType] = (acc[event.eventType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const dates = events.map(e => new Date(e.createdAt)).sort();
    const timeRange = {
      from: dates[0] || new Date(),
      to: dates[dates.length - 1] || new Date()
    };

    return {
      events,
      totalCount: events.length,
      summary: {
        totalEvents: events.length,
        uniqueUsers,
        eventTypeBreakdown,
        timeRange
      }
    };
  }

  /**
   * Generate audit report for compliance
   */
  async generateComplianceReport(
    companyId: number,
    fromDate: Date,
    toDate: Date
  ): Promise<{
    reportId: string;
    period: { from: Date; to: Date };
    summary: {
      totalImports: number;
      totalTransactionsProcessed: number;
      totalReviewActions: number;
      errorRate: number;
      complianceScore: number;
    };
    activities: {
      imports: any[];
      reviews: any[];
      errors: any[];
      duplicates: any[];
    };
  }> {
    const reportId = `audit_report_${Date.now()}`;

    // Get all audit events for the period
    const allEvents = await this.getAuditTrail({
      companyId,
      fromDate,
      toDate,
      limit: 10000 // Large limit for comprehensive report
    });

    // Categorize events
    const imports = allEvents.events.filter(e => 
      e.eventType === AuditEventType.STATEMENT_IMPORTED || 
      e.eventType === AuditEventType.STATEMENT_PROCESSED
    );

    const reviews = allEvents.events.filter(e => 
      e.eventType === AuditEventType.TRANSACTION_REVIEWED ||
      e.eventType === AuditEventType.TRANSACTION_APPROVED ||
      e.eventType === AuditEventType.TRANSACTION_REJECTED
    );

    const errors = allEvents.events.filter(e => 
      e.eventType === AuditEventType.IMPORT_FAILED ||
      e.eventType === AuditEventType.SYSTEM_ERROR
    );

    const duplicates = allEvents.events.filter(e => 
      e.eventType === AuditEventType.DUPLICATE_DETECTED ||
      e.eventType === AuditEventType.DUPLICATE_RESOLVED
    );

    // Calculate metrics
    const totalTransactionsProcessed = imports.reduce((sum, event) => {
      const metadata = typeof event.eventData === 'string' ? JSON.parse(event.eventData) : event.eventData;
      return sum + (metadata?.metadata?.processedTransactions || 0);
    }, 0);

    const errorRate = allEvents.events.length > 0 ? (errors.length / allEvents.events.length) * 100 : 0;
    const complianceScore = Math.max(0, 100 - errorRate - (duplicates.length * 0.5));

    return {
      reportId,
      period: { from: fromDate, to: toDate },
      summary: {
        totalImports: imports.length,
        totalTransactionsProcessed,
        totalReviewActions: reviews.length,
        errorRate: Math.round(errorRate * 100) / 100,
        complianceScore: Math.round(complianceScore * 100) / 100
      },
      activities: {
        imports,
        reviews,
        errors,
        duplicates
      }
    };
  }

  /**
   * Helper method to determine review type
   */
  private getReviewType(oldStatus: string, newStatus: string): string {
    if (oldStatus === 'needs_review' && newStatus === 'completed') return 'approval';
    if (oldStatus === 'needs_review' && newStatus === 'rejected') return 'rejection';
    if (oldStatus === 'completed' && newStatus === 'needs_review') return 'reopened';
    if (newStatus === 'in_review') return 'started_review';
    return 'status_change';
  }

  /**
   * Clean up old audit entries (for data retention compliance)
   */
  async cleanupOldEntries(companyId: number, olderThanDays: number = 365 * 2): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
    
    const deletedCount = await storage.deleteOldAuditEntries(companyId, cutoffDate);
    
    await this.logEvent({
      eventType: AuditEventType.SYSTEM_ERROR, // Reusing for system maintenance
      companyId,
      userId: 0, // System user
      entityType: 'bank_statement_import',
      entityId: 'system_cleanup',
      details: {
        description: `Audit trail cleanup completed - ${deletedCount} entries older than ${olderThanDays} days removed`,
        metadata: {
          operation: 'cleanup',
          cutoffDate: cutoffDate.toISOString(),
          deletedCount
        }
      }
    });

    return deletedCount;
  }
}

export const auditTrailService = new AuditTrailService();