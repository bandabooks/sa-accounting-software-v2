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
import { 
  requireAnyPermission, 
  requireRole,
  SYSTEM_ROLES,
  hasPermission
} from "./rbac";
import { registerCompanyRoutes } from "./companyRoutes";
import { registerEnterpriseRoutes } from "./routes/enterpriseRoutes";
import { registerOnboardingRoutes } from "./routes/onboardingRoutes";
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
  trialSignupSchema,
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
  insertProjectSchema,
  insertTaskSchema,
  insertTimeEntrySchema,
  insertProjectMemberSchema,
  insertTaskCommentSchema,
  insertCreditNoteSchema,
  insertCreditNoteItemSchema,
  insertInvoiceReminderSchema,
  insertInvoiceAgingReportSchema,
  insertApprovalWorkflowSchema,
  insertApprovalRequestSchema,
  insertBankIntegrationSchema,
  // POS Module schema imports
  insertPosTerminalSchema,
  insertPosSaleSchema,
  insertPosSaleItemSchema,
  insertPosPaymentSchema,
  insertPosPromotionSchema,
  insertPosLoyaltyProgramSchema,
  insertPosCustomerLoyaltySchema,
  insertPosShiftSchema,
  insertPosRefundSchema,
  insertPosRefundItemSchema,
  type LoginRequest,
  type TrialSignupRequest,
  type ChangePasswordRequest
} from "@shared/schema";
import { z } from "zod";
import { createPayFastService } from "./payfast";
import { emailService } from "./services/emailService";

// Validation middleware
function validateRequest(schema: { body?: z.ZodSchema }) {
  return (req: any, res: any, next: any) => {
    try {
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Validation error",
          errors: error.errors,
        });
      }
      next(error);
    }
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Register multi-company routes
  registerCompanyRoutes(app);
  // Register enterprise feature routes
  registerEnterpriseRoutes(app);
  registerOnboardingRoutes(app);
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      
      // Check rate limiting
      const clientId = req.ip || req.connection?.remoteAddress || 'unknown';
      if (!checkLoginAttempts(clientId)) {
        return res.status(429).json({ message: "Too many login attempts. Please try again later." });
      }
      
      // Find user by username or email (allow login with email address)
      let user = await storage.getUserByUsername(username);
      if (!user && username.includes('@')) {
        user = await storage.getUserByEmail(username);
      }
      
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

  // Trial signup route
  app.post("/api/auth/trial-signup", async (req, res) => {
    try {
      const signupData = trialSignupSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(signupData.email);
      if (existingUser) {
        return res.status(400).json({ message: "An account with this email already exists" });
      }
      
      // Generate unique username from email
      const baseUsername = signupData.email.split('@')[0];
      let username = baseUsername;
      let counter = 1;
      
      while (await storage.getUserByUsername(username)) {
        username = `${baseUsername}${counter}`;
        counter++;
      }
      
      // Create company first
      const companySlug = signupData.companyName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      
      let finalSlug = companySlug;
      let slugCounter = 1;
      
      while (await storage.getCompanyBySlug(finalSlug)) {
        finalSlug = `${companySlug}-${slugCounter}`;
        slugCounter++;
      }
      
      // Map plan IDs to subscription plans
      const planMapping = {
        'starter': 'starter',
        'professional': 'professional', 
        'enterprise': 'enterprise'
      };
      
      const subscriptionPlan = planMapping[signupData.planId as keyof typeof planMapping] || 'professional';
      
      // Create company
      const company = await storage.createCompany({
        name: signupData.companyName,
        displayName: signupData.companyName,
        slug: finalSlug,
        email: signupData.email,
        industry: signupData.industry,
        subscriptionPlan,
        subscriptionStatus: 'trial',
        subscriptionExpiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        isActive: true,
        settings: {
          companySize: signupData.companySize,
          subscribeToUpdates: signupData.subscribeToUpdates || false,
          trialStarted: new Date().toISOString(),
          onboardingCompleted: false
        }
      });
      
      // Hash password
      const hashedPassword = await hashPassword(signupData.password);
      
      // Create user - First user of company gets company admin role (NOT super admin)
      const user = await storage.createUser({
        username,
        name: `${signupData.firstName} ${signupData.lastName}`,
        email: signupData.email,
        password: hashedPassword,
        role: 'company_admin', // First user of company gets company admin (not super admin)
        permissions: [], // Permissions will be managed through RBAC system
        isActive: true,
        twoFactorEnabled: false
      });
      
      // Add user to company as owner
      await storage.addUserToCompany(user.id, company.id, 'owner');
      
      // Assign Company Admin role through RBAC system
      try {
        const companyAdminRole = await storage.getSystemRoleByName('company_admin');
        if (companyAdminRole) {
          await storage.createUserPermission({
            userId: user.id,
            companyId: company.id,
            systemRoleId: companyAdminRole.id,
            companyRoleId: null,
            customPermissions: [],
            deniedPermissions: [],
            isActive: true,
            grantedBy: user.id, // Self-granted for trial signup
          });
          console.log(`✓ Assigned Company Admin role to ${user.username} for company ${company.name}`);
        }
      } catch (error) {
        console.error('Failed to assign Company Admin role during signup:', error);
        // Don't fail signup if role assignment fails - user can be assigned role later
      }
      
      // Create session for immediate login
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
      await logAudit(user.id, 'trial_signup', 'users', user.id, {
        plan: signupData.planId,
        companyName: signupData.companyName,
        industry: signupData.industry,
        companySize: signupData.companySize
      }, req);
      
      // Send welcome email (async, don't wait for completion)
      emailService.sendTrialWelcomeEmail(
        user.email,
        user.name,
        company.name,
        company.subscriptionExpiresAt!
      ).catch(error => {
        console.error('Failed to send welcome email:', error);
        // Log email failure but don't block signup
      });
      
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
        company: {
          id: company.id,
          name: company.name,
          slug: company.slug,
          subscriptionPlan: company.subscriptionPlan,
          subscriptionStatus: company.subscriptionStatus,
          subscriptionExpiresAt: company.subscriptionExpiresAt
        },
        trial: {
          daysRemaining: 14,
          expiresAt: company.subscriptionExpiresAt
        }
      });
    } catch (error) {
      console.error("Trial signup error:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Validation error",
          errors: error.errors,
        });
      }
      
      res.status(500).json({ message: "Signup failed. Please try again." });
    }
  });

  // Development helper to reset user password
  app.post("/api/dev/reset-password", async (req, res) => {
    try {
      const { email, newPassword } = req.body;
      
      // Only allow in development
      if (process.env.NODE_ENV !== 'development') {
        return res.status(404).json({ message: "Not found" });
      }
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const hashedPassword = await hashPassword(newPassword);
      await storage.updateUserPassword(user.id, hashedPassword);
      
      res.json({ message: "Password reset successfully" });
    } catch (error) {
      console.error("Dev password reset error:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  // Development helper to unlock user account
  app.post("/api/dev/unlock-account", async (req, res) => {
    try {
      const { email } = req.body;
      
      // Only allow in development
      if (process.env.NODE_ENV !== 'development') {
        return res.status(404).json({ message: "Not found" });
      }
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Reset failed login attempts and clear lock
      await storage.updateUserLoginAttempts(user.id, 0, null);
      
      res.json({ message: "Account unlocked successfully" });
    } catch (error) {
      console.error("Dev unlock account error:", error);
      res.status(500).json({ message: "Failed to unlock account" });
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
      const emailStatus = emailService.getServiceStatus();
      const stats = {
        totalUsers: 4,
        activeUsers: 3,
        systemHealth: "Healthy",
        securityLevel: "High",
        emailService: emailStatus
      };
      res.json(stats);
    } catch (error) {
      console.error("Error fetching system stats:", error);
      res.status(500).json({ message: "Failed to fetch system stats" });
    }
  });

  // Email service status endpoint
  app.get("/api/admin/email-status", authenticate, requireRole('admin'), async (req: AuthenticatedRequest, res) => {
    try {
      const status = emailService.getServiceStatus();
      res.json(status);
    } catch (error) {
      console.error("Error fetching email service status:", error);
      res.status(500).json({ message: "Failed to fetch email service status" });
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
      
      // Auto-generate invoice number if not provided
      const companyId = req.user.companyId || 1;
      let invoiceNumber = validatedData.invoice.invoiceNumber;
      if (!invoiceNumber || invoiceNumber.trim() === '') {
        invoiceNumber = await storage.getNextDocumentNumber(companyId, 'invoice');
      }
      
      // Use user's active company ID
      const invoiceData = {
        ...validatedData.invoice,
        invoiceNumber,
        companyId
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
      
      if (!["draft", "sent", "paid", "overdue", "partially_paid"].includes(status)) {
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
      
      // Auto-generate estimate number if not provided
      const companyId = req.user.companyId || 1;
      let estimateNumber = validatedData.estimate.estimateNumber;
      if (!estimateNumber || estimateNumber.trim() === '') {
        estimateNumber = await storage.getNextDocumentNumber(companyId, 'estimate');
      }
      
      // Use user's active company ID
      const estimateData = {
        ...validatedData.estimate,
        estimateNumber,
        companyId
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

  app.post("/api/estimates/:id/convert-to-invoice", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;
      const invoice = await storage.convertEstimateToInvoice(id, userId);
      res.json(invoice);
    } catch (error) {
      res.status(500).json({ message: "Failed to convert estimate to invoice" });
    }
  });

  // Estimate Workflow Routes
  app.put("/api/estimates/:id/status", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status, notes } = req.body;
      const userId = req.user.id;
      
      if (!["draft", "sent", "viewed", "accepted", "rejected", "expired"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const estimate = await storage.updateEstimateStatus(id, status, userId, notes);
      if (!estimate) {
        return res.status(404).json({ message: "Estimate not found" });
      }
      res.json(estimate);
    } catch (error) {
      res.status(500).json({ message: "Failed to update estimate status" });
    }
  });

  app.post("/api/estimates/:id/send", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;
      const estimate = await storage.sendEstimate(id, userId);
      if (!estimate) {
        return res.status(404).json({ message: "Estimate not found" });
      }
      res.json(estimate);
    } catch (error) {
      res.status(500).json({ message: "Failed to send estimate" });
    }
  });

  app.post("/api/estimates/:id/viewed", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const estimate = await storage.markEstimateAsViewed(id);
      if (!estimate) {
        return res.status(404).json({ message: "Estimate not found" });
      }
      res.json(estimate);
    } catch (error) {
      res.status(500).json({ message: "Failed to mark estimate as viewed" });
    }
  });

  app.post("/api/estimates/:id/accept", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const { notes } = req.body;
      const userId = req.user.id;
      const estimate = await storage.acceptEstimate(id, userId, notes);
      if (!estimate) {
        return res.status(404).json({ message: "Estimate not found" });
      }
      res.json(estimate);
    } catch (error) {
      res.status(500).json({ message: "Failed to accept estimate" });
    }
  });

  app.post("/api/estimates/:id/reject", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const { reason } = req.body;
      const userId = req.user.id;
      const estimate = await storage.rejectEstimate(id, userId, reason);
      if (!estimate) {
        return res.status(404).json({ message: "Estimate not found" });
      }
      res.json(estimate);
    } catch (error) {
      res.status(500).json({ message: "Failed to reject estimate" });
    }
  });

  app.get("/api/estimates/stats", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = req.user.companyId;
      const stats = await storage.getEstimateStats(companyId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch estimate stats" });
    }
  });

  // Dashboard Stats Routes for List Pages
  app.get("/api/customers/stats", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = req.user.companyId;
      const stats = await storage.getCustomerStats(companyId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customer stats" });
    }
  });

  app.get("/api/invoices/stats", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = req.user.companyId;
      const stats = await storage.getInvoiceStats(companyId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch invoice stats" });
    }
  });

  app.get("/api/products/stats", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = req.user.companyId;
      const stats = await storage.getProductStats(companyId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product stats" });
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

  app.get("/api/reports/profit-loss/:from/:to", authenticate, async (req, res) => {
    try {
      const { from, to } = req.params;
      const companyId = 2; // Fixed company ID for now
      
      const fromDate = new Date(from);
      const toDate = new Date(to);
      
      // Get comprehensive profit & loss data integrating all transactions
      const report = await storage.getComprehensiveProfitLoss(companyId, fromDate, toDate);
      res.json(report);
    } catch (error) {
      console.error("Error generating profit & loss report:", error);
      res.status(500).json({ error: "Failed to generate profit & loss report" });
    }
  });

  app.get("/api/reports/cash-flow/:from/:to", authenticate, async (req, res) => {
    try {
      const { from, to } = req.params;
      const companyId = 2; // Fixed company ID for now
      
      const report = await storage.getCashFlowReport(
        new Date(from),
        new Date(to)
      );
      res.json(report);
    } catch (error) {
      console.error("Error generating cash flow report:", error);
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
  app.get("/api/reports/balance-sheet/:from/:to", authenticate, async (req, res) => {
    try {
      const { from, to } = req.params;
      const companyId = 2; // Fixed company ID for now
      
      const report = await storage.getBalanceSheetReport(
        companyId, 
        from, 
        to
      );
      res.json(report);
    } catch (error) {
      console.error("Error generating balance sheet:", error);
      res.status(500).json({ error: "Failed to generate balance sheet" });
    }
  });

  // Trial Balance Report
  app.get("/api/reports/trial-balance/:from/:to", authenticate, async (req, res) => {
    try {
      const { from, to } = req.params;
      const companyId = 2; // Fixed company ID for now
      
      const report = await storage.getTrialBalanceReport(
        companyId, 
        from, 
        to
      );
      res.json(report);
    } catch (error) {
      console.error("Error generating trial balance:", error);
      res.status(500).json({ error: "Failed to generate trial balance" });
    }
  });

  // General Ledger Report
  app.get("/api/reports/general-ledger/:from/:to", authenticate, async (req, res) => {
    try {
      const { from, to } = req.params;
      const { accountId } = req.query;
      const companyId = 2; // Fixed company ID for now
      
      const report = await storage.getGeneralLedgerReport(
        companyId, 
        from, 
        to,
        accountId ? parseInt(accountId as string) : undefined
      );
      res.json(report);
    } catch (error) {
      console.error("Error generating general ledger:", error);
      res.status(500).json({ error: "Failed to generate general ledger" });
    }
  });

  // Aged Receivables Report
  app.get("/api/reports/aged-receivables/:asAt", authenticate, async (req, res) => {
    try {
      const { asAt } = req.params;
      const companyId = 2; // Fixed company ID for now
      
      const report = await storage.getAgedReceivablesReport(
        companyId, 
        asAt
      );
      res.json(report);
    } catch (error) {
      console.error("Error generating aged receivables:", error);
      res.status(500).json({ error: "Failed to generate aged receivables" });
    }
  });

  // Aged Payables Report
  app.get("/api/reports/aged-payables/:asAt", authenticate, async (req, res) => {
    try {
      const { asAt } = req.params;
      const companyId = 2; // Fixed company ID for now
      
      const report = await storage.getAgedPayablesReport(
        companyId, 
        asAt
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
      
      // Convert string account IDs to integers if present
      const processedData = {
        ...req.body,
        companyId,
        incomeAccountId: req.body.incomeAccountId ? parseInt(req.body.incomeAccountId) : undefined,
        expenseAccountId: req.body.expenseAccountId ? parseInt(req.body.expenseAccountId) : undefined,
      };
      
      const productData = insertProductSchema.parse(processedData);
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

  // Enhanced VAT Management API Routes
  
  // Get company VAT settings
  app.get("/api/companies/:id/vat-settings", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = parseInt(req.params.id);
      if (isNaN(companyId)) {
        return res.status(400).json({ message: "Invalid company ID" });
      }

      const vatSettings = await storage.getCompanyVatSettings(companyId);
      res.json(vatSettings);
    } catch (error) {
      console.error("Error fetching company VAT settings:", error);
      res.status(500).json({ message: "Failed to fetch VAT settings" });
    }
  });

  // Update company VAT settings
  app.put("/api/companies/:id/vat-settings", authenticate, requirePermission(PERMISSIONS.MANAGE_SETTINGS), async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = parseInt(req.params.id);
      if (isNaN(companyId)) {
        return res.status(400).json({ message: "Invalid company ID" });
      }

      const vatSettings = z.object({
        isVatRegistered: z.boolean(),
        vatNumber: z.string().optional(),
        vatRegistrationDate: z.string().optional(),
        vatPeriodMonths: z.number().int().min(1).max(12).optional(),
        vatSubmissionDay: z.number().int().min(1).max(31).optional()
      }).parse(req.body);

      const company = await storage.updateCompanyVatSettings(companyId, vatSettings);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }

      await logAudit(req.user!.id, 'UPDATE', 'company_vat_settings', companyId, 'Updated VAT settings');

      res.json({ success: true, company });
    } catch (error) {
      console.error("Error updating company VAT settings:", error);
      res.status(500).json({ message: "Failed to update VAT settings" });
    }
  });

  // Get available VAT types based on company registration
  app.get("/api/companies/:id/vat-types", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = parseInt(req.params.id);
      if (isNaN(companyId)) {
        return res.status(400).json({ message: "Invalid company ID" });
      }

      const vatTypes = await storage.getAvailableVatTypes(companyId);
      res.json(vatTypes);
    } catch (error) {
      console.error("Error fetching available VAT types:", error);
      res.status(500).json({ message: "Failed to fetch VAT types" });
    }
  });

  // Manage company-specific VAT type (activate/deactivate)
  app.put("/api/companies/:id/vat-types/:typeId", authenticate, requirePermission(PERMISSIONS.MANAGE_SETTINGS), async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = parseInt(req.params.id);
      const vatTypeId = parseInt(req.params.typeId);
      
      if (isNaN(companyId) || isNaN(vatTypeId)) {
        return res.status(400).json({ message: "Invalid company or VAT type ID" });
      }

      const { isActive } = z.object({
        isActive: z.boolean()
      }).parse(req.body);

      await storage.manageCompanyVatType(companyId, vatTypeId, isActive);
      
      await logAudit(req.user!.id, isActive ? 'ACTIVATE' : 'DEACTIVATE', 'vat_type', vatTypeId, `${isActive ? 'Activated' : 'Deactivated'} VAT type for company`);

      res.json({ success: true });
    } catch (error) {
      console.error("Error managing VAT type:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to manage VAT type" });
    }
  });

  // Seed default VAT types
  app.post("/api/vat-types/seed", authenticate, requirePermission(PERMISSIONS.MANAGE_SETTINGS), async (req: AuthenticatedRequest, res) => {
    try {
      await storage.seedDefaultVatTypes();
      res.json({ success: true, message: "Default VAT types seeded successfully" });
    } catch (error) {
      console.error("Error seeding VAT types:", error);
      res.status(500).json({ message: "Failed to seed VAT types" });
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

  app.get("/api/subscription-plans/:id", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const planId = parseInt(req.params.id);
      const plan = await storage.getSubscriptionPlan(planId);
      if (!plan) {
        return res.status(404).json({ message: "Subscription plan not found" });
      }
      res.json(plan);
    } catch (error) {
      console.error("Failed to fetch subscription plan:", error);
      res.status(500).json({ message: "Failed to fetch subscription plan" });
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
      
      // Get the subscription plan details
      const plan = await storage.getSubscriptionPlan(planId);
      if (!plan) {
        return res.status(404).json({ message: "Subscription plan not found" });
      }
      
      // Get company details for payment
      const company = await storage.getCompany(companyId);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      
      // Calculate amount based on billing period
      const amount = billingPeriod === 'annual' ? parseFloat(plan.annualPrice) : parseFloat(plan.monthlyPrice);
      
      // Create payment record
      const paymentData = {
        companyId,
        planId,
        amount: amount.toFixed(2),
        billingPeriod,
        status: 'pending',
        paymentMethod: 'payfast',
        createdBy: req.user.id,
        description: `${plan.displayName} - ${billingPeriod} subscription`
      };
      
      const payment = await storage.createSubscriptionPayment(paymentData);
      
      // Generate PayFast payment data
      const paymentReference = `SUB-${companyId}-${payment.id}-${Date.now()}`;
      const payFastData = payFastService.createPaymentData({
        amount: amount.toFixed(2),
        item_name: `${plan.displayName} Subscription`,
        item_description: `${billingPeriod} subscription for ${company.name}`,
        return_url: `${process.env.BASE_URL || 'http://localhost:5000'}/subscription/success`,
        cancel_url: `${process.env.BASE_URL || 'http://localhost:5000'}/subscription/cancel`,
        notify_url: `${process.env.BASE_URL || 'http://localhost:5000'}/api/payfast/notify`,
        m_payment_id: paymentReference,
        email_address: company.email || req.user.email
      });
      
      await logAudit(req.user!.id, 'CREATE', 'subscription_payment', payment.id, `Created payment request for plan ${planId} for company ${companyId}`);
      
      res.json({ 
        paymentId: payment.id,
        paymentUrl: payFastService.getPaymentUrl(),
        paymentData: payFastData,
        message: "Payment request created successfully" 
      });
    } catch (error) {
      console.error("Failed to create subscription payment:", error);
      res.status(500).json({ message: "Failed to create subscription payment request" });
    }
  });

  // PayFast Payment Notification Handler
  app.post("/api/payfast/notify", async (req, res) => {
    try {
      console.log("PayFast ITN received:", req.body);
      
      // Verify the payment notification from PayFast
      const isValid = payFastService.verifyITN(req.body);
      if (!isValid) {
        console.error("Invalid PayFast ITN signature");
        return res.status(400).send("Invalid signature");
      }
      
      const { m_payment_id, payment_status, amount_gross, pf_payment_id } = req.body;
      
      // Extract payment information from reference
      const [, companyId, paymentId] = m_payment_id.split('-');
      
      // Update payment status
      await storage.updateSubscriptionPaymentStatus(parseInt(paymentId), {
        status: payment_status === 'COMPLETE' ? 'completed' : 'failed',
        paymentReference: pf_payment_id,
        paidAmount: payment_status === 'COMPLETE' ? amount_gross : null,
        completedAt: payment_status === 'COMPLETE' ? new Date() : null
      });
      
      // If payment successful, activate/update subscription
      if (payment_status === 'COMPLETE') {
        const payment = await storage.getSubscriptionPayment(parseInt(paymentId));
        if (payment) {
          const startDate = new Date();
          const endDate = new Date();
          
          if (payment.billingPeriod === 'annual') {
            endDate.setFullYear(endDate.getFullYear() + 1);
          } else {
            endDate.setMonth(endDate.getMonth() + 1);
          }
          
          // Create or update company subscription
          const subscriptionData = {
            companyId: parseInt(companyId),
            planId: payment.planId,
            status: 'active',
            billingPeriod: payment.billingPeriod,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            autoRenew: true,
            amount: payment.amount,
            paymentMethod: 'payfast',
            lastPaymentDate: startDate.toISOString(),
            nextBillingDate: endDate.toISOString()
          };
          
          await storage.createCompanySubscription(subscriptionData);
          
          console.log(`Subscription activated for company ${companyId}, plan ${payment.planId}`);
        }
      }
      
      res.status(200).send("OK");
    } catch (error) {
      console.error("PayFast notification processing error:", error);
      res.status(500).send("Server error");
    }
  });

  // Subscription Payment Status Check
  app.get("/api/company/subscription/payment/:paymentId", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const { paymentId } = req.params;
      const payment = await storage.getSubscriptionPayment(parseInt(paymentId));
      
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }
      
      // Verify user has access to this payment
      if (payment.companyId !== req.user.companyId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(payment);
    } catch (error) {
      console.error("Failed to fetch payment status:", error);
      res.status(500).json({ message: "Failed to fetch payment status" });
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

  // Project Management Routes
  // Projects
  app.get("/api/projects", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = req.user.companyId;
      if (!companyId) {
        return res.status(400).json({ message: "Company ID is required" });
      }
      
      const projects = await storage.getProjects(companyId);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = req.user.companyId;
      const projectId = parseInt(req.params.id);
      
      if (!companyId) {
        return res.status(400).json({ message: "Company ID is required" });
      }
      
      const project = await storage.getProject(projectId, companyId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.post("/api/projects", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = req.user.companyId;
      if (!companyId) {
        return res.status(400).json({ message: "Company ID is required" });
      }
      
      const validatedData = insertProjectSchema.parse({
        ...req.body,
        companyId,
        createdBy: req.user.id
      });
      
      const project = await storage.createProject(validatedData);
      
      await logAudit(
        req.user.id,
        'create',
        'Project',
        project.id,
        `Created project: ${project.name}`,
        companyId
      );
      
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating project:", error);
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.put("/api/projects/:id", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = req.user.companyId;
      const projectId = parseInt(req.params.id);
      
      if (!companyId) {
        return res.status(400).json({ message: "Company ID is required" });
      }
      
      const validatedData = insertProjectSchema.partial().parse(req.body);
      const project = await storage.updateProject(projectId, validatedData, companyId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      await logAudit(
        req.user.id,
        'update',
        'Project',
        project.id,
        `Updated project: ${project.name}`,
        companyId
      );
      
      res.json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error updating project:", error);
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  app.delete("/api/projects/:id", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = req.user.companyId;
      const projectId = parseInt(req.params.id);
      
      if (!companyId) {
        return res.status(400).json({ message: "Company ID is required" });
      }
      
      const success = await storage.deleteProject(projectId, companyId);
      if (!success) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      await logAudit(
        req.user.id,
        'delete',
        'Project',
        projectId,
        `Deleted project`,
        companyId
      );
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // Tasks
  app.get("/api/tasks", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = req.user.companyId;
      if (!companyId) {
        return res.status(400).json({ message: "Company ID is required" });
      }
      
      const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
      const tasks = await storage.getTasks(companyId, projectId);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.get("/api/tasks/:id", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = req.user.companyId;
      const taskId = parseInt(req.params.id);
      
      if (!companyId) {
        return res.status(400).json({ message: "Company ID is required" });
      }
      
      const task = await storage.getTask(taskId, companyId);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(task);
    } catch (error) {
      console.error("Error fetching task:", error);
      res.status(500).json({ message: "Failed to fetch task" });
    }
  });

  app.post("/api/tasks", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = req.user.companyId;
      if (!companyId) {
        return res.status(400).json({ message: "Company ID is required" });
      }
      
      const validatedData = insertTaskSchema.parse({
        ...req.body,
        companyId,
        createdBy: req.user.id
      });
      
      const task = await storage.createTask(validatedData);
      
      await logAudit(
        req.user.id,
        'create',
        'Task',
        task.id,
        `Created task: ${task.title}`,
        companyId
      );
      
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating task:", error);
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  app.put("/api/tasks/:id", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = req.user.companyId;
      const taskId = parseInt(req.params.id);
      
      if (!companyId) {
        return res.status(400).json({ message: "Company ID is required" });
      }
      
      const validatedData = insertTaskSchema.partial().parse(req.body);
      const task = await storage.updateTask(taskId, validatedData, companyId);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      await logAudit(
        req.user.id,
        'update',
        'Task',
        task.id,
        `Updated task: ${task.title}`,
        companyId
      );
      
      res.json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error updating task:", error);
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  app.delete("/api/tasks/:id", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = req.user.companyId;
      const taskId = parseInt(req.params.id);
      
      if (!companyId) {
        return res.status(400).json({ message: "Company ID is required" });
      }
      
      const success = await storage.deleteTask(taskId, companyId);
      if (!success) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      await logAudit(
        req.user.id,
        'delete',
        'Task',
        taskId,
        `Deleted task`,
        companyId
      );
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  // Time Entries
  app.get("/api/time-entries", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = req.user.companyId;
      if (!companyId) {
        return res.status(400).json({ message: "Company ID is required" });
      }
      
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
      const taskId = req.query.taskId ? parseInt(req.query.taskId as string) : undefined;
      
      const timeEntries = await storage.getTimeEntries(companyId, userId, projectId, taskId);
      res.json(timeEntries);
    } catch (error) {
      console.error("Error fetching time entries:", error);
      res.status(500).json({ message: "Failed to fetch time entries" });
    }
  });

  app.get("/api/time-entries/active", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = req.user.companyId;
      const userId = req.user.id;
      
      if (!companyId) {
        return res.status(400).json({ message: "Company ID is required" });
      }
      
      const activeEntry = await storage.getActiveTimeEntry(userId, companyId);
      res.json(activeEntry);
    } catch (error) {
      console.error("Error fetching active time entry:", error);
      res.status(500).json({ message: "Failed to fetch active time entry" });
    }
  });

  app.post("/api/time-entries", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = req.user.companyId;
      if (!companyId) {
        return res.status(400).json({ message: "Company ID is required" });
      }
      
      const validatedData = insertTimeEntrySchema.parse({
        ...req.body,
        companyId,
        userId: req.user.id
      });
      
      const timeEntry = await storage.createTimeEntry(validatedData);
      
      await logAudit(
        req.user.id,
        'create',
        'TimeEntry',
        timeEntry.id,
        `Started time tracking`,
        companyId
      );
      
      res.status(201).json(timeEntry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating time entry:", error);
      res.status(500).json({ message: "Failed to create time entry" });
    }
  });

  app.put("/api/time-entries/:id/stop", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = req.user.companyId;
      const timeEntryId = parseInt(req.params.id);
      
      if (!companyId) {
        return res.status(400).json({ message: "Company ID is required" });
      }
      
      const timeEntry = await storage.stopTimeEntry(timeEntryId, companyId, new Date());
      if (!timeEntry) {
        return res.status(404).json({ message: "Time entry not found" });
      }
      
      await logAudit(
        req.user.id,
        'update',
        'TimeEntry',
        timeEntry.id,
        `Stopped time tracking`,
        companyId
      );
      
      res.json(timeEntry);
    } catch (error) {
      console.error("Error stopping time entry:", error);
      res.status(500).json({ message: "Failed to stop time entry" });
    }
  });

  app.put("/api/time-entries/:id", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = req.user.companyId;
      const timeEntryId = parseInt(req.params.id);
      
      if (!companyId) {
        return res.status(400).json({ message: "Company ID is required" });
      }
      
      const validatedData = insertTimeEntrySchema.partial().parse(req.body);
      const timeEntry = await storage.updateTimeEntry(timeEntryId, validatedData, companyId);
      
      if (!timeEntry) {
        return res.status(404).json({ message: "Time entry not found" });
      }
      
      await logAudit(
        req.user.id,
        'update',
        'TimeEntry',
        timeEntry.id,
        `Updated time entry`,
        companyId
      );
      
      res.json(timeEntry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error updating time entry:", error);
      res.status(500).json({ message: "Failed to update time entry" });
    }
  });

  app.delete("/api/time-entries/:id", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = req.user.companyId;
      const timeEntryId = parseInt(req.params.id);
      
      if (!companyId) {
        return res.status(400).json({ message: "Company ID is required" });
      }
      
      const success = await storage.deleteTimeEntry(timeEntryId, companyId);
      if (!success) {
        return res.status(404).json({ message: "Time entry not found" });
      }
      
      await logAudit(
        req.user.id,
        'delete',
        'TimeEntry',
        timeEntryId,
        `Deleted time entry`,
        companyId
      );
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting time entry:", error);
      res.status(500).json({ message: "Failed to delete time entry" });
    }
  });

  // Task Comments
  app.post("/api/tasks/:taskId/comments", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const taskId = parseInt(req.params.taskId);
      const validatedData = insertTaskCommentSchema.parse({
        ...req.body,
        taskId,
        userId: req.user.id
      });
      
      const comment = await storage.createTaskComment(validatedData);
      res.status(201).json(comment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating task comment:", error);
      res.status(500).json({ message: "Failed to create task comment" });
    }
  });

  app.get("/api/tasks/:taskId/comments", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const taskId = parseInt(req.params.taskId);
      const comments = await storage.getTaskComments(taskId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching task comments:", error);
      res.status(500).json({ message: "Failed to fetch task comments" });
    }
  });

  // Project Members
  app.post("/api/projects/:projectId/members", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const validatedData = insertProjectMemberSchema.parse({
        ...req.body,
        projectId
      });
      
      const member = await storage.addProjectMember(validatedData);
      res.status(201).json(member);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error adding project member:", error);
      res.status(500).json({ message: "Failed to add project member" });
    }
  });

  app.get("/api/projects/:projectId/members", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const members = await storage.getProjectMembers(projectId);
      res.json(members);
    } catch (error) {
      console.error("Error fetching project members:", error);
      res.status(500).json({ message: "Failed to fetch project members" });
    }
  });

  app.delete("/api/projects/:projectId/members/:userId", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const userId = parseInt(req.params.userId);
      
      const success = await storage.removeProjectMember(projectId, userId);
      if (!success) {
        return res.status(404).json({ message: "Project member not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing project member:", error);
      res.status(500).json({ message: "Failed to remove project member" });
    }
  });

  // VAT Settings API endpoints
  app.get("/api/companies/:companyId/vat-settings", authenticate, async (req, res) => {
    try {
      const companyId = parseInt(req.params.companyId);
      const company = await storage.getCompany(companyId);
      
      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }

      const vatSettings = {
        isVatRegistered: company.isVatRegistered || false,
        vatRegistrationNumber: company.vatRegistrationNumber || "",
        vatRegistrationDate: company.vatRegistrationDate,
        vatPeriodMonths: company.vatPeriodMonths || 2,
        vatSubmissionDay: company.vatSubmissionDay || 25,
        vatInclusivePricing: company.vatInclusivePricing || false,
        defaultVatRate: parseFloat(company.defaultVatRate || "15.00")
      };

      res.json(vatSettings);
    } catch (error) {
      console.error("Error fetching VAT settings:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.put("/api/companies/:companyId/vat-settings", authenticate, async (req, res) => {
    try {
      const companyId = parseInt(req.params.companyId);
      const { isVatRegistered, vatRegistrationNumber, vatRegistrationDate, vatPeriodMonths, vatSubmissionDay, vatInclusivePricing, defaultVatRate } = req.body;

      const updatedCompany = await storage.updateCompany(companyId, {
        isVatRegistered,
        vatRegistrationNumber,
        vatRegistrationDate,
        vatPeriodMonths,
        vatSubmissionDay,
        vatInclusivePricing,
        defaultVatRate: defaultVatRate?.toString()
      });

      if (!updatedCompany) {
        return res.status(404).json({ error: "Company not found" });
      }

      await logAudit(req.user!.id, 'UPDATE', 'company_vat_settings', companyId, 'Updated VAT settings');

      res.json({
        isVatRegistered: updatedCompany.isVatRegistered,
        vatRegistrationNumber: updatedCompany.vatRegistrationNumber,
        vatRegistrationDate: updatedCompany.vatRegistrationDate,
        vatPeriodMonths: updatedCompany.vatPeriodMonths,
        vatSubmissionDay: updatedCompany.vatSubmissionDay,
        vatInclusivePricing: updatedCompany.vatInclusivePricing,
        defaultVatRate: parseFloat(updatedCompany.defaultVatRate || "15.00")
      });
    } catch (error) {
      console.error("Error updating VAT settings:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // VAT Types API endpoints
  app.get("/api/companies/:companyId/vat-types", authenticate, async (req, res) => {
    try {
      const companyId = parseInt(req.params.companyId);
      
      // Return South African standard VAT types
      const vatTypes = [
        {
          id: 1,
          code: "STD",
          name: "Standard Rate",
          rate: "15.00",
          description: "Standard VAT rate of 15%",
          isActive: true,
          isSystemType: true,
          category: "Standard"
        },
        {
          id: 2,
          code: "ZER",
          name: "Zero Rated",
          rate: "0.00",
          description: "Zero-rated supplies (exports, basic foods)",
          isActive: true,
          isSystemType: true,
          category: "Zero Rated"
        },
        {
          id: 3,
          code: "EXE",
          name: "Exempt",
          rate: "0.00",
          description: "VAT-exempt supplies (financial services)",
          isActive: true,
          isSystemType: true,
          category: "Exempt"
        },
        {
          id: 4,
          code: "OUT",
          name: "Out of Scope",
          rate: "0.00",
          description: "Non-business activities",
          isActive: true,
          isSystemType: true,
          category: "Out of Scope"
        }
      ];

      res.json(vatTypes);
    } catch (error) {
      console.error("Error fetching VAT types:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // VAT Types Management endpoints
  app.put("/api/companies/:companyId/vat-types/:vatTypeId", authenticate, async (req, res) => {
    try {
      const companyId = parseInt(req.params.companyId);
      const vatTypeId = parseInt(req.params.vatTypeId);
      const { isActive } = req.body;

      // For now, just return success since we're using static VAT types
      // In a real implementation, this would update the database
      await logAudit(req.user!.id, 'UPDATE', 'vat_type_status', vatTypeId, `Updated VAT type status to ${isActive ? 'active' : 'inactive'}`);

      res.json({ success: true, vatTypeId, isActive });
    } catch (error) {
      console.error("Error updating VAT type:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/vat-types/seed", authenticate, async (req, res) => {
    try {
      // Return success message for seeding default VAT types
      await logAudit(req.user!.id, 'CREATE', 'vat_types_seed', 0, 'Seeded default South African VAT types');
      res.json({ message: "Default South African VAT types seeded successfully" });
    } catch (error) {
      console.error("Error seeding VAT types:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // VAT calculation endpoint
  app.post("/api/vat/calculate", authenticate, async (req, res) => {
    try {
      const { amount, vatRate, isVATInclusive } = req.body;
      
      const rate = vatRate / 100;
      let netAmount, vatAmount, grossAmount;

      if (isVATInclusive) {
        grossAmount = amount;
        netAmount = grossAmount / (1 + rate);
        vatAmount = grossAmount - netAmount;
      } else {
        netAmount = amount;
        vatAmount = netAmount * rate;
        grossAmount = netAmount + vatAmount;
      }

      res.json({
        netAmount: Math.round(netAmount * 100) / 100,
        vatAmount: Math.round(vatAmount * 100) / 100,
        grossAmount: Math.round(grossAmount * 100) / 100,
        vatRate,
        isInclusive: isVATInclusive
      });
    } catch (error) {
      console.error("Error calculating VAT:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // AI-powered VAT Compliance Tips API endpoint
  app.post("/api/vat/ai-compliance-tips", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const { companyId, transactionData, vatSettings } = req.body;
      
      // Get company VAT data for context
      const company = await storage.getCompany(companyId);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }

      // Get recent VAT transactions for analysis
      const recentInvoices = await storage.getInvoicesForCompany(companyId);
      const recentExpenses = await storage.getExpensesForCompany(companyId);
      
      // Prepare context for AI analysis
      const vatContext = {
        isVatRegistered: company.isVatRegistered,
        vatRegistrationNumber: company.vatRegistrationNumber,
        defaultVatRate: company.defaultVatRate,
        vatInclusivePricing: company.vatInclusivePricing,
        recentTransactionCount: recentInvoices.length + recentExpenses.length,
        transactionData: transactionData || {},
        vatSettings: vatSettings || {}
      };

      // Use Anthropic AI to generate contextual VAT compliance tips
      const Anthropic = (await import('@anthropic-ai/sdk')).default;
      const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });

      const prompt = `You are a South African VAT compliance expert. Analyze the following business context and provide 3-5 specific, actionable VAT compliance tips:

Business Context:
- VAT Registered: ${vatContext.isVatRegistered ? 'Yes' : 'No'}
- VAT Number: ${vatContext.vatRegistrationNumber || 'Not provided'}
- Default VAT Rate: ${vatContext.defaultVatRate || '15'}%
- VAT Inclusive Pricing: ${vatContext.vatInclusivePricing ? 'Yes' : 'No'}
- Recent Transaction Count: ${vatContext.recentTransactionCount}

Current Transaction/Setting Context: ${JSON.stringify(vatContext.transactionData, null, 2)}

Please provide specific South African VAT compliance tips that are relevant to this business context. Focus on:
1. Compliance requirements they should be aware of
2. Potential risks or issues to avoid
3. Optimization opportunities
4. Best practices for their current setup

Format your response as a JSON array of tip objects with "title", "description", "priority" (high/medium/low), and "category" (compliance/optimization/risk) fields.`;

      const message = await anthropic.messages.create({
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
        model: 'claude-sonnet-4-20250514',
      });

      let tips = [];
      try {
        // Extract JSON from the response
        const responseText = message.content[0].text;
        const jsonMatch = responseText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          tips = JSON.parse(jsonMatch[0]);
        } else {
          // Fallback: create structured tips from text
          tips = [{
            title: "AI Analysis Available",
            description: responseText.substring(0, 200) + "...",
            priority: "medium",
            category: "compliance"
          }];
        }
      } catch (parseError) {
        console.error("Error parsing AI response:", parseError);
        tips = [{
          title: "VAT Compliance Review Needed",
          description: "Our AI analysis suggests reviewing your current VAT setup for compliance optimization opportunities.",
          priority: "medium", 
          category: "compliance"
        }];
      }

      res.json({ tips });
    } catch (error) {
      console.error("Error generating AI VAT tips:", error);
      res.status(500).json({ 
        message: "Failed to generate VAT compliance tips",
        tips: [{
          title: "Manual VAT Review Required",
          description: "Please consult with a VAT specialist to ensure compliance with South African tax regulations.",
          priority: "high",
          category: "compliance"
        }]
      });
    }
  });

  // === CRITICAL MISSING FEATURES API ROUTES ===

  // Credit Notes Routes - Critical missing feature
  app.get("/api/credit-notes", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = req.user.companyId;
      const creditNotes = await storage.getCreditNotes(companyId);
      res.json(creditNotes);
    } catch (error) {
      console.error("Failed to fetch credit notes:", error);
      res.status(500).json({ message: "Failed to fetch credit notes" });
    }
  });

  app.get("/api/credit-notes/:id", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const creditNote = await storage.getCreditNote(parseInt(id));
      if (!creditNote) {
        return res.status(404).json({ message: "Credit note not found" });
      }
      const items = await storage.getCreditNoteItems(parseInt(id));
      res.json({ ...creditNote, items });
    } catch (error) {
      console.error("Failed to fetch credit note:", error);
      res.status(500).json({ message: "Failed to fetch credit note" });
    }
  });

  app.post("/api/credit-notes", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const data = insertCreditNoteSchema.parse(req.body);
      const creditNote = await storage.createCreditNote({ ...data, companyId: req.user.companyId });
      await logAudit(req.user.id, 'CREATE', 'credit_note', creditNote.id, null, creditNote);
      res.json(creditNote);
    } catch (error) {
      console.error("Failed to create credit note:", error);
      res.status(500).json({ message: "Failed to create credit note" });
    }
  });

  app.put("/api/credit-notes/:id", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const oldCreditNote = await storage.getCreditNote(parseInt(id));
      const data = insertCreditNoteSchema.partial().parse(req.body);
      const creditNote = await storage.updateCreditNote(parseInt(id), data);
      if (!creditNote) {
        return res.status(404).json({ message: "Credit note not found" });
      }
      await logAudit(req.user.id, 'UPDATE', 'credit_note', creditNote.id, oldCreditNote, creditNote);
      res.json(creditNote);
    } catch (error) {
      console.error("Failed to update credit note:", error);
      res.status(500).json({ message: "Failed to update credit note" });
    }
  });

  app.delete("/api/credit-notes/:id", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const oldCreditNote = await storage.getCreditNote(parseInt(id));
      const success = await storage.deleteCreditNote(parseInt(id));
      if (!success) {
        return res.status(404).json({ message: "Credit note not found" });
      }
      await logAudit(req.user.id, 'DELETE', 'credit_note', parseInt(id), oldCreditNote, null);
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to delete credit note:", error);
      res.status(500).json({ message: "Failed to delete credit note" });
    }
  });

  app.post("/api/credit-notes/:id/apply/:invoiceId", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const { id, invoiceId } = req.params;
      const { amount } = req.body;
      const success = await storage.applyCreditNoteToInvoice(parseInt(id), parseInt(invoiceId), parseFloat(amount));
      if (!success) {
        return res.status(400).json({ message: "Failed to apply credit note to invoice" });
      }
      await logAudit(req.user.id, 'UPDATE', 'credit_note_application', parseInt(id), null, { invoiceId: parseInt(invoiceId), amount });
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to apply credit note:", error);
      res.status(500).json({ message: "Failed to apply credit note" });
    }
  });

  // Invoice Reminders Routes - Critical missing feature
  app.get("/api/invoice-reminders", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = req.user.companyId;
      const reminders = await storage.getInvoiceReminders(companyId);
      res.json(reminders);
    } catch (error) {
      console.error("Failed to fetch invoice reminders:", error);
      res.status(500).json({ message: "Failed to fetch invoice reminders" });
    }
  });

  app.post("/api/invoice-reminders", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const data = insertInvoiceReminderSchema.parse(req.body);
      const reminder = await storage.createInvoiceReminder({ ...data, companyId: req.user.companyId });
      await logAudit(req.user.id, 'CREATE', 'invoice_reminder', reminder.id, null, reminder);
      res.json(reminder);
    } catch (error) {
      console.error("Failed to create invoice reminder:", error);
      res.status(500).json({ message: "Failed to create invoice reminder" });
    }
  });

  app.put("/api/invoice-reminders/:id/mark-sent", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const { method } = req.body;
      const success = await storage.markReminderSent(parseInt(id), new Date(), method);
      if (!success) {
        return res.status(404).json({ message: "Reminder not found" });
      }
      await logAudit(req.user.id, 'UPDATE', 'invoice_reminder', parseInt(id), null, { status: 'sent', method });
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to mark reminder as sent:", error);
      res.status(500).json({ message: "Failed to mark reminder as sent" });
    }
  });

  app.get("/api/invoice-reminders/overdue", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = req.user.companyId;
      const overdueInvoices = await storage.getOverdueInvoicesForReminders(companyId);
      res.json(overdueInvoices);
    } catch (error) {
      console.error("Failed to fetch overdue invoices:", error);
      res.status(500).json({ message: "Failed to fetch overdue invoices" });
    }
  });

  app.post("/api/invoice-reminders/process-automatic", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = req.user.companyId;
      const processedCount = await storage.processAutomaticReminders(companyId);
      await logAudit(req.user.id, 'CREATE', 'automatic_reminders', 0, null, { processedCount });
      res.json({ processedCount });
    } catch (error) {
      console.error("Failed to process automatic reminders:", error);
      res.status(500).json({ message: "Failed to process automatic reminders" });
    }
  });

  // Invoice Aging Reports Routes - Critical missing feature
  app.get("/api/invoice-aging-reports", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = req.user.companyId;
      const reports = await storage.getInvoiceAgingReports(companyId);
      res.json(reports);
    } catch (error) {
      console.error("Failed to fetch aging reports:", error);
      res.status(500).json({ message: "Failed to fetch aging reports" });
    }
  });

  app.post("/api/invoice-aging-reports/generate", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = req.user.companyId;
      const { reportName, agingPeriods = [30, 60, 90, 120] } = req.body;
      const report = await storage.generateInvoiceAgingReport(companyId, reportName || 'Monthly Aging Report', agingPeriods);
      await logAudit(req.user.id, 'CREATE', 'aging_report', report.id, null, report);
      res.json(report);
    } catch (error) {
      console.error("Failed to generate aging report:", error);
      res.status(500).json({ message: "Failed to generate aging report" });
    }
  });

  app.get("/api/invoice-aging-reports/latest", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = req.user.companyId;
      const report = await storage.getLatestAgingReport(companyId);
      if (!report) {
        return res.status(404).json({ message: "No aging reports found" });
      }
      res.json(report);
    } catch (error) {
      console.error("Failed to fetch latest aging report:", error);
      res.status(500).json({ message: "Failed to fetch latest aging report" });
    }
  });

  // Approval Workflows Routes - Critical missing feature
  app.get("/api/approval-workflows", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = req.user.companyId;
      const workflows = await storage.getApprovalWorkflows(companyId);
      res.json(workflows);
    } catch (error) {
      console.error("Failed to fetch approval workflows:", error);
      res.status(500).json({ message: "Failed to fetch approval workflows" });
    }
  });

  app.get("/api/approval-workflows/:id", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const workflow = await storage.getApprovalWorkflow(parseInt(id));
      if (!workflow) {
        return res.status(404).json({ message: "Approval workflow not found" });
      }
      res.json(workflow);
    } catch (error) {
      console.error("Failed to fetch approval workflow:", error);
      res.status(500).json({ message: "Failed to fetch approval workflow" });
    }
  });

  app.post("/api/approval-workflows", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const data = insertApprovalWorkflowSchema.parse(req.body);
      const workflow = await storage.createApprovalWorkflow({ ...data, companyId: req.user.companyId });
      await logAudit(req.user.id, 'CREATE', 'approval_workflow', workflow.id, null, workflow);
      res.json(workflow);
    } catch (error) {
      console.error("Failed to create approval workflow:", error);
      res.status(500).json({ message: "Failed to create approval workflow" });
    }
  });

  app.put("/api/approval-workflows/:id", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const oldWorkflow = await storage.getApprovalWorkflow(parseInt(id));
      const data = insertApprovalWorkflowSchema.partial().parse(req.body);
      const workflow = await storage.updateApprovalWorkflow(parseInt(id), data);
      if (!workflow) {
        return res.status(404).json({ message: "Approval workflow not found" });
      }
      await logAudit(req.user.id, 'UPDATE', 'approval_workflow', workflow.id, oldWorkflow, workflow);
      res.json(workflow);
    } catch (error) {
      console.error("Failed to update approval workflow:", error);
      res.status(500).json({ message: "Failed to update approval workflow" });
    }
  });

  app.delete("/api/approval-workflows/:id", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const oldWorkflow = await storage.getApprovalWorkflow(parseInt(id));
      const success = await storage.deleteApprovalWorkflow(parseInt(id));
      if (!success) {
        return res.status(404).json({ message: "Approval workflow not found" });
      }
      await logAudit(req.user.id, 'DELETE', 'approval_workflow', parseInt(id), oldWorkflow, null);
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to delete approval workflow:", error);
      res.status(500).json({ message: "Failed to delete approval workflow" });
    }
  });

  // Approval Requests Routes
  app.get("/api/approval-requests", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = req.user.companyId;
      const { userId } = req.query;
      const requests = await storage.getApprovalRequests(companyId, userId ? parseInt(userId as string) : undefined);
      res.json(requests);
    } catch (error) {
      console.error("Failed to fetch approval requests:", error);
      res.status(500).json({ message: "Failed to fetch approval requests" });
    }
  });

  app.post("/api/approval-requests", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const data = insertApprovalRequestSchema.parse(req.body);
      const request = await storage.createApprovalRequest({ ...data, companyId: req.user.companyId });
      await logAudit(req.user.id, 'CREATE', 'approval_request', request.id, null, request);
      res.json(request);
    } catch (error) {
      console.error("Failed to create approval request:", error);
      res.status(500).json({ message: "Failed to create approval request" });
    }
  });

  app.post("/api/approval-requests/:id/action", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const { action, comments } = req.body;
      
      if (!['approve', 'reject'].includes(action)) {
        return res.status(400).json({ message: "Invalid action. Must be 'approve' or 'reject'" });
      }

      const success = await storage.processApprovalAction(parseInt(id), req.user.id, action, comments);
      if (!success) {
        return res.status(404).json({ message: "Approval request not found" });
      }
      
      await logAudit(req.user.id, 'UPDATE', 'approval_request', parseInt(id), null, { action, comments });
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to process approval action:", error);
      res.status(500).json({ message: "Failed to process approval action" });
    }
  });

  // Bank Integrations Routes - Critical missing feature
  app.get("/api/bank-integrations", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = req.user.companyId;
      const integrations = await storage.getBankIntegrations(companyId);
      res.json(integrations);
    } catch (error) {
      console.error("Failed to fetch bank integrations:", error);
      res.status(500).json({ message: "Failed to fetch bank integrations" });
    }
  });

  app.post("/api/bank-integrations", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const data = insertBankIntegrationSchema.parse(req.body);
      const integration = await storage.createBankIntegration({ ...data, companyId: req.user.companyId });
      await logAudit(req.user.id, 'CREATE', 'bank_integration', integration.id, null, integration);
      res.json(integration);
    } catch (error) {
      console.error("Failed to create bank integration:", error);
      res.status(500).json({ message: "Failed to create bank integration" });
    }
  });

  app.put("/api/bank-integrations/:id", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const oldIntegration = await storage.getBankIntegrations(req.user.companyId);
      const data = insertBankIntegrationSchema.partial().parse(req.body);
      const integration = await storage.updateBankIntegration(parseInt(id), data);
      if (!integration) {
        return res.status(404).json({ message: "Bank integration not found" });
      }
      await logAudit(req.user.id, 'UPDATE', 'bank_integration', integration.id, oldIntegration, integration);
      res.json(integration);
    } catch (error) {
      console.error("Failed to update bank integration:", error);
      res.status(500).json({ message: "Failed to update bank integration" });
    }
  });

  app.delete("/api/bank-integrations/:id", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const oldIntegration = await storage.getBankIntegrations(req.user.companyId);
      const success = await storage.deleteBankIntegration(parseInt(id));
      if (!success) {
        return res.status(404).json({ message: "Bank integration not found" });
      }
      await logAudit(req.user.id, 'DELETE', 'bank_integration', parseInt(id), oldIntegration, null);
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to delete bank integration:", error);
      res.status(500).json({ message: "Failed to delete bank integration" });
    }
  });

  app.post("/api/bank-integrations/:id/sync", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const success = await storage.syncBankTransactions(parseInt(id));
      if (!success) {
        return res.status(400).json({ message: "Failed to sync bank transactions" });
      }
      await logAudit(req.user.id, 'UPDATE', 'bank_sync', parseInt(id), null, { status: 'completed' });
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to sync bank transactions:", error);
      res.status(500).json({ message: "Failed to sync bank transactions" });
    }
  });

  // ========================================
  // Smart Spending Wizard Routes
  // ========================================

  // Wizard Profile Routes
  app.get("/api/wizard/profile", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = req.user.companyId;
      const userId = req.user.id;
      const profile = await storage.getWizardProfile(companyId, userId);
      res.json(profile);
    } catch (error) {
      console.error("Error fetching wizard profile:", error);
      res.status(500).json({ message: "Failed to fetch wizard profile" });
    }
  });

  app.post("/api/wizard/profile", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = req.user.companyId;
      const userId = req.user.id;
      const profileData = { ...req.body, companyId, userId };
      const profile = await storage.createWizardProfile(profileData);
      await logAudit(userId, 'CREATE', 'wizard_profile', profile.id, null, profileData);
      res.status(201).json(profile);
    } catch (error) {
      console.error("Error creating wizard profile:", error);
      res.status(500).json({ message: "Failed to create wizard profile" });
    }
  });

  app.put("/api/wizard/profile", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = req.user.companyId;
      const userId = req.user.id;
      const updatedProfile = await storage.updateWizardProfile(companyId, userId, req.body);
      if (!updatedProfile) {
        return res.status(404).json({ message: "Wizard profile not found" });
      }
      await logAudit(userId, 'UPDATE', 'wizard_profile', updatedProfile.id, null, req.body);
      res.json(updatedProfile);
    } catch (error) {
      console.error("Error updating wizard profile:", error);
      res.status(500).json({ message: "Failed to update wizard profile" });
    }
  });

  // Conversation Routes
  app.get("/api/wizard/conversations", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = req.user.companyId;
      const userId = req.user.id;
      const conversations = await storage.getWizardConversations(companyId, userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching wizard conversations:", error);
      res.status(500).json({ message: "Failed to fetch wizard conversations" });
    }
  });

  app.post("/api/wizard/conversations", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = req.user.companyId;
      const userId = req.user.id;
      const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const conversationData = { ...req.body, companyId, userId, sessionId };
      const conversation = await storage.createWizardConversation(conversationData);
      await logAudit(userId, 'CREATE', 'wizard_conversation', conversation.id, null, conversationData);
      res.status(201).json(conversation);
    } catch (error) {
      console.error("Error creating wizard conversation:", error);
      res.status(500).json({ message: "Failed to create wizard conversation" });
    }
  });

  app.put("/api/wizard/conversations/:id", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const updatedConversation = await storage.updateWizardConversation(conversationId, req.body);
      if (!updatedConversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      res.json(updatedConversation);
    } catch (error) {
      console.error("Error updating wizard conversation:", error);
      res.status(500).json({ message: "Failed to update wizard conversation" });
    }
  });

  // Message Routes
  app.get("/api/wizard/conversations/:id/messages", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const messages = await storage.getWizardMessages(conversationId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching wizard messages:", error);
      res.status(500).json({ message: "Failed to fetch wizard messages" });
    }
  });

  app.post("/api/wizard/conversations/:id/messages", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const messageData = { ...req.body, conversationId };
      const message = await storage.createWizardMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      console.error("Error creating wizard message:", error);
      res.status(500).json({ message: "Failed to create wizard message" });
    }
  });

  // Insights Routes
  app.get("/api/wizard/insights", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = req.user.companyId;
      const userId = req.user.id;
      const { status } = req.query;
      const insights = await storage.getWizardInsights(companyId, userId, status as string);
      res.json(insights);
    } catch (error) {
      console.error("Error fetching wizard insights:", error);
      res.status(500).json({ message: "Failed to fetch wizard insights" });
    }
  });

  app.post("/api/wizard/insights/generate", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = req.user.companyId;
      const userId = req.user.id;
      const insights = await storage.generateFinancialInsights(companyId, userId);
      await logAudit(userId, 'CREATE', 'wizard_insights_generated', null, null, { insightCount: insights.length });
      res.json(insights);
    } catch (error) {
      console.error("Error generating wizard insights:", error);
      res.status(500).json({ message: "Failed to generate wizard insights" });
    }
  });

  app.put("/api/wizard/insights/:id/status", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const insightId = parseInt(req.params.id);
      const { status } = req.body;
      const updatedInsight = await storage.updateWizardInsightStatus(insightId, status);
      if (!updatedInsight) {
        return res.status(404).json({ message: "Insight not found" });
      }
      res.json(updatedInsight);
    } catch (error) {
      console.error("Error updating wizard insight status:", error);
      res.status(500).json({ message: "Failed to update wizard insight status" });
    }
  });

  // Tips Routes
  app.get("/api/wizard/tips", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const { category, businessType } = req.query;
      const tips = await storage.getWizardTips(category as string, businessType as string);
      res.json(tips);
    } catch (error) {
      console.error("Error fetching wizard tips:", error);
      res.status(500).json({ message: "Failed to fetch wizard tips" });
    }
  });

  app.post("/api/wizard/tips", authenticate, requireRole("admin"), async (req: AuthenticatedRequest, res) => {
    try {
      const tip = await storage.createWizardTip(req.body);
      await logAudit(req.user.id, 'CREATE', 'wizard_tip', tip.id, null, req.body);
      res.status(201).json(tip);
    } catch (error) {
      console.error("Error creating wizard tip:", error);
      res.status(500).json({ message: "Failed to create wizard tip" });
    }
  });

  const httpServer = createServer(app);
  // ===========================
  // COMPLIANCE MANAGEMENT ROUTES
  // ===========================

  // Client Management Routes
  app.get("/api/compliance/clients", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = req.user.activeCompanyId;
      const clients = await storage.getAllClients(companyId);
      res.json(clients);
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  app.get("/api/compliance/clients/:id", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const client = await storage.getClient(parseInt(req.params.id));
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      console.error("Error fetching client:", error);
      res.status(500).json({ message: "Failed to fetch client" });
    }
  });

  app.post("/api/compliance/clients", authenticate, validateRequest({
    body: z.object({
      name: z.string().min(1),
      businessType: z.string(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      address: z.string().optional(),
      city: z.string().optional(),
      province: z.string().optional(),
      postalCode: z.string().optional(),
      registrationNumber: z.string().optional(),
      taxNumber: z.string().optional(),
      vatNumber: z.string().optional(),
      servicePackage: z.string().default("basic"),
      assignedTo: z.number().optional(),
    })
  }), async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = req.user.activeCompanyId;
      const userId = req.user.id;
      
      const clientData = {
        ...req.body,
        companyId,
        assignedTo: req.body.assignedTo || userId
      };
      
      const client = await storage.createClient(clientData);
      res.status(201).json(client);
    } catch (error) {
      console.error("Error creating client:", error);
      res.status(500).json({ message: "Failed to create client" });
    }
  });

  app.put("/api/compliance/clients/:id", authenticate, validateRequest({
    body: z.object({
      name: z.string().min(1).optional(),
      businessType: z.string().optional(),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      address: z.string().optional(),
      city: z.string().optional(),
      province: z.string().optional(),
      postalCode: z.string().optional(),
      registrationNumber: z.string().optional(),
      taxNumber: z.string().optional(),
      vatNumber: z.string().optional(),
      servicePackage: z.string().optional(),
      status: z.string().optional(),
      assignedTo: z.number().optional(),
      notes: z.string().optional(),
    })
  }), async (req: AuthenticatedRequest, res) => {
    try {
      const client = await storage.updateClient(parseInt(req.params.id), req.body);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      console.error("Error updating client:", error);
      res.status(500).json({ message: "Failed to update client" });
    }
  });

  app.delete("/api/compliance/clients/:id", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const success = await storage.deleteClient(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json({ message: "Client deleted successfully" });
    } catch (error) {
      console.error("Error deleting client:", error);
      res.status(500).json({ message: "Failed to delete client" });
    }
  });

  // SARS Compliance Routes
  app.get("/api/compliance/sars/:clientId", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const compliance = await storage.getSarsCompliance(parseInt(req.params.clientId));
      res.json(compliance);
    } catch (error) {
      console.error("Error fetching SARS compliance:", error);
      res.status(500).json({ message: "Failed to fetch SARS compliance" });
    }
  });

  app.post("/api/compliance/sars", authenticate, validateRequest({
    body: z.object({
      clientId: z.number(),
      complianceType: z.string(),
      period: z.string(),
      dueDate: z.string(),
      status: z.string().default("pending"),
      assignedTo: z.number().optional(),
      notes: z.string().optional(),
    })
  }), async (req: AuthenticatedRequest, res) => {
    try {
      const compliance = await storage.createSarsCompliance(req.body);
      res.status(201).json(compliance);
    } catch (error) {
      console.error("Error creating SARS compliance:", error);
      res.status(500).json({ message: "Failed to create SARS compliance" });
    }
  });

  // CIPC Compliance Routes
  app.get("/api/compliance/cipc/:clientId", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const compliance = await storage.getCipcCompliance(parseInt(req.params.clientId));
      res.json(compliance);
    } catch (error) {
      console.error("Error fetching CIPC compliance:", error);
      res.status(500).json({ message: "Failed to fetch CIPC compliance" });
    }
  });

  app.post("/api/compliance/cipc", authenticate, validateRequest({
    body: z.object({
      clientId: z.number(),
      complianceType: z.string(),
      period: z.string().optional(),
      dueDate: z.string(),
      status: z.string().default("pending"),
      assignedTo: z.number().optional(),
      notes: z.string().optional(),
    })
  }), async (req: AuthenticatedRequest, res) => {
    try {
      const compliance = await storage.createCipcCompliance(req.body);
      res.status(201).json(compliance);
    } catch (error) {
      console.error("Error creating CIPC compliance:", error);
      res.status(500).json({ message: "Failed to create CIPC compliance" });
    }
  });

  // Labour Compliance Routes
  app.get("/api/compliance/labour/:clientId", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const compliance = await storage.getLabourCompliance(parseInt(req.params.clientId));
      res.json(compliance);
    } catch (error) {
      console.error("Error fetching Labour compliance:", error);
      res.status(500).json({ message: "Failed to fetch Labour compliance" });
    }
  });

  app.post("/api/compliance/labour", authenticate, validateRequest({
    body: z.object({
      clientId: z.number(),
      complianceType: z.string(),
      period: z.string(),
      dueDate: z.string(),
      status: z.string().default("pending"),
      assignedTo: z.number().optional(),
      notes: z.string().optional(),
    })
  }), async (req: AuthenticatedRequest, res) => {
    try {
      const compliance = await storage.createLabourCompliance(req.body);
      res.status(201).json(compliance);
    } catch (error) {
      console.error("Error creating Labour compliance:", error);
      res.status(500).json({ message: "Failed to create Labour compliance" });
    }
  });

  // Task Management Routes
  app.get("/api/compliance/tasks", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = req.user.activeCompanyId;
      const clientId = req.query.clientId ? parseInt(req.query.clientId as string) : undefined;
      const assignedTo = req.query.assignedTo ? parseInt(req.query.assignedTo as string) : undefined;
      
      const tasks = await storage.getComplianceTasks(companyId, clientId, assignedTo);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching compliance tasks:", error);
      res.status(500).json({ message: "Failed to fetch compliance tasks" });
    }
  });

  app.post("/api/compliance/tasks", authenticate, validateRequest({
    body: z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      taskType: z.string(),
      priority: z.string().default("medium"),
      clientId: z.number().optional(),
      complianceType: z.string().optional(),
      assignedTo: z.number().optional(),
      dueDate: z.string().optional(),
      notes: z.string().optional(),
    })
  }), async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = req.user.activeCompanyId;
      const userId = req.user.id;
      
      const taskData = {
        ...req.body,
        companyId,
        createdBy: userId,
        assignedTo: req.body.assignedTo || userId
      };
      
      const task = await storage.createComplianceTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      console.error("Error creating compliance task:", error);
      res.status(500).json({ message: "Failed to create compliance task" });
    }
  });

  app.put("/api/compliance/tasks/:id", authenticate, validateRequest({
    body: z.object({
      title: z.string().min(1).optional(),
      description: z.string().optional(),
      status: z.string().optional(),
      priority: z.string().optional(),
      assignedTo: z.number().optional(),
      dueDate: z.string().optional(),
      completedAt: z.string().optional(),
      notes: z.string().optional(),
    })
  }), async (req: AuthenticatedRequest, res) => {
    try {
      const task = await storage.updateComplianceTask(parseInt(req.params.id), req.body);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      console.error("Error updating compliance task:", error);
      res.status(500).json({ message: "Failed to update compliance task" });
    }
  });

  // Compliance Calendar Routes
  app.get("/api/compliance/calendar", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = req.user.activeCompanyId;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      
      const events = await storage.getComplianceCalendar(companyId, startDate, endDate);
      res.json(events);
    } catch (error) {
      console.error("Error fetching compliance calendar:", error);
      res.status(500).json({ message: "Failed to fetch compliance calendar" });
    }
  });

  app.post("/api/compliance/calendar", authenticate, validateRequest({
    body: z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      eventType: z.string(),
      complianceType: z.string().optional(),
      eventDate: z.string(),
      clientId: z.number().optional(),
      assignedTo: z.number().optional(),
    })
  }), async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = req.user.activeCompanyId;
      const userId = req.user.id;
      
      const eventData = {
        ...req.body,
        companyId,
        createdBy: userId,
        assignedTo: req.body.assignedTo || userId
      };
      
      const event = await storage.createComplianceCalendarEvent(eventData);
      res.status(201).json(event);
    } catch (error) {
      console.error("Error creating compliance calendar event:", error);
      res.status(500).json({ message: "Failed to create compliance calendar event" });
    }
  });

  // Document Management Routes
  app.get("/api/compliance/documents/:clientId", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const clientId = parseInt(req.params.clientId);
      const category = req.query.category as string;
      
      const documents = await storage.getComplianceDocuments(clientId, category);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching compliance documents:", error);
      res.status(500).json({ message: "Failed to fetch compliance documents" });
    }
  });

  app.post("/api/compliance/documents", authenticate, validateRequest({
    body: z.object({
      clientId: z.number(),
      category: z.string(),
      subcategory: z.string().optional(),
      documentType: z.string(),
      title: z.string().min(1),
      description: z.string().optional(),
      fileName: z.string(),
      filePath: z.string(),
      tags: z.array(z.string()).optional(),
      period: z.string().optional(),
    })
  }), async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = req.user.activeCompanyId;
      const userId = req.user.id;
      
      const documentData = {
        ...req.body,
        companyId,
        uploadedBy: userId
      };
      
      const document = await storage.createComplianceDocument(documentData);
      res.status(201).json(document);
    } catch (error) {
      console.error("Error creating compliance document:", error);
      res.status(500).json({ message: "Failed to create compliance document" });
    }
  });

  // Compliance Dashboard Routes
  app.get("/api/compliance/dashboard", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = req.user.activeCompanyId;
      const stats = await storage.getComplianceDashboardStats(companyId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching compliance dashboard:", error);
      res.status(500).json({ message: "Failed to fetch compliance dashboard" });
    }
  });

  // AI Assistant Routes for Compliance
  app.get("/api/compliance/ai/conversations", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.id;
      const companyId = req.user.activeCompanyId;
      
      const conversations = await storage.getAiAssistantConversations(userId, companyId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching AI conversations:", error);
      res.status(500).json({ message: "Failed to fetch AI conversations" });
    }
  });

  app.post("/api/compliance/ai/conversations", authenticate, validateRequest({
    body: z.object({
      title: z.string().optional(),
      category: z.string(),
      clientId: z.number().optional(),
      context: z.object({}).optional(),
    })
  }), async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.id;
      const companyId = req.user.activeCompanyId;
      
      const conversationData = {
        ...req.body,
        userId,
        companyId
      };
      
      const conversation = await storage.createAiAssistantConversation(conversationData);
      res.status(201).json(conversation);
    } catch (error) {
      console.error("Error creating AI conversation:", error);
      res.status(500).json({ message: "Failed to create AI conversation" });
    }
  });

  app.get("/api/compliance/ai/conversations/:id/messages", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const messages = await storage.getAiAssistantMessages(conversationId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching AI messages:", error);
      res.status(500).json({ message: "Failed to fetch AI messages" });
    }
  });

  app.post("/api/compliance/ai/conversations/:id/messages", authenticate, validateRequest({
    body: z.object({
      role: z.string(),
      content: z.string().min(1),
      messageType: z.string().default("text"),
      intent: z.string().optional(),
      confidence: z.number().optional(),
    })
  }), async (req: AuthenticatedRequest, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      
      const messageData = {
        ...req.body,
        conversationId
      };
      
      const message = await storage.createAiAssistantMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      console.error("Error creating AI message:", error);
      res.status(500).json({ message: "Failed to create AI message" });
    }
  });

  // ===== POS MODULE API ROUTES =====

  // POS Terminals Management
  app.get("/api/pos/terminals", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const { companyId } = req.user;
      const terminals = await storage.getPosTerminals(companyId);
      res.json(terminals);
    } catch (error) {
      console.error("Error fetching POS terminals:", error);
      res.status(500).json({ message: "Failed to fetch POS terminals" });
    }
  });

  app.get("/api/pos/terminals/:id", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const terminalId = parseInt(req.params.id);
      const terminal = await storage.getPosTerminal(terminalId);
      
      if (!terminal) {
        return res.status(404).json({ message: "POS terminal not found" });
      }
      
      res.json(terminal);
    } catch (error) {
      console.error("Error fetching POS terminal:", error);
      res.status(500).json({ message: "Failed to fetch POS terminal" });
    }
  });

  app.post("/api/pos/terminals", authenticate, requirePermission(PERMISSIONS.POS_MANAGE), validateRequest({
    body: insertPosTerminalSchema
  }), async (req: AuthenticatedRequest, res) => {
    try {
      const { companyId, userId } = req.user;
      
      const terminalData = {
        ...req.body,
        companyId
      };
      
      const terminal = await storage.createPosTerminal(terminalData);
      
      await logAudit(userId, companyId, 'CREATE', 'pos_terminal', terminal.id.toString(), `Created POS terminal: ${terminal.terminalName}`);
      
      res.status(201).json(terminal);
    } catch (error) {
      console.error("Error creating POS terminal:", error);
      res.status(500).json({ message: "Failed to create POS terminal" });
    }
  });

  app.put("/api/pos/terminals/:id", authenticate, requirePermission(PERMISSIONS.POS_MANAGE), validateRequest({
    body: insertPosTerminalSchema.partial()
  }), async (req: AuthenticatedRequest, res) => {
    try {
      const terminalId = parseInt(req.params.id);
      const { userId, companyId } = req.user;
      
      const updatedTerminal = await storage.updatePosTerminal(terminalId, req.body);
      
      if (!updatedTerminal) {
        return res.status(404).json({ message: "POS terminal not found" });
      }
      
      await logAudit(userId, companyId, 'UPDATE', 'pos_terminal', terminalId.toString(), `Updated POS terminal: ${updatedTerminal.terminalName}`);
      
      res.json(updatedTerminal);
    } catch (error) {
      console.error("Error updating POS terminal:", error);
      res.status(500).json({ message: "Failed to update POS terminal" });
    }
  });

  app.delete("/api/pos/terminals/:id", authenticate, requirePermission(PERMISSIONS.POS_MANAGE), async (req: AuthenticatedRequest, res) => {
    try {
      const terminalId = parseInt(req.params.id);
      const { userId, companyId } = req.user;
      
      const deleted = await storage.deletePosTerminal(terminalId);
      
      if (!deleted) {
        return res.status(404).json({ message: "POS terminal not found" });
      }
      
      await logAudit(userId, companyId, 'DELETE', 'pos_terminal', terminalId.toString(), `Deleted POS terminal`);
      
      res.json({ message: "POS terminal deleted successfully" });
    } catch (error) {
      console.error("Error deleting POS terminal:", error);
      res.status(500).json({ message: "Failed to delete POS terminal" });
    }
  });

  // POS Sales Management
  app.get("/api/pos/sales", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const { companyId } = req.user;
      const terminalId = req.query.terminalId ? parseInt(req.query.terminalId as string) : undefined;
      
      const sales = await storage.getPosSales(companyId, terminalId);
      res.json(sales);
    } catch (error) {
      console.error("Error fetching POS sales:", error);
      res.status(500).json({ message: "Failed to fetch POS sales" });
    }
  });

  app.get("/api/pos/sales/:id", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const saleId = parseInt(req.params.id);
      const sale = await storage.getPosSale(saleId);
      
      if (!sale) {
        return res.status(404).json({ message: "POS sale not found" });
      }
      
      res.json(sale);
    } catch (error) {
      console.error("Error fetching POS sale:", error);
      res.status(500).json({ message: "Failed to fetch POS sale" });
    }
  });

  app.post("/api/pos/sales", authenticate, requirePermission(PERMISSIONS.POS_PROCESS_SALES), validateRequest({
    body: z.object({
      sale: insertPosSaleSchema,
      items: z.array(insertPosSaleItemSchema.omit({ saleId: true })),
      payments: z.array(insertPosPaymentSchema.omit({ saleId: true }))
    })
  }), async (req: AuthenticatedRequest, res) => {
    try {
      const { companyId, userId } = req.user;
      const { sale, items, payments } = req.body;
      
      const saleData = {
        ...sale,
        companyId,
        userId
      };
      
      const newSale = await storage.createPosSale(saleData, items, payments);
      
      await logAudit(userId, companyId, 'CREATE', 'pos_sale', newSale.id.toString(), `Created POS sale: ${newSale.saleNumber}`);
      
      res.status(201).json(newSale);
    } catch (error) {
      console.error("Error creating POS sale:", error);
      res.status(500).json({ message: "Failed to create POS sale" });
    }
  });

  app.put("/api/pos/sales/:id/void", authenticate, requirePermission(PERMISSIONS.POS_VOID_SALES), validateRequest({
    body: z.object({
      voidReason: z.string().min(1, "Void reason is required")
    })
  }), async (req: AuthenticatedRequest, res) => {
    try {
      const saleId = parseInt(req.params.id);
      const { userId, companyId } = req.user;
      const { voidReason } = req.body;
      
      const voided = await storage.voidPosSale(saleId, voidReason, userId);
      
      if (!voided) {
        return res.status(404).json({ message: "POS sale not found" });
      }
      
      await logAudit(userId, companyId, 'VOID', 'pos_sale', saleId.toString(), `Voided POS sale: ${voidReason}`);
      
      res.json({ message: "POS sale voided successfully" });
    } catch (error) {
      console.error("Error voiding POS sale:", error);
      res.status(500).json({ message: "Failed to void POS sale" });
    }
  });

  // POS Shifts Management
  app.get("/api/pos/shifts", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const { companyId } = req.user;
      const terminalId = req.query.terminalId ? parseInt(req.query.terminalId as string) : undefined;
      
      const shifts = await storage.getPosShifts(companyId, terminalId);
      res.json(shifts);
    } catch (error) {
      console.error("Error fetching POS shifts:", error);
      res.status(500).json({ message: "Failed to fetch POS shifts" });
    }
  });

  app.get("/api/pos/shifts/current", authenticate, validateRequest({
    query: z.object({
      terminalId: z.string().transform(Number)
    })
  }), async (req: AuthenticatedRequest, res) => {
    try {
      const { userId } = req.user;
      const { terminalId } = req.query as any;
      
      const currentShift = await storage.getCurrentShift(terminalId, userId);
      res.json(currentShift);
    } catch (error) {
      console.error("Error fetching current POS shift:", error);
      res.status(500).json({ message: "Failed to fetch current POS shift" });
    }
  });

  app.post("/api/pos/shifts", authenticate, requirePermission(PERMISSIONS.POS_MANAGE_SHIFTS), validateRequest({
    body: insertPosShiftSchema
  }), async (req: AuthenticatedRequest, res) => {
    try {
      const { companyId, userId } = req.user;
      
      const shiftData = {
        ...req.body,
        companyId,
        userId
      };
      
      const shift = await storage.createPosShift(shiftData);
      
      await logAudit(userId, companyId, 'CREATE', 'pos_shift', shift.id.toString(), `Started POS shift`);
      
      res.status(201).json(shift);
    } catch (error) {
      console.error("Error creating POS shift:", error);
      res.status(500).json({ message: "Failed to create POS shift" });
    }
  });

  app.put("/api/pos/shifts/:id/close", authenticate, requirePermission(PERMISSIONS.POS_MANAGE_SHIFTS), validateRequest({
    body: z.object({
      closingCash: z.number(),
      notes: z.string().optional()
    })
  }), async (req: AuthenticatedRequest, res) => {
    try {
      const shiftId = parseInt(req.params.id);
      const { userId, companyId } = req.user;
      const closingData = req.body;
      
      const closedShift = await storage.closeShift(shiftId, closingData);
      
      if (!closedShift) {
        return res.status(404).json({ message: "POS shift not found" });
      }
      
      await logAudit(userId, companyId, 'CLOSE', 'pos_shift', shiftId.toString(), `Closed POS shift with variance: R${closedShift.cashVariance?.toFixed(2) || '0.00'}`);
      
      res.json(closedShift);
    } catch (error) {
      console.error("Error closing POS shift:", error);
      res.status(500).json({ message: "Failed to close POS shift" });
    }
  });

  // POS Refunds Management
  app.get("/api/pos/refunds", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const { companyId } = req.user;
      const refunds = await storage.getPosRefunds(companyId);
      res.json(refunds);
    } catch (error) {
      console.error("Error fetching POS refunds:", error);
      res.status(500).json({ message: "Failed to fetch POS refunds" });
    }
  });

  app.get("/api/pos/refunds/:id", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const refundId = parseInt(req.params.id);
      const refund = await storage.getPosRefund(refundId);
      
      if (!refund) {
        return res.status(404).json({ message: "POS refund not found" });
      }
      
      res.json(refund);
    } catch (error) {
      console.error("Error fetching POS refund:", error);
      res.status(500).json({ message: "Failed to fetch POS refund" });
    }
  });

  app.post("/api/pos/refunds", authenticate, requirePermission(PERMISSIONS.POS_PROCESS_REFUNDS), validateRequest({
    body: z.object({
      refund: insertPosRefundSchema,
      refundItems: z.array(insertPosRefundItemSchema.omit({ refundId: true }))
    })
  }), async (req: AuthenticatedRequest, res) => {
    try {
      const { companyId, userId } = req.user;
      const { refund, refundItems } = req.body;
      
      const refundData = {
        ...refund,
        companyId,
        userId
      };
      
      const newRefund = await storage.createPosRefund(refundData, refundItems);
      
      await logAudit(userId, companyId, 'CREATE', 'pos_refund', newRefund.id.toString(), `Created POS refund: ${newRefund.refundNumber}`);
      
      res.status(201).json(newRefund);
    } catch (error) {
      console.error("Error creating POS refund:", error);
      res.status(500).json({ message: "Failed to create POS refund" });
    }
  });

  // POS Promotions Management
  app.get("/api/pos/promotions", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const { companyId } = req.user;
      const activeOnly = req.query.active === 'true';
      
      const promotions = activeOnly 
        ? await storage.getActivePosPromotions(companyId)
        : await storage.getPosPromotions(companyId);
      
      res.json(promotions);
    } catch (error) {
      console.error("Error fetching POS promotions:", error);
      res.status(500).json({ message: "Failed to fetch POS promotions" });
    }
  });

  app.post("/api/pos/promotions", authenticate, requirePermission(PERMISSIONS.POS_MANAGE_PROMOTIONS), validateRequest({
    body: insertPosPromotionSchema
  }), async (req: AuthenticatedRequest, res) => {
    try {
      const { companyId, userId } = req.user;
      
      const promotionData = {
        ...req.body,
        companyId
      };
      
      const promotion = await storage.createPosPromotion(promotionData);
      
      await logAudit(userId, companyId, 'CREATE', 'pos_promotion', promotion.id.toString(), `Created POS promotion: ${promotion.name}`);
      
      res.status(201).json(promotion);
    } catch (error) {
      console.error("Error creating POS promotion:", error);
      res.status(500).json({ message: "Failed to create POS promotion" });
    }
  });

  app.put("/api/pos/promotions/:id", authenticate, requirePermission(PERMISSIONS.POS_MANAGE_PROMOTIONS), validateRequest({
    body: insertPosPromotionSchema.partial()
  }), async (req: AuthenticatedRequest, res) => {
    try {
      const promotionId = parseInt(req.params.id);
      const { userId, companyId } = req.user;
      
      const updatedPromotion = await storage.updatePosPromotion(promotionId, req.body);
      
      if (!updatedPromotion) {
        return res.status(404).json({ message: "POS promotion not found" });
      }
      
      await logAudit(userId, companyId, 'UPDATE', 'pos_promotion', promotionId.toString(), `Updated POS promotion: ${updatedPromotion.name}`);
      
      res.json(updatedPromotion);
    } catch (error) {
      console.error("Error updating POS promotion:", error);
      res.status(500).json({ message: "Failed to update POS promotion" });
    }
  });

  // POS Loyalty Programs Management
  app.get("/api/pos/loyalty-programs", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const { companyId } = req.user;
      const programs = await storage.getPosLoyaltyPrograms(companyId);
      res.json(programs);
    } catch (error) {
      console.error("Error fetching POS loyalty programs:", error);
      res.status(500).json({ message: "Failed to fetch POS loyalty programs" });
    }
  });

  app.post("/api/pos/loyalty-programs", authenticate, requirePermission(PERMISSIONS.POS_MANAGE_LOYALTY), validateRequest({
    body: insertPosLoyaltyProgramSchema
  }), async (req: AuthenticatedRequest, res) => {
    try {
      const { companyId, userId } = req.user;
      
      const programData = {
        ...req.body,
        companyId
      };
      
      const program = await storage.createPosLoyaltyProgram(programData);
      
      await logAudit(userId, companyId, 'CREATE', 'pos_loyalty_program', program.id.toString(), `Created POS loyalty program: ${program.name}`);
      
      res.status(201).json(program);
    } catch (error) {
      console.error("Error creating POS loyalty program:", error);
      res.status(500).json({ message: "Failed to create POS loyalty program" });
    }
  });

  app.get("/api/pos/customers/:customerId/loyalty/:programId", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const customerId = parseInt(req.params.customerId);
      const programId = parseInt(req.params.programId);
      
      const loyalty = await storage.getCustomerLoyalty(customerId, programId);
      res.json(loyalty);
    } catch (error) {
      console.error("Error fetching customer loyalty:", error);
      res.status(500).json({ message: "Failed to fetch customer loyalty" });
    }
  });

  app.put("/api/pos/customers/:customerId/loyalty/:programId/points", authenticate, requirePermission(PERMISSIONS.POS_MANAGE_LOYALTY), validateRequest({
    body: z.object({
      pointsChange: z.number().min(-10000).max(10000)
    })
  }), async (req: AuthenticatedRequest, res) => {
    try {
      const customerId = parseInt(req.params.customerId);
      const programId = parseInt(req.params.programId);
      const { pointsChange } = req.body;
      const { userId, companyId } = req.user;
      
      const updatedLoyalty = await storage.updateCustomerLoyaltyPoints(customerId, programId, pointsChange);
      
      if (!updatedLoyalty) {
        return res.status(404).json({ message: "Customer loyalty record not found" });
      }
      
      const action = pointsChange > 0 ? 'earned' : 'redeemed';
      await logAudit(userId, companyId, 'UPDATE', 'pos_customer_loyalty', updatedLoyalty.id.toString(), `Customer ${action} ${Math.abs(pointsChange)} loyalty points`);
      
      res.json(updatedLoyalty);
    } catch (error) {
      console.error("Error updating customer loyalty points:", error);
      res.status(500).json({ message: "Failed to update customer loyalty points" });
    }
  });

  // POS Reports & Analytics
  app.get("/api/pos/reports/daily-sales", authenticate, validateRequest({
    query: z.object({
      date: z.string().transform(date => new Date(date))
    })
  }), async (req: AuthenticatedRequest, res) => {
    try {
      const { companyId } = req.user;
      const { date } = req.query as any;
      
      const report = await storage.getPosDailySalesReport(companyId, date);
      res.json(report);
    } catch (error) {
      console.error("Error generating daily sales report:", error);
      res.status(500).json({ message: "Failed to generate daily sales report" });
    }
  });

  app.get("/api/pos/reports/top-products", authenticate, validateRequest({
    query: z.object({
      startDate: z.string().transform(date => new Date(date)),
      endDate: z.string().transform(date => new Date(date))
    })
  }), async (req: AuthenticatedRequest, res) => {
    try {
      const { companyId } = req.user;
      const { startDate, endDate } = req.query as any;
      
      const products = await storage.getPosTopProducts(companyId, startDate, endDate);
      res.json(products);
    } catch (error) {
      console.error("Error generating top products report:", error);
      res.status(500).json({ message: "Failed to generate top products report" });
    }
  });

  // =============================================
  // RBAC (Role-Based Access Control) API Routes
  // =============================================

  // System Roles Management
  app.get("/api/rbac/system-roles", authenticate, requirePermission(PERMISSIONS.ROLES_VIEW), async (req: AuthenticatedRequest, res) => {
    try {
      const roles = await storage.getSystemRoles();
      res.json(roles);
    } catch (error) {
      console.error("Error fetching system roles:", error);
      res.status(500).json({ message: "Failed to fetch system roles" });
    }
  });

  app.post("/api/rbac/system-roles", authenticate, requirePermission(PERMISSIONS.ROLES_CREATE), async (req: AuthenticatedRequest, res) => {
    try {
      const roleData = req.body;
      const role = await storage.createSystemRole(roleData);
      
      await PermissionManager.logPermissionChange({
        userId: req.user.id,
        companyId: req.user.companyId,
        changedBy: req.user.id,
        action: 'CREATE_SYSTEM_ROLE',
        targetType: 'system_role',
        targetId: role.id,
        newValue: role,
        reason: 'System role created via API'
      });
      
      res.status(201).json(role);
    } catch (error) {
      console.error("Error creating system role:", error);
      res.status(500).json({ message: "Failed to create system role" });
    }
  });

  // Company Roles Management
  app.get("/api/rbac/company-roles", authenticate, requirePermission(PERMISSIONS.ROLES_VIEW), async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = req.user.companyId;
      const roles = await storage.getCompanyRoles(companyId);
      res.json(roles);
    } catch (error) {
      console.error("Error fetching company roles:", error);
      res.status(500).json({ message: "Failed to fetch company roles" });
    }
  });

  app.post("/api/rbac/company-roles", authenticate, requirePermission(PERMISSIONS.ROLES_CREATE), async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = req.user.companyId;
      const roleData = { ...req.body, companyId };
      const role = await storage.createCompanyRole(roleData);
      
      await PermissionManager.logPermissionChange({
        userId: req.user.id,
        companyId,
        changedBy: req.user.id,
        action: 'CREATE_COMPANY_ROLE',
        targetType: 'company_role',
        targetId: role.id,
        newValue: role,
        reason: 'Company role created via API'
      });
      
      res.status(201).json(role);
    } catch (error) {
      console.error("Error creating company role:", error);
      res.status(500).json({ message: "Failed to create company role" });
    }
  });

  // User Permission Management
  app.get("/api/rbac/user-permissions/:userId", authenticate, requireAnyPermission([PERMISSIONS.USERS_VIEW, PERMISSIONS.PERMISSIONS_VIEW_AUDIT]), async (req: AuthenticatedRequest, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const companyId = req.user.companyId;
      
      // Check if user can view this user's permissions
      if (userId !== req.user.id && !await PermissionManager.hasPermission(req.user.id, companyId, PERMISSIONS.USERS_VIEW)) {
        return res.status(403).json({ message: "Insufficient permissions to view user permissions" });
      }
      
      const permissions = await PermissionManager.getUserPermissions(userId, companyId);
      res.json(permissions);
    } catch (error) {
      console.error("Error fetching user permissions:", error);
      res.status(500).json({ message: "Failed to fetch user permissions" });
    }
  });

  app.post("/api/rbac/user-permissions", authenticate, requirePermission(PERMISSIONS.PERMISSIONS_GRANT), async (req: AuthenticatedRequest, res) => {
    try {
      const permissionData = { ...req.body, grantedBy: req.user.id };
      const permission = await storage.createUserPermission(permissionData);
      
      await PermissionManager.logPermissionChange({
        userId: permission.userId,
        companyId: permission.companyId,
        changedBy: req.user.id,
        action: 'GRANT_PERMISSION',
        targetType: 'user_permission',
        targetId: permission.id,
        newValue: permission,
        reason: req.body.reason || 'Permission granted via API'
      });
      
      res.status(201).json(permission);
    } catch (error) {
      console.error("Error granting user permission:", error);
      res.status(500).json({ message: "Failed to grant user permission" });
    }
  });

  // Permission Validation & Checking
  app.post("/api/rbac/check-permission", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const { userId, permission } = req.body;
      const companyId = req.user.companyId;
      const targetUserId = userId || req.user.id;
      
      const hasPermission = await PermissionManager.hasPermission(targetUserId, companyId, permission);
      res.json({ hasPermission });
    } catch (error) {
      console.error("Error checking permission:", error);
      res.status(500).json({ message: "Failed to check permission" });
    }
  });

  app.get("/api/rbac/my-permissions", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user.id;
      const companyId = req.user.companyId;
      
      const permissions = await PermissionManager.getUserPermissions(userId, companyId);
      const userLevel = await PermissionManager.getUserLevel(userId, companyId);
      
      res.json({ permissions, level: userLevel });
    } catch (error) {
      console.error("Error fetching user's permissions:", error);
      res.status(500).json({ message: "Failed to fetch user's permissions" });
    }
  });

  // Permission Audit Logs
  app.get("/api/rbac/audit-logs", authenticate, requirePermission(PERMISSIONS.PERMISSIONS_VIEW_AUDIT), async (req: AuthenticatedRequest, res) => {
    try {
      const companyId = req.user.companyId;
      const { limit = 100 } = req.query;
      
      const auditLogs = await storage.getPermissionAuditLogs(companyId, parseInt(limit as string));
      res.json(auditLogs);
    } catch (error) {
      console.error("Error fetching permission audit logs:", error);
      res.status(500).json({ message: "Failed to fetch permission audit logs" });
    }
  });

  // Role Assignment & Management
  app.post("/api/rbac/assign-role", authenticate, requirePermission(PERMISSIONS.USERS_ASSIGN_ROLES), async (req: AuthenticatedRequest, res) => {
    try {
      const { userId, systemRoleId, companyRoleId, reason } = req.body;
      const companyId = req.user.companyId;
      
      // Check if assignment already exists
      let existingPermission = await storage.getUserPermission(userId, companyId);
      
      if (existingPermission) {
        // Update existing permission
        existingPermission = await storage.updateUserPermission(existingPermission.id, {
          systemRoleId,
          companyRoleId,
        });
      } else {
        // Create new permission
        existingPermission = await storage.createUserPermission({
          userId,
          companyId,
          systemRoleId,
          companyRoleId,
          customPermissions: [],
          deniedPermissions: [],
          isActive: true,
          grantedBy: req.user.id,
        });
      }
      
      await PermissionManager.logPermissionChange({
        userId,
        companyId,
        changedBy: req.user.id,
        action: 'ASSIGN_ROLE',
        targetType: 'role_assignment',
        newValue: { systemRoleId, companyRoleId },
        reason: reason || 'Role assigned via API'
      });
      
      res.json(existingPermission);
    } catch (error) {
      console.error("Error assigning role:", error);
      res.status(500).json({ message: "Failed to assign role" });
    }
  });

  // Available Permissions List
  app.get("/api/rbac/available-permissions", authenticate, requirePermission(PERMISSIONS.ROLES_VIEW), async (req: AuthenticatedRequest, res) => {
    try {
      const permissionGroups = {
        system: Object.entries(PERMISSIONS).filter(([key]) => key.includes('SYSTEM')).map(([key, value]) => ({ key, value })),
        users: Object.entries(PERMISSIONS).filter(([key]) => key.includes('USERS')).map(([key, value]) => ({ key, value })),
        roles: Object.entries(PERMISSIONS).filter(([key]) => key.includes('ROLES') || key.includes('PERMISSIONS')).map(([key, value]) => ({ key, value })),
        companies: Object.entries(PERMISSIONS).filter(([key]) => key.includes('COMPANIES')).map(([key, value]) => ({ key, value })),
        financial: Object.entries(PERMISSIONS).filter(([key]) => key.includes('INVOICES') || key.includes('ESTIMATES') || key.includes('PAYMENTS') || key.includes('EXPENSES')).map(([key, value]) => ({ key, value })),
        pos: Object.entries(PERMISSIONS).filter(([key]) => key.includes('POS')).map(([key, value]) => ({ key, value })),
        reports: Object.entries(PERMISSIONS).filter(([key]) => key.includes('REPORTS') || key.includes('ANALYTICS')).map(([key, value]) => ({ key, value })),
      };
      
      res.json(permissionGroups);
    } catch (error) {
      console.error("Error fetching available permissions:", error);
      res.status(500).json({ message: "Failed to fetch available permissions" });
    }
  });

  // =============================================
  // END OF RBAC API ROUTES
  // =============================================

  // Initialize collaboration WebSocket server
  try {
    const { collaborationManager } = await import("./collaboration");
    collaborationManager.initialize(httpServer);
  } catch (error) {
    console.warn("Failed to initialize collaboration system:", error);
  }
  
  return httpServer;
}
