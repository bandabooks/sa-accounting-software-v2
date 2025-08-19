import { storage } from "./storage";
import { hashPassword, ROLES } from "./auth";

export async function seedDatabase() {
  try {
    console.log("Seeding database with initial data...");

    // Create default company if it doesn't exist
    const existingCompanies = await storage.getAllCompanies();
    let defaultCompany;
    
    if (existingCompanies.length === 0) {
      defaultCompany = await storage.createCompany({
        companyId: "904886369",
        name: "Think Mybiz Accounting",
        displayName: "Think Mybiz Accounting",
        slug: "think-mybiz-accounting",
        registrationNumber: "2024/001234/07",
        vatNumber: "4123456789",
        email: "accounts@thinkmybiz.com",
        phone: "+27 11 123 4567",
        address: "123 Business Park Drive",
        city: "Johannesburg",
        postalCode: "2000",
        country: "South Africa",
        industry: "professional-services",
        timezone: "Africa/Johannesburg",
        currency: "ZAR",
        dateFormat: "DD/MM/YYYY",
        isActive: true
      });
      console.log("✓ Default company created");
    } else {
      defaultCompany = existingCompanies[0];
    }

    // Create production admin user if it doesn't exist
    const existingUsers = await storage.getAllUsers();
    if (existingUsers.length === 0) {
      const hashedPassword = await hashPassword("admin123");
      
      await storage.createUser({
        userId: "904886372",
        username: "sysadmin_7f3a2b8e",
        email: "accounts@thinkmybiz.com",
        name: "Production Administrator",
        password: hashedPassword,
        role: "super_admin",
        isActive: true
      });

      // Create demo user  
      const demoPassword = await hashPassword("demo123");
      await storage.createUser({
        userId: "904886373",
        username: "demo",
        email: "demo@thinkmybiz.com", 
        name: "Demo User",
        password: demoPassword,
        role: "accountant",
        isActive: true
      });

      console.log("✓ Production admin and demo users created");
    }

    // Create default roles
    const existingRoles = await storage.getAllRoles();
    if (existingRoles.length === 0) {
      const rolePromises = Object.entries(ROLES).map(([key, roleData]: [string, any]) => 
        storage.createRole({
          name: key,
          description: roleData.name,
          permissions: roleData.permissions,
          isActive: true,
        })
      );
      await Promise.all(rolePromises);
      console.log("✓ Default roles created");
    }

    // Seed South African Chart of Accounts for default company
    const existingAccounts = await storage.getAllChartOfAccounts(defaultCompany.id);
    if (existingAccounts.length === 0) {
      await storage.seedSouthAfricanChartOfAccounts(defaultCompany.id);
      console.log("✓ South African Chart of Accounts seeded");
    }

    // Seed Default South African Banks for default company - Skip since we now use Chart of Accounts
    // const existingBanks = await storage.getBankAccountsFromChartOfAccounts(defaultCompany.id);
    // if (existingBanks.length === 0) {
    //   await storage.seedDefaultSouthAfricanBanks(defaultCompany.id);
    //   console.log("✓ Default South African banks seeded");
    // }

    // Seed South African VAT Types (system-wide, not company-specific)
    try {
      const existingVatTypes = await storage.getVatTypes();
      if (existingVatTypes.length === 0) {
        const SOUTH_AFRICAN_VAT_TYPES = [
          { code: "STD", name: "Standard Rate", rate: "15.00", description: "Standard VAT rate applicable to most goods and services", isSystemType: true },
          { code: "ZER", name: "Zero-Rated", rate: "0.00", description: "Zero-rated supplies (exports, basic foodstuffs)", isSystemType: true },
          { code: "EXE", name: "Exempt", rate: "0.00", description: "Exempt supplies (financial services, residential rent)", isSystemType: true },
          { code: "NR", name: "Not Reportable", rate: "0.00", description: "Non-VAT transactions (wages, dividends)", isSystemType: true },
          { code: "OUT", name: "Out of Scope", rate: "0.00", description: "Transactions outside the scope of VAT", isSystemType: true },
        ];
        
        for (const vatType of SOUTH_AFRICAN_VAT_TYPES) {
          await storage.createVatType(vatType);
        }
        console.log("✓ South African VAT types seeded");
      }
    } catch (error) {
      console.log("VAT types may already exist or schema mismatch - continuing...");
    }

    // Seed default product categories for South African businesses
    const existingCategories = await storage.getAllProductCategories();
    if (existingCategories.length === 0) {
      const DEFAULT_PRODUCT_CATEGORIES = [
        { name: "Professional Services", description: "Accounting, legal, consulting, and other professional services", companyId: defaultCompany.id },
        { name: "Software & Technology", description: "Software licenses, technology services, and IT solutions", companyId: defaultCompany.id },
        { name: "Office Supplies", description: "Stationery, office equipment, and administrative supplies", companyId: defaultCompany.id },
        { name: "Marketing & Advertising", description: "Marketing materials, advertising services, and promotional items", companyId: defaultCompany.id },
        { name: "Training & Education", description: "Training courses, educational materials, and workshops", companyId: defaultCompany.id },
        { name: "Consulting Services", description: "Business consulting, advisory services, and expert guidance", companyId: defaultCompany.id },
        { name: "Financial Services", description: "Banking services, insurance, and financial products", companyId: defaultCompany.id },
        { name: "Manufacturing", description: "Manufacturing products, industrial goods, and production materials", companyId: defaultCompany.id },
        { name: "Retail Products", description: "Retail goods, consumer products, and merchandise", companyId: defaultCompany.id },
        { name: "Construction", description: "Construction services, building materials, and contracting", companyId: defaultCompany.id },
        { name: "Transportation", description: "Transport services, logistics, and delivery", companyId: defaultCompany.id },
        { name: "Healthcare", description: "Medical services, healthcare products, and wellness services", companyId: defaultCompany.id },
        { name: "Food & Beverage", description: "Food products, beverages, and catering services", companyId: defaultCompany.id },
        { name: "Telecommunications", description: "Phone services, internet, and communication solutions", companyId: defaultCompany.id },
        { name: "Utilities", description: "Electricity, water, gas, and other utility services", companyId: defaultCompany.id },
        { name: "Maintenance & Repairs", description: "Maintenance services, repairs, and facility management", companyId: defaultCompany.id },
        { name: "Travel & Accommodation", description: "Travel services, accommodation, and hospitality", companyId: defaultCompany.id },
        { name: "Entertainment", description: "Entertainment services, events, and recreational activities", companyId: defaultCompany.id },
        { name: "Security Services", description: "Security services, surveillance, and protection", companyId: defaultCompany.id },
        { name: "Cleaning Services", description: "Cleaning services, janitorial supplies, and sanitation", companyId: defaultCompany.id }
      ];

      for (const category of DEFAULT_PRODUCT_CATEGORIES) {
        await storage.createProductCategory(category);
      }
      console.log("✓ Default product categories seeded");
    }
    
    // Seed default subscription plans
    const existingPlans = await storage.getActiveSubscriptionPlans();
    if (existingPlans.length === 0) {
      const DEFAULT_SUBSCRIPTION_PLANS = [
        {
          name: "trial",
          displayName: "Free Trial",
          description: "14-day free trial with basic features",
          price: "0.00",
          currency: "ZAR",
          billingCycle: "monthly",
          maxUsers: 2,
          maxCompanies: 1,
          features: ["basic_invoicing", "expense_tracking", "basic_reports"],
          modules: ["dashboard", "sales", "expenses", "customers", "reports"],
          isActive: true,
          trialDays: 14,
          sortOrder: 1
        },
        {
          name: "starter",
          displayName: "Starter Plan",
          description: "Perfect for small businesses and freelancers",
          price: "299.00",
          currency: "ZAR",
          billingCycle: "monthly",
          maxUsers: 5,
          maxCompanies: 1,
          features: ["invoicing", "estimates", "expense_tracking", "basic_reports", "vat_management"],
          modules: ["dashboard", "sales", "purchases", "expenses", "customers", "reports", "vat"],
          isActive: true,
          sortOrder: 2
        },
        {
          name: "professional",
          displayName: "Professional Plan",
          description: "Complete business management for growing companies",
          price: "699.00",
          currency: "ZAR",
          billingCycle: "monthly",
          maxUsers: 25,
          maxCompanies: 3,
          features: ["full_invoicing", "inventory", "projects", "advanced_reports", "sars_integration", "pos"],
          modules: ["dashboard", "sales", "purchases", "products", "customers", "accounting", "banking", "reports", "inventory", "vat", "compliance", "pos", "projects"],
          isActive: true,
          sortOrder: 3
        },
        {
          name: "enterprise",
          displayName: "Enterprise Plan",
          description: "Advanced features for large organizations and accounting practices",
          price: "1499.00",
          currency: "ZAR",
          billingCycle: "monthly",
          maxUsers: -1, // Unlimited
          maxCompanies: -1, // Unlimited
          features: ["everything", "api_access", "custom_fields", "workflow_automation", "advanced_analytics", "multi_company"],
          modules: ["dashboard", "sales", "purchases", "products", "customers", "accounting", "banking", "reports", "inventory", "vat", "compliance", "pos", "advanced_reports", "projects", "payroll", "advanced_analytics", "api_access", "custom_fields", "workflow_automation", "multi_company", "user_management", "settings", "audit"],
          isActive: true,
          sortOrder: 4
        },
      ];

      for (const plan of DEFAULT_SUBSCRIPTION_PLANS) {
        await storage.createSubscriptionPlan(plan);
      }
      console.log("✓ Default subscription plans created");
    }

    // Seed compliance gamification data
    const { complianceGamification } = await import('./compliance-gamification.js');
    await complianceGamification.seedDefaultData();

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}