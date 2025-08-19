import type { Express } from "express";
import { companyStorage } from "./companies";
import { insertCompanySchema, insertCompanyUserSchema } from "@shared/schema";
import { authenticate } from "./auth";
import { z } from "zod";

export function registerCompanyRoutes(app: Express) {
  // Get user's companies
  app.get("/api/companies/my", authenticate, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const userCompanies = await companyStorage.getCompaniesByUser(userId);
      res.json(userCompanies);
    } catch (error) {
      console.error("Error fetching user companies:", error);
      res.status(500).json({ message: "Failed to fetch companies" });
    }
  });

  // Get active company for user
  app.get("/api/companies/active", authenticate, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const activeCompany = await companyStorage.getUserActiveCompany(userId);
      if (!activeCompany) {
        return res.status(404).json({ message: "No active company found" });
      }
      res.json(activeCompany);
    } catch (error) {
      console.error("Error fetching active company:", error);
      res.status(500).json({ message: "Failed to fetch active company" });
    }
  });

  // Create new company
  app.post("/api/companies", authenticate, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const companyData = insertCompanySchema.parse(req.body);
      
      // Generate company ID using the ID generator
      const { ProfessionalIdGenerator } = await import('./idGenerator.js');
      const companyId = await ProfessionalIdGenerator.generateCompanyId();
      
      // Generate a unique slug from company name if not provided
      let slug = companyData.slug;
      if (!slug && companyData.name) {
        slug = companyData.name.toLowerCase()
          .replace(/[^a-z0-9\s]/g, '')
          .replace(/\s+/g, '-')
          .trim();
        
        // Ensure slug is unique
        let uniqueSlug = slug;
        let counter = 1;
        while (await companyStorage.getCompanyBySlug(uniqueSlug)) {
          uniqueSlug = `${slug}-${counter}`;
          counter++;
        }
        slug = uniqueSlug;
      }
      
      // Create company with user ID for proper initialization  
      const company = await companyStorage.createCompany({
        ...companyData,
        companyId,
        slug: slug || `company-${companyId}`
      }, userId);
      
      // Add creator as owner
      await companyStorage.addUserToCompany({
        companyId: company.id,
        userId: userId,
        role: "owner",
        permissions: ["*"], // Full permissions for owner
        isActive: true,
      });
      
      res.status(201).json(company);
    } catch (error) {
      console.error("Error creating company:", error);
      
      // Handle validation errors specifically
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation failed",
          errors: error.errors 
        });
      }
      
      // Handle database constraint violations
      if ((error as any).code === '23505') { // Unique constraint violation
        return res.status(409).json({ 
          message: "Company with this name or email already exists" 
        });
      }
      
      res.status(500).json({ message: "Failed to create company", error: (error as Error).message });
    }
  });

  // Get company by ID
  app.get("/api/companies/:id", authenticate, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Check user access
      const hasAccess = await companyStorage.checkUserAccess(userId, companyId);
      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const company = await companyStorage.getCompany(companyId);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      
      res.json(company);
    } catch (error) {
      console.error("Error fetching company:", error);
      res.status(500).json({ message: "Failed to fetch company" });
    }
  });

  // Update company
  app.patch("/api/companies/:id", authenticate, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Check if user is owner or admin
      const userRole = await companyStorage.getUserRole(companyId, userId);
      if (!userRole || !["owner", "admin"].includes(userRole.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const updateData = insertCompanySchema.partial().parse(req.body);
      const company = await companyStorage.updateCompany(companyId, updateData);
      
      res.json(company);
    } catch (error) {
      console.error("Error updating company:", error);
      res.status(500).json({ message: "Failed to update company" });
    }
  });

  // Get company users
  app.get("/api/companies/:id/users", authenticate, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Check user access
      const hasAccess = await companyStorage.checkUserAccess(userId, companyId);
      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const companyUsers = await companyStorage.getCompanyUsers(companyId);
      res.json(companyUsers);
    } catch (error) {
      console.error("Error fetching company users:", error);
      res.status(500).json({ message: "Failed to fetch company users" });
    }
  });

  // Add user to company
  app.post("/api/companies/:id/users", authenticate, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const currentUserId = req.user.id;
      
      // Check if current user is owner or admin
      const currentUserRole = await companyStorage.getUserRole(companyId, currentUserId);
      if (!currentUserRole || !["owner", "admin"].includes(currentUserRole.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const schema = z.object({
        userId: z.number(),
        role: z.enum(["admin", "manager", "accountant", "employee"]).default("employee"),
        permissions: z.array(z.string()).default([]),
      });
      
      const { userId, role, permissions } = schema.parse(req.body);
      
      const companyUser = await companyStorage.addUserToCompany({
        companyId,
        userId,
        role,
        permissions,
        isActive: true,
      });
      
      res.status(201).json(companyUser);
    } catch (error) {
      console.error("Error adding user to company:", error);
      res.status(500).json({ message: "Failed to add user to company" });
    }
  });

  // Update user role in company
  app.patch("/api/companies/:id/users/:userId", authenticate, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const targetUserId = parseInt(req.params.userId);
      const currentUserId = req.user.id;
      
      // Check if current user is owner or admin
      const currentUserRole = await companyStorage.getUserRole(companyId, currentUserId);
      if (!currentUserRole || !["owner", "admin"].includes(currentUserRole.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const schema = z.object({
        role: z.enum(["admin", "manager", "accountant", "employee"]),
        permissions: z.array(z.string()).optional(),
      });
      
      const { role, permissions } = schema.parse(req.body);
      
      const updatedUser = await companyStorage.updateUserRole(companyId, targetUserId, role, permissions);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  // Remove user from company
  app.delete("/api/companies/:id/users/:userId", authenticate, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const targetUserId = parseInt(req.params.userId);
      const currentUserId = req.user.id;
      
      // Check if current user is owner or admin
      const currentUserRole = await companyStorage.getUserRole(companyId, currentUserId);
      if (!currentUserRole || !["owner", "admin"].includes(currentUserRole.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Cannot remove the owner
      const targetUserRole = await companyStorage.getUserRole(companyId, targetUserId);
      if (targetUserRole?.role === "owner") {
        return res.status(400).json({ message: "Cannot remove company owner" });
      }
      
      await companyStorage.removeUserFromCompany(companyId, targetUserId);
      res.json({ message: "User removed from company" });
    } catch (error) {
      console.error("Error removing user from company:", error);
      res.status(500).json({ message: "Failed to remove user from company" });
    }
  });

  // Set active company for user
  app.post("/api/companies/:id/set-active", authenticate, async (req: any, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Check user access
      const hasAccess = await companyStorage.checkUserAccess(userId, companyId);
      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      await companyStorage.setUserActiveCompany(userId, companyId);
      res.json({ message: "Active company updated" });
    } catch (error) {
      console.error("Error setting active company:", error);
      res.status(500).json({ message: "Failed to set active company" });
    }
  });
}