import { companies, companyUsers, users, type Company, type InsertCompany, type CompanyUser, type InsertCompanyUser } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface ICompanyStorage {
  // Company management
  createCompany(company: InsertCompany): Promise<Company>;
  getCompany(id: number): Promise<Company | undefined>;
  getCompanyBySlug(slug: string): Promise<Company | undefined>;
  getCompaniesByUser(userId: number): Promise<CompanyUser[]>;
  updateCompany(id: number, company: Partial<InsertCompany>): Promise<Company>;
  deleteCompany(id: number): Promise<void>;
  
  // Company user management
  addUserToCompany(companyUser: InsertCompanyUser): Promise<CompanyUser>;
  removeUserFromCompany(companyId: number, userId: number): Promise<void>;
  updateUserRole(companyId: number, userId: number, role: string, permissions?: string[]): Promise<CompanyUser>;
  getCompanyUsers(companyId: number): Promise<CompanyUser[]>;
  getUserRole(companyId: number, userId: number): Promise<CompanyUser | undefined>;
  
  // Company utilities
  getUserActiveCompany(userId: number): Promise<Company | undefined>;
  setUserActiveCompany(userId: number, companyId: number): Promise<void>;
  checkUserAccess(userId: number, companyId: number): Promise<boolean>;
}

export class CompanyStorage implements ICompanyStorage {
  // Company management
  async createCompany(companyData: InsertCompany, userId?: number): Promise<Company> {
    const [company] = await db
      .insert(companies)
      .values(companyData)
      .returning();
    return company;
  }

  async getCompany(id: number): Promise<Company | undefined> {
    const [company] = await db
      .select()
      .from(companies)
      .where(eq(companies.id, id));
    return company;
  }

  async getCompanyBySlug(slug: string): Promise<Company | undefined> {
    const [company] = await db
      .select()
      .from(companies)
      .where(eq(companies.slug, slug));
    return company;
  }

  async getCompaniesByUser(userId: number): Promise<CompanyUser[]> {
    return await db
      .select({
        id: companyUsers.id,
        companyId: companyUsers.companyId,
        userId: companyUsers.userId,
        role: companyUsers.role,
        permissions: companyUsers.permissions,
        isActive: companyUsers.isActive,
        joinedAt: companyUsers.joinedAt,
        company: companies,
      })
      .from(companyUsers)
      .innerJoin(companies, eq(companyUsers.companyId, companies.id))
      .where(and(
        eq(companyUsers.userId, userId),
        eq(companyUsers.isActive, true),
        eq(companies.isActive, true)
      ))
      .orderBy(desc(companyUsers.joinedAt)) as CompanyUser[];
  }

  async updateCompany(id: number, companyData: Partial<InsertCompany>): Promise<Company> {
    const [company] = await db
      .update(companies)
      .set({
        ...companyData,
        updatedAt: new Date(),
      })
      .where(eq(companies.id, id))
      .returning();
    return company;
  }

  async deleteCompany(id: number): Promise<void> {
    await db
      .update(companies)
      .set({ isActive: false })
      .where(eq(companies.id, id));
  }

  // Company user management
  async addUserToCompany(companyUser: InsertCompanyUser): Promise<CompanyUser> {
    const [result] = await db
      .insert(companyUsers)
      .values(companyUser)
      .returning();
    return result;
  }

  async removeUserFromCompany(companyId: number, userId: number): Promise<void> {
    await db
      .update(companyUsers)
      .set({ isActive: false })
      .where(and(
        eq(companyUsers.companyId, companyId),
        eq(companyUsers.userId, userId)
      ));
  }

  async updateUserRole(companyId: number, userId: number, role: string, permissions: string[] = []): Promise<CompanyUser> {
    const [result] = await db
      .update(companyUsers)
      .set({ role, permissions })
      .where(and(
        eq(companyUsers.companyId, companyId),
        eq(companyUsers.userId, userId)
      ))
      .returning();
    return result;
  }

  async getCompanyUsers(companyId: number): Promise<CompanyUser[]> {
    return await db
      .select({
        id: companyUsers.id,
        companyId: companyUsers.companyId,
        userId: companyUsers.userId,
        role: companyUsers.role,
        permissions: companyUsers.permissions,
        isActive: companyUsers.isActive,
        joinedAt: companyUsers.joinedAt,
        user: users,
      })
      .from(companyUsers)
      .innerJoin(users, eq(companyUsers.userId, users.id))
      .where(and(
        eq(companyUsers.companyId, companyId),
        eq(companyUsers.isActive, true)
      ))
      .orderBy(companyUsers.joinedAt) as CompanyUser[];
  }

  async getUserRole(companyId: number, userId: number): Promise<CompanyUser | undefined> {
    const [result] = await db
      .select()
      .from(companyUsers)
      .where(and(
        eq(companyUsers.companyId, companyId),
        eq(companyUsers.userId, userId),
        eq(companyUsers.isActive, true)
      ));
    return result;
  }

  // Company utilities
  async getUserActiveCompany(userId: number): Promise<Company | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));
    
    if (!user || !user.activeCompanyId) {
      // If no active company set, get the first company the user has access to
      const userCompanies = await this.getCompaniesByUser(userId);
      if (userCompanies.length > 0) {
        const firstCompany = userCompanies[0].company;
        await this.setUserActiveCompany(userId, firstCompany.id);
        return firstCompany;
      }
      return undefined;
    }

    const [company] = await db
      .select()
      .from(companies)
      .where(eq(companies.id, user.activeCompanyId));
    
    return company || undefined;
  }

  async setUserActiveCompany(userId: number, companyId: number): Promise<void> {
    // Verify user has access to this company
    const userRole = await this.getUserRole(companyId, userId);
    if (!userRole) {
      throw new Error("User is not a member of this company");
    }
    
    // Update user's active company in database
    await db
      .update(users)
      .set({ activeCompanyId: companyId })
      .where(eq(users.id, userId));
  }

  async checkUserAccess(userId: number, companyId: number): Promise<boolean> {
    const userRole = await this.getUserRole(companyId, userId);
    return !!userRole;
  }
}

export const companyStorage = new CompanyStorage();