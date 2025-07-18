import { hashPassword } from "./auth";
import { storage } from "./storage";
import crypto from "crypto";

export async function setupProductionAdmin() {
  console.log("Setting up production admin credentials...");
  
  // Generate secure random password
  const securePassword = crypto.randomBytes(16).toString('hex');
  const hashedPassword = await hashPassword(securePassword);
  
  // Update admin with secure credentials
  const adminUser = await storage.getUserByUsername('admin');
  if (adminUser) {
    await storage.updateUser(adminUser.id, {
      password: hashedPassword,
      email: 'your-email@thinkmybiz.com', // Change this to your real email
      name: 'Production Administrator',
      isActive: true,
      role: 'admin'
    });
    
    console.log("=================================");
    console.log("PRODUCTION ADMIN CREDENTIALS");
    console.log("=================================");
    console.log(`Username: admin`);
    console.log(`Password: ${securePassword}`);
    console.log(`Email: your-email@thinkmybiz.com`);
    console.log("=================================");
    console.log("SAVE THESE CREDENTIALS SECURELY!");
    console.log("=================================");
  }
}

export async function createDemoAccount() {
  console.log("Creating demo account...");
  
  const demoExists = await storage.getUserByUsername('demo');
  if (!demoExists) {
    const hashedPassword = await hashPassword('demo123');
    await storage.createUser({
      username: 'demo',
      password: hashedPassword,
      name: 'Demo User',
      email: 'demo@thinkmybiz.com',
      role: 'manager', // Limited permissions
      permissions: {
        dashboard_view: true,
        invoice_view: true,
        customer_view: true,
        estimate_view: true,
        payment_view: true,
        financial_reports_view: true
      },
      isActive: true,
    });
    
    console.log("Demo account created:");
    console.log("Username: demo");
    console.log("Password: demo123");
    console.log("Role: Manager (read-only access)");
  }
}