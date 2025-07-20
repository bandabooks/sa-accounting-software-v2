import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  authenticate, 
  requirePermission, 
  requireRole, 
  requireSuperAdmin,
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
  insertFixedAssetSchema,
  insertDepreciationRecordSchema,
  insertBudgetSchema,
  insertBudgetLineSchema,
  insertCashFlowForecastSchema,
  insertCashFlowForecastLineSchema,
  insertAdvancedReportSchema,
  insertBankReconciliationItemSchema,
  insertSubscriptionPlanSchema,
  insertCompanySubscriptionSchema,
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

  // Super admin audit logs endpoints
  app.get("/api/super-admin/audit-logs", authenticate, requireSuperAdmin(), async (req: AuthenticatedRequest, res) => {
    try {
      const logs = await storage.getAuditLogs();
      res.json(logs);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });

  app.get("/api/super-admin/audit-logs/user/:userId", authenticate, requireSuperAdmin(), async (req: AuthenticatedRequest, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const logs = await storage.getUserAuditLogs(userId);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching user audit logs:", error);
      res.status(500).json({ message: "Failed to fetch user audit logs" });
    }
  });

  app.get("/api/super-admin/audit-logs/company/:companyId", authenticate, requireSuperAdmin(), async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = parseInt(req.params.companyId);
      const logs = await storage.getCompanyAuditLogs(companyId);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching company audit logs:", error);
      res.status(500).json({ message: "Failed to fetch company audit logs" });
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

  // Dashboard - protected route with company isolation
  app.get("/api/dashboard/stats", authenticate, requirePermission(PERMISSIONS.DASHBOARD_VIEW), async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = req.user.companyId;
      const stats = await storage.getDashboardStats(companyId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Customers with search - Company Isolated
  app.get("/api/customers", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const { search } = req.query;
      const companyId = req.user.companyId;
      const customers = await storage.getAllCustomers(companyId);
      
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

  app.get("/api/customers/:id", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const companyId = req.user.companyId;
      const customer = await storage.getCustomer(id);
      
      // Verify customer belongs to user's company
      if (!customer || customer.companyId !== companyId) {
        return res.status(404).json({ message: "Customer not found" });
      }
      
      res.json(customer);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customer" });
    }
  });

  app.post("/api/customers", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const validatedData = insertCustomerSchema.parse({
        ...req.body,
        companyId: req.user.companyId || 1 // Use user's active company ID
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
  app.get("/api/invoices", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const { search } = req.query;
      const companyId = req.user.companyId;
      const invoices = await storage.getAllInvoices(companyId);
      
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

  app.get("/api/invoices/:id", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const companyId = req.user.companyId;
      const invoice = await storage.getInvoice(id);
      
      // Verify invoice belongs to user's company
      if (!invoice || invoice.companyId !== companyId) {
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

  app.post("/api/invoices", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const validatedData = createInvoiceSchema.parse(req.body);
      // Use user's active company ID
      const invoiceData = {
        ...validatedData.invoice,
        companyId: req.user.companyId || 1 // Fallback to company 1 if no active company
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
  app.get("/api/estimates", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const { search } = req.query;
      const companyId = req.user.companyId;
      const estimates = await storage.getAllEstimates(companyId);
      
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

  app.get("/api/estimates/:id", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const companyId = req.user.companyId;
      const estimate = await storage.getEstimate(id);
      
      // Verify estimate belongs to user's company
      if (!estimate || estimate.companyId !== companyId) {
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

  app.post("/api/estimates", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const validatedData = createEstimateSchema.parse(req.body);
      // Use user's active company ID
      const estimateData = {
        ...validatedData.estimate,
        companyId: req.user.companyId || 1 // Fallback to company 1 if no active company
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

  // WORLD-CLASS FINANCIAL REPORTING SUITE
  
  // Balance Sheet Report
  app.get("/api/reports/balance-sheet", authenticate, async (req, res) => {
    try {
      const { user } = req as any;
      const { from, to } = req.query;
      
      const report = await storage.getBalanceSheetReport(
        user.companyId, 
        from as string, 
        to as string
      );
      res.json(report);
    } catch (error) {
      console.error("Error generating balance sheet:", error);
      res.status(500).json({ error: "Failed to generate balance sheet" });
    }
  });

  // Trial Balance Report
  app.get("/api/reports/trial-balance", authenticate, async (req, res) => {
    try {
      const { user } = req as any;
      const { from, to } = req.query;
      
      const report = await storage.getTrialBalanceReport(
        user.companyId, 
        from as string, 
        to as string
      );
      res.json(report);
    } catch (error) {
      console.error("Error generating trial balance:", error);
      res.status(500).json({ error: "Failed to generate trial balance" });
    }
  });

  // General Ledger Report
  app.get("/api/reports/general-ledger", authenticate, async (req, res) => {
    try {
      const { user } = req as any;
      const { from, to, accountId } = req.query;
      
      const report = await storage.getGeneralLedgerReport(
        user.companyId, 
        from as string, 
        to as string,
        accountId ? parseInt(accountId as string) : undefined
      );
      res.json(report);
    } catch (error) {
      console.error("Error generating general ledger:", error);
      res.status(500).json({ error: "Failed to generate general ledger" });
    }
  });

  // Aged Receivables Report
  app.get("/api/reports/aged-receivables", authenticate, async (req, res) => {
    try {
      const { user } = req as any;
      const { asAt } = req.query;
      
      const report = await storage.getAgedReceivablesReport(
        user.companyId, 
        asAt as string
      );
      res.json(report);
    } catch (error) {
      console.error("Error generating aged receivables:", error);
      res.status(500).json({ error: "Failed to generate aged receivables" });
    }
  });

  // Aged Payables Report
  app.get("/api/reports/aged-payables", authenticate, async (req, res) => {
    try {
      const { user } = req as any;
      const { asAt } = req.query;
      
      const report = await storage.getAgedPayablesReport(
        user.companyId, 
        asAt as string
      );
      res.json(report);
    } catch (error) {
      console.error("Error generating aged payables:", error);
      res.status(500).json({ error: "Failed to generate aged payables" });
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

  app.put("/api/products/:id", authenticate, async (req, res) => {
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

  app.delete("/api/products/:id", authenticate, async (req, res) => {
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

  // Company Settings routes - Context-aware
  app.get('/api/settings/company', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = req.user.companyId;
      const settings = await storage.getCompanySettings(companyId);
      res.json(settings);
    } catch (error) {
      console.error('Error fetching company settings:', error);
      res.status(500).json({ error: 'Failed to fetch company settings' });
    }
  });

  app.put('/api/settings/company', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = req.user.companyId;
      const settingsData = req.body;
      const settings = await storage.updateCompanySettings(companyId, settingsData);
      res.json(settings);
    } catch (error) {
      console.error('Error updating company settings:', error);
      res.status(500).json({ error: 'Failed to update company settings' });
    }
  });

  // Company-specific settings by ID (for editing specific companies)
  app.get('/api/companies/:id/settings', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Verify user has access to this company
      const hasAccess = await storage.checkUserAccess(userId, companyId);
      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied to this company" });
      }
      
      const settings = await storage.getCompanySettings(companyId);
      res.json(settings);
    } catch (error) {
      console.error('Error fetching company settings:', error);
      res.status(500).json({ error: 'Failed to fetch company settings' });
    }
  });

  app.put('/api/companies/:id/settings', authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Verify user has access to this company
      const hasAccess = await storage.checkUserAccess(userId, companyId);
      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied to this company" });
      }
      
      const settingsData = req.body;
      const settings = await storage.updateCompanySettings(companyId, settingsData);
      
      await logAudit(req.user!.id, 'UPDATE', 'company_settings', companyId, 'Updated company settings');
      
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
      const user = req as AuthenticatedRequest;
      const companyId = user.user?.activeCompanyId || user.user?.companyId || 2;
      
      // Get company-specific Chart of Accounts with activation status
      const accounts = await storage.getCompanyChartOfAccounts(companyId);
      
      res.json(accounts);
    } catch (error) {
      console.error("Error fetching chart of accounts:", error);
      res.status(500).json({ error: "Failed to fetch chart of accounts" });
    }
  });

  app.get("/api/chart-of-accounts/active", authenticate, async (req, res) => {
    try {
      const companyId = (req as AuthenticatedRequest).user?.companyId || 2;
      const accounts = await storage.getActiveChartOfAccounts(companyId);
      res.json(accounts);
    } catch (error) {
      console.error("Error fetching active chart of accounts:", error);
      res.status(500).json({ error: "Failed to fetch active chart of accounts" });
    }
  });

  app.patch("/api/chart-of-accounts/:id/toggle", authenticate, async (req, res) => {
    try {
      const accountId = parseInt(req.params.id);
      const user = req as AuthenticatedRequest;
      const companyId = user.user?.activeCompanyId || user.user?.companyId || 2;
      const userId = user.user?.id || 1;

      // Check user permissions (admin, accountant)
      if (!user.user || !['admin', 'accountant', 'super_admin', 'owner'].includes(user.user.role?.toLowerCase() || '')) {
        return res.status(403).json({ error: "Insufficient permissions to manage account activation" });
      }

      const newActivationState = await storage.toggleAccountActivation(companyId, accountId, userId);
      
      res.json({ isActivated: newActivationState });
    } catch (error) {
      console.error("Error toggling account activation:", error);
      res.status(500).json({ error: "Failed to toggle account activation" });
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
      
      // Create audit log for account creation (temporarily disabled)
      // if (userId) {
      //   await storage.createAuditLog({
      //     userId,
      //     companyId,
      //     action: 'chart_of_accounts_created',
      //     resource: 'chart_of_accounts',
      //     resourceId: account.id,
      //     details: JSON.stringify({ 
      //       accountId: account.id, 
      //       accountCode: account.accountCode, 
      //       accountName: account.accountName,
      //       companyId 
      //     }),
      //     ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
      //   });
      // }
      
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

  // Industry Templates Routes
  app.get("/api/industry-templates", authenticate, async (req, res) => {
    try {
      const templates = await storage.getIndustryTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching industry templates:", error);
      res.status(500).json({ error: "Failed to fetch industry templates" });
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

  // Super Admin Routes
  
  // System Analytics
  app.get("/api/super-admin/analytics", authenticate, requireSuperAdmin(), async (req: AuthenticatedRequest, res) => {
    try {
      const analytics = await storage.getSystemAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Failed to fetch system analytics:", error);
      res.status(500).json({ message: "Failed to fetch system analytics" });
    }
  });

  // Subscription Plans Management
  app.get("/api/super-admin/subscription-plans", authenticate, requireSuperAdmin(), async (req: AuthenticatedRequest, res) => {
    try {
      const plans = await storage.getAllSubscriptionPlans();
      res.json(plans);
    } catch (error) {
      console.error("Failed to fetch subscription plans:", error);
      res.status(500).json({ message: "Failed to fetch subscription plans" });
    }
  });

  app.post("/api/super-admin/subscription-plans", authenticate, requireSuperAdmin(), async (req: AuthenticatedRequest, res) => {
    try {
      const planData = insertSubscriptionPlanSchema.parse(req.body);
      const plan = await storage.createSubscriptionPlan(planData);
      
      await logAudit(req.user!.id, 'CREATE', 'subscription_plan', plan.id, 'Created subscription plan');
      
      res.json(plan);
    } catch (error) {
      console.error("Failed to create subscription plan:", error);
      res.status(500).json({ message: "Failed to create subscription plan" });
    }
  });

  app.put("/api/super-admin/subscription-plans/:id", authenticate, requireSuperAdmin(), async (req: AuthenticatedRequest, res) => {
    try {
      const planId = parseInt(req.params.id);
      const updates = insertSubscriptionPlanSchema.partial().parse(req.body);
      const plan = await storage.updateSubscriptionPlan(planId, updates);
      
      if (!plan) {
        return res.status(404).json({ message: "Subscription plan not found" });
      }
      
      await logAudit(req.user!.id, 'UPDATE', 'subscription_plan', plan.id, 'Updated subscription plan');
      
      res.json(plan);
    } catch (error) {
      console.error("Failed to update subscription plan:", error);
      res.status(500).json({ message: "Failed to update subscription plan" });
    }
  });

  app.delete("/api/super-admin/subscription-plans/:id", authenticate, requireSuperAdmin(), async (req: AuthenticatedRequest, res) => {
    try {
      const planId = parseInt(req.params.id);
      const success = await storage.deleteSubscriptionPlan(planId);
      
      if (!success) {
        return res.status(404).json({ message: "Subscription plan not found" });
      }
      
      await logAudit(req.user!.id, 'DELETE', 'subscription_plan', planId, 'Deleted subscription plan');
      
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to delete subscription plan:", error);
      res.status(500).json({ message: "Failed to delete subscription plan" });
    }
  });

  // User Management (Super Admin)
  app.get("/api/super-admin/users", authenticate, requireSuperAdmin(), async (req: AuthenticatedRequest, res) => {
    try {
      const users = await storage.getAllUsers();
      // Remove sensitive data
      const sanitizedUsers = users.map(user => ({
        ...user,
        password: undefined,
        twoFactorSecret: undefined
      }));
      res.json(sanitizedUsers);
    } catch (error) {
      console.error("Failed to fetch all users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Company Management (Super Admin)
  app.get("/api/super-admin/companies", authenticate, requireSuperAdmin(), async (req: AuthenticatedRequest, res) => {
    try {
      const companies = await storage.getAllCompanies();
      res.json(companies);
    } catch (error) {
      console.error("Failed to fetch all companies:", error);
      res.status(500).json({ message: "Failed to fetch companies" });
    }
  });

  app.put("/api/super-admin/companies/:id/subscription", authenticate, requireSuperAdmin(), async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const subscriptionData = insertCompanySubscriptionSchema.parse({
        ...req.body,
        companyId
      });
      
      const subscription = await storage.createCompanySubscription(subscriptionData);
      
      await logAudit(req.user!.id, 'UPDATE', 'company_subscription', companyId, 'Updated company subscription');
      
      res.json(subscription);
    } catch (error) {
      console.error("Failed to update company subscription:", error);
      res.status(500).json({ message: "Failed to update company subscription" });
    }
  });

  // User Impersonation (Super Admin)
  app.post("/api/super-admin/impersonate/:userId", authenticate, requireSuperAdmin(), async (req: AuthenticatedRequest, res) => {
    try {
      const targetUserId = parseInt(req.params.userId);
      const targetUser = await storage.getUser(targetUserId);
      
      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Generate impersonation token
      const impersonationToken = generateJWT({
        userId: targetUser.id,
        impersonatedBy: req.user!.id,
        type: 'impersonation'
      }, '2h');
      
      await logAudit(req.user!.id, 'IMPERSONATE', 'user', targetUserId, `Impersonated user ${targetUser.username}`);
      
      res.json({
        token: impersonationToken,
        user: {
          id: targetUser.id,
          username: targetUser.username,
          name: targetUser.name,
          email: targetUser.email,
          role: targetUser.role
        }
      });
    } catch (error) {
      console.error("Failed to impersonate user:", error);
      res.status(500).json({ message: "Failed to impersonate user" });
    }
  });

  // Individual Company Details (Super Admin)
  app.get("/api/super-admin/companies/:id", authenticate, requireSuperAdmin(), async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const company = await storage.getCompany(companyId);
      
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      
      res.json(company);
    } catch (error) {
      console.error("Failed to fetch company details:", error);
      res.status(500).json({ message: "Failed to fetch company details" });
    }
  });

  // Update Company (Super Admin)
  app.put("/api/super-admin/companies/:id", authenticate, requireSuperAdmin(), async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const updatedCompany = await storage.updateCompany(companyId, req.body);
      
      await logAudit(req.user!.id, 'UPDATE', 'company', companyId, 'Updated company details');
      
      res.json(updatedCompany);
    } catch (error) {
      console.error("Failed to update company:", error);
      res.status(500).json({ message: "Failed to update company" });
    }
  });

  // Individual User Details (Super Admin)
  app.get("/api/super-admin/users/:id", authenticate, requireSuperAdmin(), async (req: AuthenticatedRequest, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove sensitive data
      const sanitizedUser = {
        ...user,
        password: undefined,
        twoFactorSecret: undefined
      };
      
      res.json(sanitizedUser);
    } catch (error) {
      console.error("Failed to fetch user details:", error);
      res.status(500).json({ message: "Failed to fetch user details" });
    }
  });

  // Update User (Super Admin)
  app.put("/api/super-admin/users/:id", authenticate, requireSuperAdmin(), async (req: AuthenticatedRequest, res) => {
    try {
      const userId = parseInt(req.params.id);
      const updatedUser = await storage.updateUser(userId, req.body);
      
      await logAudit(req.user!.id, 'UPDATE', 'user', userId, 'Updated user details');
      
      // Remove sensitive data
      const sanitizedUser = {
        ...updatedUser,
        password: undefined,
        twoFactorSecret: undefined
      };
      
      res.json(sanitizedUser);
    } catch (error) {
      console.error("Failed to update user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Individual Subscription Plan Details (Super Admin)
  app.get("/api/super-admin/subscription-plans/:id", authenticate, requireSuperAdmin(), async (req: AuthenticatedRequest, res) => {
    try {
      const planId = parseInt(req.params.id);
      const plan = await storage.getSubscriptionPlan(planId);
      
      if (!plan) {
        return res.status(404).json({ message: "Subscription plan not found" });
      }
      
      res.json(plan);
    } catch (error) {
      console.error("Failed to fetch subscription plan details:", error);
      res.status(500).json({ message: "Failed to fetch subscription plan details" });
    }
  });

  // Update Subscription Plan (Super Admin)
  app.put("/api/super-admin/subscription-plans/:id", authenticate, requireSuperAdmin(), async (req: AuthenticatedRequest, res) => {
    try {
      const planId = parseInt(req.params.id);
      const updatedPlan = await storage.updateSubscriptionPlan(planId, req.body);
      
      await logAudit(req.user!.id, 'UPDATE', 'subscription_plan', planId, 'Updated subscription plan');
      
      res.json(updatedPlan);
    } catch (error) {
      console.error("Failed to update subscription plan:", error);
      res.status(500).json({ message: "Failed to update subscription plan" });
    }
  });

  // Company User Management (Super Admin)
  app.get("/api/super-admin/companies/:id/users", authenticate, requireSuperAdmin(), async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const companyUsers = await storage.getCompanyUsers(companyId);
      res.json(companyUsers);
    } catch (error) {
      console.error("Failed to fetch company users:", error);
      res.status(500).json({ message: "Failed to fetch company users" });
    }
  });

  app.post("/api/super-admin/companies/:id/users", authenticate, requireSuperAdmin(), async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const { userId, role } = req.body;
      
      const userCompany = await storage.addUserToCompany(userId, companyId, role);
      
      await logAudit(req.user!.id, 'CREATE', 'user_company', userCompany.id, `Added user ${userId} to company ${companyId} with role ${role}`);
      
      res.json(userCompany);
    } catch (error) {
      console.error("Failed to add user to company:", error);
      res.status(500).json({ message: "Failed to add user to company" });
    }
  });

  app.put("/api/super-admin/companies/:id/users/:userId", authenticate, requireSuperAdmin(), async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const userId = parseInt(req.params.userId);
      const { role } = req.body;
      
      const updatedUserCompany = await storage.updateUserCompanyRole(userId, companyId, role);
      
      await logAudit(req.user!.id, 'UPDATE', 'user_company', userId, `Updated user ${userId} role in company ${companyId} to ${role}`);
      
      res.json(updatedUserCompany);
    } catch (error) {
      console.error("Failed to update user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  app.delete("/api/super-admin/companies/:id/users/:userId", authenticate, requireSuperAdmin(), async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const userId = parseInt(req.params.userId);
      
      await storage.removeUserFromCompany(userId, companyId);
      
      await logAudit(req.user!.id, 'DELETE', 'user_company', userId, `Removed user ${userId} from company ${companyId}`);
      
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to remove user from company:", error);
      res.status(500).json({ message: "Failed to remove user from company" });
    }
  });

  // Public Subscription Plans (for company admins to view)
  app.get("/api/subscription-plans", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const plans = await storage.getActiveSubscriptionPlans();
      res.json(plans);
    } catch (error) {
      console.error("Failed to fetch subscription plans:", error);
      res.status(500).json({ message: "Failed to fetch subscription plans" });
    }
  });

  // Company Subscription Management
  app.get("/api/company/subscription", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = req.user.companyId;
      if (!companyId) {
        return res.status(400).json({ message: "No active company" });
      }
      
      const subscription = await storage.getCompanySubscription(companyId);
      res.json(subscription);
    } catch (error) {
      console.error("Failed to fetch company subscription:", error);
      res.status(500).json({ message: "Failed to fetch company subscription" });
    }
  });

  app.post("/api/company/subscription/request", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = req.user.companyId;
      if (!companyId) {
        return res.status(400).json({ message: "No active company" });
      }
      
      const { planId, billingPeriod } = req.body;
      
      // This would typically create a subscription request/order
      // For now, we'll log the request
      await logAudit(req.user!.id, 'REQUEST', 'subscription_change', planId, `Requested subscription change to plan ${planId} for company ${companyId}`);
      
      res.json({ message: "Subscription change request submitted successfully" });
    } catch (error) {
      console.error("Failed to request subscription change:", error);
      res.status(500).json({ message: "Failed to request subscription change" });
    }
  });

  // Advanced Financial Management Routes

  // Fixed Assets Management
  app.get("/api/fixed-assets", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = req.user.companyId;
      const assets = await storage.getFixedAssets(companyId);
      res.json(assets);
    } catch (error) {
      console.error("Failed to fetch fixed assets:", error);
      res.status(500).json({ message: "Failed to fetch fixed assets" });
    }
  });

  app.get("/api/fixed-assets/:id", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const asset = await storage.getFixedAsset(parseInt(id));
      if (!asset) {
        return res.status(404).json({ message: "Fixed asset not found" });
      }
      res.json(asset);
    } catch (error) {
      console.error("Failed to fetch fixed asset:", error);
      res.status(500).json({ message: "Failed to fetch fixed asset" });
    }
  });

  app.post("/api/fixed-assets", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const data = insertFixedAssetSchema.parse(req.body);
      const asset = await storage.createFixedAsset({ ...data, companyId: req.user.companyId });
      await logAudit(req.user.id, 'CREATE', 'fixed_asset', asset.id, null, asset);
      res.json(asset);
    } catch (error) {
      console.error("Failed to create fixed asset:", error);
      res.status(500).json({ message: "Failed to create fixed asset" });
    }
  });

  app.put("/api/fixed-assets/:id", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const oldAsset = await storage.getFixedAsset(parseInt(id));
      const data = insertFixedAssetSchema.partial().parse(req.body);
      const asset = await storage.updateFixedAsset(parseInt(id), data);
      if (!asset) {
        return res.status(404).json({ message: "Fixed asset not found" });
      }
      await logAudit(req.user.id, 'UPDATE', 'fixed_asset', asset.id, oldAsset, asset);
      res.json(asset);
    } catch (error) {
      console.error("Failed to update fixed asset:", error);
      res.status(500).json({ message: "Failed to update fixed asset" });
    }
  });

  app.delete("/api/fixed-assets/:id", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const oldAsset = await storage.getFixedAsset(parseInt(id));
      const success = await storage.deleteFixedAsset(parseInt(id));
      if (!success) {
        return res.status(404).json({ message: "Fixed asset not found" });
      }
      await logAudit(req.user.id, 'DELETE', 'fixed_asset', parseInt(id), oldAsset, null);
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to delete fixed asset:", error);
      res.status(500).json({ message: "Failed to delete fixed asset" });
    }
  });

  app.get("/api/fixed-assets/:id/depreciation", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const records = await storage.getDepreciationRecords(parseInt(id));
      res.json(records);
    } catch (error) {
      console.error("Failed to fetch depreciation records:", error);
      res.status(500).json({ message: "Failed to fetch depreciation records" });
    }
  });

  app.post("/api/fixed-assets/:id/depreciation/:period", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const { id, period } = req.params;
      await storage.calculateDepreciation(parseInt(id), period);
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to calculate depreciation:", error);
      res.status(500).json({ message: "Failed to calculate depreciation" });
    }
  });

  // Budgeting Routes
  app.get("/api/budgets", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = req.user.companyId;
      const budgets = await storage.getBudgets(companyId);
      res.json(budgets);
    } catch (error) {
      console.error("Failed to fetch budgets:", error);
      res.status(500).json({ message: "Failed to fetch budgets" });
    }
  });

  app.get("/api/budgets/:id", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const budget = await storage.getBudget(parseInt(id));
      if (!budget) {
        return res.status(404).json({ message: "Budget not found" });
      }
      const lines = await storage.getBudgetLines(parseInt(id));
      res.json({ ...budget, lines });
    } catch (error) {
      console.error("Failed to fetch budget:", error);
      res.status(500).json({ message: "Failed to fetch budget" });
    }
  });

  app.post("/api/budgets", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const data = insertBudgetSchema.parse(req.body);
      const budget = await storage.createBudget({ ...data, companyId: req.user.companyId });
      await logAudit(req.user.id, 'CREATE', 'budget', budget.id, null, budget);
      res.json(budget);
    } catch (error) {
      console.error("Failed to create budget:", error);
      res.status(500).json({ message: "Failed to create budget" });
    }
  });

  app.put("/api/budgets/:id", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const oldBudget = await storage.getBudget(parseInt(id));
      const data = insertBudgetSchema.partial().parse(req.body);
      const budget = await storage.updateBudget(parseInt(id), data);
      if (!budget) {
        return res.status(404).json({ message: "Budget not found" });
      }
      await logAudit(req.user.id, 'UPDATE', 'budget', budget.id, oldBudget, budget);
      res.json(budget);
    } catch (error) {
      console.error("Failed to update budget:", error);
      res.status(500).json({ message: "Failed to update budget" });
    }
  });

  app.delete("/api/budgets/:id", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const oldBudget = await storage.getBudget(parseInt(id));
      const success = await storage.deleteBudget(parseInt(id));
      if (!success) {
        return res.status(404).json({ message: "Budget not found" });
      }
      await logAudit(req.user.id, 'DELETE', 'budget', parseInt(id), oldBudget, null);
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to delete budget:", error);
      res.status(500).json({ message: "Failed to delete budget" });
    }
  });

  app.post("/api/budgets/:id/lines", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const data = insertBudgetLineSchema.parse(req.body);
      const budgetLine = await storage.createBudgetLine({ ...data, budgetId: parseInt(id) });
      res.json(budgetLine);
    } catch (error) {
      console.error("Failed to create budget line:", error);
      res.status(500).json({ message: "Failed to create budget line" });
    }
  });

  // Cash Flow Forecasting Routes
  app.get("/api/cash-flow-forecasts", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = req.user.companyId;
      const forecasts = await storage.getCashFlowForecasts(companyId);
      res.json(forecasts);
    } catch (error) {
      console.error("Failed to fetch cash flow forecasts:", error);
      res.status(500).json({ message: "Failed to fetch cash flow forecasts" });
    }
  });

  app.get("/api/cash-flow-forecasts/:id", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const forecast = await storage.getCashFlowForecast(parseInt(id));
      if (!forecast) {
        return res.status(404).json({ message: "Cash flow forecast not found" });
      }
      const lines = await storage.getCashFlowForecastLines(parseInt(id));
      res.json({ ...forecast, lines });
    } catch (error) {
      console.error("Failed to fetch cash flow forecast:", error);
      res.status(500).json({ message: "Failed to fetch cash flow forecast" });
    }
  });

  app.post("/api/cash-flow-forecasts", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const data = insertCashFlowForecastSchema.parse(req.body);
      const forecast = await storage.createCashFlowForecast({ ...data, companyId: req.user.companyId });
      await logAudit(req.user.id, 'CREATE', 'cash_flow_forecast', forecast.id, null, forecast);
      res.json(forecast);
    } catch (error) {
      console.error("Failed to create cash flow forecast:", error);
      res.status(500).json({ message: "Failed to create cash flow forecast" });
    }
  });

  app.get("/api/cash-flow-projections", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = req.user.companyId;
      const { months = 12 } = req.query;
      const projections = await storage.generateCashFlowProjections(companyId, parseInt(months as string));
      res.json(projections);
    } catch (error) {
      console.error("Failed to generate cash flow projections:", error);
      res.status(500).json({ message: "Failed to generate cash flow projections" });
    }
  });

  // Advanced Reporting Routes
  app.get("/api/advanced-reports", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = req.user.companyId;
      const reports = await storage.getAdvancedReports(companyId);
      res.json(reports);
    } catch (error) {
      console.error("Failed to fetch advanced reports:", error);
      res.status(500).json({ message: "Failed to fetch advanced reports" });
    }
  });

  app.get("/api/advanced-reports/:id", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const report = await storage.getAdvancedReport(parseInt(id));
      if (!report) {
        return res.status(404).json({ message: "Advanced report not found" });
      }
      res.json(report);
    } catch (error) {
      console.error("Failed to fetch advanced report:", error);
      res.status(500).json({ message: "Failed to fetch advanced report" });
    }
  });

  app.post("/api/advanced-reports", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const data = insertAdvancedReportSchema.parse(req.body);
      const report = await storage.createAdvancedReport({ ...data, companyId: req.user.companyId });
      await logAudit(req.user.id, 'CREATE', 'advanced_report', report.id, null, report);
      res.json(report);
    } catch (error) {
      console.error("Failed to create advanced report:", error);
      res.status(500).json({ message: "Failed to create advanced report" });
    }
  });

  app.post("/api/advanced-reports/:id/generate", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const reportData = await storage.generateReport(parseInt(id));
      if (!reportData) {
        return res.status(404).json({ message: "Report not found or could not be generated" });
      }
      res.json(reportData);
    } catch (error) {
      console.error("Failed to generate report:", error);
      res.status(500).json({ message: "Failed to generate report" });
    }
  });

  // Bank Reconciliation Routes
  app.get("/api/bank-reconciliations/:id/items", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const items = await storage.getBankReconciliationItems(parseInt(id));
      res.json(items);
    } catch (error) {
      console.error("Failed to fetch reconciliation items:", error);
      res.status(500).json({ message: "Failed to fetch reconciliation items" });
    }
  });

  app.post("/api/bank-reconciliations/:id/match", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      await storage.matchBankTransactions(parseInt(id));
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to match bank transactions:", error);
      res.status(500).json({ message: "Failed to match bank transactions" });
    }
  });

  app.get("/api/bank-accounts/:id/unmatched-transactions", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const companyId = req.user.companyId;
      const transactions = await storage.getUnmatchedTransactions(companyId, parseInt(id));
      res.json(transactions);
    } catch (error) {
      console.error("Failed to fetch unmatched transactions:", error);
      res.status(500).json({ message: "Failed to fetch unmatched transactions" });
    }
  });

  // Company Management Routes
  app.get("/api/companies/my", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.id;
      const companies = await storage.getUserCompanies(userId);
      res.json(companies);
    } catch (error) {
      console.error("Error fetching user companies:", error);
      res.status(500).json({ message: "Failed to fetch companies" });
    }
  });

  app.get("/api/companies/active", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.id;
      const activeCompany = await storage.getUserActiveCompany(userId);
      if (!activeCompany) {
        return res.status(404).json({ message: "No active company found" });
      }
      res.json(activeCompany);
    } catch (error) {
      console.error("Error fetching active company:", error);
      res.status(500).json({ message: "Failed to fetch active company" });
    }
  });

  app.post("/api/companies/switch", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.id;
      const { companyId } = req.body;
      
      if (!companyId) {
        return res.status(400).json({ message: "Company ID is required" });
      }

      // Verify user has access to this company
      const userCompanies = await storage.getUserCompanies(userId);
      const hasAccess = userCompanies.some(uc => uc.companyId === companyId);
      
      if (!hasAccess) {
        return res.status(403).json({ message: "Access denied to this company" });
      }

      // Update user's active company
      await storage.setUserActiveCompany(userId, companyId);
      
      // Get the switched company details
      const company = await storage.getCompany(companyId);
      
      res.json({ 
        success: true, 
        company,
        message: "Company switched successfully" 
      });
    } catch (error) {
      console.error("Error switching company:", error);
      res.status(500).json({ message: "Failed to switch company" });
    }
  });

  app.get("/api/companies", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const companies = await storage.getAllCompanies();
      res.json(companies);
    } catch (error) {
      console.error("Error fetching companies:", error);
      res.status(500).json({ message: "Failed to fetch companies" });
    }
  });

  app.post("/api/companies", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.id;
      const validatedData = insertCompanySchema.parse(req.body);
      
      // Create the company
      const company = await storage.createCompany(validatedData);
      
      // Add the user as the owner of this company
      await storage.addUserToCompany(userId, company.id, 'owner');
      
      // Set as active company if it's the user's first company
      const userCompanies = await storage.getUserCompanies(userId);
      if (userCompanies.length === 1) {
        await storage.setUserActiveCompany(userId, company.id);
      }
      
      res.status(201).json(company);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating company:", error);
      res.status(500).json({ message: "Failed to create company" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
