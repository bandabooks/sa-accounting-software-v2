import { storage } from './storage';

/**
 * Professional ID Generator Service
 * Generates unique incremental IDs for companies and users similar to Zoho's system
 * Company IDs start from 904886369 and increment
 * User IDs start from 905886372 and increment
 */

export class ProfessionalIdGenerator {
  // Base starting numbers for different entity types
  private static readonly COMPANY_ID_BASE = 904886369;
  private static readonly USER_ID_BASE = 905886372;
  
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
   * Format: 9058863XX where XX increments
   */
  static async generateUserId(): Promise<string> {
    try {
      // Get the highest existing user ID
      const existingUsers = await storage.getAllUsers();
      
      let maxId = this.USER_ID_BASE;
      
      // Find the highest existing user ID
      for (const user of existingUsers) {
        if (user.userId) {
          const numericId = parseInt(user.userId);
          if (!isNaN(numericId) && numericId >= this.USER_ID_BASE) {
            maxId = Math.max(maxId, numericId);
          }
        }
      }
      
      // Generate next incremental ID
      const nextId = maxId + 1;
      return nextId.toString();
      
    } catch (error) {
      console.error('Error generating user ID:', error);
      // Fallback to timestamp-based ID if there's an error
      return (this.USER_ID_BASE + Date.now() % 1000000).toString();
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
    return !isNaN(numericId) && numericId >= this.USER_ID_BASE;
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
          const newUserId = currentId.toString();
          await storage.updateUser(user.id, { userId: newUserId });
          console.log(`Assigned User ID ${newUserId} to user: ${user.username}`);
          currentId++;
        }
      }
      
      console.log(`Migration completed for ${users.length} users`);
    } catch (error) {
      console.error('Error migrating existing users:', error);
    }
  }
}

export default ProfessionalIdGenerator;