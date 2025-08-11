import { storage } from './storage';

/**
 * Professional ID Generator Service
 * Generates unique incremental IDs for companies and users similar to Zoho's system
 * Company IDs start from 904886369 and increment
 * User IDs start from 003 and increment (simple format for users)
 */

export class ProfessionalIdGenerator {
  // Base starting numbers for different entity types
  private static readonly COMPANY_ID_BASE = 904886369;
  private static readonly USER_ID_BASE = 3; // Simple user IDs starting from 003
  
  /**
   * Generate a unique company ID
   * Format: 9048863XX where XX increments
   */
  static async generateCompanyId(): Promise<string> {
    try {
      // Get the highest existing company ID
      const existingCompanies = await storage.getAllCompanies();
      
      let maxId = this.COMPANY_ID_BASE;
      
      // Find the highest existing company ID
      for (const company of existingCompanies) {
        if (company.companyId) {
          const numericId = parseInt(company.companyId);
          if (!isNaN(numericId) && numericId >= this.COMPANY_ID_BASE) {
            maxId = Math.max(maxId, numericId);
          }
        }
      }
      
      // Generate next incremental ID
      const nextId = maxId + 1;
      return nextId.toString();
      
    } catch (error) {
      console.error('Error generating company ID:', error);
      // Fallback to timestamp-based ID if there's an error
      return (this.COMPANY_ID_BASE + Date.now() % 1000000).toString();
    }
  }
  
  /**
   * Generate a unique user ID
   * Format: Simple incremental numbers starting from 003 (zero-padded to 3 digits)
   */
  static async generateUserId(): Promise<string> {
    try {
      // Get the highest existing user ID from all users (including deleted ones)
      const maxUsedId = await storage.getMaxUsedUserId();
      
      // Start from USER_ID_BASE if no users exist, otherwise increment from max
      const nextId = Math.max(this.USER_ID_BASE, maxUsedId + 1);
      
      // Format as zero-padded 3-digit string (003, 004, 005, etc.)
      return nextId.toString().padStart(3, '0');
      
    } catch (error) {
      console.error('Error generating user ID:', error);
      // Fallback: use current timestamp modulo for uniqueness
      const fallbackId = this.USER_ID_BASE + (Date.now() % 1000);
      return fallbackId.toString().padStart(3, '0');
    }
  }
  
  /**
   * Validate if an ID follows the professional format
   */
  static isValidCompanyId(id: string): boolean {
    const numericId = parseInt(id);
    return !isNaN(numericId) && numericId >= this.COMPANY_ID_BASE && numericId < this.USER_ID_BASE;
  }
  
  static isValidUserId(id: string): boolean {
    const numericId = parseInt(id);
    return !isNaN(numericId) && numericId >= this.USER_ID_BASE && id.length >= 3;
  }
  
  /**
   * Migration helper: Generate professional IDs for existing entities
   */
  static async migrateExistingCompanies(): Promise<void> {
    try {
      const companies = await storage.getAllCompanies();
      let currentId = this.COMPANY_ID_BASE;
      
      for (const company of companies) {
        if (!company.companyId) {
          const newCompanyId = currentId.toString();
          await storage.updateCompany(company.id, { companyId: newCompanyId });
          console.log(`Assigned Company ID ${newCompanyId} to company: ${company.name}`);
          currentId++;
        }
      }
      
      console.log(`Migration completed for ${companies.length} companies`);
    } catch (error) {
      console.error('Error migrating existing companies:', error);
    }
  }
  
  static async migrateExistingUsers(): Promise<void> {
    try {
      const users = await storage.getAllUsers();
      let currentId = this.USER_ID_BASE;
      
      for (const user of users) {
        if (!user.userId) {
          const newUserId = currentId.toString().padStart(3, '0');
          await storage.updateUser(user.id, { userId: newUserId });
          console.log(`Assigned User ID ${newUserId} to user: ${user.username}`);
          currentId++;
        }
      }
      
      // Update the max used user ID tracker
      if (users.length > 0) {
        const maxId = currentId - 1;
        await storage.updateMaxUsedUserId(maxId);
        console.log(`Set max used user ID tracker to: ${maxId}`);
      }
      
      console.log(`Migration completed for ${users.length} users`);
    } catch (error) {
      console.error('Error migrating existing users:', error);
    }
  }
}

export default ProfessionalIdGenerator;