import { storage } from "./storage";
import { hashPassword, PERMISSIONS, ROLES } from "./auth";

export async function seedDatabase() {
  console.log("Seeding database with initial data...");
  
  try {
    // Create default company first
    const existingCompanies = await storage.getAllCompanies();
    let defaultCompany;
    if (existingCompanies.length === 0) {
      defaultCompany = await storage.createCompany({
        name: 'Think Mybiz Accounting',
        email: 'accounts@thinkmybiz.com',
        phone: '+27 11 123 4567',
        address: '123 Business Street',
        city: 'Johannesburg',
        postalCode: '2000',
        country: 'South Africa',
        vatNumber: '4123456789',
        currency: 'ZAR',
        timeZone: 'Africa/Johannesburg',
        logoUrl: null,
        isActive: true,
      });
      console.log("✓ Default company created");
    } else {
      defaultCompany = existingCompanies[0];
    }

    // Create default admin user
    const adminExists = await storage.getUserByUsername('admin');
    if (!adminExists) {
      const hashedPassword = await hashPassword('admin123');
      await storage.createUser({
        username: 'admin',
        password: hashedPassword,
        name: 'System Administrator',
        email: 'admin@thinkmybiz.com',
        role: 'admin',
        permissions: ROLES.admin.permissions,
        isActive: true,
        companyId: defaultCompany.id,
      });
      console.log("✓ Default admin user created (username: admin, password: admin123)");
    }

    // Create Production Administrator if not exists
    const prodAdminExists = await storage.getUserByUsername('sysadmin_7f3a2b8e');
    if (!prodAdminExists) {
      const hashedPassword = await hashPassword('Prod#2025!MyBiz$Secure');
      await storage.createUser({
        username: 'sysadmin_7f3a2b8e',
        password: hashedPassword,
        name: 'Production Administrator',
        email: 'accounts@thinkmybiz.com',
        role: 'admin',
        permissions: ROLES.admin.permissions,
        isActive: true,
        companyId: defaultCompany.id,
      });
      console.log("✓ Production Administrator created");
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

    // Seed Default South African Banks for default company
    const existingBanks = await storage.getAllBankAccounts(defaultCompany.id);
    if (existingBanks.length === 0) {
      await storage.seedDefaultSouthAfricanBanks(defaultCompany.id);
      console.log("✓ Default South African banks seeded");
    }

    // Seed South African VAT Types
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

      // Seed default product categories for South African businesses
      const existingCategories = await storage.getAllProductCategories(defaultCompany.id);
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
    }
    
    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}