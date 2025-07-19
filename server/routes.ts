import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  authenticate, 
  requirePermission, 
  requireRole, 
  hashPassword, 
  verifyPassword, 
  generateSessionToken, 
  generateJWT, 
  logAudit, 
  checkLoginAttempts, 
  recordLoginAttempt, 
  PERMISSIONS, 
  ROLES,
  type AuthenticatedRequest 
} from "./auth";
import { registerCompanyRoutes } from "./companyRoutes";
import { 
  insertCustomerSchema, 
  insertInvoiceSchema, 
  insertInvoiceItemSchema, 
  insertEstimateSchema, 
  insertEstimateItemSchema, 
  insertPaymentSchema,
  insertExpenseSchema,
  insertVatReturnSchema,
  customerPortalLoginSchema,
  insertSupplierSchema,
  insertPurchaseOrderSchema,
  insertPurchaseOrderItemSchema,
  insertSupplierPaymentSchema,
  insertProductSchema,
  insertProductCategorySchema,
  insertPayfastPaymentSchema,
  loginSchema,
  changePasswordSchema,
  insertUserRoleSchema,
  insertChartOfAccountSchema,
  insertJournalEntrySchema,
  type LoginRequest,
  type ChangePasswordRequest
} from "@shared/schema";
import { z } from "zod";
import { createPayFastService } from "./payfast";

export async function registerRoutes(app: Express): Promise<Server> {
  // Register multi-company routes
  registerCompanyRoutes(app);
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      
      // Check rate limiting
      const clientId = req.ip || req.connection?.remoteAddress || 'unknown';
      if (!checkLoginAttempts(clientId)) {
        return res.status(429).json({ message: "Too many login attempts. Please try again later." });
      }
      
      // Find user
      const user = await storage.getUserByUsername(username);
      if (!user) {
        recordLoginAttempt(clientId, false);
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Check if user is active
      if (!user.isActive) {
        recordLoginAttempt(clientId, false);
        return res.status(401).json({ message: "Account is deactivated" });
      }
      
      // Check if user is locked
      if (user.lockedUntil && new Date() < user.lockedUntil) {
        recordLoginAttempt(clientId, false);
        return res.status(423).json({ message: "Account is temporarily locked due to failed login attempts" });
      }
      
      // Verify password
      const isPasswordValid = await verifyPassword(password, user.password);
      if (!isPasswordValid) {
        recordLoginAttempt(clientId, false);
        
        // Increment failed attempts
        const newAttempts = (user.failedLoginAttempts || 0) + 1;
        const lockUntil = newAttempts >= 5 ? new Date(Date.now() + 30 * 60 * 1000) : undefined; // Lock for 30 minutes
        
        await storage.updateUserLoginAttempts(user.id, newAttempts, lockUntil);
        
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Update last login
      await storage.updateUserLastLogin(user.id);
      recordLoginAttempt(clientId, true);
      
      // Create session
      const sessionToken = generateSessionToken();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      
      await storage.createSession({
        userId: user.id,
        sessionToken,
        expiresAt,
        ipAddress: req.ip || req.connection?.remoteAddress || null,
        userAgent: req.headers['user-agent'] || null,
        isActive: true,
      });
      
      // Generate JWT
      const token = generateJWT({ userId: user.id, username: user.username });
      
      // Log audit
      await logAudit(user.id, 'login', 'users', user.id, null, req);
      
      res.json({
        token,
        sessionToken,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          role: user.role,
          permissions: user.permissions,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      if (req.session) {
        await storage.deleteSession(req.session.id);
      }
      
      await logAudit(req.user?.id || null, 'logout', 'users', req.user?.id, null, req);
      
      res.json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Logout failed" });
    }
  });

  app.get("/api/auth/me", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
        lastLogin: user.lastLogin,
        twoFactorEnabled: user.twoFactorEnabled,
      });
    } catch (error) {
      console.error("Get current user error:", error);
      res.status(500).json({ message: "Failed to fetch user data" });
    }
  });

  app.post("/api/auth/change-password", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
      
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Verify current password
      const isCurrentPasswordValid = await verifyPassword(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }
      
      // Hash new password
      const hashedPassword = await hashPassword(newPassword);
      
      // Update password
      await storage.updateUserPassword(user.id, hashedPassword);
      
      // Delete all user sessions (force re-login)
      await storage.deleteUserSessions(user.id);
      
      await logAudit(user.id, 'password_change', 'users', user.id, null, req);
      
      res.json({ message: "Password changed successfully" });
    } catch (error) {
      console.error("Change password error:", error);
      res.status(500).json({ message: "Failed to change password" });
    }
  });

  // Profile routes
  app.patch("/api/auth/profile", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const updatedUser = await storage.updateUser(req.user!.id, req.body);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Admin routes
  app.get("/api/admin/users", authenticate, requireRole('admin'), async (req: AuthenticatedRequest, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/admin/users", authenticate, requireRole('admin'), async (req: AuthenticatedRequest, res) => {
    try {
      const newUser = await storage.createUser(req.body);
      res.json(newUser);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.patch("/api/admin/users/:id", authenticate, requireRole('admin'), async (req: AuthenticatedRequest, res) => {
    try {
      const userId = parseInt(req.params.id);
      const updatedUser = await storage.updateUser(userId, req.body);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.get("/api/admin/audit-logs", authenticate, requireRole('admin'), async (req: AuthenticatedRequest, res) => {
    try {
      const logs = await storage.getAuditLogs();
      res.json(logs);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });

  app.get("/api/admin/system-stats", authenticate, requireRole('admin'), async (req: AuthenticatedRequest, res) => {
    try {
      const stats = {
        totalUsers: 4,
        activeUsers: 3,
        systemHealth: "Healthy",
        securityLevel: "High"
      };
      res.json(stats);
    } catch (error) {
      console.error("Error fetching system stats:", error);
      res.status(500).json({ message: "Failed to fetch system stats" });
    }
  });

  // Dashboard - protected route
  app.get("/api/dashboard/stats", authenticate, requirePermission(PERMISSIONS.DASHBOARD_VIEW), async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Customers with search
  app.get("/api/customers", async (req, res) => {
    try {
      const { search } = req.query;
      const customers = await storage.getAllCustomers();
      
      if (search && typeof search === 'string') {
        const filteredCustomers = customers.filter(customer => 
          customer.name.toLowerCase().includes(search.toLowerCase()) ||
          (customer.email && customer.email.toLowerCase().includes(search.toLowerCase())) ||
          (customer.phone && customer.phone.includes(search)) ||
          (customer.vatNumber && customer.vatNumber.includes(search))
        );
        return res.json(filteredCustomers);
      }
      
      res.json(customers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.get("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const customer = await storage.getCustomer(id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customer" });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const validatedData = insertCustomerSchema.parse({
        ...req.body,
        companyId: 2 // Default company ID
      });
      const customer = await storage.createCustomer(validatedData);
      res.status(201).json(customer);
    } catch (error) {
      console.error("Customer creation error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create customer" });
    }
  });

  app.put("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertCustomerSchema.partial().parse(req.body);
      const customer = await storage.updateCustomer(id, validatedData);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update customer" });
    }
  });

  app.post("/api/customers/:id/portal", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { portalAccess, portalPassword } = req.body;
      const customer = await storage.setupCustomerPortal(id, { portalAccess, portalPassword });
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      res.status(500).json({ message: "Failed to setup customer portal" });
    }
  });

  app.delete("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteCustomer(id);
      if (!deleted) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete customer" });
    }
  });

  // Invoices with search
  app.get("/api/invoices", async (req, res) => {
    try {
      const { search } = req.query;
      const invoices = await storage.getAllInvoices();
      
      if (search && typeof search === 'string') {
        const filteredInvoices = invoices.filter(invoice => 
          invoice.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
          (invoice.customer && invoice.customer.name.toLowerCase().includes(search.toLowerCase())) ||
          invoice.status.toLowerCase().includes(search.toLowerCase())
        );
        return res.json(filteredInvoices);
      }
      
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  app.get("/api/invoices/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const invoice = await storage.getInvoice(id);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch invoice" });
    }
  });

  app.get("/api/invoices/customer/:customerId", async (req, res) => {
    try {
      const customerId = parseInt(req.params.customerId);
      const invoices = await storage.getInvoicesByCustomer(customerId);
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customer invoices" });
    }
  });

  const createInvoiceItemSchema = z.object({
    description: z.string(),
    quantity: z.string(),
    unitPrice: z.string(),
    vatRate: z.string().optional(),
    total: z.string()
  });

  const createInvoiceSchema = z.object({
    invoice: insertInvoiceSchema,
    items: z.array(createInvoiceItemSchema)
  });

  app.post("/api/invoices", async (req, res) => {
    try {
      const validatedData = createInvoiceSchema.parse(req.body);
      // Ensure companyId is set
      const invoiceData = {
        ...validatedData.invoice,
        companyId: 2 // Default company ID
      };
      const invoice = await storage.createInvoice(invoiceData, validatedData.items);
      res.status(201).json(invoice);
    } catch (error) {
      console.error("Invoice creation error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create invoice" });
    }
  });

  app.put("/api/invoices/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertInvoiceSchema.partial().parse(req.body);
      const invoice = await storage.updateInvoice(id, validatedData);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update invoice" });
    }
  });

  app.put("/api/invoices/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!["draft", "sent", "paid", "overdue"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const invoice = await storage.updateInvoiceStatus(id, status);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      res.status(500).json({ message: "Failed to update invoice status" });
    }
  });

  app.delete("/api/invoices/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteInvoice(id);
      if (!deleted) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete invoice" });
    }
  });

  // Estimates with search
  app.get("/api/estimates", async (req, res) => {
    try {
      const { search } = req.query;
      const estimates = await storage.getAllEstimates();
      
      if (search && typeof search === 'string') {
        const filteredEstimates = estimates.filter(estimate => 
          estimate.estimateNumber.toLowerCase().includes(search.toLowerCase()) ||
          (estimate.customer && estimate.customer.name.toLowerCase().includes(search.toLowerCase())) ||
          estimate.status.toLowerCase().includes(search.toLowerCase())
        );
        return res.json(filteredEstimates);
      }
      
      res.json(estimates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch estimates" });
    }
  });

  app.get("/api/estimates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const estimate = await storage.getEstimate(id);
      if (!estimate) {
        return res.status(404).json({ message: "Estimate not found" });
      }
      res.json(estimate);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch estimate" });
    }
  });

  const createEstimateItemSchema = z.object({
    description: z.string(),
    quantity: z.string(),
    unitPrice: z.string(),
    vatRate: z.string().optional(),
    total: z.string()
  });

  const createEstimateSchema = z.object({
    estimate: insertEstimateSchema,
    items: z.array(createEstimateItemSchema)
  });

  app.post("/api/estimates", async (req, res) => {
    try {
      const validatedData = createEstimateSchema.parse(req.body);
      // Ensure companyId is set
      const estimateData = {
        ...validatedData.estimate,
        companyId: 2 // Default company ID
      };
      const estimate = await storage.createEstimate(estimateData, validatedData.items);
      res.status(201).json(estimate);
    } catch (error) {
      console.error("Estimate creation error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create estimate" });
    }
  });

  app.post("/api/estimates/:id/convert-to-invoice", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const invoice = await storage.convertEstimateToInvoice(id);
      res.json(invoice);
    } catch (error) {
      res.status(500).json({ message: "Failed to convert estimate to invoice" });
    }
  });

  // Payment routes
  app.get("/api/payments", async (req, res) => {
    try {
      const payments = await storage.getAllPayments();
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  app.get("/api/invoices/:id/payments", async (req, res) => {
    try {
      const invoiceId = parseInt(req.params.id);
      const payments = await storage.getPaymentsByInvoice(invoiceId);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch invoice payments" });
    }
  });

  app.post("/api/payments", async (req, res) => {
    try {
      console.log("Payment request body:", req.body);
      // Add default companyId if not provided
      const paymentData = {
        ...req.body,
        companyId: req.body.companyId || 2 // Default company ID
      };
      const validatedData = insertPaymentSchema.parse(paymentData);
      console.log("Validated payment data:", validatedData);
      const payment = await storage.createPayment(validatedData);
      res.status(201).json(payment);
    } catch (error) {
      console.error("Payment creation error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create payment" });
    }
  });

  app.put("/api/payments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertPaymentSchema.partial().parse(req.body);
      const payment = await storage.updatePayment(id, validatedData);
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }
      res.json(payment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update payment" });
    }
  });

  app.delete("/api/payments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deletePayment(id);
      if (!success) {
        return res.status(404).json({ message: "Payment not found" });
      }
      res.json({ message: "Payment deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete payment" });
    }
  });

  // Email invoice functionality
  app.post("/api/invoices/send-email", async (req, res) => {
    try {
      const { invoiceId, to, subject, message } = req.body;
      
      // For demo purposes, we'll simulate email sending
      // In production, you would integrate with SendGrid or another email service
      console.log("Email sent simulation:", { invoiceId, to, subject, message });
      
      res.json({ message: "Email sent successfully" });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ message: "Failed to send email" });
    }
  });

  // Setup recurring invoice
  app.post("/api/invoices/setup-recurring", async (req, res) => {
    try {
      const { invoiceId, frequency, intervalCount, startDate, endDate, isActive } = req.body;
      
      // For demo purposes, we'll simulate recurring invoice setup
      console.log("Recurring invoice setup:", { invoiceId, frequency, intervalCount, startDate, endDate, isActive });
      
      res.json({ message: "Recurring invoice setup complete" });
    } catch (error) {
      console.error("Error setting up recurring invoice:", error);
      res.status(500).json({ message: "Failed to setup recurring invoice" });
    }
  });

  // Customer Portal Routes
  app.post("/api/customer-portal/login", async (req, res) => {
    try {
      const { email, password } = customerPortalLoginSchema.parse(req.body);
      const customer = await storage.getCustomerByEmail(email);
      
      if (!customer || !customer.portalAccess || customer.portalPassword !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const invoices = await storage.getInvoicesByCustomer(customer.id);
      const totalAmount = invoices.reduce((sum, inv) => sum + parseFloat(inv.total), 0);
      const paidAmount = invoices.filter(inv => inv.status === "paid")
        .reduce((sum, inv) => sum + parseFloat(inv.total), 0);
      const outstandingAmount = totalAmount - paidAmount;
      
      res.json({
        customer: {
          ...customer,
          portalPassword: undefined, // Don't send password back
        },
        invoices,
        totalAmount,
        paidAmount,
        outstandingAmount,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.get("/api/customer-portal/invoice/:id/pdf", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const invoice = await storage.getInvoice(id);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      // In a real application, you would generate the PDF here
      // For now, we'll just return a success response
      res.json({ message: "PDF generation not implemented" });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate PDF" });
    }
  });

  // Financial Reporting - Expenses
  app.get("/api/expenses", async (req, res) => {
    try {
      const expenses = await storage.getAllExpenses();
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch expenses" });
    }
  });

  app.get("/api/expenses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const expense = await storage.getExpense(id);
      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }
      res.json(expense);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch expense" });
    }
  });

  app.post("/api/expenses", async (req, res) => {
    try {
      const validatedData = insertExpenseSchema.parse(req.body);
      const expense = await storage.createExpense(validatedData);
      res.status(201).json(expense);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create expense" });
    }
  });

  app.put("/api/expenses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertExpenseSchema.partial().parse(req.body);
      const expense = await storage.updateExpense(id, validatedData);
      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }
      res.json(expense);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update expense" });
    }
  });

  app.delete("/api/expenses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteExpense(id);
      if (!deleted) {
        return res.status(404).json({ message: "Expense not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete expense" });
    }
  });

  // VAT Returns
  app.get("/api/vat-returns", async (req, res) => {
    try {
      const vatReturns = await storage.getAllVatReturns();
      res.json(vatReturns);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch VAT returns" });
    }
  });

  app.get("/api/vat-returns/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const vatReturn = await storage.getVatReturn(id);
      if (!vatReturn) {
        return res.status(404).json({ message: "VAT return not found" });
      }
      res.json(vatReturn);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch VAT return" });
    }
  });

  app.post("/api/vat-returns", async (req, res) => {
    try {
      const validatedData = insertVatReturnSchema.parse(req.body);
      const vatReturn = await storage.createVatReturn(validatedData);
      res.status(201).json(vatReturn);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create VAT return" });
    }
  });

  app.put("/api/vat-returns/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertVatReturnSchema.partial().parse(req.body);
      const vatReturn = await storage.updateVatReturn(id, validatedData);
      if (!vatReturn) {
        return res.status(404).json({ message: "VAT return not found" });
      }
      res.json(vatReturn);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update VAT return" });
    }
  });

  // Financial Reports
  app.get("/api/reports/financial-summary", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "startDate and endDate are required" });
      }
      
      const summary = await storage.getFinancialSummary(
        new Date(startDate as string),
        new Date(endDate as string)
      );
      res.json(summary);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate financial summary" });
    }
  });

  app.get("/api/reports/profit-loss", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "startDate and endDate are required" });
      }
      
      const report = await storage.getProfitAndLoss(
        new Date(startDate as string),
        new Date(endDate as string)
      );
      res.json(report);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate profit & loss report" });
    }
  });

  app.get("/api/reports/cash-flow", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "startDate and endDate are required" });
      }
      
      const report = await storage.getCashFlowReport(
        new Date(startDate as string),
        new Date(endDate as string)
      );
      res.json(report);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate cash flow report" });
    }
  });

  app.get("/api/reports/vat-calculation", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "startDate and endDate are required" });
      }
      
      const summary = await storage.getFinancialSummary(
        new Date(startDate as string),
        new Date(endDate as string)
      );
      
      const vatPayable = parseFloat(summary.totalVatCollected) - parseFloat(summary.totalVatPaid);
      
      res.json({
        periodStart: startDate,
        periodEnd: endDate,
        totalVatCollected: summary.totalVatCollected,
        totalVatPaid: summary.totalVatPaid,
        vatPayable: vatPayable.toFixed(2),
        status: "calculated"
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to calculate VAT" });
    }
  });

  // Purchase Order Management
  // Suppliers with search
  app.get("/api/suppliers", async (req, res) => {
    try {
      const { search } = req.query;
      const suppliers = await storage.getAllSuppliers();
      
      if (search && typeof search === 'string') {
        const filteredSuppliers = suppliers.filter(supplier => 
          supplier.name.toLowerCase().includes(search.toLowerCase()) ||
          (supplier.email && supplier.email.toLowerCase().includes(search.toLowerCase())) ||
          (supplier.phone && supplier.phone.includes(search)) ||
          (supplier.vatNumber && supplier.vatNumber.includes(search))
        );
        return res.json(filteredSuppliers);
      }
      
      res.json(suppliers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch suppliers" });
    }
  });

  app.get("/api/suppliers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const supplier = await storage.getSupplier(id);
      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      res.json(supplier);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch supplier" });
    }
  });

  app.post("/api/suppliers", async (req, res) => {
    try {
      const validatedData = insertSupplierSchema.parse({
        ...req.body,
        companyId: 2 // Default company ID
      });
      const supplier = await storage.createSupplier(validatedData);
      res.status(201).json(supplier);
    } catch (error) {
      console.error("Supplier creation error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create supplier" });
    }
  });

  app.put("/api/suppliers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertSupplierSchema.partial().parse(req.body);
      const supplier = await storage.updateSupplier(id, validatedData);
      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      res.json(supplier);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update supplier" });
    }
  });

  app.delete("/api/suppliers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteSupplier(id);
      if (!success) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      res.json({ message: "Supplier deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete supplier" });
    }
  });

  // Purchase Orders with search
  app.get("/api/purchase-orders", async (req, res) => {
    try {
      const { search } = req.query;
      const orders = await storage.getAllPurchaseOrders();
      
      if (search && typeof search === 'string') {
        const filteredOrders = orders.filter(order => 
          order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
          (order.supplier && order.supplier.name.toLowerCase().includes(search.toLowerCase())) ||
          order.status.toLowerCase().includes(search.toLowerCase())
        );
        return res.json(filteredOrders);
      }
      
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch purchase orders" });
    }
  });

  app.get("/api/purchase-orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getPurchaseOrder(id);
      if (!order) {
        return res.status(404).json({ message: "Purchase order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch purchase order" });
    }
  });

  app.post("/api/purchase-orders", async (req, res) => {
    try {
      const { items, ...orderData } = req.body;
      const validatedOrder = insertPurchaseOrderSchema.parse({
        ...orderData,
        companyId: 2 // Default company ID
      });
      const validatedItems = items.map((item: any) => insertPurchaseOrderItemSchema.omit({ purchaseOrderId: true }).parse(item));
      
      const order = await storage.createPurchaseOrder(validatedOrder, validatedItems);
      res.status(201).json(order);
    } catch (error) {
      console.error("Purchase order creation error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create purchase order" });
    }
  });

  app.put("/api/purchase-orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertPurchaseOrderSchema.partial().parse(req.body);
      const order = await storage.updatePurchaseOrder(id, validatedData);
      if (!order) {
        return res.status(404).json({ message: "Purchase order not found" });
      }
      res.json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update purchase order" });
    }
  });

  app.put("/api/purchase-orders/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const order = await storage.updatePurchaseOrderStatus(id, status);
      if (!order) {
        return res.status(404).json({ message: "Purchase order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to update purchase order status" });
    }
  });

  app.delete("/api/purchase-orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deletePurchaseOrder(id);
      if (!success) {
        return res.status(404).json({ message: "Purchase order not found" });
      }
      res.json({ message: "Purchase order deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete purchase order" });
    }
  });

  // Supplier Payments
  app.get("/api/supplier-payments", async (req, res) => {
    try {
      const payments = await storage.getAllSupplierPayments();
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch supplier payments" });
    }
  });

  app.get("/api/supplier-payments/supplier/:supplierId", async (req, res) => {
    try {
      const supplierId = parseInt(req.params.supplierId);
      const payments = await storage.getSupplierPaymentsBySupplier(supplierId);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch supplier payments" });
    }
  });

  app.post("/api/supplier-payments", async (req, res) => {
    try {
      const validatedData = insertSupplierPaymentSchema.parse(req.body);
      const payment = await storage.createSupplierPayment(validatedData);
      res.status(201).json(payment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create supplier payment" });
    }
  });

  app.put("/api/supplier-payments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertSupplierPaymentSchema.partial().parse(req.body);
      const payment = await storage.updateSupplierPayment(id, validatedData);
      if (!payment) {
        return res.status(404).json({ message: "Supplier payment not found" });
      }
      res.json(payment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update supplier payment" });
    }
  });

  app.delete("/api/supplier-payments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteSupplierPayment(id);
      if (!success) {
        return res.status(404).json({ message: "Supplier payment not found" });
      }
      res.json({ message: "Supplier payment deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete supplier payment" });
    }
  });

  // Initialize PayFast service
  let payfastService: any = null;
  try {
    payfastService = createPayFastService();
  } catch (error) {
    console.warn('PayFast service not available. Set PAYFAST_MERCHANT_ID and PAYFAST_MERCHANT_KEY environment variables.');
  }

  // Product Categories routes
  app.get("/api/product-categories", authenticate, async (req, res) => {
    try {
      const categories = await storage.getAllProductCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching product categories:", error);
      res.status(500).json({ message: "Failed to fetch product categories" });
    }
  });

  app.post("/api/product-categories", authenticate, async (req, res) => {
    try {
      const companyId = (req as AuthenticatedRequest).user?.companyId || 2;
      const categoryData = insertProductCategorySchema.parse({ ...req.body, companyId });
      const category = await storage.createProductCategory(categoryData);
      await logAudit((req as AuthenticatedRequest).user!.id, 'CREATE', 'product_category', category?.id || 0);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating product category:", error);
      res.status(500).json({ message: "Failed to create product category" });
    }
  });

  app.put("/api/product-categories/:id", authenticate, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const categoryData = insertProductCategorySchema.parse(req.body);
      const category = await storage.updateProductCategory(id, categoryData);
      if (!category) {
        return res.status(404).json({ message: "Product category not found" });
      }
      await logAudit((req as AuthenticatedRequest).user!.id, 'UPDATE', 'product_category', id);
      res.json(category);
    } catch (error) {
      console.error("Error updating product category:", error);
      res.status(500).json({ message: "Failed to update product category" });
    }
  });

  app.delete("/api/product-categories/:id", authenticate, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteProductCategory(id);
      if (!deleted) {
        return res.status(404).json({ message: "Product category not found" });
      }
      await logAudit((req as AuthenticatedRequest).user!.id, 'DELETE', 'product_category', id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting product category:", error);
      res.status(500).json({ message: "Failed to delete product category" });
    }
  });

  // Products routes
  app.get("/api/products", authenticate, async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", authenticate, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post("/api/products", authenticate, async (req, res) => {
    try {
      const companyId = (req as AuthenticatedRequest).user?.companyId || 2;
      const productData = insertProductSchema.parse({ ...req.body, companyId });
      const product = await storage.createProduct(productData);
      await logAudit((req as AuthenticatedRequest).user!.id, 'CREATE', 'product', product?.id || 0);
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.put("/api/products/:id", authenticate, requirePermission(PERMISSIONS.PRODUCTS_UPDATE), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.updateProduct(id, productData);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      await logAudit((req as AuthenticatedRequest).user!.id, 'UPDATE', 'product', id);
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", authenticate, requirePermission(PERMISSIONS.PRODUCTS_DELETE), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteProduct(id);
      if (!deleted) {
        return res.status(404).json({ message: "Product not found" });
      }
      await logAudit((req as AuthenticatedRequest).user!.id, 'DELETE', 'product', id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // PayFast payment routes
  app.post("/api/payfast/create-payment", authenticate, async (req, res) => {
    try {
      if (!payfastService) {
        return res.status(500).json({ message: "PayFast service not configured" });
      }

      const { invoiceId, amount, itemName, itemDescription, returnUrl, cancelUrl } = req.body;
      
      // Get invoice details
      const invoice = await storage.getInvoice(invoiceId);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }

      // Create PayFast payment data
      const paymentData = payfastService.createPaymentData({
        return_url: returnUrl,
        cancel_url: cancelUrl,
        notify_url: `${req.protocol}://${req.get('host')}/api/payfast/notify`,
        m_payment_id: `INV-${invoiceId}-${Date.now()}`,
        amount: amount.toString(),
        item_name: itemName,
        item_description: itemDescription,
        custom_int1: invoiceId.toString(),
      });

      // Save payment to database
      const payfastPayment = await storage.createPayfastPayment({
        invoiceId,
        payfastPaymentId: paymentData.m_payment_id,
        merchantId: paymentData.merchant_id,
        merchantKey: paymentData.merchant_key,
        amount: amount.toString(),
        itemName,
        itemDescription,
        returnUrl,
        cancelUrl,
        notifyUrl: paymentData.notify_url,
        status: 'pending',
        signature: paymentData.signature,
      });

      await logAudit((req as AuthenticatedRequest).user!.id, 'CREATE', 'payfast_payment', payfastPayment.id);

      res.json({
        paymentData,
        paymentUrl: payfastService.getPaymentUrl(),
        payfastPaymentId: payfastPayment.id,
      });
    } catch (error) {
      console.error("Error creating PayFast payment:", error);
      res.status(500).json({ message: "Failed to create PayFast payment" });
    }
  });

  app.post("/api/payfast/notify", async (req, res) => {
    try {
      if (!payfastService) {
        return res.status(500).json({ message: "PayFast service not configured" });
      }

      // Verify the ITN
      const isValid = payfastService.verifyITN(req.body);
      if (!isValid) {
        return res.status(400).json({ message: "Invalid ITN signature" });
      }

      const { m_payment_id, payment_status, amount_gross, amount_fee, amount_net } = req.body;

      // Find the payment
      const payment = await storage.getPayfastPaymentByPaymentId(m_payment_id);
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }

      // Update payment status
      const status = payment_status === 'COMPLETE' ? 'completed' : 'failed';
      await storage.updatePayfastPaymentStatus(payment.id, status, JSON.stringify(req.body));

      // If payment is complete, create a payment record
      if (status === 'completed') {
        await storage.createPayment({
          invoiceId: payment.invoiceId,
          amount: amount_net || amount_gross,
          paymentMethod: 'payfast',
          paymentDate: new Date(),
          reference: m_payment_id,
          notes: `PayFast payment completed. Fee: ${amount_fee || '0.00'}`,
          status: 'completed',
        });

        // Update invoice status if fully paid
        const invoice = await storage.getInvoice(payment.invoiceId);
        if (invoice) {
          const payments = await storage.getPaymentsByInvoice(payment.invoiceId);
          const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0);
          
          if (totalPaid >= parseFloat(invoice.total)) {
            await storage.updateInvoiceStatus(payment.invoiceId, 'paid');
          }
        }
      }

      res.status(200).send('OK');
    } catch (error) {
      console.error("Error processing PayFast notification:", error);
      res.status(500).json({ message: "Failed to process PayFast notification" });
    }
  });

  app.get("/api/payfast/payment/:id", authenticate, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const payment = await storage.getPayfastPaymentByInvoiceId(id);
      if (!payment) {
        return res.status(404).json({ message: "PayFast payment not found" });
      }
      res.json(payment);
    } catch (error) {
      console.error("Error fetching PayFast payment:", error);
      res.status(500).json({ message: "Failed to fetch PayFast payment" });
    }
  });

  // Company Settings routes
  app.get('/api/settings', authenticate, async (req, res) => {
    try {
      const settings = await storage.getCompanySettings();
      res.json(settings);
    } catch (error) {
      console.error('Error fetching company settings:', error);
      res.status(500).json({ error: 'Failed to fetch company settings' });
    }
  });

  app.put('/api/settings', authenticate, async (req, res) => {
    try {
      const settingsData = req.body;
      const settings = await storage.updateCompanySettings(settingsData);
      res.json(settings);
    } catch (error) {
      console.error('Error updating company settings:', error);
      res.status(500).json({ error: 'Failed to update company settings' });
    }
  });

  // Inventory Management routes
  app.get('/api/inventory/products', authenticate, async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      console.error('Error fetching inventory products:', error);
      res.status(500).json({ error: 'Failed to fetch inventory products' });
    }
  });

  app.get('/api/inventory/transactions', authenticate, async (req, res) => {
    try {
      const transactions = await storage.getInventoryTransactions();
      res.json(transactions);
    } catch (error) {
      console.error('Error fetching inventory transactions:', error);
      res.status(500).json({ error: 'Failed to fetch inventory transactions' });
    }
  });

  app.post('/api/inventory/transactions', authenticate, async (req, res) => {
    try {
      const userId = (req as AuthenticatedRequest).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const transactionData = { ...req.body, userId };
      const transaction = await storage.createInventoryTransaction(transactionData);
      res.json(transaction);
    } catch (error) {
      console.error('Error creating inventory transaction:', error);
      res.status(500).json({ error: 'Failed to create inventory transaction' });
    }
  });

  app.get('/api/inventory/transactions/:productId', authenticate, async (req, res) => {
    try {
      const productId = parseInt(req.params.productId);
      const transactions = await storage.getInventoryTransactionsByProduct(productId);
      res.json(transactions);
    } catch (error) {
      console.error('Error fetching product transactions:', error);
      res.status(500).json({ error: 'Failed to fetch product transactions' });
    }
  });

  // Company Settings routes
  app.get("/api/settings/company", authenticate, requirePermission("settings:view"), async (req, res) => {
    try {
      const settings = await storage.getCompanySettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching company settings:", error);
      res.status(500).json({ error: "Failed to fetch company settings" });
    }
  });

  app.put("/api/settings/company", authenticate, requirePermission("settings:view"), async (req, res) => {
    try {
      const settings = await storage.updateCompanySettings(req.body);
      res.json(settings);
    } catch (error) {
      console.error("Error updating company settings:", error);
      res.status(500).json({ error: "Failed to update company settings" });
    }
  });

  // Inventory routes
  app.get("/api/inventory/transactions", authenticate, requirePermission("inventory:view"), async (req, res) => {
    try {
      const transactions = await storage.getInventoryTransactions();
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching inventory transactions:", error);
      res.status(500).json({ error: "Failed to fetch inventory transactions" });
    }
  });

  app.post("/api/inventory/transactions", authenticate, requirePermission("inventory:view"), async (req, res) => {
    try {
      const transaction = await storage.createInventoryTransaction(req.body);
      res.json(transaction);
    } catch (error) {
      console.error("Error creating inventory transaction:", error);
      res.status(500).json({ error: "Failed to create inventory transaction" });
    }
  });

  app.get("/api/inventory/transactions/product/:productId", authenticate, requirePermission("inventory:view"), async (req, res) => {
    try {
      const productId = parseInt(req.params.productId);
      const transactions = await storage.getInventoryTransactionsByProduct(productId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching product inventory transactions:", error);
      res.status(500).json({ error: "Failed to fetch product inventory transactions" });
    }
  });

  // Currency rate routes
  app.get("/api/currency-rates", authenticate, requirePermission("settings:view"), async (req, res) => {
    try {
      const rates = await storage.getCurrencyRates();
      res.json(rates);
    } catch (error) {
      console.error("Error fetching currency rates:", error);
      res.status(500).json({ error: "Failed to fetch currency rates" });
    }
  });

  app.post("/api/currency-rates", authenticate, requirePermission("settings:view"), async (req, res) => {
    try {
      const rate = await storage.createCurrencyRate(req.body);
      res.json(rate);
    } catch (error) {
      console.error("Error creating currency rate:", error);
      res.status(500).json({ error: "Failed to create currency rate" });
    }
  });

  app.get("/api/currency-rates/current/:from/:to", authenticate, requirePermission("settings:view"), async (req, res) => {
    try {
      const { from, to } = req.params;
      const rate = await storage.getCurrentRate(from, to);
      res.json(rate);
    } catch (error) {
      console.error("Error fetching current currency rate:", error);
      res.status(500).json({ error: "Failed to fetch current currency rate" });
    }
  });

  // Chart of Accounts Routes
  app.get("/api/chart-of-accounts", authenticate, async (req, res) => {
    try {
      const companyId = (req as AuthenticatedRequest).user?.companyId || 2; // Default company for now
      const userId = (req as AuthenticatedRequest).user?.id;
      const accounts = await storage.getAllChartOfAccounts(companyId);
      
      // Create audit log for Chart of Accounts access
      if (userId) {
        await storage.createAuditLog({
          userId,
          action: 'chart_of_accounts_viewed',
          resource: 'chart_of_accounts',
          details: JSON.stringify({ companyId, accountCount: accounts.length }),
          ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
        });
      }
      
      res.json(accounts);
    } catch (error) {
      console.error("Error fetching chart of accounts:", error);
      res.status(500).json({ error: "Failed to fetch chart of accounts" });
    }
  });

  app.get("/api/chart-of-accounts/:id", authenticate, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const account = await storage.getChartOfAccount(id);
      if (!account) {
        return res.status(404).json({ error: "Account not found" });
      }
      res.json(account);
    } catch (error) {
      console.error("Error fetching account:", error);
      res.status(500).json({ error: "Failed to fetch account" });
    }
  });

  app.post("/api/chart-of-accounts", authenticate, async (req, res) => {
    try {
      const companyId = (req as AuthenticatedRequest).user?.companyId || 2;
      const userId = (req as AuthenticatedRequest).user?.id;
      const validatedData = insertChartOfAccountSchema.parse({ ...req.body, companyId });
      const account = await storage.createChartOfAccount(validatedData);
      
      // Create audit log for account creation
      if (userId) {
        await storage.createAuditLog({
          userId,
          action: 'chart_of_accounts_created',
          resource: 'chart_of_accounts',
          resourceId: account.id,
          details: JSON.stringify({ 
            accountId: account.id, 
            accountCode: account.accountCode, 
            accountName: account.accountName,
            companyId 
          }),
          ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
        });
      }
      
      res.status(201).json(account);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating account:", error);
      res.status(500).json({ error: "Failed to create account" });
    }
  });

  app.put("/api/chart-of-accounts/:id", authenticate, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertChartOfAccountSchema.partial().parse(req.body);
      const account = await storage.updateChartOfAccount(id, validatedData);
      if (!account) {
        return res.status(404).json({ error: "Account not found" });
      }
      res.json(account);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error updating account:", error);
      res.status(500).json({ error: "Failed to update account" });
    }
  });

  app.delete("/api/chart-of-accounts/:id", authenticate, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteChartOfAccount(id);
      if (!success) {
        return res.status(404).json({ error: "Account not found" });
      }
      res.json({ message: "Account deleted successfully" });
    } catch (error) {
      console.error("Error deleting account:", error);
      res.status(500).json({ error: "Failed to delete account" });
    }
  });

  app.post("/api/chart-of-accounts/seed-sa", authenticate, requireRole("admin"), async (req, res) => {
    try {
      const companyId = (req as AuthenticatedRequest).user?.companyId || 2;
      await storage.seedSouthAfricanChartOfAccounts(companyId);
      res.json({ message: "South African Chart of Accounts seeded successfully" });
    } catch (error) {
      console.error("Error seeding chart of accounts:", error);
      res.status(500).json({ error: "Failed to seed chart of accounts" });
    }
  });

  // Journal Entries Routes
  app.get("/api/journal-entries", authenticate, async (req, res) => {
    try {
      const companyId = (req as AuthenticatedRequest).user?.companyId || 2;
      const entries = await storage.getAllJournalEntries(companyId);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching journal entries:", error);
      res.status(500).json({ error: "Failed to fetch journal entries" });
    }
  });

  app.get("/api/journal-entries/:id", authenticate, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const entry = await storage.getJournalEntry(id);
      if (!entry) {
        return res.status(404).json({ error: "Journal entry not found" });
      }
      res.json(entry);
    } catch (error) {
      console.error("Error fetching journal entry:", error);
      res.status(500).json({ error: "Failed to fetch journal entry" });
    }
  });

  app.post("/api/journal-entries", authenticate, async (req, res) => {
    try {
      const companyId = (req as AuthenticatedRequest).user?.companyId || 1;
      const userId = (req as AuthenticatedRequest).user?.id || 1;
      const { entry, lines } = req.body;
      
      const validatedEntry = insertJournalEntrySchema.parse({ 
        ...entry, 
        companyId,
        createdBy: userId 
      });
      
      const journalEntry = await storage.createJournalEntry(validatedEntry, lines);
      res.status(201).json(journalEntry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating journal entry:", error);
      res.status(500).json({ error: "Failed to create journal entry" });
    }
  });

  app.put("/api/journal-entries/:id/post", authenticate, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const entry = await storage.postJournalEntry(id);
      if (!entry) {
        return res.status(404).json({ error: "Journal entry not found" });
      }
      res.json(entry);
    } catch (error) {
      console.error("Error posting journal entry:", error);
      res.status(500).json({ error: "Failed to post journal entry" });
    }
  });

  app.post("/api/journal-entries/:id/reverse", authenticate, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = (req as AuthenticatedRequest).user?.id || 1;
      const { description } = req.body;
      
      const reversalEntry = await storage.reverseJournalEntry(id, description, userId);
      res.json(reversalEntry);
    } catch (error) {
      console.error("Error reversing journal entry:", error);
      res.status(500).json({ error: "Failed to reverse journal entry" });
    }
  });

  // Account Balance Reports
  app.get("/api/reports/trial-balance", authenticate, async (req, res) => {
    try {
      const companyId = (req as AuthenticatedRequest).user?.companyId || 1;
      const { asOfDate } = req.query;
      
      const date = asOfDate ? new Date(asOfDate as string) : new Date();
      const trialBalance = await storage.getTrialBalance(companyId, date);
      res.json(trialBalance);
    } catch (error) {
      console.error("Error generating trial balance:", error);
      res.status(500).json({ error: "Failed to generate trial balance" });
    }
  });

  app.get("/api/reports/account-balances", authenticate, async (req, res) => {
    try {
      const companyId = (req as AuthenticatedRequest).user?.companyId || 1;
      const { periodStart, periodEnd } = req.query;
      
      if (!periodStart || !periodEnd) {
        return res.status(400).json({ error: "periodStart and periodEnd are required" });
      }
      
      const report = await storage.getAccountBalanceReport(
        companyId,
        new Date(periodStart as string),
        new Date(periodEnd as string)
      );
      res.json(report);
    } catch (error) {
      console.error("Error generating account balance report:", error);
      res.status(500).json({ error: "Failed to generate account balance report" });
    }
  });

  // Automated Journal Entries
  app.post("/api/journal-entries/auto/invoice/:invoiceId", authenticate, async (req, res) => {
    try {
      const invoiceId = parseInt(req.params.invoiceId);
      const entry = await storage.createInvoiceJournalEntry(invoiceId);
      res.json(entry);
    } catch (error) {
      console.error("Error creating invoice journal entry:", error);
      res.status(500).json({ error: "Failed to create invoice journal entry" });
    }
  });

  app.post("/api/journal-entries/auto/payment/:paymentId", authenticate, async (req, res) => {
    try {
      const paymentId = parseInt(req.params.paymentId);
      const entry = await storage.createPaymentJournalEntry(paymentId);
      res.json(entry);
    } catch (error) {
      console.error("Error creating payment journal entry:", error);
      res.status(500).json({ error: "Failed to create payment journal entry" });
    }
  });

  app.post("/api/journal-entries/auto/expense/:expenseId", authenticate, async (req, res) => {
    try {
      const expenseId = parseInt(req.params.expenseId);
      const entry = await storage.createExpenseJournalEntry(expenseId);
      res.json(entry);
    } catch (error) {
      console.error("Error creating expense journal entry:", error);
      res.status(500).json({ error: "Failed to create expense journal entry" });
    }
  });

  // Banking Routes
  app.get("/api/bank-accounts", authenticate, async (req, res) => {
    try {
      const companyId = (req as AuthenticatedRequest).user?.companyId || 2;
      const accounts = await storage.getAllBankAccounts(companyId);
      res.json(accounts);
    } catch (error) {
      console.error("Error fetching bank accounts:", error);
      res.status(500).json({ error: "Failed to fetch bank accounts" });
    }
  });

  app.get("/api/bank-accounts/:id", authenticate, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const account = await storage.getBankAccount(id);
      if (!account) {
        return res.status(404).json({ error: "Bank account not found" });
      }
      res.json(account);
    } catch (error) {
      console.error("Error fetching bank account:", error);
      res.status(500).json({ error: "Failed to fetch bank account" });
    }
  });

  app.post("/api/bank-accounts", authenticate, async (req, res) => {
    try {
      const companyId = (req as AuthenticatedRequest).user?.companyId || 2;
      const validatedData = { ...req.body, companyId };
      const account = await storage.createBankAccount(validatedData);
      res.status(201).json(account);
    } catch (error) {
      console.error("Error creating bank account:", error);
      res.status(500).json({ error: "Failed to create bank account" });
    }
  });

  app.put("/api/bank-accounts/:id", authenticate, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const account = await storage.updateBankAccount(id, req.body);
      if (!account) {
        return res.status(404).json({ error: "Bank account not found" });
      }
      res.json(account);
    } catch (error) {
      console.error("Error updating bank account:", error);
      res.status(500).json({ error: "Failed to update bank account" });
    }
  });

  app.delete("/api/bank-accounts/:id", authenticate, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteBankAccount(id);
      if (!deleted) {
        return res.status(404).json({ error: "Bank account not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting bank account:", error);
      res.status(500).json({ error: "Failed to delete bank account" });
    }
  });

  // Bank Transactions Routes
  app.get("/api/bank-transactions", authenticate, async (req, res) => {
    try {
      const companyId = (req as AuthenticatedRequest).user?.companyId || 2;
      const bankAccountId = req.query.bankAccountId ? parseInt(req.query.bankAccountId as string) : undefined;
      const transactions = await storage.getAllBankTransactions(companyId, bankAccountId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching bank transactions:", error);
      res.status(500).json({ error: "Failed to fetch bank transactions" });
    }
  });

  app.post("/api/bank-transactions", authenticate, async (req, res) => {
    try {
      const companyId = (req as AuthenticatedRequest).user?.companyId || 2;
      const validatedData = { ...req.body, companyId };
      const transaction = await storage.createBankTransaction(validatedData);
      res.status(201).json(transaction);
    } catch (error) {
      console.error("Error creating bank transaction:", error);
      res.status(500).json({ error: "Failed to create bank transaction" });
    }
  });

  // General Ledger Routes
  app.get("/api/general-ledger", authenticate, async (req, res) => {
    try {
      const companyId = (req as AuthenticatedRequest).user?.companyId || 2;
      const accountId = req.query.accountId ? parseInt(req.query.accountId as string) : undefined;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      
      const ledger = await storage.getGeneralLedger(companyId, accountId, startDate, endDate);
      res.json(ledger);
    } catch (error) {
      console.error("Error fetching general ledger:", error);
      res.status(500).json({ error: "Failed to fetch general ledger" });
    }
  });

  app.post("/api/general-ledger/sync", authenticate, async (req, res) => {
    try {
      const companyId = (req as AuthenticatedRequest).user?.companyId || 2;
      await storage.syncGeneralLedgerFromJournalEntries(companyId);
      res.json({ message: "General ledger synchronized successfully" });
    } catch (error) {
      console.error("Error syncing general ledger:", error);
      res.status(500).json({ error: "Failed to sync general ledger" });
    }
  });

  // VAT Management routes
  app.get("/api/vat-types", authenticate, async (req, res) => {
    try {
      const vatTypes = await storage.getVatTypes();
      res.json(vatTypes);
    } catch (error) {
      console.error("Error fetching VAT types:", error);
      res.status(500).json({ message: "Failed to fetch VAT types" });
    }
  });

  app.post("/api/vat-types", authenticate, requirePermission(PERMISSIONS.MANAGE_SETTINGS), async (req, res) => {
    try {
      const data = insertVatTypeSchema.parse(req.body);
      const vatType = await storage.createVatType(data);
      
      await logAudit(req.user!.id, 'CREATE', 'vat_type', vatType.id, 'Created VAT type');
      
      res.json(vatType);
    } catch (error) {
      console.error("Error creating VAT type:", error);
      res.status(500).json({ message: "Failed to create VAT type" });
    }
  });

  app.get("/api/vat-reports", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = 2; // Fixed company ID for now
      const vatReports = await storage.getVatReports(companyId);
      res.json(vatReports);
    } catch (error) {
      console.error("Error fetching VAT reports:", error);
      res.status(500).json({ message: "Failed to fetch VAT reports" });
    }
  });

  app.post("/api/vat-reports", authenticate, requirePermission(PERMISSIONS.MANAGE_FINANCIAL_REPORTS), async (req: AuthenticatedRequest, res) => {
    try {
      const data = insertVatReportSchema.parse({
        ...req.body,
        companyId: 2,
        createdBy: req.user!.id
      });
      const vatReport = await storage.createVatReport(data);
      
      await logAudit(req.user!.id, 'CREATE', 'vat_report', vatReport.id, 'Created VAT report');
      
      res.json(vatReport);
    } catch (error) {
      console.error("Error creating VAT report:", error);
      res.status(500).json({ message: "Failed to create VAT report" });
    }
  });

  app.get("/api/vat-transactions", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = 2; // Fixed company ID for now
      const vatTransactions = await storage.getVatTransactions(companyId);
      res.json(vatTransactions);
    } catch (error) {
      console.error("Error fetching VAT transactions:", error);
      res.status(500).json({ message: "Failed to fetch VAT transactions" });
    }
  });

  app.put("/api/companies/:id/vat-settings", authenticate, requirePermission(PERMISSIONS.MANAGE_SETTINGS), async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = parseInt(req.params.id);
      if (isNaN(companyId)) {
        return res.status(400).json({ message: "Invalid company ID" });
      }

      const vatSettings = z.object({
        vatRegistered: z.boolean(),
        vatNumber: z.string().optional(),
        vatPeriod: z.string().optional(),
        vatSubmissionDate: z.number().int().min(1).max(31).optional()
      }).parse(req.body);

      const company = await storage.updateCompanyVatSettings(companyId, vatSettings);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }

      await logAudit(req.user!.id, 'UPDATE', 'company', companyId, 'Updated VAT settings');

      res.json(company);
    } catch (error) {
      console.error("Error updating company VAT settings:", error);
      res.status(500).json({ message: "Failed to update VAT settings" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
