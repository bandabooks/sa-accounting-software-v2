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
    
    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}