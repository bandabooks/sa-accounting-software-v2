import { Request, Response, NextFunction } from 'express';
import { servicePackageManager, FEATURES } from './servicePackageManager';

// Extend Express Request type to include client info
declare global {
  namespace Express {
    interface Request {
      clientId?: number;
      packageAccess?: {
        hasAccess: boolean;
        packageType: string;
        upgradeRequired: boolean;
        feature: string;
      };
    }
  }
}

/**
 * Middleware to check if client has access to a specific feature
 */
export function requirePackageFeature(featureKey: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get client ID from request (you might get this from user session, params, etc.)
      const clientId = req.params.clientId ? parseInt(req.params.clientId) : req.body.clientId;
      
      if (!clientId) {
        return res.status(400).json({ 
          error: 'Client ID required',
          upgradeRequired: true,
          feature: featureKey
        });
      }

      // Check feature access
      const accessCheck = await servicePackageManager.checkFeatureAccess(clientId, featureKey);
      
      // Store access info in request for use in route handlers
      req.clientId = clientId;
      req.packageAccess = {
        hasAccess: accessCheck.hasAccess,
        packageType: accessCheck.packageType,
        upgradeRequired: accessCheck.upgradeRequired || false,
        feature: featureKey
      };

      if (!accessCheck.hasAccess) {
        return res.status(403).json({
          error: 'Feature not available in your current package',
          packageType: accessCheck.packageType,
          feature: featureKey,
          upgradeRequired: true,
          message: `This feature requires a higher service package. Current: ${accessCheck.packageType}`
        });
      }

      next();
    } catch (error) {
      console.error('Package middleware error:', error);
      res.status(500).json({ 
        error: 'Error checking package access',
        upgradeRequired: true 
      });
    }
  };
}

/**
 * Middleware to check usage limits for features with quotas
 */
export function checkUsageLimit(featureKey: string, getCurrentUsage: (req: Request) => Promise<number>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const clientId = req.params.clientId ? parseInt(req.params.clientId) : req.body.clientId;
      
      if (!clientId) {
        return res.status(400).json({ 
          error: 'Client ID required',
          feature: featureKey
        });
      }

      // Get current usage count
      const currentUsage = await getCurrentUsage(req);
      
      // Check usage limit
      const limitCheck = await servicePackageManager.checkUsageLimit(clientId, featureKey, currentUsage);
      
      req.clientId = clientId;
      req.packageAccess = {
        hasAccess: limitCheck.hasAccess,
        packageType: limitCheck.packageType,
        upgradeRequired: limitCheck.upgradeRequired || false,
        feature: featureKey
      };

      if (!limitCheck.hasAccess) {
        return res.status(403).json({
          error: 'Usage limit exceeded for your current package',
          packageType: limitCheck.packageType,
          feature: featureKey,
          currentUsage: limitCheck.currentUsage,
          limit: limitCheck.limit,
          upgradeRequired: true,
          message: `You have reached the limit for this feature (${limitCheck.currentUsage}/${limitCheck.limit}). Please upgrade your package.`
        });
      }

      next();
    } catch (error) {
      console.error('Usage limit middleware error:', error);
      res.status(500).json({ 
        error: 'Error checking usage limits',
        upgradeRequired: true 
      });
    }
  };
}

/**
 * Helper middleware to inject package info into response for frontend
 */
export function injectPackageInfo() {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Store original json method
    const originalJson = res.json;
    
    // Override json method to inject package info
    res.json = function(data: any) {
      if (req.packageAccess) {
        const enhancedData = {
          ...data,
          _packageInfo: {
            packageType: req.packageAccess.packageType,
            hasAccess: req.packageAccess.hasAccess,
            upgradeRequired: req.packageAccess.upgradeRequired,
            feature: req.packageAccess.feature
          }
        };
        return originalJson.call(this, enhancedData);
      }
      return originalJson.call(this, data);
    };
    
    next();
  };
}

/**
 * Middleware specifically for compliance module features
 */
export const complianceFeatureGates = {
  basicReports: requirePackageFeature(FEATURES.COMPLIANCE.BASIC_REPORTS),
  advancedReports: requirePackageFeature(FEATURES.COMPLIANCE.ADVANCED_REPORTS),
  customReports: requirePackageFeature(FEATURES.COMPLIANCE.CUSTOM_REPORTS),
  automatedReminders: requirePackageFeature(FEATURES.COMPLIANCE.AUTOMATED_REMINDERS),
  workflowAutomation: requirePackageFeature(FEATURES.COMPLIANCE.WORKFLOW_AUTOMATION),
  aiAssistance: requirePackageFeature(FEATURES.COMPLIANCE.AI_ASSISTANCE),
  
  // Usage-limited features
  clientManagement: (getCurrentClientCount: (req: Request) => Promise<number>) => 
    checkUsageLimit(FEATURES.COMPLIANCE.CLIENT_MANAGEMENT, getCurrentClientCount),
  
  taskTracking: (getCurrentTaskCount: (req: Request) => Promise<number>) => 
    checkUsageLimit(FEATURES.COMPLIANCE.TASK_TRACKING, getCurrentTaskCount)
};

/**
 * Middleware for billing module features
 */
export const billingFeatureGates = {
  manualInvoicing: requirePackageFeature(FEATURES.BILLING.MANUAL_INVOICING),
  automatedBilling: requirePackageFeature(FEATURES.BILLING.AUTOMATED_BILLING),
  advancedAnalytics: requirePackageFeature(FEATURES.BILLING.ADVANCED_ANALYTICS),
  whiteLabel: requirePackageFeature(FEATURES.BILLING.WHITE_LABEL)
};

/**
 * Middleware for integration features
 */
export const integrationFeatureGates = {
  sarsBasic: requirePackageFeature(FEATURES.INTEGRATION.SARS_BASIC),
  sarsAdvanced: requirePackageFeature(FEATURES.INTEGRATION.SARS_ADVANCED),
  thirdParty: requirePackageFeature(FEATURES.INTEGRATION.THIRD_PARTY),
  customApi: requirePackageFeature(FEATURES.INTEGRATION.CUSTOM_API)
};

/**
 * Helper function to get client count for current user/company
 */
export async function getCurrentClientCount(req: Request): Promise<number> {
  // This would typically query your database to get current client count
  // Implementation depends on your specific data structure
  return 0; // Placeholder
}

/**
 * Helper function to get task count for current user/company  
 */
export async function getCurrentTaskCount(req: Request): Promise<number> {
  // This would typically query your database to get current task count
  return 0; // Placeholder
}