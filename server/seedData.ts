import { storage } from "./storage";
import { hashPassword, PERMISSIONS, ROLES } from "./auth";

export async function seedDatabase() {
  console.log("Seeding database with initial data...");
  
  try {
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
      });
      console.log("✓ Default admin user created (username: admin, password: admin123)");
    }
    
    // Create default roles
    const existingRoles = await storage.getAllRoles();
    if (existingRoles.length === 0) {
      const rolePromises = Object.entries(ROLES).map(([key, roleData]) => 
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
    
    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}