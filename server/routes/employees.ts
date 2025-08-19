import type { Express } from "express";
import { z } from "zod";
import { db } from "../db";
import { employees, departments } from "../../shared/schema";
import { eq, and, like, or } from "drizzle-orm";
import { authenticate, type AuthenticatedRequest } from "../auth";

const employeeSchema = z.object({
  employeeNumber: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  idNumber: z.string(),
  passportNumber: z.string().optional(),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  position: z.string(),
  department: z.string().optional(),
  departmentId: z.number().optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  employmentType: z.enum(['permanent', 'contract', 'temporary', 'part_time']).default('permanent'),
  status: z.enum(['active', 'inactive', 'terminated']).default('active'),
  basicSalary: z.number(),
  payrollFrequency: z.enum(['monthly', 'weekly', 'bi_weekly']).default('monthly'),
  taxNumber: z.string().optional(),
  bankName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankBranchCode: z.string().optional(),
  uifNumber: z.string().optional(),
  medicalAidNumber: z.string().optional(),
  medicalAidScheme: z.string().optional(),
  pensionFundNumber: z.string().optional(),
  emergencyContact: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    relationship: z.string().optional(),
  }).optional(),
});

const departmentSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  managerId: z.number().optional(),
  budget: z.number().optional(),
  location: z.string().optional(),
});

export function registerEmployeeRoutes(app: Express) {
  // Get all employees for a company
  app.get("/api/employees", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = req.user.companyId;
      
      const result = await db
        .select()
        .from(employees)
        .where(eq(employees.companyId, companyId))
        .orderBy(employees.firstName);

      res.json(result);
    } catch (error) {
      console.error("Error fetching employees:", error);
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  });

  // Get single employee
  app.get("/api/employees/:id", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const companyId = req.user.companyId;
      
      const [employee] = await db
        .select()
        .from(employees)
        .where(and(eq(employees.id, parseInt(id)), eq(employees.companyId, companyId)));

      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      res.json(employee);
    } catch (error) {
      console.error("Error fetching employee:", error);
      res.status(500).json({ message: "Failed to fetch employee" });
    }
  });

  // Create new employee
  app.post("/api/employees", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = req.user.companyId;
      const data = employeeSchema.parse(req.body);
      
      const [newEmployee] = await db
        .insert(employees)
        .values({
          ...data,
          companyId,
          startDate: new Date(data.startDate),
          endDate: data.endDate ? new Date(data.endDate) : null,
          emergencyContact: data.emergencyContact || {},
        })
        .returning();

      res.status(201).json(newEmployee);
    } catch (error) {
      console.error("Error creating employee:", error);
      res.status(500).json({ message: "Failed to create employee" });
    }
  });

  // Update employee
  app.put("/api/employees/:id", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const companyId = req.user.companyId;
      const data = employeeSchema.partial().parse(req.body);
      
      const updateData = {
        ...data,
        ...(data.startDate && { startDate: new Date(data.startDate) }),
        ...(data.endDate && { endDate: new Date(data.endDate) }),
        ...(data.emergencyContact && { emergencyContact: data.emergencyContact }),
        updatedAt: new Date(),
      };

      const [updatedEmployee] = await db
        .update(employees)
        .set(updateData)
        .where(and(eq(employees.id, parseInt(id)), eq(employees.companyId, companyId)))
        .returning();

      if (!updatedEmployee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      res.json(updatedEmployee);
    } catch (error) {
      console.error("Error updating employee:", error);
      res.status(500).json({ message: "Failed to update employee" });
    }
  });

  // Delete employee
  app.delete("/api/employees/:id", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const companyId = req.user.companyId;
      
      const [deletedEmployee] = await db
        .delete(employees)
        .where(and(eq(employees.id, parseInt(id)), eq(employees.companyId, companyId)))
        .returning();

      if (!deletedEmployee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      res.json({ message: "Employee deleted successfully" });
    } catch (error) {
      console.error("Error deleting employee:", error);
      res.status(500).json({ message: "Failed to delete employee" });
    }
  });

  // Department routes
  app.get("/api/departments", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = req.user.companyId;
      
      const result = await db
        .select()
        .from(departments)
        .where(eq(departments.companyId, companyId))
        .orderBy(departments.name);

      res.json(result);
    } catch (error) {
      console.error("Error fetching departments:", error);
      res.status(500).json({ message: "Failed to fetch departments" });
    }
  });

  // Create department
  app.post("/api/departments", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = req.user.companyId;
      const data = departmentSchema.parse(req.body);
      
      const [newDepartment] = await db
        .insert(departments)
        .values({ ...data, companyId })
        .returning();

      res.status(201).json(newDepartment);
    } catch (error) {
      console.error("Error creating department:", error);
      res.status(500).json({ message: "Failed to create department" });
    }
  });

  // Update department
  app.put("/api/departments/:id", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const companyId = req.user.companyId;
      const data = departmentSchema.partial().parse(req.body);
      
      const [updatedDepartment] = await db
        .update(departments)
        .set({ ...data, updatedAt: new Date() })
        .where(and(eq(departments.id, parseInt(id)), eq(departments.companyId, companyId)))
        .returning();

      if (!updatedDepartment) {
        return res.status(404).json({ message: "Department not found" });
      }

      res.json(updatedDepartment);
    } catch (error) {
      console.error("Error updating department:", error);
      res.status(500).json({ message: "Failed to update department" });
    }
  });

  // Delete department
  app.delete("/api/departments/:id", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const companyId = req.user.companyId;
      
      const [deletedDepartment] = await db
        .delete(departments)
        .where(and(eq(departments.id, parseInt(id)), eq(departments.companyId, companyId)))
        .returning();

      if (!deletedDepartment) {
        return res.status(404).json({ message: "Department not found" });
      }

      res.json({ message: "Department deleted successfully" });
    } catch (error) {
      console.error("Error deleting department:", error);
      res.status(500).json({ message: "Failed to delete department" });
    }
  });
}