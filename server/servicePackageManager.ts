import { db } from "./db";
import { servicePackageFeatures, servicePackagePricing, clientServiceSubscriptions, clients } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import type { ServicePackageFeature, ServicePackagePricing, ClientServiceSubscription } from "@shared/schema";

export interface PackageFeatureCheck {
  hasAccess: boolean;
  limit?: number;
  currentUsage?: number;
  packageType: string;
  upgradeRequired?: boolean;
}

export class ServicePackageManager {
  
  /**
   * Check if a client has access to a specific feature
   */
  async checkFeatureAccess(clientId: number, featureKey: string): Promise<PackageFeatureCheck> {
    try {
      // Get client's current package
      const [client] = await db.select()
        .from(clients)
        .where(eq(clients.id, clientId));

      if (!client) {
        return {
          hasAccess: false,
          packageType: 'none',
          upgradeRequired: true
        };
      }

      const packageType = client.servicePackage || 'basic';

      // Get feature configuration for this package
      const [feature] = await db.select()
        .from(servicePackageFeatures)
        .where(and(
          eq(servicePackageFeatures.packageType, packageType),
          eq(servicePackageFeatures.featureKey, featureKey)
        ));

      if (!feature || !feature.enabled) {
        return {
          hasAccess: false,
          packageType,
          upgradeRequired: true
        };
      }

      return {
        hasAccess: true,
        limit: feature.limit ?? undefined,
        packageType,
        upgradeRequired: false
      };

    } catch (error) {
      console.error('Error checking feature access:', error);
      return {
        hasAccess: false,
        packageType: 'error',
        upgradeRequired: true
      };
    }
  }

  /**
   * Check if a client has reached their usage limit for a feature
   */
  async checkUsageLimit(clientId: number, featureKey: string, currentCount: number): Promise<PackageFeatureCheck> {
    const featureCheck = await this.checkFeatureAccess(clientId, featureKey);
    
    if (!featureCheck.hasAccess) {
      return featureCheck;
    }

    // If no limit is set, unlimited access
    if (featureCheck.limit === null || featureCheck.limit === undefined) {
      return {
        ...featureCheck,
        currentUsage: currentCount
      };
    }

    // Check if limit is exceeded
    const limitExceeded = currentCount >= featureCheck.limit;
    
    return {
      ...featureCheck,
      hasAccess: !limitExceeded,
      currentUsage: currentCount,
      upgradeRequired: limitExceeded
    };
  }

  /**
   * Get all available packages with their features
   */
  async getAvailablePackages(): Promise<ServicePackagePricing[]> {
    return await db.select()
      .from(servicePackagePricing)
      .where(eq(servicePackagePricing.isActive, true))
      .orderBy(servicePackagePricing.priority);
  }

  /**
   * Get features for a specific package
   */
  async getPackageFeatures(packageType: string): Promise<ServicePackageFeature[]> {
    return await db.select()
      .from(servicePackageFeatures)
      .where(and(
        eq(servicePackageFeatures.packageType, packageType),
        eq(servicePackageFeatures.enabled, true)
      ));
  }

  /**
   * Upgrade a client's service package
   */
  async upgradeClientPackage(clientId: number, newPackageType: string): Promise<boolean> {
    try {
      // Verify the new package exists
      const [packagePricing] = await db.select()
        .from(servicePackagePricing)
        .where(eq(servicePackagePricing.packageType, newPackageType));

      if (!packagePricing) {
        throw new Error(`Package type '${newPackageType}' not found`);
      }

      // Update client's package
      await db.update(clients)
        .set({ 
          servicePackage: newPackageType,
          monthlyFee: packagePricing.monthlyPrice,
          updatedAt: new Date()
        })
        .where(eq(clients.id, clientId));

      // Create or update subscription record
      const startDate = new Date();
      const nextBillingDate = new Date();
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

      const existingSubscription = await db.select()
        .from(clientServiceSubscriptions)
        .where(eq(clientServiceSubscriptions.clientId, clientId));

      if (existingSubscription.length > 0) {
        // Update existing subscription
        await db.update(clientServiceSubscriptions)
          .set({
            packageType: newPackageType,
            monthlyRate: packagePricing.monthlyPrice,
            nextBillingDate: nextBillingDate.toISOString().split('T')[0],
            updatedAt: new Date()
          })
          .where(eq(clientServiceSubscriptions.clientId, clientId));
      } else {
        // Create new subscription
        await db.insert(clientServiceSubscriptions)
          .values({
            clientId,
            packageType: newPackageType,
            startDate: startDate.toISOString().split('T')[0],
            monthlyRate: packagePricing.monthlyPrice,
            nextBillingDate: nextBillingDate.toISOString().split('T')[0]
          });
      }

      return true;
    } catch (error) {
      console.error('Error upgrading client package:', error);
      return false;
    }
  }

  /**
   * Get client's current subscription details
   */
  async getClientSubscription(clientId: number): Promise<ClientServiceSubscription | null> {
    const [subscription] = await db.select()
      .from(clientServiceSubscriptions)
      .where(eq(clientServiceSubscriptions.clientId, clientId));

    return subscription || null;
  }

  /**
   * Check multiple features at once for a client
   */
  async checkMultipleFeatures(clientId: number, featureKeys: string[]): Promise<Record<string, PackageFeatureCheck>> {
    const results: Record<string, PackageFeatureCheck> = {};
    
    for (const featureKey of featureKeys) {
      results[featureKey] = await this.checkFeatureAccess(clientId, featureKey);
    }
    
    return results;
  }

  /**
   * Get package comparison data for upgrade prompts
   */
  async getPackageComparison(currentPackage: string): Promise<{
    current: ServicePackagePricing | null;
    upgrades: ServicePackagePricing[];
  }> {
    const packages = await this.getAvailablePackages();
    
    const current = packages.find(p => p.packageType === currentPackage) || null;
    const currentPriority = current?.priority ?? 0;
    
    const upgrades = packages.filter(p => (p.priority ?? 0) > currentPriority);
    
    return { current, upgrades };
  }
}

// Export singleton instance
export const servicePackageManager = new ServicePackageManager();

// Feature constants for easy reference
export const FEATURES = {
  COMPLIANCE: {
    BASIC_REPORTS: 'compliance.basic_reports',
    ADVANCED_REPORTS: 'compliance.advanced_reports',
    CUSTOM_REPORTS: 'compliance.custom_reports',
    CLIENT_MANAGEMENT: 'compliance.client_management',
    TASK_TRACKING: 'compliance.task_tracking',
    AUTOMATED_REMINDERS: 'compliance.automated_reminders',
    WORKFLOW_AUTOMATION: 'compliance.workflow_automation',
    AI_ASSISTANCE: 'compliance.ai_assistance'
  },
  BILLING: {
    MANUAL_INVOICING: 'billing.manual_invoicing',
    AUTOMATED_BILLING: 'billing.automated_billing',
    ADVANCED_ANALYTICS: 'billing.advanced_analytics',
    WHITE_LABEL: 'billing.white_label'
  },
  INTEGRATION: {
    SARS_BASIC: 'integration.sars_basic',
    SARS_ADVANCED: 'integration.sars_advanced',
    THIRD_PARTY: 'integration.third_party',
    CUSTOM_API: 'integration.custom_api'
  },
  SUPPORT: {
    EMAIL: 'support.email',
    PRIORITY: 'support.priority',
    PHONE: 'support.phone',
    DEDICATED_MANAGER: 'support.dedicated_manager'
  },
  USERS: {
    LIMIT: 'users.limit'
  }
} as const;