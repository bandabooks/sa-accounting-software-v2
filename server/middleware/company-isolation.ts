import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../auth';

/**
 * Company Isolation Middleware
 * Ensures all database operations are scoped to the correct company
 */

// Middleware to validate company context on every request
export const validateCompanyContext = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // Skip for authentication endpoints and public routes
  const publicPaths = ['/login', '/signup', '/logout', '/auth/', '/health', '/public', '/trial-signup'];
  const isPublicPath = publicPaths.some(path => req.path.includes(path));
  
  if (isPublicPath) {
    return next();
  }

  // Skip if no user (authentication not required for this route)
  if (!req.user) {
    return next();
  }

  // Ensure authenticated user has a valid company context
  if (req.user && !req.user.companyId) {
    return res.status(403).json({ 
      message: 'No company context established',
      hint: 'Please select a company or contact support'
    });
  }

  // Add company ID to response headers for client tracking
  if (req.user?.companyId) {
    res.setHeader('X-Company-ID', req.user.companyId.toString());
  }

  next();
};

// Helper to create company-scoped storage wrapper
export function createCompanyScopedStorage(storage: any, companyId: number) {
  return new Proxy(storage, {
    get(target, prop, receiver) {
      const original = Reflect.get(target, prop, receiver);
      
      // If it's not a function, return as is
      if (typeof original !== 'function') {
        return original;
      }
      
      // Wrap the function to inject companyId
      return function(...args: any[]) {
        // Methods that need company scoping
        const scopedMethods = [
          'getInvoices', 'createInvoice', 'updateInvoice',
          'getCustomers', 'createCustomer', 'updateCustomer',
          'getProducts', 'createProduct', 'updateProduct',
          'getExpenses', 'createExpense', 'updateExpense',
          'getSuppliers', 'createSupplier', 'updateSupplier',
          'getEstimates', 'createEstimate', 'updateEstimate',
          'getSalesOrders', 'createSalesOrder', 'updateSalesOrder',
          'getPurchaseOrders', 'createPurchaseOrder', 'updatePurchaseOrder',
          'getCreditNotes', 'createCreditNote', 'updateCreditNote',
          'getJournalEntries', 'createJournalEntry', 'updateJournalEntry',
          'getChartOfAccounts', 'createAccount', 'updateAccount',
          'getTransactions', 'createTransaction', 'updateTransaction',
          'getBankAccounts', 'createBankAccount', 'updateBankAccount',
          'getPayments', 'createPayment', 'updatePayment',
          'getCategories', 'createCategory', 'updateCategory',
          'getTaxRates', 'createTaxRate', 'updateTaxRate',
          'getVATReturns', 'createVATReturn', 'updateVATReturn',
          'getReceipts', 'createReceipt', 'updateReceipt',
          'getBills', 'createBill', 'updateBill',
          'getFixedAssets', 'createFixedAsset', 'updateFixedAsset',
          'getBudgets', 'createBudget', 'updateBudget',
          'getCashFlowForecasts', 'createCashFlowForecast', 'updateCashFlowForecast',
          'getInventoryItems', 'createInventoryItem', 'updateInventoryItem',
          'getWarehouses', 'createWarehouse', 'updateWarehouse',
          'getDeliveries', 'createDelivery', 'updateDelivery',
          'getGoodsReceipts', 'createGoodsReceipt', 'updateGoodsReceipt',
          'getStockCounts', 'createStockCount', 'updateStockCount',
          'getPurchaseRequisitions', 'createPurchaseRequisition', 'updatePurchaseRequisition'
        ];
        
        // Check if this method needs company scoping
        if (scopedMethods.includes(prop as string)) {
          // Ensure companyId is included in the query/data
          if (args[0] && typeof args[0] === 'object') {
            // For create/update methods, add companyId to the data
            if (prop.toString().startsWith('create') || prop.toString().startsWith('update')) {
              args[0] = { ...args[0], companyId };
            }
          }
          
          // For get methods, add companyId filter
          if (prop.toString().startsWith('get')) {
            // Add companyId to filter conditions
            const originalArgs = args[0] || {};
            args[0] = { ...originalArgs, companyId };
          }
        }
        
        // Call the original method with modified args
        return original.apply(target, args);
      };
    }
  });
}

// Middleware to inject company-scoped storage
export const injectCompanyScopedStorage = (storage: any) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (req.user?.companyId) {
      // Create a company-scoped storage instance for this request
      (req as any).storage = createCompanyScopedStorage(storage, req.user.companyId);
    } else {
      (req as any).storage = storage;
    }
    next();
  };
};

// Helper to validate cross-company data access
export const validateDataAccess = async (
  storage: any,
  entityType: string,
  entityId: number,
  companyId: number
): Promise<boolean> => {
  try {
    let entity;
    
    switch (entityType) {
      case 'invoice':
        entity = await storage.getInvoice(entityId);
        break;
      case 'customer':
        entity = await storage.getCustomer(entityId);
        break;
      case 'product':
        entity = await storage.getProduct(entityId);
        break;
      case 'expense':
        entity = await storage.getExpense(entityId);
        break;
      case 'supplier':
        entity = await storage.getSupplier(entityId);
        break;
      case 'estimate':
        entity = await storage.getEstimate(entityId);
        break;
      case 'salesOrder':
        entity = await storage.getSalesOrder(entityId);
        break;
      case 'purchaseOrder':
        entity = await storage.getPurchaseOrder(entityId);
        break;
      case 'creditNote':
        entity = await storage.getCreditNote(entityId);
        break;
      default:
        return false;
    }
    
    // Check if entity belongs to the company
    return entity?.companyId === companyId;
  } catch (error) {
    console.error(`Error validating data access for ${entityType}:${entityId}`, error);
    return false;
  }
};

// Cache invalidation helper for company switch
export const invalidateCompanyCache = (companyId: number) => {
  // This would integrate with your caching layer (Redis, etc.)
  // For now, we're relying on query client cache clearing on the frontend
  console.log(`Cache invalidated for company ${companyId}`);
};