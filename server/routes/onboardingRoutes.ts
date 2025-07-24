import type { Express } from "express";
import { authenticate, type AuthenticatedRequest } from "../auth";
import { storage } from "../storage";
import { z } from "zod";

const onboardingSetupSchema = z.object({
  name: z.string().min(1, "Company name is required"),
  displayName: z.string().min(1, "Display name is required"),
  slug: z.string().min(1, "URL slug is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  vatNumber: z.string().optional(),
  registrationNumber: z.string().optional(),
  industry: z.string().min(1, "Industry selection is required"),
  isVatRegistered: z.boolean().default(false),
  vatPeriodMonths: z.number().default(2),
  vatSubmissionDay: z.number().default(25),
  subscriptionPlan: z.string().min(1, "Subscription plan is required"),
  billingPeriod: z.enum(["monthly", "yearly"]).default("monthly")
});

// Industry-specific Chart of Accounts templates
const chartOfAccountsTemplates = {
  general: [
    // Assets
    { code: "1100", name: "Bank Account", type: "asset", category: "current_assets" },
    { code: "1200", name: "Accounts Receivable", type: "asset", category: "current_assets" },
    { code: "1300", name: "Inventory", type: "asset", category: "current_assets" },
    { code: "1400", name: "Prepaid Expenses", type: "asset", category: "current_assets" },
    { code: "1500", name: "Equipment", type: "asset", category: "fixed_assets" },
    { code: "1600", name: "Accumulated Depreciation - Equipment", type: "asset", category: "fixed_assets", isContra: true },
    // Liabilities
    { code: "2100", name: "Accounts Payable", type: "liability", category: "current_liabilities" },
    { code: "2200", name: "VAT Payable", type: "liability", category: "current_liabilities" },
    { code: "2300", name: "Accrued Expenses", type: "liability", category: "current_liabilities" },
    { code: "2400", name: "Long-term Debt", type: "liability", category: "long_term_liabilities" },
    // Equity
    { code: "3100", name: "Owner's Equity", type: "equity", category: "equity" },
    { code: "3200", name: "Retained Earnings", type: "equity", category: "equity" },
    // Revenue
    { code: "4100", name: "Sales Revenue", type: "revenue", category: "revenue" },
    { code: "4200", name: "Service Revenue", type: "revenue", category: "revenue" },
    // Expenses
    { code: "5100", name: "Cost of Goods Sold", type: "expense", category: "cost_of_sales" },
    { code: "6100", name: "Office Expenses", type: "expense", category: "operating_expenses" },
    { code: "6200", name: "Marketing Expenses", type: "expense", category: "operating_expenses" },
    { code: "6300", name: "Professional Fees", type: "expense", category: "operating_expenses" },
    { code: "6400", name: "Utilities", type: "expense", category: "operating_expenses" },
    { code: "6500", name: "Depreciation Expense", type: "expense", category: "operating_expenses" }
  ],
  retail: [
    // Additional retail-specific accounts
    { code: "1100", name: "Cash on Hand", type: "asset", category: "current_assets" },
    { code: "1110", name: "Bank Account - Operations", type: "asset", category: "current_assets" },
    { code: "1200", name: "Accounts Receivable", type: "asset", category: "current_assets" },
    { code: "1310", name: "Inventory - Finished Goods", type: "asset", category: "current_assets" },
    { code: "1320", name: "Inventory - Raw Materials", type: "asset", category: "current_assets" },
    { code: "1400", name: "Prepaid Rent", type: "asset", category: "current_assets" },
    { code: "1500", name: "Store Equipment", type: "asset", category: "fixed_assets" },
    { code: "1510", name: "Point of Sale Systems", type: "asset", category: "fixed_assets" },
    { code: "1600", name: "Accumulated Depreciation - Equipment", type: "asset", category: "fixed_assets", isContra: true },
    // Retail-specific liabilities
    { code: "2100", name: "Accounts Payable - Suppliers", type: "liability", category: "current_liabilities" },
    { code: "2200", name: "VAT Payable", type: "liability", category: "current_liabilities" },
    { code: "2300", name: "Sales Tax Payable", type: "liability", category: "current_liabilities" },
    { code: "2400", name: "Store Rent Payable", type: "liability", category: "current_liabilities" },
    // Revenue
    { code: "4100", name: "Retail Sales", type: "revenue", category: "revenue" },
    { code: "4200", name: "Online Sales", type: "revenue", category: "revenue" },
    { code: "4300", name: "Wholesale Sales", type: "revenue", category: "revenue" },
    // Cost of Sales
    { code: "5100", name: "Cost of Goods Sold - Retail", type: "expense", category: "cost_of_sales" },
    { code: "5200", name: "Purchase Discounts", type: "expense", category: "cost_of_sales", isContra: true },
    { code: "5300", name: "Freight In", type: "expense", category: "cost_of_sales" },
    // Operating Expenses
    { code: "6100", name: "Store Rent", type: "expense", category: "operating_expenses" },
    { code: "6200", name: "Store Utilities", type: "expense", category: "operating_expenses" },
    { code: "6300", name: "Sales Staff Wages", type: "expense", category: "operating_expenses" },
    { code: "6400", name: "Advertising & Marketing", type: "expense", category: "operating_expenses" },
    { code: "6500", name: "Store Insurance", type: "expense", category: "operating_expenses" }
  ],
  services: [
    // Service-specific accounts
    { code: "1100", name: "Business Bank Account", type: "asset", category: "current_assets" },
    { code: "1200", name: "Accounts Receivable", type: "asset", category: "current_assets" },
    { code: "1300", name: "Work in Progress", type: "asset", category: "current_assets" },
    { code: "1400", name: "Prepaid Professional Insurance", type: "asset", category: "current_assets" },
    { code: "1500", name: "Office Equipment", type: "asset", category: "fixed_assets" },
    { code: "1510", name: "Computer Equipment", type: "asset", category: "fixed_assets" },
    { code: "1600", name: "Accumulated Depreciation - Equipment", type: "asset", category: "fixed_assets", isContra: true },
    // Service-specific revenue
    { code: "4100", name: "Professional Service Fees", type: "revenue", category: "revenue" },
    { code: "4200", name: "Consulting Revenue", type: "revenue", category: "revenue" },
    { code: "4300", name: "Retainer Fees", type: "revenue", category: "revenue" },
    { code: "4400", name: "Project-Based Revenue", type: "revenue", category: "revenue" },
    // Service-specific expenses
    { code: "6100", name: "Professional Development", type: "expense", category: "operating_expenses" },
    { code: "6200", name: "Professional Licenses", type: "expense", category: "operating_expenses" },
    { code: "6300", name: "Subcontractor Costs", type: "expense", category: "operating_expenses" },
    { code: "6400", name: "Travel & Client Meetings", type: "expense", category: "operating_expenses" },
    { code: "6500", name: "Professional Insurance", type: "expense", category: "operating_expenses" }
  ],
  manufacturing: [
    // Manufacturing-specific accounts
    { code: "1100", name: "Cash", type: "asset", category: "current_assets" },
    { code: "1200", name: "Accounts Receivable", type: "asset", category: "current_assets" },
    { code: "1310", name: "Raw Materials Inventory", type: "asset", category: "current_assets" },
    { code: "1320", name: "Work in Process Inventory", type: "asset", category: "current_assets" },
    { code: "1330", name: "Finished Goods Inventory", type: "asset", category: "current_assets" },
    { code: "1400", name: "Manufacturing Supplies", type: "asset", category: "current_assets" },
    { code: "1500", name: "Manufacturing Equipment", type: "asset", category: "fixed_assets" },
    { code: "1510", name: "Factory Building", type: "asset", category: "fixed_assets" },
    { code: "1600", name: "Accumulated Depreciation - Equipment", type: "asset", category: "fixed_assets", isContra: true },
    // Manufacturing revenue
    { code: "4100", name: "Product Sales", type: "revenue", category: "revenue" },
    { code: "4200", name: "Custom Manufacturing", type: "revenue", category: "revenue" },
    // Manufacturing costs
    { code: "5100", name: "Raw Materials", type: "expense", category: "cost_of_sales" },
    { code: "5200", name: "Direct Labor", type: "expense", category: "cost_of_sales" },
    { code: "5300", name: "Manufacturing Overhead", type: "expense", category: "cost_of_sales" },
    { code: "5400", name: "Factory Utilities", type: "expense", category: "cost_of_sales" },
    // Operating expenses
    { code: "6100", name: "Factory Maintenance", type: "expense", category: "operating_expenses" },
    { code: "6200", name: "Quality Control", type: "expense", category: "operating_expenses" },
    { code: "6300", name: "Production Planning", type: "expense", category: "operating_expenses" }
  ]
};

// Default product categories by industry
const productCategoriesTemplates = {
  general: ["Products", "Services", "Consulting", "Software", "Hardware"],
  retail: ["Electronics", "Clothing", "Home & Garden", "Sports & Recreation", "Books & Media", "Groceries"],
  services: ["Professional Services", "Consulting", "Training", "Support Services", "Project Work"],
  manufacturing: ["Raw Materials", "Finished Products", "Components", "Assembly Parts", "Custom Products"],
  construction: ["Materials", "Labor", "Equipment Rental", "Subcontractor Services", "Tools"],
  technology: ["Software Licenses", "Hardware", "Cloud Services", "Support & Maintenance", "Development"],
  healthcare: ["Medical Supplies", "Equipment", "Professional Services", "Pharmaceuticals", "Diagnostics"],
  hospitality: ["Accommodation", "Food & Beverage", "Event Services", "Tours & Activities", "Amenities"],
  transport: ["Transportation Services", "Fuel", "Vehicle Maintenance", "Logistics", "Storage"],
  agriculture: ["Seeds & Plants", "Fertilizers", "Equipment", "Livestock", "Harvested Products"],
  nonprofit: ["Programs", "Events", "Educational Materials", "Fundraising", "Community Services"],
  education: ["Course Materials", "Technology", "Facilities", "Educational Services", "Research"]
};

export function registerOnboardingRoutes(app: Express) {
  // Complete onboarding setup
  app.post("/api/onboarding/setup", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const data = onboardingSetupSchema.parse(req.body);
      const userId = req.user.id;

      // Check if user already has companies
      const existingCompanies = await storage.getUserCompanies(userId);
      if (existingCompanies.length > 0) {
        return res.status(400).json({ error: "User already has companies. Onboarding not needed." });
      }

      // Create the company
      const companyData = {
        name: data.name,
        displayName: data.displayName,
        slug: data.slug,
        email: data.email,
        phone: data.phone || null,
        address: data.address || null,
        city: data.city || null,
        postalCode: data.postalCode || null,
        vatNumber: data.vatNumber || null,
        registrationNumber: data.registrationNumber || null,
        industry: data.industry,
        isVatRegistered: data.isVatRegistered,
        vatRegistrationDate: data.isVatRegistered ? new Date().toISOString().split('T')[0] : null,
        vatPeriodMonths: data.vatPeriodMonths,
        vatSubmissionDay: data.vatSubmissionDay,
        subscriptionPlan: data.subscriptionPlan,
        subscriptionStatus: "active",
        subscriptionExpiresAt: new Date(Date.now() + (data.billingPeriod === "yearly" ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString(),
        settings: {
          billingPeriod: data.billingPeriod,
          setupCompleted: true,
          onboardingCompletedAt: new Date().toISOString()
        }
      };

      const company = await storage.createCompany(companyData);

      // Add user as company owner
      await storage.addUserToCompany(userId, company.id, "owner", [
        "dashboard:view", "customers:*", "invoices:*", "estimates:*", 
        "products:*", "expenses:*", "financial:*", "reports:*", 
        "settings:*", "admin:*"
      ]);

      // Set this as the user's active company
      await storage.updateUser(userId, { activeCompanyId: company.id });

      // Create industry-specific chart of accounts
      const chartTemplate = chartOfAccountsTemplates[data.industry as keyof typeof chartOfAccountsTemplates] || chartOfAccountsTemplates.general;
      
      for (const account of chartTemplate) {
        await storage.createChartOfAccount({
          companyId: company.id,
          code: account.code,
          name: account.name,
          type: account.type as "asset" | "liability" | "equity" | "revenue" | "expense",
          category: account.category,
          isActive: true,
          isContra: account.isContra || false,
          balance: "0.00"
        });
      }

      // Create default product categories
      const categoryTemplate = productCategoriesTemplates[data.industry as keyof typeof productCategoriesTemplates] || productCategoriesTemplates.general;
      
      for (const categoryName of categoryTemplate) {
        await storage.createProductCategory({
          companyId: company.id,
          name: categoryName,
          description: `Default ${categoryName.toLowerCase()} category for ${data.industry} business`
        });
      }

      // Create default VAT types if VAT registered
      if (data.isVatRegistered) {
        const defaultVatTypes = [
          { name: "Standard Rate", rate: 15.00, code: "STD", description: "Standard VAT rate", isSystem: true },
          { name: "Zero Rated", rate: 0.00, code: "ZER", description: "Zero-rated VAT", isSystem: true },
          { name: "Exempt", rate: 0.00, code: "EXE", description: "VAT exempt", isSystem: true }
        ];

        for (const vatType of defaultVatTypes) {
          await storage.createVatType({
            companyId: company.id,
            ...vatType,
            isActive: true
          });
        }
      }

      // Create default bank account
      await storage.createBankAccount({
        companyId: company.id,
        accountName: "Primary Business Account",
        accountNumber: "****0000",
        bankName: "Select Your Bank",
        accountType: "checking",
        currentBalance: "0.00",
        currency: "ZAR",
        isActive: true,
        isDefault: true
      });

      // Create welcome journal entry
      const bankAssetAccount = await storage.getChartOfAccountByCode(company.id, "1100");
      const equityAccount = await storage.getChartOfAccountByCode(company.id, "3100");

      if (bankAssetAccount && equityAccount) {
        const journalEntry = await storage.createJournalEntry({
          companyId: company.id,
          entryNumber: "JE-WELCOME-001",
          description: "Welcome to Think MyBiz Accounting - Setup Complete",
          entryDate: new Date().toISOString().split('T')[0],
          reference: "ONBOARDING",
          totalDebit: "0.00",
          totalCredit: "0.00",
          status: "posted"
        });
      }

      res.json({
        success: true,
        company,
        message: "Company setup completed successfully!",
        redirectTo: "/dashboard"
      });

    } catch (error: any) {
      console.error("Onboarding setup error:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: error.errors 
        });
      }
      res.status(500).json({ 
        error: error.message || "Failed to complete onboarding setup" 
      });
    }
  });

  // Get onboarding status
  app.get("/api/onboarding/status", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.id;
      const companies = await storage.getUserCompanies(userId);
      
      const needsOnboarding = companies.length === 0;
      
      res.json({
        needsOnboarding,
        hasCompanies: companies.length > 0,
        companiesCount: companies.length
      });
    } catch (error: any) {
      console.error("Error checking onboarding status:", error);
      res.status(500).json({ error: "Failed to check onboarding status" });
    }
  });

  // Get industry templates preview
  app.get("/api/onboarding/industry-templates", async (req, res) => {
    try {
      const { industry } = req.query;
      
      if (!industry || typeof industry !== 'string') {
        return res.status(400).json({ error: "Industry parameter required" });
      }

      const chartTemplate = chartOfAccountsTemplates[industry as keyof typeof chartOfAccountsTemplates] || chartOfAccountsTemplates.general;
      const categoryTemplate = productCategoriesTemplates[industry as keyof typeof productCategoriesTemplates] || productCategoriesTemplates.general;

      res.json({
        industry,
        chartOfAccounts: chartTemplate,
        productCategories: categoryTemplate,
        accountsCount: chartTemplate.length,
        categoriesCount: categoryTemplate.length
      });
    } catch (error: any) {
      console.error("Error getting industry templates:", error);
      res.status(500).json({ error: "Failed to get industry templates" });
    }
  });
}