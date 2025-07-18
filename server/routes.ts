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
  loginSchema,
  changePasswordSchema,
  insertUserRoleSchema,
  type LoginRequest,
  type ChangePasswordRequest
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
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

  // Dashboard - protected route
  app.get("/api/dashboard/stats", authenticate, requirePermission(PERMISSIONS.DASHBOARD_VIEW), async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Customers
  app.get("/api/customers", async (req, res) => {
    try {
      const customers = await storage.getAllCustomers();
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
      const validatedData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(validatedData);
      res.status(201).json(customer);
    } catch (error) {
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

  // Invoices
  app.get("/api/invoices", async (req, res) => {
    try {
      const invoices = await storage.getAllInvoices();
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
      const invoice = await storage.createInvoice(validatedData.invoice, validatedData.items);
      res.status(201).json(invoice);
    } catch (error) {
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

  // Estimates
  app.get("/api/estimates", async (req, res) => {
    try {
      const estimates = await storage.getAllEstimates();
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
      const estimate = await storage.createEstimate(validatedData.estimate, validatedData.items);
      res.status(201).json(estimate);
    } catch (error) {
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
      const validatedData = insertPaymentSchema.parse(req.body);
      const payment = await storage.createPayment(validatedData);
      res.status(201).json(payment);
    } catch (error) {
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
  // Suppliers
  app.get("/api/suppliers", async (req, res) => {
    try {
      const suppliers = await storage.getAllSuppliers();
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
      const validatedData = insertSupplierSchema.parse(req.body);
      const supplier = await storage.createSupplier(validatedData);
      res.status(201).json(supplier);
    } catch (error) {
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

  // Purchase Orders
  app.get("/api/purchase-orders", async (req, res) => {
    try {
      const orders = await storage.getAllPurchaseOrders();
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
      const validatedOrder = insertPurchaseOrderSchema.parse(orderData);
      const validatedItems = items.map((item: any) => insertPurchaseOrderItemSchema.omit({ purchaseOrderId: true }).parse(item));
      
      const order = await storage.createPurchaseOrder(validatedOrder, validatedItems);
      res.status(201).json(order);
    } catch (error) {
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

  const httpServer = createServer(app);
  return httpServer;
}
